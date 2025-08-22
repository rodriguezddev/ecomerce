
import { useEffect, useRef } from "react";
import { ArrowRight, Github, Mail, Briefcase } from "lucide-react";

const Hero = () => {
  const headingRef = useRef<HTMLHeadingElement>(null);
  
  useEffect(() => {
    if (headingRef.current) {
      headingRef.current.classList.add("animate-fade-in");
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center pt-16 pb-24 relative overflow-hidden">
      <div className="absolute w-full h-full bg-gradient-to-b from-purple-50 to-white opacity-70 z-0" />
      
      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-5 gap-10 items-center">
            <div className="md:col-span-3">
              <p className="text-purple-700 font-semibold mb-3 text-lg md:text-xl">
                Hola, soy un
              </p>
              <h1 
                ref={headingRef}
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight"
              >
                Desarrollador Frontend
                <span className="text-purple-700">.</span>
              </h1>
              <p className="text-gray-600 text-lg md:text-xl mb-8 leading-relaxed">
                Creo sitios web responsivos donde las tecnologías se encuentran con la creatividad para 
                crear experiencias de usuario excepcionales que generan impacto.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <a
                  href="#projects"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-purple-700 text-white font-medium rounded-md hover:bg-purple-800 transition-colors"
                >
                  Ver mi trabajo
                  <ArrowRight size={18} />
                </a>
                <a
                  href="#contact"
                  className="inline-flex items-center gap-2 px-6 py-3 border-2 border-purple-700 text-purple-700 font-medium rounded-md hover:bg-purple-50 transition-colors"
                >
                  Contáctame
                </a>
              </div>
              
              <div className="mt-10 flex items-center gap-6">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-purple-700 transition-colors"
                  aria-label="GitHub"
                >
                  <Github size={22} />
                </a>
                <a
                  href="mailto:contact@example.com"
                  className="text-gray-600 hover:text-purple-700 transition-colors"
                  aria-label="Email"
                >
                  <Mail size={22} />
                </a>
                <a
                  href="/resume.pdf"
                  className="text-gray-600 hover:text-purple-700 transition-colors flex items-center gap-2"
                >
                  <Briefcase size={22} />
                  <span className="text-sm font-medium">Currículum</span>
                </a>
              </div>
            </div>
            
            <div className="md:col-span-2 flex justify-center">
              <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full bg-gradient-to-r from-purple-200 to-purple-300 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center text-center text-purple-800 font-medium">
                  <div className="text-lg md:text-xl">
                    Imagen de Perfil
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
