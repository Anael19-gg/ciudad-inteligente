export type LayerId = 'infra' | 'risk' | 'legal' | 'ip'
export type ZoneId = 'a' | 'b' | 'c'
export type CloudId = 'us' | 'eu'

export type Vec3 = [number, number, number]

export interface LayerMeta {
  id: LayerId
  name: string
  short: string
  tab: string
  color: string
  description: string
}

export interface Entry {
  title: string
  body: string
  refs?: string[]
}

export interface LayerContent {
  intro: string
  entries: Entry[]
}

export interface Zone {
  id: ZoneId
  index: string
  code: string
  name: string
  kicker: string
  tagline: string
  summary: string
  cloud: CloudId
  accent: string
  center: Vec3
  markerAnchor: Vec3
  camera: { pos: Vec3; target: Vec3 }
  content: Record<LayerId, LayerContent>
}

export interface Cloud {
  id: CloudId
  index: string
  name: string
  region: string
  tagline: string
  summary: string
  position: Vec3
  camera: { pos: Vec3; target: Vec3 }
  zones: ZoneId[]
  accent: string
  entries: Entry[]
  chips: string[]
}

export type Selection =
  | { type: 'zone'; zone: ZoneId; layer?: LayerId }
  | { type: 'cloud'; cloud: CloudId }
  | { type: 'clouds' }
  | null

export const LAYERS: LayerMeta[] = [
  {
    id: 'infra',
    name: 'Infraestructura y flujo',
    short: 'Infraestructura',
    tab: 'Infra',
    color: '#6FA8FF',
    description: 'Código negro/azul: hardware en el borde, procesamiento y operadores.',
  },
  {
    id: 'risk',
    name: 'Riesgos y privacidad',
    short: 'Riesgos',
    tab: 'Riesgo',
    color: '#FF6B6B',
    description: 'Código rojo: tensiones constitucionales y datos sensibles.',
  },
  {
    id: 'legal',
    name: 'Marco legal aplicable',
    short: 'Marco legal',
    tab: 'Legal',
    color: '#4FDD9E',
    description: 'Código verde: LFPDPPP, LGPDPPSO, T-MEC y GDPR.',
  },
  {
    id: 'ip',
    name: 'Propiedad intelectual',
    short: 'Propiedad intelectual',
    tab: 'PI',
    color: '#FFAE63',
    description: 'Código naranja: LFDA, LFPPI, patentes y secreto industrial.',
  },
]

export const LAYER_BY_ID = Object.fromEntries(LAYERS.map((l) => [l.id, l])) as Record<
  LayerId,
  LayerMeta
>

export const PROJECT = {
  title: 'Ciudad Inteligente',
  subtitle: 'Arquitectura de datos, territorio y derecho',
  university: 'Universidad Autónoma de Baja California',
  faculty: 'Facultad de Ciencias Administrativas',
  program: 'Inteligencia de Negocios',
  subject: 'Marco Legal de TI',
  activity: 'Meta 4.2',
  group: 'Grupo 261',
  docent: 'Dr. Ricardo Ching Wesman',
  team: [
    'Díaz Silva Mónica Yuriskery',
    'Prado Pimentel Pablo Alejandro',
    'Ramos Morales Anael',
    'Rios Gutierrez Julia',
    'Tapia Morales Melany',
  ],
  place: 'Mexicali, B.C.',
  date: 'Octubre de 2026',
}

export const ZONES: Zone[] = [
  {
    id: 'a',
    index: '01',
    code: 'A',
    name: 'Movilidad y Conectividad',
    kicker: 'Centro · Avenida principal',
    tagline: 'Transporte autónomo, semáforos inteligentes y paradas con Wi-Fi gratuito.',
    summary:
      'La avenida conecta el sensor en el pavimento con la analítica en la nube de EE. UU. Es el corredor más instrumentado de la ciudad: cada semáforo, placa y autobús produce un dato que circula.',
    cloud: 'us',
    accent: '#79E3F2',
    center: [0, 0, 0],
    markerAnchor: [0, 12, 0],
    camera: { pos: [0, 112, 180], target: [0, 3, 0] },
    content: {
      infra: {
        intro: 'Del sensor de piso al servidor municipal, y de ahí a la nube.',
        entries: [
          {
            title: 'Hardware · Edge',
            body: 'Semáforos con sensores de flujo vehicular, cámaras LPR (lectura de placas), unidades de transporte autónomo con GPS y puntos de acceso (AP) Wi-Fi 6 / antenas 5G en paradas.',
          },
          {
            title: 'Procesamiento',
            body: 'Servidores locales municipales (on-premise) para control semafórico de baja latencia en tiempo real y nube en EE. UU. para analítica de tráfico con motor de IA de predicción de rutas.',
          },
          {
            title: 'Operadores',
            body: 'Red Wi-Fi y semáforos operados por el Municipio; flota de transporte autónomo operada por Empresa Privada Concesionaria.',
          },
        ],
      },
      risk: {
        intro: 'La infraestructura que optimiza el flujo también puede trazar a cada persona que se mueve.',
        entries: [
          {
            title: 'Art. 16° CPEUM · Párr. 1 y 2',
            body: 'Rastreo continuo de geolocalización ciudadana mediante direcciones MAC de celulares al conectarse al Wi-Fi público o por lectura de placas sin orden judicial.',
          },
          {
            title: 'Art. 6° CPEUM · Apartado A y Párr. 3',
            body: 'Riesgo de brecha digital si las antenas 5G/Wi-Fi solo cubren zonas céntricas y excluyen la periferia; riesgo de reidentificación ciudadana al publicar estadísticas abiertas de movilidad.',
          },
          {
            title: 'Datos sensibles',
            body: 'Patrones habituales de desplazamiento (domicilio–trabajo–hospital).',
          },
        ],
      },
      legal: {
        intro: 'Dos sujetos obligados, dos leyes y un flujo que cruza la frontera.',
        entries: [
          {
            title: 'Ámbito nacional',
            body: 'El Municipio aplica LGPDPPSO (deberes de seguridad, Documento de Seguridad y publicación de datos de tráfico anonimizados bajo el Art. 6° CPEUM garantizando neutralidad de red). La concesionaria aplica LFPDPPP (Art. 5, 8 principios; Arts. 14–16 Aviso de Privacidad mediante QR en paradas y autobuses; Arts. 18–19 cifrado extremo a extremo; Art. 26 oposición a decisiones automatizadas sin revisión humana).',
          },
          {
            title: 'Flujo transfronterizo · EE. UU.',
            body: 'Se justifica con el T-MEC Cap. 19: Art. 19.11 (libre flujo transfronterizo de datos de telemetría), Art. 19.12 (prohibición de exigir servidores locales) y Art. 19.8 (protección de datos personales), complementado con la CCPA/CPRA (derecho de opt-out de perfilado comercial).',
          },
        ],
      },
      ip: {
        intro: 'Quién es dueño del software, de las rutas y de los sensores que hacen posible la avenida.',
        entries: [
          {
            title: 'LFDA',
            body: 'El software de gestión semafórica es obra por encargo (Arts. 83 y 103), siendo el Municipio titular patrimonial (Art. 13 fracc. XI, Arts. 101–114). Las bases de datos anonimizadas de rutas se protegen bajo el Art. 107.',
          },
          {
            title: 'LFPPI',
            body: 'Los sensores físicos de inducción magnética/óptica de los semáforos se protegen mediante Patente o Modelo de Utilidad (Arts. 45–48, 58–64).',
          },
        ],
      },
    },
  },
  {
    id: 'b',
    index: '02',
    code: 'B',
    name: 'Seguridad Urbana Predictiva',
    kicker: 'Perímetro · Distrito de seguridad',
    tagline: 'Videovigilancia con reconocimiento facial, lectura de placas y drones de patrullaje.',
    summary:
      'El perímetro es el punto de mayor tensión constitucional: cámaras biométricas y drones observan sin que exista, en la práctica, una forma de ejercer derechos ARCO frente a un lente pasivo.',
    cloud: 'us',
    accent: '#B0A0FF',
    center: [130, 0, 0],
    markerAnchor: [160, 18, -30],
    camera: { pos: [248, 108, 168], target: [146, 6, -14] },
    content: {
      infra: {
        intro: 'Sensores que no solo registran: clasifican, predicen y alertan.',
        entries: [
          {
            title: 'Hardware · Edge',
            body: 'Cámaras PTZ de ultra alta definición con reconocimiento facial, drones autónomos de patrullaje y arcos lectores de placas.',
          },
          {
            title: 'Procesamiento',
            body: 'Transmisión cifrada 5G hacia Nube Pública/Híbrida en EE. UU. donde opera un motor de IA de visión computacional (entrenamiento e inferencia para alertas predictivas).',
          },
          {
            title: 'Operadores',
            body: 'Operación conjunta entre Secretaría de Seguridad Municipal y Proveedor Tecnológico Privado (SaaS de IA).',
          },
        ],
      },
      risk: {
        intro: 'La vigilancia masiva es un acto de molestia; el sesgo algorítmico, un riesgo adicional.',
        entries: [
          {
            title: 'Art. 16° CPEUM · Párr. 1',
            body: 'Vigilancia masiva indiscriminada en espacio público y sobrevuelo de drones sobre propiedad privada (actos de molestia sin orden judicial).',
          },
          {
            title: 'Art. 16° CPEUM · Párr. 2',
            body: 'Imposibilidad material del ciudadano para ejercer sus Derechos ARCO (Acceso, Rectificación, Cancelación y Oposición) frente a cámaras pasivas en vía pública.',
          },
          {
            title: 'Datos sensibles',
            body: 'Biometría facial y forma de caminar (datos personales sensibles de identificación unívoca) + sesgos algorítmicos (falsos positivos).',
          },
        ],
      },
      legal: {
        intro: 'La legalidad se demuestra antes del despliegue, no después del escándalo.',
        entries: [
          {
            title: 'Ámbito nacional',
            body: 'Municipio sujeto a LGPDPPSO: obligatoria una Evaluación de Impacto en la Protección de Datos Personales (EIPD) previa al despliegue de cámaras biométricas. Proveedor privado sujeto a LFPDPPP: Arts. 8 y 9 (consentimiento expreso para datos sensibles, salvo excepciones de seguridad pública previstas en ley), Art. 26 (derecho a oponerse a decisiones automatizadas sin revisión humana antes de emitir sanciones) y supervisión de la Secretaría Anticorrupción y Buen Gobierno.',
          },
          {
            title: 'Flujo transfronterizo · EE. UU.',
            body: 'T-MEC Art. 19.8, 19.11 y 19.12 (protección de datos, libre flujo y no localización forzada). Cumplimiento de leyes estatales de EE. UU. (CCPA/CPRA o TDPSA): limitación estricta del uso de Información Personal Sensible (biometría) y minimización de datos.',
          },
        ],
      },
      ip: {
        intro: 'El código, el dron y los pesos de la IA tienen dueños distintos y protecciones distintas.',
        entries: [
          {
            title: 'LFDA',
            body: 'El proveedor conserva la titularidad del código fuente de la IA mediante licencia de uso al Municipio (Arts. 101–114). Las alertas o reportes generados 100% de forma autónoma por la IA carecen de protección autoral por falta de autoría humana (Arts. 3 y 12 LFDA).',
          },
          {
            title: 'LFPPI',
            body: 'El diseño aerodinámico y hardware inédito del dron se protege por Patente (Arts. 45–48). Los pesos algorítmicos y arquitectura de entrenamiento de la IA se resguardan como Secreto Industrial (Arts. 163–169 LFPPI), blindándolos frente a solicitudes de transparencia (Art. 6° CPEUM) en armonía con el Art. 19.16 del T-MEC (no divulgación forzada de código fuente).',
          },
        ],
      },
    },
  },
  {
    id: 'c',
    index: '03',
    code: 'C',
    name: 'Sostenibilidad y Energía',
    kicker: 'Residencial e industrial · Red de telemetría',
    tagline: 'Smart Grid, medidores domiciliarios en tiempo real y gestión automatizada de agua.',
    summary:
      'Cada quince minutos, los medidores cuentan cómo vive una casa. La telemetría viaja a Europa protegida por seudonimización y cláusulas contractuales tipo, no por una decisión de adecuación.',
    cloud: 'eu',
    accent: '#F2C97B',
    center: [-120, 0, 0],
    markerAnchor: [-140, 18, 28],
    camera: { pos: [-88, 126, 216], target: [-120, 4, 0] },
    content: {
      infra: {
        intro: 'La red de servicios se convierte en una red de datos domésticos.',
        entries: [
          {
            title: 'Hardware · Edge',
            body: 'Medidores inteligentes bidireccionales de luz y válvulas/sensores IoT de presión y consumo de agua en hogares e industrias.',
          },
          {
            title: 'Procesamiento',
            body: 'Red de telemetría que envía lecturas cada 15 minutos hacia servidores alojados en la Unión Europea (ej. Frankfurt/Berlín) con IA de balanceo de carga energética y detección de fugas.',
          },
          {
            title: 'Operadores',
            body: 'Organismo Operador de Agua (Municipio) y Empresa Suministradora/Tecnológica (Privado).',
          },
        ],
      },
      risk: {
        intro: 'El medidor no entra a la casa: la deduce. Y la deducción puede ser más íntima que una cámara.',
        entries: [
          {
            title: 'Art. 16° CPEUM · Párr. 1 y 2',
            body: 'Intromisión indirecta en la inviolabilidad del domicilio; los picos de consumo eléctrico/hídrico minuto a minuto revelan hábitos íntimos (cuándo hay gente en casa, rutinas de sueño o uso de aparatos médicos).',
          },
          {
            title: 'Datos sensibles',
            body: 'Inferencia de estado de salud (uso continuo de concentradores de oxígeno o equipos médicos domiciliarios).',
          },
        ],
      },
      legal: {
        intro: 'Dos regímenes de privacidad en los extremos del mismo cable de datos.',
        entries: [
          {
            title: 'Ámbito nacional',
            body: 'Empresa privada aplica LFPDPPP (Art. 5, 8 principios y proporcionalidad; Arts. 14–16 Aviso de Privacidad diferenciando finalidades necesarias de facturación frente a secundarias; Arts. 18–19 notificación de brechas de seguridad). Municipio aplica LGPDPPSO (Documento de Seguridad e inventario de bases de datos).',
          },
          {
            title: 'Flujo transfronterizo · Unión Europea',
            body: 'Se aplica el GDPR: Art. 25 (Privacy by Design): seudonimización del ID del medidor antes de salir de México hacia Europa. Art. 35 (DPIA): evaluación de impacto por monitoreo sistemático a gran escala. Arts. 44–49: transferencia internacional lícita mediante Cláusulas Contractuales Tipo (SCCs) aprobadas por la Comisión Europea (ya que México no cuenta con decisión de adecuación general).',
          },
        ],
      },
      ip: {
        intro: 'El software puro no se patenta; el efecto técnico que ahorra energía, sí.',
        entries: [
          {
            title: 'LFDA',
            body: 'Protección de la plataforma web/app de monitoreo ciudadano como programa de cómputo (Arts. 101–114) y de la estructura de las bases de datos de consumo (Art. 107).',
          },
          {
            title: 'LFPPI',
            body: 'El software puro de balanceo de carga no es patentable (Art. 49 fracc. IV), pero la invención implementada por computadora que logra un efecto técnico novedoso de ahorro físico en la red eléctrica o la válvula física inteligente sí son susceptibles de Patente / Modelo de Utilidad (Arts. 45–48, 58–64).',
          },
        ],
      },
    },
  },
]

export const ZONE_BY_ID = Object.fromEntries(ZONES.map((z) => [z.id, z])) as Record<ZoneId, Zone>

export const CLOUDS: Cloud[] = [
  {
    id: 'us',
    index: 'C1',
    name: 'Nube EE. UU.',
    region: 'Nube pública / híbrida · us',
    tagline: 'Analítica de tráfico · Visión computacional',
    summary:
      'Analítica de tráfico de la Zona A y visión computacional de la Zona B.',
    position: [36, 52, -27],
    camera: { pos: [52, 78, 82], target: [36, 45, -20] },
    zones: ['a', 'b'],
    accent: '#7FB6FF',
    entries: [
      {
        title: 'Cargas que procesa',
        body: 'Analítica de tráfico de la Zona A y visión computacional de la Zona B (entrenamiento e inferencia para alertas predictivas).',
      },
      {
        title: 'T-MEC · Capítulo 19',
        body: 'Art. 19.11: libre flujo transfronterizo de datos de telemetría. Art. 19.12: prohibición de exigir servidores locales. Art. 19.8: protección de datos personales.',
      },
      {
        title: 'Leyes estatales de EE. UU.',
        body: 'CCPA/CPRA: derecho de opt-out del perfilado comercial. TDPSA: limitación del uso de información personal sensible y minimización de datos.',
      },
    ],
    chips: ['Zonas A + B'],
  },
  {
    id: 'eu',
    index: 'C2',
    name: 'Nube Unión Europea',
    region: 'Frankfurt / Berlín · Nube regional',
    tagline: 'Telemetría energética · Detección de fugas',
    summary:
      'Telemetría energética e hídrica de la Zona C, procesada en servidores de la Unión Europea.',
    position: [-110, 50, -24],
    camera: { pos: [-126, 78, 86], target: [-110, 43, -18] },
    zones: ['c'],
    accent: '#C3A6FF',
    entries: [
      {
        title: 'Cargas que procesa',
        body: 'Telemetría de la Zona C cada 15 minutos: balanceo de carga energética y detección de fugas.',
      },
      {
        title: 'GDPR · Art. 25',
        body: 'Privacy by Design: seudonimización del ID del medidor antes de que el dato salga de México hacia Europa.',
      },
      {
        title: 'GDPR · Art. 35',
        body: 'DPIA: evaluación de impacto por el monitoreo sistemático a gran escala que implica la red de telemetría.',
      },
      {
        title: 'Transferencia · Arts. 44–49',
        body: 'Cláusulas Contractuales Tipo (SCCs) aprobadas por la Comisión Europea, ya que México no cuenta con decisión de adecuación general.',
      },
    ],
    chips: ['Zona C'],
  },
]

export const CLOUD_BY_ID = Object.fromEntries(CLOUDS.map((c) => [c.id, c])) as Record<CloudId, Cloud>

export const CLOUDS_VIEW = { pos: [16, 140, 250] as Vec3, target: [16, 40, -14] as Vec3 }

export interface TourStep {
  id: string
  index: string
  label: string
  title: string
  caption: string
  view: { pos: Vec3; target: Vec3 }
  selection: Selection
  layer?: LayerId
}

export const TOUR: TourStep[] = [
  {
    id: 'overview',
    index: '00',
    label: 'Vista general',
    title: 'Arquitectura híbrida',
    caption: 'Tres zonas geográficas conectadas a dos nubes internacionales.',
    view: { pos: [0, 220, 440], target: [0, 6, -12] },
    selection: null,
  },
  {
    id: 'security',
    index: '01',
    label: 'Seguridad',
    title: 'Seguridad urbana predictiva',
    caption: 'Zona B + Nube EE. UU.',
    view: ZONE_BY_ID.b.camera,
    selection: { type: 'zone', zone: 'b', layer: 'risk' },
    layer: 'risk',
  },
  {
    id: 'energy',
    index: '02',
    label: 'Energía y agua',
    title: 'Sostenibilidad y energía',
    caption: 'Zona C + Nube UE.',
    view: ZONE_BY_ID.c.camera,
    selection: { type: 'zone', zone: 'c', layer: 'legal' },
    layer: 'legal',
  },
  {
    id: 'mobility',
    index: '03',
    label: 'Movilidad',
    title: 'Movilidad y conectividad',
    caption: 'Zona A.',
    view: ZONE_BY_ID.a.camera,
    selection: { type: 'zone', zone: 'a', layer: 'infra' },
    layer: 'infra',
  },
  {
    id: 'closing',
    index: '04',
    label: 'Recordatorio final',
    title: 'Ficha del proyecto',
    caption: 'Título, docente e integrantes.',
    view: { pos: [0, 210, 420], target: [0, 4, -8] },
    selection: null,
  },
]

export const OVERVIEW_VIEW = TOUR[0].view
