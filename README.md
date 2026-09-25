# Wishlist de Casey

Web independiente (React + Vite + TypeScript) con Supabase como base de datos, autenticación
y sincronización en tiempo real. No depende de Claude ni de ningún inicio de sesión en Claude:
una vez desplegada, la vista pública es accesible por cualquiera con el enlace, y `/admin`
solo es accesible con tu usuario/contraseña de Supabase.

---

## 1. Crear el proyecto en Supabase

1. Ve a https://supabase.com y crea una cuenta (gratis) si no tienes una.
2. Pulsa **New project**. Elige nombre (p. ej. `wishlist-casey`), contraseña de base de datos
   (guárdala, no la necesitarás para la web, pero sí si quieres entrar a la base de datos
   directamente) y la región más cercana a ti.
3. Espera 1-2 minutos a que se cree el proyecto.

## 2. Crear las tablas (base de datos)

1. En el menú lateral, entra en **SQL Editor**.
2. Pulsa **New query**.
3. Abre el archivo `supabase/schema.sql` de este proyecto, copia **todo** su contenido y
   pégalo en el editor.
4. Pulsa **Run**. Esto crea las tablas `categories`, `subcategories` y `products`, configura
   los permisos (RLS) y añade las categorías y productos de ejemplo (marcados como `is_demo`
   para que los identifiques fácilmente y los borres desde `/admin` cuando quieras).

Si en algún momento quieres borrar todo y empezar de cero, puedes ejecutar
`drop table products, subcategories, categories cascade;` y volver a correr `schema.sql`.

## 3. Crear tu usuario de administrador

Este es el usuario/contraseña con el que entrarás en `/admin`. La web usa Supabase Auth,
así que se crea directamente desde el panel de Supabase (no hay registro público).

1. En el menú lateral, entra en **Authentication → Users**.
2. Pulsa **Add user → Create new user**.
3. Escribe tu email y una contraseña.
4. Marca **Auto Confirm User** (para no tener que verificar el email) y guarda.

Ese email + contraseña son los que usarás para entrar en `/admin`. Puedes crear varios
usuarios si en el futuro quieres dar acceso a alguien más.

## 4. Obtener las claves de conexión

1. En el menú lateral, entra en **Project Settings → API**.
2. Copia:
   - **Project URL** (algo como `https://xxxx.supabase.co`)
   - **anon public key** (la clave larga bajo "Project API keys")

Esta clave `anon` es pública por diseño (se usa en el navegador) — la seguridad real la dan
las políticas RLS que ya definiste en el paso 2, que impiden escribir sin haber iniciado sesión.

## 5. Configurar el proyecto en local (opcional, solo si quieres probarlo antes de desplegar)

```bash
npm install
cp .env.example .env
```

Edita `.env` y pega tu URL y tu anon key:

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anon
```

Luego:

```bash
npm run dev
```

Abre `http://localhost:5173` para la vista pública y `http://localhost:5173/admin` para el
panel de administración.

## 6. Desplegar en Netlify

1. Sube este proyecto a un repositorio de GitHub (crea uno nuevo y sube todos estos archivos).
2. Entra en https://app.netlify.com → **Add new site → Import an existing project**.
3. Conecta tu cuenta de GitHub y selecciona el repositorio.
4. Netlify detectará el `netlify.toml` automáticamente (build command `npm run build`,
   carpeta de publicación `dist`). No cambies nada ahí.
5. Antes de desplegar, ve a **Site settings → Environment variables** y añade:
   - `VITE_SUPABASE_URL` → tu Project URL
   - `VITE_SUPABASE_ANON_KEY` → tu anon key
6. Pulsa **Deploy site**. En un par de minutos tendrás una URL pública
   (`algo.netlify.app`), que puedes personalizar en **Site settings → Domain management**.

## 6bis. Desplegar en Vercel (alternativa)

1. Sube el proyecto a GitHub igual que arriba.
2. Entra en https://vercel.com → **Add New → Project** → importa el repositorio.
3. Vercel detecta automáticamente que es un proyecto Vite.
4. En **Environment Variables**, añade `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` con
   los mismos valores del paso 4.
5. Pulsa **Deploy**. El `vercel.json` incluido asegura que `/admin` funcione bien al recargar
   la página directamente.

## 7. Compartir el enlace

- **Vista pública**: comparte la URL principal (`https://tu-sitio.netlify.app` o `.vercel.app`,
  o tu dominio propio si conectas uno). Cualquiera que la abra puede ver la wishlist, filtrar,
  buscar y abrir cada regalo — sin necesidad de registrarse ni iniciar sesión en nada.
- **Panel privado**: entra tú en `https://tu-sitio.../admin` con el email/contraseña que
  creaste en el paso 3. Los cambios que hagas (añadir, editar, ocultar, reordenar, categorías
  nuevas) se sincronizan solos en la vista pública gracias al realtime de Supabase — tu novia
  no necesita recargar la página para verlos.

## Notas

- Las imágenes se añaden pegando una URL (el enlace de la foto del producto). No hay subida
  de archivos en esta versión, para mantener el proyecto simple y sin coste de almacenamiento
  adicional.
- Los productos de ejemplo llevan `is_demo = true`; bórralos desde `/admin` cuando añadas los
  tuyos reales (fila con la etiqueta "(demo)").
- Si quieres cambiar las categorías iniciales, hazlo desde el propio panel `/admin →
  Gestionar categorías`, no hace falta tocar código ni la base de datos a mano.
