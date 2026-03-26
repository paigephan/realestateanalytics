const BASE_URL = "http://localhost:3000/api";

export const getProperties = async () => {
  const res = await fetch(`${BASE_URL}/property`);
  return res.json();
};

export const getPropertyById = async (id) => {
  const res = await fetch(`${BASE_URL}/property/${id}`);
  return res.json();
};