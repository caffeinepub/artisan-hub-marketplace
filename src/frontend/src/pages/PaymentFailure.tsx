import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle } from 'lucide-react';

export default function PaymentFailure() {
  return (
    <div className="container py-20">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
              <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-2xl">Payment Failed</CardTitle>
            <CardDescription>
              Your payment could not be processed. Please try again.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center text-sm text-muted-foreground">
            <p>
              If you continue to experience issues, please contact support or try a different payment method.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center gap-4">
            <Link to="/products">
              <Button variant="outline">Back to Marketplace</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
