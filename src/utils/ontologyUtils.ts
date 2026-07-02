import { UNIT_MAP } from '../types/units';
import type { SparqlValue } from '../types/api';
import type { ConnectionState } from '../types/heatpump';

export const resolveUnit = (unitUri: string): string => {
  return UNIT_MAP[unitUri] ?? 'unknown unit';
};

export const parseNumericValue = (sparqlValue?: SparqlValue): number => {
  if (!sparqlValue?.value) return 0;
  const parsed = parseFloat(sparqlValue.value);
  return isNaN(parsed) ? 0 : parsed;
};

export const parseTimestamp = (sparqlValue?: SparqlValue): Date | undefined => {
  if (!sparqlValue?.value) return undefined;
  const date = new Date(sparqlValue.value);
  return isNaN(date.getTime()) ? undefined : date;
};

export const extractIdFromUri = (uri: string): string => {
  const parts = uri.split(/[-/]/);
  return parts[parts.length - 1] || uri;
};

export const resolveConnectionState = (value?: string): ConnectionState => {
  if (!value) return 'unknown';
  const lower = value.toLowerCase();
  if (lower.includes('disconnected') || lower.includes('offline') || lower === 'false') return 'disconnected';
  if (lower.includes('connected') || lower.includes('online') || lower === 'true') return 'connected';
  return 'unknown';
};

export const extractStringValue = (sparqlValue?: SparqlValue): string => {
  return sparqlValue?.value ?? '';
};
