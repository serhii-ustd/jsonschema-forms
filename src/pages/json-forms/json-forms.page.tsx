// json-forms-page.tsx
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import { useState } from "react";
import Grid from "@mui/material/Grid";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { type SelectChangeEvent } from "@mui/material/Select";
import {
  materialCells,
  materialRenderers,
} from "@jsonforms/material-renderers";
import { vanillaCells } from "@jsonforms/vanilla-renderers";
import { JsonForms } from "@jsonforms/react";
import JsonView from "@/components/json-view/json-view";
import schema from "@/data/form-schema.json";
import { customRenderers as shadcnRenderers } from "@/pages/json-forms/renders/custom-renders/custom-renders";
import { tailwindRenderers } from "./renders/tailwind-renderers/tailwind-renderers";
import { generateUiSchema } from "@/pages/json-forms/utils/generate-ui-schema";

type RendererType = "mui" | "shadcn" | "tailwind";

const JsonFormsPage = () => {
  const [data, setData] = useState({});
  const [columns, setColumns] = useState("2");
  const [rendererType, setRendererType] = useState<RendererType>("mui");

  const uischema = generateUiSchema(schema, {
    columns: Number(columns),
  });

  const handleColumnsChange = (event: SelectChangeEvent) => {
    setColumns(event.target.value);
  };

  const handleRendererChange = (event: SelectChangeEvent) => {
    setRendererType(event.target.value as RendererType);
  };

  const getRenderers = () => {
    switch (rendererType) {
      case "shadcn":
        return [...shadcnRenderers, ...materialRenderers];
      case "tailwind":
        return [...tailwindRenderers, ...materialRenderers];
      default:
        return materialRenderers;
    }
  };

  const getCells = () => {
    return rendererType === "mui" ? materialCells : vanillaCells;
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <h1>JSONForms</h1>

      <Box
        sx={{ display: "flex", gap: 3, marginBottom: 2, alignItems: "center" }}
      >
        <FormControl sx={{ width: 120 }}>
          <InputLabel id="columns-label">Columns</InputLabel>
          <Select
            labelId="columns-label"
            value={columns}
            label="Columns"
            onChange={handleColumnsChange}
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <MenuItem key={n} value={n}>
                {n}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ width: 180 }}>
          <InputLabel id="renderer-label">Renderer</InputLabel>
          <Select
            labelId="renderer-label"
            value={rendererType}
            label="Renderer"
            onChange={handleRendererChange}
          >
            <MenuItem value="mui">Material UI</MenuItem>
            <MenuItem value="shadcn">Shadcn/ui</MenuItem>
            <MenuItem value="tailwind">Tailwind CSS</MenuItem>
          </Select>
        </FormControl>

        <Box
          sx={{
            px: 2,
            py: 1,
            borderRadius: 1,
            bgcolor:
              rendererType === "mui"
                ? "primary.light"
                : rendererType === "shadcn"
                  ? "secondary.light"
                  : "success.light",
            color: "white",
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          {rendererType === "mui" && "Using Material UI components"}
          {rendererType === "shadcn" && "Using Shadncn/ui components"}
          {rendererType === "tailwind" && "Using pure Tailwind CSS"}
        </Box>
      </Box>

      <Grid container spacing={2} flexWrap="wrap">
        <Grid size={8}>
          <Paper sx={{ p: 2 }}>
            <JsonForms
              schema={schema}
              uischema={uischema}
              data={data}
              renderers={getRenderers()}
              cells={getCells()}
              onChange={({ data }) => {
                setData(data);
              }}
            />
          </Paper>
        </Grid>

        <Grid size={4} minWidth={300}>
          <Paper>
            <JsonView json={data} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default JsonFormsPage;
