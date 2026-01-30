import { Box } from "@mui/material";
import type { ObjectFieldTemplateProps } from "@rjsf/utils";
import type { ResponsiveColumns } from "../utils/generate-ui-schema-rjsf";

function getGridConfig(uiSchema: ObjectFieldTemplateProps["uiSchema"]) {
  const columns = uiSchema?.["ui:columns"] as unknown as
    | ResponsiveColumns
    | number
    | undefined;

  const responsiveColumns: ResponsiveColumns =
    typeof columns === "number"
      ? { xs: 1, sm: 1, md: columns, lg: columns, xl: columns }
      : { xs: 1, sm: 1, md: 2, lg: 2, xl: 2, ...columns };

  return {
    rows: (uiSchema?.["ui:rows"] as unknown as string[][]) || [],
    columns: responsiveColumns,
  };
}

function GridObjectFieldTemplate(props: ObjectFieldTemplateProps) {
  const { properties, title, description, uiSchema } = props;
  const { rows, columns } = getGridConfig(uiSchema);

  const propertyMap = new Map(properties.map((p) => [p.name, p]));

  const content = (
    <>
      {rows.map((row, rowIndex) => {
        const isSingleItem = row.length === 1;

        return (
          <Box
            key={rowIndex}
            sx={{
              display: "grid",
              gap: 2,
              mb: 2,
              gridTemplateColumns: isSingleItem
                ? "1fr"
                : {
                    xs: `repeat(${columns.xs}, 1fr)`,
                    sm: `repeat(${columns.sm}, 1fr)`,
                    md: `repeat(${columns.md}, 1fr)`,
                    lg: `repeat(${columns.lg}, 1fr)`,
                    xl: `repeat(${columns.xl}, 1fr)`,
                  },
            }}
          >
            {row.map((fieldName) => {
              const prop = propertyMap.get(fieldName);
              return prop ? <Box key={fieldName}>{prop.content}</Box> : null;
            })}
          </Box>
        );
      })}
    </>
  );

  if (title) {
    return (
      <Box
        component="fieldset"
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1,
          p: 2,
          mb: 2,
        }}
      >
        <legend>{title}</legend>
        {description && (
          <Box sx={{ color: "text.secondary", mb: 2 }}>{description}</Box>
        )}
        {content}
      </Box>
    );
  }

  return <Box>{content}</Box>;
}

export { GridObjectFieldTemplate };
