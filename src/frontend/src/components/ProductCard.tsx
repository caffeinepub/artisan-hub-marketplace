import React from 'react';
import { Link } from '@tanstack/react-router';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import BuyNowButton from './BuyNowButton';
import { Product } from '../backend';
import { useGetArtist } from '../hooks/useQueries';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { data: artist } = useGetArtist(product.artistId);

  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-2 mb-2">
          <Badge variant="outline">{product.categoryName}</Badge>
        </div>
        <CardTitle className="text-xl">{product.name}</CardTitle>
      </CardHeader>

      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground mb-4">{product.description}</p>

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
