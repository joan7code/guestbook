# Guestbook — Documento de Requerimientos

> Este documento describe con exactitud el proyecto Guestbook construido en joan7code/guestbook.
> Si se parte de este documento se debe poder reproducir exactamente el mismo proyecto.

---

## 1. Descripción general

Aplicación web de libro de visitas (guestbook) donde los usuarios registrados pueden dejar mensajes públicos. Cada mensaje recibe automáticamente una respuesta de bienvenida generada por un LLM. Los mensajes son visibles para todos, pero solo los usuarios autenticados pueden escribir.

---

## 2. Stack tecnológico

| Capa | Tecnología | Versión |
|---|---|---|
| Framework | Next.js con App Router | 14.1.0 |
| Lenguaje | TypeScript | ^5 |
| Estilos | Tailwind CSS | ^3.3.0 |
| Base de datos + Auth | Supabase | @supabase/supabase-js ^2.39.0 |
| LLM | Cohere API (modelo `command-r-plus-08-2024`) | REST API v2 |
| Fuente tipográfica | Inter (cargada via `next/font/google`) | — |
| Despliegue | Vercel | — |

---

## 3. Variables de entorno

El archivo `.env.local` (no subir a git) debe contener:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
COHERE_API_KEY=<cohere-api-key>
```

El repositorio incluye `.env.local.example` como plantilla con estas mismas claves vacías.

---

## 4. Base de datos (Supabase)

### 4.1 Tabla `messages`

```sql
create table messages (
  id bigint generated always as identity primary key,
  name text not null,
  message text not null,
  ai_reply text,
  user_id uuid references auth.users(id),
  user_email text,
  created_at timestamptz default now() not null
);
```

### 4.2 Seguridad (RLS)

```sql
alter table messages enable row level security;

grant select on messages to anon;
grant insert on messages to anon;

create policy "Anyone can read messages"
  on messages for select using (true);

create policy "Anyone can insert messages"
  on messages for insert with check (true);
```

> **Importante:** los `grant` son necesarios además de las policies. Sin ellos, el rol `anon` recibe error 42501 (permission denied).

### 4.3 Autenticación

Se usa **Supabase Auth** con email y contraseña. No requiere configuración adicional más allá de activar el proveedor Email en el dashboard de Supabase (viene activado por defecto).

---

## 5. Estructura de archivos

```
guestbook/
├── app/
│   ├── layout.tsx               # Root layout con Inter font
│   ├── page.tsx                 # Página principal (SSR, revalidate=0)
│   ├── globals.css              # @tailwind base/components/utilities
│   ├── login/
│   │   └── page.tsx             # Página de login (client component)
│   ├── register/
│   │   └── page.tsx             # Página de registro (client component)
│   └── api/
│       └── messages/
│           └── route.ts         # POST /api/messages
├── components/
│   ├── GuestbookForm.tsx        # Formulario (client, protegido por auth)
│   ├── MessageList.tsx          # Lista de mensajes con AI reply
│   └── AuthButton.tsx           # Botón Sign in / Sign out / Register
├── lib/
│   ├── supabase.ts              # Cliente Supabase + tipo Message
│   └── cohere.ts                # Función generateWelcomeReply()
├── .env.local.example
├── .gitignore
├── next.config.js
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

> Nota: el repositorio contiene también archivos residuales de intentos anteriores (`lib/groq.ts`, `lib/gemini.ts`, `lib/huggingface.ts`, `lib/claude.ts`) que no se usan. Se pueden eliminar.

---

## 6. Funcionalidad por archivo

### `app/page.tsx`
- Server component con `export const revalidate = 0`
- Llama a Supabase para obtener todos los mensajes ordenados por `created_at DESC`
- Renderiza: cabecera, `<AuthButton />`, `<GuestbookForm />`, `<MessageList />`

### `app/login/page.tsx`
- Client component
- Formulario con campos email y contraseña
- Usa `supabase.auth.signInWithPassword()`
- En caso de éxito: `router.push('/')` + `router.refresh()`
- Enlace a `/register`

### `app/register/page.tsx`
- Client component
- Formulario con campos email y contraseña (mínimo 6 caracteres)
- Usa `supabase.auth.signUp()`
- En caso de éxito: muestra pantalla de confirmación ("Check your email") con enlace a `/login`
- Enlace a `/login`

### `app/api/messages/route.ts` (POST)
- Extrae el token Bearer del header `Authorization`
- Llama a `supabase.auth.getUser(token)` para obtener `user_id` y `user_email`
- Valida: name y message requeridos, name ≤ 100 chars, message ≤ 500 chars
- Llama a `generateWelcomeReply()` de Cohere (con `.catch(() => '')` para no bloquear si falla)
- Inserta en Supabase: `{ name, message, ai_reply, user_id, user_email }`
- Devuelve 201 con el mensaje insertado, o 400/500 en caso de error

### `components/AuthButton.tsx`
- Client component
- Usa `supabase.auth.getUser()` en un `useEffect` + `onAuthStateChange` para suscribirse a cambios de sesión
- Si hay usuario: muestra su email + botón "Sign out" (llama a `supabase.auth.signOut()` + `router.refresh()`)
- Si no hay usuario: muestra botones "Sign in" (→ `/login`) y "Register" (→ `/register`)
- Mientras carga: no renderiza nada (`return null`)

### `components/GuestbookForm.tsx`
- Client component
- Suscribe al estado de auth igual que `AuthButton`
- Si no hay usuario: muestra mensaje con links a `/login` y `/register`
- Si hay usuario: muestra formulario con campos name y message
- Al enviar: obtiene el token con `supabase.auth.getSession()` y lo manda en el header `Authorization: Bearer <token>`
- Contador de caracteres para el mensaje (X/500)
- Estados: idle, loading, success, error

### `components/MessageList.tsx`
- Server-compatible (no usa hooks)
- Si no hay mensajes: muestra estado vacío con icono ✍️
- Por cada mensaje: avatar con iniciales + color determinístico, nombre, email del autor (si existe), fecha formateada, texto del mensaje
- Si `ai_reply` no es null: muestra bloque con fondo `bg-indigo-50`, icono 🤖 y texto en cursiva

### `lib/supabase.ts`
```typescript
export type Message = {
  id: number;
  name: string;
  message: string;
  ai_reply: string | null;
  created_at: string;
  user_id: string | null;
  user_email: string | null;
};
```
- Crea el cliente con `createClient(url, anonKey)` usando variables `NEXT_PUBLIC_*`

### `lib/cohere.ts`
- Endpoint: `https://api.cohere.com/v2/chat`
- Modelo: `command-r-plus-08-2024`
- `max_tokens: 100`
- System prompt: host amigable del guestbook, respuesta de 1-2 frases, sin emojis, mismo idioma que el mensaje del visitante
- Si `COHERE_API_KEY` no está definida: devuelve string vacío con `console.warn`
- Extrae la respuesta de `data.message?.content?.[0]?.text`

---

## 7. Diseño y UX

- Fondo: gradiente `from-indigo-50 via-white to-purple-50`
- Contenedor máximo: `max-w-2xl` centrado con padding responsive
- Inputs y textareas: bordes redondeados (`rounded-xl`), fondo `bg-gray-50`, focus con ring indigo
- Botón primario: `bg-indigo-600` hover `bg-indigo-700`, `rounded-xl`
- Tarjetas de mensajes: `rounded-2xl border border-gray-100 bg-white shadow-sm` con hover shadow
- Avatares: iniciales del nombre, color determinístico basado en `name.charCodeAt(0) % 6` usando paleta indigo/purple/pink/emerald/amber/sky
- Respuesta IA: bloque `bg-indigo-50 rounded-xl` con texto en `italic text-indigo-700`
- Totalmente responsive (mobile-first)

---

## 8. Configuración de Tailwind

```typescript
content: [
  './pages/**/*.{js,ts,jsx,tsx,mdx}',
  './components/**/*.{js,ts,jsx,tsx,mdx}',
  './app/**/*.{js,ts,jsx,tsx,mdx}',
  './lib/**/*.{js,ts,jsx,tsx}',
],
theme: {
  extend: {
    fontFamily: { sans: ['Inter', 'sans-serif'] }
  }
}
```

---

## 9. Despliegue en Vercel

- Conectar repositorio GitHub `joan7code/guestbook` rama `main`
- Añadir las 3 variables de entorno en Settings → Environment Variables marcando **Production** y **Preview**
- Vercel detecta automáticamente que es Next.js — no requiere configuración adicional
- Cada push a `main` dispara un deploy automático

---

## 10. Notas importantes aprendidas durante el desarrollo

1. **Supabase RLS**: no basta con crear policies — también hay que ejecutar `grant select/insert on messages to anon` explícitamente.
2. **Tailwind CSS**: el `@import` de Google Fonts antes de las directivas `@tailwind` rompe el procesamiento en algunas versiones de PostCSS. La solución es usar `next/font/google` en el layout y eliminar el `@import` del CSS.
3. **Cohere**: es el LLM gratuito más fiable para este caso de uso en España. Groq no permitía el registro vía GitHub en algunos navegadores. Google AI Studio (Gemini) tiene la cuota gratuita a 0 para cuentas de Google Workspace y no está disponible en España para cuentas gratuitas. Anthropic ya no ofrece créditos gratuitos. Hugging Face Inference API gratuita no soporta los modelos más populares.
4. **Vercel redeploy**: al hacer "Redeploy" desde Vercel hay que asegurarse de seleccionar el deployment más reciente (el del último commit), no un deployment anterior.
