import type { Meta, StoryObj } from "@storybook/react";
import Button from "./Button";

/**
 * Button Component Stories
 *
 * The Button component is a versatile, accessible button with multiple variants and sizes.
 * Use it for actions, form submissions, and navigation triggers.
 */
const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A versatile button component with multiple variants, sizes, and states.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "outline", "ghost", "danger"],
      description: "Visual style variant",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Button size",
    },
    disabled: {
      control: "boolean",
      description: "Disable the button",
    },
    loading: {
      control: "boolean",
      description: "Show loading spinner",
    },
    fullWidth: {
      control: "boolean",
      description: "Make button full width",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Primary button - used for main actions
 */
export const Primary: Story = {
  args: {
    label: "Primary Button",
    variant: "primary",
  },
};

/**
 * Secondary button - used for secondary actions
 */
export const Secondary: Story = {
  args: {
    label: "Secondary Button",
    variant: "secondary",
  },
};

/**
 * Outline button - used for tertiary actions
 */
export const Outline: Story = {
  args: {
    label: "Outline Button",
    variant: "outline",
  },
};

/**
 * Ghost button - minimal styling for subtle actions
 */
export const Ghost: Story = {
  args: {
    label: "Ghost Button",
    variant: "ghost",
  },
};

/**
 * Danger button - used for destructive actions
 */
export const Danger: Story = {
  args: {
    label: "Delete Item",
    variant: "danger",
  },
};

/**
 * Small button
 */
export const Small: Story = {
  args: {
    label: "Small",
    size: "sm",
  },
};

/**
 * Large button
 */
export const Large: Story = {
  args: {
    label: "Large Button",
    size: "lg",
  },
};

/**
 * Loading state
 */
export const Loading: Story = {
  args: {
    label: "Saving...",
    loading: true,
  },
};

/**
 * Disabled state
 */
export const Disabled: Story = {
  args: {
    label: "Disabled",
    disabled: true,
  },
};

/**
 * Button with icon
 */
export const WithIcon: Story = {
  args: {
    label: "Add Item",
    icon: "➕",
  },
};

/**
 * Full width button
 */
export const FullWidth: Story = {
  args: {
    label: "Full Width Button",
    fullWidth: true,
  },
  decorators: [
    (Story) => (
      <div style={{ width: "300px" }}>
        <Story />
      </div>
    ),
  ],
};

/**
 * All variants side by side
 */
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
      <Button label="Primary" variant="primary" />
      <Button label="Secondary" variant="secondary" />
      <Button label="Outline" variant="outline" />
      <Button label="Ghost" variant="ghost" />
      <Button label="Danger" variant="danger" />
    </div>
  ),
};

/**
 * All sizes comparison
 */
export const AllSizes: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        gap: "1rem",
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <Button label="Small" size="sm" />
      <Button label="Medium" size="md" />
      <Button label="Large" size="lg" />
    </div>
  ),
};
