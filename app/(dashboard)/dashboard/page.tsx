import { Users, Calendar, Receipt, DollarSign, Clock, ArrowRight } from "lucide-react"
import Link from "next/link"
import { getDashboardStats, getTodayAppointments, getInvoices } from "@/lib/actions"
import { PageHeader } from "@/components/ui/page-header"
import { StatCard } from "@/components/ui/stat-card"
import { StatusBadge } from "@/components/ui/status-badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(amount)
}

function formatTime(time: string) {
  const [hours, minutes] = time.split(":")
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? "PM" : "AM"
  const hour12 = hour % 12 || 12
  return `${hour12}:${minutes} ${ampm}`
}

export default async function DashboardPage() {
  const [stats, todayAppointments, recentInvoices] = await Promise.all([
    getDashboardStats(),
    getTodayAppointments(),
    getInvoices(),
  ])

  const pendingInvoices = recentInvoices
    .filter((inv) => inv.status === "pending" || inv.status === "overdue")
    .slice(0, 5)

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Welcome back! Here&apos;s an overview of your clinic."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Patients"
          value={stats.totalPatients}
          icon={Users}
          description="Registered patients"
        />
        <StatCard
          title="Today&apos;s Appointments"
          value={stats.todayAppointments}
          icon={Calendar}
          description="Scheduled for today"
        />
        <StatCard
          title="Pending Invoices"
          value={stats.pendingInvoices}
          icon={Receipt}
          description="Awaiting payment"
        />
        <StatCard
          title="Monthly Revenue"
          value={formatCurrency(stats.monthlyRevenue)}
          icon={DollarSign}
          description="This month"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg font-semibold">
              Today&apos;s Appointments
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/appointments" className="text-primary hover:text-primary/80">
                View all
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {todayAppointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Calendar className="h-10 w-10 text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">
                  No appointments scheduled for today
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayAppointments.slice(0, 5).map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center gap-4 rounded-lg border border-border/50 bg-card p-4 transition-colors hover:bg-accent/30"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {appointment.patient_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {appointment.treatment_name || "General"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">
                        {formatTime(appointment.start_time)}
                      </p>
                      <StatusBadge status={appointment.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg font-semibold">
              Pending Invoices
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/billing" className="text-primary hover:text-primary/80">
                View all
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {pendingInvoices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Receipt className="h-10 w-10 text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">
                  No pending invoices
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingInvoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center gap-4 rounded-lg border border-border/50 bg-card p-4 transition-colors hover:bg-accent/30"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                      <Receipt className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {invoice.patient_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {invoice.invoice_number}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">
                        {formatCurrency(Number(invoice.total) - Number(invoice.amount_paid))}
                      </p>
                      <StatusBadge status={invoice.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
