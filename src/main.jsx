import React from "react";
import ReactDOM from "react-dom/client";
import FaidaSoko from "../FaidaSoko.jsx";
import { AuthProvider } from "./AuthContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <FaidaSoko />
    </AuthProvider>
  </React.StrictMode>
);
