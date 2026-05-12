import { AppProvider, useApp } from './context/AppContext'
import Layout from './components/Layout/Layout'
import SignIn from './pages/SignIn/SignIn'

function AppContent() {
  const { isLoggedIn } = useApp()
  return isLoggedIn ? <Layout /> : <SignIn />
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}
