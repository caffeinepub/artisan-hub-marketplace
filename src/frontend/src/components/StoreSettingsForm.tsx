import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Save, Upload } from 'lucide-react';
import { SiFacebook, SiInstagram, SiX, SiYoutube, SiTiktok } from 'react-icons/si';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ExternalBlob } from '../backend';
import { useGetStoreSettings, useUpdateStoreSettings } from '../hooks/useQueries';

interface StoreSettingsFormData {
  storeName: string;
  storeBio: string;
  instagram: string;
  facebook: string;
  twitter: string;
  youtube: string;
  tiktok: string;
}

interface StoreSettingsFormProps {
  artistId: string;
}

export default function StoreSettingsForm({ artistId }: StoreSettingsFormProps) {
  const { data: settings, isLoading } = useGetStoreSettings(artistId);
  const updateSettings = useUpdateStoreSettings();
  const [bannerImage, setBannerImage] = useState<ExternalBlob | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StoreSettingsFormData>();

  useEffect(() => {
    if (settings) {
      reset({
        storeName: settings.storeName || '',
        storeBio: settings.storeBio || '',
        instagram: settings.socialLinks.instagram || '',
        facebook: settings.socialLinks.facebook || '',
        twitter: settings.socialLinks.twitter || '',
        youtube: settings.socialLinks.youtube || '',
        tiktok: settings.socialLinks.tiktok || '',
      });
      if (settings.bannerImage) {
        setBannerImage(settings.bannerImage);
      }
    }
  }, [settings, reset]);

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      const blob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
        setUploadProgress(percentage);
      });

      await blob.getBytes();
      setBannerImage(blob);
    } catch (error) {
      console.error('Failed to upload banner:', error);
      alert('Failed to upload banner image');
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: StoreSettingsFormData) => {
    try {
      await updateSettings.mutateAsync({
        artistId,
        storeName: data.storeName,
        storeBio: data.storeBio,
        bannerImage,
        socialLinks: {
          instagram: data.instagram || undefined,
          facebook: data.facebook || undefined,
          twitter: data.twitter || undefined,
          youtube: data.youtube || undefined,
          tiktok: data.tiktok || undefined,
        },
      });

      alert('Store settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings. Please try again.');
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading settings...</div>;
  }

  const bannerUrl = bannerImage
    ? bannerImage.getDirectURL()
    : '/assets/generated/store-banner-placeholder.dim_1200x300.png';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Store Branding</CardTitle>
          <CardDescription>Customize how your store appears to visitors</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="storeName">Store Name *</Label>
            <Input
              id="storeName"
              placeholder="Your Store Name"
              {...register('storeName', { required: 'Store name is required' })}
            />
            {errors.storeName && (
              <p className="text-sm text-destructive">{errors.storeName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="storeBio">Store Bio *</Label>
            <Textarea
              id="storeBio"
              placeholder="Tell visitors about your work and what makes it special..."
              rows={4}
              {...register('storeBio', { required: 'Store bio is required' })}
            />
            {errors.storeBio && (
              <p className="text-sm text-destructive">{errors.storeBio.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Banner Image</Label>
            <div className="border rounded-lg overflow-hidden">
              <img
                src={bannerUrl}
                alt="Store banner"
                className="w-full h-48 object-cover"
              />
            </div>

            {isUploading && (
              <div className="space-y-2">
                <Progress value={uploadProgress} />
                <p className="text-sm text-muted-foreground text-center">
                  Uploading... {uploadProgress}%
                </p>
              </div>
            )}

            <Button asChild variant="outline" disabled={isUploading} className="w-full">
              <label className="cursor-pointer">
                <Upload className="mr-2 h-4 w-4" />
                {bannerImage ? 'Change Banner' : 'Upload Banner'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBannerUpload}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>
            </Button>
            <p className="text-xs text-muted-foreground">
              Recommended size: 1200x300px. Supports JPG, PNG, WebP
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Social Media Links</CardTitle>
          <CardDescription>Connect your social media profiles (optional)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="instagram" className="flex items-center gap-2">
              <SiInstagram className="h-4 w-4" />
              Instagram
            </Label>
            <Input
              id="instagram"
              placeholder="https://instagram.com/yourusername"
              {...register('instagram')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="facebook" className="flex items-center gap-2">
              <SiFacebook className="h-4 w-4" />
              Facebook
            </Label>
            <Input
              id="facebook"
              placeholder="https://facebook.com/yourpage"
              {...register('facebook')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="twitter" className="flex items-center gap-2">
              <SiX className="h-4 w-4" />
              X (Twitter)
            </Label>
            <Input
              id="twitter"
              placeholder="https://x.com/yourusername"
              {...register('twitter')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="youtube" className="flex items-center gap-2">
              <SiYoutube className="h-4 w-4" />
              YouTube
            </Label>
            <Input
              id="youtube"
              placeholder="https://youtube.com/@yourchannel"
              {...register('youtube')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tiktok" className="flex items-center gap-2">
              <SiTiktok className="h-4 w-4" />
              TikTok
            </Label>
            <Input
              id="tiktok"
              placeholder="https://tiktok.com/@yourusername"
              {...register('tiktok')}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={updateSettings.isPending || isUploading} size="lg">
          <Save className="mr-2 h-4 w-4" />
          {updateSettings.isPending ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </form>
  );
}
