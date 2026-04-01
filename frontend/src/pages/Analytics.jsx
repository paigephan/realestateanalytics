import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { Chart } from "chart.js/auto";
import axios from "axios";
import "leaflet/dist/leaflet.css";

const API_URL_ANALYTICS = `${process.env.REACT_APP_API_BASE_URL}/api/property/salescount`;
const GEOJSON_URL = "/data/statistical-area-2025.geojson";
const SUBURB_NAME_KEY = "SA22025__1";

const COLOR_THRESHOLDS = [
  { min: 20, color: "#1e3a8a" },
  { min: 15,  color: "#1d4ed8" },
  { min: 10,  color: "#3b82f6" },
  { min: 5,  color: "#93c5fd" },
  { min: 0,  color: "#dbeafe" },
];
const COLOR_DEFAULT = "#f3f4f6";

const LEGEND_ITEMS = [
  { color: "#1e3a8a", label: "20+" },
  { color: "#1d4ed8", label: "15-20" },
  { color: "#3b82f6", label: "10-15" },
  { color: "#93c5fd", label: "5-10" },
  { color: "#dbeafe", label: "1–5" },
  { color: "#f3f4f6", label: "No data" },
];

// --- Helpers ---
const getColor = (count) => {
  const threshold = COLOR_THRESHOLDS.find(({ min }) => count > min);
  return threshold ? threshold.color : COLOR_DEFAULT;
};

const getSalesCount = (analyticsData, suburbName) => {
  if (!suburbName) return 0;
  const match = analyticsData.find(
    (d) => d.suburb?.toLowerCase() === suburbName.toLowerCase()
  );
  return match ? Number(match.sales_count) : 0;
};

// --- Choropleth Layer ---
function ChoroplethLayer({ geoJson, analyticsData }) {
  const map = useMap();

  useEffect(() => {
    if (!geoJson || !analyticsData?.length) return;

    const layer = L.geoJSON(geoJson, {
      style: (feature) => {
        const count = getSalesCount(analyticsData, feature.properties[SUBURB_NAME_KEY]);
        return {
          fillColor: getColor(count),
          fillOpacity: 0.6,
          weight: 1,
          color: "#666",
        };
      },
      onEachFeature: (feature, layer) => {
        const name = feature.properties[SUBURB_NAME_KEY];
        const count = getSalesCount(analyticsData, name);
      
        layer.bindTooltip(
          `<div style="font-size:13px">
            <strong>${name}</strong><br/>
            Sales: <span style="color:#1d4ed8">${count}</span>
          </div>`,
          { 
            sticky: true,
            opacity: 1,
            className: "custom-tooltip"
          }
        );
      },
    }).addTo(map);

    layer.bringToFront();

    return () => map.removeLayer(layer);
  }, [geoJson, analyticsData, map]);

  return null;
}

// --- Chart Configs ---
const buildDistrictChartConfig = (labels, values) => ({
  type: "bar",
  data: {
    labels,
    datasets: [{
      label: "Sales Count",
      data: values,
      backgroundColor: "rgba(59, 130, 246, 0.7)",
      borderRadius: 4,
    }],
  },
  options: {
    responsive: true,
    aspectRatio: 1.25,  // ← lower number = taller chart (default is 2)
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "House Sales Volume by District",
        font: { size: 14, weight: "bold" },
      },
    },
    scales: {
      y: { beginAtZero: true },
      x: { ticks: { maxRotation: 30, font: { size: 11 } } },
    },
  },
});

const buildSuburbChartConfig = (top20) => ({
  type: "bar",
  data: {
    labels: top20.map((d) => d.suburb),
    datasets: [{
      label: "Sales Count",
      data: top20.map((d) => Number(d.sales_count)),
      backgroundColor: "rgba(16, 185, 129, 0.7)",
      borderRadius: 4,
    }],
  },
  options: {
    indexAxis: "y",
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "Top 20 Suburbs by House Sales Volume",
        font: { size: 14, weight: "bold" },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const item = top20[context.dataIndex];
            return ` ${context.parsed.x} sales — ${item.district}`;
          },
        },
      },
    },
    scales: {
      x: { beginAtZero: true },
      y: { ticks: { font: { size: 11 } } },
    },
  },
});

// --- Main Component ---
export default function Analytics() {
  const [analyticsData, setAnalyticsData] = useState([]);
  const [geoJson, setGeoJson] = useState(null);
  const [loading, setLoading] = useState(true);

  const districtChartRef = useRef(null);
  const suburbChartRef = useRef(null);
  const districtChartInstance = useRef(null);
  const suburbChartInstance = useRef(null);

  // Fetch analytics data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(API_URL_ANALYTICS);
        setAnalyticsData(res.data.data ?? []);
      } catch (err) {
        console.error("Analytics fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Fetch GeoJSON
  useEffect(() => {
    const fetchGeo = async () => {
      try {
        const res = await axios.get(GEOJSON_URL);
        setGeoJson(res.data);
      } catch (err) {
        console.error("GeoJSON fetch error:", err);
      }
    };
    fetchGeo();
  }, []);

  // Build district chart
  useEffect(() => {
    if (!analyticsData?.length) return;

    const districtMap = {};
    analyticsData.forEach(({ district, sales_count }) => {
      if (district) districtMap[district] = (districtMap[district] || 0) + Number(sales_count);
    });

    const sorted = Object.entries(districtMap).sort((a, b) => b[1] - a[1]);
    const labels = sorted.map(([d]) => d);
    const values = sorted.map(([, v]) => v);

    districtChartInstance.current?.destroy();
    districtChartInstance.current = new Chart(districtChartRef.current, buildDistrictChartConfig(labels, values));
  }, [analyticsData]);

  // Build suburb chart
  useEffect(() => {
    if (!analyticsData?.length) return;

    const top20 = [...analyticsData]
      .filter((d) => d.suburb)
      .sort((a, b) => Number(b.sales_count) - Number(a.sales_count))
      .slice(0, 20);

    suburbChartInstance.current?.destroy();
    suburbChartInstance.current = new Chart(suburbChartRef.current, buildSuburbChartConfig(top20));
  }, [analyticsData]);

  if (loading) return <p className="p-6">Loading analytics...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Sales Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

        {/* District Bar Chart */}
        <div className="bg-white rounded-lg shadow p-4">
          <canvas ref={districtChartRef} />
        </div>

        {/* Choropleth Map */}
        <div className="bg-white rounded-lg shadow p-4">
          <MapContainer
            center={[-36.8485, 174.7633]}
            zoom={10}
            style={{ height: "400px", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              // attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              attribution="&copy; OpenStreetMap contributors"
              zIndex={1}
            />
            <ChoroplethLayer geoJson={geoJson} analyticsData={analyticsData} />
          </MapContainer>

          {/* Legend */}
          <div className="flex gap-4 mt-3 text-sm flex-wrap">
            {LEGEND_ITEMS.map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: color }} />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Top 20 Suburbs Chart */}
      <div className="bg-white rounded-lg shadow p-4">
        <canvas ref={suburbChartRef} />
      </div>

    </div>
  );
}