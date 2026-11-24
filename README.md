# Ciudad Inteligente

**Universidad Autónoma de Baja California** · Facultad de Ciencias Administrativas  
Inteligencia de Negocios · **Marco Legal de TI** · Actividad **Meta 4.2** · Grupo **261**  
Docente: **Dr. Ricardo Ching Wesman** · Mexicali, B.C. · octubre de 2026

Un recorrido 3D por una ciudad conectada: tres zonas geográficas, dos nubes internacionales y cuatro capas de lectura jurídica. El modelo reúne movilidad, seguridad urbana, energía y agua en un mismo territorio, con la infraestructura, los riesgos, el marco legal y la propiedad intelectual de cada sector.

![Portada del proyecto](docs/preview-intro.png)

![Vista general de la ciudad](docs/preview-atlas.png)

## El recorrido

| Paso | Escena | Contenido |
| --- | --- | --- |
| 00 | Vista general | Tres zonas y arquitectura híbrida (Edge en México y nubes en EE. UU. y la UE) |
| 01 | Seguridad urbana predictiva | Zona B y Nube EE. UU.: biometría, drones, EIPD y secreto industrial |
| 02 | Sostenibilidad y energía | Zona C y Nube UE: telemetría domiciliaria, GDPR y transferencia internacional |
| 03 | Movilidad y conectividad | Zona A: semáforos, Wi-Fi/5G, datos abiertos y obra por encargo |
| 04 | Recordatorio final | Ficha del proyecto con docente e integrantes |

## La ciudad

- **Tres tercios completos**: la ciudad se divide en tres zonas de igual extensión. La Zona C ocupa todo el tercio oeste, la Zona A el centro y la Zona B el tercio este. La infraestructura de cada zona se distribuye por todo su territorio, no solo en el núcleo.
- **Zona A · Movilidad y conectividad**: avenida instrumentada, semáforos sincronizados, cámaras LPR, paradas con Wi-Fi 6 / 5G, electrolineras, tótems de movilidad, parques y ciclovía.
- **Zona B · Seguridad urbana predictiva**: centro de seguridad, cámaras PTZ, drones de patrullaje, arcos lectores, puestos de control, plataformas de drones y torres de iluminación.
- **Zona C · Sostenibilidad y energía**: vivienda, medidores inteligentes, red de agua, subestación eléctrica, paneles solares, aerogeneradores, jardines comunitarios y torres de agua.
- **Diseño urbano**: más de 480 × 300 unidades de trama urbana, anillo perimetral recto con cuatro esquinas y cinco edificios singulares (torre circular, zigurat de datos, centro de operaciones con cúpula, torres gemelas y terrazas verdes) que rompen la silueta repetitiva.
- **Hitos de datos**: ocho torres de datos con fachada de vidrio, ventanas encendidas y anillos de luz; un zigurat escalonado con cientos de ventanas; una cúpula de operaciones con ventanales y antenas; y una plaza central con fuente, pérgola solar, bancas y arbolado.
- **Movilidad continua**: autos de varios modelos (sedán, compacto, taxi, pickup y patrulla), buses y bicicletas recorren rutas cerradas sin desapariciones; cuatro vehículos circulan por el anillo perimetral; los semáforos de la avenida detienen el tráfico en rojo/ámbar y lo liberan en verde. La avenida respeta carriles de ida y vuelta y las calles perimetrales tienen un solo sentido.
- **Vida urbana**: más de 40 peatones caminando por la avenida, parques, barrios, la plaza central, el centro de movilidad y las tres zonas, con vestuario y animación de marcha; dos helicópteros futuristas sobrevuelan la ciudad de forma continua; iluminación de calle, árboles instanciados y parques.
- **Equipamiento de barrio**: escuela, banco, clínica, mercado, biblioteca, estación de bomberos con camión, tres conjuntos residenciales, un bosque urbano, un centro de movilidad con autobuses eléctricos y pérgola solar, una estación de metro con acceso y elevador, bancas, botes de basura, maceteros, racks de bicicletas, kioscos, pasos peatonales y autos estacionados.
- **Presentación limpia**: botones para ocultar la ficha del proyecto y la barra superior, con controles compactos para recuperarlas; botón **Portada** para regresar a la introducción.
- **Agua y vegetación**: tres estanques decorativos con rocas, juncos, bancas y faroles; arbustos, maceteros y parterres distribuidos en lotes libres.
- **Cielo y clima**: vista de día con sombras direccionales y gradiente de cielo; vista nocturna con ventanas encendidas, letreros, halos de alumbrado público y enlaces de datos.
- **Puntos del documento**: capa de etiquetas 3D sobre semáforos, cámaras, drones, medidores, servidores y nubes, con filtros por color para infraestructura, riesgos, marco legal y propiedad intelectual; al tocar una etiqueta se abre la ficha de la zona en la capa correspondiente.
- **Nubes internacionales**: múltiples enlaces animados desde la infraestructura de las tres zonas hacia los centros de cómputo de EE. UU. y la Unión Europea.
- **Rendimiento**: geometría instanciada para edificios, árboles, alumbrado, mobiliario y vehículos estacionados; texturas procedurales; sombras direccionales de alta resolución en modo día; DPR adaptativo hasta 1.5 y una interfaz sin postprocesado.

## Easter eggs

- **Sable de luz**: en la azotea del edificio municipal de la Zona A, en la esquina oeste de la azotea. Haz clic en el mango para encender la hoja azul.
- **Nave X-wing**: en la azotea del centro de seguridad de la Zona B, sobre la plataforma circular. Haz clic para que despegue.
- **Darth Vader**: camina por la acera sur de la avenida principal, cerca del cruce central, con capa y sable rojo.

## Controles

- Arrastra para orbitar la ciudad; usa la rueda o la pinza para acercar.
- Haz clic en una etiqueta de zona o de nube para abrir su ficha.
- Cambia entre **Infraestructura**, **Riesgos**, **Marco legal** y **Propiedad intelectual** desde la ficha de cada zona.
- Usa el recorrido guiado para seguir el orden de la exposición.
- Alterna **Día / Noche** con el botón del encabezado.
- Usa **Puntos del documento** para activar o desactivar los puntos y filtrarlos por color: infraestructura, riesgos, marco legal o propiedad intelectual. Al abrir una zona, sus etiquetas se despliegan sobre el modelo.
- Usa **Portada** para volver a la introducción y **×** en la ficha o en la barra superior para ocultarlas; los botones **Ficha del proyecto** y **Mostrar barra** las recuperan.
- Si desarrollas el proyecto, ejecuta `npm run check:layout` para validar que las huellas principales no invadan calzadas, anillo ni se solapen.
- La ficha académica permanece visible en la esquina superior izquierda.
- La hora del encabezado corresponde a **Mexicali, B.C.**

## Desarrollo local

Requisitos: **Node.js 20.19 o superior**.

```bash
npm install
npm run dev
```

Abre `http://localhost:5173`.

```bash
npm run build     # compila TypeScript y genera /dist
npm run preview   # sirve la build de producción
```

## Deploy en Vercel

El proyecto ya está preparado para Vercel como sitio estático. Incluye [`vercel.json`](vercel.json) con framework Vite, comando de build y carpeta de salida.

### Opción A — desde el panel de Vercel

1. Importa el repositorio en Vercel.
2. Verifica:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. **Deploy**. No se necesitan variables de entorno.

### Opción B — con la CLI

```bash
npx vercel
npx vercel --prod
```

## Producción

- **GitHub:** https://github.com/Anael19-gg/ciudad-inteligente
- **Vercel:** https://ciudad-inteligente-flame.vercel.app

Cada push a `main` despliega automáticamente una nueva versión en Vercel.
