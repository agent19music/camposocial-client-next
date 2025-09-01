'use client'

import { useState, useContext, useEffect } from "react"
import Image from "next/image"
import { useParams } from "next/navigation"
import { Star, ShoppingCart, User, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Paintbrush, Cookie, Book, Shirt, Monitor, Search } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import Header from "@/components/header"
import SideNav from "@/components/sidenav"
import { MarketplaceContext, } from "@/context/marketplacecontext"
import { Variation } from "@/utils/types"
import { AuthContext } from "@/context/authcontext"
import { toast } from "react-hot-toast"
import ReviewForm from "@/components/reviewform"
import CartComponent from "@/components/cart"

const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-5 h-5 ${
            star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
          }`}
        />
      ))}
    </div>
  )
}

// Variation type now imported from MarketplaceContext

const ProductVariations = ({
  variations,
  onVariationChange,
  selectedProduct
}: {
  variations: Variation[];
  onVariationChange: (variation: Variation | null) => void;
  selectedProduct: { variations: Variation[] };
}) => {
  // const [selectedVariation, setSelectedVariation] = useState<Variation | null>(null);
  const [selectedVariation, setSelectedVariation] = useState<Variation | null>(selectedProduct.variations[0] || null);


  const variationNames = [...new Set(variations.map((v) => v.name))];

  const handleVariationChange = (value: string) => {
    const newVariation = variations.find((v) => v.value === value);
    setSelectedVariation(newVariation || null);
    onVariationChange(newVariation || null);  // Notify the parent component
  };

  return (
    <div className="space-y-4">
      {variationNames.map((name) => (
        <div key={name}>
          <Label htmlFor={name}>{name}</Label>
          <Select onValueChange={handleVariationChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={`Select ${name}`} />
            </SelectTrigger>
            <SelectContent>
              {variations
                .filter((v) => v.name === name)
                .map((variation) => (
                  <SelectItem key={variation.id} value={variation.value}>
                    {variation.value} - ${variation.price.toFixed(2)} ({variation.stock} in stock)
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      ))}
      {selectedVariation && (
        <div>
          <p className="font-semibold">Selected: {selectedVariation.value}</p>
          <p className="font-semibold">Price: ${selectedVariation.price.toFixed(2)}</p>
          <p className="text-sm text-muted-foreground">Stock: {selectedVariation.stock}</p>
        </div>
      )}
    </div>
  );
};

export default function SingleProductPage() {
  const { selectedProduct, setSelectedProduct, navigateToSingleSellerView, addToCart, deslugify } = useContext(MarketplaceContext)
  const [selectedImage, setSelectedImage] = useState("")
  const [selectedVariation, setSelectedVariation] = useState<Variation | null>(null);
  const [rating, setRating] = useState(0)
  const [review, setReview] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT;
  const {authToken} = useContext(AuthContext)

  const params = useParams()

  console.log(selectedProduct);
  

  useEffect(() => {
    let isMounted = true;
    const fetchProductData = async () => {
      setIsLoading(true);
      try {
        const productId = deslugify(params.slug as string);
        const response = await fetch(`${apiEndpoint}/products/${productId}`);
        if (isMounted && response.ok) {
          const data = await response.json();
          setSelectedProduct(data);
          setSelectedImage(data.images[0]);
        } else {
          throw new Error('Failed to fetch product data');
        }
      } catch (error) {
        console.error('Error fetching product data:', error);
        if (isMounted) toast.error('Failed to load product data');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
  
    fetchProductData();
    return () => { isMounted = false; };
  }, [params.slug, setSelectedProduct,apiEndpoint]);
  

  // deslugify now provided by context
  const averageRating = selectedProduct?.reviews
    ? selectedProduct.reviews.length > 0
      ? selectedProduct.reviews.reduce((acc, review) => acc + review.rating, 0) / selectedProduct.reviews.length
      : 5
    : 0

  const marketplaceLinks = [
    { href: "/art", label: "Art ", icon: <Paintbrush className="h-4 w-4" />, onClick: () => {} },
    { href: "/food", label: "Food ", icon: <Cookie className="h-4 w-4" />, onClick: () => {} },
    { href: "/books", label: "Books", icon: <Book className="h-4 w-4" />, onClick: () => {} },
    { href: "/clothing", label: "Clothing", icon: <Shirt className="h-4 w-4" />, onClick: () => {} },
    { href: "/tech", label: "Tech", icon: <Monitor className="h-4 w-4" />, onClick: () => {} },
  ]

  // addToCart now provided by context

  return (
    <div className="w-screen h-screen lg:container mx-auto p-4">
      <Header />
      <div className="flex flex-col md:flex-row">
       <div className="md:w-64 flex-shrink-0">
                <SideNav links = {marketplaceLinks} />
              </div>
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Image Gallery */}
            <div className="space-y-4">
              {isLoading ? (
                <Skeleton className="w-full aspect-square rounded-lg" />
              ) : (
                <div className="relative aspect-square">
                      <Image
                src={selectedImage}
                alt={selectedProduct?.title || "Product image"}
                fill
                loading="lazy" // Enables lazy loading
                className="object-contain rounded-lg"
                />

                </div>
              )}
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {isLoading ? (
                  Array(4).fill(0).map((_, index) => (
                    <Skeleton key={index} className="w-20 h-20 rounded-md" />
                  ))
                ) : (
                  selectedProduct?.images?.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(image)}
                      className="relative w-20 h-20 flex-shrink-0"
                    >
                      <Image
                        src={image}
                        alt={`${selectedProduct.title} thumbnail ${index + 1}`}
                        fill
                        className={`object-contain rounded-md ${
                          selectedImage === image ? "border border-primary" : ""
                        }`}
                      />
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Product Information */}
            <div className="space-y-6">
              {isLoading ? (
                <>
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-20 w-full" />
                </>
              ) : (
                <>
                  <h1 className="text-2xl font-bold">{selectedProduct?.title}</h1>
                  <div className="flex items-center space-x-2">
                    <StarRating rating={Math.round(averageRating)} />
                    <span className="text-sm text-gray-500">
                      ({selectedProduct?.reviews?.length || 0} reviews)
                    </span>
                  </div>
                  <p className="text-gray-600">{selectedProduct?.description}</p>
                  {!selectedVariation&&<p className="text-xl font-bold">${selectedProduct?.variations[0].price}</p>}
                  {selectedVariation &&<p className="text-xl font-bold">${selectedVariation?.price}</p>}
                  <p className="text-sm text-gray-500">Category: {selectedProduct?.category}</p>
                  <p className="text-sm text-gray-500">Brand: {selectedProduct?.brand}</p>
                </>
              )}

              {/* Product Variations */}
              {isLoading ? (
                <Skeleton className="h-40 w-full" />
              ) : (
                selectedProduct?.variations && (
                  <ProductVariations 
                  onVariationChange={setSelectedVariation}
                  variations={selectedProduct.variations}
                  selectedProduct={selectedProduct} />
                )
              )}

              {/* Seller Information */}
              {isLoading ? (
                <div className="flex items-center space-x-4">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32 mt-1" />
                  </div>
                </div>
              ) : (
                <div
                  className="flex items-center space-x-4 hover:cursor-pointer"
                  onClick={() => selectedProduct?.seller && navigateToSingleSellerView({  
                    name: selectedProduct.seller.name,
                    avatar: selectedProduct.seller.avatar,
                    id: selectedProduct.seller.id,
                    sales: selectedProduct.seller.sales,
                    rating: selectedProduct.seller.rating,
                    is_verified: selectedProduct.seller.is_verified,
                  })}
                >
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={selectedProduct?.seller.avatar} alt={selectedProduct?.seller.name} />
                    <AvatarFallback>{selectedProduct?.seller.name ? selectedProduct.seller.name[0] : "?"}</AvatarFallback>
                  </Avatar>
                  <div className="flex items-center">
                    <p className="font-semibold">{selectedProduct?.seller.name}</p>
                    {selectedProduct?.seller.is_verified && ( //@ts-ignore
                      <CheckCircle className="w-4 h-4 text-green-500 ml-1" />
                    )}
                  </div>
                </div>
              )}

              {/* Add to Cart Button */}
              <Button 
            className="w-full" 
            disabled={isLoading} 
            onClick={async () => {
              const res = await addToCart(selectedProduct?.id || '', 1, selectedVariation?.id);
              if (res) toast.success("Product added to cart successfully!");
              else toast.error("Failed to add product to cart");
            }}>
              Add to Cart
          </Button>


              {/* Contact Information */}
              {/* <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Contact Information</h3>
                <p className="text-sm text-gray-600">{selectedProduct?.contact_info}</p>
              </div> */}

             
            </div>
            <CartComponent/>
          </div>

          {/* Review System */}
          {/* <Card className="mt-8 bg-gray-50">
            <CardContent className="p-6">
              <h2 className="text-xl md:text-2xl font-bold mb-4">Leave a Review</h2>
              <div className="flex items-center space-x-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`${star <= rating ? "text-yellow-400" : "text-gray-300"}`}
                  >
                    <Star className="w-6 h-6 md:w-8 md:h-8 fill-current" />
                  </button>
                ))}
              </div>
              <Textarea
                placeholder="Write your review here..."
                value={review}
                onChange={(e) => setReview(e.target.value)}
                className="mb-4"
              />
              <Button>Submit Review</Button>
            </CardContent>
          </Card> */}
          <ReviewForm product_id={selectedProduct?.id || ''}/>

           {/* Reviews */}
           <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>
                <div className="space-y-4">
                  {isLoading ? (
                    Array(3).fill(0).map((_, index) => (
                      <Card key={index} className="bg-gray-50">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Skeleton className="w-8 h-8 rounded-full" />
                              <Skeleton className="h-4 w-24" />
                            </div>
                            <Skeleton className="h-4 w-24" />
                          </div>
                          <Skeleton className="h-16 w-full mt-2" />
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    selectedProduct?.reviews?.map((review) => (
                      <Card key={review.id} className="bg-gray-50">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Avatar className="w-8 h-8">
                              <AvatarImage src={review?.avatar} alt={review?.username} />
                                <AvatarFallback>{review.username[0].toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <p className="font-semibold">{review.username}</p>
                            </div>
                            <StarRating rating={review?.rating} />
                          </div>
                          <p className="mt-2 ">{review.text}</p>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
        </div>
      </div>
    </div>
  )
}