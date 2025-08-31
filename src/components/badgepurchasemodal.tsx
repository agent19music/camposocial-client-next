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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Star, BadgeCheck, CheckCircle, XCircle, Clock } from "lucide-react"
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

export default function BadgePurchaseModal({ isOpen, onClose, onSuccess }: BadgePurchaseModalProps) {
  const { authToken } = useContext(AuthContext)
  const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT
  
  const [badges, setBadges] = useState<BadgeItem[]>([])
  const [selectedBadge, setSelectedBadge] = useState<BadgeItem | null>(null)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isLoading, setBadgesLoading] = useState(false)
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [paymentStep, setPaymentStep] = useState<'selection' | 'payment' | 'processing' | 'complete'>('selection')
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

  const handlePurchase = async () => {
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const renderSelectionStep = () => (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <BadgeCheck className="h-5 w-5 text-yellow-500" />
          Get Premium Badges
        </DialogTitle>
      </DialogHeader>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4">
            {badges.map((badge) => (
              <Card 
                key={badge.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedBadge?.id === badge.id 
                    ? 'ring-2 ring-purple-500 bg-purple-50' 
                    : 'hover:shadow-lg'
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
                      <div className="text-xs text-muted-foreground">via M-Pesa</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedBadge && (
            <Card className="border-purple-200 bg-purple-50">
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-8 h-8">
                      <Image
                        src={selectedBadge.image_url}
                        alt={selectedBadge.name}
                        fill
                        className="object-contain"
                        unoptimized={selectedBadge.is_animated}
                      />
                    </div>
                    <div>
                      <div className="font-medium">{selectedBadge.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatPrice(selectedBadge.price_ksh)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">M-Pesa Phone Number</Label>
                    <Input
                      id="phone"
                      placeholder="0712345678 or +254712345678"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter the phone number registered with M-Pesa
                    </p>
                  </div>

                  <Button 
                    onClick={handlePurchase}
                    disabled={isPurchasing || !phoneNumber}
                    className="w-full"
                    size="lg"
                  >
                    {isPurchasing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <BadgeCheck className="h-4 w-4 mr-2" />
                        Pay {formatPrice(selectedBadge.price_ksh)} via M-Pesa
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </>
  )

  const renderProcessingStep = () => (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-500 animate-pulse" />
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
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>

        <div className="text-sm text-muted-foreground">
          Waiting for payment confirmation...
        </div>

        <Button 
          variant="outline" 
          onClick={() => setPaymentStep('selection')}
        >
          Cancel
        </Button>
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
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        {paymentStep === 'selection' && renderSelectionStep()}
        {paymentStep === 'payment' && renderSelectionStep()}
        {paymentStep === 'processing' && renderProcessingStep()}
        {paymentStep === 'complete' && renderCompleteStep()}
      </DialogContent>
    </Dialog>
  )
}
