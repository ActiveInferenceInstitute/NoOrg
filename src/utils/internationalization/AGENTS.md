# Internationalization Technical Documentation

## Interfaces

### LocaleConfig

```typescript
interface LocaleConfig {
  code: string;
  name: string;
  nativeName: string;
  language: string;
  region: string;
  rtl: boolean;
  dateFormat: string;
  timeFormat: string;
  currency: string;
  numberFormat: {
    decimal: string;
    thousands: string;
    precision: number;
  };
}
```

### I18nConfig

```typescript
interface I18nConfig {
  defaultLocale: string;
  supportedLocales: string[];
  fallbackLocale: string;
  cacheTranslations: boolean;
  cacheTTL: number;
  enablePluralization: boolean;
  enableInterpolation: boolean;
  enableFormatting: boolean;
}
```

## I18n Class

### Static Methods

#### getInstance()

```typescript
static getInstance(config?: I18nConfig): I18n
```

Gets singleton instance.

**Parameters:**
- `config` (I18nConfig, optional): Configuration

**Returns:** `I18n` - Singleton instance

### Instance Methods

#### translate()

```typescript
translate(key: string, params?: Record<string, any>): string
```

Translates a key.

**Parameters:**
- `key` (string): Translation key
- `params` (Record<string, any>, optional): Parameters

**Returns:** `string` - Translated text

#### setLocale()

```typescript
setLocale(locale: string): void
```

Sets current locale.

**Parameters:**
- `locale` (string): Locale code

**Returns:** `void`

## Related Documentation

- [Internationalization README](./README.md)
- [Utils Documentation](../README.md)
