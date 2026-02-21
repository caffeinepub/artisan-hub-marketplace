import React, { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import BuyNowButton from './BuyNowButton';
import { Product } from '../backend';
import { useGetArtist, useGetAdminStripeAccountId } from '../hooks/useQueries';
import { useGetCallerUserProfile } from '../hooks/useQueries';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { data: artist } = useGetArtist(product.artistId);
  const { data: adminAccountId } = useGetAdminStripeAccountId();
  const { data: userProfile } = useGetCallerUserProfile();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const hasImages = product.imageUrls && product.imageUrls.length > 0;
  const hasMultipleImages = product.imageUrls && product.imageUrls.length > 1;
  const hasVideo = !!product.videoUrl;

  // Check payment configuration
  const hasArtistPayment = !!artist?.stripeAccountId || !!userProfile?.stripeApiKey;
  const hasAdminPayment = !!adminAccountId;
  const isPaymentConfigured = hasArtistPayment && hasAdminPayment;

  const nextImage = () => {
    if (hasImages) {
      setCurrentImageIndex((prev) => (prev + 1) % product.imageUrls.length);
    }
  };

  const prevImage = () => {
    if (hasImages) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? product.imageUrls.length - 1 : prev - 1
      );
    }
  };

  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-2 mb-2">
          <Badge variant="outline">{product.categoryName}</Badge>
          {!isPaymentConfigured && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="secondary" className="gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Setup Pending
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Payment configuration incomplete</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <CardTitle className="text-xl">{product.name}</CardTitle>
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        {/* Image Carousel */}
        {hasImages && (
          <div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden">
            <img
              src={product.imageUrls[currentImageIndex]}
              alt={`${product.name} - Image ${currentImageIndex + 1}`}
              className="w-full h-full object-cover"
            />
            
            {hasMultipleImages && (
              <>
                {/* Navigation Arrows */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>

                {/* Indicator Dots */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {product.imageUrls.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentImageIndex
                          ? 'bg-primary w-4'
                          : 'bg-background/60 hover:bg-background/80'
                      }`}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Video Player */}
        {hasVideo && (
          <div className="w-full aspect-video bg-muted rounded-lg overflow-hidden">
            <video
              src={product.videoUrl}
              controls
              className="w-full h-full"
              preload="metadata"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        )}

        {/* Placeholder if no media */}
        {!hasImages && !hasVideo && (
          <div className="w-full aspect-video bg-muted rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground text-sm">No media available</p>
          </div>
        )}

        <p className="text-sm text-muted-foreground">{product.description}</p>

        {artist && (
          <Link
            to="/store/$artistId"
            params={{ artistId: product.artistId }}
            className="text-sm text-primary hover:underline"
          >
            by {artist.name}
          </Link>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-2">
        <div className="w-full flex items-center justify-between">
          <span className="text-2xl font-bold">${(Number(product.price) / 100).toFixed(2)}</span>
        </div>
        <BuyNowButton product={product} />
      </CardFooter>
    </Card>
  );
}
