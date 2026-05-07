import { PageShell } from '@/components/layout/PageShell';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppTypography } from '@/components/ui/AppTypography';
import { StoreProductCard } from '@/features/store/components/StoreProductCard';
import { useStoreCatalogQuery } from '@/features/store/hooks/useStoreCatalogQuery';
import { useStoreBrowseStore } from '@/features/store/store/storeBrowse.store';

export function StorePage() {
  const { data = [], isLoading, isError, refetch } = useStoreCatalogQuery();
  const { selectedCategory, setSelectedCategory } = useStoreBrowseStore();

  const categories = ['all', ...new Set(data.map((product) => product.category))];
  const filtered =
    selectedCategory === 'all' ? data : data.filter((p) => p.category === selectedCategory);

  return (
    <PageShell
      title="Store"
      description="Browse items added by your administrator. Prices reflect your session’s points conversion."
      actions={
        <AppButton variant="secondary" onClick={() => refetch()}>
          Refresh
        </AppButton>
      }
    >
      <div className="page-grid">
        <section className="stack-24">
          {isLoading ? (
            <AppCard>
              <AppTypography variant="body">Loading catalog…</AppTypography>
            </AppCard>
          ) : null}

          {isError ? (
            <AppCard>
              <AppTypography variant="titleSm">Unable to load store</AppTypography>
              <AppTypography variant="body" color="var(--app-text-secondary)">
                Check your connection and try again.
              </AppTypography>
            </AppCard>
          ) : null}

          {!isLoading && !isError && filtered.length === 0 ? (
            <AppCard>
              <div className="empty-state">
                <AppTypography variant="titleSm">No items match</AppTypography>
                <AppTypography variant="body" color="var(--app-text-secondary)">
                  Try another category filter.
                </AppTypography>
              </div>
            </AppCard>
          ) : null}

          {!isLoading && !isError ? (
            <div className="product-grid">
              {filtered.map((product) => (
                <StoreProductCard key={String(product.id)} product={product} />
              ))}
            </div>
          ) : null}
        </section>

        <aside className="stack-24">
          <AppCard>
            <div className="stack-16">
              <AppTypography variant="titleMd">Categories</AppTypography>
              <AppTypography variant="bodySmall" color="var(--app-text-secondary)">
                Filter the catalog locally while the list is loaded from the API.
              </AppTypography>
              <div className="stack-12 section-divider">
                {categories.map((category) => (
                  <AppButton
                    key={category}
                    variant={selectedCategory === category ? 'primary' : 'secondary'}
                    onClick={() => setSelectedCategory(category)}
                    block
                  >
                    {category}
                  </AppButton>
                ))}
              </div>
            </div>
          </AppCard>
        </aside>
      </div>
    </PageShell>
  );
}
