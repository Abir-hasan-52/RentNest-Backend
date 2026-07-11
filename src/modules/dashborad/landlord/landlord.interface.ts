export interface IMonthlyTrendPoint {
  month: string;
  revenue: number;
}

export interface ITopPerformingProperty {
  propertyId: string;
  title: string;
  revenue: number;
  averageRating: number;
  reviewCount: number;
  rentals: number;
}

export interface ILandlordDashboard {
  properties: {
    total: number;
    available: number;
    rented: number;
  };
  rentals: {
    total: number;
    pending: number;
    approved: number;
    active: number;
    completed: number;
  };
  revenue: {
    totalRevenue: number;
    monthlyRevenue: number;
    trend: IMonthlyTrendPoint[];
  };
  reviews: {
    totalReviews: number;
    averageRating: number;
  };
  recentRentalRequests: unknown[];
  recentPayments: unknown[];
  recentReviews: unknown[];
  topProperties: ITopPerformingProperty[];
}