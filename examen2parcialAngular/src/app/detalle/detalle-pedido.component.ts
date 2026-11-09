import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PizzaDetalle } from '../pedido.model';

@Component({
  selector: 'app-detalle-pedido',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detalle-pedido.component.html',
  styleUrls: ['./detalle-pedido.component.css']
})
export class DetallePedidoComponent {
  @Input() listaPizzas: PizzaDetalle[] = [];
  
  // Variable para almacenar el índice seleccionado en la tabla
  indiceSeleccionado: number | null = null;

  @Output() quitarPizzaIndex = new EventEmitter<number>();
  @Output() terminarPedidoEvent = new EventEmitter<void>();

  // Selecciona o deselecciona la pizza al hacer click en el checkbox
  seleccionarParaQuitar(index: number) {
    this.indiceSeleccionado = this.indiceSeleccionado === index ? null : index;
  }

  // Ejecuta la eliminación de la pizza seleccionada (vinculada al botón "Quitar Seleccionada")
  ejecutarQuitar() {
    if (this.indiceSeleccionado !== null) {
      this.quitarPizzaIndex.emit(this.indiceSeleccionado);
      this.indiceSeleccionado = null; // Reiniciar selección
    }
  }

  calcularTotalGeneral(): number {
    return this.listaPizzas.reduce((acc, p) => acc + (p.subtotal || 0), 0);
  }

  terminar() {
    this.terminarPedidoEvent.emit();
  }
}