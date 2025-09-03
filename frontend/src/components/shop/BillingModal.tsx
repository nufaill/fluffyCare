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
import { Badge } from "@/components/ui/Badge";
import type { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import ShopAxios from "@/api/shop.axios";
import toast from "react-hot-toast";
import PaymentForm from "./PaymentForm";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

// Initialize Stripe with the publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface Plan {
  name: string;
  price: string; // Changed to string to match formatted price (e.g., "₹299")
  amount: number; // Keep as number for payment processing (in cents)
  description: string;
  profitPercentage: number;
  durationInDays: number;
  features: string[];
  popular?: boolean;
}

const BillingModal = ({ onClose }: { onClose: () => void }) => {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const { shopData: shop } = useSelector((state: RootState) => state.shop);

  const shopId = shop?.id;

  // Fetch subscription plans and current subscription on component mount
  useEffect(() => {
    const fetchData = async () => {
      if (!shopId) return;

      try {
        setIsLoading(true);

        // Fetch active subscription plans
        const plansResponse = await ShopAxios.get("/subscriptions-active");
        const fetchedPlans = plansResponse.data.data.subscriptions.map((plan: any) => ({
          name: plan.plan,
          price: `₹${(plan.price).toLocaleString("en-IN")}`, 
          amount: plan.price * 100, 
          description: plan.description,
          profitPercentage: plan.profitPercentage,
          durationInDays: plan.durationInDays,
          features: [
            ...plan.description.split("\n"), 
            `Valid for ${plan.durationInDays} days`,
            `${plan.profitPercentage}% service fee`,
          ],
        }));
        setPlans(fetchedPlans);

        // Fetch current subscription plan
        const subscriptionResponse = await ShopAxios.get(`/shops/${shopId}/subscription`);
        setCurrentPlan(subscriptionResponse.data.data.plan?.toLowerCase());
      } catch (error) {
        toast.error("Failed to fetch subscription details or plans");
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [shopId]);

  // Handle plan selection
  const handlePlanSelection = (plan: Plan) => {
    setSelectedPlan(plan);
  };

  // Handle payment success
  const handlePaymentSuccess = () => {
    setCurrentPlan(selectedPlan ? selectedPlan.name.toLowerCase() : null);
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
            {currentPlan ? (
              <>
                Current Plan:{" "}
                <Badge>
                  {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
                </Badge>
              </>
            ) : (
              "Choose the plan that works best for your pet care business."
            )}{" "}
            All plans include secure payments, client messaging, and calendar
            management.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-2">
          {isLoading ? (
            <div>Loading plans...</div>
          ) : plans.length === 0 ? (
            <div>No plans available</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1">
              {plans.map((plan, index) => {
                const planLevel = plan.name.toLowerCase();
                const currentLevel = currentPlan;
                const isCurrentPlan = currentLevel === planLevel;

                return (
                  <Card
                    key={index}
                    className={plan.popular ? "border-2 border-yellow-500" : ""}
                  >
                    <CardHeader>
                      <CardTitle className="text-base sm:text-lg md:text-xl">
                        {plan.name}{" "}
                        {plan.popular && (
                          <span className="text-yellow-600 text-xs sm:text-sm">
                            Most Popular
                          </span>
                        )}
                        {isCurrentPlan && (
                          <Badge className="ml-2 text-xs sm:text-sm bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                            Current
                          </Badge>
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
                              ✓
                            </span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <Button
                        className="mt-2 sm:mt-4 w-full text-xs sm:text-sm"
                        variant={plan.popular ? "default" : "outline"}
                        onClick={() => handlePlanSelection(plan)}
                        disabled={isCurrentPlan || isLoading}
                      >
                        {isCurrentPlan 
                          ? "Current Plan" 
                          : `Select ${plan.name}`
                        }
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
          {selectedPlan && shopId && (
            <Elements stripe={stripePromise}>
              <PaymentForm
                shopId={shopId}
                selectedPlan={selectedPlan}
                amount={selectedPlan.amount}
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BillingModal;