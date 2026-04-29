"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { createPatient, updatePatient } from "@/lib/actions"
import type { Patient } from "@/lib/db"
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

interface PatientFormProps {
  patient?: Patient
}

export function PatientForm({ patient }: PatientFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const isEditing = !!patient

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const data = {
      first_name: formData.get("first_name") as string,
      last_name: formData.get("last_name") as string,
      email: formData.get("email") as string || null,
      phone: formData.get("phone") as string || null,
      date_of_birth: formData.get("date_of_birth") as string || null,
      gender: formData.get("gender") as string || null,
      address: formData.get("address") as string || null,
      emergency_contact: formData.get("emergency_contact") as string || null,
      emergency_phone: formData.get("emergency_phone") as string || null,
      medical_history: formData.get("medical_history") as string || null,
      allergies: formData.get("allergies") as string || null,
    }

    try {
      if (isEditing) {
        await updatePatient(patient.id, data)
        router.push(`/patients/${patient.id}`)
      } else {
        const newPatient = await createPatient(data)
        router.push(`/patients/${newPatient.id}`)
      }
      router.refresh()
    } catch (err) {
      setError("Failed to save patient. Please try again.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="first_name">First Name *</Label>
            <Input
              id="first_name"
              name="first_name"
              defaultValue={patient?.first_name}
              required
              className="bg-background"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last_name">Last Name *</Label>
            <Input
              id="last_name"
              name="last_name"
              defaultValue={patient?.last_name}
              required
              className="bg-background"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={patient?.email || ""}
              className="bg-background"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              defaultValue={patient?.phone || ""}
              className="bg-background"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date_of_birth">Date of Birth</Label>
            <Input
              id="date_of_birth"
              name="date_of_birth"
              type="date"
              defaultValue={patient?.date_of_birth?.split("T")[0] || ""}
              className="bg-background"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Select name="gender" defaultValue={patient?.gender || ""}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              name="address"
              defaultValue={patient?.address || ""}
              className="bg-background resize-none"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Emergency Contact</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="emergency_contact">Contact Name</Label>
            <Input
              id="emergency_contact"
              name="emergency_contact"
              defaultValue={patient?.emergency_contact || ""}
              className="bg-background"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emergency_phone">Contact Phone</Label>
            <Input
              id="emergency_phone"
              name="emergency_phone"
              defaultValue={patient?.emergency_phone || ""}
              className="bg-background"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Medical Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="medical_history">Medical History</Label>
            <Textarea
              id="medical_history"
              name="medical_history"
              defaultValue={patient?.medical_history || ""}
              placeholder="Any relevant medical conditions, medications, or surgeries..."
              className="bg-background resize-none"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="allergies">Allergies</Label>
            <Textarea
              id="allergies"
              name="allergies"
              defaultValue={patient?.allergies || ""}
              placeholder="List any known allergies..."
              className="bg-background resize-none"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? "Update Patient" : "Add Patient"}
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
