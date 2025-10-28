/// <reference path="../_shared/deno-types.d.ts" />
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get environment variables
    const razorpayKeyId = Deno.env.get('VITE_RAZORPAY_KEY_ID') || Deno.env.get('RAZORPAY_KEY_ID')
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET')
    
    if (!razorpayKeyId || !razorpayKeySecret) {
      throw new Error('Razorpay credentials not configured')
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get request body
    const { amount, currency = 'INR', receipt, notes = {}, user_id, film_id, submission_id, payment_type } = await req.json()

    if (!amount || amount <= 0) {
      throw new Error('Invalid amount provided')
    }

    if (!user_id || !payment_type) {
      throw new Error('Missing required fields: user_id, payment_type')
    }

    // Create Razorpay order
    const orderData = {
      amount: Math.round(amount), // Amount in paise
      currency,
      receipt: receipt || `order_${Date.now()}`,
      notes
    }

    // Create Basic Auth header for Razorpay API
    const auth = btoa(`${razorpayKeyId}:${razorpayKeySecret}`)
    
    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData)
    })

    if (!razorpayResponse.ok) {
      const errorData = await razorpayResponse.text()
      console.error('Razorpay API Error:', errorData)
      throw new Error(`Razorpay API error: ${razorpayResponse.status}`)
    }

    const order = await razorpayResponse.json()

    // Store order in database
    const { error: dbError } = await supabase
      .from('razorpay_orders')
      .insert({
        razorpay_order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
        status: order.status,
        notes: order.notes || {},
        user_id,
        film_id,
        submission_id,
        payment_type
      })

    if (dbError) {
      console.error('Database error:', dbError)
      throw new Error('Failed to store order in database')
    }

    // Log the order creation for audit purposes
    console.log('Order created:', {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt
    })

    return new Response(
      JSON.stringify({
        success: true,
        order: {
          id: order.id,
          amount: order.amount,
          currency: order.currency,
          receipt: order.receipt,
          status: order.status,
          created_at: order.created_at
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error creating Razorpay order:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create order'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
