"use client";

import { createContext, ReactNode, useState, useEffect, useContext } from "react";
import { nanoid } from "nanoid";
import { useRouter } from "next/navigation";
import { AuthContext } from "./authcontext";
import { get } from "http";
import { set } from "date-fns";

// Product interface to define the structure of each product
interface Product {
  id: string;
  average_rating: number;
  category: string;
  created_at: string;
  images: string[];
  title: string;
  brand: string;
  price: number;
  sellerAvatar: string| null;
  sellerIsVerified: boolean;
  sellerName:string;
  seller_id: string;
  description: string;
  rating: number;
  reviewsCount: number;
  seller: {
      name: string;
      avatar: string;
  };
  reviews: {
      username: string;
      rating: number;
      text: string;
      id: number;
      avatar: string;
  }[];
  variations: {
    id: string;
    name: string;
    price: number;
    stock: number;
    value: string;
}[];
  isBestseller?: boolean;
  isNew?: boolean;
}

interface Seller {
  name: string;
  avatar: string;
  id: string;
  sales: number;
  rating: number;
  is_verified: boolean;


}

// MarketplaceContextProps to define the types used in the context
interface MarketplaceContextProps {
  products: Product[];
  isLoading: boolean;
  onchange: boolean;
  isPayed: boolean;
  setOnchange: (value: boolean) => void;
  setIsPayed : (value: boolean) => void;
  selectedProduct: Product | null; // Null when no product is selected
  setSelectedProduct: (product: Product | null) => void; // Setter function for selectedProduct
  navigateToSingleProductView: (product: Product) => void; // Add this to the interface
  navigateToSingleSellerView: (seller: Seller) => void; // Add this to the interface
  setSelectedSeller : (seller: Seller | null) => void;
  selectedSeller: Seller | null;
  updateCart: boolean;
  setUpdateCart: (value: boolean) => void;
  getLatestOrderId: () => Promise<number | null>;
  setOrderId: (value: string | null) => void;
  orderId: string | null;
  sellerStatusChange: boolean;
  setSellerStausChange: (value: boolean) => void;

}

// Default values for the context
const defaultValue: MarketplaceContextProps = {
  products: [],
  isLoading: false,
  isPayed: false,
  onchange: false,
  selectedProduct: null,
  selectedSeller: null,
  setSelectedProduct: () => {}, // No-op function for default
  setSelectedSeller: () =>{},
  setIsPayed: ()=> {},
  setOnchange: () => {},
  navigateToSingleProductView: () => {},
  navigateToSingleSellerView: () => {}, // No-op function for default
  setUpdateCart: () => {},
  updateCart: false,
  getLatestOrderId: async () => null,
  setOrderId: () => {},
  orderId: null,
  sellerStatusChange: false,
  setSellerStausChange: () => {},
};

// Create the MarketplaceContext with default values
export const MarketplaceContext = createContext<MarketplaceContextProps>(defaultValue);

// MarketplaceProviderProps to define the children prop type
interface MarketplaceProviderProps {
  children: ReactNode;
}

// MarketplaceProvider component to wrap the application
export default function MarketplaceProvider({ children }: MarketplaceProviderProps) {
  const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT; // Get the API endpoint from environment variables
  const {authToken} = useContext(AuthContext); // Get the authToken from the AuthContext

  // State declarations
  const [isLoading, setIsLoading] = useState(false);
  const [isPayed, setIsPayed]= useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [onchange, setOnchange] = useState(false);
  const [category, setCategory] = useState("Fun"); // Default category
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null); 
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null); // Initially no yap is selected
  const [updateCart, setUpdateCart] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [sellerStatusChange, setSellerStausChange] = useState(false);   



  const router = useRouter(); // Initialize the router

  // Fetch yaps when the component mounts or when `onchange` changes
  useEffect(() => {
    setIsLoading(true);
    fetch(`${apiEndpoint}/products`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setFilteredProducts(data); // Initially set filteredYaps to all yaps
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setProducts([]);
        setFilteredProducts([]);
        setIsLoading(false);
      });
  }, [onchange]);

  // Function to create a slug from yap id
  function slugify(int: string): string {
    const baseSlug = int;
    // Generate a nanoid without hyphens
    const safeNanoid = nanoid(12).replace(/-/g, ''); 
    return `${baseSlug}-${safeNanoid}`;
  }

  // Function to navigate to a single product view
  function navigateToSingleProductView(product: Product) {    
    const slug = slugify(product.id);
    
    setSelectedProduct(product);    
    router.push(`/marketplace/products/${slug}`); // Navigate to the single product page
    

  }

  async function getLatestOrderId() {
    const response = await fetch(`${apiEndpoint}/get_latest_order_id`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      console.error('Failed to get latest order');
      return null;
    }

    const data = await response.json();
    return data;
   }

   // Function to navigate to a single seller view
   function navigateToSingleSellerView(seller:Seller ) {    
    const slug = slugify(seller.id);
    
    setSelectedSeller(seller);    
    router.push(`/marketplace/sellers/${slug}`); // Navigate to the single product page
    

  }

  // The context data that will be passed down to components
  const contextData = {
    products: filteredProducts,
    selectedProduct,
    isLoading,
    onchange,
    setOnchange,
    setSelectedProduct,
    navigateToSingleProductView,
    navigateToSingleSellerView,
    selectedSeller,
    isPayed,
    setIsPayed,
    updateCart,
    setUpdateCart,
    setSelectedSeller,
    getLatestOrderId,
    setOrderId,
    orderId,
    sellerStatusChange,
    setSellerStausChange
    
    // Include this in the context data
  };

  // Render the provider and pass the context data
  return (
    <MarketplaceContext.Provider value={contextData}>
      {children}
    </MarketplaceContext.Provider>
  );
}

// Custom hook to use the MarketplaceContext
export const useMarketplaceContext = () => useContext(MarketplaceContext);
