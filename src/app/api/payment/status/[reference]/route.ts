import { NextResponse } from "next/server";

/**
 * API endpoint to check payment status and prepare receipt data
 * @param request - The incoming request
 * @param context - URL parameters including payment reference
 * @returns NextResponse with payment status and order details
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ reference: string }> }
) {
  try {
    const params = await context.params;
    const { reference } = params;
    
    if (!reference) {
      return NextResponse.json(
        { error: "Payment reference is required" },
        { status: 400 }
      );
    }
    
    // Fetch payment status from backend
    const response = await fetch(
      `${process.env.API_ENDPOINT}/api/payment/verify/${reference}`,   
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.error("Failed to verify payment:", await response.text());
      return NextResponse.json(
        { error: "Failed to verify payment status" },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // If payment was successful, prepare data for receipt
    if (data.status === "success") {
      // Fetch order details using the order ID from payment data
      const orderId = data.data.metadata?.order_id;
      if (!orderId) {
        return NextResponse.json(
          { error: "Order ID not found in payment data" },
          { status: 400 }
        );
      }
      
      const orderResponse = await fetch(
          `${process.env.API_ENDPOINT}/marketplace/orders/${orderId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store",
        }
      );
      
      if (!orderResponse.ok) {
        console.error("Failed to fetch order details:", await orderResponse.text());
        return NextResponse.json(
          { error: "Failed to fetch order details" },
          { status: orderResponse.status }
        );
      }
      
      const orderData = await orderResponse.json();
      
      // Format receipt data based on payment method
      const receiptData = {
        orderId,
        reference: data.data.reference,
        amount: data.data.amount / 100, // Paystack returns amount in kobo/cents
        customer: {
          name: data.data.customer?.name || orderData.customer?.name,
          email: data.data.customer?.email || orderData.customer?.email,
          phone: data.data.customer?.phone || orderData.customer?.phone,
        },
        items: orderData.items || [],
        paymentMethod: data.data.channel, // card, bank_transfer, ussd, mpesa, etc.
        transactionDate: new Date(data.data.paid_at || Date.now()).toISOString(),
        status: data.data.status,
        currency: data.data.currency,
        additionalDetails: {},
      };
      
      // Add payment method specific details
      if (data.data.channel === "mpesa") {
        receiptData.additionalDetails = {
          mpesaReference: data.data.authorization?.reference,
          phoneNumber: data.data.authorization?.receiver || data.data.customer?.phone,
        };
      } else if (data.data.channel === "card") {
        receiptData.additionalDetails = {
          cardType: data.data.authorization?.card_type,
          last4: data.data.authorization?.last4,
          bank: data.data.authorization?.bank,
        };
      }
      
      // Store receipt data in localStorage via client-side script
      return NextResponse.json({
        status: "success",
        message: "Payment verified successfully",
        data: receiptData,
        storeReceipt: true, // Flag for client to store in localStorage
      });
    }
    
    // If payment is pending or failed
    return NextResponse.json({
      status: data.status,
      message: data.message || "Payment verification completed",
      data: data.data,
      storeReceipt: false,
    });
    
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while verifying payment" },
      { status: 500 }
    );
  }
}

