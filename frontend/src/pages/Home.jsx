import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  const [images, setImages] = useState([]);          
  const [currentIndex, setCurrentIndex] = useState(0);
  const API_URL_IMAGE = `${process.env.REACT_APP_API_BASE_URL}/api/property/randomimages`;

  // Fetch images from API on mount
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch(API_URL_IMAGE);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        setImages(data);
      } catch (err) {
        console.error("Failed to fetch images:", err);
      }
    };
  
    fetchImages();
  }, [API_URL_IMAGE]); // add API_URL here

  // Auto slide every 3 seconds
  useEffect(() => {
    if (images.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [images]);

  if (images.length === 0) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="grid grid-cols-2 h-screen">
      
      {/* Text side */}
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
    <div className="max-w-2xl mx-auto">
    
    <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-5">
      Find Your Dream Home
    </h1>

    <h2 className="text-4xl md:text-4xl font-bold leading-tight mb-20">
      With Data-Driven Insights into the NZ Property Market
    </h2>

    <div className="gap-4 justify-center mb-20">
    <p className="text-gray-600 text-lg leading-relaxed">
      We provide sophisticated investors with analytics to navigate market volatility. 
      Our data-driven approach ensures every budget is optimized for long-term growth.
    </p>
    </div>

    {/* ✅ Buttons */}
    <div className="flex gap-4 justify-center">
      {/* Primary button */}
      <button className="border border-gray-300 bg-gray-100 px-6 py-3 rounded-lg font-medium hover:bg-black hover:text-white transition">
       Calculate Home Buy Ability 
      </button>

      {/* Secondary button */}
      <button 
        onClick={() => navigate("/properties")}
        className="border border-gray-300 bg-gray-100 px-6 py-3 rounded-lg font-medium hover:bg-black hover:text-white transition">
        Get Home Recommendations
      </button>
    </div>


    </div>
    </div>

      {/* Slideshow side */}
      <div className="h-full relative">
        {images.map((url, index) => (
          <img
            key={index}
            src={url} // just use the URL
            alt={`Property ${index + 1}`}
            className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ${
              index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}

        {/* Dots indicator */}
        <div className="absolute bottom-4 w-full flex justify-center gap-2">
          {images.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-2 rounded-full ${
                index === currentIndex ? "bg-white" : "bg-gray-400"
              }`}
            />
          ))}
        </div>
      </div>

    </div>
  );
}

export default Home;