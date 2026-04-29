import { cn } from "@/lib/utils"

type StatusType = 
  | "scheduled" | "confirmed" | "in-progress" | "completed" | "cancelled" | "no-show"
  | "pending" | "partial" | "paid" | "overdue"
  | "active" | "inactive"

interface StatusBadgeProps {
  status: StatusType
  className?: string
}

const statusStyles: Record<StatusType, string> = {
  // Appointment statuses
  scheduled: "bg-sky-100 text-sky-700 border-sky-200",
  confirmed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  "in-progress": "bg-amber-100 text-amber-700 border-amber-200",
  completed: "bg-green-100 text-green-700 border-green-200",
  cancelled: "bg-slate-100 text-slate-600 border-slate-200",
  "no-show": "bg-red-100 text-red-700 border-red-200",
  // Invoice statuses
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  partial: "bg-sky-100 text-sky-700 border-sky-200",
  paid: "bg-emerald-100 text-emerald-700 border-emerald-200",
  overdue: "bg-red-100 text-red-700 border-red-200",
  // General statuses
  active: "bg-emerald-100 text-emerald-700 border-emerald-200",
  inactive: "bg-slate-100 text-slate-600 border-slate-200",
}

const statusLabels: Record<StatusType, string> = {
  scheduled: "Scheduled",
  confirmed: "Confirmed",
  "in-progress": "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
  "no-show": "No Show",
  pending: "Pending",
  partial: "Partial",
  paid: "Paid",
  overdue: "Overdue",
  active: "Active",
  inactive: "Inactive",
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        statusStyles[status] || "bg-slate-100 text-slate-600 border-slate-200",
        className
      )}
    >
      {statusLabels[status] || status}
    </span>
  )
}
