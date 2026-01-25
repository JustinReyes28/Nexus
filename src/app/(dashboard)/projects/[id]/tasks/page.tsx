// Test
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Layout,
  List,
  Plus,
  Search,
  Filter,
  BarChart2
} from "lucide-react";
import TaskCard from "@/components/tasks/TaskCard";
import TaskForm from "@/components/tasks/TaskForm";
import GanttChart from "@/components/tasks/GanttChart";
import { Badge } from "@/components/ui/Badge";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: "TODO" | "IN_PROGRESS" | "REVIEW" | "COMPLETED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueDate: Date | null;
  startDate: Date | null;
  endDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// Helper function to parse date fields in a task object
const parseTaskDates = (task: any): Task => {
  return {
    ...task,
    dueDate: task.dueDate ? new Date(task.dueDate) : null,
    startDate: task.startDate ? new Date(task.startDate) : null,
    endDate: task.endDate ? new Date(task.endDate) : null,
    createdAt: task.createdAt ? new Date(task.createdAt) : new Date(),
    updatedAt: task.updatedAt ? new Date(task.updatedAt) : new Date()
  };
};

export default function ProjectTasksPage() {
  const params = useParams();
  const projectId = Array.isArray(params.id) ? params.id[0] : params.id;
  
  if (!projectId) {
    throw new Error("Project ID is required");
  }

  const [view, setView] = useState<"list" | "kanban" | "gantt">("kanban");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Load tasks when component mounts or projectId changes
  useEffect(() => {
    const loadTasks = async () => {
      try {
        // Try to read from localStorage first as fallback
        const cachedTasks = localStorage.getItem(`project_${projectId}_tasks`);
if (cachedTasks) {
          try {
            const parsedCachedTasks = JSON.parse(cachedTasks);
            const tasksWithParsedDates = parsedCachedTasks.map(parseTaskDates);
            setTasks(tasksWithParsedDates);
          } catch (parseError) {
            console.error('Failed to parse cached tasks:', parseError);
            localStorage.removeItem(`project_${projectId}_tasks`);
          }
        }
        
        // Fetch fresh tasks from API
        const response = await fetch(`/api/projects/${projectId}/tasks`);
        if (response.ok) {
          const fetchedTasks = await response.json();
          const tasksWithParsedDates = fetchedTasks.map(parseTaskDates);
          setTasks(tasksWithParsedDates);
          // Cache in localStorage
          localStorage.setItem(`project_${projectId}_tasks`, JSON.stringify(fetchedTasks));
        } else {
          // If API fails, we already have cached data, or use empty array
          console.error('Failed to fetch tasks:', response.statusText);
        }
      } catch (error) {
        console.error('Error loading tasks:', error);
// Fallback to cached data if available
        const cachedTasks = localStorage.getItem(`project_${projectId}_tasks`);
        if (cachedTasks) {
          try {
            const parsedCachedTasks = JSON.parse(cachedTasks);
            const tasksWithParsedDates = parsedCachedTasks.map(parseTaskDates);
            setTasks(tasksWithParsedDates);
          } catch (parseError) {
            console.error('Failed to parse cached tasks:', parseError);
            localStorage.removeItem(`project_${projectId}_tasks`);
          }
        }
      }
    };

    if (projectId) {
      loadTasks();
    }
  }, [projectId]);

  const filteredTasks = tasks.filter(t =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSaveTask = async (data: {
    title: string;
    description: string;
    status: "TODO" | "IN_PROGRESS" | "REVIEW" | "COMPLETED";
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    dueDate: string;
  }) => {
    const now = new Date();
    try {
      if (editingTask) {
        // Update existing task
        const response = await fetch(`/api/projects/${projectId}/tasks`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            taskId: editingTask.id,
            ...data,
            dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null
          })
        });

        if (response.ok) {
          const updatedTask = {
            ...editingTask,
            title: data.title,
            description: data.description,
            status: data.status,
            priority: data.priority,
            dueDate: data.dueDate ? new Date(data.dueDate) : null,
            updatedAt: now
          };
          
          const updatedTasks = tasks.map(t =>
            t.id === editingTask.id ? updatedTask : t
          );
          setTasks(updatedTasks);
          // Update localStorage
          localStorage.setItem(`project_${projectId}_tasks`, JSON.stringify(updatedTasks));
        } else {
          throw new Error('Failed to update task');
        }
      } else {
        // Create new task
        const response = await fetch(`/api/projects/${projectId}/tasks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...data,
            dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null
          })
        });

        const result = await response.json();
        if (response.ok) {
          const newTask = {
            id: crypto.randomUUID(), // This will be replaced by the API response
            title: data.title,
            description: data.description,
            status: data.status,
            priority: data.priority,
            dueDate: data.dueDate ? new Date(data.dueDate) : null,
            startDate: null,
            endDate: null,
            createdAt: now,
            updatedAt: now
          };
          
          // Validate response and result before using
          // Check if result has task property, otherwise use result directly
          const createdTask = result?.task ? result.task : result;
          if (typeof createdTask !== 'object' || createdTask === null || !('id' in createdTask) || !createdTask.id) {
            throw new Error('Invalid response format: task object must have a valid id');
          }
          const updatedTasks = [...tasks, { ...newTask, id: createdTask.id }];
          setTasks(updatedTasks);
          // Update localStorage
          localStorage.setItem(`project_${projectId}_tasks`, JSON.stringify(updatedTasks));
        } else {
          throw new Error('Failed to create task');
        }
      }
      setShowForm(false);
      setEditingTask(null);
    } catch (error) {
      console.error('Error saving task:', error);
      alert('Failed to save task. Please try again.');
    }
  };

  const statusColumns: ("TODO" | "IN_PROGRESS" | "REVIEW" | "COMPLETED")[] = ["TODO", "IN_PROGRESS", "REVIEW", "COMPLETED"];

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href={`/projects/${projectId}`} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">Project Tasks</h1>
            <p className="text-sm text-gray-500">Manage your progress and upcoming milestones</p>
          </div>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingTask(null); }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-sm transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-1 p-1 bg-gray-50 rounded-lg w-full md:w-auto">
          <button
            onClick={() => setView("kanban")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-semibold transition-all ${view === "kanban" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            <Layout className="w-4 h-4" />
            Board
          </button>
          <button
            onClick={() => setView("list")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-semibold transition-all ${view === "list" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            <List className="w-4 h-4" />
            List
          </button>
          <button
            onClick={() => setView("gantt")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-semibold transition-all ${view === "gantt" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            <BarChart2 className="w-4 h-4" />
            Timeline
          </button>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
         <div className="relative flex-grow md:w-64">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
             <input
               type="text"
               placeholder="Search tasks..."
               className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               aria-label="Search tasks"
             />
           </div>
<button 
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all" 
              aria-label="Open filters"
              onClick={() => {}}
            >
              <Filter className="w-5 h-5" />
            </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="min-h-[60vh]">
        {view === "kanban" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statusColumns.map((status) => (
              <div key={status} className="flex flex-col gap-4">
                <div className="flex items-center justify-between px-2">
                   <h3 className="font-bold text-gray-400 text-xs uppercase tracking-widest flex items-center gap-2">
                     {status.replaceAll("_", " ")}
                     <span className="bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded text-[10px]">
                       {filteredTasks.filter(t => t.status === status).length}
                     </span>
                   </h3>
                </div>
                <div className="flex flex-col gap-4 min-h-[100px] p-2 rounded-xl bg-gray-50/50 border border-dashed border-gray-200">
                  {filteredTasks.filter(t => t.status === status).map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={(id) => { setEditingTask(tasks.find(t => t.id === id) || null); setShowForm(true); }}
                       onStatusChange={async (id, newStatus) => {
                         try {
                           // Capture original task before optimistic update
                           const originalTask = tasks.find(t => t.id === id);
                           if (!originalTask) return;
                           
                           // Optimistically update the UI using functional state updates
                           const now = new Date();
                           setTasks(prevTasks => {
                             const updatedTasks = prevTasks.map(t =>
                               t.id === id ? { ...t, status: newStatus, updatedAt: now } : t
                             );
                             // Update localStorage with the new tasks state
                             localStorage.setItem(`project_${projectId}_tasks`, JSON.stringify(updatedTasks));
                             return updatedTasks;
                           });
                           
                           // Persist to backend
                           const response = await fetch(`/api/projects/${projectId}/tasks`, {
                             method: 'PUT',
                             headers: { 'Content-Type': 'application/json' },
                             body: JSON.stringify({
                               taskId: id,
                               status: newStatus
                             })
                           });
                           
                           if (!response.ok) {
                             // Rollback on failure using functional state updates
                             setTasks(prevTasks => {
                               const revertedTasks = prevTasks.map(t =>
                                 t.id === id ? { ...t, status: originalTask.status, updatedAt: originalTask.updatedAt } : t
                               );
                               // Update localStorage with the reverted tasks state
                               localStorage.setItem(`project_${projectId}_tasks`, JSON.stringify(revertedTasks));
                               return revertedTasks;
                             });
                             throw new Error('Failed to update task status');
                           }
                         } catch (error) {
                           console.error('Error updating task status:', error);
                           alert('Failed to update task status. Please try again.');
                         }
                       }}
                    />

                  ))}
                  <button
                    onClick={() => { setShowForm(true); setEditingTask(null); }}
                    className="py-2 text-xs font-bold text-gray-400 hover:text-blue-500 transition-colors flex items-center justify-center gap-1 border border-dashed rounded-lg hover:border-blue-200 hover:bg-blue-50/30"
                  >
                    <Plus className="w-3 h-3" />
                    Add Task
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {view === "list" && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
             <table className="w-full text-left">
                <thead className="bg-gray-50 border-b text-[10px] uppercase font-bold text-gray-400 tracking-widest">
                   <tr>
                      <th className="px-6 py-3">Task</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Priority</th>
                      <th className="px-6 py-3">Due Date</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                   {filteredTasks.map(task => (
                      <tr key={task.id} className="hover:bg-gray-50 transition-colors group cursor-pointer" onClick={() => { setEditingTask(task); setShowForm(true); }}>
                         <td className="px-6 py-4">
                            <span className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{task.title}</span>
                         </td>
                          <td className="px-6 py-4">
                              <Badge variant={task.status === "COMPLETED" ? "success" : "info"}>{task.status.replaceAll("_", " ")}</Badge>
                          </td>
                         <td className="px-6 py-4">
                            <Badge variant={task.priority === "HIGH" || task.priority === "URGENT" ? "danger" : "warning"}>{task.priority}</Badge>
                         </td>
                          <td className="px-6 py-4">
                             <span className="text-xs text-gray-500">
                                {task.dueDate && !isNaN(new Date(task.dueDate).getTime()) ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(task.dueDate)) : "N/A"}
                             </span>
                          </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
        )}

         {view === "gantt" && (
           <GanttChart tasks={tasks.map(t => ({ 
             id: t.id,
             title: t.title,
             status: t.status,
             priority: t.priority,
             dueDate: t.dueDate,
             startDate: t.startDate ?? undefined,
             endDate: t.endDate ?? undefined,
             createdAt: t.createdAt,
             updatedAt: t.updatedAt,
             description: t.description ?? undefined 
           }))} />
         )}
      </div>

      {showForm && (
        <TaskForm
          initialData={editingTask ? {
            id: editingTask.id,
            title: editingTask.title,
            description: editingTask.description ?? null,
            status: editingTask.status,
            priority: editingTask.priority,
            dueDate: editingTask.dueDate
          } : undefined}
          onSave={handleSaveTask}
          onCancel={() => { setShowForm(false); setEditingTask(null); }}
        />
      )}
    </div>
  );
}
