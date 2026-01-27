import type { Meta, StoryObj } from "@storybook/react";
import LayoutWrapper from "./LayoutWrapper";

/**
 * LayoutWrapper Component Stories
 *
 * The LayoutWrapper component provides consistent page structure
 * with Header, optional Sidebar, and main content area.
 */
const meta: Meta<typeof LayoutWrapper> = {
  title: "Layout/LayoutWrapper",
  component: LayoutWrapper,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A comprehensive layout wrapper that provides consistent structure across all pages.",
      },
    },
    nextjs: {
      navigation: {
        pathname: "/dashboard",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    showSidebar: {
      control: "boolean",
      description: "Force show/hide sidebar (auto-detected by default)",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Dashboard layout (with sidebar)
 */
export const DashboardLayout: Story = {
  args: {
    showSidebar: true,
    children: (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-2 text-slate-600">
          This is a protected route with sidebar navigation.
        </p>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-xl shadow-sm border">
            <p className="text-sm text-slate-500">Total Users</p>
            <p className="text-3xl font-bold text-blue-600">1,234</p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-sm border">
            <p className="text-sm text-slate-500">Active Trips</p>
            <p className="text-3xl font-bold text-green-600">56</p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-sm border">
            <p className="text-sm text-slate-500">Revenue</p>
            <p className="text-3xl font-bold text-purple-600">$12.5k</p>
          </div>
        </div>
      </div>
    ),
  },
};

/**
 * Public page layout (without sidebar)
 */
export const PublicPageLayout: Story = {
  args: {
    showSidebar: false,
    children: (
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-4xl font-bold text-slate-900 text-center">
          Welcome to Travel Mate 🌍
        </h1>
        <p className="mt-4 text-xl text-slate-600 text-center">
          Your smart travel companion for discovering amazing destinations.
        </p>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 bg-blue-50 rounded-xl">
            <h3 className="text-xl font-semibold text-blue-900">
              🗺️ Explore Places
            </h3>
            <p className="mt-2 text-blue-700">
              Discover hidden gems and popular destinations worldwide.
            </p>
          </div>
          <div className="p-6 bg-green-50 rounded-xl">
            <h3 className="text-xl font-semibold text-green-900">
              ✈️ Plan Trips
            </h3>
            <p className="mt-2 text-green-700">
              Create and organize your perfect travel itinerary.
            </p>
          </div>
        </div>
      </div>
    ),
  },
};

/**
 * Users page layout
 */
export const UsersPageLayout: Story = {
  args: {
    showSidebar: true,
    children: (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-slate-900">Users</h1>
        <p className="mt-2 text-slate-600">Manage all registered users.</p>
        <div className="mt-8 space-y-4">
          {["Alice Johnson", "Bob Smith", "Carol Williams"].map((name, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-4 bg-white rounded-lg border"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                {name[0]}
              </div>
              <div>
                <p className="font-semibold text-slate-900">{name}</p>
                <p className="text-sm text-slate-500">
                  {name.toLowerCase().replace(" ", ".")}@example.com
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
};

/**
 * Login page layout
 */
export const LoginPageLayout: Story = {
  args: {
    showSidebar: false,
    children: (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg border">
          <div className="text-center mb-8">
            <span className="text-5xl">🌍</span>
            <h1 className="text-2xl font-bold mt-4">Welcome Back</h1>
            <p className="text-slate-600">Log in to your account</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                type="email"
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="••••••••"
              />
            </div>
            <button className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold">
              Log In
            </button>
          </div>
        </div>
      </div>
    ),
  },
};
