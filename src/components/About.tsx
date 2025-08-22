
import { Code, Globe, Settings } from "lucide-react";

const About = () => {
  const skills = [
    "HTML5", "CSS3", "JavaScript (ES6+)", "TypeScript", 
    "React.js", "Next.js", "Tailwind CSS", "Redux", 
    "Node.js", "Express", "Git", "Responsive Design"
  ];
  
  return (
    <div className="container mx-auto px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">About Me</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Passionate frontend developer with a keen eye for design and a deep understanding of modern web technologies
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-2xl font-semibold mb-4">My Journey</h3>
            <div className="space-y-4 text-gray-600">
              <p>
                With over 5 years of experience, I've worked on a diverse range of web applications 
                from e-commerce platforms to data-intensive dashboards. I specialize in creating 
                responsive, accessible, and performant web experiences.
              </p>
              <p>
                I'm passionate about clean code, user-centric design, and staying up-to-date with 
                the latest frontend technologies and best practices.
              </p>
              <p>
                When I'm not coding, you'll find me exploring new technologies, contributing to 
                open-source projects, or sharing knowledge with the developer community.
              </p>
            </div>
          </div>
          
          <div>
            <h3 className="text-2xl font-semibold mb-6">My Expertise</h3>
            <div className="grid grid-cols-1 gap-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700">
                  <Code size={24} />
                </div>
                <div>
                  <h4 className="text-lg font-medium mb-2">Frontend Development</h4>
                  <p className="text-gray-600">
                    Building responsive, accessible, and performant web applications with modern JavaScript frameworks.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700">
                  <Globe size={24} />
                </div>
                <div>
                  <h4 className="text-lg font-medium mb-2">UI/UX Development</h4>
                  <p className="text-gray-600">
                    Translating designs into pixel-perfect interfaces with attention to user experience and accessibility.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700">
                  <Settings size={24} />
                </div>
                <div>
                  <h4 className="text-lg font-medium mb-2">Performance Optimization</h4>
                  <p className="text-gray-600">
                    Optimizing web applications for speed, SEO, and modern web standards.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-16">
          <h3 className="text-2xl font-semibold mb-6 text-center">Skills & Technologies</h3>
          <div className="flex flex-wrap gap-3 justify-center">
            {skills.map((skill) => (
              <span
                key={skill}
                className="px-4 py-2 bg-purple-50 text-purple-700 rounded-full text-sm font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
