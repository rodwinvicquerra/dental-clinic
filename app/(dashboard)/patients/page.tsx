import { Suspense } from "react"
import Link from "next/link"
import { Plus, Search, Users } from "lucide-react"
import { getPatients } from "@/lib/actions"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PatientsList } from "./patients-list"
import { Spinner } from "@/components/ui/spinner"

interface PatientsPageProps {
  searchParams: Promise<{ search?: string }>
}

export default async function PatientsPage({ searchParams }: PatientsPageProps) {
  const params = await searchParams
  const search = params.search || ""

  return (
    <div className="space-y-6">
      <PageHeader
        title="Patients"
        description="Manage your patient records and information."
        action={
          <Button asChild>
            <Link href="/patients/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Patient
            </Link>
          </Button>
        }
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <form className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            name="search"
            placeholder="Search patients..."
            defaultValue={search}
            className="pl-10 bg-card"
          />
        </form>
      </div>

      <Suspense
        fallback={
          <div className="flex items-center justify-center py-12">
            <Spinner className="h-8 w-8" />
          </div>
        }
      >
        <PatientsListLoader search={search} />
      </Suspense>
    </div>
  )
}

async function PatientsListLoader({ search }: { search: string }) {
  const patients = await getPatients(search)

  if (patients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <Users className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-1">No patients found</h3>
        <p className="text-sm text-muted-foreground max-w-sm mb-4">
          {search
            ? "No patients match your search criteria."
            : "Get started by adding your first patient."}
        </p>
        {!search && (
          <Button asChild>
            <Link href="/patients/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Patient
            </Link>
          </Button>
        )}
      </div>
    )
  }

  return <PatientsList patients={patients} />
}
