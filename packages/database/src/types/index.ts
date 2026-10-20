// Tipos de la base de datos
export interface Dataset {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
}

export interface Metric {
  id: string;
  datasetId: string;
  name: string;
  value: number;
  timestamp: Date;
}
