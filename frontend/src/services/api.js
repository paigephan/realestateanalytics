export const getProperties = async () => {
  const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/property`);
  return res.json();
};

export const getPropertyById = async (id) => {
  const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/property/${id}`);
  return res.json();
};