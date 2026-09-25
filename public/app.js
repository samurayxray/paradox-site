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
    const response = await fetch('/api/status', { headers: { Accept: 'application/json' } })
    if (!response.ok) throw new Error(`Status ${response.status}`)
    const status = await response.json()
    document.querySelector('[data-discord-online]').textContent = status.discord.online
    document.querySelector('[data-discord-members]').textContent = status.discord.members
    document.querySelector('[data-game-players]').textContent = status.game.connected
      ? `${status.game.online}${status.game.capacity ? ` / ${status.game.capacity}` : ''}`
      : 'In attesa'
  } catch {
    document.querySelector('[data-discord-online]').textContent = '11'
    document.querySelector('[data-discord-members]').textContent = '18'
  }
}

updateStatus()
setInterval(updateStatus, 60_000)
