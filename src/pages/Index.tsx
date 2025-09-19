
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HomeSlider from "@/components/HomeSlider";
import FeaturedCategories from "@/components/FeaturedCategories";
import FeaturedProducts from "@/components/FeaturedProducts";
import SpecialOffers from "@/components/SpecialOffers";
import BrandsSlider from "@/components/BrandsSlider";
import Services from "@/components/Services";
import { useAuth } from "@/context/AuthContext";
import { LayoutDashboard, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { user } = useAuth();
  
  // Check if user is admin or seller
  const isAdmin = user?.rol === "Administrador";
  const isSeller = user?.rol === "Vendedor";
  const canAccessDashboard = isAdmin || isSeller;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        <HomeSlider />
        <div style={{ marginTop: '-2rem', position: 'relative' }} className="flex justify-between">
          <div style={{ width: '20%', height: '3rem', background: '#fff', 'clipPath': 'polygon(0 0, 94% 0, 100% 100%, 0% 100%)', }}></div>
          <div style={{ width: '20%', height: '3rem', background: '#fff', clipPath: 'polygon(6% 0, 100% 0, 100% 100%, 0% 100%)' }}></div>
        </div>
        
        <div className="container mx-auto px-4 py-8">
          <Services />
          <FeaturedCategories />
          <FeaturedProducts />
          <SpecialOffers />
          <BrandsSlider />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
