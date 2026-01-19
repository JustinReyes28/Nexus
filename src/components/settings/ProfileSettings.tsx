"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";

interface ProfileSettingsProps {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    institution: string | null;
    program: string | null;
    year: string | null;
    image: string | null;
    emailVerified: Date | null;
  } | null;
  session: {
    accessToken?: string;
  } | null;
}

export default function ProfileSettings({ user, session }: ProfileSettingsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    institution: user?.institution || "",
    program: user?.program || "",
    year: user?.year || "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
         headers: {
           "Content-Type": "application/json",
           "Authorization": `Bearer ${session?.accessToken ?? ''}`
         },
        body: JSON.stringify({
          name: formData.name,
          institution: formData.institution,
          program: formData.program,
          year: formData.year,
        }),
      });

      if (!response.ok) {
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || "Failed to update profile";
        } catch (parseError) {
          const textError = await response.text();
          errorMessage = textError || `HTTP error! status: ${response.status}`;
        }
        throw new Error(`${errorMessage} (Status: ${response.status})`);
      }

      const result = await response.json();
       
      toast.success(result.message || "Profile updated successfully!");
      router.refresh();
    } catch (error) {
      console.error("Update profile error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const years = [
    "1st Year", "2nd Year", "3rd Year", "4th Year", "Graduate", "PhD"
  ];

  return (
    <div className="card rounded-xl shadow-md bg-white">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-xl font-heading font-bold text-primary">Profile Settings</h3>
        <p className="text-sm text-gray-500 mt-1">Manage your personal and academic information</p>
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-5 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-crimson/30 focus:ring-4 focus:ring-crimson/5 outline-none transition-all font-body text-gray-800 placeholder:text-gray-300"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={user?.email || ""}
                  className="w-full px-5 py-4 bg-gray-100 border-2 border-gray-100 rounded-2xl outline-none transition-all font-body text-gray-800 cursor-not-allowed"
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">
                  {user?.emailVerified ? "Email verified ✓" : "Email not verified"}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="institution" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">
                  Institution
                </label>
                <input
                  id="institution"
                  name="institution"
                  type="text"
                  value={formData.institution}
                  onChange={handleInputChange}
                  className="w-full px-5 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-crimson/30 focus:ring-4 focus:ring-crimson/5 outline-none transition-all font-body text-gray-800 placeholder:text-gray-300"
                  placeholder="Enter your university/organization"
                />
              </div>

              <div>
                <label htmlFor="program" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">
                  Academic Program
                </label>
                <input
                  id="program"
                  name="program"
                  type="text"
                  value={formData.program}
                  onChange={handleInputChange}
                  className="w-full px-5 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-crimson/30 focus:ring-4 focus:ring-crimson/5 outline-none transition-all font-body text-gray-800 placeholder:text-gray-300"
                  placeholder="Enter your academic program/major"
                />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="year" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">
              Academic Year
            </label>
            <select
              id="year"
              name="year"
              value={formData.year}
              onChange={handleInputChange}
              className="w-full px-5 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-crimson/30 focus:ring-4 focus:ring-crimson/5 outline-none transition-all font-body text-gray-800 appearance-none cursor-pointer"
            >
              <option value="">Select your academic year</option>
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-200">
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="shadow-xl shadow-crimson/10"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}