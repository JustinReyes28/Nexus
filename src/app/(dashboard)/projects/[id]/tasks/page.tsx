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

// Mock data for initial implementation
const MOCK_TASKS: any[] = [
  {
    id: "1",
    title: "Research existing solutions",
    description: "Analyze competitors and existing academic papers on the topic.",
    status: "COMPLETED",
    priority: "HIGH",
    dueDate: new Date(Date.now() - 86400000 * 2),
    startDate: new Date(Date.now() - 86400000 * 5),
    endDate: new Date(Date.now() - 86400000 * 2),
  },
  {
    id: "2",
    title: "Draft project proposal",
    description: "Prepare the initial proposal for advisor review.",
    status: "IN_PROGRESS",
    priority: "MEDIUM",
    dueDate: new Date(Date.now() + 86400000 * 3),
    startDate: new Date(Date.now()),
    endDate: new Date(Date.now() + 86400000 * 3),
  },
  {
    id: "3",
    title: "Setup development environment",
    description: "Initialize git repo, install dependencies, and configure CI/CD.",
    status: "TODO",
    priority: "LOW",
    dueDate: new Date(Date.now() + 86400000 * 7),
    startDate: new Date(Date.now() + 86400000 * 4),
    endDate: new Date(Date.now() + 86400000 * 7),
  }
];

export default function ProjectTasksPage() {
  const params = useParams();
  const projectId = params.id as string;
  
  const [view, setView] = useState<"list" | "kanban" | "gantt">("kanban");
  const [tasks, setTasks] = useState(MOCK_TASKS);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSaveTask = (data: any) => {
    if (editingTask) {
      setTasks(tasks.map(t => t.id === editingTask.id ? { ...t, ...data } : t));
    } else {
      const newTask = {
        ...data,
        id: Math.random().toString(36).substr(2, 9),
        startDate: new Date(),
        endDate: new Date(data.dueDate),
      };
      setTasks([...tasks, newTask]);
    }
    setShowForm(false);
    setEditingTask(null);
  };

  const statusColumns: any[] = ["TODO", "IN_PROGRESS", "REVIEW", "COMPLETED"];

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
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
            />
          </div>
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
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
                    {status.replace("_", " ")}
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
                      onEdit={(id) => { setEditingTask(tasks.find(t => t.id === id)); setShowForm(true); }}
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
                             <Badge variant={task.status === "COMPLETED" ? "success" : "info"}>{task.status.replace("_", " ")}</Badge>
                         </td>
                         <td className="px-6 py-4">
                            <Badge variant={task.priority === "HIGH" || task.priority === "URGENT" ? "danger" : "warning"}>{task.priority}</Badge>
                         </td>
                         <td className="px-6 py-4">
                            <span className="text-xs text-gray-500">
                               {task.dueDate ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(task.dueDate)) : "N/A"}
                            </span>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
        )}

        {view === "gantt" && (
          <GanttChart tasks={tasks as any} />
        )}
      </div>

      {showForm && (
        <TaskForm 
          initialData={editingTask}
          onSave={handleSaveTask}
          onCancel={() => { setShowForm(false); setEditingTask(null); }}
        />
      )}
    </div>
  );
}
