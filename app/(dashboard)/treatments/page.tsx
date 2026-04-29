import { Stethoscope, Clock, DollarSign } from "lucide-react"
import { getAllTreatments } from "@/lib/actions"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { StatusBadge } from "@/components/ui/status-badge"

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(amount)
}

export default async function TreatmentsPage() {
  const treatments = await getAllTreatments()

  const categories = [...new Set(treatments.map((t) => t.category))]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Treatments"
        description="Browse available dental treatments and services."
      />

      {categories.map((category) => {
        const categoryTreatments = treatments.filter((t) => t.category === category)
        return (
          <div key={category} className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">{category}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categoryTreatments.map((treatment) => (
                <Card
                  key={treatment.id}
                  className="border-border/50 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Stethoscope className="h-5 w-5" />
                      </div>
                      <StatusBadge status={treatment.is_active ? "active" : "inactive"} />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1">{treatment.name}</h3>
                    {treatment.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {treatment.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between pt-3 border-t border-border/50">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{treatment.duration_minutes} min</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm font-medium text-primary">
                        <DollarSign className="h-4 w-4" />
                        <span>{formatCurrency(Number(treatment.price))}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
