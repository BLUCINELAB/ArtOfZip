import { describe, expect, it } from 'vitest'
import { selectTypographyEvent } from './TypographyLayer'

describe('TypographyLayer', () => {
  it('keeps text absent during the opening darkness', () => {
    expect(selectTypographyEvent(3, 'DORMANT', 1)).toBe('')
  })

  it('reveals the first law only after eight seconds', () => {
    expect(selectTypographyEvent(9, 'SENSING', 1)).toBe('Ciò che guardi si ritira.')
  })

  it('allows absence to surface as a rare memory event', () => {
    expect(selectTypographyEvent(25, 'REMEMBERING', 2)).toContain('assenza')
  })
})
