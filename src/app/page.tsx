import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-b from-white to-gray-50">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          Welcome to <span className="text-blue-600">Nexus</span>
        </h1>
      </div>
      <p className="mt-6 text-lg leading-8 text-gray-600">
        Your AI-powered companion for a successful capstone journey.
      </p>
      <div className="mt-10 flex items-center justify-center gap-x-6">
        <Link
          href="/login"
          className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          Get Started
        </Link>
        <Link href="/about" className="text-sm font-semibold leading-6 text-gray-900">
          Learn more <span aria-hidden="true">→</span>
        </Link>
      </div>
    </main>
  );
}
