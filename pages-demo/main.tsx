import React from "react";
import { createRoot } from "react-dom/client";
import Marketplace from "../components/marketplace";
import "../app/globals.css";

createRoot(document.getElementById("root")!).render(<Marketplace initialPath="/" initialUser={null} />);
