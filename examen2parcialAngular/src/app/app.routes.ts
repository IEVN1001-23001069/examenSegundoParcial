import { Routes } from '@angular/router';
import { AppComponent } from './app.component'; // O el componente que agrupe todo

export const routes: Routes = [
  // Si quieres que la raíz cargue tu componente principal o vista
  { path: '', component: AppComponent }
];