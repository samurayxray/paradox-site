const menuButton = document.querySelector('.menu-button')
const navigation = document.querySelector('.site-header nav')

menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true'
  menuButton.setAttribute('aria-expanded', String(open))
  menuButton.setAttribute('aria-label', open ? 'Chiudi menu' : 'Apri menu')
  navigation?.classList.toggle('open', open)
})

navigation?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  menuButton?.setAttribute('aria-expanded', 'false')
  menuButton?.setAttribute('aria-label', 'Apri menu')
  navigation.classList.remove('open')
}))

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape' || menuButton?.getAttribute('aria-expanded') !== 'true') return
  menuButton.setAttribute('aria-expanded', 'false')
  menuButton.setAttribute('aria-label', 'Apri menu')
  navigation?.classList.remove('open')
  menuButton.focus()
})

const header = document.querySelector('.site-header')

const updateHeader = () => {
  header?.classList.toggle('scrolled', window.scrollY > 36)
}

updateHeader()
window.addEventListener('scroll', updateHeader, { passive: true })

const revealSections = document.querySelectorAll('.reveal')

if (revealSections.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.body.classList.add('js-ready')
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return
      entry.target.classList.add('is-visible')
      observer.unobserve(entry.target)
    })
  }, { rootMargin: '0px 0px -10%', threshold: .12 })

  revealSections.forEach((section) => observer.observe(section))
}
