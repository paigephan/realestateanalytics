// export default function Properties() {
//     return <h1 className="text-2xl font-bold">Properties Page</h1>;
//   }

import { useEffect, useState } from "react";
import MultiSelect from "../components/MultiSelect";
import axios from "axios";
import { useLocation } from "react-router-dom";

const API_URL_SUBURBS = `${process.env.REACT_APP_API_BASE_URL}/api/property/suburbs`;
const API_URL_DISTRICTS = `${process.env.REACT_APP_API_BASE_URL}/api/property/districts`;
const API_URL_SEARCH = `${process.env.REACT_APP_API_BASE_URL}/api/property/search`;

export default function Properties() {
  const [sortField, setSortField] = useState(null); // 'suburb', 'district', 'price', 'landArea'
  const [sortOrder, setSortOrder] = useState("asc"); // 'asc' or 'desc'

  const [results, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [districts, setDistricts] = useState([]);
  const [selectedDistricts, setSelectedDistricts] = useState([]); // user selection

  const [suburbs, setSuburbs] = useState([]);
  const [selectedSuburbs, setSelectedSuburbs] = useState([]);     // user selection

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [minLandArea, setMinLandArea] = useState("");
  const [maxLandArea, setMaxLandArea] = useState("");

  const [loadingSuburbs, setLoadingSuburbs] = useState(true);
  const [loadingDistricts, setLoadingDistricts] = useState(true);

  const handleSearch = async () => {
    setLoading(true);
    const formData = {
      districts: selectedDistricts.map(d => d.value),
      suburbs: selectedSuburbs.map(s => s.value),
      min_price: minPrice || null,
      max_price: maxPrice || null,
      min_area: minLandArea || null,
      max_area: maxLandArea || null,
    };
  
    console.log("User submitted:", formData);

    try {
      const response = await axios.post(API_URL_SEARCH, formData);
      setSearchResults(response.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false); // <- make sure you include this
    }
  };

  const routerLocation = useLocation(); // ✅ rename to avoid conflict

  useEffect(() => {
    if (!loadingDistricts && !loadingSuburbs) {
      handleSearch();
    }
  }, [routerLocation.pathname, loadingDistricts, loadingSuburbs]);

  const fetchList = async (API_URL_SEARCH, setData, setLoading) => {
    try {
      setLoading(true);
      const response = await fetch(API_URL_SEARCH);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      
      // Map here if needed
      const formatted = data.map(d => ({ value: d, label: d }));
      setData(formatted);
      
  
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const sortedResults = [...results].sort((a, b) => {
    if (!sortField) return 0; // no sorting yet
  
    let valA, valB;
  
    switch (sortField) {
      case "suburb":
        valA = a.suburb?.toLowerCase() || "";
        valB = b.suburb?.toLowerCase() || "";
        break;
      case "district":
        valA = a.district?.toLowerCase() || "";
        valB = b.district?.toLowerCase() || "";
        break;
      case "price":
        valA = a.final_price || 0;
        valB = b.final_price || 0;
        break;
      case "landArea":
        valA = a.land_area_m2 || 0;
        valB = b.land_area_m2 || 0;
        break;
      default:
        return 0;
    }
  
    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  // ✅ Call API on mount
  useEffect(() => {
    fetchList(API_URL_SUBURBS, setSuburbs, setLoadingSuburbs);
    fetchList(API_URL_DISTRICTS, setDistricts, setLoadingDistricts);
  }, []);
return (
  <div>
  
    {/* Search Section*/}
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-end p-6 bg-white shadow-md rounded-lg">

      {/* Districts */}
      <div className="flex flex-col">
        <label className="mb-2 text-sm font-semibold text-gray-700">Districts</label>
        {loadingDistricts ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : (
          <MultiSelect
            options={districts}           // all available districts, e.g., { value, label }
            value={selectedDistricts}     // currently selected districts
            onChange={(selected) => {
              setSelectedDistricts(selected);                  // update state
            }}
            isMulti
            className="shadow-sm"
          />
        )}
      </div>

      {/* Suburbs */}
      <div className="flex flex-col" >
        <label className="mb-2 text-sm font-semibold text-gray-700">Suburbs</label>
        {loadingSuburbs ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : (
          <MultiSelect 
            options={suburbs} 
            value={selectedSuburbs} 
            onChange={(selected) => {
              setSelectedSuburbs(selected);
            }} 
            isMulti
            className="shadow-sm" 
          />
        )}
      </div>

      {/* Price Range */}
      <div className="flex flex-col">
        <label className="mb-2 text-sm font-semibold text-gray-700">Price Range ($)</label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-1/2 p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-1/2 p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Land Area */}
      <div className="flex flex-col">
        <label className="mb-2 text-sm font-semibold text-gray-700">Land Area (m²)</label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minLandArea}
            onChange={(e) => setMinLandArea(e.target.value)}
            className="w-1/2 p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
          <input
            type="number"
            placeholder="Max"
            value={maxLandArea}
            onChange={(e) => setMaxLandArea(e.target.value)}
            className="w-1/2 p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Search Button */}
      <div className="flex flex-col">
        <button className="mt-6 md:mt-0 w-full bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-shadow shadow hover:shadow-lg"
          onClick={handleSearch}>
          Search
        </button>
      </div>

    </div>


    {/* Sort Section*/}
    <div className="flex gap-2 mb-4 flex-wrap mt-6 pl-6">
    <button
      className="px-3 py-1 border rounded hover:bg-gray-100"
      onClick={() => {
        setSortField("district");
        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
      }}
    >
      District {sortField === "district" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
    </button>
    
    <button
      className="px-3 py-1 border rounded hover:bg-gray-100"
      onClick={() => {
        setSortField("suburb");
        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
      }}
    >
      Suburb {sortField === "suburb" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
    </button>

    <button
      className="px-3 py-1 border rounded hover:bg-gray-100"
      onClick={() => {
        setSortField("price");
        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
      }}
    >
      Price {sortField === "price" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
    </button>

    <button
      className="px-3 py-1 border rounded hover:bg-gray-100"
      onClick={() => {
        setSortField("landArea");
        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
      }}
    >
      Land Area {sortField === "landArea" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
    </button>

    {/* Clear Sort Button */}
    <button
      className="px-3 py-1 border rounded text-blue-600 hover:bg-blue-200 ml-2"
      onClick={() => {
        setSortField(null);
        setSortOrder("asc");
      }}
    >
      Clear Sort
    </button>
    </div>

    {/* Results Section*/}
    {loading ? (
      <p className= "pl-6">Loading...</p>
    ) : (
      <div className="max-h-screen overflow-y-auto mt-6 px-6">
    {sortedResults.length === 0 ? (
    <p className="text-gray-500 pl-6">Start your searching journey.</p>
    ) : (
    <div className={`grid ${!sortField ? 'grid-cols-1 md:grid-cols-2 gap-6' : 'grid-cols-1 gap-2'}`}>
      {sortedResults.map((item, index) => (
        <div
          key={index}
          className={`bg-white rounded-lg shadow p-2 ${
            sortField ? 'flex flex-row items-start gap-4' : ''
          }`}
        >
          {/* Image */}
          <img
            src={item.image_url}
            alt="property"
            className={`${
              sortField ? 'w-48 h-32 object-cover rounded' : 'w-full h-48 object-cover rounded'
            }`}
          />

          {/* Text Content */}
          <div className={`${sortField ? 'flex-1' : 'mt-3' }`}>
            <h3 className="font-semibold">{item.address}</h3>
            <p className="text-sm text-gray-500">
              Land Area: {item.land_area_m2} m²
            </p>
            <p className="text-sm text-gray-500">
              Suburb: {item.suburb}, District: {item.district}
            </p>
            {item.cv_date_text && item.cv_value && (
              <p className="text-sm text-gray-500">
                CV ({item.cv_date_text}): ${Number(item.cv_value).toLocaleString()}
              </p>
            )}
            <p className="mt-2 font-medium text-blue-600">
              {item.pricing_method}
            </p>
            <a
              href={item.realestate_url}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-blue-500 underline mt-2 inline-block"
            >
              View Listing
            </a>
          </div>
        </div>
      ))}
    </div>
  )}
</div>
    )}

  </div>

);
}

