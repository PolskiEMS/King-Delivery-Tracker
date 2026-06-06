# King Delivery Tracker

Aplikacja webowa dla systemu monitorowania dostaw, tras i pracy kierowców.

## Docelowa struktura systemu

- **Panel logowania** — aktualnie przygotowany ekran startowy z rolami użytkowników.
- **Panel dyspozytora / firmowy** — przyszły dashboard tras, dostaw, kierowców i mapy.
- **Panel kierowcy** — przyszła wersja mobilna do obsługi trasy, dostaw i potwierdzeń.
- **Baza danych PostgreSQL** — docelowo Supabase, Neon albo Railway.

## Stack technologiczny

### Frontend WWW

- Next.js
- TypeScript
- Tailwind CSS
- Komponenty UI inspirowane shadcn/ui
- Docelowo: React Hook Form + Zod do formularzy i walidacji

### Backend / API

- Next.js API Routes / Server Actions na start
- W przyszłości opcjonalnie osobny backend NestJS

### Logowanie i role

Docelowo Auth.js / NextAuth z rolami:

- `admin`
- `dyspozytor`
- `kierowca`

### Mapa i GPS

- Mapbox albo Google Maps API
- Lokalizacja kierowcy z przeglądarki / telefonu
- Zapis pozycji GPS do PostgreSQL

## Uruchomienie lokalne

```bash
npm install
npm run dev
```

Aplikacja będzie dostępna pod adresem `http://localhost:3000`.
