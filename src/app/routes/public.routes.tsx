import type { RouteObject } from 'react-router-dom';
import { PublicLayout } from '@/app/layouts/PublicLayout';
import { HomePage } from '@/pages/public/HomePage';

// Public (unauthenticated-friendly) route subtree.
export const publicRoutes: RouteObject = {
  element: <PublicLayout />,
  children: [{ index: true, element: <HomePage /> }],
};
