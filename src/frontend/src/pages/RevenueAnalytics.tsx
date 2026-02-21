import { useGetCallerUserRole } from '../hooks/useQueries';
import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { Loader2, DollarSign, TrendingUp, Users, ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function RevenueAnalytics() {
  const { data: userRole, isLoading: roleLoading } = useGetCallerUserRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (!roleLoading && userRole !== 'admin') {
      navigate({ to: '/products' });
    }
  }, [userRole, roleLoading, navigate]);

  if (roleLoading) {
    return (
      <div className="container py-20 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (userRole !== 'admin') {
    return null;
  }

  // Placeholder data - in a real app, this would come from backend
  const metrics = {
    totalRevenue: 0,
    adminCommission: 0,
    artistEarnings: 0,
    transactionCount: 0,
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Revenue Analytics</h1>
        <p className="text-muted-foreground">
          Track platform revenue and commission breakdown
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">All-time platform revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin Commission</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.adminCommission.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">10% platform fee</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Artist Earnings</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${metrics.artistEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">90% to artists</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.transactionCount}</div>
            <p className="text-xs text-muted-foreground">Total sales</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue Breakdown</CardTitle>
          <CardDescription>
            Commission split between platform and artists
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Platform Commission (10%)</span>
                <span className="text-sm text-muted-foreground">${metrics.adminCommission.toFixed(2)}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: '10%' }} />
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Artist Earnings (90%)</span>
                <span className="text-sm text-muted-foreground">${metrics.artistEarnings.toFixed(2)}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-accent" style={{ width: '90%' }} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
