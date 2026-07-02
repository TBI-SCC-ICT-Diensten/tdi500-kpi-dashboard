import { useState, useEffect } from 'react';
import {
  getDataSource,
  setDataSource as setDataSourceService,
  subscribeToDataSource,
  type DataSource,
} from '../services/hupieApi';

export type { DataSource };

/**
 * View hook for the live/mock data-source toggle. Wraps the hupieApi data-source
 * singleton so view components don't import the service directly — they render
 * from the returned `dataSource` and call the returned setters. The hook stays
 * in sync with changes made elsewhere via subscribeToDataSource.
 */
export const useDataSource = () => {
  const [dataSource, setState] = useState<DataSource>(getDataSource());
  useEffect(() => subscribeToDataSource(setState), []);

  const setDataSource = (source: DataSource): void => setDataSourceService(source);
  const toggle = (): void => setDataSourceService(dataSource === 'live' ? 'mock' : 'live');

  return { dataSource, setDataSource, toggle };
};
