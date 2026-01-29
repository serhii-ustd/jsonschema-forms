import "./App.css";
import { useState } from "react";
import { NavLink, Route, Routes, useNavigate } from "react-router";
import ReactJsonschemaForm from "@/pages/react-jsonschema-form/react-jsonschema-form.page";
import {
  AppBar,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import JsonFormsPage from "@/pages/json-forms/json-forms.page";

const drawerWidth = 240;

const navItems = [
  { label: "JSONForms", path: "/" },
  { label: "react-jsonschema-form", path: "/react-jsonschema-form" },
];

function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: "center" }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        Re-Forms
      </Typography>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              sx={{ textAlign: "center" }}
              onClick={() => navigate(item.path)}
            >
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar component="nav" position="static">
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Re-Forms
          </Typography>

          <Box sx={{ display: { xs: "none", sm: "flex" }, gap: "10px" }}>
            {navItems.map((item) => (
              <Button
                key={item.path}
                component={NavLink}
                variant="text"
                to={item.path}
                sx={{
                  color: "#fff",
                  "&.active": {
                    backgroundColor: "rgba(255,255,255,0.15)",
                  },
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </AppBar>

      <nav>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
      </nav>

      <Box component="main" sx={{ px: 4, py: 3, flex: 1 }}>
        <Routes>
          <Route index path="/" element={<JsonFormsPage />} />
          <Route
            path="/react-jsonschema-form"
            element={<ReactJsonschemaForm />}
          />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;
