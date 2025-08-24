# EHopN Dashboard - Next.js 14 App

A modern dashboard application built with Next.js 14, TypeScript, TailwindCSS, and react-i18next with support for English, German, and Arabic languages.

## Features

- **Next.js 14** with App Router
- **TypeScript** for type safety
- **TailwindCSS** for styling
- **react-i18next** for internationalization
- **Responsive Design** with mobile-first approach
- **Multi-language Support** (English, German, Arabic)
- **RTL Support** for Arabic language
- **Modern UI/UX** with beautiful components

## Pages

- `/login` - User authentication
- `/register` - User registration
- `/dashboard` - Main dashboard with statistics and recent activity
- `/invoices` - Invoice management with table view
- `/settings` - User settings with tabbed interface

## Shared Layout Features

- **Navigation Bar** with:
  - Language switcher (EN/DE/AR)
  - Upgrade button
  - Logout functionality
  - Responsive mobile menu
- **Consistent Design** across all pages
- **RTL Support** for Arabic language

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Dashboard page
│   ├── invoices/          # Invoices page
│   ├── login/             # Login page
│   ├── register/          # Register page
│   ├── settings/          # Settings page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable components
│   ├── I18nProvider.tsx   # i18n provider
│   └── Layout.tsx         # Shared layout with navbar
├── lib/                   # Utility libraries
│   ├── i18n.ts           # i18n configuration
│   └── locales/          # Translation files
│       ├── en.json       # English translations
│       ├── de.json       # German translations
│       └── ar.json       # Arabic translations
├── package.json          # Dependencies and scripts
├── tailwind.config.js    # TailwindCSS configuration
├── tsconfig.json         # TypeScript configuration
└── next.config.js        # Next.js configuration
```

## Internationalization

The app supports three languages:
- **English (en)** - Default language
- **German (de)** - German translations
- **Arabic (ar)** - Arabic translations with RTL support

### Adding New Translations

1. Add new keys to all language files in `lib/locales/`
2. Use the `useTranslation` hook in components:
```typescript
import { useTranslation } from 'react-i18next'

const { t } = useTranslation()
t('common.login')
```

### Language Switching

The language switcher is available in the navigation bar and automatically:
- Changes the UI language
- Sets document direction (RTL for Arabic)
- Persists the selection in localStorage

## Styling

The app uses TailwindCSS with a custom color scheme:
- Primary colors: Blue variants
- Responsive design with mobile-first approach
- Custom components with consistent styling

## Development

### Adding New Pages

1. Create a new directory in `app/`
2. Add a `page.tsx` file
3. Use the `Layout` component for pages that need the navbar
4. Add translations for new content

### Component Guidelines

- Use TypeScript interfaces for props
- Implement responsive design
- Use the translation system for all text
- Follow the existing styling patterns

## Deployment

The app can be deployed to any platform that supports Next.js:

- **Vercel** (recommended)
- **Netlify**
- **AWS Amplify**
- **Self-hosted**

### Build for Production

```bash
npm run build
npm run start
```

## Contributing

1. Follow the existing code structure
2. Add TypeScript types for new features
3. Include translations for all supported languages
4. Test responsive design on different screen sizes
5. Ensure RTL support works correctly for Arabic

## License

This project is licensed under the MIT License.
