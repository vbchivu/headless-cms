"use client";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function ApiStatus() {
  const { data, error } = useSWR("http://localhost:3001/health", fetcher, {
    refreshInterval: 5000,
  });

  if (error) return <p className="text-red-600">API offline</p>;
  if (!data) return <p>Checking API…</p>;
  return <p className="text-green-700">API status: {data.status}</p>;
}
