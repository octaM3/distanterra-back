import { ValueTransformer } from 'typeorm';

/**
 * node-postgres devuelve las columnas NUMERIC como string (para no perder
 * precisión). Este transformer las expone como number en las entidades,
 * ya que los montos que maneja esta app no requieren precisión arbitraria.
 */
export const decimalTransformer: ValueTransformer = {
  to: (value?: number | null) => value,
  from: (value: string | null) =>
    value === null || value === undefined ? null : parseFloat(value),
};
