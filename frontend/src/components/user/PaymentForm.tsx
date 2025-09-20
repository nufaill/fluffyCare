import { useState, useEffect } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { AlertCircle, User, Wallet } from "lucide-react";
import Useraxios from "@/api/user.axios";
import { toast } from "react-hot-toast";
import React from "react";
import { walletService } from '@/services/walletService';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/Badge";

interface TimeSlot {
  shopId: string;
  staffId: string | { _id: string; name: string };
  slotDate: string;
  startTime: string;
  endTime: string;
  durationInMinutes: number;
  isBooked: boolean;
  isActive: boolean;
  staffName?: string;
}

interface PaymentFormProps {
  amount: number;
  onSuccess: (data: any) => void;
  onCancel: () => void;
  serviceId: string;
  shopId: string;
  selectedPetId: string;
  selectedSlots: TimeSlot[];
  userId: string;
}

export function PaymentForm({
  amount,
  onSuccess,
  onCancel,
  serviceId,
  shopId,
  selectedPetId,
  selectedSlots,
  userId,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'wallet'>('card');
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [walletLoading, setWalletLoading] = useState(false);

  useEffect(() => {
    // Validate userId when component mounts
    validateFormData();

    // Fetch wallet if user is logged in
    if (userId && userId.trim() !== "") {
      fetchWalletBalance();
    }
  }, [userId, selectedPetId, selectedSlots, serviceId, shopId]);

  const fetchWalletBalance = async () => {
    try {
      setWalletLoading(true);
      const walletData = await walletService.getUserWallet(userId, 'user');
      setWalletBalance(walletData.balance);
    } catch (err: any) {
      console.error('Failed to fetch wallet:', err);
      setError('Failed to load wallet balance. Please try again.');
    } finally {
      setWalletLoading(false);
    }
  };

  const validateFormData = (): boolean => {
    setValidationError(null);

    // Check if user is logged in
    if (!userId || userId.trim() === "") {
      setValidationError("Please log in to complete your booking");
      return false;
    }

    // Check required fields
    if (!serviceId || serviceId.trim() === "") {
      setValidationError("Service information is missing");
      return false;
    }

    if (!shopId || shopId.trim() === "") {
      setValidationError("Shop information is missing");
      return false;
    }

    if (!selectedPetId || selectedPetId.trim() === "") {
      setValidationError("Please select a pet for this appointment");
      return false;
    }

    if (!selectedSlots || selectedSlots.length === 0) {
      setValidationError("Please select a time slot");
      return false;
    }

    if (selectedSlots.length > 1) {
      setValidationError("Please select only one time slot");
      return false;
    }

    const slot = selectedSlots[0];
    if (!slot.slotDate || !slot.startTime || !slot.endTime) {
      setValidationError("Selected time slot is incomplete");
      return false;
    }

    return true;
  };

  const getStaffId = (staffId: string | { _id: string; name: string }): string => {
    return typeof staffId === 'string' ? staffId : staffId._id;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    // Validate form data before processing
    if (!validateFormData()) {
      return;
    }

    if (paymentMethod === 'card') {
      await handleCardPayment();
    } else if (paymentMethod === 'wallet') {
      await handleWalletPayment();
    }
  };

  const handleCardPayment = async () => {
    if (!stripe || !elements) {
      setError("Stripe is not initialized. Please try again.");
      toast.error("Stripe is not initialized. Please try again.", {
        style: { background: "#fef3c7", color: "#92400e" },
      });
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const slot = selectedSlots[0];
      const staffId = getStaffId(slot.staffId);

      // Log the data being sent for debugging
      const paymentData = {
        amount: amount * 100,
        currency: "inr",
        serviceId,
        shopId,
        userId: userId.trim(),
        petId: selectedPetId.trim(),
        staffId,
        date: slot.slotDate,
        startTime: slot.startTime,
        endTime: slot.endTime,
      };

      console.log("Creating payment intent with data:", paymentData);

      const response = await Useraxios.post("/payment/create-payment-intent", paymentData);
      const { clientSecret } = response.data;

      const cardElement = elements.getElement(CardElement);

      if (!cardElement) {
        throw new Error("Card element not found");
      }

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      if (!paymentIntent) {
        throw new Error("Payment intent not found");
      }

      // Confirm the booking
      const confirmData = {
        paymentIntentId: paymentIntent.id,
        serviceId,
        shopId,
        userId: userId.trim(),
        petId: selectedPetId.trim(),
        staffId,
        date: slot.slotDate,
        startTime: slot.startTime,
        endTime: slot.endTime,
      };

      console.log("Confirming payment with data:", confirmData);

      const confirmResponse = await Useraxios.post("/confirm-payment", confirmData);

      if (confirmResponse.data.success) {
        toast.success("Booking confirmed successfully!", {
          style: { background: "#dcfce7", color: "#15803d" },
        });
        onSuccess(confirmResponse.data.data);
      } else {
        throw new Error(confirmResponse.data.message || "Failed to confirm booking");
      }

    } catch (err: any) {
      console.error("Payment error:", err.response?.data || err);
      const errorMessage = err.response?.data?.message || err.message || "An error occurred during payment. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage, {
        style: { background: "#fef3c7", color: "#92400e" },
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleWalletPayment = async () => {
    if (walletBalance === null || walletBalance < amount) {
      setError("Insufficient wallet balance");
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const slot = selectedSlots[0];
      const staffId = getStaffId(slot.staffId);

      const paymentData = {
        amount,
        currency: "inr",
        serviceId,
        shopId,
        userId: userId.trim(),
        petId: selectedPetId.trim(),
        staffId,
        date: slot.slotDate,
        startTime: slot.startTime,
        endTime: slot.endTime,
      };

      console.log("Processing wallet payment with data:", paymentData);

      const response = await Useraxios.post("/pay-with-wallet", paymentData);

      if (response.data.success) {
        toast.success("Booking confirmed successfully with wallet!", {
          style: { background: "#dcfce7", color: "#15803d" },
        });
        onSuccess(response.data.data);
      } else {
        throw new Error(response.data.message || "Failed to confirm booking");
      }

    } catch (err: any) {
      console.error("Wallet payment error:", err.response?.data || err);
      const errorMessage = err.response?.data?.message || err.message || "An error occurred during wallet payment. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage, {
        style: { background: "#fef3c7", color: "#92400e" },
      });
    } finally {
      setProcessing(false);
    }
  };

  // If there's a validation error, show it prominently
  if (validationError) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border-2 border-red-200 p-6 rounded-lg text-center">
          <User className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Cannot Process Payment</h3>
          <p className="text-red-700 mb-4">{validationError}</p>
          {validationError.includes("log in") && (
            <Button
              onClick={() => {
                // Redirect to login page or trigger login modal
                window.location.href = "/login";
              }}
              className="bg-red-600 text-white hover:bg-red-700 font-semibold mr-4"
            >
              Go to Login
            </Button>
          )}
          <Button
            onClick={onCancel}
            variant="outline"
            className="border-red-600 text-red-600 hover:bg-red-50"
          >
            Close
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Booking Summary */}
      <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-800 mb-2">Booking Summary</h3>
        <div className="space-y-1 text-sm text-gray-600">
          <p>Amount: ₹{amount}</p>
          <p>Date: {selectedSlots[0]?.slotDate}</p>
          <p>Time: {selectedSlots[0]?.startTime} - {selectedSlots[0]?.endTime}</p>
        </div>
      </div>

      {/* Payment Method Tabs */}
      <Tabs value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as 'card' | 'wallet')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="card">Card</TabsTrigger>
          <TabsTrigger value="wallet">Wallet</TabsTrigger>
        </TabsList>
        <TabsContent value="card" className="space-y-4">
          <div className="border-2 border-gray-200 rounded-lg p-4 bg-white">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Card Details
            </label>
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: "16px",
                    color: "#000",
                    "::placeholder": {
                      color: "#6b7280",
                    },
                  },
                  invalid: {
                    color: "#b91c1c",
                  },
                },
              }}
              className="p-2 border border-gray-300 rounded-lg"
            />
          </div>
        </TabsContent>
        <TabsContent value="wallet" className="space-y-4">
          <div className="border-2 border-gray-200 rounded-lg p-4 bg-white">
            {walletLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading wallet...</p>
              </div>
            ) : walletBalance !== null ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Available Balance</span>
                  <Badge variant="secondary" className="text-lg font-bold">
                    ₹{walletBalance.toFixed(2)}
                  </Badge>
                </div>
                {walletBalance < amount && (
                  <div className="bg-yellow-50 border border-yellow-200 p-2 rounded flex items-center gap-2 text-yellow-800 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    Insufficient balance. Need ₹{ (amount - walletBalance).toFixed(2) } more.
                  </div>
                )}
              </div>
            ) : (
              <p className="text-center text-gray-600">Unable to load wallet balance</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      {error && (
        <div className="bg-red-50 border-2 border-red-200 p-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}
      
      <div className="flex gap-4 justify-end">
        <Button
          type="button"
          onClick={onCancel}
          variant="outline"
          className="border-black text-black hover:bg-black hover:text-white"
          disabled={processing}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!stripe || processing || (paymentMethod === 'wallet' && (walletBalance === null || walletBalance < amount || walletLoading))}
          className="bg-black text-white hover:bg-gray-800 font-semibold"
        >
          {processing ? "Processing..." : paymentMethod === 'card' ? `Pay ₹${amount} with Card` : `Pay ₹${amount} with Wallet`}
        </Button>
      </div>
    </form>
  );
}