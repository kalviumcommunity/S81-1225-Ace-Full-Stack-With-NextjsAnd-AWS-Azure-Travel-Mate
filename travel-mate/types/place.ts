/**
 * Place Types for Travel Mate
 *
 * These types represent travel destinations/places in the application.
 */

export interface Place {
  id: string;
  name: string;
  slug?: string;
  description?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string;
  latitude?: number | string | null;
  longitude?: number | string | null;
  imageUrl?: string | null;
  rating?: number | string;
  reviewCount?: number;
  priceLevel?: number | null;
  isActive?: boolean;
  isFeatured?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  categoryId?: string;
  category?: {
    id?: string;
    name: string;
    slug: string;
  };
}

export interface PlaceWithDetails extends Place {
  reviews?: Array<{
    id: string;
    rating: number;
    comment: string | null;
    user: {
      name: string;
      avatarUrl: string | null;
    };
    createdAt: string | Date;
  }>;
  images?: Array<{
    id: string;
    url: string;
    altText: string | null;
    isPrimary: boolean;
  }>;
  amenities?: Array<{
    amenity: {
      id: string;
      name: string;
      icon: string | null;
    };
  }>;
}

export interface PlaceFilters {
  country?: string;
  city?: string;
  categoryId?: string;
  isFeatured?: boolean;
  isActive?: boolean;
  minRating?: number;
  maxRating?: number;
  priceLevel?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PlacePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
