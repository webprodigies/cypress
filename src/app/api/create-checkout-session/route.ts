import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { stripe } from '@/lib/stripe';
import { getURL } from '@/lib/util/helpers';
import { createOrRetrieveCustomer } from '@/lib/stripe/adminTasks';

export async function POST(request: Request) {
  // Extract and destructure relevant data from the incoming request
  const { price, quantity = 1, metadata = {} } = await request.json();

  try {
    // Create a client for route handlers with provided cookies
    const supabase = createRouteHandlerClient({
      cookies,
    });

    // Fetch user information from Supabase authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Create or retrieve a customer in the Stripe system, associated with the user
    const customer = await createOrRetrieveCustomer({
      email: user?.email || '',
      uuid: user?.id || '',
    });

    // Create a Stripe checkout session for subscription purchase
    const session = await stripe.checkout.sessions.create({
      //@ts-ignore
      payment_method_types: ['card'],
      billing_address_collection: 'required',
      customer,
      line_items: [
        {
          price: price.id,
          quantity,
        },
      ],
      mode: 'subscription',
      allow_promotion_codes: true,
      subscription_data: {
        trial_from_plan: true,
        metadata,
      },
      success_url: `${getURL()}/dashboard`, // Redirect URL on successful payment
      cancel_url: `${getURL()}/dashboard`, // Redirect URL on payment cancellation
    });

    // Respond with the session ID for the client to initiate the Stripe checkout
    return NextResponse.json({ sessionId: session.id });
  } catch (err: any) {
    // Log any errors and respond with an internal server error if encountered
    console.log(err);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
