import { useState, useCallback, useMemo } from "react";
import type { FC } from "react";
import Editor from "@monaco-editor/react";
import type { JSONSchema7 } from "json-schema";
import type { JsonSchema } from "@jsonforms/core";

interface JsonEditorProps {
  data: JSONSchema7 | JsonSchema;
  onChange: (data: JSONSchema7 | JsonSchema) => void;
  height?: string;
  theme?: "vs-dark" | "light" | "vs";
  readOnly?: boolean;
  validateSchema?: boolean;
  onValidationChange?: (isValid: boolean) => void;
}

export const JsonEditor: FC<JsonEditorProps> = ({
  data,
  onChange,
  height = "600px",
  theme = "vs-dark",
  readOnly = false,
}) => {
  const [jsonText, setJsonText] = useState(() => JSON.stringify(data, null, 2));

  const editorValue = useMemo(() => {
    try {
      const currentParsed = JSON.parse(jsonText);
      if (JSON.stringify(currentParsed) !== JSON.stringify(data)) {
        return JSON.stringify(data, null, 2);
      }
      return jsonText;
    } catch {
      return JSON.stringify(data, null, 2);
    }
  }, [data, jsonText]);

  const handleChange = useCallback(
    (value: string | undefined) => {
      if (value === undefined) return;

      setJsonText(value);

      try {
        const parsed = JSON.parse(value);
        onChange(parsed);
      } catch {
        return;
      }
    },
    [onChange],
  );

  return (
    <Editor
      height={height}
      language="json"
      theme={theme}
      value={editorValue}
      onChange={handleChange}
      options={{
        minimap: { enabled: false },
        formatOnPaste: true,
        formatOnType: true,
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 2,
        readOnly,
        wordWrap: "on",
      }}
    />
  );
};

export default JsonEditor;
