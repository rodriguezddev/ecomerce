
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}

export function getStatusBadgeColor(status: string): string {
  switch(status.toLowerCase()) {
    case 'pedido en verificacion de pago':
      return 'bg-yellow-500 hover:bg-yellow-600';
    case 'procesando':
      return 'bg-blue-500 hover:bg-blue-600';
    case 'enviado':
      return 'bg-purple-500 hover:bg-purple-600';
    case 'entregado':
      return 'bg-green-500 hover:bg-green-600';
    case 'cancelado':
      return 'bg-red-500 hover:bg-red-600';
    default:
      return 'bg-gray-500 hover:bg-gray-600';
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
}
