# Internationalization Utilities

Internationalization (i18n) support for the NoOrg framework.

## Overview

Provides multi-language support, locale management, and cultural formatting.

## Components

### I18n

Main internationalization class with:
- Multi-language translation
- Locale configuration
- Date/time formatting
- Number formatting
- Currency formatting

## Usage

```typescript
import { I18n } from './i18n';

const i18n = I18n.getInstance({
  defaultLocale: 'en-US',
  supportedLocales: ['en-US', 'es-ES', 'fr-FR']
});

i18n.setLocale('es-ES');
const text = i18n.translate('welcome.message');
```

## Related Documentation

- [Internationalization AGENTS.md](./AGENTS.md)
- [Utils Documentation](../README.md)
