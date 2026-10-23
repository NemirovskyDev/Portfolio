import { useState } from 'react'
import { covers, projects } from './data/projects'
import { Home } from './pages/Home'
import { MorphTransition } from './components/MorphTransition/MorphTransition'
import { ProfileGate } from './components/ProfileGate/ProfileGate'
import { AppStateProvider, useAppState } from './state/AppState'

function Screens() {
  const { profile, setProfile } = useAppState()
  const [choosing, setChoosing] = useState(false)
  const [morphing, setMorphing] = useState(false)

  if (!profile || choosing) {
    return (
      <ProfileGate
        onChoose={(p) => {
          setProfile(p)
          setChoosing(false)
          setMorphing(true)
        }}
      />
    )
  }
  return (
    <>
      <Home profile={profile} projects={projects} onSwitchProfile={() => setChoosing(true)} />
      {morphing && <MorphTransition covers={covers} onDone={() => setMorphing(false)} />}
    </>
  )
}

export default function App() {
  return (
    <AppStateProvider>
      <Screens />
    </AppStateProvider>
  )
}
