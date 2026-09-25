# Paradox Community Site

Sito pubblico autonomo di **Paradox Project [Beta]**. Non contiene la console staff e non richiede le credenziali OAuth della console.

## Avvio locale

```bash
npm install
cp .env.example .env
npm start
```

Apri `http://localhost:8788`.

## Stato Discord e giocatori

`GET /api/status` legge i conteggi pubblici dall'invito Discord. Il bot Paradox può aggiornare esclusivamente il numero dei giocatori con:

```bash
curl -X POST https://TUO-HOST-NO-IP/api/bot/status \
  -H "Authorization: Bearer TOKEN_CONFIGURATO" \
  -H "Content-Type: application/json" \
  -d '{"connected":true,"online":12,"capacity":25,"map":"Facility"}'
```

Il sito non pubblica nomi, Steam ID, ruoli o dati staff.

## Linux + No-IP

1. Crea un hostname No-IP che punti all'indirizzo pubblico della rete Linux.
2. Inoltra sul router le porte TCP 80 e 443 verso il PC Linux.
3. Installa Node.js 20+, Caddy e il client No-IP/DDNS scelto.
4. Copia il progetto in `~/paradox-site`, esegui `npm ci` e crea `.env` da `.env.example`.
5. Sostituisci il dominio in `deploy/Caddyfile.example`, copialo in `/etc/caddy/Caddyfile` e ricarica Caddy.
6. Copia `deploy/paradox-site.service` in `~/.config/systemd/user/`, quindi esegui:

```bash
systemctl --user daemon-reload
systemctl --user enable --now paradox-site
sudo loginctl enable-linger "$USER"
```

Caddy gestisce automaticamente HTTPS quando l'hostname No-IP risolve sull'IP pubblico e le porte 80/443 sono raggiungibili.
