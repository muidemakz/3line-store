import { PageShell } from '@/components/layout/PageShell';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppInput } from '@/components/ui/AppInput';
import { AppTypography } from '@/components/ui/AppTypography';
import { ProductCard } from '@/features/products/components/ProductCard';
import { useProductsQuery } from '@/features/products/hooks/useProductsQuery';
import { useProductsStore } from '@/features/products/store/products.store';

export function ProductsPage() {
  const { data = [], isLoading, isError, refetch } = useProductsQuery();
  const { selectedCategory, setSelectedCategory } = useProductsStore();

  const categories = ['all', ...new Set(data.map((product) => product.category))];
  const filteredProducts =
    selectedCategory === 'all'
      ? data
      : data.filter((product) => product.category === selectedCategory);

  return (
    <PageShell
      title="Products"
      description="Feature module example and design-system preview built with wrapper components, tokenized theme rules, TanStack Query, Axios, and Zustand."
      actions={
        <div className="cluster-12">
          <AppButton variant="secondary" onClick={() => refetch()}>
            Refresh
          </AppButton>
          <AppButton>New Product</AppButton>
        </div>
      }
    >
      <div className="page-grid">
        <section className="stack-24">
          <AppCard>
            <div className="stack-16">
              <AppTypography variant="titleMd">Design System Preview</AppTypography>
              <AppTypography variant="body" color="var(--app-text-secondary)">
                This page intentionally previews the foundation instead of building arbitrary
                product UI. It demonstrates button hierarchy, controlled card surfaces, typography
                levels, and a token-driven filter panel.
              </AppTypography>
              <div className="cluster-12">
                <AppButton>Primary Action</AppButton>
                <AppButton variant="secondary">Secondary</AppButton>
                <AppButton variant="text">Tertiary</AppButton>
                <AppButton variant="danger">Danger</AppButton>
              </div>
            </div>
          </AppCard>

          {isLoading ? (
            <AppCard>
              <div className="stack-16">
                <AppTypography variant="body">Loading products...</AppTypography>
                <AppTypography variant="bodySmall" color="var(--app-text-secondary)">
                  Query client is fetching the remote catalog.
                </AppTypography>
              </div>
            </AppCard>
          ) : null}

          {isError ? (
            <AppCard>
              <div className="stack-16">
                <AppTypography variant="titleSm">Unable to load products</AppTypography>
                <AppTypography variant="body" color="var(--app-text-secondary)">
                  The query layer reported an error. Use the refresh action to try again.
                </AppTypography>
              </div>
            </AppCard>
          ) : null}

          {!isLoading && !isError && filteredProducts.length === 0 ? (
            <AppCard>
              <div className="empty-state">
                <AppTypography variant="titleSm">No products available</AppTypography>
                <AppTypography variant="body" color="var(--app-text-secondary)">
                  Adjust the current filter to see matching products.
                </AppTypography>
              </div>
            </AppCard>
          ) : null}

          {!isLoading && !isError ? (
            <div className="product-grid">
              {filteredProducts.slice(0, 6).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : null}
        </section>

        <aside className="stack-24">
          <AppCard>
            <div className="stack-16">
              <AppTypography variant="titleMd">Filter State</AppTypography>
              <AppTypography variant="bodySmall" color="var(--app-text-secondary)">
                Lightweight UI state is kept in Zustand. Remote product data stays in TanStack
                Query.
              </AppTypography>

              <AppInput placeholder="Search wrapper preview" disabled />

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
