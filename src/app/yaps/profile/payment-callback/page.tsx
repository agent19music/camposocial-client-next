'use client'

import React, { useState, useEffect, useContext, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Loader2,
    CheckCircle,
    XCircle,
    Clock,
    BadgeCheck,
    ArrowLeft,
    RefreshCw
} from "lucide-react"
import { AuthContext } from "@/context/authcontext"
import toast from "react-hot-toast"
import Header from '@/components/header'

type PaymentStatus = 'loading' | 'processing' | 'completed' | 'failed'

function PaymentCallbackContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const { authToken, currentUser } = useContext(AuthContext)
    const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT

    const [status, setStatus] = useState<PaymentStatus>('loading')
    const [message, setMessage] = useState('')
    const [badgeName, setBadgeName] = useState('')
    const [pollCount, setPollCount] = useState(0)

    const orderRef = searchParams.get('order_ref')
    const checkoutId = searchParams.get('checkout_id')

    useEffect(() => {
        if (!authToken) {
            router.push('/login')
            return
        }

        if (!orderRef) {
            setStatus('failed')
            setMessage('Invalid payment callback. Missing order reference.')
            return
        }

        verifyPayment()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orderRef, authToken])

    // Poll for status if processing
    useEffect(() => {
        let interval: NodeJS.Timeout

        if (status === 'processing' && pollCount < 20) { // Max 60 seconds polling
            interval = setInterval(() => {
                verifyPayment()
                setPollCount(prev => prev + 1)
            }, 3000)
        }

        return () => {
            if (interval) clearInterval(interval)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status, pollCount])

    const verifyPayment = async () => {
        try {
            const response = await fetch(`${apiEndpoint}/badges/verify-card-payment`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    order_ref: orderRef,
                    checkout_id: checkoutId
                })
            })

            const data = await response.json()

            if (response.ok) {
                if (data.status === 'COMPLETED') {
                    setStatus('completed')
                    setMessage(data.message || 'Your badge has been added to your profile!')
                    setBadgeName(data.badge_name || 'Premium Badge')
                    toast.success('Badge purchased successfully!')
                } else if (data.status === 'PROCESSING' || data.status === 'PENDING') {
                    setStatus('processing')
                    setMessage('Your payment is being verified. This may take a moment...')
                } else if (data.status === 'FAILED') {
                    setStatus('failed')
                    setMessage(data.message || 'Payment verification failed.')
                }
            } else {
                if (status === 'loading') {
                    setStatus('failed')
                    setMessage(data.error || 'Failed to verify payment.')
                }
            }
        } catch (error) {
            console.error('Payment verification error:', error)
            if (status === 'loading') {
                setStatus('failed')
                setMessage('Unable to verify payment. Please check your profile for badge status.')
            }
        }
    }

    const handleRetry = () => {
        setStatus('loading')
        setPollCount(0)
        verifyPayment()
    }

    const handleGoToProfile = () => {
        if (currentUser?.username) {
            router.push(`/yaps/profile/${currentUser.username}`)
        } else {
            router.push('/yaps')
        }
    }

    const handleGoBack = () => {
        router.back()
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <div className="max-w-md mx-auto px-4 py-8">
                <Button
                    variant="ghost"
                    onClick={handleGoBack}
                    className="mb-6"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>

                <Card className="border-[#B5A8D1]/30">
                    <CardHeader className="text-center pb-2">
                        <CardTitle className="flex items-center justify-center gap-2">
                            <BadgeCheck className="h-6 w-6 text-[#B5A8D1]" />
                            Badge Payment
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4">
                        {status === 'loading' && (
                            <div className="text-center py-8 space-y-4">
                                <Loader2 className="h-12 w-12 mx-auto animate-spin text-[#B5A8D1]" />
                                <div>
                                    <h3 className="font-semibold text-lg">Verifying Payment</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Please wait while we verify your payment...
                                    </p>
                                </div>
                            </div>
                        )}

                        {status === 'processing' && (
                            <div className="text-center py-8 space-y-4">
                                <div className="relative">
                                    <Clock className="h-12 w-12 mx-auto text-amber-500" />
                                    <div className="absolute -bottom-1 -right-1 left-0 right-0 flex justify-center">
                                        <Loader2 className="h-5 w-5 animate-spin text-[#B5A8D1]" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg text-amber-600">Payment Processing</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {message}
                                    </p>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Checking status... ({pollCount}/20)
                                </p>
                            </div>
                        )}

                        {status === 'completed' && (
                            <div className="text-center py-8 space-y-4">
                                <div className="relative w-20 h-20 mx-auto">
                                    <div className="absolute inset-0 bg-green-100 rounded-full flex items-center justify-center">
                                        <CheckCircle className="h-12 w-12 text-green-600" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg text-green-600">Payment Successful!</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {message}
                                    </p>
                                    {badgeName && (
                                        <p className="text-sm font-medium text-[#B5A8D1] mt-2">
                                            {badgeName} has been added to your profile
                                        </p>
                                    )}
                                </div>
                                <Button
                                    onClick={handleGoToProfile}
                                    className="w-full bg-[#B5A8D1] hover:bg-[#9D8FC3] text-white"
                                >
                                    <BadgeCheck className="h-4 w-4 mr-2" />
                                    View My Profile
                                </Button>
                            </div>
                        )}

                        {status === 'failed' && (
                            <div className="text-center py-8 space-y-4">
                                <div className="relative w-20 h-20 mx-auto">
                                    <div className="absolute inset-0 bg-red-100 rounded-full flex items-center justify-center">
                                        <XCircle className="h-12 w-12 text-red-600" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg text-red-600">Verification Failed</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {message}
                                    </p>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Button
                                        onClick={handleRetry}
                                        variant="outline"
                                        className="w-full border-[#B5A8D1]/30 hover:bg-[#B5A8D1]/10"
                                    >
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                        Retry Verification
                                    </Button>
                                    <Button
                                        onClick={handleGoToProfile}
                                        className="w-full bg-[#B5A8D1] hover:bg-[#9D8FC3] text-white"
                                    >
                                        Go to Profile
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    If your payment was successful, the badge may take a few moments to appear on your profile.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default function PaymentCallbackPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#B5A8D1]" />
            </div>
        }>
            <PaymentCallbackContent />
        </Suspense>
    )
}
