import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set")
}

export const sql = neon(process.env.DATABASE_URL)

// Type definitions for database models
export interface User {
  id: number
  email: string
  password_hash: string
  name: string
  role: "admin" | "staff"
  created_at: string
  updated_at: string
}

export interface Session {
  id: number
  user_id: number
  token: string
  expires_at: string
  created_at: string
}

export interface Patient {
  id: number
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  date_of_birth: string | null
  gender: string | null
  address: string | null
  emergency_contact: string | null
  emergency_phone: string | null
  medical_history: string | null
  allergies: string | null
  created_at: string
  updated_at: string
}

export interface Staff {
  id: number
  user_id: number | null
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  specialization: string | null
  position: string
  hire_date: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Treatment {
  id: number
  name: string
  description: string | null
  category: string | null
  duration_minutes: number
  price: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Appointment {
  id: number
  patient_id: number
  staff_id: number | null
  treatment_id: number | null
  appointment_date: string
  start_time: string
  end_time: string
  status: "scheduled" | "confirmed" | "in-progress" | "completed" | "cancelled" | "no-show"
  notes: string | null
  created_at: string
  updated_at: string
  // Joined fields
  patient_name?: string
  staff_name?: string
  treatment_name?: string
}

export interface Invoice {
  id: number
  patient_id: number
  invoice_number: string
  invoice_date: string
  due_date: string | null
  subtotal: number
  tax: number
  discount: number
  total: number
  amount_paid: number
  status: "pending" | "partial" | "paid" | "overdue" | "cancelled"
  notes: string | null
  created_at: string
  updated_at: string
  // Joined fields
  patient_name?: string
}

export interface InvoiceItem {
  id: number
  invoice_id: number
  treatment_id: number | null
  description: string
  quantity: number
  unit_price: number
  total: number
  created_at: string
}

export interface MedicalRecord {
  id: number
  patient_id: number
  staff_id: number | null
  appointment_id: number | null
  record_date: string
  chief_complaint: string | null
  diagnosis: string | null
  treatment_plan: string | null
  clinical_notes: string | null
  created_at: string
  updated_at: string
}

// Dashboard statistics type
export interface DashboardStats {
  totalPatients: number
  todayAppointments: number
  pendingInvoices: number
  monthlyRevenue: number
}
