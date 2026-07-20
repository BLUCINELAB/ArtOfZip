import * as THREE from 'three'
import type {
  AttentionSnapshot,
  Genome,
  QualityLevel,
  SystemState,
} from '../types'
import { fragmentShader, vertexShader } from './shaders'

const stateNumbers: Record<SystemState, number> = {
  DORMANT: 0,
  SENSING: 1,
  WITHDRAWING: 2,
  REVEALING: 3,
  REMEMBERING: 4,
  ABSENT: 5,
  DEFENSIVE: 6,
  QUIESCENT: 7,
  MUTATING: 8,
}

const qualityNumbers: Record<QualityLevel, number> = {
  reduced: 0,
  balanced: 0.5,
  high: 1,
}

export interface VisualFrame {
  time: number
  attention: AttentionSnapshot
  genome: Genome
  state: SystemState
  quality: QualityLevel
  pixelRatio: number
  absence: number
  reducedMotion: boolean
  highContrast: boolean
  memoryAnchor: { x: number; y: number }
}

export class VisualRenderer {
  private readonly renderer: THREE.WebGLRenderer
  private readonly scene = new THREE.Scene()
  private readonly camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
  private readonly material: THREE.ShaderMaterial
  private readonly geometry = new THREE.PlaneGeometry(2, 2)
  private readonly attentionData: Uint8Array
  private readonly attentionTexture: THREE.DataTexture
  private readonly canvas: HTMLCanvasElement

  constructor(canvas: HTMLCanvasElement, columns: number, rows: number) {
    this.canvas = canvas
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: false,
      powerPreference: 'high-performance',
    })
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    this.renderer.setClearColor(0x020303, 1)

    this.attentionData = new Uint8Array(columns * rows)
    this.attentionTexture = new THREE.DataTexture(
      this.attentionData,
      columns,
      rows,
      THREE.RedFormat,
      THREE.UnsignedByteType,
    )
    this.attentionTexture.minFilter = THREE.LinearFilter
    this.attentionTexture.magFilter = THREE.LinearFilter
    this.attentionTexture.generateMipmaps = false

    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(1, 1) },
        uPointer: { value: new THREE.Vector2(0.5, 0.5) },
        uMemoryAnchor: { value: new THREE.Vector2(0.23, 0.68) },
        uAttention: { value: this.attentionTexture },
        uPressure: { value: 0 },
        uStillness: { value: 0 },
        uAbsence: { value: 0 },
        uSeed: { value: 0.5 },
        uState: { value: 0 },
        uQuality: { value: 0.5 },
        uMotion: { value: 1 },
        uContrast: { value: 1 },
        uMatterDensity: { value: 0.64 },
        uDepth: { value: 0.81 },
        uOrganic: { value: 0.57 },
        uPeripheral: { value: 0.73 },
        uGrain: { value: 0.31 },
      },
    })
    this.scene.add(new THREE.Mesh(this.geometry, this.material))
  }

  render(frame: VisualFrame) {
    const width = Math.max(1, this.canvas.clientWidth)
    const height = Math.max(1, this.canvas.clientHeight)
    this.renderer.setPixelRatio(frame.pixelRatio)
    if (this.canvas.width !== Math.floor(width * frame.pixelRatio)
      || this.canvas.height !== Math.floor(height * frame.pixelRatio)) {
      this.renderer.setSize(width, height, false)
    }

    frame.attention.heat.forEach((value, index) => {
      this.attentionData[index] = Math.round(Math.min(1, value) * 255)
    })
    this.attentionTexture.needsUpdate = true

    const uniforms = this.material.uniforms
    uniforms.uTime!.value = frame.time
    uniforms.uResolution!.value.set(width * frame.pixelRatio, height * frame.pixelRatio)
    uniforms.uPointer!.value.set(frame.attention.pointer.x, frame.attention.pointer.y)
    uniforms.uMemoryAnchor!.value.set(frame.memoryAnchor.x, frame.memoryAnchor.y)
    uniforms.uPressure!.value = frame.attention.observationPressure
    uniforms.uStillness!.value = Math.min(1, frame.attention.stillness / 11)
    uniforms.uAbsence!.value = Math.min(1, frame.absence / 120)
    uniforms.uSeed!.value = frame.genome.seed
    uniforms.uState!.value = stateNumbers[frame.state]
    uniforms.uQuality!.value = qualityNumbers[frame.quality]
    uniforms.uMotion!.value = frame.reducedMotion ? 0.08 : 1
    uniforms.uContrast!.value = frame.highContrast ? 1.55 : 1
    uniforms.uMatterDensity!.value = frame.genome.values.matterDensity
    uniforms.uDepth!.value = frame.genome.values.apparentDepth
    uniforms.uOrganic!.value = frame.genome.values.organicDeformation
    uniforms.uPeripheral!.value = frame.genome.values.peripheralComplexity
    uniforms.uGrain!.value = frame.genome.values.grainIntensity

    this.renderer.render(this.scene, this.camera)
  }

  dispose() {
    this.geometry.dispose()
    this.material.dispose()
    this.attentionTexture.dispose()
    this.renderer.dispose()
  }
}
