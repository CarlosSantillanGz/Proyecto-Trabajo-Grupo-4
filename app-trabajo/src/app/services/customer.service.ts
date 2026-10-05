import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { INVENTORY_API_URL } from './inventory.service';

export interface CustomerRegistration {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion: string;
}

export interface CustomerRegistrationResult {
  idCliente: number;
  created: boolean;
}

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(INVENTORY_API_URL).replace(/\/$/, '');

  registrar(customer: CustomerRegistration): Promise<CustomerRegistrationResult> {
    return firstValueFrom(
      this.http.post<CustomerRegistrationResult>(`${this.apiUrl}/clientes`, customer),
    );
  }
}