'use client'
import { useState, useEffect, useContext, useCallback } from 'react'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { AuthContext } from '@/context/authcontext'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import dynamic from 'next/dynamic'
import { Loader2, CheckCircle, Tag, Truck, CreditCard } from 'lucide-react'

const CardsPaymentMethod = dynamic(
  () => import('./paymentcard'),
  {
    ssr: false,
    loading: () => <div className="flex justify-center items-center p-4">Loading payment methods...</div>
  }
)
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import * as z from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { MarketplaceContext } from '@/context/marketplacecontext'

interface CartItem {
  product_title: string;
  quantity: number;
  price_per_item: number;
  total_item_price: number;
  images: string[];
  id: string;
}

type CurrentUser = {
  id: string;
  first_name: string;
  last_name: string;
  address: string;
  phone_no: string;
  email: string;
} | null

interface CartResponse {
  cart_items: CartItem[];
}

interface DiscountValidation {
  valid: boolean;
  code: string;
  discount_type: 'percentage' | 'fixed';
  value: number;
  discount_amount: number;
  final_total: number;
  error?: string;
}

// Form validation schema
const orderSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone_no: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().min(1, "Address is required"),
})

export default function CheckoutComponent() {
  const router = useRouter()
  const { currentUser, authToken } = useContext(AuthContext)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState<boolean>(true)
  const [showPayNow, setShowPayNow] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const { setOrderId, orderId } = useContext(MarketplaceContext)

  // New state for discount and payment mode
  const [discountCode, setDiscountCode] = useState('')
  const [discountLoading, setDiscountLoading] = useState(false)
  const [appliedDiscount, setAppliedDiscount] = useState<DiscountValidation | null>(null)
  const [paymentMode, setPaymentMode] = useState<'pay_before' | 'pay_on_delivery'>('pay_before')

  const handlePayNow = () => {
    setIsPaymentDialogOpen(true);
  };

  const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT

  const form = useForm<z.infer<typeof orderSchema>>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      first_name: currentUser?.first_name || "",
      last_name: currentUser?.last_name || "",
      email: currentUser?.email || "",
      phone_no: currentUser?.phone_no || "",
      address: currentUser?.address || "",
    },
  })

  const getCartItems = useCallback(async (userId: string): Promise<CartItem[]> => {
    try {
      const response = await fetch(`${apiEndpoint}/cart/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch cart data');
      }
      const data: CartResponse = await response.json();
      return data.cart_items;
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch cart items");
      return [];
    }
  }, [apiEndpoint]);

  useEffect(() => {
    if (currentUser?.id) {
      const fetchCartItems = async () => {
        setLoading(true);
        const items = await getCartItems(currentUser.id);
        setCartItems(items);
        setLoading(false);
      };
      fetchCartItems();
    }
  }, [currentUser, getCartItems]);

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + item.price_per_item * item.quantity, 0)
  const discountAmount = appliedDiscount?.discount_amount || 0
  const finalTotal = subtotal - discountAmount

  // Validate discount code
  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      toast.error("Please enter a discount code")
      return
    }

    setDiscountLoading(true)
    try {
      const response = await fetch(`${apiEndpoint}/validate_discount`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          code: discountCode,
          cart_total: subtotal
        })
      })

      const data = await response.json()

      if (!response.ok || !data.valid) {
        setAppliedDiscount(null)
        toast.error(data.error || "Invalid discount code")
        return
      }

      setAppliedDiscount(data as DiscountValidation)
      toast.success(`Discount applied! You save KES ${data.discount_amount.toLocaleString()}`)
    } catch (error) {
      toast.error("Failed to validate discount code")
    } finally {
      setDiscountLoading(false)
    }
  }

  const removeDiscount = () => {
    setAppliedDiscount(null)
    setDiscountCode('')
  }

  const onSubmit = async (values: z.infer<typeof orderSchema>) => {
    try {
      setIsSubmitting(true);

      if (!authToken) {
        toast.error("Please log in to place an order");
        return;
      }

      const orderPayload = {
        ...values,
        total_price: finalTotal,
        discount_code: appliedDiscount?.code || null,
        payment_mode: paymentMode,
      }

      const response = await fetch(`${apiEndpoint}/create_order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify(orderPayload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create order');
      }

      toast.success(`Order created! Ticket: ${data.ticket_number}`);
      setOrderId(data.order_id);

      // If pay_on_delivery, redirect to confirmation
      if (paymentMode === 'pay_on_delivery') {
        toast.success("Order confirmed! Pay on delivery.");
        router.push(`/orders/${data.order_id}`);
      } else {
        // Show payment dialog for pay_before
        setShowPayNow(true);
      }

    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create order");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayment = async () => {
    const simulatedReference = `REF-${Date.now()}`;

    try {
      const response = await fetch(`${apiEndpoint}/confirm_payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({ order_id: orderId, payment_reference: simulatedReference }),
      });

      if (!response.ok) throw new Error('Failed to confirm payment');

      toast.success("Payment successful!");
      router.push(`/orders/${orderId}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Payment failed");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      <div className="grid gap-6 md:grid-cols-2">
        {/* Cart Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle>Your Cart</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              {cartItems.map(item => (
                <div key={item.id} className="flex items-center mb-4">
                  <Image
                    src={item.images[0] || '/placeholder.png'}
                    alt={item.product_title}
                    width={80}
                    height={80}
                    className="rounded-md mr-4"
                  />
                  <div className="flex-grow">
                    <h3 className="font-semibold">{item.product_title}</h3>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-semibold">KES {(item.price_per_item * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </ScrollArea>

            <Separator className="my-4" />

            {/* Discount Code Input */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Discount Code
              </Label>
              {appliedDiscount ? (
                <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-700">{appliedDiscount.code}</span>
                    <Badge variant="secondary">
                      {appliedDiscount.discount_type === 'percentage'
                        ? `${appliedDiscount.value}% off`
                        : `KES ${appliedDiscount.value} off`
                      }
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm" onClick={removeDiscount}>
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter discount code"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    onClick={handleApplyDiscount}
                    disabled={discountLoading}
                  >
                    {discountLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
                  </Button>
                </div>
              )}
            </div>

            <Separator className="my-4" />

            {/* Order Summary */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>KES {subtotal.toLocaleString()}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-KES {discountAmount.toLocaleString()}</span>
                </div>
              )}
              <Separator className="my-2" />
              <div className="flex justify-between items-center font-bold text-lg">
                <span>Total</span>
                <span>KES {finalTotal.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Checkout Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>Your Information</CardTitle>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <CardContent>
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="first_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="last_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Delivery Address</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter your shipping address" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone_no"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input {...field} type="tel" placeholder="e.g. 0712345678" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" disabled />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator className="my-2" />

                  {/* Payment Mode Selection */}
                  <div className="space-y-3">
                    <Label className="font-semibold">Payment Method</Label>
                    <RadioGroup
                      value={paymentMode}
                      onValueChange={(value) => setPaymentMode(value as 'pay_before' | 'pay_on_delivery')}
                      className="grid grid-cols-2 gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="pay_before" id="pay_before" />
                        <Label
                          htmlFor="pay_before"
                          className="flex items-center gap-2 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 flex-1"
                        >
                          <CreditCard className="h-5 w-5 text-blue-600" />
                          <div>
                            <div className="font-medium">Pay Now</div>
                            <div className="text-xs text-gray-500">M-Pesa / Card</div>
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="pay_on_delivery" id="pay_on_delivery" />
                        <Label
                          htmlFor="pay_on_delivery"
                          className="flex items-center gap-2 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 flex-1"
                        >
                          <Truck className="h-5 w-5 text-green-600" />
                          <div>
                            <div className="font-medium">Pay on Delivery</div>
                            <div className="text-xs text-gray-500">Cash on arrival</div>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                {!showPayNow ? (
                  <Button
                    className="w-full"
                    type="submit"
                    disabled={isSubmitting || cartItems.length === 0}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      paymentMode === 'pay_on_delivery'
                        ? 'Confirm Order (Pay on Delivery)'
                        : `Place Order - KES ${finalTotal.toLocaleString()}`
                    )}
                  </Button>
                ) : (
                  <>
                    <Button className="w-full bg-green-600 hover:bg-green-500" type='button' onClick={handlePayNow}>
                      Pay Now - KES {finalTotal.toLocaleString()}
                    </Button>
                    <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                      <DialogContent>
                        <DialogTitle>Complete Payment</DialogTitle>
                        <CardsPaymentMethod />
                      </DialogContent>
                    </Dialog>
                  </>
                )}
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </div>
  )
}