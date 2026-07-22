export interface CategoryTheme {
  ink: string
  ink80: string
  ink60: string
  muted: string
  muted30: string
  accent: string
  accentSoft: string
  accentDeep: string
  bg: string
  bg2: string
  surface: string
  line: string
  danger: string
  dangerBg: string
  success: string
  successBg: string
  warn: string
  warnBg: string
}

export interface WordmarkConfig {
  base: string
  italic: string
}

export interface CategoryDef {
  id: string
  slug: string
  name: string
  appName: string
  wordmark: WordmarkConfig
  tagline: string
  description: string
  heroTitle: string
  heroTitleEm: string
  theme: CategoryTheme
  defaultServices: { name: string; durationMins: number; price: number }[]
  landingVertical: string
}

const categories: Record<string, Omit<CategoryDef, 'id'>> = {
  barberia: {
    slug: 'barberia',
    name: 'Dorado',
    appName: 'miturno',
    wordmark: { base: 'mi', italic: 'turno' },
    tagline: 'Tu negocio, online y organizado en minutos.',
    description: 'Una agenda simple, una página propia para que tus clientes reserven solos.',
    heroTitle: 'Tu negocio,',
    heroTitleEm: 'online y organizado en minutos.',
    landingVertical: 'barberías & peluquerías',
    theme: {
      ink: '#1a1a1a',
      ink80: '#2c2c2c',
      ink60: '#4a4a4a',
      muted: '#6b6b6b',
      muted30: '#d6d3cc',
      accent: '#c9a84c',
      accentSoft: '#e6d7a4',
      accentDeep: '#a88a35',
      bg: '#f9f6f1',
      bg2: '#f2ede3',
      surface: '#ffffff',
      line: '#e7e1d4',
      danger: '#c0392b',
      dangerBg: '#fbeae7',
      success: '#4f7a3a',
      successBg: '#eaf1e3',
      warn: '#a86b1e',
      warnBg: '#fbf2e2',
    },
    defaultServices: [
      { name: 'Corte', durationMins: 30, price: 3500 },
      { name: 'Corte + Barba', durationMins: 45, price: 5000 },
      { name: 'Puntas', durationMins: 30, price: 2500 },
      { name: 'Full Color', durationMins: 45, price: 7500 },
    ],
  },

  clinica: {
    slug: 'clinica',
    name: 'Azul',
    appName: 'miturno',
    wordmark: { base: 'mi', italic: 'turno' },
    tagline: 'Tu negocio, online y organizado en minutos.',
    description: 'Una agenda simple, una página propia para que tus pacientes reserven solos.',
    heroTitle: 'Tu negocio,',
    heroTitleEm: 'online y organizado en minutos.',
    landingVertical: 'clínicas & consultorios',
    theme: {
      ink: '#1a2332',
      ink80: '#2c3a4f',
      ink60: '#4a5d78',
      muted: '#6b7f99',
      muted30: '#c8d4e3',
      accent: '#2e86ab',
      accentSoft: '#b5d8ec',
      accentDeep: '#1a6b8f',
      bg: '#f4f7fa',
      bg2: '#e8edf4',
      surface: '#ffffff',
      line: '#dce3ec',
      danger: '#c0392b',
      dangerBg: '#fbeae7',
      success: '#2d7d46',
      successBg: '#e6f2ea',
      warn: '#a86b1e',
      warnBg: '#fbf2e2',
    },
    defaultServices: [
      { name: 'Consulta general', durationMins: 30, price: 8000 },
      { name: 'Control de rutina', durationMins: 20, price: 5000 },
      { name: 'Espirometría', durationMins: 45, price: 12000 },
    ],
  },

  estetica: {
    slug: 'estetica',
    name: 'Rosa',
    appName: 'miturno',
    wordmark: { base: 'mi', italic: 'turno' },
    tagline: 'Tu negocio, online y organizado en minutos.',
    description: 'Una agenda simple, una página propia para que tus clientes reserven solos.',
    heroTitle: 'Tu negocio,',
    heroTitleEm: 'online y organizado en minutos.',
    landingVertical: 'centros de estética & nails',
    theme: {
      ink: '#2d1b2e',
      ink80: '#423045',
      ink60: '#5e4b60',
      muted: '#7d6a80',
      muted30: '#d9cade',
      accent: '#d4728a',
      accentSoft: '#f0c8d4',
      accentDeep: '#b8556e',
      bg: '#faf5f7',
      bg2: '#f2e9ed',
      surface: '#ffffff',
      line: '#e4d6dc',
      danger: '#c0392b',
      dangerBg: '#fbeae7',
      success: '#4f7a3a',
      successBg: '#eaf1e3',
      warn: '#a86b1e',
      warnBg: '#fbf2e2',
    },
    defaultServices: [
      { name: 'Esmaltado tradicional', durationMins: 30, price: 3000 },
      { name: 'Esmaltado semipermanente', durationMins: 45, price: 5000 },
      { name: 'Capping + esmaltado', durationMins: 60, price: 7000 },
      { name: 'Depilación cejas', durationMins: 15, price: 2000 },
    ],
  },

  hairimplants: {
    slug: 'hairimplants',
    name: 'Verde',
    appName: 'miturno',
    wordmark: { base: 'mi', italic: 'turno' },
    tagline: 'Tu negocio, online y organizado en minutos.',
    description: 'Una agenda simple, una página propia para que tus pacientes reserven solos.',
    heroTitle: 'Tu negocio,',
    heroTitleEm: 'online y organizado en minutos.',
    landingVertical: 'clínicas capilares',
    theme: {
      ink: '#1a2e1a',
      ink80: '#2c452c',
      ink60: '#4a624a',
      muted: '#6b7f6b',
      muted30: '#c8d9c8',
      accent: '#3a9d6e',
      accentSoft: '#b0dcc4',
      accentDeep: '#2a7d55',
      bg: '#f2f7f4',
      bg2: '#e4ede7',
      surface: '#ffffff',
      line: '#d4e0d8',
      danger: '#c0392b',
      dangerBg: '#fbeae7',
      success: '#2d7d46',
      successBg: '#e6f2ea',
      warn: '#a86b1e',
      warnBg: '#fbf2e2',
    },
    defaultServices: [
      { name: 'Consulta inicial', durationMins: 45, price: 10000 },
      { name: 'Valoración capilar', durationMins: 30, price: 5000 },
      { name: 'Sesión PRP', durationMins: 60, price: 15000 },
    ],
  },
}

export const DEFAULT_CATEGORY_SLUG = 'barberia'

export function getCategoryDef(slug: string): CategoryDef {
  const cat = categories[slug]
  if (!cat) return getCategoryDef(DEFAULT_CATEGORY_SLUG)
  return { ...cat, id: slug }
}

export function getAllCategoryDefs(): CategoryDef[] {
  return Object.values(categories).map(c => ({ ...c, id: c.slug }))
}

export function themeToCssVars(theme: CategoryTheme): string {
  return `
  --c-ink: ${theme.ink};
  --c-ink-80: ${theme.ink80};
  --c-ink-60: ${theme.ink60};
  --c-muted: ${theme.muted};
  --c-muted-30: ${theme.muted30};
  --c-gold: ${theme.accent};
  --c-gold-soft: ${theme.accentSoft};
  --c-gold-deep: ${theme.accentDeep};
  --c-bg: ${theme.bg};
  --c-bg-2: ${theme.bg2};
  --c-surface: ${theme.surface};
  --c-line: ${theme.line};
  --c-danger: ${theme.danger};
  --c-danger-bg: ${theme.dangerBg};
  --c-success: ${theme.success};
  --c-success-bg: ${theme.successBg};
  --c-warn: ${theme.warn};
  --c-warn-bg: ${theme.warnBg};
`
}

export type CategorySlug = keyof typeof categories
