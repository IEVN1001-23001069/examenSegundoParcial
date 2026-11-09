import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PizzaDetalle } from '../pedido.model';

@Component({
  selector: 'app-formulario-pedido',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './formulario-pedido.component.html',
  styleUrls: ['./formulario-pedido.component.css']
})
export class FormularioPedidoComponent {
  formPedido: FormGroup;
  @Output() pizzaAgregada = new EventEmitter<{ cliente: any, pizza: PizzaDetalle }>();

  // Precios base según requerimiento
  preciosTamano: { [key: string]: number } = {
    'Chica': 40,
    'Mediana': 80,
    'Grande': 120
  };

  precioIngrediente = 10;

      constructor(private fb: FormBuilder) {
        this.formPedido = this.fb.group({
      nombre_cliente: ['', Validators.required],
      direccion: ['', Validators.required],
      telefono: ['', Validators.required],
      fecha_compra: [
        new Date().toISOString().split('T')[0],
        Validators.required
      ],
      tamano: ['Chica', Validators.required],
      jamon: [false],
      pina: [false],
      champinones: [false],
      numero_pizzas: [1, [Validators.required, Validators.min(1)]]
    });
  }

  agregarPizza() {
    if (this.formPedido.invalid) return;

    const val = this.formPedido.value;
    
    // Calcular ingredientes seleccionados
    let ingredientesList: string[] = [];
    let costoIngredientes = 0;
    if (val.jamon) { ingredientesList.push('Jamón'); costoIngredientes += this.precioIngrediente; }
    if (val.pina) { ingredientesList.push('Piña'); costoIngredientes += this.precioIngrediente; }
    if (val.champinones) { ingredientesList.push('Champiñones'); costoIngredientes += this.precioIngrediente; }

    const precioBase = this.preciosTamano[val.tamano];
    const subtotal = (precioBase + costoIngredientes) * val.numero_pizzas;

    const nuevaPizza: PizzaDetalle = {
      tamano: val.tamano,
      ingredientes: ingredientesList.join(', '),
      numero_pizzas: val.numero_pizzas,
      subtotal: subtotal
    };

    this.pizzaAgregada.emit({
      cliente: {
        nombre_cliente: val.nombre_cliente,
        direccion: val.direccion,
        telefono: val.telefono,
        fecha_compra: val.fecha_compra
      },
      pizza: nuevaPizza
    });
  }
}