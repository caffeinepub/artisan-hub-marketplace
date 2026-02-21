import React, { useState } from 'react';
import { Heart, AlertCircle } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Product } from '../backend';
import { useGetArtist, useGetAdminStripeAccountId } from '../hooks/useQueries';
import { useCreateCheckoutSession } from '../hooks/useCreateCheckoutSession';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { toast } from 'sonner';

interface DonationCardProps {
  donation: Product;
}

export default function DonationCard({ donation }: DonationCardProps) {
  const [open, setOpen] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const { data: artist } = useGetArtist(donation.artistId);
  const { data: adminAccountId } = useGetAdminStripeAccountId();
  const { data: userProfile } = useGetCallerUserProfile();
  const createCheckoutSession = useCreateCheckoutSession();

  const suggestedAmount = Number(donation.price) / 100;

  // Check payment configuration
  const hasArtistPayment = !!artist?.stripeAccountId || !!userProfile?.stripeApiKey;
  const hasAdminPayment = !!adminAccountId;
  const isPaymentConfigured = hasArtistPayment && hasAdminPayment;

  const handleDonate = async (amount?: number) => {
    // Validate payment configuration
    if (!hasAdminPayment) {
      toast.error('Platform payment configuration is incomplete. Please contact support.');
      return;
    }

    if (!hasArtistPayment) {
      toast.error('Artist payment configuration is incomplete. Donations cannot be accepted at this time.');
      return;
    }

    try {
      const donationAmount = amount || parseFloat(customAmount);
      if (!donationAmount || donationAmount < 1) {
        toast.error('Please enter a valid amount (minimum $1.00)');
        return;
      }

      const session = await createCheckoutSession.mutateAsync([
        {
          productName: donation.name,
          productDescription: donation.description,
          priceInCents: BigInt(Math.round(donationAmount * 100)),
          quantity: BigInt(1),
          currency: 'usd',
        },
      ]);

      if (!session?.url) throw new Error('Stripe session missing url');
      window.location.href = session.url;
    } catch (error) {
      console.error('Donation failed:', error);
      toast.error('Failed to process donation. Please try again.');
    }
  };

  return (
    <>
      <Card className="flex flex-col h-full hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between gap-2 mb-2">
            <Badge variant="secondary" className="bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-100">
              <Heart className="mr-1 h-3 w-3" />
              Donation
            </Badge>
            <div className="flex gap-1">
              <Badge variant="outline">{donation.categoryName}</Badge>
              {!isPaymentConfigured && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge variant="secondary" className="gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Setup Pending
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Payment configuration incomplete</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
          <CardTitle className="text-xl">{donation.name}</CardTitle>
        </CardHeader>

        <CardContent className="flex-1">
          <p className="text-sm text-muted-foreground mb-4">{donation.description}</p>

          {artist && (
            <Link
              to="/store/$artistId"
              params={{ artistId: donation.artistId }}
              className="text-sm text-primary hover:underline"
            >
              by {artist.name}
            </Link>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-2">
          <div className="w-full text-center mb-2">
            <p className="text-sm text-muted-foreground">Suggested amount</p>
            <p className="text-2xl font-bold">${suggestedAmount.toFixed(2)}</p>
          </div>

          {isPaymentConfigured ? (
            <>
              <Button onClick={() => handleDonate(suggestedAmount)} className="w-full" size="lg">
                <Heart className="mr-2 h-4 w-4" />
                Donate ${suggestedAmount.toFixed(2)}
              </Button>

              <Button onClick={() => setOpen(true)} variant="outline" className="w-full">
                Choose Custom Amount
              </Button>
            </>
          ) : (
            <Button disabled className="w-full gap-2" variant="outline">
              <AlertCircle className="h-4 w-4" />
              Payment Setup Pending
            </Button>
          )}
        </CardFooter>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Support {artist?.name}</DialogTitle>
            <DialogDescription>{donation.description}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="customAmount">Donation Amount (USD)</Label>
              <Input
                id="customAmount"
                type="number"
                step="0.01"
                min="1"
                placeholder="Enter amount"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Minimum donation: $1.00</p>
            </div>

            <Button
              onClick={() => handleDonate()}
              disabled={createCheckoutSession.isPending}
              className="w-full"
            >
              {createCheckoutSession.isPending ? 'Processing...' : 'Donate'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
