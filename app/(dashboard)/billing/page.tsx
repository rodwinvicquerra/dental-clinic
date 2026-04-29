import { Suspense } from "react"
import Link from "next/link"
import { Plus, Receipt } from "lucide-react"
import { getInvoices } from "@/lib/actions"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { InvoicesList } from "./invoices-list"
import { StatusFilter } from "./status-filter"
import { Spinner } from "@/components/ui/spinner"

interface BillingPageProps {
  searchParams: Promise<{ status?: string }>
}

export default async function BillingPage({ searchParams }: BillingPageProps) {
  const params = await searchParams
  const status = params.status || ""

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing"
        description="Manage invoices and track payments."
        action={
          <Button asChild>
            <Link href="/billing/new">
              <Plus className="mr-2 h-4 w-4" />
              New Invoice
            </Link>
          </Button>
        }
      />

      <StatusFilter selectedStatus={status} />

      <Suspense
        fallback={
          <div className="flex items-center justify-center py-12">
            <Spinner className="h-8 w-8" />
          </div>
        }
      >
        <InvoicesListLoader status={status} />
      </Suspense>
    </div>
  )
}

async function InvoicesListLoader({ status }: { status: string }) {
  const invoices = await getInvoices(status || undefined)

  if (invoices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Receipt className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1">No invoices found</h3>
        <p className="text-sm text-muted-foreground max-w-sm mb-4">
          {status
            ? "No invoices match the selected status."
            : "Get started by creating your first invoice."}
        </p>
        <Button asChild>
          <Link href="/billing/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Invoice
          </Link>
        </Button>
      </div>
    )
  }

  return <InvoicesList invoices={invoices} />
}
