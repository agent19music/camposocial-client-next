'use client'

import { useState, useEffect, useRef, useContext } from 'react';
import { ShoppingCart, X, Plus, Minus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { AuthContext } from '@/context/authcontext';
import { MarketplaceContext } from '@/context/marketplacecontext';
import {toast} from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface CartItem {
  product_title: string;
  quantity: number;
  price_per_item: number;
  total_item_price: number;
  images: string[];
  id: string;
}

interface CartResponse {
  cart_items: CartItem[];
}

export default function CartComponent() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const cartRef = useRef<HTMLDivElement>(null);

  const router = useRouter()

  const apiEndpoint = process.env.API_ENDPOINT;

  function takeMeToCheckout (){
    return router.push('/marketplace/checkout')
  }


  const {currentUser} = useContext(AuthContext);
  const {updateCart} = useContext(MarketplaceContext);
  

  const getCartItems = async (userId: string): Promise<CartItem[]> => {
    try {
      const response = await fetch(`${apiEndpoint}/cart/${userId}`);
      if (!response.ok) {
        // Handle 404 gracefully - empty cart is normal
        if (response.status === 404) {
          return [];
        }
        throw new Error('Failed to fetch cart data');
      }
      const data: CartResponse = await response.json();
      return data.cart_items || [];
    } catch (error) {
      console.error('Cart fetch error:', error);
      return [];
    }
  };

  useEffect(() => {
    
    const fetchCartItems = async () => {
      if (!currentUser?.id) return;
      
      setLoading(true);
      const items = await getCartItems(currentUser?.id);
      setCartItems(items);
      setLoading(false);
    };
    fetchCartItems();
  }, [currentUser, updateCart]);

  const toggleCart = () => setIsCartOpen(!isCartOpen);

  const removeItem = async (id: string) => {
    try {
      const response = await fetch(`${apiEndpoint}/cart/remove_item`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemId: id }),
      });
  
      if (response.ok) {
        setCartItems(items => items.filter(item => item.id !== id));
      } else {
        toast.error('Failed to remove item');
      }
    } catch (error) {
      toast.error('Error removing item');
    }
  };

  const incrementQuantity = async (id: string, currentQuantity: number) => { // Add currentQuantity as a parameter
    try {
      console.log(JSON.stringify({ itemId: id, quantity: currentQuantity + 1 }));
      
      const response = await fetch(`${apiEndpoint}/cart/update_quantity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemId: id, quantity: currentQuantity + 1 }), 
      });
  
      if (response.ok) {
        const updatedItem = await response.json();
        setCartItems(items =>
          items.map(item => (item.id === id ? { ...item, quantity: updatedItem.quantity } : item))
        );
      } else {
        toast.error('Failed to increment quantity');
      }
    } catch (error) {
      toast.error('Error incrementing quantity');
    }
  };
  
  const decrementQuantity = async (id: string, currentQuantity: number) => { // Add currentQuantity as a parameter
    if (currentQuantity === 1) {
      removeItem(id);
      return;
    }
  
    try {
      const response = await fetch('http://localhost:5000/cart/update_quantity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemId: id, quantity: currentQuantity - 1 }),
      });
  
      if (response.ok) {
        const updatedItem = await response.json();
        setCartItems(items =>
          items.map(item => (item.id === id ? { ...item, quantity: updatedItem.quantity } : item))
        );
      } else {
        toast.error('Failed to decrement quantity');
      }
    } catch (error) {
      toast.error('Error decrementing quantity:');
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price_per_item * item.quantity, 0);

  useEffect(() => {
    const newTotalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    setTotalItems(newTotalItems);
  }, [cartItems]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (cartRef.current && !cartRef.current.contains(event.target as Node)) {
        setIsCartOpen(false);
      }
    };

    if (isCartOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isCartOpen]);

  return (
    <div className="relative">
      <Button
        onClick={toggleCart}
        className="fixed bottom-6 right-6 z-50 rounded-full w-16 h-16 shadow-lg  sm:bottom-12"
        aria-label={`Toggle cart, ${totalItems} items`}
      >
        <ShoppingCart className="h-6 w-6" />
        {totalItems > 0 && (
          <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
            {totalItems}
          </span>
        )}
      </Button>

      <div 
        ref={cartRef}
        className={`
          fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-background shadow-lg transform transition-transform duration-300 ease-in-out
          ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="h-full flex flex-col">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-lg font-semibold">Your Cart</h2>
            <Button variant="ghost" onClick={toggleCart} aria-label="Close cart">
              <X className="h-6 w-6" />
            </Button>
          </div>

          <div className="flex-grow overflow-y-auto p-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : cartItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Your cart is empty</p>
                <p className="text-sm mt-2">Add some products to get started!</p>
              </div>
            ) : (
              cartItems.map(item => (
              <div key={item.id} className="flex items-center justify-between mb-4 pb-4 border-b">
                <div className="flex items-center">
                  <Image
                    src={item.images[0]} // Displaying the first image
                    alt={item.product_title}
                    width={80}
                    height={80}
                    className="rounded-md mr-4"
                  />
                  <div>
                    <h3 className="font-medium">{item.product_title}</h3>
                    <p className="text-sm text-muted-foreground">${item.price_per_item.toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => decrementQuantity(item.id, item.quantity)} 
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="mx-2">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => incrementQuantity(item.id, item.quantity)}
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(item.id)}
                    className="ml-2"
                    aria-label="Remove item"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              ))
            )}
          </div>

          {cartItems.length > 0 && (
            <div className="p-4 border-t">
              <div className="flex justify-between items-center mb-4">
                <span className="font-semibold">Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <Button className="w-full" onClick={() => takeMeToCheckout()}>
                Proceed to Checkout
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
