// ============================================================================
// Form.js Type Definitions (Comprehensive)
// Based on @bpmn-io/form-js v1.18.0+
// ============================================================================

// Validation rules
export interface Validation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  validationType?: string;
}

// Conditional rendering (expressions start with "=")
export interface Conditional {
  hide?: string; // Expression: "=variableName = true"
  show?: string; // Expression: "=variableName = false"
}

// Layout configuration
export interface Layout {
  row?: string;
  columns?: number;
}

// Value option for select/radio/checklist/taglist
export interface ValueOption {
  label: string;
  value: string;
}

// ============================================================================
// Base Component
// ============================================================================

export interface BaseComponent {
  id?: string;
  key?: string;
  type: string;
  label?: string;
  description?: string;
  disabled?: boolean | string; // Can be expression
  readonly?: boolean | string; // Can be expression
  conditional?: Conditional;
  layout?: Layout;
  properties?: Record<string, any>;
}

// ============================================================================
// Input Components
// ============================================================================

export interface TextFieldComponent extends BaseComponent {
  type: "textfield";
  key: string;
  defaultValue?: string;
  placeholder?: string;
  validate?: Validation;
  appearance?: {
    prefixAdorner?: string;
    suffixAdorner?: string;
  };
}

export interface TextAreaComponent extends BaseComponent {
  type: "textarea";
  key: string;
  rows?: number;
  defaultValue?: string;
  placeholder?: string;
  validate?: Validation;
}

export interface NumberComponent extends BaseComponent {
  type: "number";
  key: string;
  defaultValue?: number;
  placeholder?: string;
  decimalDigits?: number;
  increment?: string;
  serializeToString?: boolean;
  validate?: Validation;
  appearance?: {
    prefixAdorner?: string;
    suffixAdorner?: string;
  };
}

export interface CheckboxComponent extends BaseComponent {
  type: "checkbox";
  key: string;
  defaultValue?: boolean;
  validate?: Validation;
}

// ============================================================================
// Selection Components
// ============================================================================

export interface RadioComponent extends BaseComponent {
  type: "radio";
  key: string;
  values?: ValueOption[];
  valuesKey?: string; // Dynamic values from variable
  valuesExpression?: string; // Expression to compute values
  defaultValue?: string;
  validate?: Validation;
}

export interface SelectComponent extends BaseComponent {
  type: "select";
  key: string;
  values?: ValueOption[];
  valuesKey?: string; // Dynamic values from variable
  valuesExpression?: string; // Expression to compute values
  defaultValue?: string;
  searchable?: boolean;
  validate?: Validation;
}

export interface ChecklistComponent extends BaseComponent {
  type: "checklist";
  key: string;
  values?: ValueOption[];
  valuesKey?: string;
  valuesExpression?: string;
  defaultValue?: string[];
  validate?: Validation;
}

export interface TaglistComponent extends BaseComponent {
  type: "taglist";
  key: string;
  values?: ValueOption[];
  valuesKey?: string;
  valuesExpression?: string;
  defaultValue?: string[];
  validate?: Validation;
}

// ============================================================================
// Date/Time Component
// ============================================================================

export interface DateTimeComponent extends BaseComponent {
  type: "datetime";
  key: string;
  subtype?: "date" | "time" | "datetime";
  dateLabel?: string;
  timeLabel?: string;
  timeSerializingFormat?: "utc_offset" | "utc_normalized" | "no_timezone";
  timeInterval?: number;
  use24h?: boolean;
  disallowPassedDates?: boolean;
  defaultValue?: string;
  validate?: Validation;
}

// ============================================================================
// File Upload Component
// ============================================================================

export interface FileComponent extends BaseComponent {
  type: "filepicker";
  key: string;
  multiple?: boolean;
  accept?: string; // MIME types, e.g., "image/*,.pdf"
  validate?: Validation;
}

// ============================================================================
// Display Components
// ============================================================================

export interface TextComponent extends BaseComponent {
  type: "text";
  text: string; // Markdown/HTML content
  content?: string; // Alternative to text
}

export interface ImageComponent extends BaseComponent {
  type: "image";
  source?: string; // URL or data URI
  alt?: string;
}

export interface IFrameComponent extends BaseComponent {
  type: "iframe";
  url?: string;
  urlExpression?: string; // Expression to compute URL
  height?: number | string;
  title?: string;
}

export interface HTMLComponent extends BaseComponent {
  type: "html";
  content?: string;
  contentExpression?: string; // Expression to compute HTML
}

// ============================================================================
// Layout Components
// ============================================================================

export interface GroupComponent extends BaseComponent {
  type: "group";
  label?: string;
  path?: string; // Nested data path
  showOutline?: boolean;
  components?: FormComponent[];
  verticalAlignment?: "start" | "center" | "end";
}

export interface SpacerComponent extends BaseComponent {
  type: "spacer";
  height?: number;
}

export interface SeparatorComponent extends BaseComponent {
  type: "separator";
}

// ============================================================================
// Table Component
// ============================================================================

export interface TableComponent extends BaseComponent {
  type: "table";
  key: string;
  dataSource?: string; // Variable name containing table data
  columnsExpression?: string; // Expression to define columns
  rowCount?: number;
  label?: string;
  columns?: Array<{
    label: string;
    key: string;
  }>;
}

// ============================================================================
// Dynamic List Component
// ============================================================================

export interface DynamicListComponent extends BaseComponent {
  type: "dynamiclist";
  key: string;
  defaultValue?: any[];
  path?: string;
  components?: FormComponent[];
  disableAdd?: boolean;
  disableRemove?: boolean;
  nonCollapsible?: boolean;
  allowAddRemove?: boolean;
}

// ============================================================================
// Button Component
// ============================================================================

export interface ButtonComponent extends BaseComponent {
  type: "button";
  label: string;
  action?: "submit" | "reset";
}

// ============================================================================
// Expression Field Component
// ============================================================================

export interface ExpressionFieldComponent extends BaseComponent {
  type: "expression";
  key: string;
  expression?: string; // FEEL expression
  computeOn?: "change" | "load";
}

// ============================================================================
// Union Type
// ============================================================================

export type FormComponent =
  | TextFieldComponent
  | TextAreaComponent
  | NumberComponent
  | CheckboxComponent
  | RadioComponent
  | SelectComponent
  | ChecklistComponent
  | TaglistComponent
  | DateTimeComponent
  | FileComponent
  | TextComponent
  | ImageComponent
  | IFrameComponent
  | HTMLComponent
  | GroupComponent
  | SpacerComponent
  | SeparatorComponent
  | TableComponent
  | DynamicListComponent
  | ButtonComponent
  | ExpressionFieldComponent;

// ============================================================================
// Form Schema
// ============================================================================

export interface FormSchema {
  type: "default";
  id?: string;
  components: FormComponent[];
  schemaVersion?: number;
  executionPlatform?: string;
  executionPlatformVersion?: string;
  exporter?: {
    name?: string;
    version?: string;
  };
}
