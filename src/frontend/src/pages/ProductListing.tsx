import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProductCard from '../components/ProductCard';
import DonationCard from '../components/DonationCard';
import { useGetAllProducts } from '../hooks/useQueries';

export default function ProductListing() {
  const { data: allProducts = [], isLoading, error } = useGetAllProducts();

  const products = allProducts.filter((p) => p.productType === 'product');
  const donations = allProducts.filter((p) => p.productType === 'donation');

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading marketplace...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-destructive">
          Failed to load products. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <div className="relative w-full h-96 overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20">
        <img
          src="/assets/generated/hero-banner.dim_1200x400.png"
          alt="Marketplace Hero"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-5xl font-bold mb-4">Artist Marketplace</h1>
            <p className="text-xl">Discover unique art and support talented artists</p>
          </div>
        </div>
      </div>

      {/* Products and Donations */}
      <div className="container mx-auto px-4 py-12">
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="products">
              Products {products.length > 0 && `(${products.length})`}
            </TabsTrigger>
            <TabsTrigger value="donations">
              Support Artists {donations.length > 0 && `(${donations.length})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            {products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No products available yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="donations">
            {donations.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No donation options available yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
