// i will Review this later
"use client";

import React, { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { features } from "@/lib/featuresData";
import { FeatureCard } from "./FeatureCard";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { FeatureVariant } from "@/lib/featureColors";

type Category = "all" | FeatureVariant;

const categories: { id: Category; label: string }[] = [
  { id: "all", label: "All Features" },
  { id: "ai", label: "AI Powered" },
  { id: "collaboration", label: "Collaboration" },
  { id: "management", label: "Management" },
  { id: "research", label: "Research" },
];

export const FeaturesSection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<Category>("all");

  const filteredFeatures = useMemo(() => {
    if (activeCategory === "all") return features;
    return features.filter((f) => f.variant === activeCategory);
  }, [activeCategory]);

  return (
    <section id="features" className="py-24 bg-canvas relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-grain opacity-5 pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-teal/5 rounded-full blur-3xl" />
      <div className="absolute top-1/2 -left-24 w-64 h-64 bg-crimson/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-heading font-extrabold text-gray-900 mb-6 tracking-tight">
            What <span className="text-crimson">Nexus</span> Offers
          </h2>
          <p className="text-lg text-gray-600 font-body leading-relaxed">
            Your complete capstone toolkit. From initial idea to final defense, 
            we've built everything you need to succeed without the burnout.
          </p>
        </div>

        {/* Category Tabs */}
        <div role="tablist" className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((category) => {
            const tabId = `tab-${category.id}`;
            return (
              <button
                key={category.id}
                id={tabId}
                role="tab"
                aria-selected={activeCategory === category.id}
                aria-controls="features-grid"
                onClick={() => setActiveCategory(category.id)}
                className={cn(
                  "px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200 border-2",
                  activeCategory === category.id
                    ? "bg-gray-900 text-white border-gray-900 shadow-md scale-105"
                    : "bg-white text-gray-600 border-gray-100 hover:border-gray-300"
                )}
              >
                {category.label}
              </button>
            );
          })}
        </div>

        {/* Feature Grid */}
        <div id="features-grid" role="tabpanel" aria-labelledby={`tab-${activeCategory}`} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {filteredFeatures.map((feature, index) => (
            <div
              key={feature.id}
              className="animate-fade-in-up"
              style={{
                animationDelay: `${index * 50}ms`,
                animationFillMode: "both",
              }}
            >
              <FeatureCard
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
                variant={feature.variant}
                rotation={index % 2 === 0 ? 0.5 : -0.5} // Subtle anti-AI rotation
              />
            </div>
          ))}
        </div>

        {/* CTA Banner */}
        <div className="bg-white rounded-2xl p-8 lg:p-12 border border-gray-100 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-8 max-w-5xl mx-auto">
          <div className="text-center lg:text-left">
            <h3 className="text-2xl lg:text-3xl font-heading font-bold text-gray-900 mb-2">
              Ready to experience Nexus?
            </h3>
            <p className="text-gray-600 font-body">
              Join thousands of students building their future today.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/register" passHref legacyBehavior>
              <Button asChild size="lg" className="w-full sm:w-auto">
                <a>Get Started for Free</a>
              </Button>
            </Link>
            <Link href="/demo" passHref legacyBehavior>
              <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                <a>Watch Demo</a>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
