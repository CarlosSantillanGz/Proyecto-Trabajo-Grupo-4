import { Component } from '@angular/core';
import { B2bForm } from '../../components/b2b-form/b2b-form';
import { CatalogoProductos } from '../../components/catalogo-productos/catalogo-productos';
import { Contacto } from '../../components/contacto/contacto';
import { Hero } from '../../components/hero/hero';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [Hero, CatalogoProductos, B2bForm, Contacto],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {}
