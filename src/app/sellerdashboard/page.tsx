'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function SellerDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [seller, setSeller] = useState<any>(null)

  useEffect(() => {
    const checkSeller = async () => {
      try {
        const res = await fetch('/api/seller/check', { credentials: 'include' })
        const data = await res.json()
        if (!data.is_seller) {
          router.replace('/sellerdashboard/sellersignup')
          return
        }
        setSeller(data.seller)
      } catch (e) {
        router.replace('/sellerdashboard/sellersignup')
      } finally {
        setLoading(false)
      }
    }
    checkSeller()
  }, [router])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="w-screen min-h-screen lg:container mx-auto p-4">
      <Header />
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>Welcome, {seller?.display_name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">Manage your products and orders from here.</p>
            <div className="flex gap-3">
              <Button onClick={() => router.push('/marketplace')}>Browse Marketplace</Button>
              <Button variant="outline" onClick={() => router.push('/sellerdashboard')}>Refresh</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
