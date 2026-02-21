# Shop The Step

Fullstack web aplikacija za upravljanje proizvodima, receptima i porudžbinama, sa administratorskim dashboard-om i vizualizacijom podataka.

Aplikacija omogućava:

- Upravljanje proizvodima (CRUD)
- Kreiranje i upravljanje receptima (sa sastojcima vezanim za proizvode)
- Kreiranje i upravljanje porudžbinama
- Administratorski pregled KPI pokazatelja i grafikona
- Integraciju sa eksternim API servisima (TheMealDB i Currency API)

---

## 🚀 Tehnologije

### Backend

- Python
- Flask
- Flask-Login
- Flask-Migrate
- SQLAlchemy
- PostgreSQL
- Flasgger (Swagger dokumentacija)

### Frontend

- React (Vite)
- Zustand (state management)
- Recharts (vizualizacija podataka)
- TailwindCSS
- React Router

### Dev Tools

- Docker
- Docker Compose
- Vitest
- React Testing Library

---

## 📦 Funkcionalnosti

### Autentifikacija

- Registracija i login
- Role-based pristup (user / admin)
- Session-based autentifikacija (HTTP-only cookies)

### Proizvodi

- Kreiranje, izmena i brisanje (admin)
- Pretraga i sortiranje

### Recepti

- Kreiranje recepata sa sastojcima
- Pretraga po nazivu i proizvodima
- Integracija sa TheMealDB API

### Porudžbine

- Kreiranje porudžbine
- Izmena stavki porudžbine
- Promena statusa (admin)
- Otkazivanje (user)

### Admin Dashboard

- KPI kartice
- Revenue by day (Line chart)
- Orders by status (Pie chart)
- Orders by day (Bar chart)
- Top products by revenue
- Low stock tabela

---

# ⚙️ Lokalno pokretanje

## 1️⃣ Backend

### Kreiranje virtualnog okruženja

```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

### Instalacija dependencija

```bash
pip install -r requirements.txt
```

### Konfiguracija .env fajla

SECRET_KEY=your-secret
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
CORS_ORIGINS=http://localhost:5173
COOKIE_SECURE=0
COOKIE_SAMESITE=Lax
THEMEALDB_API_KEY=1

### Pokretanje migracija

```bash
flask db upgrade
```

### Pokretanje servera

```bash
flask run
```

## 2️⃣ Frontend

### Instalacija dependencija

```bash
npm install
```

### Pokretanje

```bash
npm run dev
```
