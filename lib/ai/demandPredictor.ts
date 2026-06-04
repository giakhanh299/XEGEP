import { RouteType } from '@/lib/types';

export function predictRouteDemand(routeType: RouteType, dateTime: string) {
  const hour = new Date(dateTime).getHours();
  const peak = hour >= 6 && hour <= 8 || hour >= 16 && hour <= 19;
  return {
    routeType,
    demandLevel: peak ? 'high' : 'medium',
    confidence: peak ? 0.78 : 0.55
  };
}
