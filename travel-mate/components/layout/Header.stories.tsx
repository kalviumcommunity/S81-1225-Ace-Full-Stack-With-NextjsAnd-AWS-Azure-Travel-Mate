import type { Meta, StoryObj } from "@storybook/react";
import Header from "./Header";

/**
 * Header Component Stories
 *
 * The Header component provides the main navigation bar for the application.
 * It includes the app logo and primary navigation links.
 */
const meta: Meta<typeof Header> = {
  title: "Layout/Header",
  component: Header,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A sticky navigation header with logo, navigation links, and active route highlighting.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default header state
 */
export const Default: Story = {};

/**
 * Header on dark background
 */
export const OnDarkBackground: Story = {
  decorators: [
    (Story) => (
      <div className="bg-slate-900 min-h-screen">
        <Story />
        <div className="p-8 text-white">
          <h1 className="text-2xl font-bold">Page Content</h1>
          <p className="mt-2">The header stays sticky at the top.</p>
        </div>
      </div>
    ),
  ],
};

/**
 * Header with page content
 */
export const WithPageContent: Story = {
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-slate-50">
        <Story />
        <main className="p-8">
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="mt-2 text-slate-600">
            Welcome to your dashboard. The header above provides navigation.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 bg-white rounded-lg shadow">
                <h3 className="font-semibold">Card {i}</h3>
                <p className="text-sm text-slate-500">Sample content</p>
              </div>
            ))}
          </div>
        </main>
      </div>
    ),
  ],
};
