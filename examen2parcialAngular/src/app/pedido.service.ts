import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Pedido } from './pedido.model';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  private API_URL = 'http://localhost:5000/api/pedidos';

  constructor(private http: HttpClient) {}

  registrarPedido(pedido: Pedido): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/`, pedido);
  }

  consultarVentasPorDia(dia: string): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/dia/${dia}`);
  }

  consultarVentasPorMes(mes: string): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/mes/${mes}`);
  }

  verDetallePedido(idPedido: number): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/${idPedido}/detalle`);
  }
}