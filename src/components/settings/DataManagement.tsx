// i will Review this later
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

interface DataManagementProps {
  userId: string;
}

interface UserStats {
  accountCreated: string;
  projectsCreated: number;
  tasksCompleted: number;
  storageUsed: string;
}

export default function DataManagement({ userId }: DataManagementProps) {
  const router = useRouter();
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const response = await fetch("/api/user/export", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => response.text());
        const errorMessage = typeof errorData === 'string' ? errorData : errorData?.message || errorData?.error || "Unknown server error";
        throw new Error(`Failed to export data: ${errorMessage}`);
      }

      const data = await response.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "export.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to export data");
    } finally {
    setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword?.trim()) {
      alert("Please enter your password to confirm account deletion");
      return;
    }

    setIsDeleting(true);
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
        const errorData = await response.json().catch(() => response.text());
        const errorMessage = typeof errorData === 'string' ? errorData : errorData?.message || errorData?.error || "Unknown server error";
        throw new Error(`Failed to delete account: ${errorMessage}`);
      }

      router.push("/login?accountDeleted=true");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to delete account");
    } finally {
    setIsDeleting(false);
      setShowDeleteConfirm(false);
      setDeletePassword("");
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await fetch(`/api/user/stats?userId=${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => response.text());
        const errorMessage = typeof errorData === 'string' ? errorData : errorData?.message || errorData?.error || "Unknown server error";
        throw new Error(`Failed to fetch user stats: ${errorMessage}`);
      }

      const data = await response.json();
      setStats(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to fetch user stats");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserStats();
  }, [userId]);

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
              disabled={isExporting || isDeleting}
              className="animate-float-slow"
            >
              {isExporting ? "Preparing Export..." : "Export All Data"}
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
                   autoComplete="current-password"
                 />
                </div>
                <div className="flex gap-4">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeletePassword("");
                    }}
                    className="flex-1 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleDeleteAccount}
                    disabled={isExporting || isDeleting}
                    className="flex-1 border-crimson text-crimson hover:bg-crimson/5 animate-bounce-slow"
                  >
                    {isDeleting ? "Deleting..." : "Permanently Delete Account"}
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isExporting || isDeleting}
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
          {isLoading ? (
            <p className="text-sm text-gray-500">Loading data...</p>
          ) : error ? (
            <p className="text-sm text-red-500">Error: {error}</p>
          ) : stats ? (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Account Created</span>
                <span className="font-semibold">{stats.accountCreated}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Projects Created</span>
                <span className="font-semibold">{stats.projectsCreated}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tasks Completed</span>
                <span className="font-semibold">{stats.tasksCompleted}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Storage Used</span>
                <span className="font-semibold">{stats.storageUsed}</span>
              </div>
              <div className="pt-3 mt-3 border-t border-gray-200">
                <Link href="/privacy" className="text-sm text-blue-600 hover:text-blue-800 underline">
                  View Privacy Policy
                </Link>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No data available</p>
          )}
        </div>
      </div>
    </div>
  );
}