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
      }
    }

    return { imageUrls, videoUrl };
  };

  const handleSaveProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      // Upload new media files
      const { imageUrls: newImageUrls, videoUrl: newVideoUrl } = await uploadMediaFiles();

      // Combine existing and new image URLs
      const existingImageUrls = editingProduct?.imageUrls || [];
      const allImageUrls = [...existingImageUrls, ...newImageUrls];

      // Use new video URL if uploaded, otherwise keep existing
      const finalVideoUrl = newVideoUrl || editingProduct?.videoUrl;

      const productData: Product = {
        id: editingProduct?.id || `product-${Date.now()}`,
        artistId: artist!.id,
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        price: BigInt(Math.round(parseFloat(formData.get('price') as string) * 100)),
        categoryName: formData.get('categoryName') as string,
        productType: editingProduct?.productType || ProductType.product,
        imageUrls: allImageUrls,
        videoUrl: finalVideoUrl,
      };

      if (editingProduct?.id) {
        await updateProduct.mutateAsync(productData);
      } else {
        await addProduct.mutateAsync(productData);
      }

      // Reset states
      setEditingProduct(null);
      setImageFiles([]);
      setVideoFile(null);
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

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setImageFiles([]);
    setVideoFile(null);
  };

  const handleAddProduct = () => {
    setEditingProduct({
      id: '',
      artistId: artist!.id,
      name: '',
      description: '',
      price: BigInt(0),
      categoryName: '',
      productType: ProductType.product,
      imageUrls: [],
      videoUrl: undefined,
    });
    setImageFiles([]);
    setVideoFile(null);
  };

  const removeExistingImage = (index: number) => {
    if (editingProduct) {
      const newImageUrls = editingProduct.imageUrls.filter((_, i) => i !== index);
      setEditingProduct({ ...editingProduct, imageUrls: newImageUrls });
    }
  };

  const removeExistingVideo = () => {
    if (editingProduct) {
      setEditingProduct({ ...editingProduct, videoUrl: undefined });
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
              <CardDescription>Products, donations, and payment settings</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddProduct}>
                <Package className="mr-2 h-4 w-4" />
                Add Product
              </Button>
              <DonationForm artistId={artist.id} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full max-w-2xl grid-cols-3">
              <TabsTrigger value="products">
                Products ({artistProducts.length})
              </TabsTrigger>
              <TabsTrigger value="donations">
                Donations ({artistDonations.length})
              </TabsTrigger>
              <TabsTrigger value="payment">
                <CreditCard className="mr-2 h-4 w-4" />
                Payment Setup
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
                              onClick={() => handleEditProduct(product)}
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
                              onClick={() => handleEditProduct(donation)}
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

            <TabsContent value="payment" className="mt-4">
              <PaymentMethodSetup />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Edit Product Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
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

            {/* Existing Images */}
            {editingProduct && editingProduct.imageUrls.length > 0 && (
              <div className="space-y-2">
                <Label>Current Images</Label>
                <div className="grid grid-cols-3 gap-2">
                  {editingProduct.imageUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Product ${index + 1}`}
                        className="w-full h-24 object-cover rounded"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeExistingImage(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Existing Video */}
            {editingProduct?.videoUrl && (
              <div className="space-y-2">
                <Label>Current Video</Label>
                <div className="relative group">
                  <video
                    src={editingProduct.videoUrl}
                    controls
                    className="w-full h-48 rounded"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={removeExistingVideo}
                  >
                    <X className="mr-1 h-4 w-4" />
                    Remove Video
                  </Button>
                </div>
              </div>
            )}

            {/* New Images Upload */}
            <div className="space-y-2">
              <Label htmlFor="images">Add Images</Label>
              <Input
                id="images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
              />
              {imageFiles.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {imageFiles.map((file) => (
                    <div key={file.id} className="relative group">
                      <img
                        src={file.url}
                        alt="Preview"
                        className="w-full h-24 object-cover rounded"
                      />
                      {file.uploading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded">
                          <Progress value={file.progress} className="w-3/4" />
                        </div>
                      )}
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(file.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* New Video Upload */}
            <div className="space-y-2">
              <Label htmlFor="video">Add Video</Label>
              <Input
                id="video"
                type="file"
                accept="video/*"
                onChange={handleVideoSelect}
              />
              {videoFile && (
                <div className="relative group">
                  <video
                    src={videoFile.url}
                    controls
                    className="w-full h-48 rounded"
                  />
                  {videoFile.uploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded">
                      <Progress value={videoFile.progress} className="w-3/4" />
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={removeVideo}
                  >
                    <X className="mr-1 h-4 w-4" />
                    Remove
                  </Button>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setEditingProduct(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={addProduct.isPending || updateProduct.isPending}>
                {addProduct.isPending || updateProduct.isPending ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Store Settings Dialog */}
      <Dialog open={showStoreSettings} onOpenChange={setShowStoreSettings}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Store Settings</DialogTitle>
            <DialogDescription>
              Customize your store appearance and information
            </DialogDescription>
          </DialogHeader>
          <StoreSettingsForm artistId={artist.id} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
