"use client";

import { Button } from "@/components/ui/Button";
import { HandCoins, Zap, Sparkles, Rocket } from "lucide-react";
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
    borderColor: "border-indigo-200",
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

export default function BillingSettings() {
  const handlePurchase = (bundleName: string) => {
    alert(`${bundleName} purchase functionality is coming soon! Payment gateway integration is in progress.`);
  };

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
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
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
                onClick={() => handlePurchase(bundle.name)}
              >
                Buy Now
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
      </div>
    </div>
  );
}
