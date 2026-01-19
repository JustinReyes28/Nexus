import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import LoginForm from "@/components/auth/LoginForm";
import Link from "next/link";
import { Sparkle } from "@/components/ui/HandDrawnElements";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen bg-canvas font-body overflow-hidden">
      {/* Texture bg */}
      <div className="fixed inset-0 bg-grain pointer-events-none opacity-40" />
      
      {/* Left Side: Visual / Info (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-crimson relative items-center justify-center p-24 overflow-hidden">
         <div className="absolute inset-0 bg-paper opacity-5 mix-blend-overlay" />
         <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 bg-sunny/20 rounded-full blur-3xl animate-pulse-organic" />
         
         <div className="relative z-10 text-white max-w-lg">
            <Link href="/" className="inline-flex items-center gap-2 mb-12">
               <div className="w-10 h-10 bg-white rounded-xl rotate-3 flex items-center justify-center">
                  <div className="w-6 h-6 bg-crimson rounded-sm" />
               </div>
               <span className="text-3xl font-heading font-extrabold tracking-tighter">NEXUS</span>
            </Link>
            
            <h2 className="text-5xl font-heading font-extrabold mb-8 leading-tight">
               Your digital campus library <span className="text-sunny">awaits.</span>
            </h2>
            
            <p className="text-xl text-white/80 leading-relaxed mb-12 italic font-handwritten">
               "Focus is the master key to success. We help you lock the door to distractions."
            </p>
            
            <ul className="flex flex-col gap-6 list-none">
               <li className="flex gap-4 items-center">
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0 border border-white/20">
                     <Sparkle className="text-sunny w-6 h-6" />
                  </div>
                  <p className="font-bold">AI-Powered Structure</p>
               </li>
               <li className="flex gap-4 items-center">
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0 border border-white/20">
                     <div className="w-5 h-5 bg-sunny rounded-sm rotate-12" />
                  </div>
                  <p className="font-bold">Collaborative Canvas</p>
               </li>
            </ul>
         </div>
      </div>

      {/* Right Side: Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative z-10">
        <div className="w-full max-w-md">
           <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
              <div className="w-8 h-8 bg-crimson rounded-lg rotate-3" />
              <span className="text-2xl font-heading font-extrabold tracking-tighter text-gray-900">NEXUS</span>
           </div>

           <div className="bg-white p-8 md:p-10 rounded-2xl shadow-2xl border-2 border-gray-100 relative group">
              {/* Note highlight */}
              <div className="absolute -top-4 -right-4 bg-sunny px-3 py-1 rounded shadow-lg rotate-6 text-[10px] font-bold text-gray-900 hidden md:block">
                 Welcome Back!
              </div>

              <div className="mb-8">
                 <h1 className="text-3xl font-heading font-extrabold text-gray-900 mb-2">Sign In</h1>
                 <p className="text-gray-500 text-sm font-body">
                    Enter your credentials to access your base camp.
                 </p>
              </div>

              <LoginForm />

              <div className="mt-8 pt-8 border-t border-gray-100 text-center">
                 <p className="text-sm text-gray-600 font-body">
                    New to the campus?{" "}
                    <Link href="/register" className="text-crimson font-bold hover:underline underline-offset-4">
                       Create an account
                    </Link>
                 </p>
              </div>
           </div>
           
           <p className="mt-8 text-center text-xs text-gray-400 font-body">
              Human-centric by design. Capstone success by choice.
           </p>
        </div>
      </div>
    </main>
  );
}
