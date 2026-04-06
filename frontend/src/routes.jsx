// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Navbar from "./components/Navbar";
// import Home from "./pages/Home";
// import Properties from "./pages/Properties";
// import Analytics from "./pages/Analytics";

// export default function AppRoutes() {
//   return (
//     <BrowserRouter>
//       <Navbar />
//       <Routes>
//         <Route path="/home" element={<Home />} />
//         <Route path="/properties" element={<Properties />} />
//         <Route path="/analytics" element={<Analytics />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }   


import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import ReactGA from "react-ga4";

import AppLayout from "./layout/AppLayout";

import Home from "./pages/Home";
import Properties from "./pages/Properties";
import Analytics from "./pages/Analytics";
import AboutPage from "./pages/About";

// Initialize Google Analytics Tags here
ReactGA.initialize("G-KPGME9TRM4");

// Separate component to track page views for GA
function PageTracker() {
  const location = useLocation();

  useEffect(() => {
    ReactGA.send({ hitType: "pageview", page: location.pathname });
  }, [location]);

  return null;
}

// Main app
function App() {
  return (
    <BrowserRouter>
      <PageTracker /> {/* Add it here, inside BrowserRouter */}
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/home" />} />
          <Route path="home" element={<Home />} />
          <Route path="properties" element={<Properties />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="about" element={<AboutPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;