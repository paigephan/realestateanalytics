import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { FiHome, FiUsers, FiBarChart, FiInfo, FiMenu, FiX } from "react-icons/fi";
import Logo from "../assets/Logo.png"

const Sidebar = () => {

  const [menuOpen, setMenuOpen] = useState(false);

  const menuItems = [
    { name: "Home", path: "/home", icon: <FiUsers /> },
    { name: "Properties", path: "/properties", icon: <FiHome /> },
    { name: "Analytics", path: "/analytics", icon: <FiBarChart /> },
    { name: "About", path: "/about", icon: <FiInfo /> },
  ];

  return (
    <>
    {/* ── DESKTOP: fixed left sidebar (hidden on mobile) ── */}
    <aside className="hidden md:flex fixed top-0 left-0 h-screen w-64 bg-gray-800 text-white flex-col">
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
    
    {/* ── MOBILE: fixed top navbar (hidden on desktop) ── */}
    <header className="md:hidden fixed top-0 left-0 right-0 z-[1001] bg-gray-800 text-white">
        <div className="flex items-center justify-between px-4 h-16">
          <img src={Logo} alt="RealyticsNZ logo" className="h-10 w-auto" />

          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="p-2 rounded hover:bg-gray-700 transition-colors"
            aria-label="Toggle menu"
          >
            {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* Dropdown menu */}
        {menuOpen && (
          <nav className="flex flex-col border-t border-gray-700">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMenuOpen(false)}
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
        )}
      </header>
    </>
  );
};

export default Sidebar;