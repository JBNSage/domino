# Dominó

Contador de puntos para dominó en dos equipos. Es una aplicación web instalable: funciona sin conexión y recuerda la partida.

## Instalar en el teléfono

- **iPhone (Safari):** abre la dirección, toca Compartir y luego "Agregar a pantalla de inicio".
- **Android (Chrome):** abre la dirección, toca el menú y luego "Instalar app".

## Desarrollo

```bash
nvm use
npm install
npm start        # http://localhost:4200
npm test
npm run build
```

Cada cambio en `main` se publica en GitHub Pages con `.github/workflows/deploy.yml`.

## Compartir mesas: configuración de Firebase

Las mesas compartidas se guardan en Firebase. Sin configurarlo, la app funciona igual y solo falla "Compartir".

1. Crea un proyecto en [Firebase](https://console.firebase.google.com) y añade una app web.
2. En **Authentication → Método de acceso**, activa **Anónimo**. En **Authentication → Configuración → Dominios autorizados**, añade `jbnsage.github.io` (y deja `localhost`).
3. En **Firestore Database**, crea la base de datos (modo producción).
4. Copia la configuración web de la app (Configuración del proyecto → Tus apps) en `src/app/platform/firebase.config.ts`. Es pública por diseño: lo que protege los datos son las reglas.
5. Las reglas de `firestore.rules` se publican solas en cada cambio a `main` (`.github/workflows/deploy.yml`, antes que la web). Para eso, el repositorio necesita el secreto `FIREBASE_SERVICE_ACCOUNT`:
   - En Firebase, **Configuración del proyecto → Cuentas de servicio → Generar nueva clave privada**: descarga un archivo JSON.
   - En GitHub, **Settings → Secrets and variables → Actions → New repository secret**, nombre `FIREBASE_SERVICE_ACCOUNT`, y pega el contenido completo del JSON.
   - Borra el archivo JSON de tu equipo: es una clave con permisos sobre el proyecto.

   Para publicarlas a mano: `npx firebase-tools login` y luego `npx firebase-tools deploy --only firestore:rules`.

### Prueba con dos navegadores

Usa dos navegadores distintos (por ejemplo Chrome y Safari) o dos teléfonos, A y B:

1. A: crea una mesa con jugadores, tócala y luego "Compartir". El enlace de WhatsApp, el copiado y el QR deben ser el mismo.
2. B: abre el enlace. Sale "Unirse a …" con su nombre; toca "Unirse". La mesa queda en uso y B solo mira ("Mesa: … · Mirando"). En A, B aparece en "Personas".
3. A: marca "Anota" para B. Sin recargar, B puede anotar. Cada mano de uno aparece en el otro con su animación. Borrar una mano en A la quita en B.
4. Los dos sin conexión: anotan manos; al volver la conexión, ambos tableros tienen todas las manos, en el orden en que se jugaron. Si los dos cierran la misma partida sin conexión, el historial tiene una sola.
5. B cambia su nombre en el menú: en A cambia en "Personas", en los equipos guardados y en el historial. A quita a B: la mesa desaparece en B. Tras "Crear enlace nuevo", el enlace viejo ya no sirve.
6. A elimina la mesa: desaparece en B. Las mesas no compartidas de A siguen igual, y un teléfono que nunca compartió ni se unió no descarga Firebase (pestaña Red).
