import { useState, useEffect } from 'react';
import { MainLayout } from '../../layouts/MainLayout';
import { listingService } from '../../services/listing';
import { useCatalogStore } from '../../store/catalog';
import type { Listing } from '../../types';
import { ListingStatus } from '../../types';
import { BikeCard } from '../../components/listing/BikeCard';
import { Loading, Input, Pagination } from '../../components/ui';

export const SearchPage = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 12;
  const [filters, setFilters] = useState({
    search: '',
    brandId: undefined as number | undefined,
    categoryId: undefined as number | undefined,
    minPrice: undefined as number | undefined,
    maxPrice: undefined as number | undefined,
  });

  const { brands, categories, fetchAll } = useCatalogStore();

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    setCurrentPage(1); // Reset to page 1 when filters change
  }, [filters]);

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      try {
        const results = await listingService.getAllPaged({
          pageNumber: currentPage,
          pageSize,
          status: ListingStatus.VERIFIED,
          ...filters,
        });
        setListings(results.items);
        setTotalPages(results.totalPages);
        setTotalCount(results.totalCount);
      } catch (error) {
        console.error('Failed to fetch listings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [filters, currentPage]);

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 md:px-10 py-8 flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 shrink-0 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Bộ lọc</h3>
            <button
              onClick={() => setFilters({
                search: '',
                brandId: undefined,
                categoryId: undefined,
                minPrice: undefined,
                maxPrice: undefined,
              })}
              className="text-xs font-semibold text-green-600 uppercase tracking-wider"
            >
              Xóa bộ lọc
            </button>
          </div>

          <div>
            <Input
              placeholder="Tìm kiếm..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              icon="search"
            />
          </div>

          <div>
            <label className="text-sm font-semibold mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-green-600 text-sm">sell</span> Thương hiệu
            </label>
            <div className="space-y-2 mt-2">
              {brands.map(brand => (
                <label key={brand.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="brand"
                    checked={filters.brandId === brand.id}
                    onChange={() => setFilters(prev => ({ 
                      ...prev, 
                      brandId: prev.brandId === brand.id ? undefined : brand.id 
                    }))}
                    className="rounded-full border-slate-300 text-green-600 focus:ring-green-600"
                  />
                  <span className="text-sm">{brand.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <label className="text-sm font-semibold mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-green-600 text-sm">category</span> Loại xe
            </label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setFilters(prev => ({ 
                    ...prev, 
                    categoryId: prev.categoryId === category.id ? undefined : category.id 
                  }))}
                  className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
                    filters.categoryId === category.id
                      ? 'bg-green-50 text-green-600 border-green-200'
                      : 'bg-slate-100 dark:bg-slate-800 border-transparent hover:border-green-600'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <label className="text-sm font-semibold mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-green-600 text-sm">payments</span> Giá
            </label>
            <div className="space-y-3">
              <Input
                type="number"
                placeholder="Giá tối thiểu"
                value={filters.minPrice || ''}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  minPrice: e.target.value ? Number(e.target.value) : undefined 
                }))}
              />
              <Input
                type="number"
                placeholder="Giá tối đa"
                value={filters.maxPrice || ''}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  maxPrice: e.target.value ? Number(e.target.value) : undefined 
                }))}
              />
            </div>
          </div>
        </aside>

        <main className="flex-1">
          <div className="mb-6">
            <h1 className="text-3xl font-black mb-2">Tìm kiếm xe đạp</h1>
            <p className="text-slate-600 dark:text-slate-400">
              Tìm thấy {totalCount} kết quả
            </p>
          </div>

          {loading ? (
            <Loading />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {listings.map(listing => (
                  <BikeCard key={listing.id} listing={listing} />
                ))}
              </div>

              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  className="my-8"
                />
              )}
            </>
          )}

          {!loading && listings.length === 0 && (
            <div className="text-center py-16">
              <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-700 mb-4">
                search_off
              </span>
              <h3 className="text-xl font-bold mb-2">Không tìm thấy kết quả</h3>
              <p className="text-slate-500">Thử thay đổi bộ lọc của bạn</p>
            </div>
          )}
        </main>
      </div>
    </MainLayout>
  );
};
