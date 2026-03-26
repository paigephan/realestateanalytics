import React from "react";
import { NavLink } from "react-router-dom";
import { FiHome, FiUsers, FiBarChart } from "react-icons/fi";

const Sidebar = () => {
  const menuItems = [
    { name: "Home", path: "/home", icon: <FiUsers /> },
    { name: "Properties", path: "/properties", icon: <FiHome /> },
    { name: "Analytics", path: "/analytics", icon: <FiBarChart /> },
  ];

  return (
    <aside className="flex flex-col h-screen w-64 bg-gray-800 text-white">
      {/* Logo / Title */}
      <div className="p-6 text-2xl font-bold">
        RealyticsNZ
      </div>

      {/* Menu */}
      <nav className="flex flex-col flex-1 mt-6">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-4 text-lg hover:bg-gray-500 ${
                isActive ? "bg-gray-700 font-semibold" : ""
              }`
            }
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

    </aside>
  );
};

export default Sidebar;