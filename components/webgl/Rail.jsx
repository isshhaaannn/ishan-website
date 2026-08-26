'use client'

import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { makeSlideMaterial } from './slideMaterial'

// Reads the live page ground so the rail dissolves into the paper in both themes.
function groundColor() {
  if (typeof window === 'undefined') return '#F2EEE5'
  const v = getComputedStyle(document.documentElement).getPropertyValue('--shell')
  return v.trim() || '#F2EEE5'
}

function Slides({ slides, gap, progressRef, velocityRef, planeH, quality }) {
  const group = useRef(null)
  const { viewport } = useThree()
  const ground = useMemo(() => groundColor(), [])

  // Textures load on demand; a slide stays invisible until its image is ready.
  const meshes = useMemo(() => {
    const loader = new THREE.TextureLoader()
    return slides.map((slide) => {
      const aspect = slide.w / slide.h
      const h = planeH
      const w = h * aspect
      const mat = makeSlideMaterial(new THREE.Texture(), ground)
      mat.uniforms.uPlaneAspect.value = aspect
      mat.uniforms.uOpacity.value = 0

      loader.load(quality === 'full' ? slide.src : slide.thumb, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace
        tex.minFilter = THREE.LinearFilter
        tex.generateMipmaps = false
        mat.uniforms.uTexture.value = tex
        mat.uniforms.uTexAspect.value = tex.image.width / tex.image.height
        mat.userData.ready = true
      })

      return { slide, w, h, mat }
    })
  }, [slides, planeH, ground, quality])

  useEffect(() => {
    return () => {
      for (const m of meshes) {
        m.mat.uniforms.uTexture.value?.dispose?.()
        m.mat.dispose()
      }
    }
  }, [meshes])

  // Slide centres laid out left to right, so we can map progress to world X.
  const layout = useMemo(() => {
    let x = 0
    const out = meshes.map((m) => {
      const centre = x + m.w / 2
      x += m.w + gap
      return { ...m, centre }
    })
    return { items: out, total: Math.max(x - gap, 0.001) }
  }, [meshes, gap])

  useFrame((state, delta) => {
    if (!group.current) return

    const p = progressRef.current
    const v = velocityRef.current
    const t = state.clock.elapsedTime

    // Progress 0..1 walks the rail from the first slide centred to the last.
    const first = layout.items[0]
    const last = layout.items[layout.items.length - 1]
    if (!first || !last) return

    const travel = last.centre - first.centre
    const focus = first.centre + travel * p
    group.current.position.x = -focus

    const halfW = viewport.width / 2

    for (const item of layout.items) {
      const dx = item.centre - focus
      const offset = dx / Math.max(halfW, 0.001)
      const u = item.mat.uniforms
      u.uOffset.value = offset
      u.uVelocity.value = THREE.MathUtils.damp(u.uVelocity.value, v, 6, delta)
      u.uTime.value = t
      const target = item.mat.userData.ready ? 1 : 0
      u.uOpacity.value = THREE.MathUtils.damp(u.uOpacity.value, target, 4, delta)
    }
  })

  return (
    <group ref={group}>
      {layout.items.map((item, i) => (
        <mesh key={i} position={[item.centre, 0, 0]}>
          <planeGeometry args={[item.w, item.h, 24, 18]} />
          <primitive object={item.mat} attach="material" />
        </mesh>
      ))}
    </group>
  )
}

export default function Rail({
  slides,
  progressRef,
  velocityRef,
  planeH = 3.1,
  gap = 0.42,
  className,
  quality = 'thumb',
  cameraZ = 6.2,
  dpr = [1, 1.75],
}) {
  if (!slides?.length) return null

  return (
    <Canvas
      className={className}
      dpr={dpr}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      camera={{ fov: 42, position: [0, 0, cameraZ] }}
      style={{ touchAction: 'pan-y' }}
    >
      <Slides
        slides={slides}
        gap={gap}
        planeH={planeH}
        quality={quality}
        progressRef={progressRef}
        velocityRef={velocityRef}
      />
    </Canvas>
  )
}
