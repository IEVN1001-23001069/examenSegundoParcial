export interface PizzaDetalle {
  tamano: string;
  ingredientes: string; // o string según prefieras manejarlo
  numero_pizzas: number;
  subtotal: number;
}

export interface Pedido {
  nombre_cliente: string;
  direccion: string;
  telefono: string;
  fecha_compra: string; // Formato YYYY-MM-DD
  total_pedido: number;
  pizzas: PizzaDetalle[];
}