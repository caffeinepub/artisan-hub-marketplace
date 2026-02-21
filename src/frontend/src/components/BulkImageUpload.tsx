import React, { useState } from 'react';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ExternalBlob, ProductType } from '../backend';
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

        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileItem.id ? { ...f, status: 'success' as const, blob, progress: 100 } : f
          )
        );

        return { id: fileItem.id, blob, fileName: fileItem.file.name };
      } catch (error) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileItem.id
              ? {
                  ...f,
                  status: 'error' as const,
                  error: error instanceof Error ? error.message : 'Upload failed',
                }
              : f
          )
        );
        return null;
      }
    });

    const uploadResults = await Promise.all(uploadPromises);
    const successfulUploads = uploadResults.filter((r) => r !== null);

    if (successfulUploads.length === 0) {
      setIsUploading(false);
      return;
    }

    // Create products from successful uploads
    try {
      const products = successfulUploads.map((upload) => ({
        id: upload!.id,
        artistId,
        name: upload!.fileName.replace(/\.[^/.]+$/, ''),
        description: 'Product description',
        price: BigInt(1000),
        categoryName: 'Uncategorized',
        productType: ProductType.product,
      }));

      await bulkUpload.mutateAsync(products);

      setFiles([]);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to create products:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const pendingCount = files.filter((f) => f.status === 'pending').length;
  const successCount = files.filter((f) => f.status === 'success').length;
  const errorCount = files.filter((f) => f.status === 'error').length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bulk Image Upload</CardTitle>
        <CardDescription>
          Upload multiple images at once. Each image will create a new product listing that you can
          edit afterwards.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" disabled={isUploading}>
            <label className="cursor-pointer">
              <Upload className="mr-2 h-4 w-4" />
              Select Images
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isUploading}
              />
            </label>
          </Button>

          {files.length > 0 && (
            <Button onClick={uploadFiles} disabled={isUploading || pendingCount === 0}>
              {isUploading ? 'Uploading...' : `Upload ${pendingCount} Image${pendingCount !== 1 ? 's' : ''}`}
            </Button>
          )}
        </div>

        {files.length > 0 && (
          <div className="space-y-2">
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span>Total: {files.length}</span>
              {successCount > 0 && <span className="text-green-600">Success: {successCount}</span>}
              {errorCount > 0 && <span className="text-destructive">Failed: {errorCount}</span>}
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {files.map((fileItem) => (
                <div
                  key={fileItem.id}
                  className="flex items-center gap-3 p-3 border rounded-lg bg-card"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium truncate">{fileItem.file.name}</p>
                      {fileItem.status === 'success' && (
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                      )}
                      {fileItem.status === 'error' && (
                        <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
                      )}
                    </div>

                    {fileItem.status === 'uploading' && (
                      <Progress value={fileItem.progress} className="h-2" />
                    )}

                    {fileItem.status === 'error' && (
                      <p className="text-xs text-destructive">{fileItem.error}</p>
                    )}
                  </div>

                  {fileItem.status === 'pending' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(fileItem.id)}
                      disabled={isUploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
