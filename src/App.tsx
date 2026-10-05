import { BrowserRouter } from 'react-router-dom'
import { DIProvider } from './infrastructure/di/DIProvider'
import { NotificationProvider } from './presentation/context/NotificationProvider'
import { SelectedRegionProvider } from './presentation/context/SelectedRegionProvider'
import { ThemeProvider } from './presentation/context/ThemeProvider'
import { AppRoutes } from './presentation/routes/AppRoutes'

export default function App() {
  return (
    <DIProvider>
      <ThemeProvider>
        <SelectedRegionProvider>
          <NotificationProvider>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </NotificationProvider>
        </SelectedRegionProvider>
      </ThemeProvider>
    </DIProvider>
  )
}
