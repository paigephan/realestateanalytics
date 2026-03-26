import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar"; // make sure file name matches

export default function AppLayout() {
  return (
    <div className="flex">
      <Sidebar />

      {/* Main content / slideshow */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}