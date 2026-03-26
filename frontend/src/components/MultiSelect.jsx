import { useState, useRef, useEffect } from "react";

export default function MultiSelect({ options = [] }) {
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

  const filtered = options.filter(
    (opt) =>
      opt.toLowerCase().includes(search.toLowerCase()) &&
      !selected.includes(opt)
  );

  const addOption = (opt) => {
    setSelected((prev) => [...prev, opt]);
    setSearch("");
  };

  const removeOption = (opt) => {
    setSelected((prev) => prev.filter((o) => o !== opt));
  };

  return (
    <div className="w-full max-w-md relative" ref={containerRef}>
      {/* Input + Tags */}
      <div
        className="flex flex-wrap items-center gap-2 border rounded-lg px-3 py-2 cursor-text focus-within:ring-2 focus-within:ring-blue-500"
        onClick={() => setOpen(true)}
      >
        {selected.slice(0, MAX_VISIBLE).map((item) => (
          <span
            key={item}
            className="bg-blue-100 text-blue-700 text-sm px-2 py-1 rounded flex items-center gap-1"
          >
            {item}
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
                key={opt}
                onClick={() => addOption(opt)}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
              >
                {opt}
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