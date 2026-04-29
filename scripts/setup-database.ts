import { neon } from "@neondatabase/serverless"
import { readFileSync } from "fs"
import { join } from "path"

async function setupDatabase() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.error("DATABASE_URL environment variable is not set")
    process.exit(1)
  }

  const sql = neon(databaseUrl)

  console.log("Setting up database...")

  try {
    // Read and execute schema SQL
    console.log("Creating tables...")
    const schemaPath = join(__dirname, "001-create-schema.sql")
    const schemaSql = readFileSync(schemaPath, "utf-8")
    
    // Split by semicolons and execute each statement
    const schemaStatements = schemaSql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0)

    for (const statement of schemaStatements) {
      await sql.query(statement)
    }
    console.log("Tables created successfully!")

    // Read and execute seed SQL
    console.log("Seeding data...")
    const seedPath = join(__dirname, "002-seed-data.sql")
    const seedSql = readFileSync(seedPath, "utf-8")
    
    const seedStatements = seedSql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0)

    for (const statement of seedStatements) {
      await sql.query(statement)
    }
    console.log("Data seeded successfully!")

    console.log("\nDatabase setup complete!")
    console.log("\nDefault login credentials:")
    console.log("  Admin: admin@dentalclinic.com / admin123")
    console.log("  Staff: staff@dentalclinic.com / staff123")
  } catch (error) {
    console.error("Error setting up database:", error)
    process.exit(1)
  }
}

setupDatabase()
