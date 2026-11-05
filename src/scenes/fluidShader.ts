// Fluid gradient: domain-warped fractal noise (fbm) mixing three chapter colours over a dark base.
// The quad is drawn straight in clip space, so no camera math is involved.

export const fluidVertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`

export const fluidFragment = /* glsl */ `
precision highp float;
uniform float uTime;
uniform vec2 uMouse;      // pointer in -1..1, already eased on the CPU
uniform float uScroll;    // 0..1 through the section: the field drifts as the visitor scrolls
uniform float uIntensity; // 0 shows only the base, 1 the full mix (the contact section runs it low)
uniform vec2 uRes;
uniform vec3 uBase;
uniform vec3 uC1;
uniform vec3 uC2;
uniform vec3 uC3;
varying vec2 vUv;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = m * p;
    a *= 0.5;
  }
  return v;
}

void main() {
  float aspect = uRes.x / max(uRes.y, 1.0);
  vec2 p = (vUv - 0.5) * vec2(aspect, 1.0);

  // the ink bulges away from the pointer, strongest right under it
  vec2 m = uMouse * 0.5 * vec2(aspect, 1.0);
  vec2 toM = p - m;
  p += toM * 0.22 * exp(-dot(toM, toM) * 5.0);

  float t = uTime * 0.045;
  vec2 q = vec2(fbm(p * 1.5 + t), fbm(p * 1.5 + vec2(5.2, 1.3) - t));
  vec2 r = vec2(fbm(p * 1.3 + 2.0 * q + vec2(1.7, 9.2) + t * 1.3),
                fbm(p * 1.3 + 2.0 * q + vec2(8.3, 2.8) - t));
  float n = fbm(p * 1.1 + 2.4 * r + vec2(0.0, uScroll * 1.2));

  vec3 col = mix(uBase, uC1, smoothstep(0.25, 0.8, n));
  col = mix(col, uC2, smoothstep(0.4, 0.95, length(q)) * 0.75);
  col = mix(col, uC3, smoothstep(0.55, 1.0, r.x) * 0.6);
  col = mix(uBase, col, uIntensity);

  // darker edges and bottom keep the white text on top at AA contrast
  vec2 v = (vUv - 0.5) * vec2(1.15, 1.0);
  col *= 1.0 - 0.5 * smoothstep(0.3, 1.0, length(v));
  col *= mix(0.62, 1.0, smoothstep(0.0, 0.55, vUv.y));

  gl_FragColor = vec4(col, 1.0);
}
`
