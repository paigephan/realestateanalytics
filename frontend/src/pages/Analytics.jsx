import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import { Chart } from "chart.js/auto";
import axios from "axios";
import "leaflet/dist/leaflet.css";

const API_URL_ANALYTICS = `${process.env.REACT_APP_API_BASE_URL}/api/property/salescount`;

export default function Analytics() {
  const [analyticsData, setAnalyticsData] = useState([]);
  const [geoJson, setGeoJson] = useState(null);
  const [loading, setLoading] = useState(true);

  const districtChartRef = useRef(null);
  const suburbChartRef = useRef(null);
  const districtChartInstance = useRef(null);
  const suburbChartInstance = useRef(null);

  // --- Fetch analytics data ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(API_URL_ANALYTICS);
        setAnalyticsData(res.data.data);
      } catch (err) {
        console.error("Analytics fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- Fetch GeoJSON boundaries ---
  useEffect(() => {
    const fetchGeo = async () => {
      try {
        const res = await axios.get("data/nz-suburbs.geojson");
        setGeoJson(res.data);
      } catch (err) {
        console.error("GeoJSON fetch error:", err);
      }
    };
    fetchGeo();
  }, []);

  // --- Build district bar chart ---
  useEffect(() => {
    if (!analyticsData || analyticsData.length === 0) return;

    // Aggregate by district
    const districtMap = {};
    analyticsData.forEach(({ district, sales_count }) => {
      districtMap[district] = (districtMap[district] || 0) + Number(sales_count);
    });

    const sorted = Object.entries(districtMap).sort((a, b) => b[1] - a[1]);
    const labels = sorted.map(([d]) => d);
    const values = sorted.map(([, v]) => v);

    if (districtChartInstance.current) districtChartInstance.current.destroy();

    districtChartInstance.current = new Chart(districtChartRef.current, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Sales Count",
            data: values,
            backgroundColor: "rgba(59, 130, 246, 0.7)",
            borderRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: "Sales Volume by District",
            font: { size: 14, weight: "bold" },
          },
        },
        scales: {
          y: { beginAtZero: true },
          x: {
            ticks: {
              maxRotation: 30,
              font: { size: 11 },
            },
          },
        },
      },
    });
  }, [analyticsData]);

  // --- Build top 20 suburbs horizontal bar chart ---
  useEffect(() => {
    if (!analyticsData || analyticsData.length === 0) return;

    const top20 = [...analyticsData]
      .sort((a, b) => Number(b.sales_count) - Number(a.sales_count))
      .slice(0, 20);

    if (suburbChartInstance.current) suburbChartInstance.current.destroy();

    suburbChartInstance.current = new Chart(suburbChartRef.current, {
      type: "bar",
      data: {
        labels: top20.map((d) => d.suburb),
        datasets: [
          {
            label: "Sales Count",
            data: top20.map((d) => Number(d.sales_count)),
            backgroundColor: "rgba(16, 185, 129, 0.7)",
            borderRadius: 4,
          },
        ],
      },
      options: {
        indexAxis: "y", // horizontal bar
        responsive: true,
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: "Top 20 Suburbs by Sales Volume",
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
  }, [analyticsData]);

  // --- Choropleth helpers ---
  const getSalesCount = (suburbName) => {
    const match = analyticsData.find(
      (d) => d.suburb.toLowerCase() === suburbName?.toLowerCase()
    );
    return match ? Number(match.sales_count) : 0;
  };

  const getColor = (count) => {
    return count > 50 ? "#1e3a8a"
         : count > 30 ? "#1d4ed8"
         : count > 20 ? "#3b82f6"
         : count > 10 ? "#93c5fd"
         : count > 0  ? "#dbeafe"
                      : "#f3f4f6";
  };

  const styleFeature = (feature) => ({
    fillColor: getColor(getSalesCount(feature.properties.name)), // adjust property key to match your geojson
    weight: 1,
    color: "white",
    fillOpacity: 0.7,
  });

  const onEachFeature = (feature, layer) => {
    const count = getSalesCount(feature.properties.name);
    layer.bindTooltip(
      `<strong>${feature.properties.name}</strong><br/>Sales: ${count}`,
      { sticky: true }
    );
  };

  const legendItems = [
    { color: "#1e3a8a", label: "50+" },
    { color: "#1d4ed8", label: "30–50" },
    { color: "#3b82f6", label: "20–30" },
    { color: "#93c5fd", label: "10–20" },
    { color: "#dbeafe", label: "1–10" },
    { color: "#f3f4f6", label: "No data" },
  ];

  if (loading) return <p className="p-6">Loading analytics...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Sales Analytics</h1>

      {/* Row 1 - District Chart + Choropleth Map */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

        {/* Left - District Bar Chart */}
        <div className="bg-white rounded-lg shadow p-4">
          <canvas ref={districtChartRef} />
        </div>

        {/* Right - Choropleth Map */}
        <div className="bg-white rounded-lg shadow p-4">
          <MapContainer
            center={[-36.8485, 174.7633]}
            zoom={10}
            style={{ height: "400px", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            {geoJson && (
              <GeoJSON
                data={geoJson}
                style={styleFeature}
                onEachFeature={onEachFeature}
              />
            )}
          </MapContainer>

          {/* Legend */}
          <div className="flex gap-4 mt-3 text-sm flex-wrap">
            {legendItems.map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1">
                <div className="w-4 h-4 rounded" style={{ backgroundColor: color }} />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Row 2 - Top 20 Suburbs Horizontal Bar Chart */}
      <div className="bg-white rounded-lg shadow p-4">
        <canvas ref={suburbChartRef} />
      </div>

    </div>
  );
}