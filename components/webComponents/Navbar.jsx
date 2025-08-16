"use client";

import React from "react";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();

  if (!session) return null;

  const { user } = session;

  return (
    <nav className="w-full bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img
            src="/logo.svg"
            alt="NIT Delhi"
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="text-xl font-semibold text-gray-800">NIT Delhi</div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col text-right">
            <span className="font-medium text-sm text-gray-800">{user.name}</span>
            <span className="text-xs text-gray-500">{user.email}</span>
          </div>
          {user?.image && (
            <img
              src={user?.image}
              alt="User avatar"
              className="w-10 h-10 rounded-full border"
            />
          )}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
}
