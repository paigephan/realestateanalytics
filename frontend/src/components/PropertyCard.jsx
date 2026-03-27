import { useState } from "react";
import axios from "axios";

function PropertyCart() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const API_URL_SEARCH = `${process.env.REACT_APP_API_BASE_URL}/api/property/search`;

  const handleSearch = async () => {
    setLoading(true);

    try {
      const response = await axios.post(API_URL_SEARCH, {
        // send your filters here
      });

      setResults(response.data);
    } catch (error) {
      console.error("Error fetching results:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">

      {/* Search Button */}
      <button
        onClick={handleSearch}
        className="mb-6 bg-blue-500 text-white px-6 py-3 rounded-lg"
      >
        Search
      </button>

      {/* Results */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="h-[600px] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {results.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow p-4"
              >
                <img
                  src={item.image_url}
                  alt="property"
                  className="w-full h-48 object-cover rounded"
                />

                <h3 className="mt-3 font-semibold">
                  {item.address}
                </h3>

                <p className="text-sm text-gray-500">
                  Land: {item.land_area_m2} m²
                </p>

                <p className="mt-2 font-medium text-blue-600">
                  $
                  {item.final_price
                    ? Number(item.final_price).toLocaleString()
                    : "N/A"}
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
            ))}

          </div>
        </div>
      )}

    </div>
  );
}

export default PropertyCart;