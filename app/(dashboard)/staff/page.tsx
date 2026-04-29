import { Mail, Phone, Calendar, Briefcase } from "lucide-react"
import { getStaff } from "@/lib/actions"
import { requireAdmin } from "@/lib/auth"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { StatusBadge } from "@/components/ui/status-badge"

function formatDate(date: string | null) {
  if (!date) return "-"
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function getInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

export default async function StaffPage() {
  await requireAdmin()
  const staff = await getStaff()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff Directory"
        description="Manage clinic staff members and their information."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {staff.map((member) => (
          <Card
            key={member.id}
            className="border-border/50 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
          >
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xl">
                  {getInitials(member.first_name, member.last_name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-foreground truncate">
                      {member.first_name} {member.last_name}
                    </h3>
                    <StatusBadge status={member.is_active ? "active" : "inactive"} />
                  </div>
                  <p className="text-sm text-primary font-medium">{member.position}</p>
                  {member.specialization && (
                    <p className="text-sm text-muted-foreground">{member.specialization}</p>
                  )}
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {member.email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{member.email}</span>
                  </div>
                )}
                {member.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4 flex-shrink-0" />
                    <span>{member.phone}</span>
                  </div>
                )}
                {member.hire_date && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 flex-shrink-0" />
                    <span>Hired {formatDate(member.hire_date)}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
