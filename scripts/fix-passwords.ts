import { neon } from "@neondatabase/serverless"
import bcrypt from "bcryptjs"

async function fixPasswords() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.error("DATABASE_URL not set")
    process.exit(1)
  }
  const sql = neon(databaseUrl)

  const adminHash = await bcrypt.hash("admin123", 10)
  const staffHash = await bcrypt.hash("staff123", 10)

  await sql`UPDATE users SET password_hash = ${adminHash} WHERE email = 'admin@dentalclinic.com'`
  await sql`UPDATE users SET password_hash = ${staffHash} WHERE email = 'staff@dentalclinic.com'`

  // Verify
  const rows = await sql`SELECT email, password_hash FROM users WHERE email IN ('admin@dentalclinic.com', 'staff@dentalclinic.com')`
  for (const r of rows as any[]) {
    const pw = r.email.startsWith("admin") ? "admin123" : "staff123"
    const ok = await bcrypt.compare(pw, r.password_hash)
    console.log(`${r.email} -> verify(${pw}) = ${ok}`)
  }
  console.log("Done.")
}

fixPasswords().catch((e) => {
  console.error(e)
  process.exit(1)
})
