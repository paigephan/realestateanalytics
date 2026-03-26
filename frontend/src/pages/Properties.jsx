// export default function Properties() {
//     return <h1 className="text-2xl font-bold">Properties Page</h1>;
//   }

import MultiSelect from "../components/MultiSelect";

  export default function Properties() {
    const suburbs = [
      "Auckland CBD",
      "Manukau",
      "Ponsonby",
      "Parnell",
      "Newmarket",
      "Mt Eden",
      "Takapuna",
      "Albany",
    ];
  
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold mb-4">Filters</h1>
  
        <MultiSelect options={suburbs} />
      </div>
    );
  }