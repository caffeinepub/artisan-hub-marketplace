import React from 'react';
import { useParams } from '@tanstack/react-router';
import { SiFacebook, SiInstagram, SiX, SiYoutube, SiTiktok } from 'react-icons/si';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProductCard from '../components/ProductCard';
import DonationCard from '../components/DonationCard';
import { useGetStoreSettings, useGetProductsFiltered, useGetArtist } from '../hooks/useQueries';

export default function ArtistStorePage() {
  const { artistId } = useParams({ from: '/store/$artistId' });
  const { data: settings, isLoading: settingsLoading } = useGetStoreSettings(artistId);
  const { data: artist, isLoading: artistLoading } = useGetArtist(artistId);
  const { data: allProducts = [], isLoading: productsLoading } = useGetProductsFiltered(artistId);

  const products = allProducts.filter((p) => p.productType === 'product');
  const donations = allProducts.filter((p) => p.productType === 'donation');

  if (settingsLoading || artistLoading || productsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading store...</div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Store Not Found</h1>
          <p className="text-muted-foreground">This artist store does not exist.</p>
        </div>
      </div>
    );
  }

  const bannerUrl = settings?.bannerImage
    ? settings.bannerImage.getDirectURL()
    : '/assets/generated/store-banner-placeholder.dim_1200x300.png';

  const storeName = settings?.storeName || artist.name;
  const storeBio = settings?.storeBio || `Welcome to ${artist.name}'s store`;

  const socialLinks = settings?.socialLinks || {};
  const hasSocialLinks = Object.values(socialLinks).some((link) => link);

  return (
    <div className="min-h-screen">
      {/* Banner */}
      <div className="w-full h-64 md:h-80 overflow-hidden bg-muted">
        <img src={bannerUrl} alt={storeName} className="w-full h-full object-cover" />
      </div>

      {/* Store Info */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto mb-8">
          <h1 className="text-4xl font-bold mb-4">{storeName}</h1>
          <p className="text-lg text-muted-foreground mb-6">{storeBio}</p>

          {hasSocialLinks && (
            <div className="flex gap-4">
              {socialLinks.instagram && (
                <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <SiInstagram className="h-6 w-6" />
                </a>
              )}
              {socialLinks.facebook && (
                <a
                  href={socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <SiFacebook className="h-6 w-6" />
                </a>
              )}
              {socialLinks.twitter && (
                <a
                  href={socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <SiX className="h-6 w-6" />
                </a>
              )}
              {socialLinks.youtube && (
                <a
                  href={socialLinks.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <SiYoutube className="h-6 w-6" />
                </a>
              )}
              {socialLinks.tiktok && (
                <a
                  href={socialLinks.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <SiTiktok className="h-6 w-6" />
                </a>
              )}
            </div>
          )}
        </div>

        {/* Products and Donations */}
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="products">
              Products {products.length > 0 && `(${products.length})`}
            </TabsTrigger>
            <TabsTrigger value="donations">
              Support {donations.length > 0 && `(${donations.length})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="mt-8">
            {products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No products available yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="donations" className="mt-8">
            {donations.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No donation options available yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {donations.map((donation) => (
                  <DonationCard key={donation.id} donation={donation} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
