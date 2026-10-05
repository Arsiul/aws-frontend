import { lazy, Suspense, type ReactNode } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { LoadingState } from '../components/common/AsyncState'

// Route-level code splitting: Infrastructure (react-simple-maps + d3-geo) and Costs
// (recharts) are the heaviest pages — they only ship to the browser once visited.
const Dashboard = lazy(() => import('../pages/Dashboard').then((m) => ({ default: m.Dashboard })))
const Planning = lazy(() => import('../pages/Planning').then((m) => ({ default: m.Planning })))
const Costs = lazy(() => import('../pages/Costs').then((m) => ({ default: m.Costs })))
const Infrastructure = lazy(() =>
  import('../pages/Infrastructure').then((m) => ({ default: m.Infrastructure })),
)
const Security = lazy(() => import('../pages/Security').then((m) => ({ default: m.Security })))
const Network = lazy(() => import('../pages/Network').then((m) => ({ default: m.Network })))
const Services = lazy(() => import('../pages/Services').then((m) => ({ default: m.Services })))
const ServiceDetail = lazy(() => import('../pages/ServiceDetail').then((m) => ({ default: m.ServiceDetail })))

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Page><Dashboard /></Page>} />
        <Route path="/planning" element={<Page><Planning /></Page>} />
        <Route path="/costs" element={<Page><Costs /></Page>} />
        <Route path="/infrastructure" element={<Page><Infrastructure /></Page>} />
        <Route path="/security" element={<Page><Security /></Page>} />
        <Route path="/network" element={<Page><Network /></Page>} />
        <Route path="/services" element={<Page><Services /></Page>} />
        <Route path="/services/:serviceId" element={<Page><ServiceDetail /></Page>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  )
}

function Page({ children }: { children: ReactNode }) {
  const location = useLocation()
  return (
    <Suspense fallback={<LoadingState label="Cargando módulo…" />}>
      <div key={location.pathname} className="animate-fadeInUp">
        {children}
      </div>
    </Suspense>
  )
}
