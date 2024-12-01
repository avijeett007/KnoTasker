import { addDefaultProjectTypes } from "../db/migrations/0001_add_default_project_types";

async function runMigrations() {
  try {
    await addDefaultProjectTypes();
    console.log("All migrations completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

runMigrations();
