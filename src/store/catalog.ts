import { create } from 'zustand';
import type { Brand, BikeCategory, SizeOption } from '../types';
import { catalogService } from '../services/catalog';

interface CatalogState {
  brands: Brand[];
  categories: BikeCategory[];
  sizes: SizeOption[];
  isLoading: boolean;
  
  fetchBrands: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchSizes: () => Promise<void>;
  fetchAll: () => Promise<void>;
}

export const useCatalogStore = create<CatalogState>((set) => ({
  brands: [],
  categories: [],
  sizes: [],
  isLoading: false,
  
  fetchBrands: async () => {
    try {
      const brands = await catalogService.getBrands();
      set({ brands });
    } catch (error) {
      console.error('Failed to fetch brands:', error);
    }
  },
  
  fetchCategories: async () => {
    try {
      const categories = await catalogService.getCategories();
      set({ categories });
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  },
  
  fetchSizes: async () => {
    try {
      const sizes = await catalogService.getSizes();
      set({ sizes });
    } catch (error) {
      console.error('Failed to fetch sizes:', error);
    }
  },
  
  fetchAll: async () => {
    set({ isLoading: true });
    try {
      await Promise.all([
        catalogService.getBrands(),
        catalogService.getCategories(),
        catalogService.getSizes(),
      ]).then(([brands, categories, sizes]) => {
        set({ brands, categories, sizes });
      });
    } catch (error) {
      console.error('Failed to fetch catalog data:', error);
    } finally {
      set({ isLoading: false });
    }
  },
}));
