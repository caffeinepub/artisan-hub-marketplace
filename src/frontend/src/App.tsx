import { StrictMode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import Layout from './components/Layout';
import ProductListing from './pages/ProductListing';
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';
import RevenueAnalytics from './pages/RevenueAnalytics';
import ArtistDashboard from './pages/ArtistDashboard';
import ArtistRegistration from './pages/ArtistRegistration';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailure from './pages/PaymentFailure';
import ArtistStorePage from './pages/ArtistStorePage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: ProductListing,
});

const productsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/products',
  component: ProductListing,
});

const adminDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/dashboard',
  component: AdminDashboard,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminDashboard,
});

const userManagementRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/users',
  component: UserManagement,
});

const revenueRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/revenue',
  component: RevenueAnalytics,
});

const artistDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/artist/dashboard',
  component: ArtistDashboard,
});

const artistRegistrationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/artist/register',
  component: ArtistRegistration,
});

const paymentSuccessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payment-success',
  component: PaymentSuccess,
});

const paymentFailureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payment-failure',
  component: PaymentFailure,
});

const artistStoreRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/store/$artistId',
  component: ArtistStorePage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  productsRoute,
  adminRoute,
  adminDashboardRoute,
  userManagementRoute,
  revenueRoute,
  artistDashboardRoute,
  artistRegistrationRoute,
  paymentSuccessRoute,
  paymentFailureRoute,
  artistStoreRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <StrictMode>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
          <Toaster />
        </QueryClientProvider>
      </ThemeProvider>
    </StrictMode>
  );
}
