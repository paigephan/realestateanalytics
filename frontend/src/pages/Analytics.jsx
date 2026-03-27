import {Chart} from "../components/Chart";

const results = [
  {
    address: "12 Queen St",
    suburb: "Auckland Central",
    district: "Auckland",
    final_price: 950000,
    land_area_m2: 120,
    date: "2024-01-15"
  },
  {
    address: "45 King St",
    suburb: "Auckland Central",
    district: "Auckland",
    final_price: 870000,
    land_area_m2: 100,
    date: "2024-02-10"
  },
  {
    address: "78 Lake Rd",
    suburb: "Takapuna",
    district: "North Shore",
    final_price: 1200000,
    land_area_m2: 300,
    date: "2024-01-20"
  },
  {
    address: "9 Beach Ave",
    suburb: "Takapuna",
    district: "North Shore",
    final_price: 1350000,
    land_area_m2: 350,
    date: "2024-03-05"
  },
  {
    address: "33 Great South Rd",
    suburb: "Manukau",
    district: "Manukau",
    final_price: 780000,
    land_area_m2: 400,
    date: "2024-01-25"
  },
  {
    address: "21 Chapel Rd",
    suburb: "Manukau",
    district: "Manukau",
    final_price: 820000,
    land_area_m2: 420,
    date: "2024-02-18"
  },
  {
    address: "5 Lincoln Rd",
    suburb: "Henderson",
    district: "Waitakere",
    final_price: 700000,
    land_area_m2: 500,
    date: "2024-01-30"
  },
  {
    address: "66 WestCity Rd",
    suburb: "Henderson",
    district: "Waitakere",
    final_price: 730000,
    land_area_m2: 480,
    date: "2024-03-12"
  }
];

export default function Analytics() {
  const chartData = results.map(item => ({
    suburb: item.suburb,
    price: item.final_price
  }));

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">
        Analytics Page
      </h1>

      <Chart data={chartData} />
    </div>
  );
}