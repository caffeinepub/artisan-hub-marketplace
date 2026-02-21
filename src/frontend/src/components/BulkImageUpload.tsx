import React, { useState } from 'react';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ExternalBlob, ProductType, Product } from '../backend';
import { useBulkUploadProducts } from '../hooks/useQueries';

interface UploadFile {
  file: File;
  id: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  blob?: ExternalBlob;
}

interface BulkImageUploadProps {
  artistId: string;
  onSuccess?: () => void;
}

export default function BulkImageUpload({ artistId, onSuccess }: BulkImageUploadProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const bulkUpload = useBulkUploadProducts();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const imageFiles = selectedFiles.filter((file) => file.type.startsWith('image/'));

    const newFiles: UploadFile[] = imageFiles.map((file) => ({
      file,
      id: `${Date.now()}-${Math.random()}`,
      progress: 0,
      status: 'pending',
    }));

    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setIsUploading(true);

    // Upload all images first
    const uploadPromises = files.map(async (fileItem) => {
      try {
        setFiles((prev) =>
          prev.map((f) => (f.id === fileItem.id ? { ...f, status: 'uploading' as const } : f))
        );

        const arrayBuffer = await fileItem.file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
          setFiles((prev) =>
            prev.map((f) => (f.id === fileItem.id ? { ...f, progress: percentage } : f))
          );
        });

        await blob.getBytes();
        const imageUrl = blob.getDirectURL();

        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileItem.id ? { ...f, status: 'success' as const, blob } : f
          )
        );

        return imageUrl;
      } catch (error) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileItem.id
              ? { ...f, status: 'error' as const, error: 'Upload failed' }
              : f
          )
        );
        return null;
      }
    });

    const imageUrls = await Promise.all(uploadPromises);
    const successfulUrls = imageUrls.filter((url): url is string => url !== null);

    // Create products with uploaded images
    if (successfulUrls.length > 0) {
      try {
        const products: Product[] = successfulUrls.map((imageUrl, index) => ({
          id: `product-${Date.now()}-${index}`,
          artistId,
          name: `Product ${index + 1}`,
          description: 'Add description',
          price: BigInt(1000), // $10.00 default
          categoryName: 'Uncategorized',
          productType: ProductType.product,
          imageUrls: [imageUrl],
          videoUrl: undefined,
        }));

        await bulkUpload.mutateAsync(products);
        setFiles([]);
        onSuccess?.();
      } catch (error) {
        console.error('Failed to create products:', error);
      }
    }

    setIsUploading(false);
  };

  const allSuccess = files.length > 0 && files.every((f) => f.status === 'success');
  const hasErrors = files.some((f) => f.status === 'error');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bulk Image Upload</CardTitle>
        <CardDescription>
          Upload multiple images at once. Each image will create a new product listing.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <label htmlFor="bulk-upload" className="cursor-pointer">
            <div className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
              <Upload className="h-4 w-4" />
              <span>Select Images</span>
            </div>
            <input
              id="bulk-upload"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileSelect}
              disabled={isUploading}
            />
          </label>

          {files.length > 0 && (
            <Button
              onClick={uploadFiles}
              disabled={isUploading || allSuccess}
            >
              {isUploading ? 'Uploading...' : allSuccess ? 'Uploaded' : `Upload ${files.length} Images`}
            </Button>
          )}
        </div>

        {files.length > 0 && (
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-3 p-3 border rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.file.name}</p>
                  {file.status === 'uploading' && (
                    <Progress value={file.progress} className="mt-2" />
                  )}
                  {file.status === 'error' && (
                    <p className="text-sm text-destructive mt-1">{file.error}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {file.status === 'success' && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                  {file.status === 'error' && (
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  )}
                  {file.status === 'pending' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(file.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {allSuccess && (
          <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 rounded-lg">
            <CheckCircle className="h-5 w-5" />
            <p className="text-sm">
              All images uploaded successfully! Products have been created.
            </p>
          </div>
        )}

        {hasErrors && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm">
              Some uploads failed. Please try again.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
