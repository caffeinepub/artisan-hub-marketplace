import React, { useState } from 'react';
import { Pencil, Trash2, Settings, Package, Heart, X, Upload, CreditCard } from 'lucide-react';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
import { Progress } from '@/components/ui/progress';
import { ProductType, ExternalBlob, Product } from '../backend';
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
import PaymentMethodSetup from '../components/PaymentMethodSetup';
import { toast } from 'sonner';

interface MediaFile {
  file: File;
  id: string;
  url: string;
  progress: number;
  uploading: boolean;
}

export default function ArtistDashboard() {
  const { identity } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const principalId = identity?.getPrincipal().toString();

  const { data: artist } = useGetArtist(principalId || '');
  const { data: products = [] } = useGetProductsFiltered(artist?.id || '');
  const { data: commissionRate } = useGetPlatformCommissionRate();

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [showStoreSettings, setShowStoreSettings] = useState(false);
  const [activeTab, setActiveTab] = useState('products');

  // Media upload states
  const [imageFiles, setImageFiles] = useState<MediaFile[]>([]);
  const [videoFile, setVideoFile] = useState<MediaFile | null>(null);

  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const artistProducts = products.filter((p) => p.productType === ProductType.product);
  const artistDonations = products.filter((p) => p.productType === ProductType.donation);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const imageFilesList = selectedFiles.filter((file) => file.type.startsWith('image/'));

    const newFiles: MediaFile[] = imageFilesList.map((file) => ({
      file,
      id: `${Date.now()}-${Math.random()}`,
      url: URL.createObjectURL(file),
      progress: 0,
      uploading: false,
    }));

    setImageFiles((prev) => [...prev, ...newFiles]);
  };

  const handleVideoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile({
        file,
        id: `${Date.now()}-${Math.random()}`,
        url: URL.createObjectURL(file),
        progress: 0,
        uploading: false,
      });
    }
  };

  const removeImage = (id: string) => {
    setImageFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const removeVideo = () => {
    setVideoFile(null);
  };

  const uploadMediaFiles = async (): Promise<{ imageUrls: string[]; videoUrl?: string }> => {
    const imageUrls: string[] = [];
    let videoUrl: string | undefined;

    // Upload images
    for (const imageFile of imageFiles) {
      setImageFiles((prev) =>
        prev.map((f) => (f.id === imageFile.id ? { ...f, uploading: true } : f))
      );

      try {
        const arrayBuffer = await imageFile.file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
          setImageFiles((prev) =>
            prev.map((f) => (f.id === imageFile.id ? { ...f, progress: percentage } : f))
          );
        });

        await blob.getBytes();
        const url = blob.getDirectURL();
        imageUrls.push(url);
      } catch (error) {
        console.error('Failed to upload image:', error);
        throw error;
      }
    }

    // Upload video
    if (videoFile) {
      setVideoFile((prev) => (prev ? { ...prev, uploading: true } : null));

      try {
        const arrayBuffer = await videoFile.file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
          setVideoFile((prev) => (prev ? { ...prev, progress: percentage } : null));
        });

        await blob.getBytes();
        videoUrl = blob.getDirectURL();
      } catch (error) {
        console.error('Failed to upload video:', error);
        throw error;
      }
    }

    return { imageUrls, videoUrl };
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!artist) return;

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const price = formData.get('price') as string;
    const categoryName = formData.get('categoryName') as string;

    try {
      const { imageUrls, videoUrl } = await uploadMediaFiles();

      const product: Product = {
        id: editingProduct?.id || `${Date.now()}-${Math.random()}`,
        artistId: artist.id,
        name,
        description,
        price: BigInt(Math.round(parseFloat(price) * 100)),
        categoryName,
        productType: ProductType.product,
        imageUrls,
        videoUrl,
      };

      if (editingProduct) {
        await updateProduct.mutateAsync(product);
      } else {
        await addProduct.mutateAsync(product);
      }

      setEditingProduct(null);
      setImageFiles([]);
      setVideoFile(null);
      e.currentTarget.reset();
    } catch (error) {
      console.error('Failed to save product:', error);
    }
  };

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

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setActiveTab('products');
  };

  const handleStoreSettingsClose = () => {
    setShowStoreSettings(false);
  };

  if (!identity) {
    return (
      <div className="container py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Please log in to access your dashboard</h2>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="container py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Artist Profile Not Found</h2>
        <p className="text-muted-foreground mb-6">
          You need to register as an artist to access the dashboard.
        </p>
        <Link to="/artist/register">
          <Button>Register as Artist</Button>
        </Link>
      </div>
    );
  }

  const artistShare = commissionRate ? 100 - Number(commissionRate) : 90;

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Artist Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {artist.name}</p>
        </div>
        <Button variant="outline" onClick={() => setShowStoreSettings(true)}>
          <Settings className="mr-2 h-4 w-4" />
          Store Settings
        </Button>
      </div>

      {/* Revenue Share Card */}
      <Card className="mb-8 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle>Your Revenue Share</CardTitle>
          <CardDescription>You earn {artistShare}% of each sale</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-primary">{artistShare}%</div>
          <p className="text-sm text-muted-foreground mt-2">
            Platform commission: {commissionRate ? Number(commissionRate) : 10}%
          </p>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="products">
            <Package className="mr-2 h-4 w-4" />
            Products
          </TabsTrigger>
          <TabsTrigger value="donations">
            <Heart className="mr-2 h-4 w-4" />
            Donations
          </TabsTrigger>
          <TabsTrigger value="bulk-upload">
            <Upload className="mr-2 h-4 w-4" />
            Bulk Upload
          </TabsTrigger>
          <TabsTrigger value="payment-setup">
            <CreditCard className="mr-2 h-4 w-4" />
            Payment Setup
          </TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</CardTitle>
              <CardDescription>
                {editingProduct ? 'Update your product details' : 'Create a new product listing'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name</Label>
                    <Input
                      id="name"
                      name="name"
                      defaultValue={editingProduct?.name}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price ($)</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      defaultValue={editingProduct ? Number(editingProduct.price) / 100 : ''}
                      required
                    />
                  </div>
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

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    rows={4}
                    defaultValue={editingProduct?.description}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Images</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelect}
                  />
                  {imageFiles.length > 0 && (
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      {imageFiles.map((file) => (
                        <div key={file.id} className="relative">
                          <img
                            src={file.url}
                            alt="Preview"
                            className="w-full h-32 object-cover rounded"
                          />
                          {file.uploading && (
                            <Progress value={file.progress} className="mt-2" />
                          )}
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2"
                            onClick={() => removeImage(file.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Video (Optional)</Label>
                  <Input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoSelect}
                  />
                  {videoFile && (
                    <div className="relative mt-4">
                      <video
                        src={videoFile.url}
                        className="w-full h-48 object-cover rounded"
                        controls
                      />
                      {videoFile.uploading && (
                        <Progress value={videoFile.progress} className="mt-2" />
                      )}
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={removeVideo}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={addProduct.isPending || updateProduct.isPending}>
                    {editingProduct ? 'Update Product' : 'Add Product'}
                  </Button>
                  {editingProduct && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setEditingProduct(null);
                        setImageFiles([]);
                        setVideoFile(null);
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Products</CardTitle>
              <CardDescription>Manage your product listings</CardDescription>
            </CardHeader>
            <CardContent>
              {artistProducts.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No products yet. Create your first product above.
                </p>
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
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(product)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setProductToDelete(product)}
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Donations Tab */}
        <TabsContent value="donations" className="space-y-6">
          <DonationForm artistId={artist.id} />

          <Card>
            <CardHeader>
              <CardTitle>Your Donations</CardTitle>
              <CardDescription>Manage your donation options</CardDescription>
            </CardHeader>
            <CardContent>
              {artistDonations.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No donation options yet. Create one above.
                </p>
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
                        <TableCell className="font-medium">{donation.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{donation.categoryName}</Badge>
                        </TableCell>
                        <TableCell>${(Number(donation.price) / 100).toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setProductToDelete(donation)}
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
        </TabsContent>

        {/* Bulk Upload Tab */}
        <TabsContent value="bulk-upload">
          <BulkImageUpload artistId={artist.id} />
        </TabsContent>

        {/* Payment Setup Tab */}
        <TabsContent value="payment-setup">
          <PaymentMethodSetup />
        </TabsContent>
      </Tabs>

      {/* Store Settings Dialog */}
      <Dialog open={showStoreSettings} onOpenChange={setShowStoreSettings}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Store Settings</DialogTitle>
            <DialogDescription>
              Customize your artist store page
            </DialogDescription>
          </DialogHeader>
          <StoreSettingsForm artistId={artist.id} />
        </DialogContent>
      </Dialog>

      {/* Delete Product Confirmation Dialog */}
      <AlertDialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{productToDelete?.name}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteProduct.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProduct}
              disabled={deleteProduct.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteProduct.isPending ? 'Deleting...' : 'Delete Product'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
