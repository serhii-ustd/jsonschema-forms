// ============================================================================
// Form.js to JSON Schema Converter
// Converts @bpmn-io/form-js schemas to JSON Schema Draft 7
// ============================================================================

import type { JSONSchema7, JSONSchema7Definition } from "json-schema";
import type { FormSchema, FormComponent } from "./form-js.type";

/**
 * Converts a Form.js schema to JSON Schema (Draft 7)
 *
 * @param formSchema - The Form.js schema to convert
 * @returns A valid JSON Schema object
 */
export function convertFormJsToJsonSchema(formSchema: FormSchema): JSONSchema7 {
  const schema: JSONSchema7 = {
    $schema: "http://json-schema.org/draft-07/schema#",
    type: "object",
    title: formSchema.id || "Form",
    properties: {},
    required: [],
  };

  // Add conditional rendering rules if any components have them
  const conditionalComponents: Record<string, any> = {};

  for (const component of formSchema.components) {
    const result = convertComponent(component);

    if (!result) continue;

    const { propertySchema, isRequired, conditionalRules } = result;

    if (component.key) {
      schema.properties![component.key] = propertySchema;

      if (isRequired) {
        schema.required!.push(component.key);
      }

      if (conditionalRules) {
        conditionalComponents[component.key] = conditionalRules;
      }
    }
  }

  // Clean up empty required array
  if (schema.required?.length === 0) {
    delete schema.required;
  }

  // Add conditional rendering as x-conditional extension
  if (Object.keys(conditionalComponents).length > 0) {
    schema["x-conditionals"] = conditionalComponents;
  }

  return schema;
}

/**
 * Conversion result for a single component
 */
interface ConversionResult {
  propertySchema: JSONSchema7Definition;
  isRequired: boolean;
  conditionalRules?: {
    hide?: string;
    show?: string;
  };
}

/**
 * Converts a single Form.js component to a JSON Schema property
 */
function convertComponent(component: FormComponent): ConversionResult | null {
  // Skip components without keys (display-only components)
  if (!component.key) {
    // These components don't produce data, so we skip them in JSON Schema
    if (
      component.type === "text" ||
      component.type === "image" ||
      component.type === "spacer" ||
      component.type === "separator" ||
      component.type === "button" ||
      component.type === "html" ||
      component.type === "iframe"
    ) {
      return null;
    }
  }

  const isRequired = component.validate?.required ?? false;
  const conditionalRules = component.conditional;

  let propertySchema: JSONSchema7Definition;

  switch (component.type) {
    // ========================================================================
    // Input Fields
    // ========================================================================

    case "textfield":
    case "textarea": {
      propertySchema = {
        type: "string",
        title: component.label,
        description: component.description,
        default: component.defaultValue,
      };

      // Add validation rules
      if (component.validate) {
        if (component.validate.minLength !== undefined) {
          (propertySchema as JSONSchema7).minLength = component.validate.minLength;
        }
        if (component.validate.maxLength !== undefined) {
          (propertySchema as JSONSchema7).maxLength = component.validate.maxLength;
        }
        if (component.validate.pattern) {
          (propertySchema as JSONSchema7).pattern = component.validate.pattern;
        }
      }

      // Add appearance hints as extensions
      if ("appearance" in component && component.appearance) {
        (propertySchema as JSONSchema7)["x-appearance"] = component.appearance;
      }

      // Add textarea-specific properties
      if (component.type === "textarea" && "rows" in component) {
        (propertySchema as JSONSchema7)["x-rows"] = component.rows;
      }

      break;
    }

    case "number": {
      propertySchema = {
        type: component.serializeToString ? "string" : "number",
        title: component.label,
        description: component.description,
        default: component.defaultValue,
      };

      // Add validation rules
      if (component.validate) {
        if (component.validate.min !== undefined) {
          (propertySchema as JSONSchema7).minimum = component.validate.min;
        }
        if (component.validate.max !== undefined) {
          (propertySchema as JSONSchema7).maximum = component.validate.max;
        }
      }

      // Add number-specific extensions
      const extensions: Record<string, any> = {};
      if (component.decimalDigits !== undefined) {
        extensions.decimalDigits = component.decimalDigits;
      }
      if (component.increment) {
        extensions.increment = component.increment;
      }
      if (component.appearance) {
        extensions.appearance = component.appearance;
      }
      if (Object.keys(extensions).length > 0) {
        (propertySchema as JSONSchema7)["x-number"] = extensions;
      }

      break;
    }

    case "checkbox": {
      propertySchema = {
        type: "boolean",
        title: component.label,
        description: component.description,
        default: component.defaultValue,
      };
      break;
    }

    // ========================================================================
    // Selection Fields
    // ========================================================================

    case "radio":
    case "select": {
      propertySchema = {
        type: "string",
        title: component.label,
        description: component.description,
        default: component.defaultValue,
      };

      // Add enum values if statically defined
      if (component.values && component.values.length > 0) {
        (propertySchema as JSONSchema7).enum = component.values.map((v) => v.value);

        // Add labels as extension
        const enumLabels: Record<string, string> = {};
        component.values.forEach((v) => {
          enumLabels[v.value] = v.label;
        });
        (propertySchema as JSONSchema7)["x-enumLabels"] = enumLabels;
      }

      // Add dynamic values reference
      if (component.valuesKey) {
        (propertySchema as JSONSchema7)["x-valuesKey"] = component.valuesKey;
      }
      if (component.valuesExpression) {
        (propertySchema as JSONSchema7)["x-valuesExpression"] = component.valuesExpression;
      }

      // Add select-specific properties
      if (component.type === "select" && component.searchable !== undefined) {
        (propertySchema as JSONSchema7)["x-searchable"] = component.searchable;
      }

      break;
    }

    case "checklist":
    case "taglist": {
      propertySchema = {
        type: "array",
        title: component.label,
        description: component.description,
        default: component.defaultValue,
        items: {
          type: "string",
        },
        uniqueItems: true,
      };

      // Add enum values if statically defined
      if (component.values && component.values.length > 0) {
        ((propertySchema as JSONSchema7).items as JSONSchema7).enum = component.values.map(
          (v) => v.value,
        );

        // Add labels as extension
        const enumLabels: Record<string, string> = {};
        component.values.forEach((v) => {
          enumLabels[v.value] = v.label;
        });
        (propertySchema as JSONSchema7)["x-enumLabels"] = enumLabels;
      }

      // Add dynamic values reference
      if (component.valuesKey) {
        (propertySchema as JSONSchema7)["x-valuesKey"] = component.valuesKey;
      }
      if (component.valuesExpression) {
        (propertySchema as JSONSchema7)["x-valuesExpression"] = component.valuesExpression;
      }

      break;
    }

    // ========================================================================
    // Date/Time
    // ========================================================================

    case "datetime": {
      const subtype = component.subtype || "datetime";

      propertySchema = {
        type: "string",
        title: component.label,
        description: component.description,
        default: component.defaultValue,
      };

      // Set format based on subtype
      if (subtype === "date") {
        (propertySchema as JSONSchema7).format = "date";
      } else if (subtype === "time") {
        (propertySchema as JSONSchema7).format = "time";
      } else {
        (propertySchema as JSONSchema7).format = "date-time";
      }

      // Add datetime-specific extensions
      const extensions: Record<string, any> = {
        subtype,
      };
      if (component.timeSerializingFormat) {
        extensions.timeSerializingFormat = component.timeSerializingFormat;
      }
      if (component.timeInterval) {
        extensions.timeInterval = component.timeInterval;
      }
      if (component.use24h !== undefined) {
        extensions.use24h = component.use24h;
      }
      if (component.disallowPassedDates) {
        extensions.disallowPassedDates = component.disallowPassedDates;
      }
      (propertySchema as JSONSchema7)["x-datetime"] = extensions;

      break;
    }

    // ========================================================================
    // File Upload
    // ========================================================================

    case "filepicker": {
      if (component.multiple) {
        propertySchema = {
          type: "array",
          title: component.label,
          description: component.description,
          items: {
            type: "string",
            format: "uri",
          },
        };
      } else {
        propertySchema = {
          type: "string",
          title: component.label,
          description: component.description,
          format: "uri",
        };
      }

      // Add file-specific extensions
      if (component.accept) {
        (propertySchema as JSONSchema7)["x-accept"] = component.accept;
      }

      break;
    }

    // ========================================================================
    // Complex Structures
    // ========================================================================

    case "group": {
      // Groups create nested objects
      if (!component.path && !component.components) {
        return null;
      }

      propertySchema = {
        type: "object",
        title: component.label,
        description: component.description,
        properties: {},
      };

      // Recursively convert nested components
      if (component.components) {
        for (const nestedComponent of component.components) {
          const nestedResult = convertComponent(nestedComponent);
          if (nestedResult && nestedComponent.key) {
            (propertySchema as JSONSchema7).properties![nestedComponent.key] =
              nestedResult.propertySchema;
          }
        }
      }

      break;
    }

    case "dynamiclist": {
      // Dynamic lists are arrays of objects
      propertySchema = {
        type: "array",
        title: component.label,
        description: component.description,
        default: component.defaultValue,
        items: {
          type: "object",
          properties: {},
        },
      };

      // Recursively convert nested components
      if (component.components) {
        for (const nestedComponent of component.components) {
          const nestedResult = convertComponent(nestedComponent);
          if (nestedResult && nestedComponent.key) {
            ((propertySchema as JSONSchema7).items as JSONSchema7).properties![
              nestedComponent.key
            ] = nestedResult.propertySchema;
          }
        }
      }

      break;
    }

    case "table": {
      // Tables are arrays of objects with predefined columns
      propertySchema = {
        type: "array",
        title: component.label,
        description: component.description,
        items: {
          type: "object",
          properties: {},
        },
      };

      // Add columns as properties
      if (component.columns) {
        const itemProperties: Record<string, JSONSchema7> = {};
        component.columns.forEach((col) => {
          itemProperties[col.key] = {
            type: "string",
            title: col.label,
          };
        });
        ((propertySchema as JSONSchema7).items as JSONSchema7).properties = itemProperties;
      }

      // Add table-specific extensions
      const extensions: Record<string, any> = {};
      if (component.dataSource) {
        extensions.dataSource = component.dataSource;
      }
      if (component.columnsExpression) {
        extensions.columnsExpression = component.columnsExpression;
      }
      if (Object.keys(extensions).length > 0) {
        (propertySchema as JSONSchema7)["x-table"] = extensions;
      }

      break;
    }

    case "expression": {
      // Expression fields compute values - treat as any type
      propertySchema = {
        title: component.label,
        description: component.description,
        readOnly: true,
        "x-expression": component.expression,
        "x-computeOn": component.computeOn || "change",
      };
      break;
    }

    // ========================================================================
    // Display-only components (no schema output)
    // ========================================================================

    case "text":
    case "image":
    case "button":
    case "spacer":
    case "separator":
    case "html":
    case "iframe":
      return null;

    default:
      // Unknown component type
      console.warn(`Unknown component type: ${(component as any).type}`);
      return null;
  }

  // Clean up undefined values
  cleanSchema(propertySchema as JSONSchema7);

  return {
    propertySchema,
    isRequired,
    conditionalRules,
  };
}

/**
 * Removes undefined and null values from schema objects
 */
function cleanSchema(schema: JSONSchema7): void {
  Object.keys(schema).forEach((key) => {
    const value = (schema as any)[key];
    if (value === undefined || value === null) {
      delete (schema as any)[key];
    }
  });
}
