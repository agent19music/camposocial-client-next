'use client'
import { useState, useEffect, useContext, useCallback } from 'react'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AuthContext } from '@/context/authcontext'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import dynamic from 'next/dynamic'

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

// Form validation schema
const orderSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone_no: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().min(1, "Address is required"),
  total_price: z.number().min(0, "Total price error"),
})

export default function CheckoutComponent() {
  const router = useRouter()
  const { currentUser, authToken } = useContext(AuthContext)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState<boolean>(true)
  const [showPayNow, setShowPayNow] = useState(false);
  const [paymentReference, setPaymentReference] = useState<string | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const {setOrderId, orderId} = useContext(MarketplaceContext)

  const handlePayNow = () => {
    setIsPaymentDialogOpen(true);
  };

  
  const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT

  const form = useForm<z.infer<typeof orderSchema>>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      first_name: currentUser?.firstName || "",
      last_name: currentUser?.lastName || "",
      email: currentUser?.email || "",
      phone_no: currentUser?.phone_no || "",
      address: currentUser?.address || "",
      total_price : 0,
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

  const onSubmit = async (values: z.infer<typeof orderSchema>) => {
    try {
      console.log("Form Values:", { ...values, total_price: totalPrice });
      setIsSubmitting(true);
      
      if (!authToken) {
        toast.error("Please log in to place an order");
        return;
      }

      const response = await fetch(`${apiEndpoint}/create_order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${authToken}`,
        },
        body: JSON.stringify({ ...values, total_price: totalPrice }),
      });

      const data = await response.json();     

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create order');
      }

      toast.success("Order created successfully!");
      setOrderId(data.order_id);
      setShowPayNow(true);
      
      // Redirect to order confirmation page
      // router.push(`/orders/${data.order_id}`);

    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create order");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayment = async () => {
    // Simulate Paystack payment process
    const simulatedReference = `REF-${Date.now()}`;
    setPaymentReference(simulatedReference);

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

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price_per_item * item.quantity, 0)

  if (loading) {
    return <div className="flex justify-center items-center min-h-[400px]">Loading...</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Your Cart</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              {cartItems.map(item => (
                <div key={item.id} className="flex items-center mb-4">
                  <Image
                    src={item.images[0]}
                    alt={item.product_title}
                    width={80}
                    height={80}
                    className="rounded-md mr-4"
                  />
                  <div className="flex-grow">
                    <h3 className="font-semibold">{item.product_title}</h3>
                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                  </div>
                  <span className="font-semibold">${(item.price_per_item * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </ScrollArea>
            <Separator className="my-4" />
            <div className="flex justify-between items-center font-bold">
              <span>Total</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
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
                            <Input {...field} disabled />
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
                            <Input {...field} disabled />
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
                        <FormLabel>Address</FormLabel>
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
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input {...field} type="tel" placeholder="Enter your phone number" />
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
                </div>
              </CardContent>
              <CardFooter>
              {!showPayNow ? (
                  <Button className="w-full" type="submit" disabled={isSubmitting || cartItems.length === 0}>
                    {isSubmitting ? "Processing..." : "Place Order"}
                  </Button>
                ) : (
                  <>
                  <Button className="w-full bg-green-600 hover:bg-green-500" type='button' onClick={handlePayNow}>
                    Pay Now
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