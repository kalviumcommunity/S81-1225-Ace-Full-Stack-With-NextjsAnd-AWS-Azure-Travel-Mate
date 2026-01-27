"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

// Mock user data for demonstration
const mockUsers: User[] = [
  {
    id: "1",
    name: "Alice Johnson",
    email: "alice@example.com",
    role: "USER",
    avatar: "A",
  },
  {
    id: "2",
    name: "Bob Smith",
    email: "bob@example.com",
    role: "ADMIN",
    avatar: "B",
  },
  {
    id: "3",
    name: "Carol Williams",
    email: "carol@example.com",
    role: "MODERATOR",
    avatar: "C",
  },
  {
    id: "4",
    name: "David Brown",
    email: "david@example.com",
    role: "USER",
    avatar: "D",
  },
  {
    id: "5",
    name: "Eva Martinez",
    email: "eva@example.com",
    role: "USER",
    avatar: "E",
  },
];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call delay
    const timer = setTimeout(() => {
      setUsers(mockUsers);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="p-6 max-w-4xl mx-auto">
      {/* Breadcrumbs */}
      <nav className="text-sm mb-6" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 text-gray-600">
          <li>
            <Link href="/" className="hover:text-blue-600 transition-colors">
              🏠 Home
            </Link>
          </li>
          <li className="text-gray-400">/</li>
          <li className="text-gray-900 font-medium">Users</li>
        </ol>
      </nav>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          👥 User Directory
        </h1>
        <p className="text-gray-600">Browse and manage all registered users</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid gap-4">
          {users.map((user) => (
            <Link
              key={user.id}
              href={`/users/${user.id}`}
              className="block p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md hover:border-blue-300 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {user.avatar}
                </div>
                <div className="flex-1">
                  <h2 className="font-semibold text-gray-900">{user.name}</h2>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full ${
                    user.role === "ADMIN"
                      ? "bg-red-100 text-red-700"
                      : user.role === "MODERATOR"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                  }`}
                >
                  {user.role}
                </span>
                <span className="text-gray-400">→</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>💡 Tip:</strong> Click on any user to view their detailed
          profile page. This route is protected and requires authentication.
        </p>
      </div>
    </main>
  );
}
