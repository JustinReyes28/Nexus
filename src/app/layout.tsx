import type { Metadata } from "next";
import { Inter, Poppins, Caveat } from "next/font/google";
import "@/styles/globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-body",
});

const poppins = Poppins({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-heading",
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-handwritten",
});

export const metadata: Metadata = {
  title: "Nexus - AI-Powered Capstone Companion",
  description: "Guiding students through every stage of their capstone projects with intelligent assistance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(
        inter.variable, 
        poppins.variable, 
        caveat.variable,
        "font-body antialiased"
      )}>
        {children}
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}

