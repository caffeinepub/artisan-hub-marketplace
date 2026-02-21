import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useGetAdminStripeAccountId, useSetAdminStripeAccountId } from '../hooks/useQueries';

export default function AdminStripeAccountSetup() {
  const { data: currentAccountId, isLoading } = useGetAdminStripeAccountId();
  const setAdminAccountId = useSetAdminStripeAccountId();
  const [accountId, setAccountId] = useState('');

  useEffect(() => {
    if (currentAccountId) {
      setAccountId(currentAccountId);
    }
  }, [currentAccountId]);

  const validateAccountId = (id: string): boolean => {
    // Stripe account IDs start with "acct_"
    return id.trim().startsWith('acct_') && id.trim().length > 5;
  };

  const handleSave = async () => {
    if (!accountId.trim()) {
      toast.error('Please enter a Stripe account ID');
      return;
    }

    if (!validateAccountId(accountId)) {
      toast.error('Invalid Stripe account ID format. Must start with "acct_"');
      return;
    }

    try {
      await setAdminAccountId.mutateAsync(accountId.trim());
      toast.success('Admin Stripe account ID saved successfully');
    } catch (error) {
      console.error('Failed to save account ID:', error);
      toast.error('Failed to save account ID. Please try again.');
    }
  };

  const isConfigured = !!currentAccountId;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-6">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform Payment Configuration</CardTitle>
        <CardDescription>
          Configure your Stripe account to receive platform commission from sales
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Badge */}
        <div className="flex items-center gap-2">
          {isConfigured ? (
            <Badge variant="default" className="gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Account Configured
            </Badge>
          ) : (
            <Badge variant="destructive" className="gap-1">
              <AlertCircle className="h-3 w-3" />
              Not Configured
            </Badge>
          )}
        </div>

        {/* Account ID Input */}
        <div className="space-y-2">
          <Label htmlFor="adminAccountId">Stripe Account ID</Label>
          <Input
            id="adminAccountId"
            type="text"
            placeholder="acct_XXXXXXXXXX"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Your Stripe account ID (format: acct_XXXXXXXXXX)
          </p>
        </div>

        {/* Save Button */}
        <Button 
          onClick={handleSave} 
          disabled={setAdminAccountId.isPending || !accountId.trim()}
          className="w-full"
        >
          {setAdminAccountId.isPending ? 'Saving...' : isConfigured ? 'Update Account ID' : 'Save Account ID'}
        </Button>

        {/* Warning if not configured */}
        {!isConfigured && (
          <div className="p-4 border border-destructive/50 rounded-lg bg-destructive/10">
            <div className="flex gap-2">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-destructive">Configuration Required</p>
                <p className="text-xs text-muted-foreground">
                  Platform commission payments cannot be processed until you configure your Stripe account ID.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
