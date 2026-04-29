import { Suspense } from "react"
import Link from "next/link"
import { Plus, Calendar } from "lucide-react"
import { getAppointments } from "@/lib/actions"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { AppointmentsList } from "./appointments-list"
import { DateFilter } from "./date-filter"
import { Spinner } from "@/components/ui/spinner"

interface AppointmentsPageProps {
  searchParams: Promise<{ date?: string }>
}

export default async function AppointmentsPage({ searchParams }: AppointmentsPageProps) {
  const params = await searchParams
  const selectedDate = params.date || new Date().toISOString().split("T")[0]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Appointments"
        description="Manage patient appointments and scheduling."
        action={
          <Button asChild>
            <Link href="/appointments/new">
              <Plus className="mr-2 h-4 w-4" />
              New Appointment
            </Link>
          </Button>
        }
      />

      <DateFilter selectedDate={selectedDate} />

      <Suspense
        fallback={
          <div className="flex items-center justify-center py-12">
            <Spinner className="h-8 w-8" />
          </div>
        }
      >
        <AppointmentsListLoader date={selectedDate} />
      </Suspense>
    </div>
  )
}

async function AppointmentsListLoader({ date }: { date: string }) {
  const appointments = await getAppointments(date)

  if (appointments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Calendar className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1">No appointments</h3>
        <p className="text-sm text-muted-foreground max-w-sm mb-4">
          No appointments scheduled for this date.
        </p>
        <Button asChild>
          <Link href="/appointments/new">
            <Plus className="mr-2 h-4 w-4" />
            Schedule Appointment
          </Link>
        </Button>
      </div>
    )
  }

  return <AppointmentsList appointments={appointments} />
}
