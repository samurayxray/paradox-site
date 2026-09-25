const menuButton = document.querySelector('.menu-button')
const navigation = document.querySelector('nav')

menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true'
  menuButton.setAttribute('aria-expanded', String(open))
  navigation?.classList.toggle('open', open)
})

navigation?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  menuButton?.setAttribute('aria-expanded', 'false')
  navigation.classList.remove('open')
}))

async function updateStatus() {
  try {
    const response = await fetch('https://discord.com/api/v10/invites/AxrmbN5Ygr?with_counts=true', {
      headers: { Accept: 'application/json' },
    })
    if (!response.ok) throw new Error(`Status ${response.status}`)
    const status = await response.json()
    document.querySelector('[data-discord-online]').textContent = status.approximate_presence_count ?? '—'
    document.querySelector('[data-discord-members]').textContent = status.approximate_member_count ?? '—'
  } catch {
    document.querySelector('[data-discord-online]').textContent = '—'
    document.querySelector('[data-discord-members]').textContent = '—'
  }
}

updateStatus()
setInterval(updateStatus, 60_000)
