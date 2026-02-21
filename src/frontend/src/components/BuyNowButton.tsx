import { Button } from '@/components/ui/button';
import { useCreateCheckoutSession } from '../hooks/useCreateCheckoutSession';
import { Loader2, ShoppingCart, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { Product } from '../backend';
import { useGetArtist, useGetAdminStripeAccountId } from '../hooks/useQueries';
import { useGetCallerUserProfile } from '../hooks/useQueries';

interface BuyNowButtonProps {
  product: Product;
}

export default function BuyNowButton({ product }: BuyNowButtonProps) {
  const createCheckoutSession = useCreateCheckoutSession();
  const { data: artist } = useGetArtist(product.artistId);
  const { data: adminAccountId } = useGetAdminStripeAccountId();
  const { data: userProfile } = useGetCallerUserProfile();

  // Check if payment configuration is complete
  const hasArtistPayment = !!artist?.stripeAccountId || !!userProfile?.stripeApiKey;
  const hasAdminPayment = !!adminAccountId;
  const isPaymentConfigured = hasArtistPayment && hasAdminPayment;

  const handleBuyNow = async () => {
    // Validate payment configuration before checkout
    if (!hasAdminPayment) {
      toast.error('Platform payment configuration is incomplete. Please contact support.');
      return;
    }

    if (!hasArtistPayment) {
      toast.error('Artist payment configuration is incomplete. This product cannot be purchased at this time.');
      return;
    }

    try {
      const shoppingItem = {
        productName: product.id,
        productDescription: product.description,
        priceInCents: product.price,
        currency: 'usd',
        quantity: BigInt(1),
      };

      const session = await createCheckoutSession.mutateAsync([shoppingItem]);
      
      if (!session?.url) {
        throw new Error('Stripe session missing url');
      }

      window.location.href = session.url;
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to initiate checkout. Please try again.');
    }
  };

  if (!isPaymentConfigured) {
    return (
      <Button 
        disabled
        className="w-full gap-2"
        variant="outline"
      >
        <AlertCircle className="h-4 w-4" />
        Payment Setup Pending
      </Button>
    );
  }

  return (
    <Button 
      onClick={handleBuyNow} 
      disabled={createCheckoutSession.isPending}
      className="w-full gap-2"
    >
      {createCheckoutSession.isPending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <ShoppingCart className="h-4 w-4" />
          Buy Now
        </>
      )}
    </Button>
  );
}
