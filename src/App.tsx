import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CartProvider } from "./context/CartContext";
import { Toaster } from "./components/ui/toaster";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import Dashboard from "./components/dashboard/Dashboard";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ProductDetails from "./pages/ProductDetails";
import CategoryProducts from "./pages/CategoryProducts";
import AllProducts from "./pages/AllProducts";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Contact from "./pages/Contact";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import Profile from "./pages/Profile";
import { Loader2 } from "lucide-react";

// Import dashboard components
import UserList from "./components/dashboard/users/UserList";
import UserForm from "./components/dashboard/users/UserForm";
import CategoryList from "./components/dashboard/categories/CategoryList";
import CategoryForm from "./components/dashboard/categories/CategoryForm";
import ProductList from "./components/dashboard/products/ProductList";
import ProductForm from "./components/dashboard/products/ProductForm";
import OrderList from "./components/dashboard/orders/OrderList";
import OrderForm from "./components/dashboard/orders/OrderForm";
import ShipmentList from "./components/dashboard/shipments/ShipmentList";
import ShipmentForm from "./components/dashboard/shipments/ShipmentForm";
import InvoiceList from "./components/dashboard/invoices/InvoiceList";
import InvoiceForm from "./components/dashboard/invoices/InvoiceForm";
import PaymentList from "./components/dashboard/payments/PaymentList";
import PaymentForm from "./components/dashboard/payments/PaymentForm";
import ReportsPanel from "./components/dashboard/reports/ReportsPanel";
import ShippingCompanies from "./components/dashboard/dashboard/ShippingCompanies";
import AboutPage from "./pages/AboutPage";
import SitemapPage from "./pages/SitemapPage";
import UserProfile from "./components/dashboard/users/UserProfile";
import InvoiceDetailsDashboard from "./components/dashboard/invoices/InvoiceDetails";
import OrderDetailsDashboard from "./components/dashboard/orders/OrderDetails";
import ProductDetailsDashboard from "./components/dashboard/products/ProductDetails";
import AllCategoriesPage from "./pages/AllCategoriesPage";
import ResetPasswordPage from "./components/ResetPasswordPage";
import PaymentMethods from "./components/dashboard/paymentMethods/PaymentMethods";
import Recibo from "./pages/recibo";
import ShipmentDetail from "./components/dashboard/shipments/ShipmentDetail";
import PaymentMethodList from "./components/dashboard/paymentMethods/PaymentMethodList";
import PaymentMethodCreate from "./components/dashboard/paymentMethods/PaymentMethodCreate";
import PaymentMethodDetail from "./components/dashboard/paymentMethods/PaymentMethodDetail";
import CategoryDetail from "./components/dashboard/categories/CategoryDetail";
import ProductCreate from "./components/dashboard/products/ProductCreate";
import ReporteVentasDiarias from "./components/dashboard/reports/ReporteVentasDiarias";

// Create a client
const queryClient = new QueryClient();

function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <span className="sr-only">Cargando...</span>
      </div>
    );
  }

  return <>{children}</>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <AuthWrapper>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/productos" element={<AllProducts />} />
                <Route path="/producto/:id" element={<ProductDetails />} />
                <Route path="/categoria/:id" element={<CategoryProducts />} />
                <Route path="/carrito" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/contacto" element={<Contact />} />
                <Route path="/pedidos" element={<Orders />} />
                <Route path="/pedidos/:id" element={<OrderDetails />} />
                <Route path="/perfil" element={<Profile />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/sitemap" element={<SitemapPage />} />
                <Route path="/categories" element={<AllCategoriesPage />} />
                <Route path="auth/reset-password" element={<ResetPasswordPage />} />
                <Route path="recibo/:id" element={<Recibo />} />
                
                {/* Dashboard Routes */}
                <Route path="/dashboard" element={<DashboardLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="usuarios" element={<UserList />} />
                  <Route path="usuarios/nuevo" element={<UserForm />} />
                  <Route path="usuarios/editar/:id" element={<UserForm />} />
                  <Route path="categorias" element={<CategoryList />} />
                  <Route path="/dashboard/categorias/crear" element={<CategoryForm />} />
  <Route path="/dashboard/categorias/:id" element={<CategoryDetail />} />
  <Route path="/dashboard/categorias/editar/:id" element={<CategoryDetail />} />
                  <Route path="categorias/nueva" element={<CategoryForm />} />
                  <Route path="categorias/editar/:id" element={<CategoryForm />} />
                  <Route path="productos" element={<ProductList />} />
                  <Route path="productos/nuevo" element={<ProductCreate />} />
                  <Route path="productos/:id" element={<ProductDetailsDashboard />} />
                  <Route path="productos/editar/:id" element={<ProductForm />} />
                  <Route path="reportes" element={<ReportsPanel />} />
                  <Route path="empresas-envio" element={<ShippingCompanies />} />
                  <Route path="usuarios/:id" element={<UserProfile />} />
                  <Route path="metodos-pago" element={<PaymentMethodList />} />
                  <Route path="metodos-pago/crear" element={<PaymentMethodCreate />} />
                  <Route path="metodos-pago/:id" element={<PaymentMethodDetail />} />
                  <Route path="metodos-pago/editar/:id" element={<PaymentMethodDetail />} />
                  <Route path="pagos" element={<PaymentList />} />
                  <Route path="pagos/nuevo" element={<PaymentForm />} /> 
                  <Route path="pagos/nuevo/:orderId" element={<PaymentForm />} />
                  <Route path="pagos/editar/:id" element={<PaymentForm />} />
                  <Route path="pedidos" element={<OrderList />} />
                  <Route path="pedidos/nuevo" element={<OrderForm />} />
                  <Route path="pedidos/:id" element={<OrderDetailsDashboard />} />
                  <Route path="pedidos/editar/:id" element={<OrderForm />} />
                  <Route path="envios" element={<ShipmentList />} />
                  <Route path="envios/:id" element={<ShipmentDetail />} />
                  <Route path="envios/nuevo" element={<ShipmentForm />} />
                  <Route path="envios/editar/:id" element={<ShipmentForm />} />
                  <Route path="recibo" element={<InvoiceList />} />
                  <Route path="recibo/nueva" element={<InvoiceForm />} />
                  <Route path="recibo/:id" element={<InvoiceDetailsDashboard />} />
                  <Route path="recibo/editar/:id" element={<InvoiceForm />} />
                  <Route path="reporte-ventas" element={<ReporteVentasDiarias />} />
                </Route>
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthWrapper>
            <Toaster />
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;