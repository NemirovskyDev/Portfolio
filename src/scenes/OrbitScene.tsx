import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import { MathUtils, type Group } from 'three'

const RADIUS = 4.4
const SIZE: [number, number] = [1.6, 2.4] // 2:3 covers

function Ring({ covers }: { covers: string[] }) {
  const textures = useTexture(covers)
  const group = useRef<Group>(null)

  useFrame((state, delta) => {
    const g = group.current
    if (!g) return
    // slow spin plus a gentle lean toward the pointer
    g.rotation.y += delta * 0.12
    g.rotation.x = MathUtils.damp(g.rotation.x, -state.pointer.y * 0.18, 3, delta)
    g.position.x = MathUtils.damp(g.position.x, state.pointer.x * 0.6, 3, delta)
  })

  return (
    <group ref={group} rotation={[0, 0, 0]}>
      {textures.map((map, i) => {
        const a = (i / textures.length) * Math.PI * 2
        return (
          <mesh key={covers[i]} position={[Math.sin(a) * RADIUS, 0, Math.cos(a) * RADIUS]} rotation={[0, a, 0]}>
            <planeGeometry args={SIZE} />
            <meshBasicMaterial map={map} transparent opacity={0.38} toneMapped={false} />
          </mesh>
        )
      })}
    </group>
  )
}

export default function OrbitScene({ covers }: { covers: string[] }) {
  // stop rendering while the tab is hidden
  const [visible, setVisible] = useState(() => document.visibilityState !== 'hidden')
  useEffect(() => {
    const on = () => setVisible(document.visibilityState !== 'hidden')
    document.addEventListener('visibilitychange', on)
    return () => document.removeEventListener('visibilitychange', on)
  }, [])

  return (
    <Canvas
      dpr={[1, 1.5]}
      frameloop={visible ? 'always' : 'never'}
      camera={{ position: [0, 0.6, 9.5], fov: 45 }}
      gl={{ antialias: true, powerPreference: 'low-power' }}
    >
      <Ring covers={covers} />
    </Canvas>
  )
}
