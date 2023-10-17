import { stripe } from '@/lib/stripe';
import { createOrRetrieveCustomer } from '@/lib/stripe/adminTasks';
import { getURL } from '@/lib/util/helpers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Create a client for route handlers with provided cookies
    const supabase = createRouteHandlerClient({ cookies });

    // Fetch user information from Supabase authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Check if a user exists; throw an error if not found
    if (!user) throw new Error('Could not find the user');

    // Create or retrieve a customer in the Stripe system, associated with the user
    const customer = await createOrRetrieveCustomer({
      email: user.email || '',
      uuid: user.id || '',
    });

    // Check if a customer exists; throw an error if not found
    if (!customer) throw new Error('Could not get the customer');

    // Create a billing portal session with Stripe and get the URL for the billing portal
    const { url } = await stripe.billingPortal.sessions.create({
      customer,
      return_url: `${getURL()}/dashboard`, // Redirect URL after billing portal completion
    });

    // Respond with the billing portal URL for the client to access billing management
    return NextResponse.json({ url });
  } catch (error) {
    // Log any errors and respond with an internal server error if encountered
    console.log('ERROR', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
