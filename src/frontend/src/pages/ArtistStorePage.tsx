import React from 'react';
import { useParams } from '@tanstack/react-router';
import { SiFacebook, SiInstagram, SiX, SiYoutube } from 'react-icons/si';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import ProductCard from '../components/ProductCard';
import DonationCard from '../components/DonationCard';
import { useGetArtist, useGetProductsFiltered, useGetStoreSettings } from '../hooks/useQueries';
import { ProductType } from '../backend';

export default function ArtistStorePage() {
  const { artistId } = useParams({ from: '/store/$artistId' });
  const { data: artist } = useGetArtist(artistId);
  const { data: products = [] } = useGetProductsFiltered(artistId);
  const { data: storeSettings } = useGetStoreSettings(artistId);

  const artistProducts = products.filter((p) => p.productType === ProductType.product);
  const artistDonations = products.filter((p) => p.productType === ProductType.donation);

  if (!artist) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Artist not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const storeName = storeSettings?.storeName || artist.name;
  const storeBio = storeSettings?.storeBio || '';
  const bannerUrl = storeSettings?.bannerImage?.getDirectURL();
  const socialLinks = storeSettings?.socialLinks;

  return (
    <div className="min-h-screen">
      {/* Banner */}
      <div className="w-full h-64 bg-gradient-to-br from-primary/20 to-secondary/20 relative overflow-hidden">
        {bannerUrl ? (
          <img
            src={bannerUrl}
            alt={`${storeName} banner`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <h1 className="text-4xl font-bold text-foreground/80">{storeName}</h1>
          </div>
        )}
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Store Info */}
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">{storeName}</h1>
              {storeBio && <p className="text-lg text-muted-foreground max-w-3xl">{storeBio}</p>}
            </div>
            <Badge variant="outline" className="text-sm">
              {artist.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>

          {/* Social Links */}
          {socialLinks && (
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
            </div>
          )}
        </div>

        {/* Products and Donations */}
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="products">
              Products ({artistProducts.length})
            </TabsTrigger>
            <TabsTrigger value="donations">
              Donations ({artistDonations.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="mt-6">
            {artistProducts.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No products available yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {artistProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="donations" className="mt-6">
            {artistDonations.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No donation options available yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {artistDonations.map((donation) => (
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
