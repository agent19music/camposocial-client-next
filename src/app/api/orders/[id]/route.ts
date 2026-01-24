import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

interface OrderItem {
  id: string;
  product_id: string;
  product_title: string;
  product_description?: string;
  price: number;
  quantity: number;
  total_price: number;
  image_url?: string;
}

interface OrderData {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  total_price: number;
  payment_reference?: string;
  paid: boolean;
  created_at: string;
  updated_at?: string;
  items: OrderItem[];
}

/**
 * GET handler for the order details API endpoint
 * Fetches order details from the backend API by ID
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  
  try {
    // Get the order ID from the route params
    const orderId = params.id;
    
    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' }, 
        { status: 400 }
      );
    }

    // Get authentication token from cookies (if your backend requires auth)
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    // Define our API URL (make sure to use environment variables in production)
    const apiUrl = process.env.NEXT_PUBLIC_API_ENDPOINT;
    
    if (!apiUrl) {
      return NextResponse.json(
        { error: 'API endpoint not configured' },
        { status: 500 }
      );
    }
    
    // Make the request to the Flask backend
    const response = await fetch(`${apiUrl}/marketplace/orders/${orderId}`, {
      method: 'GET',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
        'Content-Type': 'application/json',
      },
      cache: 'no-store' // Prevent caching of order details as they may change
    });

    // Check if the response is okay
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error fetching order ${orderId}:`, errorText);
      
      // If the order was not found
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Order not found' }, 
          { status: 404 }
        );
      }
      
      // For other errors
      return NextResponse.json(
        { error: 'Failed to fetch order details from the server' }, 
        { status: response.status }
      );
    }

    // Parse the response data
    const orderData: OrderData = await response.json();
    
    // Format the order data for the receipt page
    const formattedOrderData = {
      ...orderData,
      // Format the customer's full name
      customerName: `${orderData.first_name} ${orderData.last_name}`,
      
      // Format the date for display
      formattedDate: new Date(orderData.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      
      // Format time for display
      formattedTime: new Date(orderData.created_at).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      
      // Calculate the subtotal (without any tax or shipping)
      subtotal: orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      
      // Calculate the total number of items
      itemCount: orderData.items.reduce((count, item) => count + item.quantity, 0),
      
      // Format the payment status
      paymentStatus: {
        label: orderData.paid ? 'Paid' : 'Pending',
        color: orderData.paid ? 'green' : 'yellow',
      },
      
      // Format the order ID to be more readable (e.g., #ORD-12345)
      formattedOrderId: `#ORD-${orderData.id}`,
    };

    return NextResponse.json(formattedOrderData);
  } catch (error) {
    console.error('Error processing order request:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching the order details' }, 
      { status: 500 }
    );
  }
}