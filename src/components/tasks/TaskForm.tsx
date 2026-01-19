// i will Review this later
"use client";

import React, { useState, useEffect, useRef } from "react";
import { TaskStatus, Priority } from "@prisma/client";
import { X, Calendar, Flag, Layout } from "lucide-react";
import { Button } from "@/components/ui/Button";

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
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const priorityOptions: { value: "LOW" | "MEDIUM" | "HIGH" | "URGENT"; label: string }[] = [
    { value: "LOW", label: "Chill (Low)" },
    { value: "MEDIUM", label: "Steady (Medium)" },
    { value: "HIGH", label: "Focus (High)" },
    { value: "URGENT", label: "Deadline (Urgent)" },
  ];

  const statusOptions: { value: TaskStatus; label: string }[] = [
    { value: "TODO", label: "To Do" },
    { value: "IN_PROGRESS", label: "In Progress" },
    { value: "REVIEW", label: "Review" },
    { value: "COMPLETED", label: "Completed" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const normalizedData = {
        ...formData,
        dueDate: formData.dueDate === "" ? "" : formData.dueDate,
      };
      await onSave(normalizedData);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
      }
    };

    const modalElement = modalRef.current;
    if (modalElement) {
      modalElement.focus();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onCancel]);

  useEffect(() => {
    const focusableElements = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusableElements && focusableElements.length > 0) {
      (focusableElements[0] as HTMLElement).focus();
    }
  }, []);


  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-md p-4 animate-in fade-in duration-300"
      ref={modalRef}
      tabIndex={-1}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          onCancel();
        }
      }}
    >
      <div className="bg-canvas w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border-4 border-white relative" ref={modalRef} tabIndex={-1}>
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
          <button onClick={onCancel} className="p-2 bg-white rounded-xl shadow-sm hover:bg-gray-50 transition-colors text-gray-400 hover:text-crimson" aria-label="Close task form">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 relative z-10">
          <div className="space-y-2">
            <label htmlFor="task-title" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Task Title</label>
            <input
              id="task-title"
              type="text"
              required
              className="w-full px-5 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-crimson/30 focus:ring-4 focus:ring-crimson/5 outline-none transition-all font-body text-gray-800 placeholder:text-gray-300"
              placeholder="What's the next step?"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="task-description" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Deep Dive (Description)</label>
            <textarea
              id="task-description"
              className="w-full px-5 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-crimson/30 focus:ring-4 focus:ring-crimson/5 outline-none transition-all font-body text-gray-800 placeholder:text-gray-300 resize-none h-32"
              placeholder="Add some context or specific details..."
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="task-priority" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Priority Level</label>
              <div className="relative">
                 <Flag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
<select
                   id="task-priority"
                   className="w-full pl-11 pr-5 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-crimson/30 outline-none transition-all font-body text-gray-800 appearance-none cursor-pointer"
                   value={formData.priority}
                   onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
                 >
                  {priorityOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="task-status" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Canvas Section</label>
              <div className="relative">
                 <Layout className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
<select
                   id="task-status"
                   className="w-full pl-11 pr-5 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:border-crimson/30 outline-none transition-all font-body text-gray-800 appearance-none cursor-pointer"
                   value={formData.status}
                   onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                 >
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="task-dueDate" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Deadline Date</label>
            <div className="relative">
               <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
               <input
                id="task-dueDate"
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
              disabled={isSubmitting}
            >
              Back Out
            </button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1 shadow-xl shadow-crimson/10"
              disabled={isSubmitting}
            >
              {initialData?.id ? "Sync Changes" : "Create Task"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
