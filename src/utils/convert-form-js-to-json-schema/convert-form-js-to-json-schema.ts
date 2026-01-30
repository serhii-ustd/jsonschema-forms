/**
 * Form-js to JSON Schema Converter
 *
 * Converts @bpmn-io/form-js schemas to JSON Schema (draft-07) format
 * Compatible with JSONSchema7 from 'json-schema' package
 */

import type { FormJsComponent, FormJsSchema } from "./types";

// Use JSONSchema7 compatible type names
export type JSONSchema7TypeName =
  | "string"
  | "number"
  | "integer"
  | "boolean"
  | "object"
  | "array"
  | "null";

/** JSON Schema Draft-07 compatible type */
export interface JSONSchema {
  $schema?: string;
  $id?: string;
  $ref?: string;
  $comment?: string;

  title?: string;
  description?: string;
  default?: unknown;
  readOnly?: boolean;
  writeOnly?: boolean;
  examples?: unknown[];

  type?: JSONSchema7TypeName | JSONSchema7TypeName[];
  enum?: unknown[];
  const?: unknown;

  // String
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  format?: string;

  // Number
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: number;
  exclusiveMaximum?: number;
  multipleOf?: number;

  // Array
  items?: JSONSchema | JSONSchema[];
  additionalItems?: JSONSchema | boolean;
  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;
  contains?: JSONSchema;

  // Object
  properties?: Record<string, JSONSchema>;
  patternProperties?: Record<string, JSONSchema>;
  additionalProperties?: JSONSchema | boolean;
  required?: string[];
  propertyNames?: JSONSchema;
  minProperties?: number;
  maxProperties?: number;
  dependencies?: Record<string, JSONSchema | string[]>;

  // Conditional
  if?: JSONSchema;
  then?: JSONSchema;
  else?: JSONSchema;
  allOf?: JSONSchema[];
  anyOf?: JSONSchema[];
  oneOf?: JSONSchema[];
  not?: JSONSchema;

  // Definitions
  definitions?: Record<string, JSONSchema>;

  // Extensions (form-js specific)
  [key: `x-${string}`]: unknown;
}

/** Converter options */
export interface ConverterOptions {
  /** Include x-formjs-* extensions (default: false) */
  includeExtensions?: boolean;
  /** JSON Schema draft version (default: 'draft-07') */
  draft?: "draft-04" | "draft-06" | "draft-07" | "2019-09" | "2020-12";
  /** Treat number with serializeToString as string (default: false) */
  stringifyNumbers?: boolean;
  /** Convert conditionals to if/then/else (default: true) */
  convertConditionals?: boolean;
}

const SCHEMA_URLS: Record<string, string> = {
  "draft-04": "http://json-schema.org/draft-04/schema#",
  "draft-06": "http://json-schema.org/draft-06/schema#",
  "draft-07": "http://json-schema.org/draft-07/schema#",
  "2019-09": "https://json-schema.org/draft/2019-09/schema",
  "2020-12": "https://json-schema.org/draft/2020-12/schema",
};

/** Display-only types (no data) */
const DISPLAY_TYPES = new Set([
  "text",
  "html",
  "image",
  "button",
  "spacer",
  "separator",
  "iframe",
  "table",
]);

/** File picker configuration in form-js */
interface FilePickerComponent extends FormJsComponent {
  multiple?: boolean;
  accept?: string; // e.g. ".pdf,.doc" or "image/*"
}

/** Parsed FEEL condition */
interface ParsedCondition {
  field: string;
  operator: "=" | "!=" | ">" | "<" | ">=" | "<=";
  value: string | number | boolean;
}

/** Conditional field info */
interface ConditionalField {
  component: FormJsComponent;
  condition: ParsedCondition;
  showWhen: boolean; // true = show when condition is true, false = hide when condition is true
}

/**
 * Convert form-js schema to JSON Schema
 */
export function convertToJSONSchema(
  formSchema: FormJsSchema,
  options: ConverterOptions = {},
): JSONSchema {
  const {
    draft = "draft-07",
    includeExtensions = false,
    convertConditionals = true,
  } = options;

  const properties: Record<string, JSONSchema> = {};
  const required: string[] = [];
  const conditionalFields: ConditionalField[] = [];

  // Process all components, collecting conditional ones separately
  processComponentsWithConditionals(
    formSchema.components,
    properties,
    required,
    conditionalFields,
    options,
  );

  const schema: JSONSchema = {
    $schema: SCHEMA_URLS[draft],
    type: "object",
    properties,
  };

  if (required.length > 0) {
    schema.required = required;
  }

  // Build if/then/else for conditional fields
  if (convertConditionals && conditionalFields.length > 0) {
    const allOf = buildConditionalSchema(conditionalFields, options);
    if (allOf.length > 0) {
      schema.allOf = allOf;
    }
  }

  if (includeExtensions && formSchema.id) {
    schema["x-formjs-id"] = formSchema.id;
    schema["x-formjs-schemaVersion"] = formSchema.schemaVersion;
  }

  return schema;
}

/**
 * Process components array, collecting conditional fields separately
 */
function processComponentsWithConditionals(
  components: FormJsComponent[],
  properties: Record<string, JSONSchema>,
  required: string[],
  conditionalFields: ConditionalField[],
  options: ConverterOptions,
): void {
  for (const component of components) {
    processComponentWithConditionals(
      component,
      properties,
      required,
      conditionalFields,
      options,
    );
  }
}

/**
 * Process single component, handling conditionals
 */
function processComponentWithConditionals(
  component: FormJsComponent,
  properties: Record<string, JSONSchema>,
  required: string[],
  conditionalFields: ConditionalField[],
  options: ConverterOptions,
): void {
  const { type, key } = component;

  // Skip display-only components
  if (DISPLAY_TYPES.has(type)) {
    return;
  }

  // Handle group
  if (type === "group") {
    processGroup(component, properties, required, options);
    return;
  }

  // Handle dynamic list
  if (type === "dynamiclist") {
    processDynamicList(component, properties, required, options);
    return;
  }

  // Skip components without key
  if (!key) {
    return;
  }

  // Check for conditional
  const conditional = component.conditional;
  if (
    options.convertConditionals !== false &&
    conditional &&
    (conditional.hide || conditional.show)
  ) {
    const parsed = parseFEELCondition(
      conditional.hide || conditional.show || "",
    );
    if (parsed) {
      conditionalFields.push({
        component,
        condition: parsed,
        showWhen: !conditional.hide, // hide="=x" means show when NOT x
      });

      // Still add to properties (for schema completeness) but don't add to required

      properties[key] = convertComponent(component, options);
      return;
    }
  }

  // Non-conditional field

  properties[key] = convertComponent(component, options);

  if (component.validate?.required) {
    required.push(key);
  }
}

/**
 * Parse FEEL expression to condition
 * Supports: =field = 'value', =field != 'value', =field = 123, =field = true
 */
function parseFEELCondition(feel: string): ParsedCondition | null {
  if (!feel || !feel.startsWith("=")) {
    return null;
  }

  // Remove leading '='
  const expr = feel.substring(1).trim();

  // Match patterns like: field != 'value' or field = "value" or field = 123
  const patterns = [
    // field != 'value' or field != "value"
    /^(\w+)\s*!=\s*['"](.+)['"]$/,
    // field = 'value' or field = "value"
    /^(\w+)\s*=\s*['"](.+)['"]$/,
    // field != number
    /^(\w+)\s*!=\s*(-?\d+(?:\.\d+)?)$/,
    // field = number
    /^(\w+)\s*=\s*(-?\d+(?:\.\d+)?)$/,
    // field != true/false
    /^(\w+)\s*!=\s*(true|false)$/i,
    // field = true/false
    /^(\w+)\s*=\s*(true|false)$/i,
  ];

  for (const pattern of patterns) {
    const match = expr.match(pattern);
    if (match) {
      const [, field, rawValue] = match;
      const isNotEqual = expr.includes("!=");

      // Parse value
      let value: string | number | boolean = rawValue;
      if (/^-?\d+$/.test(rawValue)) {
        value = parseInt(rawValue, 10);
      } else if (/^-?\d+\.\d+$/.test(rawValue)) {
        value = parseFloat(rawValue);
      } else if (rawValue.toLowerCase() === "true") {
        value = true;
      } else if (rawValue.toLowerCase() === "false") {
        value = false;
      }

      return {
        field,
        operator: isNotEqual ? "!=" : "=",
        value,
      };
    }
  }

  return null;
}

/**
 * Build allOf with if/then blocks from conditional fields
 */
function buildConditionalSchema(
  conditionalFields: ConditionalField[],
  options: ConverterOptions,
): JSONSchema[] {
  // Group fields by condition (field + value)
  const groups = new Map<string, ConditionalField[]>();

  for (const cf of conditionalFields) {
    // For hide="=field != 'value'", show when field = 'value'
    // For hide="=field = 'value'", show when field != 'value' (less common, skip for now)
    const { condition, showWhen } = cf;

    let effectiveValue: string | number | boolean;
    const effectiveField = condition.field;

    if (condition.operator === "!=" && !showWhen) {
      // hide="=field != 'value'" → show when field = 'value'
      effectiveValue = condition.value;
    } else if (condition.operator === "=" && !showWhen) {
      // hide="=field = 'value'" → show when field != 'value' (complex, skip)
      continue;
    } else if (condition.operator === "=" && showWhen) {
      // show="=field = 'value'" → show when field = 'value'
      effectiveValue = condition.value;
    } else {
      continue;
    }

    const key = `${effectiveField}:${JSON.stringify(effectiveValue)}`;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(cf);
  }

  // Build if/then for each group
  const allOf: JSONSchema[] = [];

  for (const [key, fields] of groups) {
    const [fieldName, valueJson] = key.split(":");
    const value = JSON.parse(valueJson);

    const thenProperties: Record<string, JSONSchema> = {};
    const thenRequired: string[] = [];

    for (const cf of fields) {
      const comp = cf.component;
      if (!comp.key) continue;

      thenProperties[comp.key] = convertComponent(comp, options);

      if (comp.validate?.required) {
        thenRequired.push(comp.key);
      }
    }

    const ifThen: JSONSchema = {
      if: {
        properties: {
          [fieldName]: { const: value },
        },
      },
      then: {
        properties: thenProperties,
      },
    };

    if (thenRequired.length > 0) {
      ifThen.then!.required = thenRequired;
    }

    allOf.push(ifThen);
  }

  return allOf;
}

/**
 * Process components array (legacy, without conditionals)
 */
function processComponents(
  components: FormJsComponent[],
  properties: Record<string, JSONSchema>,
  required: string[],
  options: ConverterOptions,
): void {
  for (const component of components) {
    processComponent(component, properties, required, options);
  }
}

/**
 * Process single component
 */
function processComponent(
  component: FormJsComponent,
  properties: Record<string, JSONSchema>,
  required: string[],
  options: ConverterOptions,
): void {
  const { type, key } = component;

  // Skip display-only components
  if (DISPLAY_TYPES.has(type)) {
    return;
  }

  // Handle group
  if (type === "group") {
    processGroup(component, properties, required, options);
    return;
  }

  // Handle dynamic list
  if (type === "dynamiclist") {
    processDynamicList(component, properties, required, options);
    return;
  }

  // Skip components without key
  if (!key) {
    return;
  }

  // Convert to JSON Schema property

  properties[key] = convertComponent(component, options);

  // Add to required if needed
  if (component.validate?.required) {
    required.push(key);
  }
}

/**
 * Process group component
 */
function processGroup(
  component: FormJsComponent,
  properties: Record<string, JSONSchema>,
  required: string[],
  options: ConverterOptions,
): void {
  const groupKey = component.key || component.path;
  const nestedComponents = component.components || [];

  if (groupKey) {
    const nestedProps: Record<string, JSONSchema> = {};
    const nestedRequired: string[] = [];

    processComponents(nestedComponents, nestedProps, nestedRequired, options);

    const groupSchema: JSONSchema = {
      type: "object",
      properties: nestedProps,
    };

    if (nestedRequired.length > 0) {
      groupSchema.required = nestedRequired;
    }

    if (component.label) {
      groupSchema.title = component.label;
    }

    if (options.includeExtensions) {
      groupSchema["x-formjs-type"] = "group";
    }

    properties[groupKey] = groupSchema;
  } else {
    processComponents(nestedComponents, properties, required, options);
  }
}

/**
 * Process dynamic list component
 */
function processDynamicList(
  component: FormJsComponent,
  properties: Record<string, JSONSchema>,
  required: string[],
  options: ConverterOptions,
): void {
  const listKey = component.key || component.path;

  if (!listKey) {
    return;
  }

  const nestedComponents = component.components || [];
  const itemProps: Record<string, JSONSchema> = {};
  const itemRequired: string[] = [];

  processComponents(nestedComponents, itemProps, itemRequired, options);

  const itemSchema: JSONSchema = {
    type: "object",
    properties: itemProps,
  };

  if (itemRequired.length > 0) {
    itemSchema.required = itemRequired;
  }

  const listSchema: JSONSchema = {
    type: "array",
    items: itemSchema,
  };

  if (component.defaultRepetitions) {
    listSchema.minItems = component.defaultRepetitions;
  }

  if (component.label) {
    listSchema.title = component.label;
  }

  if (options.includeExtensions) {
    listSchema["x-formjs-type"] = "dynamiclist";
  }

  properties[listKey] = listSchema;

  if (component.validate?.required) {
    required.push(listKey);
  }
}

/**
 * Convert single component to JSON Schema
 */
function convertComponent(
  component: FormJsComponent,
  options: ConverterOptions,
): JSONSchema {
  const schema: JSONSchema = {};

  switch (component.type) {
    case "textfield":
    case "textarea":
      schema.type = "string";
      applyStringValidation(schema, component);
      break;

    case "number":
      if (options.stringifyNumbers && component.serializeToString) {
        schema.type = "string";
        schema.pattern = "^-?\\d+(\\.\\d+)?$";
      } else {
        schema.type = component.decimalDigits === 0 ? "integer" : "number";
        applyNumberValidation(schema, component);
      }
      break;

    case "checkbox":
      schema.type = "boolean";
      break;

    case "radio":
    case "select":
      applyEnumSchema(schema, component, false);
      break;

    case "checklist":
    case "taglist":
      applyEnumSchema(schema, component, true);
      break;

    case "datetime":
      schema.type = "string";
      switch (component.subtype) {
        case "date":
          schema.format = "date";
          break;
        case "time":
          schema.format = "time";
          break;
        default:
          schema.format = "date-time";
      }
      break;

    case "filepicker":
      applyFilePickerSchema(schema, component as FilePickerComponent);
      break;

    case "expression":
      // Expression can return any type - no type constraint
      break;

    default:
      schema.type = "string";
  }

  // Common properties
  if (component.label) {
    schema.title = component.label;
  }

  if (component.description) {
    schema.description = component.description;
  }

  if (component.defaultValue !== undefined) {
    schema.default = component.defaultValue;
  }

  if (component.readonly) {
    schema.readOnly = true;
  }

  // Extensions
  if (options.includeExtensions) {
    if (component.id) schema["x-formjs-id"] = component.id;
    if (component.conditional)
      schema["x-formjs-conditional"] = component.conditional;
    if (component.layout) schema["x-formjs-layout"] = component.layout;
  }

  return schema;
}

/**
 * Apply string validation rules
 */
function applyStringValidation(
  schema: JSONSchema,
  component: FormJsComponent,
): void {
  const validate = component.validate;
  if (!validate) return;

  if (validate.minLength !== undefined) {
    schema.minLength = validate.minLength;
  }

  if (validate.maxLength !== undefined) {
    schema.maxLength = validate.maxLength;
  }

  if (validate.pattern) {
    schema.pattern = validate.pattern;
  }

  if (validate.validationType === "email") {
    schema.format = "email";
  }
}

/**
 * Apply number validation rules
 */
function applyNumberValidation(
  schema: JSONSchema,
  component: FormJsComponent,
): void {
  const validate = component.validate;
  if (!validate) return;

  if (validate.min !== undefined) {
    schema.minimum = validate.min;
  }

  if (validate.max !== undefined) {
    schema.maximum = validate.max;
  }
}

/**
 * Apply file picker schema
 * Uses data-url format for RJSF compatibility
 * @see https://rjsf-team.github.io/react-jsonschema-form/docs/usage/widgets/#file-widgets
 */
function applyFilePickerSchema(
  schema: JSONSchema,
  component: FilePickerComponent,
): void {
  if (component.multiple) {
    // Multiple files - array of data URLs
    schema.type = "array";
    schema.items = {
      type: "string",
      format: "data-url",
    };
  } else {
    // Single file - data URL string
    schema.type = "string";
    schema.format = "data-url";
  }

  // Store accept pattern as extension for UI libraries
  if (component.accept) {
    schema["x-accept"] = component.accept;
  }
}

/**
 * Apply enum schema for select/radio/checklist/taglist
 */
function applyEnumSchema(
  schema: JSONSchema,
  component: FormJsComponent,
  isMultiple: boolean,
): void {
  const values = component.values;

  if (isMultiple) {
    schema.type = "array";
    schema.uniqueItems = true;

    if (values && values.length > 0) {
      const enumValues = values.map((v) => v.value);
      const itemType = inferTypeFromValues(enumValues);

      schema.items = {
        enum: enumValues,
        ...(itemType && { type: itemType }),
      };
    } else {
      schema.items = { type: "string" };
    }
  } else {
    if (values && values.length > 0) {
      const enumValues = values.map((v) => v.value);
      const itemType = inferTypeFromValues(enumValues);

      schema.enum = enumValues;
      if (itemType) {
        schema.type = itemType;
      }
    } else {
      schema.type = "string";
    }
  }
}

/**
 * Infer type from enum values
 */
function inferTypeFromValues(
  values: unknown[],
): JSONSchema7TypeName | undefined {
  const types = new Set<JSONSchema7TypeName>();

  for (const value of values) {
    if (typeof value === "string") types.add("string");
    else if (typeof value === "number")
      types.add(Number.isInteger(value) ? "integer" : "number");
    else if (typeof value === "boolean") types.add("boolean");
  }

  if (types.size === 1) {
    return types.values().next().value;
  }

  return undefined;
}

/**
 * Validate if object is a valid form-js schema
 */
export function isFormJsSchema(obj: unknown): obj is FormJsSchema {
  if (!obj || typeof obj !== "object") return false;
  const schema = obj as Record<string, unknown>;

  if (!Array.isArray(schema.components)) return false;

  for (const comp of schema.components) {
    if (!comp || typeof comp !== "object") return false;
    if (typeof (comp as Record<string, unknown>).type !== "string")
      return false;
  }

  return true;
}
