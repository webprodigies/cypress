import { SubscriptionModalProvider } from '@/lib/providers/subscription-modal-provider';
import { getActiveProductsWithPrices } from '@/lib/supabase/queries';
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  params: any;
}

/*
We do not authenticate in this page because Nextjs does not RE RENDER the page during navigation. What this means is
when the request is first made to dashboard for example, the layout is pre rendered on the server and the dashboard 
component next and the dashboard com is wrapped in the layout component and is sent to the client. 
However when we navigate to a different link from the dashboard the layout page is not re rendered on the client because
it is a shared layout. Instead is stays on the client un rendered and the new route is rendered on the server served to the client so the 
search param is going to be outdates in this layout component because it is not rerendered. 
*/

const Layout: React.FC<LayoutProps> = async ({ children, params }) => {
  const { data: products, error } = await getActiveProductsWithPrices();
  if (error) throw new Error();

  return (
    <main className="flex overflow-hidden h-screen">
      <SubscriptionModalProvider products={products}>
        {children}
      </SubscriptionModalProvider>
    </main>
  );
};

export default Layout;
