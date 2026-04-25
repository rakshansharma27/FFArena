// Configure CORS so your frontend can securely talk to this function
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Notice we added ": Request" here to fix your 'req' error!
Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests from the browser
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Get the data sent from tournament.html
    const { tournament_id, user_id, amount, owner_account_id } = await req.json()

    // 2. Calculate the split (Amount is in paise, so multiply by 100)
    const totalAmountPaise = amount * 100;
    const platformFeePaise = 10 * 100; // ₹10 platform fee
    const ownerAmountPaise = totalAmountPaise - platformFeePaise;

    // 3. Get Razorpay API Keys SECURELY from the vault
    // Ignore the red squiggly line under Deno here!
    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID');
    const razorpayKeySecret = Deno.env.get('RAZORPAY_KEY_SECRET');

    if (!razorpayKeyId || !razorpayKeySecret) {
      throw new Error("Razorpay API keys are missing from the server environment.");
    }

    // Create the Basic Auth token for Razorpay
    const basicAuth = btoa(`${razorpayKeyId}:${razorpayKeySecret}`);

    // 4. Build the Razorpay Payload
    const orderPayload: any = {
      amount: totalAmountPaise,
      currency: "INR",
      receipt: `rcpt_${tournament_id}_${user_id}`,
    };

    if (owner_account_id && owner_account_id.trim() !== '') {
      orderPayload.transfers = [
        {
          account: owner_account_id,
          amount: ownerAmountPaise, 
          currency: "INR",
          notes: {
            branch: "FF Arena Registration",
            name: `Tournament ${tournament_id}`
          },
          linked_account_notes: ["branch"],
          on_hold: 0,
          on_hold_until: 0
        }
      ];
    }

    // 5. Call Razorpay API to create the order
    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderPayload)
    });

    const orderData = await razorpayResponse.json();

    if (!razorpayResponse.ok) {
      throw new Error(`Razorpay Error: ${orderData.error?.description || 'Unknown error'}`);
    }

    // 6. Send the Order ID back to your frontend
    return new Response(
      JSON.stringify({ razorpay_order_id: orderData.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})