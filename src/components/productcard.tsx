"use client"
import React, { useContext } from 'react'
import Image from 'next/image';
import { CardContent, Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Star } from 'lucide-react';
import { MarketplaceContext } from '@/context/marketplacecontext';
import { Product } from '@/types';


export default function ProductCard({ product }: { product: Product }) {
  const { navigateToSingleProductView, isInWishlist, toggleWishlist } = useContext(MarketplaceContext)

  const inWishlist = isInWishlist(product.id);

  // Get display price - use base price or cheapest variant price
  const getDisplayPrice = () => {
    if (product.price != null) {
      return product.price
    }
    // Fallback to cheapest variation price if base price is null
    if (product.variations && product.variations.length > 0) {
      const prices = product.variations
        .map(v => v?.price)
        .filter((p): p is number => p != null && p > 0)
      if (prices.length > 0) {
        return Math.min(...prices)
      }
    }
    return 0 // Default fallback
  }

  const displayPrice = getDisplayPrice()
  const hasVariants = product.variations && product.variations.length > 0
  const priceRange = hasVariants && product.price == null ?
    `From KES ${displayPrice.toFixed(2)}` :
    `KES ${displayPrice.toFixed(2)}`

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <Card className="w-[250px] border-none shadow-none hover:cursor-pointer"
      onClick={() => navigateToSingleProductView(product)}

    >
      <CardContent className="p-0">
        <div className="relative">
          <Image
            src={product.images[0]} // Access the first image in the array
            alt={product.title}
            className="w-full h-[200px] object-cover"
            height={200}
            width={250}
          />

          <Button
            variant="ghost"
            size="icon"
            onClick={handleHeartClick}
            className="absolute top-2 right-2 text-gray-600 dark:text-gray-300 hover:text-[#92736C] dark:hover:text-[#92736C] transition-colors duration-200"
          >
            <Heart className={`h-5 w-5 ${inWishlist ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>

          {product.isBestseller && (
            <Badge className="absolute bottom-2 left-2 bg-black text-white">
              Bestseller
            </Badge>
          )}
          {product.isNew && (
            <Badge className="absolute bottom-2 left-2 bg-[#92736C]/80 text-white">
              New
            </Badge>
          )}
        </div>
        <div className="mt-2 text-xs font-semibold uppercase">{product.brand}</div>
        <h3 className="mt-1 text-sm font-medium line-clamp-2">{product.title}</h3>
        <div className="mt-1 text-sm font-semibold">{priceRange}</div>
        <div className="mt-1 flex items-center">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${i < Math.floor(product.average_rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-500'
                }`}
            />
          ))}
          <span className="ml-1 text-xs text-gray-600 dark:text-gray-400">
            ({product.reviews?.length > 0 ? product.reviews.length : 'no reviews yet'})
          </span>
        </div>
        <Button className="w-full mt-2 text-white   dark:bg-foreground/10 dark:hover:bg-foreground/20 dark:text-white rounded-md">
          View
        </Button>
      </CardContent>
    </Card>
  );
};

