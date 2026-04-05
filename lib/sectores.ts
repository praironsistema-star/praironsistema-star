// ─────────────────────────────────────────────────────────────────────────────
// sectores.ts — Contenido estratégico por sector productivo
// Ruta destino: /lib/sectores.ts
// ─────────────────────────────────────────────────────────────────────────────

export interface Feature {
  icon: string
  title: string
  desc: string
}

export interface Stat {
  value: string
  label: string
}

export interface Sector {
  slug: string
  name: string
  tagline: string
  description: string
  heroIcon: string
  color: string        // color CSS principal del sector
  colorBg: string      // fondo suave
  stats: Stat[]
  features: Feature[]
  modules: string[]    // módulos del sistema que aplican
  cta: string
  metaTitle: string
  metaDesc: string
}

export const SECTORES: Sector[] = [
  {
    slug: 'agricultura',
    name: 'Agricultura & Cultivos',
    tagline: 'Control total del ciclo productivo, desde la siembra hasta la venta.',
    heroIcon: '🌿',
    color: '#15803d',
    colorBg: '#f0fdf4',
    description: 'PRAIRON transforma la gestión de cultivos agrícolas con trazabilidad completa por lote, control fitosanitario inteligente y análisis de laboratorio integrado. Desde las labores diarias de campo hasta los reportes financieros, todo en un solo sistema diseñado para el productor latinoamericano.',
    stats: [
      { value: '35%', label: 'Reducción en pérdidas por plagas' },
      { value: '2x',  label: 'Trazabilidad más rápida' },
      { value: '100%', label: 'Offline — sin señal funciona igual' },
    ],
    features: [
      { icon: '🗺️', title: 'Gestión de lotes por GPS', desc: 'Registra cada lote con coordenadas, área y cultivo asignado. Historial completo de labores por zona.' },
      { icon: '🧪', title: 'Laboratorio integrado', desc: 'Análisis de suelo, agua y tejido vegetal. Resultados históricos para decisiones de fertilización precisas.' },
      { icon: '🌿', title: 'Control fitosanitario', desc: 'Registro de plagas, enfermedades y tratamientos. Alertas automáticas según umbrales de daño económico.' },
      { icon: '📋', title: 'Tareo digital de jornaleros', desc: 'Registro diario de labores y trabajadores. Cálculo automático de nómina por labor realizada.' },
      { icon: '🔗', title: 'Trazabilidad QR por lote', desc: 'Genera un QR por lote con historial completo: insumos, tratamientos, cosecha y cadena de custodia.' },
      { icon: '📊', title: 'Benchmarking sectorial', desc: 'Compara tu rendimiento con el promedio del sector. Identifica dónde estás perdiendo y dónde ganas.' },
    ],
    modules: ['Cultivos', 'Laboratorio', 'Fitosanitario', 'Tareo', 'Trazabilidad', 'Inventario', 'Compras', 'Reportes'],
    cta: 'Ver demo para agricultores',
    metaTitle: 'PRAIRON para Agricultura — Gestión de cultivos inteligente',
    metaDesc: 'Sistema de gestión agrícola con trazabilidad por lote, laboratorio integrado, tareo digital y benchmarking sectorial para productores de LATAM.',
  },
  {
    slug: 'ganaderia',
    name: 'Ganadería',
    tagline: 'Cada animal registrado. Cada decisión respaldada por datos.',
    heroIcon: '🐄',
    color: '#92400e',
    colorBg: '#fffbeb',
    description: 'PRAIRON centraliza el registro de bovinos, porcinos y ovinos con trazabilidad individual, control sanitario completo y gestión de reproducción. Sabe en tiempo real cuántos animales tienes, su estado sanitario y el costo exacto por cabeza.',
    stats: [
      { value: '100%', label: 'Trazabilidad individual por animal' },
      { value: '40%', label: 'Menos mortalidad con alertas tempranas' },
      { value: '1 min', label: 'Para registrar un tratamiento veterinario' },
    ],
    features: [
      { icon: '🐄', title: 'Registro individual por animal', desc: 'Ficha completa: raza, edad, peso, vacunas, tratamientos y genealogía. Historial desde el nacimiento.' },
      { icon: '💉', title: 'Plan sanitario y vacunación', desc: 'Programa de vacunación con recordatorios automáticos. Registro de enfermedades y tratamientos veterinarios.' },
      { icon: '📈', title: 'Control de pesaje y ganancias', desc: 'Registra pesajes periódicos y calcula ganancia diaria de peso (GDP) por lote y por animal.' },
      { icon: '🔔', title: 'Alertas de celo y partos', desc: 'NOAH detecta fechas probables de parto y celo para maximizar la eficiencia reproductiva.' },
      { icon: '💰', title: 'Costo por cabeza en tiempo real', desc: 'Suma automática de alimentación, sanidad y mano de obra. Sabe exactamente qué te cuesta cada animal.' },
      { icon: '📋', title: 'Tareo de vaqueros y ordeñadores', desc: 'Registro de labores diarias: ordeño, alimentación, supervisión. Nómina automática por faena.' },
    ],
    modules: ['Animales', 'Laboratorio', 'Fitosanitario', 'Tareo', 'Inventario', 'Compras', 'RRHH', 'Reportes'],
    cta: 'Ver demo para ganaderos',
    metaTitle: 'PRAIRON para Ganadería — Control bovino y pecuario',
    metaDesc: 'Gestión ganadera con trazabilidad individual, plan sanitario, control reproductivo y costo por cabeza en tiempo real para productores latinoamericanos.',
  },
  {
    slug: 'avicultura',
    name: 'Avicultura',
    tagline: 'Producción avícola sin puntos ciegos.',
    heroIcon: '🐔',
    color: '#b45309',
    colorBg: '#fffbeb',
    description: 'PRAIRON es el sistema de gestión avícola diseñado para granjas de pollo de engorde, ponedoras y reproductoras. Controla mortalidad, consumo de alimento, conversión alimenticia y resultados por galpón con precisión industrial.',
    stats: [
      { value: 'FCR', label: 'Conversión alimenticia en tiempo real' },
      { value: '↓30%', label: 'Reducción de mortalidad con alertas' },
      { value: '∞',    label: 'Galpones simultáneos sin límite' },
    ],
    features: [
      { icon: '🏠', title: 'Gestión por galpón', desc: 'Cada galpón es una unidad productiva independiente con registro de lotes, edad, densidad y resultado final.' },
      { icon: '🌡️', title: 'Control ambiental', desc: 'Registra temperatura, humedad y ventilación. Correlaciona condiciones con mortalidad y conversión.' },
      { icon: '🌾', title: 'Consumo y conversión alimenticia', desc: 'Registro diario de alimento suministrado. Calcula FCR automáticamente y alerta cuando se desvía.' },
      { icon: '💀', title: 'Registro de mortalidad', desc: 'Causa de muerte, edad y peso al retiro. Análisis de tendencias para ajustar manejo sanitario.' },
      { icon: '💉', title: 'Programa sanitario', desc: 'Vacunaciones, medicamentos y vitaminas programados. Alertas de aplicación y costos de sanidad.' },
      { icon: '📊', title: 'Resultado por lote', desc: 'Al cierre del lote: índice productivo, rentabilidad y comparativo con lotes anteriores del mismo galpón.' },
    ],
    modules: ['Avicultura', 'Inventario', 'Compras', 'Laboratorio', 'Tareo', 'RRHH', 'Reportes', 'Benchmark'],
    cta: 'Ver demo para avicultores',
    metaTitle: 'PRAIRON para Avicultura — Sistema de gestión avícola',
    metaDesc: 'Control avícola por galpón con FCR en tiempo real, registro de mortalidad, programa sanitario y resultado por lote para granjas de LATAM.',
  },
  {
    slug: 'palma',
    name: 'Palma Africana',
    tagline: 'Del lote al extractora. Control total de la cadena palmera.',
    heroIcon: '🌴',
    color: '#15803d',
    colorBg: '#f0fdf4',
    description: 'PRAIRON cubre el ciclo completo de la palma africana: desde el registro de lotes por estado fenológico hasta la liquidación con la extractora. Controla costos de corte, rendimientos de extracción y trazabilidad de aceite crudo por unidad productiva.',
    stats: [
      { value: '↑15%', label: 'Rendimiento de extracción con datos precisos' },
      { value: '100%', label: 'Trazabilidad por lote hasta la extractora' },
      { value: 'RFF',  label: 'Control de racimos por corte y contratista' },
    ],
    features: [
      { icon: '🗺️', title: 'Gestión de lotes fenológicos', desc: 'Estado de maduración por lote, fecha estimada de cosecha y programación de corte por contratista.' },
      { icon: '✂️', title: 'Control de cosecha y RFF', desc: 'Registro de racimos por corte, contratista y lote. Cálculo de toneladas cosechadas y costo por ton.' },
      { icon: '🏭', title: 'Liquidación con extractora', desc: 'Registro de entregas, análisis de aceite (% extracción, impurezas) y conciliación de liquidaciones.' },
      { icon: '🧪', title: 'Análisis de laboratorio', desc: 'pH de suelo, análisis foliar y plan de fertilización. Historial de resultados por lote.' },
      { icon: '🌱', title: 'Plan de renovación', desc: 'Identifica lotes de baja productividad, calcula edad promedio y proyecta renovaciones.' },
      { icon: '💧', title: 'Gestión de riego', desc: 'Registro de horas de riego, consumo de agua y correlación con rendimiento por lote.' },
    ],
    modules: ['Palma', 'Laboratorio', 'Trazabilidad', 'Tareo', 'Compras', 'Ventas', 'Reportes', 'Benchmark'],
    cta: 'Ver demo para palmicultores',
    metaTitle: 'PRAIRON para Palma Africana — Gestión palmera integral',
    metaDesc: 'Sistema para palmicultores con control de lotes, cosecha RFF, liquidación con extractora y trazabilidad de aceite crudo para productores de LATAM.',
  },
  {
    slug: 'caficultura',
    name: 'Caficultura',
    tagline: 'Del cafeto a la taza. Gestión que eleva la calidad y el precio.',
    heroIcon: '☕',
    color: '#7c2d12',
    colorBg: '#fff7ed',
    description: 'PRAIRON está diseñado para los 540,000 caficultores de Colombia y el millón en toda LATAM. Controla floración, cosecha selectiva, beneficio húmedo y análisis de taza. La trazabilidad completa abre mercados de exportación y precios premium.',
    stats: [
      { value: '540K', label: 'Caficultores en Colombia solos' },
      { value: '+25%', label: 'Precio con trazabilidad de origen' },
      { value: '100%', label: 'Offline — funciona en zonas sin señal' },
    ],
    features: [
      { icon: '🌸', title: 'Control de floración y cosecha', desc: 'Registro de floraciones por lote para proyectar cosecha. Planificación de cuadrillas de recolección.' },
      { icon: '⚖️', title: 'Pesaje y rendimiento por lote', desc: 'Registro de café cereza y pergamino por lote. Cálculo de factor de rendimiento y calidad de cosecha.' },
      { icon: '💧', title: 'Beneficio húmedo', desc: 'Control de despulpado, fermentación y secado. Parámetros de calidad que impactan directamente el precio.' },
      { icon: '☕', title: 'Análisis de taza (Cupping)', desc: 'Registro de puntajes Q-grader por lote. Historial de perfiles de sabor para mercados especializados.' },
      { icon: '🔗', title: 'Trazabilidad de origen', desc: 'QR por lote con origen, productor, altitud, variedad y proceso. Credencial para exportación y precios premium.' },
      { icon: '🌍', title: 'Certificaciones', desc: 'Control de buenas prácticas para Rainforest Alliance, 4C, Orgánico. Documentación automática.' },
    ],
    modules: ['Cultivos', 'Laboratorio', 'Trazabilidad', 'Tareo', 'Certificaciones', 'ODS', 'Ventas', 'Reportes'],
    cta: 'Ver demo para caficultores',
    metaTitle: 'PRAIRON para Caficultura — Gestión cafetera inteligente',
    metaDesc: 'Sistema para caficultores con control de floración, beneficio húmedo, análisis de taza y trazabilidad de origen para acceder a mercados premium.',
  },
  {
    slug: 'acuicultura',
    name: 'Acuicultura',
    tagline: 'Control preciso de cada estanque, desde la siembra hasta la cosecha.',
    heroIcon: '🐟',
    color: '#0369a1',
    colorBg: '#f0f9ff',
    description: 'PRAIRON gestiona la producción de tilapia, trucha y camarón con control de densidad de siembra, calidad del agua, factor de conversión alimenticia (FCR) y cosecha. Reduce la mortalidad con alertas tempranas basadas en parámetros productivos.',
    stats: [
      { value: 'FCR', label: 'Conversión alimenticia por estanque' },
      { value: '↓25%', label: 'Mortalidad con monitoreo de parámetros' },
      { value: '∞',   label: 'Estanques gestionados simultáneamente' },
    ],
    features: [
      { icon: '🏊', title: 'Gestión por estanque', desc: 'Cada estanque es una unidad independiente: especie, densidad de siembra, fecha y lote de alevines.' },
      { icon: '🌡️', title: 'Calidad del agua', desc: 'Registro de temperatura, pH, oxígeno disuelto y turbidez. Alertas cuando los parámetros salen del rango óptimo.' },
      { icon: '🌾', title: 'Alimentación y FCR', desc: 'Control de raciones diarias por estanque. Cálculo automático de FCR y alerta de desviaciones.' },
      { icon: '📏', title: 'Biometrías periódicas', desc: 'Registro de peso y talla para calcular crecimiento real vs esperado. Ajuste de raciones por biomasa.' },
      { icon: '🐟', title: 'Cosecha y rendimiento', desc: 'Registro de cosecha por estanque: peso total, talla promedio, porcentaje de supervivencia y resultado.' },
      { icon: '🧪', title: 'Análisis de laboratorio', desc: 'Resultados de agua y tejido. Historial por estanque para identificar patrones de enfermedad.' },
    ],
    modules: ['Acuicultura', 'Laboratorio', 'Inventario', 'Compras', 'Tareo', 'Reportes', 'Benchmark'],
    cta: 'Ver demo para acuicultores',
    metaTitle: 'PRAIRON para Acuicultura — Gestión de estanques piscícolas',
    metaDesc: 'Sistema para tilapia, trucha y camarón con control de calidad del agua, FCR por estanque, biometrías y alertas de mortalidad para acuicultores.',
  },
  {
    slug: 'apicultura',
    name: 'Apicultura',
    tagline: 'Cada colmena, cada reina, cada cosecha — bajo control.',
    heroIcon: '🍯',
    color: '#b45309',
    colorBg: '#fffbeb',
    description: 'PRAIRON es el primer sistema de gestión apícola completo para LATAM. Registra el estado de cada colmena, el comportamiento de las reinas, los tratamientos contra varroa y la producción de miel con trazabilidad de origen para mercados premium.',
    stats: [
      { value: '↑20%', label: 'Producción con manejo datos-driven' },
      { value: '100%', label: 'Trazabilidad de miel por colmenar' },
      { value: '∞',   label: 'Colmenas y apiarios registrables' },
    ],
    features: [
      { icon: '🏠', title: 'Gestión por apiario y colmena', desc: 'Cada colmena con su historial: reina, población, reservas de miel, estado sanitario y revisiones.' },
      { icon: '👸', title: 'Control de reinas', desc: 'Registro de edad, raza y rendimiento por reina. Alertas de reposición y programas de recría.' },
      { icon: '🦠', title: 'Tratamiento varroa', desc: 'Programa de control con productos, dosis y fechas. Monitoreo de niveles de infestación por colmena.' },
      { icon: '🌸', title: 'Calendario de floraciones', desc: 'Registro de fuentes de néctar por zona. Planificación de traslados para maximizar producción.' },
      { icon: '🍯', title: 'Cosecha y producción', desc: 'Registro de cosecha por colmena y apiario. Cálculo de producción por temporada y promedio histórico.' },
      { icon: '🔗', title: 'Trazabilidad de miel', desc: 'QR por lote de miel con origen floral, colmenar, productor y fecha. Acceso a mercados premium y exportación.' },
    ],
    modules: ['Apicultura', 'Calendario', 'Trazabilidad', 'Inventario', 'Certificaciones', 'Ventas', 'Reportes'],
    cta: 'Ver demo para apicultores',
    metaTitle: 'PRAIRON para Apicultura — Sistema de gestión de colmenas',
    metaDesc: 'Gestión apícola con registro de colmenas, control de varroa, trazabilidad de miel y calendario de floraciones para productores latinoamericanos.',
  },
  {
    slug: 'cana',
    name: 'Caña de Azúcar',
    tagline: 'Control de suertes, TCH y liquidación con el ingenio en un solo lugar.',
    heroIcon: '🌾',
    color: '#15803d',
    colorBg: '#f0fdf4',
    description: 'PRAIRON gestiona el ciclo completo de la caña de azúcar para cañicultores independientes y proveedores de ingenio. Controla suertes por estado fenológico, toneladas de caña por hectárea (TCH), POL, costos de corte por contratista y liquidación con el ingenio.',
    stats: [
      { value: 'TCH', label: 'Toneladas de caña por hectárea en tiempo real' },
      { value: 'POL', label: 'Registro de análisis de sacarosa por suerte' },
      { value: '↑18%', label: 'Rentabilidad con optimización de costos de corte' },
    ],
    features: [
      { icon: '🗺️', title: 'Gestión de suertes', desc: 'Cada suerte con su variedad, fecha de siembra, ciclo (planta o soca) y estado fenológico actual.' },
      { icon: '🌾', title: 'Programación de cosecha', desc: 'Fechas estimadas de maduración por suerte. Programación de frentes de cosecha y contratistas de corte.' },
      { icon: '⚖️', title: 'TCH y rendimiento', desc: 'Toneladas cosechadas vs proyectadas por suerte. Historial de TCH por variedad para selección semilla.' },
      { icon: '🏭', title: 'Liquidación con el ingenio', desc: 'Registro de entregas, análisis de POL e ICR, y conciliación de la liquidación del ingenio.' },
      { icon: '💧', title: 'Control de riego', desc: 'Programas de riego por suerte con registro de horas, caudal y costo por ciclo.' },
      { icon: '🧪', title: 'Fertilización y sanidad', desc: 'Plan de fertilización por análisis de suelo. Registro de aplicaciones y control de barrenador y roya.' },
    ],
    modules: ['Cultivos', 'Laboratorio', 'Trazabilidad', 'Tareo', 'Compras', 'Ventas', 'Reportes', 'Benchmark'],
    cta: 'Ver demo para cañicultores',
    metaTitle: 'PRAIRON para Caña de Azúcar — Gestión cañera integral',
    metaDesc: 'Sistema para cañicultores con control de suertes, TCH, POL, liquidación con ingenio y optimización de costos de corte para productores latinoamericanos.',
  },
]

export function getSector(slug: string): Sector | undefined {
  return SECTORES.find(s => s.slug === slug)
}
