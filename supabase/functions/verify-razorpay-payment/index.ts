/// <reference path="../_shared/deno-types.d.ts" />
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-razorpay-signature',
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET')
    
    if (!razorpayKeySecret) {
      throw new Error('Razorpay secret not configured')
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    if (req.method === 'POST') {
      const body = await req.text()
      const signature = req.headers.get('x-razorpay-signature')
      
      if (!signature) {
        throw new Error('Missing Razorpay signature')
      }

      // Verify webhook signature
      const expectedSignature = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(razorpayKeySecret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      ).then((key: CryptoKey) => 
        crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body))
      ).then((signature: ArrayBuffer) => 
        Array.from(new Uint8Array(signature))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('')
      )

      if (signature !== expectedSignature) {
        console.error('Invalid signature')
        throw new Error('Invalid signature')
      }

      // Parse webhook payload
      const payload = JSON.parse(body)
      const event = payload.event
      const paymentData = payload.payload.payment.entity

      console.log('Webhook received:', { event, paymentId: paymentData.id })

      if (event === 'payment.captured') {
        // Payment successful - update database
        const { order_id, id: payment_id, amount, status } = paymentData
        
        // Log payment success
        console.log('Payment captured:', {
          orderId: order_id,
          paymentId: payment_id,
          amount,
          status
        })

        // Here you would update your database based on the order_id
        // This depends on your specific implementation needs
        
        return new Response(
          JSON.stringify({ success: true, message: 'Payment processed' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Event received' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // Handle payment verification for frontend calls
    if (req.method === 'PUT') {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json()
      
      // Create signature for verification
      const text = `${razorpay_order_id}|${razorpay_payment_id}`
      
      const expectedSignature = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(razorpayKeySecret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      ).then((key: CryptoKey) => 
        crypto.subtle.sign('HMAC', key, new TextEncoder().encode(text))
      ).then((signature: ArrayBuffer) => 
        Array.from(new Uint8Array(signature))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('')
      )

      const isValid = expectedSignature === razorpay_signature

      if (isValid) {
        // Update order in database
        const { error: updateError } = await supabase
          .from('razorpay_orders')
          .update({
            razorpay_payment_id,
            verified: true,
            status: 'completed'
          })
          .eq('razorpay_order_id', razorpay_order_id)

        if (updateError) {
          console.error('Database update error:', updateError)
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          verified: isValid,
          payment_id: razorpay_payment_id,
          order_id: razorpay_order_id
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    throw new Error('Method not allowed')

  } catch (error) {
    console.error('Error in payment verification:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Verification failed'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})