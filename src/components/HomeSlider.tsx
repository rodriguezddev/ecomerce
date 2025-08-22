
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import slider1 from "../assets/slider1.jpg";
import slider2 from "../assets/slider2.jpg";
import slider3 from "../assets/slider3.jpg";


const slides = [
  {
    id: 1,
    image: slider1,
     title: "30% de descuento en autopartes",
    subtitle: "Para todas las partes del motor",
    description: "Descuentos especiales para todas las partes del motor en nuestra tienda",
    buttonText: "Comprar ahora",
    buttonLink: "/shop",
  },
  {
    id: 2,
    image: slider2,
    title: "Nueva colección",
    subtitle: "Partes de alta calidad",
    description: "Últimas novedades con calidad premium",
    buttonText: "Descubrir",
    buttonLink: "/new-arrivals",
  },
  {
    id: 3,
    image: slider3,
    title: "Herramientas eléctricas",
    subtitle: "Equipo profesional",
    description: "Las mejores marcas para mecánicos profesionales",
    buttonText: "Ver catálogo",
    buttonLink: "/power-tools",
  },
];

const HomeSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  // Auto-advance slides
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative overflow-hidden h-[100px] md:h-[300px] lg:h-[400px]">
      <div 
        className="flex transition-transform duration-500 ease-out h-full"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide) => (
          <div 
            key={slide.id} 
            className="min-w-full h-full relative"
            style={{
              backgroundImage: `url(${slide.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {/* <div className="absolute inset-0 bg-black bg-opacity-40"></div> */}
            {/* <div className="container mx-auto px-4 h-full flex items-center relative z-10">
              <div className="max-w-xl text-white">
                <h3 className="text-xl md:text-2xl font-semibold text-primary-foreground mb-2">{slide.subtitle}</h3>
                <h2 className="text-3xl md:text-5xl font-bold mb-4">{slide.title}</h2>
                <p className="text-lg md:text-xl mb-6">{slide.description}</p>
                <Link 
                  to={slide.buttonLink}
                  className="inline-block bg-primary text-white px-6 py-3 rounded font-medium hover:bg-primary/90 transition-colors"
                >
                  {slide.buttonText}
                </Link>
              </div>
            </div> */}
          </div>
        ))}
      </div>
      
      {/* Navigation Buttons */}
      <button 
        onClick={prevSlide} 
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors"
        aria-label="Diapositiva anterior"
      >
        <ChevronLeft size={24} />
      </button>
      <button 
        onClick={nextSlide} 
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors"
        aria-label="Siguiente diapositiva"
      >
        <ChevronRight size={24} />
      </button>
      
      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentSlide ? "bg-primary" : "bg-white/50"
            }`}
            aria-label={`Ir a diapositiva ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HomeSlider;
