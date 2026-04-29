"use server"

import { revalidatePath } from "next/cache"
import { sql, type Patient, type Appointment, type Treatment, type Invoice, type Staff } from "./db"

// Dashboard Statistics
export async function getDashboardStats() {
  const [patients, todayAppointments, pendingInvoices, monthlyRevenue] = await Promise.all([
    sql`SELECT COUNT(*) as count FROM patients`,
    sql`SELECT COUNT(*) as count FROM appointments WHERE appointment_date = CURRENT_DATE`,
    sql`SELECT COUNT(*) as count FROM invoices WHERE status IN ('pending', 'partial', 'overdue')`,
    sql`SELECT COALESCE(SUM(amount_paid), 0) as total FROM invoices WHERE invoice_date >= DATE_TRUNC('month', CURRENT_DATE)`,
  ])

  return {
    totalPatients: Number(patients[0].count),
    todayAppointments: Number(todayAppointments[0].count),
    pendingInvoices: Number(pendingInvoices[0].count),
    monthlyRevenue: Number(monthlyRevenue[0].total),
  }
}

export async function getRecentAppointments(limit = 5) {
  const appointments = await sql`
    SELECT 
      a.*,
      p.first_name || ' ' || p.last_name as patient_name,
      s.first_name || ' ' || s.last_name as staff_name,
      t.name as treatment_name
    FROM appointments a
    LEFT JOIN patients p ON a.patient_id = p.id
    LEFT JOIN staff s ON a.staff_id = s.id
    LEFT JOIN treatments t ON a.treatment_id = t.id
    WHERE a.appointment_date >= CURRENT_DATE
    ORDER BY a.appointment_date, a.start_time
    LIMIT ${limit}
  `
  return appointments as Appointment[]
}

export async function getTodayAppointments() {
  const appointments = await sql`
    SELECT 
      a.*,
      p.first_name || ' ' || p.last_name as patient_name,
      s.first_name || ' ' || s.last_name as staff_name,
      t.name as treatment_name
    FROM appointments a
    LEFT JOIN patients p ON a.patient_id = p.id
    LEFT JOIN staff s ON a.staff_id = s.id
    LEFT JOIN treatments t ON a.treatment_id = t.id
    WHERE a.appointment_date = CURRENT_DATE
    ORDER BY a.start_time
  `
  return appointments as Appointment[]
}

// Patients
export async function getPatients(search?: string) {
  if (search) {
    const patients = await sql`
      SELECT * FROM patients 
      WHERE 
        first_name ILIKE ${'%' + search + '%'} OR 
        last_name ILIKE ${'%' + search + '%'} OR
        email ILIKE ${'%' + search + '%'} OR
        phone ILIKE ${'%' + search + '%'}
      ORDER BY last_name, first_name
    `
    return patients as Patient[]
  }
  const patients = await sql`SELECT * FROM patients ORDER BY last_name, first_name`
  return patients as Patient[]
}

export async function getPatient(id: number) {
  const patients = await sql`SELECT * FROM patients WHERE id = ${id}`
  return patients[0] as Patient | undefined
}

export async function createPatient(data: Omit<Patient, "id" | "created_at" | "updated_at">) {
  const result = await sql`
    INSERT INTO patients (first_name, last_name, email, phone, date_of_birth, gender, address, emergency_contact, emergency_phone, medical_history, allergies)
    VALUES (${data.first_name}, ${data.last_name}, ${data.email}, ${data.phone}, ${data.date_of_birth}, ${data.gender}, ${data.address}, ${data.emergency_contact}, ${data.emergency_phone}, ${data.medical_history}, ${data.allergies})
    RETURNING *
  `
  revalidatePath("/patients")
  return result[0] as Patient
}

export async function updatePatient(id: number, data: Partial<Patient>) {
  const result = await sql`
    UPDATE patients SET
      first_name = COALESCE(${data.first_name}, first_name),
      last_name = COALESCE(${data.last_name}, last_name),
      email = COALESCE(${data.email}, email),
      phone = COALESCE(${data.phone}, phone),
      date_of_birth = COALESCE(${data.date_of_birth}, date_of_birth),
      gender = COALESCE(${data.gender}, gender),
      address = COALESCE(${data.address}, address),
      emergency_contact = COALESCE(${data.emergency_contact}, emergency_contact),
      emergency_phone = COALESCE(${data.emergency_phone}, emergency_phone),
      medical_history = COALESCE(${data.medical_history}, medical_history),
      allergies = COALESCE(${data.allergies}, allergies),
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `
  revalidatePath("/patients")
  revalidatePath(`/patients/${id}`)
  return result[0] as Patient
}

export async function deletePatient(id: number) {
  await sql`DELETE FROM patients WHERE id = ${id}`
  revalidatePath("/patients")
}

// Appointments
export async function getAppointments(date?: string) {
  if (date) {
    const appointments = await sql`
      SELECT 
        a.*,
        p.first_name || ' ' || p.last_name as patient_name,
        s.first_name || ' ' || s.last_name as staff_name,
        t.name as treatment_name
      FROM appointments a
      LEFT JOIN patients p ON a.patient_id = p.id
      LEFT JOIN staff s ON a.staff_id = s.id
      LEFT JOIN treatments t ON a.treatment_id = t.id
      WHERE a.appointment_date = ${date}
      ORDER BY a.start_time
    `
    return appointments as Appointment[]
  }
  const appointments = await sql`
    SELECT 
      a.*,
      p.first_name || ' ' || p.last_name as patient_name,
      s.first_name || ' ' || s.last_name as staff_name,
      t.name as treatment_name
    FROM appointments a
    LEFT JOIN patients p ON a.patient_id = p.id
    LEFT JOIN staff s ON a.staff_id = s.id
    LEFT JOIN treatments t ON a.treatment_id = t.id
    ORDER BY a.appointment_date DESC, a.start_time
  `
  return appointments as Appointment[]
}

export async function getAppointment(id: number) {
  const appointments = await sql`
    SELECT 
      a.*,
      p.first_name || ' ' || p.last_name as patient_name,
      s.first_name || ' ' || s.last_name as staff_name,
      t.name as treatment_name
    FROM appointments a
    LEFT JOIN patients p ON a.patient_id = p.id
    LEFT JOIN staff s ON a.staff_id = s.id
    LEFT JOIN treatments t ON a.treatment_id = t.id
    WHERE a.id = ${id}
  `
  return appointments[0] as Appointment | undefined
}

export async function createAppointment(data: {
  patient_id: number
  staff_id: number
  treatment_id: number
  appointment_date: string
  start_time: string
  end_time: string
  notes?: string
}) {
  const result = await sql`
    INSERT INTO appointments (patient_id, staff_id, treatment_id, appointment_date, start_time, end_time, notes, status)
    VALUES (${data.patient_id}, ${data.staff_id}, ${data.treatment_id}, ${data.appointment_date}, ${data.start_time}, ${data.end_time}, ${data.notes || null}, 'scheduled')
    RETURNING *
  `
  revalidatePath("/appointments")
  revalidatePath("/dashboard")
  return result[0] as Appointment
}

export async function updateAppointmentStatus(id: number, status: Appointment["status"]) {
  const result = await sql`
    UPDATE appointments SET status = ${status}, updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `
  revalidatePath("/appointments")
  revalidatePath("/dashboard")
  return result[0] as Appointment
}

export async function deleteAppointment(id: number) {
  await sql`DELETE FROM appointments WHERE id = ${id}`
  revalidatePath("/appointments")
  revalidatePath("/dashboard")
}

// Treatments
export async function getTreatments() {
  const treatments = await sql`SELECT * FROM treatments WHERE is_active = true ORDER BY category, name`
  return treatments as Treatment[]
}

export async function getAllTreatments() {
  const treatments = await sql`SELECT * FROM treatments ORDER BY category, name`
  return treatments as Treatment[]
}

export async function getTreatment(id: number) {
  const treatments = await sql`SELECT * FROM treatments WHERE id = ${id}`
  return treatments[0] as Treatment | undefined
}

export async function createTreatment(data: Omit<Treatment, "id" | "created_at" | "updated_at">) {
  const result = await sql`
    INSERT INTO treatments (name, description, category, duration_minutes, price, is_active)
    VALUES (${data.name}, ${data.description}, ${data.category}, ${data.duration_minutes}, ${data.price}, ${data.is_active})
    RETURNING *
  `
  revalidatePath("/treatments")
  return result[0] as Treatment
}

export async function updateTreatment(id: number, data: Partial<Treatment>) {
  const result = await sql`
    UPDATE treatments SET
      name = COALESCE(${data.name}, name),
      description = COALESCE(${data.description}, description),
      category = COALESCE(${data.category}, category),
      duration_minutes = COALESCE(${data.duration_minutes}, duration_minutes),
      price = COALESCE(${data.price}, price),
      is_active = COALESCE(${data.is_active}, is_active),
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `
  revalidatePath("/treatments")
  return result[0] as Treatment
}

// Invoices
export async function getInvoices(status?: string) {
  if (status) {
    const invoices = await sql`
      SELECT 
        i.*,
        p.first_name || ' ' || p.last_name as patient_name
      FROM invoices i
      LEFT JOIN patients p ON i.patient_id = p.id
      WHERE i.status = ${status}
      ORDER BY i.invoice_date DESC
    `
    return invoices as Invoice[]
  }
  const invoices = await sql`
    SELECT 
      i.*,
      p.first_name || ' ' || p.last_name as patient_name
    FROM invoices i
    LEFT JOIN patients p ON i.patient_id = p.id
    ORDER BY i.invoice_date DESC
  `
  return invoices as Invoice[]
}

export async function getInvoice(id: number) {
  const invoices = await sql`
    SELECT 
      i.*,
      p.first_name || ' ' || p.last_name as patient_name
    FROM invoices i
    LEFT JOIN patients p ON i.patient_id = p.id
    WHERE i.id = ${id}
  `
  return invoices[0] as Invoice | undefined
}

export async function createInvoice(data: {
  patient_id: number
  subtotal: number
  tax: number
  discount: number
  total: number
  notes?: string
}) {
  const invoiceNumber = `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`
  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + 14)

  const result = await sql`
    INSERT INTO invoices (patient_id, invoice_number, invoice_date, due_date, subtotal, tax, discount, total, notes)
    VALUES (${data.patient_id}, ${invoiceNumber}, CURRENT_DATE, ${dueDate.toISOString().split('T')[0]}, ${data.subtotal}, ${data.tax}, ${data.discount}, ${data.total}, ${data.notes || null})
    RETURNING *
  `
  revalidatePath("/billing")
  return result[0] as Invoice
}

export async function updateInvoicePayment(id: number, amountPaid: number) {
  const invoice = await getInvoice(id)
  if (!invoice) throw new Error("Invoice not found")

  const newAmountPaid = Number(invoice.amount_paid) + amountPaid
  const newStatus = newAmountPaid >= Number(invoice.total) ? "paid" : "partial"

  const result = await sql`
    UPDATE invoices SET amount_paid = ${newAmountPaid}, status = ${newStatus}, updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `
  revalidatePath("/billing")
  return result[0] as Invoice
}

// Staff
export async function getStaff() {
  const staff = await sql`SELECT * FROM staff ORDER BY last_name, first_name`
  return staff as Staff[]
}

export async function getActiveStaff() {
  const staff = await sql`SELECT * FROM staff WHERE is_active = true ORDER BY last_name, first_name`
  return staff as Staff[]
}

export async function getStaffMember(id: number) {
  const staff = await sql`SELECT * FROM staff WHERE id = ${id}`
  return staff[0] as Staff | undefined
}

export async function createStaffMember(data: Omit<Staff, "id" | "created_at" | "updated_at">) {
  const result = await sql`
    INSERT INTO staff (user_id, first_name, last_name, email, phone, specialization, position, hire_date, is_active)
    VALUES (${data.user_id}, ${data.first_name}, ${data.last_name}, ${data.email}, ${data.phone}, ${data.specialization}, ${data.position}, ${data.hire_date}, ${data.is_active})
    RETURNING *
  `
  revalidatePath("/staff")
  return result[0] as Staff
}

export async function updateStaffMember(id: number, data: Partial<Staff>) {
  const result = await sql`
    UPDATE staff SET
      first_name = COALESCE(${data.first_name}, first_name),
      last_name = COALESCE(${data.last_name}, last_name),
      email = COALESCE(${data.email}, email),
      phone = COALESCE(${data.phone}, phone),
      specialization = COALESCE(${data.specialization}, specialization),
      position = COALESCE(${data.position}, position),
      is_active = COALESCE(${data.is_active}, is_active),
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `
  revalidatePath("/staff")
  return result[0] as Staff
}

// Patient Appointments
export async function getPatientAppointments(patientId: number) {
  const appointments = await sql`
    SELECT 
      a.*,
      s.first_name || ' ' || s.last_name as staff_name,
      t.name as treatment_name
    FROM appointments a
    LEFT JOIN staff s ON a.staff_id = s.id
    LEFT JOIN treatments t ON a.treatment_id = t.id
    WHERE a.patient_id = ${patientId}
    ORDER BY a.appointment_date DESC, a.start_time DESC
  `
  return appointments as Appointment[]
}

// Patient Invoices
export async function getPatientInvoices(patientId: number) {
  const invoices = await sql`
    SELECT * FROM invoices WHERE patient_id = ${patientId}
    ORDER BY invoice_date DESC
  `
  return invoices as Invoice[]
}
