"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { HandCoins, Zap, Sparkles, Rocket, CheckCircle, AlertCircle } from "lucide-react";
import { BILLING_CONSTANTS } from "@/config/constants";

const BUNDLES = [
  {
    id: "starter",
    name: "Starter Bundle",
    credits: 100,
    price: 2,
    Icon: Zap,
    iconColor: "text-teal",
    description: "Perfect for light users and quick tasks.",
    color: "bg-teal/5",
    borderColor: "border-teal/20",
  },
  {
    id: "pro",
    name: "Pro Bundle",
    credits: 500,
    price: 8,
    Icon: Sparkles,
    iconColor: "text-indigo-500",
    description: "The best value for individual researchers.",
    color: "bg-indigo-50",
    borderColor: "border-crimson/30",
    popular: true,
  },
  {
    id: "power",
    name: "Power Bundle",
    credits: 1000,
    price: 12,
    Icon: Rocket,
    iconColor: "text-orange-500",
    description: "For users who need maximum AI power.",
    color: "bg-orange-50",
    borderColor: "border-orange-200",
  },
];

interface PaymentHistory {
  id: string;
  amount: number;
  creditsPurchased: number;
  bundleType: string;
  status: string;
  createdAt: string;
}

export default function BillingSettings() {
  const [loadingBundle, setLoadingBundle] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);
  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showNotImplementedModal, setShowNotImplementedModal] = useState(false);
  const [upgradedFromFree, setUpgradedFromFree] = useState(false);

  const showSuccess = (message: string) => {
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    setNotification({ type: "success", message });
    notificationTimeoutRef.current = setTimeout(() => setNotification(null), 5000);
  };

  const showError = (message: string) => {
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    setNotification({ type: "error", message });
    notificationTimeoutRef.current = setTimeout(() => setNotification(null), 5000);
  };

  const showInfo = (message: string) => {
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    setNotification({ type: "info", message });
    notificationTimeoutRef.current = setTimeout(() => setNotification(null), 5000);
  };

  const fetchPaymentHistory = async () => {
    try {
      const response = await fetch("/api/payments/history");
      if (response.ok) {
        const data = await response.json();
        setPaymentHistory(data);
      }
    } catch (error) {
      console.error("Failed to fetch payment history:", error);
    }
  };

  const handleBuyCredits = async (bundleType: "starter" | "pro" | "power") => {
    setShowNotImplementedModal(true);
    return;

    try {
      setLoadingBundle(bundleType);
      showInfo("Creating payment session...");

      // Step 1: Create payment intent
      const createResponse = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bundleType }),
      });

      if (!createResponse.ok) {
        throw new Error("Failed to create payment session");
      }

      const { paymentIntentId, clientSecret } = await createResponse.json();
      showInfo("Processing payment...");

      // Step 2: Simulate payment processing (3 second delay to show loading)
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Step 3: Confirm payment and grant credits
      const confirmResponse = await fetch("/api/payments/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentIntentId }),
      });

      if (!confirmResponse.ok) {
        throw new Error("Payment confirmation failed");
      }

      const result = await confirmResponse.json();

      if (result.success) {
        // Update local user state would be handled by parent component
        showSuccess(`Successfully purchased ${result.payment.creditsPurchased} credits!`);

        // Check if user was auto-upgraded from FREE to PREMIUM
        if (result.user.tier === "PREMIUM") {
          setUpgradedFromFree(true);
          setShowUpgradeModal(true);
        }

    // Refresh payment history
    await fetchPaymentHistory();
      } else {
        showError("Payment failed. Please try again.");
      }
    } catch (error) {
      console.error("Payment error:", error);
      showError("Payment failed. Please try again.");
    } finally {
      setLoadingBundle(null);
    }
  };

  // Fetch payment history on component mount
  useEffect(() => {
    fetchPaymentHistory();
    
    // Cleanup function to clear notification timeout on unmount
    return () => {
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
        notificationTimeoutRef.current = null;
      }
    };
  }, []);

  return (
    <div className="card rounded-xl shadow-md border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-2">
          <HandCoins className="w-5 h-5 text-teal" />
          <h3 className="text-xl font-heading font-bold text-primary">Buy Credits</h3>
        </div>
        <p className="text-sm text-gray-500 mt-1">Purchase additional AI credits to continue using premium features.</p>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {BUNDLES.map((bundle) => (
            <div
              key={bundle.id}
              className={`relative flex flex-col p-6 rounded-2xl border-2 transition-all hover:shadow-lg ${
                bundle.borderColor
              } ${bundle.color} ${
                bundle.popular ? "shadow-lg z-10 border-4" : ""
              }`}
            >
              {bundle.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-crimson text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-md border border-crimson/20">
                  Most Popular
                </div>
              )}

              <div className="mb-4"><bundle.Icon className={`w-6 h-6 ${bundle.iconColor}`} /></div>

              <h4 className="text-lg font-heading font-bold text-gray-900 mb-1">
                {bundle.name}
              </h4>
              <p className="text-sm text-gray-500 mb-4 h-10">{bundle.description}</p>

              <div className="mt-auto pt-4 border-t border-gray-100 italic text-[10px] text-gray-400">
                ${(bundle.price / bundle.credits).toFixed(4)} per credit
              </div>

              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-3xl font-heading font-extrabold text-gray-900">
                  {bundle.credits}
                </span>
                <span className="text-gray-500 font-medium text-sm">Credits</span>
              </div>

              <div className="text-2xl font-bold text-teal mt-1 mb-6">
                ${bundle.price}
              </div>

              <Button
                variant={bundle.popular ? "popular" : "outline"}
                className="w-full font-bold"
                onClick={() => handleBuyCredits(bundle.id as "starter" | "pro" | "power")}
                disabled={loadingBundle === bundle.id}
              >
                {loadingBundle === bundle.id ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Processing...
                  </div>
                ) : (
                  "Buy Now"
                )}
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-3">
          <div className="p-1 bg-amber-100 rounded-lg">
            <Sparkles className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-900">{BILLING_CONSTANTS.PROMOTIONAL_OFFER.TITLE}</p>
            <p className="text-xs text-amber-800 mt-0.5">
              {BILLING_CONSTANTS.PROMOTIONAL_OFFER.BODY}
            </p>
          </div>
        </div>

        {paymentHistory.length > 0 && (
          <div className="mt-8">
            <h4 className="text-lg font-heading font-bold text-gray-900 mb-4">Payment History</h4>
            <div className="space-y-3">
              {paymentHistory.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {payment.bundleType.charAt(0).toUpperCase() + payment.bundleType.slice(1)} Bundle
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-teal">+{payment.creditsPurchased} credits</p>
                    <p className="text-sm text-gray-500">${(payment.amount / 100).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-heading font-bold text-gray-900">
                Congratulations! You're now a Premium User!
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              You've been automatically upgraded from FREE to PREMIUM tier with {upgradedFromFree ? "1000" : "additional"} AI credits. Enjoy unlimited access to all premium features!
            </p>
            <Button
              className="w-full font-bold"
              onClick={() => setShowUpgradeModal(false)}
            >
              Got it!
            </Button>
          </div>
        </div>
      )}

      {showNotImplementedModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex flex-col items-center text-center">
              <div className="mb-6 p-4 bg-amber-100 rounded-full">
                <AlertCircle className="w-12 h-12 text-amber-600" />
              </div>
              <h3 className="text-2xl font-heading font-bold text-gray-900 mb-2">
                Coming Soon!
              </h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Thank you for your interest in Nexus Premium! The payment and credit purchase system is currently in development. 
                <br /><br />
                We're working hard to bring you a seamless billing experience. Please check back soon!
              </p>
              <Button
                variant="popular"
                className="w-full py-6 text-lg font-bold"
                onClick={() => setShowNotImplementedModal(false)}
              >
                Got it, thanks!
              </Button>
            </div>
          </div>
        </div>
      )}

      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border ${
            notification.type === "success"
              ? "bg-green-50 border-green-200"
              : notification.type === "error"
              ? "bg-red-50 border-red-200"
              : "bg-blue-50 border-blue-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === "success" ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : notification.type === "error" ? (
              <AlertCircle className="w-5 h-5 text-red-600" />
            ) : (
              <div className="w-5 h-5" />
            )}
            <p
              className={`font-medium ${
                notification.type === "success"
                  ? "text-green-900"
                  : notification.type === "error"
                  ? "text-red-900"
                  : "text-blue-900"
              }`}
            >
              {notification.message}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}