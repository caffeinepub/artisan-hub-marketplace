import { useGetCallerUserRole, useIsStripeConfigured, useGetAllProducts, useDeleteProduct } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2, AlertCircle, Trash2 } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import StripeSetup from '../components/StripeSetup';
import CommissionSettings from '../components/CommissionSettings';
import AdminStripeAccountSetup from '../components/AdminStripeAccountSetup';
import type { Product } from '../backend';

export default function AdminDashboard() {
  const { data: userRole, isLoading: roleLoading } = useGetCallerUserRole();
  const { data: stripeConfigured, isLoading: stripeLoading } = useIsStripeConfigured();
  const { data: allProducts = [], isLoading: productsLoading } = useGetAllProducts();
  const deleteProduct = useDeleteProduct();
  const navigate = useNavigate();

  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  useEffect(() => {
    if (!roleLoading && userRole !== 'admin') {
      navigate({ to: '/products' });
    }
  }, [userRole, roleLoading, navigate]);

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;

    try {
      await deleteProduct.mutateAsync(productToDelete.id);
      toast.success('Product deleted successfully');
      setProductToDelete(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete product');
      console.error('Delete product error:', error);
    }
  };

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

      <div className="grid gap-6 md:grid-cols-2 mb-6">
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
      <div className="mb-6">
        <AdminStripeAccountSetup />
      </div>

      {/* Product Management Section */}
      <Card>
        <CardHeader>
          <CardTitle>Product Management</CardTitle>
          <CardDescription>
            View and manage all products across all artists
          </CardDescription>
        </CardHeader>
        <CardContent>
          {productsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : allProducts.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No products available yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Artist ID</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {product.artistId.substring(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{product.categoryName}</Badge>
                    </TableCell>
                    <TableCell>${(Number(product.price) / 100).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={product.productType === 'product' ? 'default' : 'secondary'}>
                        {product.productType}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setProductToDelete(product)}
                        disabled={deleteProduct.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Product Confirmation Dialog */}
      <AlertDialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{productToDelete?.name}</strong> by artist{' '}
              <strong>{productToDelete?.artistId.substring(0, 8)}...</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteProduct.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProduct}
              disabled={deleteProduct.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteProduct.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Product'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
