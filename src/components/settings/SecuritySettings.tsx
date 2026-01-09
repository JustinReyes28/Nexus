"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface SecuritySettingsProps {
  user: {
    id: string;
    email: string | null;
  } | null;
  hasGoogleAccount: boolean;
}

export default function SecuritySettings({ user, hasGoogleAccount }: SecuritySettingsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      alert("New passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/user/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to change password");
      }

      alert("Password changed successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
      setIsChangingPassword(false);
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to change password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleDisconnect = async () => {
    if (!confirm("Are you sure you want to disconnect your Google account?")) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/google/unlink", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to disconnect Google account");
      }

      alert("Google account disconnected successfully!");
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to disconnect Google account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleConnect = async () => {
    // This would typically redirect to Google OAuth flow
    alert("Google account connection would be handled by OAuth flow");
  };

  return (
    <div className="card rounded-xl shadow-md bg-white">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-xl font-heading font-bold text-primary">Authentication & Security</h3>
        <p className="text-sm text-gray-500 mt-1">Manage password and connected accounts</p>
      </div>

      <div className="p-6 space-y-8">
        {/* Change Password Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-heading font-semibold text-primary">Change Password</h4>
            {!isChangingPassword && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsChangingPassword(true)}
                className="text-crimson hover:text-crimson/80"
              >
                Change Password
              </Button>
            )}
          </div>

          {isChangingPassword && (
            <form onSubmit={handleSubmitPassword} className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">
                  Current Password
                </label>
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-5 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-crimson/30 focus:ring-4 focus:ring-crimson/5 outline-none transition-all font-body text-gray-800"
                  placeholder="Enter current password"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="newPassword" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">
                    New Password
                  </label>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-5 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-crimson/30 focus:ring-4 focus:ring-crimson/5 outline-none transition-all font-body text-gray-800"
                    placeholder="Enter new password"
                    required
                    minLength={8}
                  />
                </div>

                <div>
                  <label htmlFor="confirmNewPassword" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">
                    Confirm New Password
                  </label>
                  <input
                    id="confirmNewPassword"
                    name="confirmNewPassword"
                    type="password"
                    value={passwordData.confirmNewPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-5 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-crimson/30 focus:ring-4 focus:ring-crimson/5 outline-none transition-all font-body text-gray-800"
                    placeholder="Confirm new password"
                    required
                    minLength={8}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsChangingPassword(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isLoading}
                  className="flex-1 shadow-xl shadow-crimson/10"
                >
                  Save New Password
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Connected Accounts Section */}
        <div>
          <h4 className="text-lg font-heading font-semibold text-primary mb-4">Connected Accounts</h4>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <span className="font-bold text-crimson">G</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Google Account</p>
                  <p className="text-sm text-gray-500">
                    {hasGoogleAccount ? "Connected" : "Not connected"}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {hasGoogleAccount ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleGoogleDisconnect}
                    disabled={isLoading}
                    className="text-crimson border-crimson hover:bg-crimson/5"
                  >
                    Disconnect
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleGoogleConnect}
                    disabled={isLoading}
                  >
                    Connect
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}