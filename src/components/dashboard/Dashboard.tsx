
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { userService, productService, orderService, categoryService } from "@/services/api";
import { DollarSign, Package, Users, ShoppingBag, Tag } from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const [userCount, setUserCount] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [categoryCount, setCategoryCount] = useState(0);
  const [exchangeRate, setExchangeRate] = useState("36.50"); // Tasa de ejemplo
  const { toast } = useToast();

  // Fixed useQuery calls by removing onError and using options.meta instead
  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: userService.getUsers,
    meta: {
      onError: (error: Error) => console.error("Error fetching users:", error),
    }
  });

  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: productService.getProducts,
    meta: {
      onError: (error: Error) => console.error("Error fetching products:", error),
    }
  });

  const { data: orders } = useQuery({
    queryKey: ["orders"],
    queryFn: orderService.getOrders,
    meta: {
      onError: (error: Error) => console.error("Error fetching orders:", error),
    }
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: categoryService.getCategories,
    meta: {
      onError: (error: Error) => console.error("Error fetching categories:", error),
    }
  });

  useEffect(() => {
    if (users) setUserCount(users.length);
    if (products) setProductCount(products.length);
    if (orders) setOrderCount(orders.length);
    if (categories) setCategoryCount(categories.length);
  }, [users, products, orders, categories]);

  const handleUpdateExchangeRate = () => {
    // Aquí llamarías a tu API para actualizar la tasa
    toast({
      title: "Tasa de cambio actualizada",
      description: `La nueva tasa es ${exchangeRate}.`,
    });
  };

  // Process data for charts using useMemo for optimization
  const monthlyOrdersData = useMemo(() => {
    if (!orders) return [];
    const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const monthlyCounts: { [key: string]: { year: number, month: number, orders: number } } = {};

    orders.forEach((order: any) => {
      const date = new Date(order.fecha);
      const year = date.getFullYear();
      const month = date.getMonth();
      const key = `${year}-${month}`;
      
      if (!monthlyCounts[key]) {
        monthlyCounts[key] = { year, month, orders: 0 };
      }
      monthlyCounts[key].orders++;
    });

    return Object.values(monthlyCounts)
      .sort((a, b) => a.year - b.year || a.month - b.month)
      .slice(-7) // Muestra los últimos 7 meses con datos
      .map(item => ({
        month: `${monthNames[item.month]} '${item.year.toString().slice(-2)}`,
        orders: item.orders,
      }));
  }, [orders]);

  const categoryProductsData = useMemo(() => {
    if (!categories) return [];
    return categories.map((category: any) => ({
      name: category.nombre,
      productos: category.productos?.length || 0,
    })).filter(c => c.productos > 0);
  }, [categories]);

  const orderStatusData = useMemo(() => {
    if (!orders) return [];
    const statusCounts = orders.reduce((acc: Record<string, number>, order: any) => {
      const status = order.estado || "Desconocido";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  }, [orders]);

  const COLORS = {"Disponible para entregar": "#8884d8","Pedido en verificacion de pago": "#FFBB28", "Pedido pagado": "#00C49F", "pagado": "#00C49F", "Pedido en proceso de empaquetado": "#0088FE", "Pedido enviado": "#82ca9d", "cancelado": "#FF8042", "Entregado": "#28a745", "Desconocido": "#b0b0b0" };
  const FALLBACK_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Resumen de ventas</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Usuarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userCount}</div>
            <p className="text-xs text-muted-foreground">
              Total de usuarios registrados
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Catálogo</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productCount}</div>
            <p className="text-xs text-muted-foreground">
              Productos en catálogo
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pedidos</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orderCount}</div>
            <p className="text-xs text-muted-foreground">
              Total de pedidos
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Categorías</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categoryCount}</div>
            <p className="text-xs text-muted-foreground">
              Categorías disponibles
            </p>
          </CardContent>
        </Card>
      </div>

      
      {/* Graphs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Pedidos Mensuales</CardTitle>
            <CardDescription>Tendencia de pedidos en los últimos meses</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={monthlyOrdersData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="orders" stroke="#8884d8" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Productos por Categoría</CardTitle>
            <CardDescription>Distribución de Productos por Categoría</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryProductsData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="productos" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Estado de Pedidos</CardTitle>
            <CardDescription>Distribución de pedidos por estado</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {orderStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || FALLBACK_COLORS[index % FALLBACK_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
