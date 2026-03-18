interface DashboardData {
  loading: boolean;
  error: string | null;
  data: null;
}

const useDashboardData = (): DashboardData => {
  return { loading: false, error: null, data: null };
};

export default useDashboardData;
