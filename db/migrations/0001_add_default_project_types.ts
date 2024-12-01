import { sql } from "drizzle-orm";
import { db } from "..";
import { projectTypes } from "../schema";
import { fileURLToPath } from 'url';

export async function addDefaultProjectTypes() {
  const defaultTypes = [
    {
      name: "Personal",
      description: "Personal projects and tasks",
      imageUrl: "/icons/personal.png"
    },
    {
      name: "Work",
      description: "Work-related projects and tasks",
      imageUrl: "/icons/work.png"
    },
    {
      name: "Study",
      description: "Educational projects and study materials",
      imageUrl: "/icons/study.png"
    },
    {
      name: "Home",
      description: "Home improvement and household tasks",
      imageUrl: "/icons/home.png"
    }
  ];

  try {
    console.log("Adding default project types...");
    await db.insert(projectTypes).values(defaultTypes);
    console.log("Default project types added successfully!");
  } catch (error: any) {
    if (error.code === '23505') { // Unique violation
      console.log("Default project types already exist, skipping...");
    } else {
      throw error;
    }
  }
}

// Run this migration if this file is executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  addDefaultProjectTypes()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("Error adding default project types:", error);
      process.exit(1);
    });
}
