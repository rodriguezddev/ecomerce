import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { orderService } from "@/services/api-extensions";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AuthModal } from "@/components/AuthModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Package, Clock, CheckCircle, AlertTriangle, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Filter } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Order {
    id: number;
    fecha: string;
    estado: string;
    pagado: boolean;
    tipoDePedido: string;
    precioTotal: number;
    factura?: {
        id: number;
    };
    items?: Array<{
        id: number;
        cantidad: number;
        producto: {
            id: number;
            nombre: string;
            precio: number;
        };
    }>;
}

const OrderStatusBadge = ({ status }: { status: string }) => {
    let color = "";
    let icon = null;

    switch (status.toLowerCase()) {
        case "pedido en verificacion de pago":
            color = "bg-yellow-100 hover:bg-yellow-200 text-yellow-800";
            icon = <Clock className="h-3 w-3 mr-1" />;
            break;
        case "pagado":
        case "pedido pagado":
            color = "bg-green-100 hover:bg-green-200 text-green-800";
            icon = <CheckCircle className="h-3 w-3 mr-1" />;
            break;
        case "pedido en proceso de empaquetado":
            color = "bg-blue-100 hover:bg-blue-200 text-blue-800";
            icon = <Package className="h-3 w-3 mr-1" />;
            break;
        case "pedido enviado":
            color = "bg-purple-100 hover:bg-purple-200 text-purple-800";
            icon = <Package className="h-3 w-3 mr-1" />;
            break;
        case "cancelado":
            color = "bg-red-100 hover:bg-red-200 text-red-800";
            icon = <AlertTriangle className="h-3 w-3 mr-1" />;
            break;
        default:
            color = "bg-gray-100 hover:bg-gray-200 text-gray-800";
    }

    return (
        <Badge className={`${color} flex items-center gap-1`} variant="outline">
            {icon}
            {status}
        </Badge>
    );
};

const Orders = () => {
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [statusFilter, setStatusFilter] = useState<string>("todos");

    // Definir las opciones de filtro
    const filterOptions = [
        { value: "todos", label: "Todos" },
        { value: "Pedido en verificacion de pago", label: "Pedido en verificación de pago" },
        { value: "Pedido en proceso de empaquetado", label: "Pedido en proceso de empaquetado" },
        { value: "Disponible para entregar", label: "Disponible para entregar"},
        { value: "Pedido enviado", label: "Pedido enviado" },
        
    ];

    useEffect(() => {
        if (!isAuthenticated) {
            setIsAuthModalOpen(true);
            setLoading(false);
            return;
        }

        const fetchOrders = async () => {
            try {
                setLoading(true);
                if (user?.perfil?.id) {
                    const ordersData = await orderService.getUserOrders(user.perfil.id);
                    setOrders(ordersData);
                    setFilteredOrders(ordersData); // Inicialmente mostrar todos
                }
            } catch (err) {
                console.error("Error fetching orders:", err);
                setError("No se pudieron cargar los pedidos. Por favor, intente de nuevo más tarde.");
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [isAuthenticated, user]);

    // Aplicar filtro cuando cambie el estado seleccionado
    useEffect(() => {
        if (statusFilter === "todos") {
            setFilteredOrders(orders);
        } else {
            const filtered = orders.filter(order => 
                order.estado.toLowerCase() === statusFilter.toLowerCase()
            );
            setFilteredOrders(filtered);
        }
        setCurrentPage(1); // Resetear a la primera página al cambiar filtro
    }, [statusFilter, orders]);

    // Pagination logic
    const totalItems = filteredOrders.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    const handleItemsPerPageChange = (value: string) => {
        setItemsPerPage(Number(value));
        setCurrentPage(1);
    };

    const handleStatusFilterChange = (value: string) => {
        setStatusFilter(value);
    };

    const handleAuthModalClose = (open: boolean) => {
        setIsAuthModalOpen(open);
        if (!open && !isAuthenticated) {
            navigate("/");
        }
    };

    const handleViewOrderDetails = (orderId: number) => {
        navigate(`/pedidos/${orderId}`);
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                    <h1 className="text-3xl font-bold">Mis Pedidos</h1>
                    
                    {/* Filtro de estado */}
                    <div className="flex items-center gap-2">
                        <Filter className="h-5 w-5 text-muted-foreground" />
                        <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                            <SelectTrigger className="w-[250px]">
                                <SelectValue placeholder="Filtrar por estado" />
                            </SelectTrigger>
                            <SelectContent>
                                {filterOptions.map(option => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="ml-2">Cargando pedidos...</span>
                    </div>
                ) : error ? (
                    <div className="text-center py-8">
                        <AlertTriangle className="h-12 w-12 mx-auto text-destructive" />
                        <p className="mt-4 text-lg text-destructive">{error}</p>
                        <Button
                            variant="outline"
                            className="mt-4"
                            onClick={() => window.location.reload()}
                        >
                            Reintentar
                        </Button>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-12 border rounded-lg bg-muted/20">
                        <Package className="h-12 w-12 mx-auto text-muted-foreground" />
                        <h2 className="mt-4 text-xl font-semibold">No tienes pedidos aún</h2>
                        <p className="mt-2 text-muted-foreground">
                            Cuando realices tu primer pedido, aparecerá aquí.
                        </p>
                        <Button className="mt-4" onClick={() => navigate("/")}>
                            Ir a comprar
                        </Button>
                    </div>
                ) : (
                    <>
                        {/* Información del filtro aplicado */}
                        {statusFilter !== "todos" && (
                            <div className="mb-4 p-3 bg-muted/30 rounded-lg">
                                <p className="text-sm">
                                    Mostrando {filteredOrders.length} de {orders.length} pedidos
                                    {statusFilter !== "todos" && (
                                        <> con estado: <span className="font-medium">{filterOptions.find(opt => opt.value === statusFilter)?.label}</span></>
                                    )}
                                </p>
                            </div>
                        )}

                        {filteredOrders.length === 0 ? (
                            <div className="text-center py-12 border rounded-lg bg-muted/20">
                                <Filter className="h-12 w-12 mx-auto text-muted-foreground" />
                                <h2 className="mt-4 text-xl font-semibold">No hay pedidos con este filtro</h2>
                                <p className="mt-2 text-muted-foreground">
                                    No se encontraron pedidos con el estado seleccionado.
                                </p>
                                <Button 
                                    className="mt-4" 
                                    onClick={() => setStatusFilter("todos")}
                                    variant="outline"
                                >
                                    Ver todos los pedidos
                                </Button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Número</TableHead>
                                            <TableHead>Fecha</TableHead>
                                            <TableHead>Estado del Pedido</TableHead>
                                            <TableHead>Estado del Pago</TableHead>
                                            <TableHead>Total</TableHead>
                                            <TableHead>Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paginatedOrders.map((order) => (
                                            <TableRow key={order.id}>
                                                <TableCell className="font-medium">#{order.id}</TableCell>
                                                <TableCell>{formatDate(new Date(order.fecha))}</TableCell>
                                                <TableCell>
                                                    <OrderStatusBadge status={order.estado} />
                                                </TableCell>
                                                <TableCell>
                                                    <OrderStatusBadge status={order.pagado ? 'Pagado' : 'No verificado'} />
                                                </TableCell>
                                                <TableCell>${order.precioTotal?.toFixed(2) || "N/A"}</TableCell>
                                                <TableCell className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleViewOrderDetails(order.id)}
                                                    >
                                                        Visualizar pedido
                                                    </Button>
                                                    {(order.factura && order.estado !== "Pedido en verificacion de pago") && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            asChild
                                                        >
                                                            <Link to={`/recibo/${order.factura.id}`}>
                                                                Visualizar recibo
                                                            </Link>
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                {/* Pagination controls */}
                                {totalItems > 0 && (
                                    <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-2 border-t gap-4">
                                        <div className="flex items-center space-x-2">
                                            <p className="text-sm text-muted-foreground">
                                                Mostrando {startIndex + 1}-{Math.min(endIndex, totalItems)} de {totalItems} pedidos
                                            </p>
                                            <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                                                <SelectTrigger className="h-8 w-[70px]">
                                                    <SelectValue placeholder={itemsPerPage} />
                                                </SelectTrigger>
                                                <SelectContent side="top">
                                                    {[10, 20, 30, 40, 50].map((size) => (
                                                        <SelectItem key={size} value={size.toString()}>
                                                            {size}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Button
                                                variant="outline"
                                                className="h-8 w-8 p-0"
                                                onClick={() => handlePageChange(1)}
                                                disabled={currentPage === 1}
                                            >
                                                <ChevronsLeft className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="h-8 w-8 p-0"
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                disabled={currentPage === 1}
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                            </Button>
                                            <span className="text-sm font-medium">
                                                Página {currentPage} de {totalPages}
                                            </span>
                                            <Button
                                                variant="outline"
                                                className="h-8 w-8 p-0"
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                disabled={currentPage === totalPages || totalPages === 0}
                                            >
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="h-8 w-8 p-0"
                                                onClick={() => handlePageChange(totalPages)}
                                                disabled={currentPage === totalPages || totalPages === 0}
                                            >
                                                <ChevronsRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </main>
            <Footer />

            <AuthModal
                isOpen={isAuthModalOpen}
                onOpenChange={handleAuthModalClose}
            />
        </div>
    );
};

export default Orders;