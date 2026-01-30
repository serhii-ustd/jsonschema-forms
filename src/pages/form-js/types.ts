// Validation rules
export interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
}

// Conditional logic
export interface ConditionalRules {
  hide?: string;
  show?: string;
}

// Layout configuration
export interface LayoutConfig {
  row?: string;
  columns?: number;
}

// Base form component
export interface BaseFormComponent {
  key?: string;
  id?: string;
  type: string;
  label?: string;
  description?: string;
  disabled?: boolean;
  readonly?: boolean;
  validate?: ValidationRules;
  conditional?: ConditionalRules;
  layout?: LayoutConfig;
}

// Text field component
export interface TextFieldComponent extends BaseFormComponent {
  type: "textfield";
  key: string;
  label: string;
  defaultValue?: string;
  placeholder?: string;
}

// Number component
export interface NumberComponent extends BaseFormComponent {
  type: "number";
  key: string;
  label: string;
  defaultValue?: number;
  decimalDigits?: number;
  increment?: string;
}

// Text area component
export interface TextAreaComponent extends BaseFormComponent {
  type: "textarea";
  key: string;
  label: string;
  rows?: number;
  defaultValue?: string;
}

// Checkbox component
export interface CheckboxComponent extends BaseFormComponent {
  type: "checkbox";
  key: string;
  label: string;
  defaultValue?: boolean;
}

// Radio button component
export interface RadioComponent extends BaseFormComponent {
  type: "radio";
  key: string;
  label: string;
  values: Array<{ label: string; value: string }>;
  defaultValue?: string;
}

// Select dropdown component
export interface SelectComponent extends BaseFormComponent {
  type: "select";
  key: string;
  label: string;
  values: Array<{ label: string; value: string }>;
  defaultValue?: string;
  searchable?: boolean;
}

// Checklist component
export interface ChecklistComponent extends BaseFormComponent {
  type: "checklist";
  key: string;
  label: string;
  values: Array<{ label: string; value: string }>;
  defaultValue?: string[];
}

// Taglist component
export interface TaglistComponent extends BaseFormComponent {
  type: "taglist";
  key: string;
  label: string;
  values: Array<{ label: string; value: string }>;
  defaultValue?: string[];
}

// Date and time component
export interface DateTimeComponent extends BaseFormComponent {
  type: "datetime";
  key: string;
  label: string;
  subtype?: "date" | "time" | "datetime";
  dateLabel?: string;
  timeLabel?: string;
  timeSerializingFormat?: "utc_offset" | "utc_normalized";
  disallowPassedDates?: boolean;
}

// Button component
export interface ButtonComponent extends BaseFormComponent {
  type: "button";
  label: string;
  action?: "submit" | "reset";
}

// Text component (Markdown)
export interface TextComponent extends BaseFormComponent {
  type: "text";
  text: string;
}

// Union type of all components
export type FormComponent =
  | TextFieldComponent
  | NumberComponent
  | TextAreaComponent
  | CheckboxComponent
  | RadioComponent
  | SelectComponent
  | ChecklistComponent
  | TaglistComponent
  | DateTimeComponent
  | ButtonComponent
  | TextComponent;

// Form schema
export interface FormSchema {
  type: "default";
  id: string;
  components: FormComponent[];
  schemaVersion?: number;
}

// Form data
export type FormData = Record<string, any>;

// Validation errors
export type FormErrors = Record<string, string>;

// Submit result
export interface SubmitResult {
  data: FormData;
  errors: FormErrors;
}
