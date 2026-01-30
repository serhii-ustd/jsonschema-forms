/**
 * Type definitions for @bpmn-io/form-js schema
 */

export interface FormJsValidation {
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  validationType?: "email" | "phone" | string;
}

export interface FormJsOption {
  label: string;
  value: string | number | boolean;
}

export interface FormJsLayout {
  columns?: number | "auto";
  row?: string;
}

export interface FormJsConditional {
  hide?: string;
  show?: string;
}

export interface FormJsComponent {
  id?: string;
  type: string;
  key?: string;
  label?: string;
  description?: string;
  defaultValue?: unknown;
  validate?: FormJsValidation;
  layout?: FormJsLayout;
  conditional?: FormJsConditional;
  readonly?: boolean;
  disabled?: boolean;

  // Select/Radio/Checklist/Taglist
  values?: FormJsOption[];
  valuesExpression?: string;

  // Number
  decimalDigits?: number;
  serializeToString?: boolean;

  // Datetime
  subtype?: "date" | "time" | "datetime";
  use24h?: boolean;

  // Text/HTML
  text?: string;
  content?: string;

  // File picker
  multiple?: boolean;
  accept?: string; // e.g. ".pdf,.doc" or "image/*"

  // Group/DynamicList
  components?: FormJsComponent[];
  path?: string;
  defaultRepetitions?: number;
}

export interface FormJsSchema {
  type?: "default";
  id?: string;
  schemaVersion?: number;
  components: FormJsComponent[];
  executionPlatform?: string;
  executionPlatformVersion?: string;
}
