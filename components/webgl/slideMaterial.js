import * as THREE from 'three'

// A textured plane that bends away from the centre of the rail, shears with
// scrub velocity, and picks up a chromatic edge when it moves fast.
// Shared by the hero rail and the fullscreen carousel viewer.

export const vertexShader = /* glsl */ `
  uniform float uOffset;    // -1 .. 1, position across the rail
  uniform float uVelocity;  // signed scrub velocity
  uniform float uCurve;     // how hard the rail bends back
  uniform float uTime;

  varying vec2  vUv;
  varying float vFade;

  void main() {
    vUv = uv;

    vec3 p = position;

    // The rail is an arc: slides further from centre sit further back
    // and rotate slightly to face the viewer.
    float d = uOffset;
    p.z -= uCurve * d * d;
    p.x += d * uCurve * 0.10;

    // Velocity shears the plane, so a fast flick feels like paper catching air.
    float bend = sin(uv.x * 3.14159265) * uVelocity;
    p.z += bend * 0.30;
    p.y += bend * 0.04 * (uv.y - 0.5);

    // A very slow idle drift keeps the rail alive when nothing is happening.
    p.z += sin(uTime * 0.55 + d * 2.2) * 0.012;

    vFade = 1.0 - smoothstep(0.55, 1.5, abs(d));

    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`

export const fragmentShader = /* glsl */ `
  precision highp float;

  uniform sampler2D uTexture;
  uniform float uPlaneAspect;
  uniform float uTexAspect;
  uniform float uVelocity;
  uniform float uOpacity;
  uniform float uTime;
  uniform vec3  uGround;

  varying vec2  vUv;
  varying float vFade;

  // Crop to fill, the same rule as CSS object-fit: cover.
  vec2 coverUv(vec2 uv, float plane, float tex) {
    vec2 scale = plane > tex
      ? vec2(1.0, tex / plane)
      : vec2(plane / tex, 1.0);
    return (uv - 0.5) * scale + 0.5;
  }

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  void main() {
    vec2 uv = coverUv(vUv, uPlaneAspect, uTexAspect);

    // Chromatic split scales with velocity and pushes outward from centre.
    float amt = clamp(abs(uVelocity), 0.0, 1.2) * 0.010;
    vec2 dir = normalize(vUv - 0.5 + 1e-5);

    vec3 col;
    col.r = texture2D(uTexture, uv + dir * amt).r;
    col.g = texture2D(uTexture, uv).g;
    col.b = texture2D(uTexture, uv - dir * amt).b;

    // Fine grain, matched to the paper ground rather than pure white noise.
    float g = hash(gl_FragCoord.xy + fract(uTime) * 100.0);
    col += (g - 0.5) * 0.030;

    // Slides at the edge of the rail sink toward the page ground.
    col = mix(uGround, col, clamp(vFade, 0.0, 1.0) * 0.82 + 0.18);

    float alpha = uOpacity * clamp(vFade * 1.35, 0.0, 1.0);
    if (alpha <= 0.001) discard;

    gl_FragColor = vec4(col, alpha);
  }
`

export function makeSlideMaterial(texture, groundHex = '#F2EEE5') {
  const image = texture.image
  const texAspect = image ? image.width / image.height : 1

  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true,
    uniforms: {
      uTexture: { value: texture },
      uPlaneAspect: { value: 1 },
      uTexAspect: { value: texAspect },
      uOffset: { value: 0 },
      uVelocity: { value: 0 },
      uCurve: { value: 0.55 },
      uOpacity: { value: 1 },
      uTime: { value: 0 },
      uGround: { value: new THREE.Color(groundHex) },
    },
  })
}
