import { useGetCallerUserRole, useIsStripeConfigured } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import StripeSetup from '../components/StripeSetup';
import CommissionSettings from '../components/CommissionSettings';
import AdminStripeAccountSetup from '../components/AdminStripeAccountSetup';

export default function AdminDashboard() {
  const { data: userRole, isLoading: roleLoading } = useGetCallerUserRole();
  const { data: stripeConfigured, isLoading: stripeLoading } = useIsStripeConfigured();
  const navigate = useNavigate();

  useEffect(() => {
    if (!roleLoading && userRole !== 'admin') {
      navigate({ to: '/products' });
    }
  }, [userRole, roleLoading, navigate]);

  if (roleLoading || stripeLoading) {
    return (
      <div className="container py-20 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (userRole !== 'admin') {
    return null;
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your marketplace settings and configuration
        </p>
      </div>

      {!stripeConfigured && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Stripe payment processing is not configured. Please set it up to enable payments.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Payment Configuration</CardTitle>
            <CardDescription>
              Configure Stripe payment processing for the marketplace
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StripeSetup />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Commission Settings</CardTitle>
            <CardDescription>
              Manage platform commission rate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CommissionSettings />
          </CardContent>
        </Card>
      </div>

      {/* Admin Stripe Account Setup */}
      <div className="mt-6">
        <AdminStripeAccountSetup />
      </div>
    </div>
  );
}
