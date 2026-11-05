import { useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Color, MathUtils, type ShaderMaterial } from 'three'
import type { FluidColors } from '../lib/palette'
import type { Progress } from '../lib/progress'
import { fluidFragment, fluidVertex } from './fluidShader'

// The shader writes its colour straight to the screen with no colour-space step, so hand it sRGB values
// (three stores Color in linear space by default, which would come out too dark).
const srgb = (hex: string) => new Color(hex).convertLinearToSRGB()

type Props = {
  colors: FluidColors
  intensity: number
  /** 0..1 through the section; drifts the field with the scroll. */
  scroll?: Progress
  /** false stops the render loop (section off screen or tab hidden). */
  running: boolean
}

function Field({ colors, intensity, scroll }: Omit<Props, 'running'>) {
  const mat = useRef<ShaderMaterial>(null)
  const size = useThree((s) => s.size)
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: [0, 0] },
      uScroll: { value: 0 },
      uIntensity: { value: intensity },
      uRes: { value: [1, 1] },
      uBase: { value: srgb(colors.base) },
      uC1: { value: srgb(colors.c1) },
      uC2: { value: srgb(colors.c2) },
      uC3: { value: srgb(colors.c3) },
    }),
    // colours and intensity are fixed per section; a change remounts the material
    [colors.base, colors.c1, colors.c2, colors.c3, intensity],
  )

  useFrame((state, delta) => {
    const u = mat.current?.uniforms
    if (!u) return
    u.uTime.value += Math.min(delta, 0.1) // a long pause must not jump the flow
    const mouse = u.uMouse.value as number[]
    mouse[0] = MathUtils.damp(mouse[0], state.pointer.x, 2.5, delta)
    mouse[1] = MathUtils.damp(mouse[1], state.pointer.y, 2.5, delta)
    u.uScroll.value = MathUtils.damp(u.uScroll.value, scroll?.get() ?? 0, 4, delta)
    const res = u.uRes.value as number[]
    res[0] = size.width
    res[1] = size.height
  })

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial ref={mat} vertexShader={fluidVertex} fragmentShader={fluidFragment} uniforms={uniforms} depthTest={false} depthWrite={false} />
    </mesh>
  )
}

/** Full-bleed live gradient. Rendered at reduced resolution: the field is soft, so the GPU cost stays low. */
export default function FluidScene({ colors, intensity, scroll, running }: Props) {
  return (
    <Canvas
      dpr={0.5}
      frameloop={running ? 'always' : 'never'}
      // the canvas sits under the text with pointer-events:none, so the pointer is read on the document
      eventSource={document.documentElement}
      eventPrefix="client"
      gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
    >
      <Field colors={colors} intensity={intensity} scroll={scroll} />
    </Canvas>
  )
}
