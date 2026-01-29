/// <reference types="vite/client" />

import "@mui/material/styles";
import type { JsonFormsTheme } from "@jsonforms/material-renderers";

declare module "@mui/material/styles" {
  interface Theme {
    jsonforms?: JsonFormsTheme;
  }

  interface ThemeOptions {
    jsonforms?: JsonFormsTheme;
  }
}
