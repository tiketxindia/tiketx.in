// Razorpay integration utility with server-side order creation
// Uses secure server-side order creation and payment verification

import { supabase } from '@/integrations/supabase/client';

// TypeScript: declare Razorpay on window
declare global {
  interface Window {
    Razorpay?: any;
  }
}

export interface RazorpayOptions {
  amount: number;
  name: string;
  description: string;
  receipt?: string;
  notes?: Record<string, any>;
  user_id: string;
  film_id?: string;
  submission_id?: string;
  payment_type: 'ticket' | 'onboarding';
  onSuccess: (response: any) => void;
  onFailure?: (reason: string) => void;
  onVerificationStart?: () => void;
}

export async function openRazorpayModal({ 
  amount, 
  name, 
  description, 
  receipt, 
  notes = {}, 
  user_id,
  film_id,
  submission_id,
  payment_type,
  onSuccess, 
  onFailure,
  onVerificationStart
}: RazorpayOptions) {
  const key = import.meta.env.VITE_RAZORPAY_KEY_ID;
  if (!key || key === 'your_razorpay_key_here') {
    const error = 'Payment service is temporarily unavailable. Please try again later or contact support.';
    if (onFailure) onFailure(error);
    return;
  }

  try {
    // Get current session for authenticated requests
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('No active session. Please log in to continue.');
    }
    
    // Get Supabase configuration from environment variables
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    
    if (!supabaseUrl) {
      throw new Error('Supabase URL configuration missing. Please check environment variables.');
    }
    
    console.log('Making payment request with user:', session.user.id);
    
    // Step 1: Create order on server
    const orderResponse = await fetch(`${supabaseUrl}/functions/v1/create-razorpay-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        amount,
        currency: 'INR',
        receipt: receipt || `receipt_${Date.now()}`,
        notes: {
          ...notes,
          name,
          description
        },
        user_id,
        film_id,
        submission_id,
        payment_type
      })
    })

    console.log('Order response status:', orderResponse.status);
    console.log('Order response headers:', Object.fromEntries(orderResponse.headers.entries()));
    
    if (!orderResponse.ok) {
      const errorText = await orderResponse.text();
      console.error('Order creation failed with status:', orderResponse.status, 'Response:', errorText);
      throw new Error(`Server returned ${orderResponse.status}: ${errorText}`);
    }

    const orderData = await orderResponse.json();
    
    if (!orderData.success) {
      console.error('Order creation failed:', orderData);
      throw new Error(orderData.error || 'Failed to create order');
    }

    console.log('Order created successfully:', orderData);
    const order = orderData.order;

    // Step 2: Load Razorpay script if not already loaded
    if (!window.Razorpay) {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });
    }

    // Step 3: Open Razorpay modal with server-generated order
    const options = {
      key,
      amount: order.amount,
      currency: order.currency,
      name,
      description,
      order_id: order.id,
      handler: async function (response: any) {
        try {
          // Show verification loading state
          if (onVerificationStart) onVerificationStart();
          
          // Step 4: Verify payment on server
          const verificationResponse = await fetch(`${supabaseUrl}/functions/v1/verify-razorpay-payment`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            })
          });

          const verificationData = await verificationResponse.json();
          
          if (verificationData.success && verificationData.verified) {
            // Payment verified successfully
            onSuccess({
              ...response,
              verified: true,
              order_id: order.id,
              order_receipt: order.receipt
            });
          } else {
            throw new Error('Payment verification failed');
          }
        } catch (error) {
          console.error('Payment verification error:', error);
          if (onFailure) onFailure('We couldn\'t verify your payment. Please try again or contact support if the issue persists.');
        }
      },
      modal: {
        ondismiss: function () {
          if (onFailure) onFailure('You cancelled the payment. No charges were made to your account.');
        }
      },
      theme: {
        color: '#6366f1',
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();

  } catch (error) {
    console.error('Error opening Razorpay modal:', error);
    const errorMessage = error instanceof Error ? error.message : 'We\'re experiencing technical difficulties. Please try again in a moment.';
    if (onFailure) onFailure(errorMessage);
  }
} 