import { projects } from './data/projects'
import { Home } from './pages/Home'
import { AppStateProvider } from './state/AppState'

export default function App() {
  return (
    <AppStateProvider>
      <Home projects={projects} />
    </AppStateProvider>
  )
}
