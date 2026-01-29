import { useState } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import Grid from "@mui/material/Grid";
import Form from "@rjsf/mui";
import validator from "@rjsf/validator-ajv8";
import schema from "@/data/form-schema.json";
import type { JSONSchema7 } from "json-schema";
import type { IChangeEvent } from "@rjsf/core";
import { generateUiSchema } from "./utils/generate-ui-schema-rjsf";
import { GridObjectFieldTemplate } from "./templates/GridObjectFieldTemplate";
import JsonView from "@/components/json-view/json-view";

const ReactJsonschemaFormPage = () => {
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [columns, setColumns] = useState("2");

  const uiSchema = generateUiSchema(schema as JSONSchema7, {
    columns: {
      xs: 1,
      sm: 1,
      md: Number(columns),
      lg: Number(columns),
      xl: Number(columns),
    },
  });

  const handleColumnsChange = (event: SelectChangeEvent) => {
    setColumns(event.target.value);
  };

  return (
    <Box sx={{ flexGrow: 1, p: 2 }}>
      <h1>react-jsonschema-form</h1>

      <Box sx={{ display: "flex", gap: 3, mb: 2 }}>
        <FormControl sx={{ width: 120 }}>
          <InputLabel id="columns-label">Columns (md+)</InputLabel>
          <Select
            labelId="columns-label"
            value={columns}
            onChange={handleColumnsChange}
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <MenuItem key={n} value={String(n)}>
                {n}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper sx={{ p: 2 }}>
            <Form
              schema={schema as JSONSchema7}
              uiSchema={uiSchema}
              formData={formData}
              validator={validator}
              onChange={(e: IChangeEvent) => setFormData(e.formData)}
              templates={{ ObjectFieldTemplate: GridObjectFieldTemplate }}
            />
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }} minWidth={300}>
          <Paper>
            <JsonView json={formData} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ReactJsonschemaFormPage;
