import type { JSONSchema } from "@/types/json";

interface ResponsiveColumns {
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
}

interface GeneratorConfig {
  columns?: number | ResponsiveColumns;
}

type GridUiSchema = Record<string, unknown>;

function normalizeColumns(
  columns: number | ResponsiveColumns | undefined,
): ResponsiveColumns {
  const defaultResponsive: ResponsiveColumns = {
    xs: 1,
    sm: 1,
    md: 2,
    lg: 2,
    xl: 2,
  };

  if (columns === undefined) {
    return defaultResponsive;
  }

  if (typeof columns === "number") {
    return { xs: 1, sm: 1, md: columns, lg: columns, xl: columns };
  }

  return { ...defaultResponsive, ...columns };
}

function generateUiSchema(
  schema: JSONSchema,
  config: GeneratorConfig = {},
): GridUiSchema {
  const responsiveColumns = normalizeColumns(config.columns);

  const generate = (schema: JSONSchema): GridUiSchema => {
    if (!schema.properties) {
      return {};
    }

    const uiSchema: GridUiSchema = {};
    const rows: string[][] = [];
    let currentRow: string[] = [];

    const maxColumns = Math.max(
      ...(Object.values(responsiveColumns).filter(Boolean) as number[]),
    );

    for (const [propName, propSchema] of Object.entries(schema.properties)) {
      const s = propSchema as JSONSchema;
      const items = s.items as JSONSchema | undefined;
      const isNestedObject =
        s.type === "object" || (s.type === "array" && items?.type === "object");

      if (isNestedObject) {
        if (currentRow.length > 0) {
          rows.push([...currentRow]);
          currentRow = [];
        }

        rows.push([propName]);

        const nestedSchema = s.type === "object" ? s : items!;
        uiSchema[propName] = generate(nestedSchema);
      } else {
        currentRow.push(propName);

        if (currentRow.length === maxColumns) {
          rows.push([...currentRow]);
          currentRow = [];
        }
      }
    }

    if (currentRow.length > 0) {
      rows.push(currentRow);
    }

    uiSchema["ui:rows"] = rows;
    uiSchema["ui:columns"] = responsiveColumns;

    return uiSchema;
  };

  return generate(schema);
}

export {
  generateUiSchema,
  type GeneratorConfig,
  type ResponsiveColumns,
  type GridUiSchema,
};
