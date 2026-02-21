import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useGetCallerUserProfile, useSaveCallerUserProfile, useGetArtist } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

export default function PaymentMethodSetup() {
  const { identity } = useInternetIdentity();
  const principalId = identity?.getPrincipal().toString();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: artist } = useGetArtist(principalId || '');
  const saveProfile = useSaveCallerUserProfile();

  const [paymentMethod, setPaymentMethod] = useState<'api-key' | 'stripe-connect'>('stripe-connect');
  const [stripeApiKey, setStripeApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);

  const hasStripeApiKey = !!userProfile?.stripeApiKey;
  const hasStripeConnect = !!artist?.stripeAccountId;
  const hasAnyPaymentMethod = hasStripeApiKey || hasStripeConnect;

  const handleSaveApiKey = async () => {
    if (!stripeApiKey.trim()) {
      toast.error('Please enter a valid Stripe API key');
      return;
    }

    if (!userProfile) {
      toast.error('User profile not found');
      return;
    }

    try {
      await saveProfile.mutateAsync({
        ...userProfile,
        stripeApiKey: stripeApiKey.trim(),
      });
      toast.success('Stripe API key saved successfully');
      setStripeApiKey('');
    } catch (error) {
      console.error('Failed to save API key:', error);
      toast.error('Failed to save API key. Please try again.');
    }
  };

  const handleRemoveApiKey = async () => {
    if (!confirm('Are you sure you want to remove your Stripe API key?')) return;

    if (!userProfile) return;

    try {
      await saveProfile.mutateAsync({
        ...userProfile,
        stripeApiKey: undefined,
      });
      toast.success('Stripe API key removed');
    } catch (error) {
      console.error('Failed to remove API key:', error);
      toast.error('Failed to remove API key. Please try again.');
    }
  };

  const handleStripeConnect = () => {
    toast.info('Stripe Connect onboarding will be available soon');
    // TODO: Implement Stripe Connect onboarding flow
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Configuration</CardTitle>
        <CardDescription>
          Configure how you receive payments from sales. At least one payment method is required.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Payment Status Overview */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Current Status</h3>
          <div className="flex flex-wrap gap-2">
            {hasStripeApiKey && (
              <Badge variant="default" className="gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Stripe API Key Configured
              </Badge>
            )}
            {hasStripeConnect && (
              <Badge variant="default" className="gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Stripe Connect Active
              </Badge>
            )}
            {!hasAnyPaymentMethod && (
              <Badge variant="destructive" className="gap-1">
                <AlertCircle className="h-3 w-3" />
                No Payment Method Configured
              </Badge>
            )}
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="space-y-4">
          <Label>Choose Payment Method</Label>
          <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as 'api-key' | 'stripe-connect')}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="stripe-connect" id="stripe-connect" />
              <Label htmlFor="stripe-connect" className="font-normal cursor-pointer">
                Stripe Connect (Recommended)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="api-key" id="api-key" />
              <Label htmlFor="api-key" className="font-normal cursor-pointer">
                Stripe API Key
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Stripe Connect Option */}
        {paymentMethod === 'stripe-connect' && (
          <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
            <div>
              <h4 className="font-medium mb-2">Stripe Connect</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Securely connect your Stripe account to receive payments. This is the recommended method.
              </p>
            </div>
            
            {hasStripeConnect ? (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">Connected to Stripe</span>
              </div>
            ) : (
              <Button onClick={handleStripeConnect} className="w-full">
                Connect with Stripe
              </Button>
            )}
          </div>
        )}

        {/* Stripe API Key Option */}
        {paymentMethod === 'api-key' && (
          <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
            <div>
              <h4 className="font-medium mb-2">Stripe API Key</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Enter your Stripe secret key. Keep this secure and never share it publicly.
              </p>
            </div>

            {hasStripeApiKey ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium">API Key Configured</span>
                </div>
                <Button onClick={handleRemoveApiKey} variant="destructive" size="sm">
                  Remove API Key
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="stripeApiKey">Stripe Secret Key</Label>
                  <div className="relative">
                    <Input
                      id="stripeApiKey"
                      type={showApiKey ? 'text' : 'password'}
                      placeholder="sk_live_..."
                      value={stripeApiKey}
                      onChange={(e) => setStripeApiKey(e.target.value)}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Format: sk_live_... or sk_test_...
                  </p>
                </div>
                <Button 
                  onClick={handleSaveApiKey} 
                  disabled={saveProfile.isPending || !stripeApiKey.trim()}
                  className="w-full"
                >
                  {saveProfile.isPending ? 'Saving...' : 'Save API Key'}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Warning if no payment method */}
        {!hasAnyPaymentMethod && (
          <div className="p-4 border border-destructive/50 rounded-lg bg-destructive/10">
            <div className="flex gap-2">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-destructive">Payment Configuration Required</p>
                <p className="text-xs text-muted-foreground">
                  You must configure at least one payment method before you can receive payments from sales.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
