# Lynra 🔖

**Gestor personal de bookmarks** — guarda, organiza y busca enlaces con etiquetas, colecciones y búsqueda full-text.

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS v3 |
| Backend | Node.js + Express |
| Base de datos | SQLite (`better-sqlite3`) |
| Estado | Zustand |
| Gráficas | Recharts |
| Íconos | Lucide React |

---

## Desarrollo local

```bash
# Terminal 1 — Backend
cd backend
npm install
npm run dev          # nodemon en puerto 3001

# Terminal 2 — Frontend
cd frontend
npm install
npm run dev          # Vite en puerto 5173, proxy → :3001
```

Abre http://localhost:5173

---

## Despliegue en Debian / Ubuntu

### 1. Instalar Node.js 20 LTS

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
node -v   # v20.x.x
```

### 2. Instalar PM2 globalmente

```bash
npm install -g pm2
```

### 3. Clonar el repositorio

```bash
sudo mkdir -p /var/www/linra
sudo chown $USER:$USER /var/www/linra
git clone https://github.com/tu-usuario/linra.git /var/www/linra
cd /var/www/linra
```

### 4. Instalar dependencias y compilar frontend

```bash
cd backend && npm install --production
cd ../frontend && npm install && npm run build
cd ..
```

### 5. Configurar PM2

El archivo `ecosystem.config.js` ya está incluido en `backend/`.

```bash
cd backend
pm2 start ecosystem.config.js
pm2 save
pm2 startup   # sigue las instrucciones para que arranque al reiniciar
```

### 6. Verificar que el backend funciona

```bash
curl http://localhost:3001/api/v1/stats
```

### 7. Configurar Nginx

```bash
sudo apt install nginx -y
sudo nano /etc/nginx/sites-available/linra
```

Contenido del archivo:

```nginx
server {
    listen 80;
    server_name jordi.informaticamajada.es;  # o la IP del servidor

    # Archivos estáticos del frontend
    root /var/www/linra/frontend/dist;
    index index.html;

    # API → proxy al backend Node
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 60s;
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/linra /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### 8. SSL con Certbot (opcional)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d jordi.informaticamajada.es
```

---

## Variables de entorno

Crea un archivo `.env` en `backend/`:

```env
PORT=3001
NODE_ENV=production
JWT_SECRET=tu_cadena_secreta_aleatoria_muy_larga
CORS_ORIGIN=https://jordi.informaticamajada.es
```

- **JWT_SECRET**: Obligatorio en producción. Se utiliza para firmar los tokens de sesión.
- **CORS_ORIGIN**: Lista de orígenes permitidos separados por comas.

---

## Base de datos

El archivo SQLite se crea automáticamente en `backend/database/db.sqlite` la primera vez que arranca el servidor. No requiere ninguna configuración adicional.

Para hacer backup:

```bash
cp /var/www/linra/backend/database/db.sqlite /backup/linra-$(date +%Y%m%d).sqlite
```

---

## Estructrura de carpetas

```
linra/
├── backend/
│   ├── server.js
│   ├── ecosystem.config.js
│   ├── database/
│   │   ├── db.js
│   │   └── migrations.js
│   ├── routes/
│   │   ├── bookmarks.js
│   │   ├── collections.js
│   │   ├── tags.js
│   │   ├── stats.js
│   │   └── import.js
│   └── services/
│       └── metadataScraper.js
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── main.jsx
    │   ├── index.css
    │   ├── api/client.js
    │   ├── store/useStore.js
    │   ├── components/
    │   └── pages/
    └── dist/          ← generado por npm run build
```

---

## API Reference

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/v1/bookmarks` | Listar (con `?q=`, `?collection_id=`, `?tag=`, `?favorites=1`) |
| POST | `/api/v1/bookmarks` | Crear (scraping automático) |
| PUT | `/api/v1/bookmarks/:id` | Actualizar |
| DELETE | `/api/v1/bookmarks/:id` | Eliminar |
| POST | `/api/v1/bookmarks/:id/visit` | Registrar visita |
| POST | `/api/v1/bookmarks/scrape` | Obtener metadatos sin guardar |
| GET | `/api/v1/collections` | Listar colecciones |
| POST | `/api/v1/collections` | Crear colección |
| PUT | `/api/v1/collections/:id` | Actualizar |
| DELETE | `/api/v1/collections/:id` | Eliminar |
| GET | `/api/v1/tags` | Listar tags con conteo |
| DELETE | `/api/v1/tags/:id` | Eliminar tag |
| GET | `/api/v1/stats` | Estadísticas generales |
| POST | `/api/v1/import/html` | Importar desde HTML de Chrome/Firefox |
| GET | `/api/v1/import/export` | Exportar todos los bookmarks en JSON |
