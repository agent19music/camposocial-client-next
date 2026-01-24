"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Icons } from "@/components/icons"

interface PayPalModalProps {
  isOpen: boolean
  onClose: () => void
}

export function PayPalModal({ isOpen, onClose }: PayPalModalProps) {
  const handlePayPal = () => {
    // Implement PayPal logic here
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>PayPal</DialogTitle>
          <DialogDescription>
            Confirm your payment with PayPal.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-4">
            <Icons.paypal className="h-6 w-6" />
            <span className="font-semibold">Pay with PayPal</span>
          </div>
          <p>
            You will be redirected to PayPal to complete your payment of $99.99.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handlePayPal} className="bg-[#0070ba] text-white hover:bg-[#003087]">
            Continue to PayPal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

