import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import { WavyUnderline } from "@/components/ui/HandDrawnElements";
import { Sparkles, ArrowLeft, BookOpen, Target, Lightbulb } from "lucide-react";
import Link from "next/link";
import { createProject } from "@/lib/actions";
import SubmitButton from "./SubmitButton";

export default async function NewProjectPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    redirect("/login");
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b-2 border-gray-100 border-dashed">
        <div>
          <div className="flex items-center gap-2 text-sunny font-handwritten text-xl mb-1">
            <Sparkles className="w-5 h-5" />
            Time to Create Something Amazing!
          </div>
          <h1 className="text-4xl lg:text-5xl font-heading font-extrabold text-gray-900 tracking-tight relative inline-block">
            Launch Your Next Project
            <WavyUnderline className="text-crimson/20" />
          </h1>
        </div>
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

{/* Form */}
      <form action={createProject} className="space-y-8">
        
        <div className="space-y-6">
          <div>
            <Label htmlFor="title" className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-crimson" />
              Project Title
            </Label>
<Input
              id="title"
              name="title"
              type="text"
              required
              maxLength={150}
              placeholder="e.g., My Capstone Research Project"
              className="text-lg font-heading font-bold"
            />
            <p className="text-sm text-gray-500 mt-1 font-body">Give your project a clear, memorable name</p>
          </div>

          <div>
            <Label htmlFor="description" className="flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-teal" />
              Description
            </Label>
<Textarea
              id="description"
              name="description"
              required
              maxLength={2000}
              placeholder="Describe your project's main goals and what you hope to achieve..."
              className="min-h-[120px] font-body"
            />
            <p className="text-sm text-gray-500 mt-1 font-body">Brief overview of your project's purpose</p>
          </div>

          <div>
            <Label htmlFor="discipline" className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-sunny" />
              Academic Discipline (Optional)
            </Label>
<Input
              id="discipline"
              name="discipline"
              type="text"
              maxLength={100}
              placeholder="e.g., Computer Science, Engineering, Business"
              className="font-body"
            />
            <p className="text-sm text-gray-500 mt-1 font-body">What field of study does this project belong to?</p>
          </div>
        </div>

{/* Form Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-end pt-4 border-t border-gray-100">
          <Link href="/dashboard">
            <Button type="button" variant="outline" className="w-full sm:w-auto">
              Cancel
            </Button>
          </Link>
          <SubmitButton />
        </div>
      </form>
    </div>
  );
}
