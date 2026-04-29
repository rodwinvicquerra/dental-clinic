"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { createAppointment } from "@/lib/actions"
import type { Patient, Treatment, Staff } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface AppointmentFormProps {
  patients: Patient[]
  treatments: Treatment[]
  staff: Staff[]
}

export function AppointmentForm({ patients, treatments, staff }: AppointmentFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [selectedTreatment, setSelectedTreatment] = useState<string>("")

  const treatment = treatments.find((t) => t.id.toString() === selectedTreatment)

  function calculateEndTime(startTime: string, durationMinutes: number) {
    const [hours, minutes] = startTime.split(":").map(Number)
    const totalMinutes = hours * 60 + minutes + durationMinutes
    const endHours = Math.floor(totalMinutes / 60)
    const endMinutes = totalMinutes % 60
    return `${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}`
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const startTime = formData.get("start_time") as string
    const duration = treatment?.duration_minutes || 30

    const data = {
      patient_id: parseInt(formData.get("patient_id") as string),
      staff_id: parseInt(formData.get("staff_id") as string),
      treatment_id: parseInt(formData.get("treatment_id") as string),
      appointment_date: formData.get("appointment_date") as string,
      start_time: startTime,
      end_time: calculateEndTime(startTime, duration),
      notes: formData.get("notes") as string || undefined,
    }

    try {
      await createAppointment(data)
      router.push(`/appointments?date=${data.appointment_date}`)
      router.refresh()
    } catch (err) {
      setError("Failed to create appointment. Please try again.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Appointment Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="patient_id">Patient *</Label>
            <Select name="patient_id" required>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Select a patient" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id.toString()}>
                    {patient.first_name} {patient.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="treatment_id">Treatment *</Label>
            <Select
              name="treatment_id"
              required
              value={selectedTreatment}
              onValueChange={setSelectedTreatment}
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Select a treatment" />
              </SelectTrigger>
              <SelectContent>
                {treatments.map((t) => (
                  <SelectItem key={t.id} value={t.id.toString()}>
                    {t.name} ({t.duration_minutes} min)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {treatment && (
              <p className="text-xs text-muted-foreground">
                Duration: {treatment.duration_minutes} minutes | Price: PHP {Number(treatment.price).toLocaleString()}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="staff_id">Doctor/Staff *</Label>
            <Select name="staff_id" required>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Select staff member" />
              </SelectTrigger>
              <SelectContent>
                {staff.map((s) => (
                  <SelectItem key={s.id} value={s.id.toString()}>
                    {s.first_name} {s.last_name} - {s.position}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="appointment_date">Date *</Label>
              <Input
                id="appointment_date"
                name="appointment_date"
                type="date"
                min={new Date().toISOString().split("T")[0]}
                defaultValue={new Date().toISOString().split("T")[0]}
                required
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="start_time">Time *</Label>
              <Input
                id="start_time"
                name="start_time"
                type="time"
                min="08:00"
                max="18:00"
                defaultValue="09:00"
                required
                className="bg-background"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Any additional notes or special instructions..."
              className="bg-background resize-none"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Schedule Appointment
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
