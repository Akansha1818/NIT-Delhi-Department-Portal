"use client";

import React, { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import SessionLayoutWrapper from "@/components/SessionLayoutWrapper";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

// Map Tailwind class to HEX for charts
const TAILWIND_TO_HEX = {
  "bg-blue-500": "#3B82F6",
  "bg-green-500": "#10B981",
  "bg-purple-500": "#8B5CF6",
  "bg-pink-500": "#EC4899",
};

export default function Page() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const hasShownToast = useRef(false);

  const [login, setLogin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({
    events: 0,
    programs: 0,
    labs: 0,
    banners: 0,
  });

  useEffect(() => {
    if (!status || hasShownToast.current) return;

    const timeout = setTimeout(() => {
      if (status === "authenticated" && session?.user?.email) {
        setLogin(true);
        toast.success(`Welcome ${session.user.name}!`);
      } else {
        toast.error("Please log in to continue.");
        router.push("/");
      }
      hasShownToast.current = true;
    }, 500);

    return () => clearTimeout(timeout);
  }, [status, session, router]);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [eventsRes, programsRes, labsRes, bannersRes] = await Promise.all([
          fetch("/api/events/count"),
          fetch("/api/programs/count"),
          fetch("/api/labs/count"),
          fetch("/api/banners/count"),
        ]);

        const [events, programs, labs, banners] = await Promise.all([
          eventsRes.json(),
          programsRes.json(),
          labsRes.json(),
          bannersRes.json(),
        ]);

        setCounts({
          events: events.count || 0,
          programs: programs.count || 0,
          labs: labs.count || 0,
          banners: banners.count || 0,
        });

        setLoading(false);
      } catch (err) {
        console.error("Error fetching counts:", err);
        toast.error("Failed to load dashboard counts.");
        setLoading(false);
      }
    };

    if (login) fetchCounts();
  }, [login]);

  const chartData = [
    { name: "Events", value: counts.events, color: "bg-blue-500" },
    { name: "Programs", value: counts.programs, color: "bg-green-500" },
    { name: "Labs", value: counts.labs, color: "bg-purple-500" },
    { name: "Banners", value: counts.banners, color: "bg-pink-500" },
  ];

  return (
    <SessionLayoutWrapper session={session}>
      <div className="w-full">
        <h1 className="text-3xl font-bold text-[#212178] mb-6">
          Department Dashboard
        </h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {loading
            ? [1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)
            : chartData.map((item, index) => (
              <DashboardCard
                key={index}
                title={item.name}
                count={item.value}
                color={item.color}
              />
            ))}
        </div>

        {/* Charts Section */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Bar Chart */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Bar Chart Overview
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`bar-${index}`}
                        fill={TAILWIND_TO_HEX[entry.color]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart */}
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Pie Chart Distribution
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    // label={({ name, percent }) =>
                    //   `${name}: ${(percent * 100).toFixed(0)}%`
                    // }
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={TAILWIND_TO_HEX[entry.color]}
                      />
                    ))}
                  </Pie>
                  <Legend verticalAlign="bottom" />
                  <Tooltip
                    formatter={(value, name) => [`${value}`, `${name}`]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </SessionLayoutWrapper>
  );
}

// Stat Card
function DashboardCard({ title, count, color }) {
  return (
    <div
      className={`rounded-xl p-5 shadow-md text-white transition-all ${color}`}
    >
      <h2 className="text-md font-medium">{title}</h2>
      <p className="text-3xl font-bold">{count}</p>
    </div>
  );
}

// Skeleton Card
function SkeletonCard() {
  return (
    <div className="rounded-xl p-5 shadow-md animate-pulse bg-gray-300 h-[100px]">
      <div className="h-4 w-1/3 bg-gray-400 rounded mb-4"></div>
      <div className="h-8 w-1/2 bg-gray-500 rounded"></div>
    </div>
  );
}
