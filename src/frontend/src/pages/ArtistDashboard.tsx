import React, { useState } from 'react';
import { Pencil, Trash2, Settings, Package, Heart } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ProductType } from '../backend';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  useGetCallerUserProfile,
  useGetArtist,
  useGetProductsFiltered,
  useAddProduct,
  useUpdateProduct,
  useDeleteProduct,
  useGetPlatformCommissionRate,
} from '../hooks/useQueries';
import BulkImageUpload from '../components/BulkImageUpload';
import DonationForm from '../components/DonationForm';
import StoreSettingsForm from '../components/StoreSettingsForm';

export default function ArtistDashboard() {
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const principalId = identity?.getPrincipal().toString();

  const { data: artist } = useGetArtist(principalId || '');
  const { data: products = [] } = useGetProductsFiltered(artist?.id || '');
  const { data: commissionRate } = useGetPlatformCommissionRate();

  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [showStoreSettings, setShowStoreSettings] = useState(false);
  const [activeTab, setActiveTab] = useState('products');

  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const artistProducts = products.filter((p) => p.productType === ProductType.product);
  const artistDonations = products.filter((p) => p.productType === ProductType.donation);

  const handleSaveProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const productData = {
      id: editingProduct?.id || `product-${Date.now()}`,
      artistId: artist!.id,
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      price: BigInt(Math.round(parseFloat(formData.get('price') as string) * 100)),
      categoryName: formData.get('categoryName') as string,
      productType: editingProduct?.productType || ProductType.product,
    };

    try {
      if (editingProduct?.id) {
        await updateProduct.mutateAsync(productData);
      } else {
        await addProduct.mutateAsync(productData);
      }
      setEditingProduct(null);
    } catch (error) {
      console.error('Failed to save product:', error);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      await deleteProduct.mutateAsync(productId);
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  if (!identity || !userProfile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Artist Dashboard</CardTitle>
            <CardDescription>Please log in to access your dashboard</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Artist Dashboard</CardTitle>
            <CardDescription>You need to register as an artist first</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/artist/register">
              <Button>Register as Artist</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const artistShare = commissionRate ? 100 - Number(commissionRate) : 90;

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Artist Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {artist.name}</p>
        </div>
        <div className="flex gap-2">
          <Link to="/store/$artistId" params={{ artistId: artist.id }}>
            <Button variant="outline">View My Store</Button>
          </Link>
          <Button variant="outline" onClick={() => setShowStoreSettings(true)}>
            <Settings className="mr-2 h-4 w-4" />
            Store Settings
          </Button>
        </div>
      </div>

      {/* Revenue Share Info */}
      <Card className="bg-gradient-to-br from-primary/10 to-secondary/10">
        <CardHeader>
          <CardTitle>Your Earnings</CardTitle>
          <CardDescription>Revenue share information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <p className="text-5xl font-bold text-primary mb-2">{artistShare}%</p>
            <p className="text-muted-foreground">
              You keep {artistShare}% of every sale. We handle payments, hosting, and support.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Upload */}
      <BulkImageUpload artistId={artist.id} />

      {/* Products and Donations Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Manage Your Listings</CardTitle>
              <CardDescription>Products and donation options</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setEditingProduct({})}>
                <Package className="mr-2 h-4 w-4" />
                Add Product
              </Button>
              <DonationForm artistId={artist.id} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="products">
                Products ({artistProducts.length})
              </TabsTrigger>
              <TabsTrigger value="donations">
                Donations ({artistDonations.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="products" className="mt-4">
              {artistProducts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No products yet. Add your first product or use bulk upload.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {artistProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{product.categoryName}</Badge>
                        </TableCell>
                        <TableCell>${(Number(product.price) / 100).toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditingProduct(product)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteProduct(product.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="donations" className="mt-4">
              {artistDonations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No donation options yet. Create one to let supporters contribute.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Suggested Amount</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {artistDonations.map((donation) => (
                      <TableRow key={donation.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Heart className="h-4 w-4 text-pink-500" />
                            {donation.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{donation.categoryName}</Badge>
                        </TableCell>
                        <TableCell>${(Number(donation.price) / 100).toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditingProduct(donation)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteProduct(donation.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Edit Product Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingProduct?.id ? 'Edit' : 'Add'}{' '}
              {editingProduct?.productType === ProductType.donation ? 'Donation' : 'Product'}
            </DialogTitle>
            <DialogDescription>
              {editingProduct?.productType === ProductType.donation
                ? 'Update donation details'
                : 'Fill in the product details'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveProduct} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                {editingProduct?.productType === ProductType.donation ? 'Title' : 'Name'}
              </Label>
              <Input
                id="name"
                name="name"
                defaultValue={editingProduct?.name}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={editingProduct?.description}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">
                {editingProduct?.productType === ProductType.donation ? 'Suggested Amount' : 'Price'} (USD)
              </Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0.01"
                defaultValue={editingProduct?.price ? Number(editingProduct.price) / 100 : ''}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryName">Category</Label>
              <Input
                id="categoryName"
                name="categoryName"
                defaultValue={editingProduct?.categoryName}
                required
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditingProduct(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateProduct.isPending || addProduct.isPending}>
                {updateProduct.isPending || addProduct.isPending ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Store Settings Dialog */}
      <Dialog open={showStoreSettings} onOpenChange={setShowStoreSettings}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Store Settings</DialogTitle>
            <DialogDescription>
              Customize your store's appearance and information
            </DialogDescription>
          </DialogHeader>
          <StoreSettingsForm artistId={artist.id} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
