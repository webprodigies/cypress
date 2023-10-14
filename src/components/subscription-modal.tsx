'use client';
import { Button } from '@/components/ui/button';
import { useSubscriptionModal } from '@/lib/providers/subscription-modal-provider';
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from './ui/use-toast';
import { Price, ProductWithPrice } from '@/lib/supabase/supabase.types';
import { postData } from '@/lib/util/helpers';
import { getStripe } from '@/lib/stripe/stripeClient';
import Loader from './loader';

interface SubscriptionModalProps {
  products: ProductWithPrice[];
}

const formatPrice = (price: Price) => {
  const priceString = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: price.currency || undefined,
    minimumFractionDigits: 0,
  }).format((price?.unitAmount || 0) / 100);

  return priceString;
};

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ products }) => {
  const { open, setOpen, subscription, user } = useSubscriptionModal();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const onClickContinue = async (price: Price) => {
    try {
      setIsLoading(true);
      if (!user) {
        toast({ title: 'You must be logged in' });
        setIsLoading(false);
        return;
      }
      if (subscription) {
        toast({ title: 'Already on a paid plan' });
        setIsLoading(false);
        return;
      }
      const { sessionId } = await postData({
        url: '/api/create-checkout-session',
        data: { price },
      });
      console.log('getting stripe');
      const stripe = await getStripe();
      stripe?.redirectToCheckout({ sessionId });
    } catch (error) {
      toast({ title: 'Oppse! Something went wrong.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      {subscription ? (
        <DialogContent>Already on a paid plan!</DialogContent>
      ) : (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upgrade to Pro Plan</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            To access Pro features you need to have a paid plan.
          </DialogDescription>
          {products.length
            ? products.map((product) => (
                <div
                  className="flex  justify-between items-center"
                  key={product.id}
                >
                  {product.prices?.map((price) => (
                    <React.Fragment key={price.id}>
                      <b className="text-3xl text-foreground">
                        {formatPrice(price)} / <small>{price.interval}</small>
                      </b>
                      <Button
                        disabled={isLoading}
                        onClick={() => onClickContinue(price)}
                      >
                        {isLoading ? <Loader /> : 'Upgrade ✨'}
                      </Button>
                    </React.Fragment>
                  ))}
                </div>
              ))
            : 'No Products Available'}
        </DialogContent>
      )}
    </Dialog>
  );
};

export default SubscriptionModal;
