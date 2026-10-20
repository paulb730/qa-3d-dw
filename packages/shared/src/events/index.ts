// Event bus types
export interface DomainEvent<T = unknown> {
  type: string;
  payload: T;
  timestamp: number;
  correlationId?: string;
}

// corregir
