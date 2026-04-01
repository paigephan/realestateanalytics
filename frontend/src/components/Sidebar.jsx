import React from "react";
import { NavLink } from "react-router-dom";
import { FiHome, FiUsers, FiBarChart, FiInfo } from "react-icons/fi";
import Logo from "../assets/Logo.png"

const Sidebar = () => {
  const menuItems = [
    { name: "Home", path: "/home", icon: <FiUsers /> },
    { name: "Properties", path: "/properties", icon: <FiHome /> },
    { name: "Analytics", path: "/analytics", icon: <FiBarChart /> },
    { name: "About", path: "/about", icon: <FiInfo /> },
  ];

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-gray-800 text-white flex flex-col">
      {/* Logo / Title */}

      <div className="flex items-center">
        <img src={Logo} alt="RealyticsNZ logo" className="w-64" />
      </div>

      {/* Menu */}
      <nav className="flex flex-col flex-1">
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