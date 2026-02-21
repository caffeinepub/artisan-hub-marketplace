import { useState } from 'react';
import { useIsStripeConfigured, useSetStripeConfiguration } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, Settings } from 'lucide-react';
import { toast } from 'sonner';

export default function StripeSetup() {
  const { data: isConfigured, isLoading } = useIsStripeConfigured();
  const setConfiguration = useSetStripeConfiguration();
  const [showForm, setShowForm] = useState(false);
  const [secretKey, setSecretKey] = useState('');
  const [countries, setCountries] = useState('US,CA,GB');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!secretKey.trim()) {
      toast.error('Please enter your Stripe secret key');
      return;
    }

    const allowedCountries = countries.split(',').map(c => c.trim()).filter(c => c);
    
    if (allowedCountries.length === 0) {
      toast.error('Please enter at least one country code');
      return;
    }

    try {
      await setConfiguration.mutateAsync({
        secretKey: secretKey.trim(),
        allowedCountries,
      });
      toast.success('Stripe configuration saved successfully!');
      setShowForm(false);
      setSecretKey('');
    } catch (error) {
      toast.error('Failed to save Stripe configuration');
      console.error('Stripe configuration error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (isConfigured && !showForm) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <Badge variant="secondary">Configured</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Stripe payment processing is active and ready to accept payments.
        </p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowForm(true)}
          className="gap-2"
        >
          <Settings className="h-4 w-4" />
          Update Configuration
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="secretKey">Stripe Secret Key *</Label>
        <Input
          id="secretKey"
          type="password"
          value={secretKey}
          onChange={(e) => setSecretKey(e.target.value)}
          placeholder="sk_test_..."
          required
        />
        <p className="text-xs text-muted-foreground">
          Your Stripe secret key (starts with sk_test_ or sk_live_)
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="countries">Allowed Countries *</Label>
        <Input
          id="countries"
          value={countries}
          onChange={(e) => setCountries(e.target.value)}
          placeholder="US,CA,GB"
          required
        />
        <p className="text-xs text-muted-foreground">
          Comma-separated country codes (e.g., US,CA,GB,AU)
        </p>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={setConfiguration.isPending}>
          {setConfiguration.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Configuration'
          )}
        </Button>
        {showForm && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setShowForm(false)}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
