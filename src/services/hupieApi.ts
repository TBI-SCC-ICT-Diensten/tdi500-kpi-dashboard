import axios, { AxiosError } from 'axios';
import { config } from '../config';
import { SparqlResponse, ApiError } from '../types/api';

const hupieAxios = axios.create({
  baseURL: config.api.baseUrl,
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/sparql-query',
    'Accept': 'application/json',
  },
  params: {
    token: config.api.apiKey,
  }
});

const handleApiError = (error: unknown, endpoint: string): ApiError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    const apiError: ApiError = {
      message: axiosError.message,
      statusCode: axiosError.response?.status,
      endpoint,
    };
    console.error(`[TDI500 API Error] ${endpoint} (${apiError.statusCode || 'Network/Timeout'}):`, axiosError.message);
    return apiError;
  }
  
  const unknownError: ApiError = {
    message: error instanceof Error ? error.message : String(error),
    endpoint,
  };
  console.error(`[TDI500 API Error] ${endpoint}:`, unknownError.message);
  return unknownError;
};

export const executeSparqlQuery = async (query: string): Promise<SparqlResponse> => {
  try {
    const response = await hupieAxios.post('', query);
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'POST sparql');
  }
};

export const executeSparqlQueryGet = async (query: string): Promise<SparqlResponse> => {
  try {
    // For GET requests, the query might need to be passed as a param.
    // Assuming the Hupie API expects the query parameter named 'query'.
    const response = await hupieAxios.get('', {
      params: {
        ...hupieAxios.defaults.params,
        query
      }
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error, 'GET sparql');
  }
};