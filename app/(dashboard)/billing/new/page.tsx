import { getPatients, getTreatments } from "@/lib/actions"
import { PageHeader } from "@/components/ui/page-header"
import { InvoiceForm } from "./invoice-form"

export default async function NewInvoicePage() {
  const [patients, treatments] = await Promise.all([
    getPatients(),
    getTreatments(),
  ])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Invoice"
        description="Generate a new invoice for a patient."
      />
      <InvoiceForm patients={patients} treatments={treatments} />
    </div>
  )
}
