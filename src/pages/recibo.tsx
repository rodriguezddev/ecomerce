
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { orderService } from "@/services/api-extensions";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AuthModal } from "@/components/AuthModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Package, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import InvoiceDetails from "@/components/dashboard/invoices/InvoiceDetails";

interface Order {
    id: number;
    fecha: string;
    estado: string;
    pagado: boolean;
    tipoDePedido: string;
    precioTotal: number;
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

const Recibo = () => {
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            setIsAuthModalOpen(true);
            setLoading(false);
            return;
        }

    }, [isAuthenticated, user]);

    const handleAuthModalClose = (open: boolean) => {
        setIsAuthModalOpen(open);
        if (!open && !isAuthenticated) {
            navigate("/");
        }
    };


    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-8">
                <InvoiceDetails isShowEditButton={false}/>
            </main>
            <Footer />

            <AuthModal
                isOpen={isAuthModalOpen}
                onOpenChange={handleAuthModalClose}
            />
        </div>
    );
};

export default Recibo;
