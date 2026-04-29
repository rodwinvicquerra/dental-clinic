"use client"

import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface DateFilterProps {
  selectedDate: string
}

function formatDisplayDate(dateStr: string) {
  const date = new Date(dateStr + "T00:00:00")
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function addDays(dateStr: string, days: number) {
  const date = new Date(dateStr + "T00:00:00")
  date.setDate(date.getDate() + days)
  return date.toISOString().split("T")[0]
}

export function DateFilter({ selectedDate }: DateFilterProps) {
  const router = useRouter()

  function handleDateChange(newDate: string) {
    router.push(`/appointments?date=${newDate}`)
  }

  function goToToday() {
    handleDateChange(new Date().toISOString().split("T")[0])
  }

  const isToday = selectedDate === new Date().toISOString().split("T")[0]

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleDateChange(addDays(selectedDate, -1))}
          className="h-9 w-9"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="relative">
          <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
            className="pl-10 w-[180px] bg-card"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleDateChange(addDays(selectedDate, 1))}
          className="h-9 w-9"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <p className="text-sm text-muted-foreground">
          {formatDisplayDate(selectedDate)}
        </p>
        {!isToday && (
          <Button variant="secondary" size="sm" onClick={goToToday}>
            Today
          </Button>
        )}
      </div>
    </div>
  )
}
