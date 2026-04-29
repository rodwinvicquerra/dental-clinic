import { PageHeader } from "@/components/ui/page-header"
import { PatientForm } from "../patient-form"

export default function NewPatientPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Add New Patient"
        description="Enter the patient&apos;s information to create a new record."
      />
      <PatientForm />
    </div>
  )
}
