import './style.css'
import * as THREE from 'three'

const app = document.querySelector<HTMLDivElement>('#app')

if (!app) {
  throw new Error('Missing #app container')
}

const container = app

type ViewportPreset = {
  label: string
  width: number
  height: number
}

const viewportPresets: ViewportPreset[] = [
  { label: 'Phone Portrait', width: 390, height: 844 },
  { label: 'Phone Landscape', width: 844, height: 390 },
  { label: 'Tablet Landscape', width: 1024, height: 768 },
]

const DEV_VIEWPORT_OVERLAY_ENABLED = false

let activeViewportPreset: ViewportPreset | null = null
let devViewportBadge: HTMLDivElement | null = null

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(
  75,
  1,
  0.1,
  1000,
)
camera.position.z = 2

const renderer = new THREE.WebGLRenderer({ antialias: true })
container.appendChild(renderer.domElement)

const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshNormalMaterial()
const cube = new THREE.Mesh(geometry, material)
scene.add(cube)

function resizeRendererToApp() {
  const w = container.clientWidth
  const h = container.clientHeight

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(w, h, false)
  camera.aspect = w / h
  camera.updateProjectionMatrix()
  updateDevViewportBadge()
}

function updateDevViewportBadge() {
  if (!import.meta.env.DEV || !devViewportBadge) {
    return
  }

  const width = Math.max(container.clientWidth, 1)
  const height = Math.max(container.clientHeight, 1)
  const modeLabel = activeViewportPreset?.label ?? 'Responsive'
  devViewportBadge.textContent = `${modeLabel} ${width}x${height}`
}

function applyDevViewportPreset(preset: ViewportPreset | null) {
  if (!import.meta.env.DEV || !DEV_VIEWPORT_OVERLAY_ENABLED) {
    return
  }

  activeViewportPreset = preset

  if (!preset) {
    document.body.classList.remove('dev-viewport-active')
    container.style.removeProperty('width')
    container.style.removeProperty('height')
    resizeRendererToApp()
    return
  }

  document.body.classList.add('dev-viewport-active')
  container.style.width = `${preset.width}px`
  container.style.height = `${preset.height}px`
  resizeRendererToApp()
}

function createDevViewportOverlay() {
  if (!import.meta.env.DEV || !DEV_VIEWPORT_OVERLAY_ENABLED) {
    return
  }

  const overlay = document.createElement('div')
  overlay.className = 'dev-viewport-overlay'

  const title = document.createElement('div')
  title.className = 'dev-viewport-title'
  title.textContent = 'Viewport'
  overlay.appendChild(title)

  const badge = document.createElement('div')
  badge.className = 'dev-viewport-badge'
  container.appendChild(badge)
  devViewportBadge = badge

  const buttonRow = document.createElement('div')
  buttonRow.className = 'dev-viewport-buttons'
  overlay.appendChild(buttonRow)

  let activeButton: HTMLButtonElement | null = null

  const setActiveButton = (button: HTMLButtonElement) => {
    activeButton?.classList.remove('is-active')
    activeButton = button
    activeButton.classList.add('is-active')
  }

  const responsiveButton = document.createElement('button')
  responsiveButton.type = 'button'
  responsiveButton.textContent = 'Responsive'
  responsiveButton.className = 'dev-viewport-button is-active'
  responsiveButton.addEventListener('click', () => {
    setActiveButton(responsiveButton)
    applyDevViewportPreset(null)
  })
  buttonRow.appendChild(responsiveButton)
  activeButton = responsiveButton

  for (const preset of viewportPresets) {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'dev-viewport-button'
    button.textContent = `${preset.label} (${preset.width}x${preset.height})`
    button.addEventListener('click', () => {
      setActiveButton(button)
      applyDevViewportPreset(preset)
    })
    buttonRow.appendChild(button)
  }

  document.body.appendChild(overlay)
  updateDevViewportBadge()
}

window.addEventListener('resize', resizeRendererToApp)

if (typeof ResizeObserver !== 'undefined') {
  const observer = new ResizeObserver(() => {
    resizeRendererToApp()
  })
  observer.observe(container)
}

createDevViewportOverlay()
resizeRendererToApp()

function animate() {
  cube.rotation.x += 0.01
  cube.rotation.y += 0.01

  renderer.render(scene, camera)
  requestAnimationFrame(animate)
}

animate()
