"use client"

import { useRouter } from "next/navigation"
import { Mail, Phone, Calendar } from "lucide-react"
import type { Patient } from "@/lib/db"
import { Card, CardContent } from "@/components/ui/card"

interface PatientsListProps {
  patients: Patient[]
}

function formatDate(date: string | null) {
  if (!date) return "-"
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function getInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

function getAge(dateOfBirth: string | null) {
  if (!dateOfBirth) return null
  const today = new Date()
  const birth = new Date(dateOfBirth)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

export function PatientsList({ patients }: PatientsListProps) {
  const router = useRouter()

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {patients.map((patient) => {
        const age = getAge(patient.date_of_birth)
        return (
          <Card
            key={patient.id}
            className="group cursor-pointer border-border/50 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:border-primary/30"
            onClick={() => router.push(`/patients/${patient.id}`)}
          >
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-lg">
                  {getInitials(patient.first_name, patient.last_name)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                    {patient.first_name} {patient.last_name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {patient.gender || "Not specified"}
                    {age !== null && ` • ${age} years old`}
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {patient.email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{patient.email}</span>
                  </div>
                )}
                {patient.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4 flex-shrink-0" />
                    <span>{patient.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 flex-shrink-0" />
                  <span>Added {formatDate(patient.created_at)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
