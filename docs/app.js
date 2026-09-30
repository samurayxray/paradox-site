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

async function updateStatus() {
  const onlineElement = document.querySelector('[data-discord-online]')
  const membersElement = document.querySelector('[data-discord-members]')
  if (!onlineElement || !membersElement) return

  try {
    const response = await fetch('https://discord.com/api/v10/invites/AxrmbN5Ygr?with_counts=true', {
      headers: { Accept: 'application/json' },
    })
    if (!response.ok) throw new Error(`Status ${response.status}`)
    const status = await response.json()
    onlineElement.textContent = status.approximate_presence_count ?? '—'
    membersElement.textContent = status.approximate_member_count ?? '—'
  } catch {
    onlineElement.textContent = '—'
    membersElement.textContent = '—'
  }
}

updateStatus()
setInterval(updateStatus, 60_000)
