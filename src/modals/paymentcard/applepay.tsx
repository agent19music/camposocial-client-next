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

interface ApplePayModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ApplePayModal({ isOpen, onClose }: ApplePayModalProps) {
  const handleApplePay = () => {
    // Implement Apple Pay logic here
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Apple Pay</DialogTitle>
          <DialogDescription>
            Confirm your payment with Apple Pay.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-4">
            <Icons.apple className="h-6 w-6" />
            <span className="font-semibold">Pay with Apple Pay</span>
          </div>
          <p>
            You will be charged $99.99 for your purchase.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleApplePay} className="bg-black text-white hover:bg-gray-800">
            Pay with Apple Pay
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

