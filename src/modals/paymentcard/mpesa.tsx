"use client";

import React, { useState } from "react";
import { Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MpesaModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (phoneNumber: string) => void;
  amount: number;
  currency: string;
}

const MpesaModal: React.FC<MpesaModalProps> = ({
  isOpen,
  onOpenChange,
  onSubmit,
  amount,
  currency,
}) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits and plus sign
    const value = e.target.value.replace(/[^\d+]/g, "");
    setPhoneNumber(value);
    
    // Clear error when user starts typing
    if (error) setError("");
  };

  const validatePhoneNumber = (number: string): boolean => {
    // Basic validation - can be enhanced based on specific M-Pesa requirements
    // This checks for a valid international format with country code
    const regex = /^\+?\d{10,15}$/;
    return regex.test(number);
  };

  const handleSubmit = () => {
    if (!validatePhoneNumber(phoneNumber)) {
      setError("Please enter a valid phone number");
      return;
    }

    setIsLoading(true);
    
    // Log for debugging
    
    // Call the onSubmit function provided by the parent component
    onSubmit(phoneNumber);
    
    // Reset state
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Smartphone className="mr-2 text-green-500" />
            M-Pesa Payment
          </DialogTitle>
          <DialogDescription>
            Enter your mobile number to complete payment of {amount} {currency} via M-Pesa.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="phoneNumber">Mobile Number</Label>
            <Input
              id="phoneNumber"
              type="tel"
              placeholder="e.g. +254712345678"
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
              className={error ? "border-red-500" : ""}
            />
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Enter your phone number in international format, including country code.
            </p>
          </div>
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between">
          <p className="text-xs text-muted-foreground mb-4 sm:mb-0">
            Secure payment powered by M-Pesa
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? 'Processing...' : 'Pay Now'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MpesaModal;

