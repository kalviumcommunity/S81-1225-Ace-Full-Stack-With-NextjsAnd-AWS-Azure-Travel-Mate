import type { Meta, StoryObj } from "@storybook/react";
import Card from "./Card";
import Button from "./Button";

/**
 * Card Component Stories
 *
 * The Card component is a flexible container for grouping related content.
 * It supports titles, subtitles, header actions, and footer sections.
 */
const meta: Meta<typeof Card> = {
  title: "UI/Card",
  component: Card,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A flexible card container for displaying grouped content with optional header and footer.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "elevated", "outlined"],
      description: "Card style variant",
    },
    padding: {
      control: "select",
      options: ["none", "sm", "md", "lg"],
      description: "Content padding",
    },
    hover: {
      control: "boolean",
      description: "Enable hover effect",
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: "400px" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default card with simple content
 */
export const Default: Story = {
  args: {
    children: (
      <p className="text-slate-600">
        This is a simple card with some content inside. Cards are great for
        organizing information.
      </p>
    ),
  },
};

/**
 * Card with title and subtitle
 */
export const WithHeader: Story = {
  args: {
    title: "Card Title",
    subtitle: "Optional subtitle text",
    children: (
      <p className="text-slate-600">
        Card content goes here. The header provides context for the content.
      </p>
    ),
  },
};

/**
 * Card with header action button
 */
export const WithHeaderAction: Story = {
  args: {
    title: "User Statistics",
    subtitle: "Last 30 days",
    headerAction: <Button label="View All" size="sm" variant="ghost" />,
    children: (
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <p className="text-3xl font-bold text-blue-600">1,234</p>
          <p className="text-sm text-slate-600">Visitors</p>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <p className="text-3xl font-bold text-green-600">567</p>
          <p className="text-sm text-slate-600">Conversions</p>
        </div>
      </div>
    ),
  },
};

/**
 * Card with footer
 */
export const WithFooter: Story = {
  args: {
    title: "Recent Activity",
    children: (
      <ul className="space-y-2">
        <li className="text-slate-600">• User signed up</li>
        <li className="text-slate-600">• New booking created</li>
        <li className="text-slate-600">• Review submitted</li>
      </ul>
    ),
    footer: (
      <div className="flex justify-between items-center">
        <span className="text-sm text-slate-500">Showing 3 of 10</span>
        <Button label="Load More" size="sm" variant="outline" />
      </div>
    ),
  },
};

/**
 * Elevated card with shadow
 */
export const Elevated: Story = {
  args: {
    variant: "elevated",
    title: "Elevated Card",
    children: (
      <p className="text-slate-600">
        This card has a shadow effect for more emphasis.
      </p>
    ),
  },
};

/**
 * Outlined card
 */
export const Outlined: Story = {
  args: {
    variant: "outlined",
    title: "Outlined Card",
    children: (
      <p className="text-slate-600">
        This card has a thicker border and no background.
      </p>
    ),
  },
};

/**
 * Clickable card with hover effect
 */
export const Clickable: Story = {
  args: {
    title: "Click Me",
    subtitle: "This entire card is clickable",
    hover: true,
    onClick: () => alert("Card clicked!"),
    children: (
      <p className="text-slate-600">
        Clickable cards are great for navigation or selection UI.
      </p>
    ),
  },
};

/**
 * Card with no padding
 */
export const NoPadding: Story = {
  args: {
    padding: "none",
    children: (
      <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <p className="text-white text-xl font-bold">Full Bleed Content</p>
      </div>
    ),
  },
};

/**
 * All card variants
 */
export const AllVariants: Story = {
  render: () => (
    <div className="space-y-4">
      <Card variant="default" title="Default">
        <p className="text-slate-600">Default card style</p>
      </Card>
      <Card variant="elevated" title="Elevated">
        <p className="text-slate-600">Elevated with shadow</p>
      </Card>
      <Card variant="outlined" title="Outlined">
        <p className="text-slate-600">Outlined border style</p>
      </Card>
    </div>
  ),
  decorators: [
    (Story) => (
      <div style={{ width: "400px" }}>
        <Story />
      </div>
    ),
  ],
};
