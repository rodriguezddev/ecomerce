
import { useState } from "react";
import { ArrowRight, Github, Link } from "lucide-react";
import { cn } from "@/lib/utils";

interface Project {
  id: number;
  title: string;
  description: string;
  tags: string[];
  image: string;
  demo: string;
  github: string;
  featured: boolean;
}

const Projects = () => {
  const [activeFilter, setActiveFilter] = useState<string>("all");
  
  const projects: Project[] = [
    {
      id: 1,
      title: "Dashboard de E-Commerce",
      description: "Un panel de control completo para gestión de tiendas en línea con análisis, procesamiento de pedidos y gestión de inventario.",
      tags: ["React", "TypeScript", "Tailwind CSS", "Chart.js"],
      image: "https://placehold.co/600x400/e9d5ff/6E59A5?text=Dashboard+E-Commerce",
      demo: "https://example.com",
      github: "https://github.com",
      featured: true
    },
    {
      id: 2,
      title: "App de Finanzas Personales",
      description: "Una aplicación web responsiva que ayuda a los usuarios a rastrear gastos, establecer presupuestos y visualizar sus datos financieros.",
      tags: ["React", "Redux", "Node.js", "MongoDB"],
      image: "https://placehold.co/600x400/e9d5ff/6E59A5?text=App+de+Finanzas",
      demo: "https://example.com",
      github: "https://github.com",
      featured: true
    },
    {
      id: 3,
      title: "Buscador de Recetas",
      description: "Una aplicación web que permite a los usuarios buscar recetas basadas en los ingredientes que tienen y preferencias dietéticas.",
      tags: ["JavaScript", "CSS", "REST API"],
      image: "https://placehold.co/600x400/e9d5ff/6E59A5?text=Buscador+de+Recetas",
      demo: "https://example.com",
      github: "https://github.com",
      featured: false
    },
    {
      id: 4,
      title: "Plataforma de Gestión de Tareas",
      description: "Una herramienta colaborativa de gestión de tareas con actualizaciones en tiempo real, asignaciones de tareas y seguimiento de progreso.",
      tags: ["React", "Firebase", "Material UI"],
      image: "https://placehold.co/600x400/e9d5ff/6E59A5?text=Gestion+de+Tareas",
      demo: "https://example.com",
      github: "https://github.com",
      featured: true
    }
  ];
  
  const filteredProjects = activeFilter === "all" 
    ? projects 
    : activeFilter === "featured" 
      ? projects.filter(project => project.featured) 
      : projects.filter(project => project.tags.includes(activeFilter));
  
  const uniqueTags = ["all", "featured", ...Array.from(new Set(projects.flatMap(project => project.tags)))];
  
  return (
    <div className="container mx-auto px-4 md:px-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Mis Proyectos</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Una colección de mi trabajo reciente. Cada proyecto es una pieza única de desarrollo.
        </p>
      </div>
      
      <div className="flex justify-center mb-10 overflow-x-auto py-2">
        <div className="flex space-x-2">
          {uniqueTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveFilter(tag)}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-colors",
                activeFilter === tag
                  ? "bg-purple-700 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              {tag === "all" ? "Todos" : 
               tag === "featured" ? "Destacados" :
               tag.charAt(0).toUpperCase() + tag.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProjects.map((project) => (
          <div 
            key={project.id} 
            className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="h-52 overflow-hidden">
              <img
                src={project.image}
                alt={project.title}
                className="w-full h-full object-cover transition-transform hover:scale-105"
              />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
              <p className="text-gray-600 mb-4">{project.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex space-x-3">
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-purple-700 transition-colors"
                    aria-label="Repositorio GitHub"
                  >
                    <Github size={20} />
                  </a>
                  <a
                    href={project.demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-purple-700 transition-colors"
                    aria-label="Demo en vivo"
                  >
                    <Link size={20} />
                  </a>
                </div>
                
                <a
                  href={project.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-medium text-purple-700 hover:text-purple-800 transition-colors"
                >
                  Ver Proyecto
                  <ArrowRight size={16} />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600">No se encontraron proyectos con el filtro seleccionado.</p>
        </div>
      )}
      
      <div className="text-center mt-16">
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 border-2 border-purple-700 text-purple-700 font-medium rounded-md hover:bg-purple-50 transition-colors"
        >
          Ver más en GitHub
          <Github size={18} />
        </a>
      </div>
    </div>
  );
};

export default Projects;
