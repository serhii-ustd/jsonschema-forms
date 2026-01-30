import type {
  JsonSchema,
  UISchemaElement,
  ControlElement,
  Layout,
  GroupLayout,
} from "@jsonforms/core";

interface GeneratorConfig {
  columns?: number;
}

function generateUiSchema(
  schema: JsonSchema,
  config: GeneratorConfig = {},
): Layout {
  const { columns = 2 } = config;

  const generate = (schema: JsonSchema, basePath: string): Layout => {
    if (!schema.properties) {
      return { type: "VerticalLayout", elements: [] };
    }

    const elements: UISchemaElement[] = [];
    let primitiveRow: ControlElement[] = [];
    let groupRow: UISchemaElement[] = [];

    const flushRow = (row: UISchemaElement[], target: UISchemaElement[]) => {
      if (row.length === 0) return;

      target.push(
        row.length === 1
          ? row[0]
          : ({ type: "HorizontalLayout", elements: [...row] } as Layout),
      );
    };

    for (const [propName, propSchema] of Object.entries(schema.properties)) {
      const s = propSchema as JsonSchema;
      const propPath = `${basePath}/${propName}`;
      const items = s.items as JsonSchema | undefined;
      const isNestedObject =
        s.type === "object" || (s.type === "array" && items?.type === "object");

      if (isNestedObject) {
        if (primitiveRow.length > 0) {
          flushRow(primitiveRow, elements);
          primitiveRow = [];
        }

        const nestedSchema = s.type === "object" ? s : items!;
        const nestedPath =
          s.type === "object"
            ? `${propPath}/properties`
            : `${propPath}/items/properties`;

        const innerLayout = generate(nestedSchema, nestedPath);

        groupRow.push({
          type: "Group",
          label: s.title || propName,
          elements: innerLayout.elements,
        } as GroupLayout);

        if (groupRow.length === columns) {
          flushRow(groupRow, elements);
          groupRow = [];
        }
      } else {
        if (groupRow.length > 0) {
          flushRow(groupRow, elements);
          groupRow = [];
        }

        primitiveRow.push({ type: "Control", scope: propPath });

        if (primitiveRow.length === columns) {
          flushRow(primitiveRow, elements);
          primitiveRow = [];
        }
      }
    }

    flushRow(primitiveRow, elements);
    flushRow(groupRow, elements);

    return { type: "VerticalLayout", elements };
  };

  return generate(schema, "#/properties");
}

export { generateUiSchema, type GeneratorConfig };
