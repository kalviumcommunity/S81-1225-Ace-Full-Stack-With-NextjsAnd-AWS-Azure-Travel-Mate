import type { Meta, StoryObj } from "@storybook/react";
import Sidebar from "./Sidebar";

/**
 * Sidebar Component Stories
 *
 * The Sidebar component provides secondary navigation for dashboard pages.
 * It includes collapsible functionality and badge indicators.
 */
const meta: Meta<typeof Sidebar> = {
  title: "Layout/Sidebar",
  component: Sidebar,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A collapsible sidebar navigation with icons, badges, and active state highlighting.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    collapsed: {
      control: "boolean",
      description: "Collapse the sidebar to icons only",
    },
  },
  decorators: [
    (Story) => (
      <div className="flex min-h-screen">
        <Story />
        <main className="flex-1 bg-white p-8">
          <h1 className="text-2xl font-bold">Main Content</h1>
          <p className="mt-2 text-slate-600">
            The sidebar provides navigation on the left.
          </p>
        </main>
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default expanded sidebar
 */
export const Default: Story = {
  args: {
    collapsed: false,
  },
};

/**
 * Collapsed sidebar (icons only)
 */
export const Collapsed: Story = {
  args: {
    collapsed: true,
  },
};

/**
 * Sidebar with toggle functionality
 */
export const WithToggle: Story = {
  args: {
    collapsed: false,
    onToggle: () => alert("Toggle clicked!"),
  },
};

/**
 * Sidebar in full layout context
 */
export const InLayoutContext: Story = {
  decorators: [
    (Story) => (
      <div className="flex flex-col min-h-screen">
        <header className="h-16 bg-slate-100 border-b flex items-center px-6">
          <span className="text-xl font-bold">🌍 Travel Mate</span>
        </header>
        <div className="flex flex-1">
          <Story />
          <main className="flex-1 bg-slate-50 p-8">
            <h1 className="text-2xl font-bold">Dashboard Overview</h1>
            <p className="mt-2 text-slate-600">
              This shows the sidebar in a full layout context.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-6 bg-white rounded-lg shadow">
                  <h3 className="font-semibold">Widget {i}</h3>
                  <p className="text-3xl font-bold text-blue-600 mt-2">
                    {Math.floor(Math.random() * 1000)}
                  </p>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    ),
  ],
  args: {
    collapsed: false,
  },
};
