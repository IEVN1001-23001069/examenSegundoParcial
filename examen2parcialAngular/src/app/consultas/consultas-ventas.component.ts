import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PedidoService } from '../pedido.service';

@Component({
  selector: 'app-consultas-ventas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './consultas-ventas.component.html',
  styleUrls: ['./consultas-ventas.component.css']
})
export class ConsultasVentasComponent {
  diaSeleccionado: string = 'Monday';
  mesSeleccionado: string = 'November';
  resultadosVentas: any[] = [];
  totalAcumulado: number = 0;

  constructor(private pedidoService: PedidoService) {}

  buscarPorDia() {
    this.pedidoService.consultarVentasPorDia(this.diaSeleccionado).subscribe(res => {
      if (res.exito) {
        this.resultadosVentas = res.ventas;
        this.totalAcumulado = res.ventas_totales_dia;
      }
    });
  }

  buscarPorMes() {
    this.pedidoService.consultarVentasPorMes(this.mesSeleccionado).subscribe(res => {
      if (res.exito) {
        this.resultadosVentas = res.ventas;
        this.totalAcumulado = res.total_acumulado_mes;
      }
    });
  }
}