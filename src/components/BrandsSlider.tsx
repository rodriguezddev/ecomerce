
import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import image1 from "../assets/image1.jpg";
import image2 from "../assets/image2.jpg";
import image3 from "../assets/image3.jpg";
import image4 from "../assets/image4.png";
import image5 from "../assets/image5.jpg";

const brands = [
  {
    id: 1,
    name: "Chery Arauca",
    logo: image1,
  },
  {
    id: 2,
    name: "Chery Orinoco",
    logo: image2,
  },
  {
    id: 3,
    name: "Chery Qq6",
    logo: image3,
  },
  {
    id: 4,
    name: "Chery Tiggo",
    logo: image4,
  },
  {
    id: 5,
    name: "Chery X1",
    logo: image5,
  },

  // {
  //   id: 7,
  //   name: "AeroTech",
  //   logo: "https://via.placeholder.com/160x80/f0f0f0/666666?text=AeroTech",
  // },
  // {
  //   id: 8,
  //   name: "WestField",
  //   logo: "https://via.placeholder.com/160x80/f0f0f0/666666?text=WestField",
  // },
];

const BrandsSlider = () => {
  const [position, setPosition] = useState(0);
  const [visibleBrands, setVisibleBrands] = useState(5);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setVisibleBrands(2);
      } else if (window.innerWidth < 768) {
        setVisibleBrands(3);
      } else if (window.innerWidth < 1024) {
        setVisibleBrands(4);
      } else {
        setVisibleBrands(5);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxPosition = Math.max(0, brands.length - visibleBrands);

  const next = () => {
    if (position < maxPosition) {
      setPosition(position + 1);
    }
  };

  const prev = () => {
    if (position > 0) {
      setPosition(position - 1);
    }
  };

  return (
    <section className="mb-12">
      <h2 className="section-title">Repuestos para todos los modelos Chery</h2>

      <div className="relative">
        {position > 0 && (
          <button
            onClick={prev}
            className="absolute -left-4 top-1/2 -translate-y-1/2 bg-white shadow-md hover:bg-gray-100 text-gray-700 p-2 rounded-full z-10"
            aria-label="Previous brands"
          >
            <ChevronLeft size={20} />
          </button>
        )}

        <div
          ref={sliderRef}
          className="overflow-hidden relative"
        >
          <div
            className="flex transition-transform duration-300"
            style={{ transform: `translateX(-${position * (100 / visibleBrands)}%)` }}
          >
            {brands.map((brand) => (
              <div
                key={brand.id}
                className="flex-shrink-0 px-3"
                style={{ width: `${100 / visibleBrands}%` }}
              >
                <div className="border border-gray-200 rounded-md flex items-center justify-center h-[10rem] w-[14rem] bg-white hover:border-gray-300 transition-colors">
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="max-h-full max-w-full"
                  />
                </div>
                <p
                  className="text-center mt-2"
                >{brand.name}</p>
              </div>
            ))}
          </div>
        </div>

        {position < maxPosition && (
          <button
            onClick={next}
            className="absolute -right-4 top-1/2 -translate-y-1/2 bg-white shadow-md hover:bg-gray-100 text-gray-700 p-2 rounded-full z-10"
            aria-label="Next brands"
          >
            <ChevronRight size={20} />
          </button>
        )}
      </div>
    </section>
  );
};

export default BrandsSlider;