import { Suspense, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import {
  MathUtils,
  SRGBColorSpace,
  Texture,
  TextureLoader,
  type Group,
  type Mesh,
  type MeshBasicMaterial,
} from 'three'
import type { MotionValue } from 'motion/react'
import { CanvasBoundary } from '../components/CanvasBoundary'
import { shelfLayout } from '../lib/shelfLayout'

const COVER_SIZE: [number, number] = [2, 3] // 2:3 covers
const BACKDROP_Z = -7
const CAMERA_Z = 8
const FOV = 40
const MAX_TILT = 0.06 // rad of pointer parallax
const BACKDROP_TINT = '#8d8d96' // dims the backdrop so the covers stay the focus
const FLAT = '#1c1d24' // stand-in for a cover that failed to load

const clamp01 = (n: number) => Math.min(1, Math.max(0, n))

const clampIndex = (f: number, count: number) =>
  Math.min(Math.max(Number.isFinite(f) ? f : 0, 0), Math.max(count - 1, 0))

type SetMat = (index: number, m: MeshBasicMaterial | null) => void

function TexturedCover({ url, index, setMat }: { url: string; index: number; setMat: SetMat }) {
  const map = useTexture(url)
  return (
    <mesh>
      <planeGeometry args={COVER_SIZE} />
      <meshBasicMaterial ref={(m) => setMat(index, m)} map={map} transparent toneMapped={false} />
    </mesh>
  )
}

function FlatCover({ index, setMat }: { index: number; setMat: SetMat }) {
  return (
    <mesh>
      <planeGeometry args={COVER_SIZE} />
      <meshBasicMaterial ref={(m) => setMat(index, m)} color={FLAT} transparent toneMapped={false} />
    </mesh>
  )
}

/** Backdrop textures for the active chapter and its two neighbours only; the rest are disposed. */
function useBackdropStore(urls: string[], active: number) {
  const store = useRef(new Map<string, Texture | 'loading' | 'failed'>())
  const [, bump] = useReducer((n: number) => n + 1, 0)

  useEffect(() => {
    const map = store.current
    const want = new Set([active - 1, active, active + 1].map((i) => urls[i]).filter(Boolean))
    for (const [url, value] of map) {
      if (want.has(url)) continue
      if (value instanceof Texture) value.dispose()
      map.delete(url)
    }
    const loader = new TextureLoader()
    for (const url of want) {
      if (map.has(url)) continue
      map.set(url, 'loading')
      loader.load(
        url,
        (tex) => {
          if (map.get(url) !== 'loading') return tex.dispose() // evicted or replaced while loading
          tex.colorSpace = SRGBColorSpace
          map.set(url, tex)
          bump()
        },
        undefined,
        () => {
          // missing image: no plane is drawn, so the page colour shows through
          if (map.get(url) === 'loading') map.set(url, 'failed')
        },
      )
    }
  }, [urls, active])

  useEffect(() => {
    const map = store.current
    return () => {
      for (const value of map.values()) if (value instanceof Texture) value.dispose()
      map.clear()
    }
  }, [])

  return store
}

function Shelf({ covers, backdrops, progress }: { covers: string[]; backdrops: string[]; progress: MotionValue<number> }) {
  const root = useRef<Group>(null)
  const slots = useRef<(Group | null)[]>([])
  const mats = useRef<(MeshBasicMaterial | null)[]>([])
  const setMat: SetMat = (i, m) => {
    mats.current[i] = m
  }
  const back = useRef<Group>(null)
  const low = useRef<Mesh>(null)
  const high = useRef<Mesh>(null)
  const [active, setActive] = useState(() => Math.round(clampIndex(progress.get(), covers.length)))
  const textures = useBackdropStore(backdrops, active)
  const viewSize = useThree((s) => s.size)

  const backdropScale = useMemo(() => {
    const h = 2 * (CAMERA_Z - BACKDROP_Z) * Math.tan(MathUtils.degToRad(FOV / 2))
    const w = h * (viewSize.width / Math.max(viewSize.height, 1))
    return Math.max(h / 9, w / 16) * 1.12 // cover the view, with margin for the parallax shift
  }, [viewSize.width, viewSize.height])

  useFrame((state, delta) => {
    const f = clampIndex(progress.get(), covers.length)

    const nextActive = Math.round(f)
    if (nextActive !== active) setActive(nextActive) // re-renders only when the chapter changes, never per frame

    // Narrow screens see less sideways: tighten the spacing and shrink the focused cover so neighbours stay in frame.
    const aspect = viewSize.width / Math.max(viewSize.height, 1)
    const xFit = Math.min(1, aspect / 1.4)
    const sFit = aspect < 1 ? 0.55 + aspect * 0.2 : Math.min(1, 0.55 + aspect * 0.5)
    // On portrait screens the text takes the lower half, so the shelf moves up to stay above it,
    // but never so far that the focused cover's top edge leaves the view.
    const halfH = Math.tan(MathUtils.degToRad(FOV / 2)) * CAMERA_Z
    const yFit = Math.min(Math.max(0, 1 - aspect) * 2.2, Math.max(0, halfH - COVER_SIZE[1] / 2 * 1.7 * sFit))
    // The credits have no cover: let the shelf leave instead of hanging behind the closing text.
    const leaving = 1 - clamp01(f - (covers.length - 2))
    shelfLayout(covers.length, f).forEach((it, i) => {
      const g = slots.current[i]
      if (!g) return
      g.position.set(it.x * xFit, yFit, it.z)
      g.rotation.y = it.rotY
      g.scale.setScalar(it.scale * sFit)
      const m = mats.current[i]
      if (m) m.opacity = it.opacity * leaving
    })

    const shelf = root.current
    if (shelf) {
      shelf.rotation.y = MathUtils.damp(shelf.rotation.y, state.pointer.x * MAX_TILT, 3, delta)
      shelf.rotation.x = MathUtils.damp(shelf.rotation.x, -state.pointer.y * MAX_TILT, 3, delta)
    }

    const bg = back.current
    if (bg) {
      bg.position.x = MathUtils.damp(bg.position.x, -state.pointer.x * 0.4, 3, delta)
      bg.position.y = MathUtils.damp(bg.position.y, -state.pointer.y * 0.25, 3, delta)
    }

    // crossfade: floor(f) backdrop underneath, ceil(f) backdrop on top at opacity f - floor(f)
    const lo = Math.floor(f)
    const hi = Math.ceil(f)
    // the credits have no backdrop: fade the last one out instead of holding it under the closing text
    const hiHasTexture = textures.current.get(backdrops[hi] ?? '') instanceof Texture
    const layers = [
      [low.current, lo, hi === lo || hiHasTexture ? 1 : 1 - (f - lo)],
      [high.current, hi, f - lo],
    ] as const
    for (const [mesh, index, opacity] of layers) {
      if (!mesh) continue
      const mat = mesh.material as MeshBasicMaterial
      const stored = textures.current.get(backdrops[index] ?? '')
      const tex = stored instanceof Texture ? stored : null
      if (mat.map !== tex) {
        mat.map = tex
        mat.needsUpdate = true
      }
      mat.opacity = opacity
      mesh.visible = tex !== null
    }
  })

  return (
    <>
      <group ref={back} position={[0, 0, BACKDROP_Z]} scale={backdropScale}>
        <mesh ref={low} visible={false}>
          <planeGeometry args={[16, 9]} />
          <meshBasicMaterial color={BACKDROP_TINT} transparent depthWrite={false} toneMapped={false} />
        </mesh>
        <mesh ref={high} visible={false} renderOrder={1}>
          <planeGeometry args={[16, 9]} />
          <meshBasicMaterial color={BACKDROP_TINT} transparent depthWrite={false} toneMapped={false} />
        </mesh>
      </group>
      <group ref={root}>
        {covers.map((url, i) =>
          url ? (
            <group key={`${i}-${url}`} ref={(g) => void (slots.current[i] = g)}>
              <CanvasBoundary fallback={<FlatCover index={i} setMat={setMat} />}>
                <Suspense fallback={null}>
                  <TexturedCover url={url} index={i} setMat={setMat} />
                </Suspense>
              </CanvasBoundary>
            </group>
          ) : null,
        )}
      </group>
    </>
  )
}

export default function ShelfScene({
  covers,
  backdrops,
  progress,
}: {
  covers: string[]
  backdrops: string[]
  progress: MotionValue<number>
}) {
  // stop rendering while the tab is hidden
  const [visible, setVisible] = useState(() => document.visibilityState !== 'hidden')
  useEffect(() => {
    const on = () => setVisible(document.visibilityState !== 'hidden')
    document.addEventListener('visibilitychange', on)
    return () => document.removeEventListener('visibilitychange', on)
  }, [])

  const dpr: [number, number] = window.innerWidth < 768 ? [1, 1.25] : [1, 1.5]

  return (
    <Canvas
      dpr={dpr}
      frameloop={visible ? 'always' : 'never'}
      // the canvas layer has pointer-events:none, so pointer parallax listens on the document instead
      eventSource={document.documentElement}
      eventPrefix="client"
      camera={{ position: [0, 0, CAMERA_Z], fov: FOV }}
      gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
    >
      <Shelf covers={covers} backdrops={backdrops} progress={progress} />
    </Canvas>
  )
}
