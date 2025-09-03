import { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import ShopAxios from "@/api/shop.axios";
import toast from "react-hot-toast";

interface Plan {
    name: string;
    price: string;
    amount: number;
    description: string;
    profitPercentage: number;
    durationInDays: number;
    features: string[];
    popular?: boolean;
}

interface PaymentFormProps {
    shopId: string;
    selectedPlan: Plan;
    amount: number;
    onSuccess: () => void;
    onError: (error: string) => void;
}

const PaymentForm = ({ shopId, selectedPlan, amount, onSuccess, onError }: PaymentFormProps) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isLoading, setIsLoading] = useState(false);
    const [paymentError, setPaymentError] = useState<string | null>(null);

    const handlePayment = async () => {
        if (!stripe || !elements) {
            setPaymentError("Payment system not initialized. Please try again.");
            onError("Payment system not initialized");
            return;
        }

        setIsLoading(true);
        setPaymentError(null);

        try {

            const subscriptionResponse = await ShopAxios.get(`/subscriptions/by-name/${selectedPlan.name}`);
            const subscriptionId = subscriptionResponse.data.data.subscription._id;


            // Calculate subscription end date
            const subscriptionStart = new Date();
            const subscriptionEnd = new Date();
            subscriptionEnd.setDate(subscriptionStart.getDate() + selectedPlan.durationInDays);


            const response = await ShopAxios.post("/payment/create-subscription-payment-intent", {
                amount,
                currency: "inr",
                shopId,
                planName: selectedPlan.name,
                subscriptionId,
                profitPercentage: selectedPlan.profitPercentage,
                durationInDays: selectedPlan.durationInDays
            });

            const { clientSecret } = response.data;

            const result = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement)!,
                    billing_details: { name: shopId },
                },
            });

            if (result.error) {
                setPaymentError(result.error.message || "Payment failed. Please try again.");
                onError(result.error.message || "Payment failed");
                return;
            }

            if (result.paymentIntent?.status === "succeeded") {
                await ShopAxios.post("/payment/confirm-subscription-payment", {
                    paymentIntentId: result.paymentIntent.id,
                    shopId,
                    planName: selectedPlan.name,
                    subscriptionId,
                    profitPercentage: selectedPlan.profitPercentage,
                    durationInDays: selectedPlan.durationInDays,
                    subscriptionStart: subscriptionStart.toISOString(),
                    subscriptionEnd: subscriptionEnd.toISOString(),
                    amount,
                    currency: "inr"
                });

                toast.success("Payment successful! Subscription updated.", {
                    style: { background: "#d1fae5", color: "#065f46" },
                });
                onSuccess();
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "An error occurred during payment.";
            setPaymentError(errorMessage);
            onError(errorMessage);
            toast.error(errorMessage, { style: { background: "#fef3c7", color: "#92400e" } });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mt-4 bg-white border-2 border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2">Enter Payment Details</h3>
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                    <strong>Selected Plan:</strong> {selectedPlan.name}
                </p>
                <p className="text-sm text-blue-800">
                    <strong>Commission:</strong> {selectedPlan.profitPercentage}%
                </p>
                <p className="text-sm text-blue-800">
                    <strong>Duration:</strong> {selectedPlan.durationInDays} days
                </p>
            </div>
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
                                "::placeholder": { color: "#6b7280" },
                            },
                            invalid: { color: "#b91c1c" },
                        },
                    }}
                    className="p-2 border border-gray-300 rounded-lg"
                />
            </div>
            {paymentError && (
                <div className="bg-red-50 border-2 border-red-200 p-3 rounded-lg flex items-center gap-2 mt-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p className="text-red-800 text-sm">{paymentError}</p>
                </div>
            )}
            <Button
                className="mt-4 w-full text-sm"
                onClick={handlePayment}
                disabled={isLoading || !stripe || !elements}
            >
                {isLoading ? "Processing..." : `Pay ₹${(amount / 100).toFixed(2)}`}
            </Button>
        </div>
    );
};

export default PaymentForm;