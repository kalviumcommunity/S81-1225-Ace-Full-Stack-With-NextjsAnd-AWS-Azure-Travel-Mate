import type { Meta, StoryObj } from "@storybook/react";
import Input from "./Input";

/**
 * Input Component Stories
 *
 * The Input component is a styled form input with label, validation, and accessibility features.
 */
const meta: Meta<typeof Input> = {
  title: "UI/Input",
  component: Input,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A styled input component with label, error states, and accessibility features.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "select",
      options: ["text", "email", "password", "number", "tel", "url"],
      description: "Input type",
    },
    required: {
      control: "boolean",
      description: "Mark as required",
    },
    disabled: {
      control: "boolean",
      description: "Disable the input",
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: "320px" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default text input
 */
export const Default: Story = {
  args: {
    label: "Username",
    name: "username",
    placeholder: "Enter your username",
  },
};

/**
 * Email input
 */
export const Email: Story = {
  args: {
    label: "Email Address",
    name: "email",
    type: "email",
    placeholder: "you@example.com",
  },
};

/**
 * Password input
 */
export const Password: Story = {
  args: {
    label: "Password",
    name: "password",
    type: "password",
    placeholder: "••••••••",
  },
};

/**
 * Required input
 */
export const Required: Story = {
  args: {
    label: "Full Name",
    name: "fullName",
    required: true,
    placeholder: "John Doe",
  },
};

/**
 * Input with helper text
 */
export const WithHelperText: Story = {
  args: {
    label: "Phone Number",
    name: "phone",
    type: "tel",
    placeholder: "+1 (555) 123-4567",
    helperText: "Include country code for international numbers",
  },
};

/**
 * Input with error
 */
export const WithError: Story = {
  args: {
    label: "Email Address",
    name: "email",
    type: "email",
    value: "invalid-email",
    error: "Please enter a valid email address",
  },
};

/**
 * Disabled input
 */
export const Disabled: Story = {
  args: {
    label: "Account ID",
    name: "accountId",
    value: "ACC-12345",
    disabled: true,
    helperText: "This field cannot be edited",
  },
};

/**
 * Input with icon
 */
export const WithIcon: Story = {
  args: {
    label: "Search",
    name: "search",
    placeholder: "Search destinations...",
    icon: "🔍",
  },
};

/**
 * Form example with multiple inputs
 */
export const FormExample: Story = {
  render: () => (
    <form className="space-y-4">
      <Input label="First Name" name="firstName" placeholder="John" required />
      <Input label="Last Name" name="lastName" placeholder="Doe" required />
      <Input
        label="Email"
        name="email"
        type="email"
        placeholder="john@example.com"
        required
      />
      <Input
        label="Password"
        name="password"
        type="password"
        placeholder="••••••••"
        required
        helperText="At least 8 characters"
      />
    </form>
  ),
  decorators: [
    (Story) => (
      <div style={{ width: "320px" }}>
        <Story />
      </div>
    ),
  ],
};

/**
 * Input states comparison
 */
export const AllStates: Story = {
  render: () => (
    <div className="space-y-4">
      <Input label="Normal" name="normal" placeholder="Normal input" />
      <Input label="With Value" name="withValue" value="Hello World" />
      <Input
        label="Required"
        name="required"
        required
        placeholder="Required field"
      />
      <Input
        label="With Error"
        name="withError"
        value="bad input"
        error="This field has an error"
      />
      <Input label="Disabled" name="disabled" value="Cannot edit" disabled />
      <Input
        label="With Icon"
        name="withIcon"
        icon="📧"
        placeholder="With icon"
      />
    </div>
  ),
  decorators: [
    (Story) => (
      <div style={{ width: "320px" }}>
        <Story />
      </div>
    ),
  ],
};
