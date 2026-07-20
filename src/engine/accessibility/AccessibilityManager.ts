export class AccessibilityManager {
  private motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  private contrastQuery = window.matchMedia('(prefers-contrast: more)')

  get reducedMotion() {
    return this.motionQuery.matches
  }

  get highContrast() {
    return this.contrastQuery.matches
  }

  subscribe(callback: () => void) {
    this.motionQuery.addEventListener('change', callback)
    this.contrastQuery.addEventListener('change', callback)
    return () => {
      this.motionQuery.removeEventListener('change', callback)
      this.contrastQuery.removeEventListener('change', callback)
    }
  }
}
