"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

interface NotificationSettingsProps {
  preferences: {
    id: string;
    userId: string;
    emailProjectDeadlines: boolean;
    emailTeamUpdates: boolean;
    emailAICompletions: boolean;
    emailFeatureAnnouncements: boolean;
    inAppTaskUpdates: boolean;
    inAppMentions: boolean;
    inAppAINudges: boolean;
  } | null;
  userId: string;
}

export default function NotificationSettings({ preferences, userId }: NotificationSettingsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    emailProjectDeadlines: preferences?.emailProjectDeadlines ?? true,
    emailTeamUpdates: preferences?.emailTeamUpdates ?? true,
    emailAICompletions: preferences?.emailAICompletions ?? true,
    emailFeatureAnnouncements: preferences?.emailFeatureAnnouncements ?? true,
    inAppTaskUpdates: preferences?.inAppTaskUpdates ?? true,
    inAppMentions: preferences?.inAppMentions ?? true,
    inAppAINudges: preferences?.inAppAINudges ?? true,
  });

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Check if there are unsaved changes
    const initialState = {
      emailProjectDeadlines: preferences?.emailProjectDeadlines ?? true,
      emailTeamUpdates: preferences?.emailTeamUpdates ?? true,
      emailAICompletions: preferences?.emailAICompletions ?? true,
      emailFeatureAnnouncements: preferences?.emailFeatureAnnouncements ?? true,
      inAppTaskUpdates: preferences?.inAppTaskUpdates ?? true,
      inAppMentions: preferences?.inAppMentions ?? true,
      inAppAINudges: preferences?.inAppAINudges ?? true,
    };

    const hasUnsavedChanges = Object.keys(formData).some(
      key => formData[key as keyof typeof formData] !== initialState[key as keyof typeof initialState]
    );

    setHasChanges(hasUnsavedChanges);
  }, [formData, preferences]);

  const handleToggleChange = (field: keyof typeof formData) => {
    setFormData(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/user/notifications", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          userId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update notification preferences");
      }

      router.refresh();
    } catch (error) {
      console.error(error instanceof Error ? error.message : "Failed to update notification preferences");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card rounded-xl shadow-md bg-white">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-xl font-heading font-bold text-primary">Notification Settings</h3>
        <p className="text-sm text-gray-500 mt-1">Control how you receive updates and alerts</p>
        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-700">
            <strong>Note:</strong> Notification settings are not yet fully implemented. This feature is coming soon!
          </p>
        </div>
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Email Notifications */}
          <div>
            <h4 className="text-lg font-heading font-semibold text-primary mb-4">Email Notifications</h4>
            <div className="space-y-4">
              {[
                { field: "emailProjectDeadlines", label: "Project deadline reminders" },
                { field: "emailTeamUpdates", label: "Team member updates" },
                { field: "emailAICompletions", label: "AI analysis completions" },
                { field: "emailFeatureAnnouncements", label: "New feature announcements" },
              ].map((item) => (
                <div key={item.field} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div>
                    <p className="font-semibold text-gray-800">{item.label}</p>
                    <p className="text-xs text-gray-500">
                      {item.field === "emailProjectDeadlines" && "Get reminders about upcoming deadlines"}
                      {item.field === "emailTeamUpdates" && "Receive updates when team members make changes"}
                      {item.field === "emailAICompletions" && "Be notified when AI analysis is complete"}
                      {item.field === "emailFeatureAnnouncements" && "Stay informed about new features and improvements"}
                    </p>
                  </div>
                   <button
                    type="button"
                    onClick={() => handleToggleChange(item.field as keyof typeof formData)}
                    role="switch"
                    aria-checked={formData[item.field as keyof typeof formData]}
                    aria-label={item.label}
                    className={`relative w-14 h-8 rounded-full transition-all duration-300 ${formData[item.field as keyof typeof formData] ? 'bg-crimson' : 'bg-gray-300'}`}
                  >
                    <span className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-all duration-300 ${formData[item.field as keyof typeof formData] ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* In-App Notifications */}
          <div>
            <h4 className="text-lg font-heading font-semibold text-primary mb-4">In-App Notifications</h4>
            <div className="space-y-4">
              {[
                { field: "inAppTaskUpdates", label: "Real-time task updates" },
                { field: "inAppMentions", label: "Mention notifications" },
                { field: "inAppAINudges", label: "AI progress nudges" },
              ].map((item) => (
                <div key={item.field} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div>
                    <p className="font-semibold text-gray-800">{item.label}</p>
                    <p className="text-xs text-gray-500">
                      {item.field === "inAppTaskUpdates" && "Get instant updates on task changes"}
                      {item.field === "inAppMentions" && "Receive notifications when you're mentioned"}
                      {item.field === "inAppAINudges" && "Get helpful reminders from the AI assistant"}
                    </p>
                  </div>
                   <button
                    type="button"
                    onClick={() => handleToggleChange(item.field as keyof typeof formData)}
                    role="switch"
                    aria-checked={formData[item.field as keyof typeof formData]}
                    aria-label={item.label}
                    className={`relative w-14 h-8 rounded-full transition-all duration-300 ${formData[item.field as keyof typeof formData] ? 'bg-teal' : 'bg-gray-300'}`}
                  >
                    <span className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-all duration-300 ${formData[item.field as keyof typeof formData] ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Save Button */}
          {hasChanges && (
            <div className="flex justify-end pt-4 border-t border-gray-200">
              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                className="shadow-xl shadow-crimson/10"
              >
                Save Notification Preferences
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}