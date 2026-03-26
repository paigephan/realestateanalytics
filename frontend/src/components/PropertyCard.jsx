export default function PropertyCard({ property }) {
    return (
      <div style={{ border: "1px solid #ccc", padding: "1rem", margin: "1rem", borderRadius: "8px" }}>
        <img src={property.image_url} alt={property.address} style={{ width: "100%", height: "200px", objectFit: "cover" }} />
        <h3>{property.address}</h3>
        <p>Price: {property.price}</p>
        <p>Land Area: {property.land_area_m2} m²</p>
      </div>
    );
  }