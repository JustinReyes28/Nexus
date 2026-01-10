"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface DataManagementProps {
  userId: string;
}

export default function DataManagement({ userId }: DataManagementProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");

  const handleExportData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/user/export", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to export data");
      }

      const data = await response.json();
      // In a real implementation, this would download a file
      alert(`Data export would download: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to export data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      alert("Please enter your password to confirm account deletion");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/user/account", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: deletePassword,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete account");
      }

      alert("Account deleted successfully. You will be logged out.");
      // In a real implementation, this would redirect to login
      router.push("/login");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to delete account");
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
      setDeletePassword("");
    }
  };

  return (
    <div className="card rounded-xl shadow-md bg-white">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-xl font-heading font-bold text-primary">Data Management</h3>
        <p className="text-sm text-gray-500 mt-1">Export or delete your account data</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Export Data Section */}
        <div>
          <h4 className="text-lg font-heading font-semibold text-primary mb-3">Export Your Data</h4>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <p className="text-sm text-gray-600 mb-4">
              Download a copy of all your data including projects, tasks, settings, and preferences.
            </p>
            <Button
              variant="secondary"
              onClick={handleExportData}
              disabled={isLoading}
              className="animate-float-slow"
            >
              {isLoading ? "Preparing Export..." : "Export All Data"}
            </Button>
          </div>
        </div>

        {/* Delete Account Section */}
        <div>
          <h4 className="text-lg font-heading font-semibold text-crimson mb-3">Delete Your Account</h4>
          <div className="bg-red-50 rounded-xl p-4 border border-red-200">
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Warning:</strong> This action is permanent and cannot be undone.
              </p>
              <p className="text-sm text-gray-600">
                All your projects, tasks, data, and account information will be permanently deleted.
              </p>
            </div>

            {showDeleteConfirm ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Please enter your password to confirm account deletion:
                </p>
                <div>
                  <label htmlFor="deletePassword" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">
                    Current Password
                  </label>
                  <input
                    id="deletePassword"
                    name="deletePassword"
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    className="w-full px-5 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-crimson/30 focus:ring-4 focus:ring-crimson/5 outline-none transition-all font-body text-gray-800"
                    placeholder="Enter your password"
                    required
                  />
                </div>
                <div className="flex gap-4">
                  <Button
                    variant="ghost"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleDeleteAccount}
                    disabled={isLoading}
                    className="flex-1 border-crimson text-crimson hover:bg-crimson/5 animate-bounce-slow"
                  >
                    {isLoading ? "Deleting..." : "Permanently Delete Account"}
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isLoading}
                className="border-crimson text-crimson hover:bg-crimson/5 animate-bounce-slow"
              >
                Delete My Account
              </Button>
            )}
          </div>
        </div>

        {/* Data Information */}
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
          <h4 className="text-md font-heading font-semibold text-primary mb-3">Your Data Information</h4>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Account Created</span>
              <span className="font-semibold">Date not available</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Projects Created</span>
              <span className="font-semibold">Data not available</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Tasks Completed</span>
              <span className="font-semibold">Data not available</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Storage Used</span>
              <span className="font-semibold">Data not available</span>
            </div>
            <div className="pt-3 mt-3 border-t border-gray-200">
              <a href="/privacy" className="text-sm text-blue-600 hover:text-blue-800 underline">
                View Privacy Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}