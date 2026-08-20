document.documentElement.classList.add('js')

const figures = [...document.querySelectorAll('[data-reveal]')]

if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue
      entry.target.classList.add('is-visible')
      observer.unobserve(entry.target)
    }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 })

  figures.forEach((figure) => observer.observe(figure))
} else {
  figures.forEach((figure) => figure.classList.add('is-visible'))
}
