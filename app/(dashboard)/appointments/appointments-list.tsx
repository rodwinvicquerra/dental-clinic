"use client"

import { useState } from "react"
import { Clock, User, Stethoscope, MoreVertical, Check, X, Play } from "lucide-react"
import type { Appointment } from "@/lib/db"
import { updateAppointmentStatus } from "@/lib/actions"
import { Card, CardContent } from "@/components/ui/card"
import { StatusBadge } from "@/components/ui/status-badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface AppointmentsListProps {
  appointments: Appointment[]
}

function formatTime(time: string) {
  const [hours, minutes] = time.split(":")
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? "PM" : "AM"
  const hour12 = hour % 12 || 12
  return `${hour12}:${minutes} ${ampm}`
}

export function AppointmentsList({ appointments }: AppointmentsListProps) {
  return (
    <div className="space-y-3">
      {appointments.map((appointment) => (
        <AppointmentCard key={appointment.id} appointment={appointment} />
      ))}
    </div>
  )
}

function AppointmentCard({ appointment }: { appointment: Appointment }) {
  const [isUpdating, setIsUpdating] = useState(false)

  async function handleStatusChange(status: Appointment["status"]) {
    setIsUpdating(true)
    try {
      await updateAppointmentStatus(appointment.id, status)
    } catch (error) {
      console.error("Failed to update status:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Card className="border-border/50 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex flex-col items-center justify-center rounded-lg bg-primary/10 px-3 py-2 text-primary">
              <span className="text-lg font-bold">{formatTime(appointment.start_time)}</span>
              <span className="text-xs text-primary/70">
                to {formatTime(appointment.end_time)}
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium text-foreground">
                  {appointment.patient_name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {appointment.treatment_name || "General Checkup"}
                </span>
              </div>
              {appointment.staff_name && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Dr. {appointment.staff_name}
                  </span>
                </div>
              )}
              {appointment.notes && (
                <p className="text-sm text-muted-foreground italic">
                  {appointment.notes}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <StatusBadge status={appointment.status} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" disabled={isUpdating}>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => handleStatusChange("confirmed")}
                  disabled={appointment.status === "confirmed"}
                >
                  <Check className="mr-2 h-4 w-4 text-emerald-500" />
                  Confirm
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleStatusChange("in-progress")}
                  disabled={appointment.status === "in-progress"}
                >
                  <Play className="mr-2 h-4 w-4 text-amber-500" />
                  Start
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleStatusChange("completed")}
                  disabled={appointment.status === "completed"}
                >
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  Complete
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleStatusChange("cancelled")}
                  disabled={appointment.status === "cancelled"}
                  className="text-destructive focus:text-destructive"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleStatusChange("no-show")}
                  disabled={appointment.status === "no-show"}
                  className="text-destructive focus:text-destructive"
                >
                  <X className="mr-2 h-4 w-4" />
                  No Show
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
