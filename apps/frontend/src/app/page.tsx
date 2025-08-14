import ApiStatus from "./api-status";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
        Mini-Focus Dashboard
      </h1>
      <ApiStatus />
      <p className="mt-4 text-lg text-gray-600 max-w-xl text-center">
        Real-time macro-economic insights powered by open data.
      </p>
      <a
        href="/dashboard"
        className="mt-6 rounded-xl bg-blue-600 px-6 py-3 text-white shadow-lg transition hover:bg-blue-700"
      >
        Explore the demo →
      </a>
    </main>
  );
}
