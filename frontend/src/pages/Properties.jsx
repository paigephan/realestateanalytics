import { useEffect, useState } from "react";
import MultiSelect from "../components/MultiSelect";
import axios from "axios";

const API_URL_SUBURBS = `${import.meta.env.VITE_API_BASE_URL}/api/property/suburbs`;
const API_URL_DISTRICTS = `${import.meta.env.VITE_API_BASE_URL}/api/property/districts`;
const API_URL_SEARCH = `${import.meta.env.VITE_API_BASE_URL}/api/property/search`;
const API_URL_LATESTSALES = `${import.meta.env.VITE_API_BASE_URL}/api/property/latesthousesales`;

export default function Properties() {

  // Add this state at the top with your other states
  const [showFilters, setShowFilters] = useState(false);

  // Sorting
  const [sortField, setSortField] = useState(null); // 'suburb', 'district', 'price', 'landArea'
  const [sortOrder, setSortOrder] = useState("asc"); // 'asc' or 'desc'

  // Data
  const [results, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
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

  const [note, setNote] = useState("");

  // --- Helper: check if filters are empty ---
  const isFilterEmpty = () =>
  selectedDistricts.length === 0 &&
  selectedSuburbs.length === 0 &&
  !minPrice &&
  !maxPrice &&
  !minLandArea &&
  !maxLandArea;

  // --- Fetch search results (latest sales fallback included) ---
  const fetchResults = async (url, method = "get", data = null) => {
    setLoading(true);
    try {
      const res = await axios({
        url,
        method,
        data,
      });
      // console.log("Response:", res.data);
      setSearchResults(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) {
      console.error("fetchResults error:", err);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };
  // --- Handle search button click ---
  const handleSearch = async () => {
    const formData = {
      districts: selectedDistricts.map(d => d.value),
      suburbs: selectedSuburbs.map(s => s.value),
      min_price: minPrice || null,
      max_price: maxPrice || null,
      min_area: minLandArea || null,
      max_area: maxLandArea || null,
    };
    if (isFilterEmpty()) {
      fetchResults(API_URL_LATESTSALES);
      setNote("Let’s begin your filtering journey to get more results.");
    } else {
      fetchResults(API_URL_SEARCH, "post", formData);
      setNote("");
    }
  };

  // Fetch latest sales on page load or route change
  useEffect(() => {
    fetchResults(API_URL_LATESTSALES);
    setNote("Let’s begin your filtering journey to get more results.");
  }, []);

  // Fetch districts and suburbs
  const fetchList = async (url, setData, setLoading) => {
    setLoading(true);
    try {
      const response = await axios.get(url);
      const formatted = response.data.map(d => ({ value: d, label: d }));
      setData(formatted);
    } catch (err) {
      console.error("Fetch list error:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Call API on mount for fetchList
  useEffect(() => {
    fetchList(API_URL_SUBURBS, setSuburbs, setLoadingSuburbs);
    fetchList(API_URL_DISTRICTS, setDistricts, setLoadingDistricts);
  }, []);

  // sorting
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

  return (
    <div className="min-h-screen md:h-screen md:overflow-hidden flex flex-col">
  
      {/* Search Navbar */}
      <div className="bg-white shadow-md rounded-lg">
  
        {/* Top Bar - always visible */}
        <div className="flex md:hidden items-center justify-between px-6 py-3">
          <span className="font-semibold text-gray-700">
            {showFilters ? "Filter Properties" : `${results.length} listings found`}
          </span>
          <button
            onClick={() => setShowFilters(prev => !prev)}
            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition text-sm"
          >
            {showFilters ? (
              <>
                <span>✕</span> Close
              </>
            ) : (
              <>
                <span>⚙</span> Filter
              </>
            )}
          </button>
        </div>
  
        {/* Filter fields - always visible on desktop, toggleable on mobile */}
        <div className={`${showFilters ? 'block' : 'hidden'} md:block`}>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-end px-6 py-6 border-t md:border-t-0">
  
            {/* Districts */}
            <div className="flex flex-col">
              <label className="mb-2 text-sm font-semibold text-gray-700">Districts</label>
              {loadingDistricts ? (
                <p className="text-gray-400 text-sm">Loading...</p>
              ) : (
                <MultiSelect
                  options={districts}
                  value={selectedDistricts}
                  onChange={(selected) => setSelectedDistricts(selected)}
                  isMulti
                  className="shadow-sm"
                />
              )}
            </div>
  
            {/* Suburbs */}
            <div className="flex flex-col">
              <label className="mb-2 text-sm font-semibold text-gray-700">Suburbs</label>
              {loadingSuburbs ? (
                <p className="text-gray-400 text-sm">Loading...</p>
              ) : (
                <MultiSelect
                  options={suburbs}
                  value={selectedSuburbs}
                  onChange={(selected) => setSelectedSuburbs(selected)}
                  isMulti
                  className="shadow-sm"
                />
              )}
            </div>
  
            {/* Price Range */}
            <div className="flex flex-col">
              <label className="mb-2 text-sm font-semibold text-gray-700">Price Range ($)</label>
              <div className="flex gap-2">
                <input type="number" placeholder="Min" value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-1/2 p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none" />
                <input type="number" placeholder="Max" value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-1/2 p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none" />
              </div>
            </div>
  
            {/* Land Area */}
            <div className="flex flex-col">
              <label className="mb-2 text-sm font-semibold text-gray-700">Land Area (m²)</label>
              <div className="flex gap-2">
                <input type="number" placeholder="Min" value={minLandArea}
                  onChange={(e) => setMinLandArea(e.target.value)}
                  className="w-1/2 p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none" />
                <input type="number" placeholder="Max" value={maxLandArea}
                  onChange={(e) => setMaxLandArea(e.target.value)}
                  className="w-1/2 p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none" />
              </div>
            </div>
  
            {/* Search Button */}
            <div className="flex flex-col">
              <button
                className="mt-2 md:mt-0 w-full bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-shadow shadow hover:shadow-lg"
                onClick={() => {
                  handleSearch();
                  setShowFilters(false); // only matters on mobile
                }}
              >
                Search
              </button>
            </div>
  
          </div>
      </div>
      </div>
  
      {/* Sort Section */}
      <div>
        <div className="flex gap-2 mb-4 flex-wrap mt-6 pl-6">
          <button className="px-3 py-1 border rounded hover:bg-gray-100"
            onClick={() => { setSortField("district"); setSortOrder(sortOrder === "asc" ? "desc" : "asc"); }}>
            District {sortField === "district" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
          </button>
          <button className="px-3 py-1 border rounded hover:bg-gray-100"
            onClick={() => { setSortField("suburb"); setSortOrder(sortOrder === "asc" ? "desc" : "asc"); }}>
            Suburb {sortField === "suburb" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
          </button>
          <button className="px-3 py-1 border rounded hover:bg-gray-100"
            onClick={() => { setSortField("price"); setSortOrder(sortOrder === "asc" ? "desc" : "asc"); }}>
            Price {sortField === "price" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
          </button>
          <button className="px-3 py-1 border rounded hover:bg-gray-100"
            onClick={() => { setSortField("landArea"); setSortOrder(sortOrder === "asc" ? "desc" : "asc"); }}>
            Land Area {sortField === "landArea" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
          </button>
          <button className="px-3 py-1 border rounded text-blue-600 hover:bg-blue-200 ml-2"
            onClick={() => { setSortField(null); setSortOrder("asc"); }}>
            Clear Sort
          </button>
        </div>
  
        {loading ? (
          <p className="text-gray-500 pl-7">Loading...</p>
        ) : sortedResults.length === 0 ? (
          <p className="text-gray-500 pl-7">Total of {results.length} listings. Please recheck your filterings.</p>
        ) : (
          <p className="text-gray-500 pl-7">Total of {results.length} listings. {note}</p>
        )}
      </div>
  
      {/* Results Section */}
      <div className="flex-1 overflow-y-auto mt-6 px-6">
        <div className={`grid ${!sortField ? 'grid-cols-1 md:grid-cols-2 gap-6' : 'grid-cols-1 gap-2'}`}>
          {sortedResults.map((item, index) => (
            <div key={index}
              className={`bg-white rounded-lg shadow p-2 ${sortField ? 'flex flex-row items-start gap-4' : ''}`}>
              <img src={item.image_url} alt="property"
                className={`${sortField ? 'w-24 h-24 md:w-48 md:h-32 object-cover rounded shrink-0' : 'w-full h-48 object-cover rounded'}`} />
              <div className={`${sortField ? 'flex-1 min-w-0' : 'mt-3'}`}>
                <h3 className="font-semibold truncate">{item.address}</h3>
                <p className="text-sm text-gray-500">Land Area: {item.land_area_m2} m²</p>
                <p className="text-sm text-gray-500">Suburb: {item.suburb}, District: {item.district}</p>
                {item.cv_date_text && item.cv_value && (
                  <p className="text-sm text-gray-500">CV ({item.cv_date_text}): ${Number(item.cv_value).toLocaleString()}</p>
                )}
                <p className="mt-2 font-medium text-blue-600">{item.pricing_method}</p>
                <a href={item.realestate_url} target="_blank" rel="noreferrer"
                  className="text-sm text-blue-500 underline mt-2 inline-block">
                  View Listing
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
  
    </div>
  );
}

