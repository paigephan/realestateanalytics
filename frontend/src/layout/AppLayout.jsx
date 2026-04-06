import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function AppLayout() {
  return (
    <div className="flex">
      <Sidebar />
      {/* pt-16 offsets the fixed top navbar on mobile, md:ml-64 offsets the fixed sidebar on desktop */}
      <main className="pt-16 md:pt-0 md:ml-64 flex-1">
        <Outlet />
      </main>
    </div>
  );
}