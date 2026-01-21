'use client'

import React, { useState, useContext, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Loader2,
  BadgeCheck,
  CheckCircle,
  Clock,
  Smartphone,
  CreditCard,
  ExternalLink,
  Shield
} from "lucide-react"
import { AuthContext } from "@/context/authcontext"
import toast from "react-hot-toast"
import Image from 'next/image'

interface BadgeItem {
  id: number
  name: string
  description: string
  image_url: string
  price_ksh: number
  is_animated: boolean
}

interface BadgePurchaseModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

type PaymentMethod = 'mpesa' | 'card'
type PaymentStep = 'selection' | 'payment' | 'processing' | 'complete' | 'redirect'

export default function BadgePurchaseModal({ isOpen, onClose, onSuccess }: BadgePurchaseModalProps) {
  const { authToken } = useContext(AuthContext)
  const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT

  const [badges, setBadges] = useState<BadgeItem[]>([])
  const [selectedBadge, setSelectedBadge] = useState<BadgeItem | null>(null)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isLoading, setBadgesLoading] = useState(false)
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [paymentStep, setPaymentStep] = useState<PaymentStep>('selection')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mpesa')
  const [transactionId, setTransactionId] = useState<number | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'completed' | 'failed' | 'cancelled'>('pending')

  const fetchBadges = async () => {
    setBadgesLoading(true)
    try {
      const response = await fetch(`${apiEndpoint}/badges/`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setBadges(data.badges)
      } else {
        toast.error('Failed to load badges')
      }
    } catch (error) {
      console.error('Error fetching badges:', error)
      toast.error('Failed to load badges')
    } finally {
      setBadgesLoading(false)
    }
  }

  const checkPaymentStatus = async () => {
    if (!transactionId) return

    try {
      const response = await fetch(`${apiEndpoint}/badges/transaction/${transactionId}/status`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setPaymentStatus(data.status.toLowerCase())

        if (data.status === 'COMPLETED') {
          setPaymentStep('complete')
          toast.success('Badge purchased successfully!')
          setTimeout(() => {
            onSuccess()
            onClose()
          }, 2000)
        } else if (data.status === 'FAILED' || data.status === 'CANCELLED') {
          toast.error(data.message || 'Payment failed')
          setPaymentStep('selection')
        }
      }
    } catch (error) {
      console.error('Error checking payment status:', error)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchBadges()
      // Reset state when modal opens
      setSelectedBadge(null)
      setPhoneNumber('')
      setPaymentStep('selection')
      setPaymentMethod('mpesa')
      setTransactionId(null)
      setPaymentStatus('pending')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (paymentStep === 'processing' && transactionId) {
      // Poll for payment status every 3 seconds
      interval = setInterval(() => {
        checkPaymentStatus()
      }, 3000)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentStep, transactionId])

  const handleMpesaPurchase = async () => {
    if (!selectedBadge || !phoneNumber) {
      toast.error('Please select a badge and enter your phone number')
      return
    }

    // Validate phone number (basic Kenyan format)
    const phoneRegex = /^(\+254|254|0)?[17]\d{8}$/
    if (!phoneRegex.test(phoneNumber.replace(/\s/g, ''))) {
      toast.error('Please enter a valid Kenyan phone number')
      return
    }

    setIsPurchasing(true)
    setPaymentStep('payment')

    try {
      const response = await fetch(`${apiEndpoint}/badges/purchase`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          badge_id: selectedBadge.id,
          phone_number: phoneNumber
        })
      })

      const data = await response.json()

      if (response.ok) {
        setTransactionId(data.transaction_id)
        setPaymentStep('processing')
        toast.success('Payment initiated! Please complete payment on your phone.')
      } else {
        throw new Error(data.error || 'Failed to initiate payment')
      }
    } catch (error) {
      console.error('Error purchasing badge:', error)
      toast.error('Failed to initiate payment. Please try again.')
      setPaymentStep('selection')
    } finally {
      setIsPurchasing(false)
    }
  }

  const handleCardPurchase = async () => {
    if (!selectedBadge) {
      toast.error('Please select a badge')
      return
    }

    setIsPurchasing(true)
    setPaymentStep('redirect')

    try {
      const response = await fetch(`${apiEndpoint}/badges/purchase/card`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          badge_id: selectedBadge.id
        })
      })

      const data = await response.json()

      if (response.ok && data.checkout_url) {
        setTransactionId(data.transaction_id)
        toast.success('Redirecting to secure payment...')
        // Redirect to IntaSend checkout
        window.location.href = data.checkout_url
      } else {
        throw new Error(data.error || 'Failed to create checkout session')
      }
    } catch (error) {
      console.error('Error creating checkout:', error)
      toast.error('Failed to initiate card payment. Please try again.')
      setPaymentStep('selection')
    } finally {
      setIsPurchasing(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const renderBadgeSelection = () => (
    <div className="grid gap-3">
      {badges.map((badge) => (
        <Card
          key={badge.id}
          className={`cursor-pointer transition-all hover:shadow-md ${selectedBadge?.id === badge.id
            ? 'ring-2 ring-[#B5A8D1] bg-[#B5A8D1]/10'
            : 'hover:shadow-lg hover:border-[#B5A8D1]/50'
            }`}
          onClick={() => setSelectedBadge(badge)}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="relative w-12 h-12">
                <Image
                  src={badge.image_url}
                  alt={badge.name}
                  fill
                  className="object-contain"
                  unoptimized={badge.is_animated}
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{badge.name}</h3>
                  {badge.is_animated && (
                    <Badge variant="secondary" className="text-xs">
                      Animated
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{badge.description}</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-green-600">
                  {formatPrice(badge.price_ksh)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const renderPaymentMethodSelector = () => (
    <Card className="border-[#B5A8D1]/30 bg-gradient-to-br from-[#B5A8D1]/5 to-transparent">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative w-10 h-10">
            <Image
              src={selectedBadge!.image_url}
              alt={selectedBadge!.name}
              fill
              className="object-contain"
              unoptimized={selectedBadge!.is_animated}
            />
          </div>
          <div className="flex-1">
            <div className="font-medium">{selectedBadge!.name}</div>
            <div className="text-sm font-semibold text-green-600">
              {formatPrice(selectedBadge!.price_ksh)}
            </div>
          </div>
        </div>

        <Tabs value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4 bg-[#B5A8D1]/10">
            <TabsTrigger
              value="mpesa"
              className="data-[state=active]:bg-[#B5A8D1] data-[state=active]:text-white flex items-center gap-2"
            >
              <Smartphone className="h-4 w-4" />
              M-Pesa
            </TabsTrigger>
            <TabsTrigger
              value="card"
              className="data-[state=active]:bg-[#B5A8D1] data-[state=active]:text-white flex items-center gap-2"
            >
              <CreditCard className="h-4 w-4" />
              Card
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mpesa" className="mt-0">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">M-Pesa Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="0712345678 or +254712345678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="border-[#B5A8D1]/30 focus:border-[#B5A8D1] focus:ring-[#B5A8D1]"
                />
                <p className="text-xs text-muted-foreground">
                  Enter the phone number registered with M-Pesa
                </p>
              </div>

              <Button
                onClick={handleMpesaPurchase}
                disabled={isPurchasing || !phoneNumber}
                className="w-full bg-[#B5A8D1] hover:bg-[#9D8FC3] text-white"
                size="lg"
              >
                {isPurchasing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Smartphone className="h-4 w-4 mr-2" />
                    Pay {formatPrice(selectedBadge!.price_ksh)} via M-Pesa
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="card" className="mt-0">
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-muted/50 border border-dashed">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Secure Card Payment</p>
                    <p className="text-xs text-muted-foreground">
                      You&apos;ll be redirected to IntaSend&apos;s secure checkout to complete your payment with Visa, Mastercard, or other cards.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleCardPurchase}
                disabled={isPurchasing}
                className="w-full bg-[#B5A8D1] hover:bg-[#9D8FC3] text-white"
                size="lg"
              >
                {isPurchasing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating checkout...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pay {formatPrice(selectedBadge!.price_ksh)} with Card
                    <ExternalLink className="h-3 w-3 ml-2" />
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Powered by IntaSend · PCI DSS Compliant
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )

  const renderSelectionStep = () => (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <BadgeCheck className="h-5 w-5 text-[#B5A8D1]" />
          Get Premium Badges
        </DialogTitle>
      </DialogHeader>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-[#B5A8D1]" />
        </div>
      ) : (
        <div className="space-y-4">
          {renderBadgeSelection()}
          {selectedBadge && renderPaymentMethodSelector()}
        </div>
      )}
    </>
  )

  const renderProcessingStep = () => (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-[#B5A8D1] animate-pulse" />
          Processing Payment
        </DialogTitle>
      </DialogHeader>

      <div className="text-center py-8 space-y-4">
        <div className="relative w-16 h-16 mx-auto">
          <Image
            src={selectedBadge?.image_url || ''}
            alt={selectedBadge?.name || ''}
            fill
            className="object-contain"
            unoptimized={selectedBadge?.is_animated}
          />
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Complete Payment on Your Phone</h3>
          <p className="text-muted-foreground">
            Check your phone for the M-Pesa payment prompt and enter your PIN to complete the purchase.
          </p>
        </div>

        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#B5A8D1]" />
        </div>

        <div className="text-sm text-muted-foreground">
          Waiting for payment confirmation...
        </div>

        <Button
          variant="outline"
          onClick={() => setPaymentStep('selection')}
          className="border-[#B5A8D1]/30 hover:bg-[#B5A8D1]/10"
        >
          Cancel
        </Button>
      </div>
    </>
  )

  const renderRedirectStep = () => (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <ExternalLink className="h-5 w-5 text-[#B5A8D1]" />
          Redirecting to Payment
        </DialogTitle>
      </DialogHeader>

      <div className="text-center py-8 space-y-4">
        <div className="relative w-16 h-16 mx-auto">
          <Image
            src={selectedBadge?.image_url || ''}
            alt={selectedBadge?.name || ''}
            fill
            className="object-contain"
            unoptimized={selectedBadge?.is_animated}
          />
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Opening Secure Checkout</h3>
          <p className="text-muted-foreground">
            You&apos;re being redirected to IntaSend&apos;s secure payment page. Complete your card payment there.
          </p>
        </div>

        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#B5A8D1]" />
        </div>

        <p className="text-xs text-muted-foreground">
          If you&apos;re not redirected automatically, please try again.
        </p>
      </div>
    </>
  )

  const renderCompleteStep = () => (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          Badge Purchased!
        </DialogTitle>
      </DialogHeader>

      <div className="text-center py-8 space-y-4">
        <div className="relative w-20 h-20 mx-auto">
          <Image
            src={selectedBadge?.image_url || ''}
            alt={selectedBadge?.name || ''}
            fill
            className="object-contain"
            unoptimized={selectedBadge?.is_animated}
          />
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-green-600">
            {selectedBadge?.name} Badge Added!
          </h3>
          <p className="text-muted-foreground">
            Your new badge is now displayed on your profile. You can manage your badge display settings in your profile.
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 text-green-600">
          <CheckCircle className="h-5 w-5" />
          <span className="font-medium">Payment Successful</span>
        </div>
      </div>
    </>
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-w-[90vw] max-h-[80vh] overflow-y-auto fixed top-[8%] left-1/2 -translate-x-1/2 translate-y-0 sm:top-1/2 sm:-translate-y-1/2">
        {paymentStep === 'selection' && renderSelectionStep()}
        {paymentStep === 'payment' && renderSelectionStep()}
        {paymentStep === 'processing' && renderProcessingStep()}
        {paymentStep === 'redirect' && renderRedirectStep()}
        {paymentStep === 'complete' && renderCompleteStep()}
      </DialogContent>
    </Dialog>
  )
}
