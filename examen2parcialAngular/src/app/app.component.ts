import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormularioPedidoComponent } from './formularios/formulario-pedido.component';
import { DetallePedidoComponent } from './detalle/detalle-pedido.component';
import { ConsultasVentasComponent } from './consultas/consultas-ventas.component';
import { PizzaDetalle, Pedido } from './pedido.model';
import { PedidoService } from './pedido.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    FormularioPedidoComponent, 
    DetallePedidoComponent, 
    ConsultasVentasComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  datosCliente: any = {};
  pizzasTemporal: PizzaDetalle[] = [];

  constructor(private pedidoService: PedidoService) {}

  manejarPizzaAgregada(evento: { cliente: any, pizza: PizzaDetalle }) {
    this.pizzasTemporal = [...this.pizzasTemporal, evento.pizza];
    this.datosCliente = evento.cliente;
    alert('¡La pizza se ha agregado al pedido correctamente! 🍕');
  }

  manejarQuitarPizza(index: number) {
    this.pizzasTemporal.splice(index, 1);
  }

  
manejarTerminarPedido() {
  if (this.pizzasTemporal.length === 0) {
    alert('Debe agregar al menos una pizza al pedido.');
    return;
  }

  const totalGeneral = this.pizzasTemporal.reduce(
    (acc, p) => acc + p.subtotal, 0
  );

  const pedidoFinal: Pedido = {
    nombre_cliente: this.datosCliente.nombre_cliente,
    direccion: this.datosCliente.direccion,
    telefono: this.datosCliente.telefono,
    fecha_compra: this.datosCliente.fecha_compra,
    total_pedido: totalGeneral,
    pizzas: this.pizzasTemporal
  };

  console.log('Pedido enviado:', pedidoFinal);

  this.pedidoService.registrarPedido(pedidoFinal).subscribe({
    next: (res) => {
      if (res.exito) {
        alert(`¡Pedido guardado con éxito! Importe total a pagar: $${res.total_pagar}`);
        this.pizzasTemporal = [];
      }
    },
    error: (err) => {
      alert(err.error?.mensaje || 'Error al registrar el pedido en el servidor.');
      console.error('Error al registrar pedido:', err);
    }
  });
}

}