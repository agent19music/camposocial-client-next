'use client'

import { useState, useEffect } from 'react'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { MapPin, Star, Package, MessageCircle, CheckCircle2, ShoppingCart } from 'lucide-react'
import Header from '@/components/header'
import SideNav from '@/components/sidenav'
import { Paintbrush, Cookie, Book, Shirt, Monitor } from "lucide-react"
import { useContext } from 'react'
import { MarketplaceContext } from '@/context/marketplacecontext'
import { Seller, Product } from '@/utils/types'
import { toast } from 'react-hot-toast'
import { useParams } from 'next/navigation'
import { Skeleton } from "@/components/ui/skeleton"
import ProductCard from '@/components/productcard'
import CartComponent from '@/components/cart'

export default function SellerProfile() {
  const [activeTab, setActiveTab] = useState("products")
  const params = useParams()  
  
  const { deslugify } = useContext(MarketplaceContext)



  const { selectedSeller } = useContext(MarketplaceContext)
  const [sellerData, setSellerData] = useState<Seller | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT;

  useEffect(() => {
    const fetchSellerData = async () => {
      setIsLoading(true);
      if (typeof params.slug !== 'string') {
        console.error('Slug parameter is not a string:', params.slug);
        setIsLoading(false);
        return;
      }
      try {
        const response = await fetch(`${apiEndpoint}/sellers/${deslugify(params.slug)}`);

        if (!response.ok) {
          if (response.status === 404) {
            toast.error('Seller not found');
          } else {
            const errorData = await response.json();
            const errorMessage = errorData?.message || 'Failed to fetch seller';
            toast.error(errorMessage);
          }
        } else {
          const data = await response.json();
          setSellerData(data);
        }
      } catch (error) {
        console.error('Error fetching seller data:', error);
        toast.error('An error occurred while fetching seller');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSellerData();
  }, [params, apiEndpoint, deslugify]);

  const marketplaceLinks = [
    { href: "/art", label: "Art ", icon: <Paintbrush className="h-4 w-4" />, onClick: () => {} },
    { href: "/food", label: "Food ", icon: <Cookie className="h-4 w-4" />, onClick: () => {} },
    { href: "/books", label: "Books", icon: <Book className="h-4 w-4" />, onClick: () => {} },
    { href: "/clothing", label: "Clothing", icon: <Shirt className="h-4 w-4" />, onClick: () => {} },
    { href: "/tech", label: "Tech", icon: <Monitor className="h-4 w-4" />, onClick: () => {} },
  ];

  const sellerInfo = sellerData || selectedSeller;


  return (
    <div className="w-screen h-screen lg:container mx-auto p-4">
      <Header />
      <div className="flex flex-col md:flex-row">
       <div className="md:w-64 flex-shrink-0">
                      <SideNav links = {marketplaceLinks} />
                    </div>
        <div className="container mx-auto px-4 py-8 max-w-7xl min-h-screen">
          <Card className="mb-8 overflow-hidden">
            <CardHeader className="flex flex-col sm:flex-row items-center gap-4 p-4 sm:p-6">
              {isLoading ? (
                <Skeleton className="h-24 w-24 sm:h-32 sm:w-32 rounded-full" />
              ) : (
                <Avatar className="h-24 w-24 sm:h-32 sm:w-32">
                  <AvatarImage src={sellerInfo?.avatar} alt={sellerInfo?.name} />
                  <AvatarFallback>{sellerInfo?.name?.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
              )}
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center gap-2 mb-2">
                  {isLoading ? (
                    <Skeleton className="h-8 w-48" />
                  ) : (
                    <CardTitle className="text-2xl sm:text-3xl">{sellerInfo?.name}</CardTitle>
                  )}
                  {!isLoading && sellerInfo?.is_verified && (
                    <Badge variant="secondary" className="ml-0 sm:ml-2 text-green-400">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                {isLoading ? (
                  <Skeleton className="h-6 w-32 mt-2" />
                ) : (
                  <CardDescription className="text-lg">{sellerInfo?.name}</CardDescription>
                )}
                {!isLoading && sellerInfo?.location && (
                  <div className="flex items-center justify-center sm:justify-start text-muted-foreground text-sm mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    {sellerInfo.location}
                  </div>
                )}
              </div>
              <Button className="mt-4 sm:mt-0" disabled={isLoading}>
                <MessageCircle className="h-4 w-4 mr-2" />
                Contact
              </Button>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-wrap justify-between gap-2 mb-6">
                {['totalSales', 'rating', 'products'].map((stat, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center p-2 sm:p-4 bg-muted rounded-lg min-w-[100px]">
                    {isLoading ? (
                      <Skeleton className="h-16 w-16 rounded-full mb-2" />
                    ) : (
                      <>
                        {stat === 'totalSales' && <ShoppingCart className="h-6 w-6 sm:h-10 sm:w-10 mb-1 sm:mb-2 text-primary" />}
                        {stat === 'rating' && <Star className="h-6 w-6 sm:h-10 sm:w-10 mb-1 sm:mb-2 text-primary" />}
                        {stat === 'products' && <Package className="h-6 w-6 sm:h-10 sm:w-10 mb-1 sm:mb-2 text-primary" />}
                        <span className="text-lg sm:text-3xl font-bold">
                          {stat === 'products' ? sellerInfo?.products?.length : (stat === 'rating' ? sellerInfo?.rating : sellerInfo?.sales)}
                        </span>
                        <span className="text-xs sm:text-sm text-muted-foreground">
                          {stat.charAt(0).toUpperCase() + stat.slice(1)}
                        </span>
                      </>
                    )}
                  </div>
                ))}
              </div>
              {isLoading ? (
                <Skeleton className="h-2 w-full mb-2" />
              ) : (
                <Progress value={sellerInfo?.rating ? sellerInfo.rating * 20 : 0} className="h-2 mb-2" />
              )}
              {isLoading ? (
                <Skeleton className="h-4 w-32 mx-auto" />
              ) : (
                <div className="text-sm text-center text-muted-foreground">{sellerInfo?.joinedDate}</div>
              )}
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            <TabsContent value="about">
              <Card>
                <CardHeader>
                  <CardTitle>About {sellerInfo?.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-24 w-full" />
                  ) : (
                    <p className="text-base sm:text-lg leading-relaxed">{sellerInfo?.about}</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="products">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {isLoading ? (
                  Array(4).fill(0).map((_, index) => (
                    <Card key={index} className="flex flex-col">
                      <CardHeader className="p-0">
                        <Skeleton className="h-48 sm:h-64 w-full" />
                      </CardHeader>
                      <CardContent className="p-4 flex-grow">
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-6 w-1/4" />
                      </CardContent>
                      <CardFooter className="p-4 pt-0">
                        <Skeleton className="h-10 w-full" />
                      </CardFooter>
                    </Card>
                  ))
                ) : (
                  sellerInfo?.products?.map((product: Product, index: number) => (
                    <ProductCard key={index} product={product} />

                  ))
                )}
              </div>
            </TabsContent>
            <TabsContent value="reviews">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Reviews</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {isLoading &&
                    Array(3).fill(0).map((_, index) => (
                      <div key={index}>
                        {index > 0 && <Separator className="my-4" />}
                        <div className="flex items-center mb-2">
                          <Skeleton className="h-10 w-10 rounded-full mr-3" />
                          <div>
                            <Skeleton className="h-4 w-24 mb-1" />
                            <Skeleton className="h-3 w-20" />
                          </div>
                        </div>
                        <Skeleton className="h-16 w-full mt-2" />
                      </div>
                    ))
                   } 
                   
                   {!isLoading && (Array.isArray(sellerInfo?.reviews) && sellerInfo.reviews.length > 1) && (
                    sellerInfo?.reviews?.map((review: any, index: number) => (
                      <div key={review.id}>
                        {index > 0 && <Separator className="my-4" />}
                        <div className="flex items-center mb-2">
                          <Avatar className="h-8 w-8 sm:h-10 sm:w-10 mr-3">
                            <AvatarFallback>{review.user[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <span className="font-semibold text-base sm:text-lg">{review.user}</span>
                            <div className="flex items-center mt-1">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`h-3 w-3 sm:h-4 sm:w-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                              ))}
                            </div>
                          </div>
                        </div>
                        <p className="text-sm sm:text-base text-muted-foreground mt-2">{review.comment}</p>
                      </div>
                    ))
                  )}

                  {!isLoading && sellerInfo?.reviews === 0 && (
                    <p className="text-muted-foreground text-center">No reviews yet</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        <CartComponent/>
      </div>
    </div>
  )
}