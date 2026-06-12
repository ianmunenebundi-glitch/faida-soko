import React from "react";
import ReactDOM from "react-dom/client";
import FaidaSoko from "../FaidaSoko.jsx";
import { AuthProvider } from "./AuthContext.jsx";
import { inject } from "@vercel/analytics";

inject();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <FaidaSoko />
    </AuthProvider>
  </React.StrictMode>
);
