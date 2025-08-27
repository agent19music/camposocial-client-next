"use client"

import { Icons } from "@/components/icons"
import { Smartphone } from "lucide-react"
import React, { useState, useContext, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ApplePayModal } from "@/modals/paymentcard/applepay"
import { PayPalModal } from "@/modals/paymentcard/paypal"
import MpesaModal from "@/modals/paymentcard/mpesa"
import { usePaystackPayment } from "react-paystack"
import { useRouter } from "next/navigation"
import { AuthContext } from "@/context/authcontext"
import {toast} from 'react-hot-toast'
import { MarketplaceContext } from "@/context/marketplacecontext"

export default function CardsPaymentMethod() {
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [isApplePayModalOpen, setIsApplePayModalOpen] = useState(false)
  const [isPayPalModalOpen, setIsPayPalModalOpen] = useState(false)
  const [isMpesaModalOpen, setIsMpesaModalOpen] = useState(false)
  const [paymentReference, setPaymentReference] = useState("")
  const [paymentAmount, setPaymentAmount] = useState(0)
  const [paystackConfig, setPaystackConfig] = useState<any>(null)
  const router = useRouter()
  const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT;
   const {authToken} = useContext(AuthContext)
   const {isPayed, setIsPayed, orderId} = useContext(MarketplaceContext)


   interface PaymentResponse {
    authorization_url: string;
    reference: string;
  }

  const handlePaymentMethodChange = (value: string) => {
    setPaymentMethod(value)
    if (value === "apple") {
      setIsApplePayModalOpen(true)
    } else if (value === "paypal") {
      setIsPayPalModalOpen(true)
    } else if (value === "mpesa") {
      setIsMpesaModalOpen(true)
    }
  }

  // Function to fetch payment configuration
  const fetchPaystackConfig = async () => {
    try {
      // Fetch the payment initialization
      const response = await fetch(`${apiEndpoint}/paystack/initialize_payment`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_id: orderId,
        }),
      });
  
      // If the response is not ok, throw an error
      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to initialize payment');
        return null;
      }
  
      const data = await response.json();
      
      // Store reference for verification later
      if (data.reference) {
        setPaymentReference(data.reference);
      }
      
      // Store amount for M-Pesa modal
      if (data.amount) {
        setPaymentAmount(data.amount / 100); // Paystack amount is in kobo (cents)
      }
      
      return {
        reference: data.reference,
        email: data.customer?.email || "customer@example.com",
        amount: data.amount,
        publicKey: process.env.PAYSTACK_PUBLIC_KEY || "",
        label: "Pay with Card",
      };
    } catch (err: any) {
      // Show error toast
      toast.error(err.message || 'An error occurred during payment initialization.');
      console.error('Payment initialization failed:', err);
      return null;
    }
  };

  // Effect to fetch payment config when component mounts
  useEffect(() => {
    const getPaymentConfig = async () => {
      const config = await fetchPaystackConfig();
      if (config) {
        setPaystackConfig(config);
      }
    };
    
    getPaymentConfig();
  }, [orderId]);

  // Handle successful Paystack payment
  const handlePaymentSuccess = (reference: any) => {
    toast.success('Payment successful!');
    console.log('Payment successful. Reference:', reference);
    
    // Set payment as completed in the context
    setIsPayed(true);
    
    // Redirect to receipt page
    router.push('/888');
  };

  // Handle payment close/cancel
  const handlePaymentClose = () => {
    toast.error('Payment cancelled or failed.');
    console.log('Payment window closed');
  };

  // Initialize Paystack payment
  const initializePayment = usePaystackPayment(paystackConfig || {
    email: "customer@example.com",
    amount: 0,
    publicKey: process.env.PAYSTACK_PUBLIC_KEY || "",
    reference: ""
  });

  // Handle card payment with Paystack inline
  const handlePaystackPayment = () => {
    if (!paystackConfig) {
      toast.error('Payment configuration not loaded. Please try again.');
      return;
    }
    
    if (paymentMethod === 'card') {
      // With react-paystack, initializePayment() should be called with onSuccess and onClose callbacks
      initializePayment({
        onSuccess: handlePaymentSuccess,
        onClose: handlePaymentClose
      });
    }
  };

  // Handle M-Pesa payment
  const handleMpesaPayment = async (phoneNumber: string) => {
    try {
      // Close the M-Pesa modal
      setIsMpesaModalOpen(false);
      
      // Call the API to initiate M-Pesa payment
      const response = await fetch(`${apiEndpoint}/mpesa/initiate_payment`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_id: orderId,
          phone_number: phoneNumber,
          reference: paymentReference
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to initiate M-Pesa payment');
      }

      const data = await response.json();
      
      // Show success message and info about next steps
      toast.success('M-Pesa payment initiated! Check your phone for an STK push prompt.');
      
      // Set a timer to check payment status
      let attempts = 0;
      const checkPaymentStatus = setInterval(async () => {
        attempts++;
        
        // Check payment status from backend
        const statusResponse = await fetch(`${apiEndpoint}/mpesa/verify_payment/${paymentReference}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        
        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          console.log("Payment verification response:", statusData);
          
          // Check for success status in different possible locations in the response
          const isSuccess = 
            (statusData.status === 'success') || 
            (statusData.data?.status === 'success') ||
            (statusData.success === true) ||
            (statusData.payment_status === 'completed') ||
            (statusData.data?.payment_status === 'completed');
            
          if (isSuccess) {
            clearInterval(checkPaymentStatus);
            toast.success('Payment confirmed!');
            setIsPayed(true);
            router.push('/888');
          }
        }
        
        // Stop checking after 20 attempts (about 2 minutes)
        if (attempts > 20) {
          clearInterval(checkPaymentStatus);
          toast.error('Payment verification timed out. If you completed the payment, please contact support.');
        }
      }, 6000); // Check every 6 seconds
      
    } catch (err: any) {
      toast.error(err.message || 'An error occurred during M-Pesa payment initiation.');
      console.error('M-Pesa payment initiation failed:', err);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>
            Add a new payment method to your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <RadioGroup 
            defaultValue="card" 
            className="grid grid-cols-3 gap-4"
            onValueChange={handlePaymentMethodChange}
          >
            <div>
              <RadioGroupItem
                value="card"
                id="card"
                className="peer sr-only"
                aria-label="Card"
              />
              <Label
                htmlFor="card"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="mb-3 h-6 w-6"
                >
                  <rect width="20" height="14" x="2" y="5" rx="2" />
                  <path d="M2 10h20" />
                </svg>
                Card
              </Label>
            </div>

            <div>
              <RadioGroupItem
                value="paypal"
                id="paypal"
                className="peer sr-only"
                aria-label="Paypal"
              />
              <Label
                htmlFor="paypal"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <Icons.paypal className="mb-3 h-6 w-6" />
                Paypal
              </Label>
            </div>

            <div>
              <RadioGroupItem
                value="apple"
                id="apple"
                className="peer sr-only"
                aria-label="Apple"
              />
              <Label
                htmlFor="apple"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <Icons.apple className="mb-3 h-6 w-6" />
                Apple
              </Label>
            </div>

            <div>
              <RadioGroupItem
                value="mpesa"
                id="mpesa"
                className="peer sr-only"
                aria-label="M-Pesa"
              />
              <Label
                htmlFor="mpesa"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
              >
                <Smartphone className="mb-3 h-6 w-6 text-green-600" />
                M-Pesa
              </Label>
            </div>
          </RadioGroup>
          {paymentMethod === "card" && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" placeholder="First Last" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" placeholder="" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="number">Card number</Label>
                <Input id="number" placeholder="" type="number" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="month">Expires</Label>
                  <Select>
                    <SelectTrigger id="month" aria-label="Month">
                      <SelectValue placeholder="Month" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">January</SelectItem>
                      <SelectItem value="2">February</SelectItem>
                      <SelectItem value="3">March</SelectItem>
                      <SelectItem value="4">April</SelectItem>
                      <SelectItem value="5">May</SelectItem>
                      <SelectItem value="6">June</SelectItem>
                      <SelectItem value="7">July</SelectItem>
                      <SelectItem value="8">August</SelectItem>
                      <SelectItem value="9">September</SelectItem>
                      <SelectItem value="10">October</SelectItem>
                      <SelectItem value="11">November</SelectItem>
                      <SelectItem value="12">December</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="year">Year</Label>
                  <Select>
                    <SelectTrigger id="year" aria-label="Year">
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 10 }, (_, i) => (
                        <SelectItem key={i} value={`${new Date().getFullYear() + i}`}>
                          {new Date().getFullYear() + i}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cvc">CVC</Label>
                  <Input id="cvc" placeholder="CVC" />
                </div>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full" 
            onClick={paymentMethod === 'mpesa' ? () => setIsMpesaModalOpen(true) : handlePaystackPayment}
          >
            Continue
          </Button>
        </CardFooter>
      </Card>
      <ApplePayModal 
        isOpen={isApplePayModalOpen} 
        onClose={() => setIsApplePayModalOpen(false)} 
      />
      <PayPalModal 
        isOpen={isPayPalModalOpen} 
        onClose={() => setIsPayPalModalOpen(false)} 
      />
      <MpesaModal 
        isOpen={isMpesaModalOpen} 
        onOpenChange={setIsMpesaModalOpen}
        onSubmit={handleMpesaPayment}
        amount={paymentAmount}
        currency="NGN"
      />
    </>
  )
}

