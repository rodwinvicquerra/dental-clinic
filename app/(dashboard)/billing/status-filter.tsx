"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface StatusFilterProps {
  selectedStatus: string
}

const statuses = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "partial", label: "Partial" },
  { value: "paid", label: "Paid" },
  { value: "overdue", label: "Overdue" },
]

export function StatusFilter({ selectedStatus }: StatusFilterProps) {
  const router = useRouter()

  function handleStatusChange(status: string) {
    const url = status ? `/billing?status=${status}` : "/billing"
    router.push(url)
  }

  return (
    <div className="flex flex-wrap gap-2">
      {statuses.map((status) => (
        <Button
          key={status.value}
          variant={selectedStatus === status.value ? "default" : "outline"}
          size="sm"
          onClick={() => handleStatusChange(status.value)}
          className={cn(
            "transition-all duration-200",
            selectedStatus === status.value && "shadow-sm"
          )}
        >
          {status.label}
        </Button>
      ))}
    </div>
  )
}
