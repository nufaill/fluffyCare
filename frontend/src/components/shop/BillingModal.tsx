import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import type { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import ShopAxios from "@/api/shop.axios";
import toast from "react-hot-toast";
import PaymentForm from "./PaymentForm";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

// Initialize Stripe with the publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const BillingModal = ({ onClose }: { onClose: () => void }) => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { shopData: shop } = useSelector((state: RootState) => state.shop);

  const shopId = shop?.id;

  const plans = [
    {
      name: "Free",
      price: "₹0",
      amount: 0,
      features: [
        "Profile listing",
        "Up to 5 bookings per month",
        "Basic analytics",
        "Email support",
        "10% service fee",
      ],
    },
    {
      name: "Basic",
      price: "₹3999",
      amount: 399900,
      features: [
        "Enhanced profile listing",
        "Unlimited bookings",
        "Advanced analytics",
        "Priority support",
        "5% service fee",
      ],
      popular: true,
    },
    {
      name: "Premium",
      price: "₹7999",
      amount: 799900,
      features: [
        "Premium profile placement",
        "Unlimited bookings",
        "Comprehensive analytics",
        "24/7 dedicated support",
        "3% service fee",
      ],
    },
  ];

  // Fetch current subscription plan on component mount
  useEffect(() => {
    if (shopId) {
      const fetchSubscription = async () => {
        try {
          setIsLoading(true);
          const response = await ShopAxios.get(`/shops/${shopId}/subscription`);
          setCurrentPlan(response.data.data.plan);
        } catch (error) {
          toast.error("Failed to fetch subscription details");
          console.error("Error fetching subscription:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchSubscription();
    }
  }, [shopId]);

  // Handle plan selection
  const handlePlanSelection = (plan: { name: string; amount: number }) => {
    setSelectedPlan(plan.name);
  };

  // Handle free plan selection
  const handleFreePlanSelection = async () => {
    if (!selectedPlan || !shopId || selectedPlan.toLowerCase() !== "free") return;

    try {
      setIsLoading(true);
      await ShopAxios.patch(`/shops/${shopId}/subscription`, {
        subscription: selectedPlan.toLowerCase(),
      });
      setCurrentPlan(selectedPlan);
      setSelectedPlan(null);
      toast.success("Subscription updated successfully");
    } catch (error) {
      toast.error("Failed to update subscription");
      console.error("Error updating subscription:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle payment success
  const handlePaymentSuccess = () => {
    setCurrentPlan(selectedPlan);
    setSelectedPlan(null);
    toast.success("Subscription updated successfully", {
      style: { background: "#d1fae5", color: "#065f46" },
    });
  };

  // Handle payment error
  const handlePaymentError = (error: string) => {
    toast.error(error, { style: { background: "#fef3c7", color: "#92400e" } });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl sm:max-w-3xl md:max-w-4xl lg:max-w-5xl h-[80vh] sm:h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl md:text-2xl">
            Billing & Plans
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            {currentPlan
              ? `Current Plan: ${currentPlan}`
              : "Choose the plan that works best for your pet care business."}{" "}
            All plans include secure payments, client messaging, and calendar
            management.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-2">
          <div className="grid gap-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1">
            {plans.map((plan, index) => (
              <Card key={index} className={plan.popular ? "border-2 border-yellow-500" : ""}>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg md:text-xl">
                    {plan.name}{" "}
                    {plan.popular && (
                      <span className="text-yellow-600 text-xs sm:text-sm">
                        Most Popular
                      </span>
                    )}
                    {currentPlan === plan.name && (
                      <span className="text-green-600 text-xs sm:text-sm ml-2">
                        Current
                      </span>
                    )}
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    {plan.price}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1 sm:space-y-2">
                    {plan.features.map((feature, i) => (
                      <li
                        key={i}
                        className="flex items-center text-xs sm:text-sm"
                      >
                        <span className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-yellow-500">
                          ✔
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="mt-2 sm:mt-4 w-full text-xs sm:text-sm"
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => handlePlanSelection(plan)}
                    disabled={currentPlan === plan.name || isLoading}
                  >
                    {currentPlan === plan.name
                      ? "Current Plan"
                      : plan.name === "Free"
                        ? "Start Free"
                        : "Get Started"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          {selectedPlan && selectedPlan.toLowerCase() !== "free" && shopId && (
            <Elements stripe={stripePromise}>
              <PaymentForm
                shopId={shopId}
                selectedPlan={selectedPlan}
                amount={
                  plans.find((plan) => plan.name === selectedPlan)?.amount || 0
                }
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            </Elements>
          )}
        </div>
        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            className="text-xs sm:text-sm"
            onClick={onClose}
            disabled={isLoading}
          >
            Close
          </Button>
          {selectedPlan && selectedPlan.toLowerCase() === "free" && (
            <Button
              className="text-xs sm:text-sm"
              onClick={handleFreePlanSelection}
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Confirm Free Plan"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BillingModal;