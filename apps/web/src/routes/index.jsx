import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import RunList from '../pages/runs/List';
import RunDetail from '../pages/runs/Detail';
import RunForm from '../pages/runs/Form';
import SettingsPage from '../pages/SettingsPage';
import NotFound from '../pages/NotFound';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Dashboard />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/runs",
    element: <RunList />,
  },
  {
    path: "/runs/new",
    element: <RunForm />,
  },
  {
    path: "/runs/:id",
    element: <RunDetail />,
  },
  {
    path: "/runs/:id/edit",
    element: <RunForm isEdit />,
  },
  {
    path: "/settings",
    element: <SettingsPage />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
