import { getPatients, getTreatments, getActiveStaff } from "@/lib/actions"
import { PageHeader } from "@/components/ui/page-header"
import { AppointmentForm } from "./appointment-form"

export default async function NewAppointmentPage() {
  const [patients, treatments, staff] = await Promise.all([
    getPatients(),
    getTreatments(),
    getActiveStaff(),
  ])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Schedule Appointment"
        description="Book a new appointment for a patient."
      />
      <AppointmentForm patients={patients} treatments={treatments} staff={staff} />
    </div>
  )
}
