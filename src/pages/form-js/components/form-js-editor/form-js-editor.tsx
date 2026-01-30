import React, { useEffect, useRef, useState } from "react";
import { FormEditor } from "@bpmn-io/form-js";
import "@bpmn-io/form-js/dist/assets/form-js.css";
import "@bpmn-io/form-js/dist/assets/form-js-editor.css";
import "@bpmn-io/form-js/dist/assets/form-js-playground.css";

import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
} from "@mui/material";

import SaveIcon from "@mui/icons-material/Save";
import SchemaIcon from "@mui/icons-material/Schema";

import type { JSONSchema7 } from "json-schema";
import type { FormSchema } from "../../types";
import { convertFormJsToJsonSchema } from "@/utils/convert-form-js-to-json-schema/convert-form-js-to-json-schema";

// Initial schema for the editor
const defaultSchema: FormSchema = {
  type: "default",
  id: "Form_1",
  components: [
    {
      type: "text",
      text: "# New Form\n\nStart editing your form by adding components.",
    },
    {
      key: "name",
      label: "Name",
      type: "textfield",
      validate: {
        required: true,
      },
    },
  ],
};

const FormJsEditor: React.FC = () => {
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const editorInstanceRef = useRef<FormEditor | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentSchema, setCurrentSchema] = useState<FormSchema | null>(null);
  const [currentJsonSchema, setCurrentJsonSchema] =
    useState<JSONSchema7 | null>(null);

  const [schemaDialogOpen, setSchemaDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    const initEditor = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!editorContainerRef.current || !mounted) return;

        const formEditor = new FormEditor({
          container: editorContainerRef.current,
        });

        await formEditor.importSchema(defaultSchema);

        if (!mounted) {
          formEditor.destroy();
          return;
        }

        formEditor.on("changed", () => {
          // schema changed
        });

        editorInstanceRef.current = formEditor;
        setLoading(false);
      } catch (err) {
        if (mounted) {
          setError(
            `Failed to load editor: ${
              err instanceof Error ? err.message : "Unknown error"
            }`,
          );
          setLoading(false);
        }
      }
    };

    initEditor();

    return () => {
      mounted = false;
      editorInstanceRef.current?.destroy();
      editorInstanceRef.current = null;
    };
  }, []);

  const handleSaveSchema = () => {
    if (!editorInstanceRef.current) return;

    try {
      const schema = editorInstanceRef.current.saveSchema() as FormSchema;
      setCurrentSchema(schema);
      setCurrentJsonSchema(null);
      setSchemaDialogOpen(true);
      setSnackbarMessage("Form schema saved");
      setSnackbarOpen(true);
    } catch (err) {
      setError(
        `Error saving schema: ${
          err instanceof Error ? err.message : "Unknown error"
        }`,
      );
    }
  };

  const handleSaveJsonSchema = () => {
    if (!editorInstanceRef.current) return;

    try {
      const formSchema = editorInstanceRef.current.saveSchema() as FormSchema;
      const jsonSchema = convertFormJsToJsonSchema(formSchema);

      setCurrentJsonSchema(jsonSchema);
      setCurrentSchema(null);
      setSchemaDialogOpen(true);
      setSnackbarMessage("JSON Schema generated");
      setSnackbarOpen(true);
    } catch (err) {
      setError(
        `Error generating JSON Schema: ${
          err instanceof Error ? err.message : "Unknown error"
        }`,
      );
    }
  };

  const handleCopySchema = () => {
    const data = currentJsonSchema ?? currentSchema;
    if (!data) return;

    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setSnackbarMessage("Schema copied to clipboard");
    setSnackbarOpen(true);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Form.js Editor
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper elevation={3} sx={{ mb: 3 }}>
        <Box
          sx={{
            p: 2,
            borderBottom: 1,
            borderColor: "divider",
            display: "flex",
            gap: 2,
          }}
        >
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSaveSchema}
            disabled={loading}
          >
            Save Schema
          </Button>

          <Button
            variant="outlined"
            startIcon={<SchemaIcon />}
            onClick={handleSaveJsonSchema}
            disabled={loading}
          >
            JSON Schema
          </Button>
        </Box>

        {loading && (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="500px"
          >
            <CircularProgress />
          </Box>
        )}

        <Box
          ref={editorContainerRef}
          sx={{
            minHeight: "600px",
            "& .fjs-container": {
              height: "600px",
            },
          }}
        />
      </Paper>

      <Dialog
        open={schemaDialogOpen}
        onClose={() => setSchemaDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {currentJsonSchema ? "JSON Schema" : "Form Schema"}
        </DialogTitle>

        <DialogContent>
          <TextField
            multiline
            fullWidth
            rows={20}
            value={JSON.stringify(currentJsonSchema ?? currentSchema, null, 2)}
            InputProps={{
              readOnly: true,
              sx: {
                fontFamily: "monospace",
                fontSize: "0.875rem",
              },
            }}
            sx={{ mt: 2 }}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCopySchema}>Copy</Button>
          <Button onClick={() => setSchemaDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Box>
  );
};

export default FormJsEditor;
