import { InjectionToken } from '@angular/core';

export const CATALOG_API_URL = new InjectionToken<string>('CATALOG_API_URL', {
  providedIn: 'root',
  factory: () => 'https://7kdujtb57i.execute-api.us-east-1.amazonaws.com/v1',
});

export const ORDERS_API_URL = new InjectionToken<string>('ORDERS_API_URL', {
  providedIn: 'root',
  factory: () => 'https://fnmdsj99u0.execute-api.us-east-1.amazonaws.com',
});

export const CUSTOMER_API_URL = new InjectionToken<string>('CUSTOMER_API_URL', {
  providedIn: 'root',
  factory: () => 'https://gysn1n5a51.execute-api.us-east-1.amazonaws.com/v1',
});

export const INVENTORY_API_URL = new InjectionToken<string>('INVENTORY_API_URL', {
  providedIn: 'root',
  factory: () => 'https://gysn1n5a51.execute-api.us-east-1.amazonaws.com/v1',
});