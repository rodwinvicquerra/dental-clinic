"use client"

import { useState } from "react"
import { User, Calendar, DollarSign, MoreVertical, CreditCard } from "lucide-react"
import type { Invoice } from "@/lib/db"
import { updateInvoicePayment } from "@/lib/actions"
import { Card, CardContent } from "@/components/ui/card"
import { StatusBadge } from "@/components/ui/status-badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface InvoicesListProps {
  invoices: Invoice[]
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(amount)
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function InvoicesList({ invoices }: InvoicesListProps) {
  return (
    <div className="space-y-3">
      {invoices.map((invoice) => (
        <InvoiceCard key={invoice.id} invoice={invoice} />
      ))}
    </div>
  )
}

function InvoiceCard({ invoice }: { invoice: Invoice }) {
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const balance = Number(invoice.total) - Number(invoice.amount_paid)

  async function handlePayment() {
    const amount = parseFloat(paymentAmount)
    if (isNaN(amount) || amount <= 0) return

    setIsProcessing(true)
    try {
      await updateInvoicePayment(invoice.id, amount)
      setIsPaymentDialogOpen(false)
      setPaymentAmount("")
    } catch (error) {
      console.error("Failed to process payment:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <>
      <Card className="border-border/50 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <DollarSign className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-foreground">
                    {invoice.invoice_number}
                  </span>
                  <StatusBadge status={invoice.status} />
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>{invoice.patient_name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Issued: {formatDate(invoice.invoice_date)}
                    {invoice.due_date && ` | Due: ${formatDate(invoice.due_date)}`}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="text-right">
                <p className="text-lg font-bold text-foreground">
                  {formatCurrency(Number(invoice.total))}
                </p>
                {invoice.status !== "paid" && (
                  <p className="text-sm text-muted-foreground">
                    Balance: {formatCurrency(balance)}
                  </p>
                )}
              </div>

              {invoice.status !== "paid" && invoice.status !== "cancelled" && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsPaymentDialogOpen(true)}>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Record Payment
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Enter the payment amount for invoice {invoice.invoice_number}.
              Current balance: {formatCurrency(balance)}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="number"
              placeholder="Enter amount"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              min="0"
              max={balance}
              step="0.01"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPaymentDialogOpen(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button onClick={handlePayment} disabled={isProcessing || !paymentAmount}>
              {isProcessing ? "Processing..." : "Record Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
