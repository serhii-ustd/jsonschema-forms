import { withJsonFormsControlProps } from "@jsonforms/react";
import {
  rankWith,
  isStringControl,
  isIntegerControl,
  isBooleanControl,
  isEnumControl,
  isDateControl,
  isNumberControl,
  and,
  not,
  type ControlProps,
} from "@jsonforms/core";

const TailwindTextControl = ({
  data,
  handleChange,
  path,
  label,
  errors,
  required,
}: ControlProps) => (
  <div className="mb-4">
    <label
      htmlFor={path}
      className={`block text-sm font-medium mb-1 ${errors ? "text-red-600" : "text-gray-700"}`}
    >
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <input
      id={path}
      type="text"
      value={data || ""}
      onChange={(e) => handleChange(path, e.target.value)}
      className={`
        w-full px-3 py-2 rounded-lg border transition-all duration-200
        focus:outline-none focus:ring-2
        ${
          errors
            ? "border-red-500 focus:ring-red-200"
            : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-200"
        }
      `}
    />
    {errors && <p className="mt-1 text-sm text-red-600">{errors}</p>}
  </div>
);

const TailwindIntegerControl = ({
  data,
  handleChange,
  path,
  label,
  schema,
}: ControlProps) => {
  const min = schema.minimum ?? 0;
  const max = schema.maximum ?? 100;
  const value = data ?? min;

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        <span className="text-sm font-semibold bg-indigo-100 text-indigo-800 px-2 py-1 rounded">
          {value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => handleChange(path, Number(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
      />
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
};

const TailwindNumberControl = ({
  data,
  handleChange,
  path,
  label,
  errors,
}: ControlProps) => (
  <div className="mb-4">
    <label
      htmlFor={path}
      className="block text-sm font-medium text-gray-700 mb-1"
    >
      {label}
    </label>
    <input
      id={path}
      type="number"
      step="any"
      value={data ?? ""}
      onChange={(e) =>
        handleChange(path, e.target.value ? Number(e.target.value) : undefined)
      }
      className={`
        w-full px-3 py-2 rounded-lg border transition-all duration-200
        focus:outline-none focus:ring-2 focus:border-indigo-500 focus:ring-indigo-200
        ${errors ? "border-red-500" : "border-gray-300"}
      `}
    />
  </div>
);

const TailwindBooleanControl = ({
  data,
  handleChange,
  path,
  label,
}: ControlProps) => (
  <div className="mb-4 flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
    <label
      htmlFor={path}
      className="text-sm font-medium text-gray-700 cursor-pointer"
    >
      {label}
    </label>
    <button
      id={path}
      type="button"
      role="switch"
      aria-checked={!!data}
      onClick={() => handleChange(path, !data)}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
        ${data ? "bg-indigo-600" : "bg-gray-300"}
      `}
    >
      <span
        className={`
          inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200
          ${data ? "translate-x-6" : "translate-x-1"}
        `}
      />
    </button>
  </div>
);

const TailwindEnumControl = ({
  data,
  handleChange,
  path,
  label,
  schema,
  required,
}: ControlProps) => {
  const options = schema.enum as string[];

  return (
    <div className="mb-4">
      <label
        htmlFor={path}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        id={path}
        value={data || ""}
        onChange={(e) => handleChange(path, e.target.value || undefined)}
        className="
          w-full px-3 py-2 rounded-lg border border-gray-300 bg-white
          focus:outline-none focus:ring-2 focus:border-indigo-500 focus:ring-indigo-200
          transition-all duration-200 cursor-pointer
        "
      >
        <option value="">Select {label}</option>
        {options?.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

const TailwindDateControl = ({
  data,
  handleChange,
  path,
  label,
  required,
}: ControlProps) => (
  <div className="mb-4">
    <label
      htmlFor={path}
      className="block text-sm font-medium text-gray-700 mb-1"
    >
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <input
      id={path}
      type="date"
      value={data || ""}
      onChange={(e) => handleChange(path, e.target.value || undefined)}
      className="
        w-full px-3 py-2 rounded-lg border border-gray-300
        focus:outline-none focus:ring-2 focus:border-indigo-500 focus:ring-indigo-200
        transition-all duration-200
      "
    />
  </div>
);

const TailwindTextRenderer = withJsonFormsControlProps(TailwindTextControl);
const TailwindIntegerRenderer = withJsonFormsControlProps(
  TailwindIntegerControl,
);
const TailwindNumberRenderer = withJsonFormsControlProps(TailwindNumberControl);
const TailwindBooleanRenderer = withJsonFormsControlProps(
  TailwindBooleanControl,
);
const TailwindEnumRenderer = withJsonFormsControlProps(TailwindEnumControl);
const TailwindDateRenderer = withJsonFormsControlProps(TailwindDateControl);

export const tailwindRenderers = [
  {
    tester: rankWith(
      3,
      and(isStringControl, not(isEnumControl), not(isDateControl)),
    ),
    renderer: TailwindTextRenderer,
  },
  {
    tester: rankWith(3, isIntegerControl),
    renderer: TailwindIntegerRenderer,
  },
  {
    tester: rankWith(3, and(isNumberControl, not(isIntegerControl))),
    renderer: TailwindNumberRenderer,
  },
  {
    tester: rankWith(3, isBooleanControl),
    renderer: TailwindBooleanRenderer,
  },
  {
    tester: rankWith(3, isEnumControl),
    renderer: TailwindEnumRenderer,
  },
  {
    tester: rankWith(5, isDateControl),
    renderer: TailwindDateRenderer,
  },
];
