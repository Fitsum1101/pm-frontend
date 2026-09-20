import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from '@/app/layouts/RootLayout';
import { NotFound } from '@/components/NotFound';
import { publicRoutes } from './public.routes';
import { authRoutes } from './auth.routes';
import { privateRoutes } from './private.routes';

// The single, centralized route table. Layouts compose via nested routes;
// guards are wrapper components, not scattered effects.
export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [publicRoutes, authRoutes, privateRoutes, { path: '*', element: <NotFound /> }],
  },
]);
