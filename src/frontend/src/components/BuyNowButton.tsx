import { Button } from '@/components/ui/button';
import { useCreateCheckoutSession } from '../hooks/useCreateCheckoutSession';
import { Loader2, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import type { Product } from '../backend';

interface BuyNowButtonProps {
  product: Product;
}

export default function BuyNowButton({ product }: BuyNowButtonProps) {
  const createCheckoutSession = useCreateCheckoutSession();

  const handleBuyNow = async () => {
    try {
      const shoppingItem = {
        productName: product.name,
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
