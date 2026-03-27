import { useState, useRef, useEffect } from "react";

export default function MultiSelect({ options = [], onChange }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const [open, setOpen] = useState(false);

  const containerRef = useRef(null);
  const MAX_VISIBLE = 3;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!containerRef.current?.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Filter options based on search and exclude already selected
  const filtered = options.filter(
    (opt) =>
      opt &&
      opt.label &&
      opt.label.toLowerCase().includes(search.toLowerCase()) &&
      !selected.some((s) => s.value === opt.value)
  );

  // Add option to selected
  const addOption = (opt) => {
    const newSelected = [...selected, opt];
    setSelected(newSelected);
    setSearch("");
    if (onChange) onChange(newSelected); // notify parent
  };

  // Remove option from selected
  const removeOption = (opt) => {
    const newSelected = selected.filter((o) => o.value !== opt.value);
    setSelected(newSelected);
    if (onChange) onChange(newSelected); // notify parent
  };

  return (
    <div className="w-full max-w-md relative" ref={containerRef}>
      {/* Input + Selected Tags */}
      <div
        className="flex flex-wrap items-center gap-2 border rounded-lg px-3 py-2 cursor-text focus-within:ring-2 focus-within:ring-blue-500"
        onClick={() => setOpen(true)}
      >
        {selected.slice(0, MAX_VISIBLE).map((item) => (
          <span
            key={item.value}
            className="bg-blue-100 text-blue-700 text-sm px-2 py-1 rounded flex items-center gap-1"
          >
            {item.label}
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeOption(item);
              }}
              className="hover:text-red-500"
            >
              ✕
            </button>
          </span>
        ))}

        {/* +X more */}
        {selected.length > MAX_VISIBLE && (
          <span className="text-sm text-gray-500">
            +{selected.length - MAX_VISIBLE} more
          </span>
        )}

        {/* Search input */}
        <input
          className="flex-1 outline-none text-sm"
          placeholder="Select options..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setOpen(true);
          }}
        />
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow max-h-60 overflow-auto">
          {filtered.length > 0 ? (
            filtered.map((opt) => (
              <div
                key={opt.value}
                onClick={() => addOption(opt)}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
              >
                {opt.label}
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-gray-400 text-sm">
              No results found
            </div>
          )}
        </div>
      )}
    </div>
  );
}