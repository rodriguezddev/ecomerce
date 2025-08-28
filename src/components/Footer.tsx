
import { Link } from "react-router-dom";
import logo from "@/assets/M&C7_logo_blanco.png";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube, 
  CreditCard,
  MessageCircleQuestion
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 md:text-start text-center">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 ">
          {/* Contact Info */}
          <div className="flex flex-col w-full align-center">
            <h5 className="text-white font-bold text-lg mb-4">Contáctenos</h5>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin size={18} className="text-primary mr-3 mt-1 flex-shrink-0" />
                <span>Av Bolívar de Naguanagua, frente a Residencias Bella Vista, Naguanagua, Carabobo, Venezuela.</span>
              </li>
              <li className="flex items-center">
                <Phone size={18} className="text-primary mr-3 flex-shrink-0" />
                <span>(0424) 571 50 37  </span>
              </li>
              <li className="flex items-center">
                <Clock size={18} className="text-primary mr-3 flex-shrink-0" />
                <span>De Lunes a Viernes, 8:30 am a 6:00 pm. Sábados de 8:30 am a 12: 00 m</span>
              </li>
            </ul>
           
          </div>


 {/* Information */}
          <div className="md:ml-6 md:pl-6 w-full flex flex-col">
            <h5 className="text-white font-bold text-lg mb-4">Información</h5>
            <ul className="space-y-2">
              <li><Link to="/about" className="hover:text-primary transition-colors">Sobre nosotros</Link></li>
              <li><Link to="/sitemap" className="hover:text-primary transition-colors">Mapa del sitio</Link></li>
            </ul>
          </div>

            <div >
            <h5 className="text-white font-bold text-lg mb-4">Mi cuenta</h5>
            <ul className="space-y-2">
              <li><Link to="/account" className="hover:text-primary transition-colors">Mi cuenta</Link></li>
              <li><Link to="/order-history" className="hover:text-primary transition-colors">Historial de pedidos</Link></li>
            </ul>
          </div>
          



        
          
          
          
          {/* My Account */}
          
        </div>
          <div className="flex space-x-3 mt-4 justify-center">
              <a href="https://www.instagram.com/repuestosmc7?igsh=cXBkazJndDJndTcz" _target="_blank" className="bg-gray-800 hover:bg-primary text-white p-2 rounded-full transition-colors">
                <Facebook size={18} />
              </a>
              <a href="https://api.whatsapp.com/send/?phone=584245715037&text&type=phone_number&app_absent=0" _target="_blank" className="bg-gray-800 hover:bg-primary text-white p-2 rounded-full transition-colors">
                <MessageCircleQuestion size={18} />
              </a>
            </div>
      </div>
      
      {/* Bottom Footer */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm">© 2025 M&C7, C. A. Todos los derechos reservados</p>
            <div className="mt-3 md:mt-0">
              <img 
                src={logo}
                alt="Payment Methods"
                className="h-6"
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
