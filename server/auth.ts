import express, { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import { db } from "../db";
import { users } from "@db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { randomBytes } from "crypto";
import rateLimit from 'express-rate-limit';

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export function setupAuth(app: Express) {
  // Session setup
  const sessionSecret = process.env.SESSION_SECRET || randomBytes(32).toString('hex');
  
  app.use(
    session({
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  // User schema validation
  const userSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
  });

  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      async (email, password, done) => {
        try {
          if (!validateEmail(email)) {
            return done(null, false, { message: "Invalid email format" });
          }

          const [user] = await db
            .select()
            .from(users)
            .where(eq(users.username, email.toLowerCase()));

          if (!user) {
            return done(null, false, { message: "Invalid credentials" });
          }

          const isValid = await bcrypt.compare(password, user.password);
          if (!isValid) {
            return done(null, false, { message: "Invalid credentials" });
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Rate limiters
  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window per IP
    message: 'Too many login attempts, please try again after 15 minutes'
  });

  const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 registration attempts per hour per IP
    message: 'Too many registration attempts, please try again after an hour'
  });

  // Auth routes
  app.post("/api/register", registerLimiter, async (req: Request, res: Response) => {
    try {
      const result = userSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          error: "Validation error", 
          details: result.error.issues 
        });
      }

      const { email, password } = result.data;

      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.username, email.toLowerCase()));

      if (existingUser) {
        return res.status(400).json({ error: "Email already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const [user] = await db
        .insert(users)
        .values({
          username: email.toLowerCase(),
          password: hashedPassword,
        })
        .returning();

      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ error: "Error logging in" });
        }
        return res.json({
          user: {
            id: user.id,
            email: user.username,
          }
        });
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Error creating user" });
    }
  });

  app.post("/api/login", loginLimiter, (req: Request, res: Response, next) => {
    try {
      const result = userSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          error: "Validation error", 
          details: result.error.issues 
        });
      }

      passport.authenticate("local", (err: any, user: any, info: any) => {
        if (err) {
          return res.status(500).json({ error: "Internal server error" });
        }
        if (!user) {
          return res.status(401).json({ error: info.message || "Invalid credentials" });
        }
        req.login(user, (err) => {
          if (err) {
            return res.status(500).json({ error: "Error logging in" });
          }
          return res.json({
            user: {
              id: user.id,
              email: user.username,
            }
          });
        });
      })(req, res, next);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Error during login" });
    }
  });

  app.post("/api/logout", (req: Request, res: Response) => {
    req.logout(() => {
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/user", (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    res.json({
      user: {
        id: req.user.id,
        email: req.user.username,
      }
    });
  });

  app.get("/api/check-session", (req: Request, res: Response) => {
    if (req.isAuthenticated()) {
      res.json({ valid: true });
    } else {
      res.json({ valid: false });
    }
  });
}
