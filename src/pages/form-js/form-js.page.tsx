import { Container } from "@mui/material";
import FormJsEditor from "./components/form-js-editor/form-js-editor";

const FormJsPage = () => {
  return (
    <>
      <Container maxWidth="xl" sx={{ mt: 3 }}>
        <FormJsEditor />
      </Container>
    </>
  );
};

export default FormJsPage;
