"use client";

import React, { useState } from "react";
import { TaskStatus, Priority } from "@prisma/client";
import { X, Calendar, Flag, Layout } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface TaskFormProps {
  initialData?: {
    id?: string;
    title: string;
    description: string | null;
    status: TaskStatus;
    priority: Priority;
    dueDate: Date | null;
  };
  onSave: (data: {
    title: string;
    description: string;
    status: TaskStatus;
    priority: Priority;
    dueDate: string;
  }) => void;
  onCancel: () => void;
}

export default function TaskForm({ initialData, onSave, onCancel }: TaskFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    status: initialData?.status || "TODO",
    priority: initialData?.priority || "MEDIUM",
    dueDate: initialData?.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-canvas w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border-4 border-white relative">
        {/* Subtle pattern bg */}
        <div className="absolute inset-0 bg-paper opacity-50 pointer-events-none" />
        <div className="absolute inset-0 bg-grain opacity-20 pointer-events-none" />

        <div className="flex items-center justify-between p-8 border-b border-gray-100 relative z-10">
          <div>
            <h3 className="text-2xl font-heading font-extrabold text-gray-900">
              {initialData?.id ? "Edit Task" : "New Task"}
            </h3>
            <p className="text-sm text-gray-500 font-body">Adding a brick to the campus structure.</p>
          </div>
          <button onClick={onCancel} className="p-2 bg-white rounded-xl shadow-sm hover:bg-gray-50 transition-colors text-gray-400 hover:text-crimson">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 relative z-10">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Task Title</label>
            <input
              type="text"
              required
              className="w-full px-5 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-crimson/30 focus:ring-4 focus:ring-crimson/5 outline-none transition-all font-body text-gray-800 placeholder:text-gray-300"
              placeholder="What's the next step?"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Deep Dive (Description)</label>
            <textarea
              className="w-full px-5 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-crimson/30 focus:ring-4 focus:ring-crimson/5 outline-none transition-all font-body text-gray-800 placeholder:text-gray-300 resize-none h-32"
              placeholder="Add some context or specific details..."
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Priority Level</label>
              <div className="relative">
                 <Flag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                 <select
                  className="w-full pl-11 pr-5 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-crimson/30 outline-none transition-all font-body text-gray-800 appearance-none cursor-pointer"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
                >
                  <option value="LOW">Chill (Low)</option>
                  <option value="MEDIUM">Steady (Medium)</option>
                  <option value="HIGH">Focus (High)</option>
                  <option value="URGENT">Deadline (Urgent)</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Canvas Section</label>
              <div className="relative">
                 <Layout className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                 <select
                  className="w-full pl-11 pr-5 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-crimson/30 outline-none transition-all font-body text-gray-800 appearance-none cursor-pointer"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                >
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="REVIEW">Review</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Deadline Date</label>
            <div className="relative">
               <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
               <input
                type="date"
                className="w-full pl-11 pr-5 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-crimson/30 outline-none transition-all font-body text-gray-800"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-4 border-2 border-gray-100 rounded-2xl font-bold text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all font-body text-sm"
            >
              Back Out
            </button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1 shadow-xl shadow-crimson/10"
            >
              {initialData?.id ? "Sync Changes" : "Create Task"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
