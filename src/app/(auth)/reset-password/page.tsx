import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen bg-canvas font-body overflow-hidden items-center justify-center p-6">
      {/* Texture bg */}
      <div className="fixed inset-0 bg-grain pointer-events-none opacity-40" />
      
      <div className="w-full max-w-md relative z-10">
         <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
               <div className="w-8 h-8 bg-crimson rounded-lg rotate-3" />
               <span className="text-2xl font-heading font-extrabold tracking-tighter text-gray-900">NEXUS</span>
            </Link>
            <h1 className="text-3xl font-heading font-extrabold text-gray-900 mb-2">Lost your key?</h1>
            <p className="text-gray-500 text-sm font-handwritten italic">
               "Don't worry, the librarian has a spare for every door."
            </p>

         </div>

         <div className="bg-white p-8 md:p-10 rounded-2xl shadow-2xl border-2 border-gray-100 relative group">
            <div className="mb-6">
               <p className="text-gray-600 text-sm leading-relaxed">
                  Enter your email address and we'll send you a recovery link to get you back to your base camp.
               </p>
            </div>

            <form className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 px-1">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="student@campus.edu"
                  className="block w-full rounded-xl border-2 border-gray-100 bg-gray-50/50 py-3 px-4 text-gray-900 focus:border-crimson/20 focus:ring-0 focus:bg-white transition-all font-body text-sm"
                />
              </div>

              <Button
                type="submit"
                className="w-full shadow-lg shadow-crimson/10"
              >
                Send Recovery Link
              </Button>
            </form>

            <div className="mt-8 pt-8 border-t border-gray-100 text-center">
               <Link href="/login" className="text-xs font-bold text-gray-400 hover:text-crimson transition-colors uppercase tracking-widest">
                  Back to Sign In
               </Link>
            </div>
         </div>
         
         <p className="mt-8 text-center text-[10px] text-gray-400 font-body uppercase tracking-[0.2em]">
            Security first. Progress always.
         </p>
      </div>
    </main>
  );
}
