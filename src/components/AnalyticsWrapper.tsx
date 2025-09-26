import { useAnalytics } from '../hooks/useAnalytics';

interface AnalyticsWrapperProps {
  children: React.ReactNode;
}

const AnalyticsWrapper: React.FC<AnalyticsWrapperProps> = ({ children }) => {
  // Initialiser le tracking des analytics
  useAnalytics();

  return <>{children}</>;
};

export default AnalyticsWrapper;
