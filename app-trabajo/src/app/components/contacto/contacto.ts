import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [CommonModule],
  styleUrl: './contacto.css',
  templateUrl: './contacto.html',
})
export class Contacto {
  protected canales = [
    { icono: '📞', nombre: 'Teléfono', valor: '+51 984 000 000', href: 'tel:+51984000000' },
    { icono: '💬', nombre: 'WhatsApp', valor: 'Escríbenos directo', href: 'https://wa.me/51984000000' },
    { icono: '✉️', nombre: 'Correo', valor: 'ventas@fopesa.com', href: 'mailto:ventas@fopesa.com' },
    { icono: '📍', nombre: 'Dirección', valor: 'Cusco, Perú', href: 'https://maps.google.com/?q=Cusco+Peru' },
  ];
}
