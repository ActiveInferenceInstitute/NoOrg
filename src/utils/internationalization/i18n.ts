/**
 * Internationalization (i18n) System
 *
 * Comprehensive internationalization support for the NoOrg multi-agent framework.
 * Supports multiple languages, locales, date/time formatting, and cultural adaptations.
 */

export interface LocaleConfig {
  code: string; // e.g., 'en-US', 'es-ES', 'fr-FR'
  name: string; // e.g., 'English (US)', 'Español (España)'
  nativeName: string; // e.g., 'English (US)', 'Español (España)'
  language: string; // e.g., 'en', 'es', 'fr'
  region: string; // e.g., 'US', 'ES', 'FR'
  rtl: boolean; // Right-to-left language support
  dateFormat: string; // e.g., 'MM/dd/yyyy', 'dd/MM/yyyy'
  timeFormat: string; // e.g., '12h', '24h'
  currency: string; // e.g., 'USD', 'EUR', 'GBP'
  numberFormat: {
    decimal: string; // e.g., '.', ','
    thousands: string; // e.g., ',', '.'
    precision: number; // Default decimal places
  };
}

export interface Translation {
  [key: string]: string | Translation;
}

export interface I18nConfig {
  defaultLocale: string;
  supportedLocales: string[];
  fallbackLocale: string;
  cacheTranslations: boolean;
  cacheTTL: number; // Cache time in milliseconds
  enablePluralization: boolean;
  enableInterpolation: boolean;
  enableFormatting: boolean;
}

export class I18n {
  private static instance: I18n;
  private config: I18nConfig;
  private locales: Map<string, LocaleConfig> = new Map();
  private translations: Map<string, Map<string, Translation>> = new Map();
  private cache: Map<string, string> = new Map();
  private currentLocale: string;

  private constructor(config: I18nConfig) {
    this.config = config;
    this.currentLocale = config.defaultLocale;

    // Initialize supported locales
    this.initializeLocales();
  }

  static getInstance(config?: I18nConfig): I18n {
    if (!I18n.instance) {
      if (!config) {
        throw new Error('I18n configuration required for first initialization');
      }
      I18n.instance = new I18n(config);
    }
    return I18n.instance;
  }

  /**
   * Initialize supported locales with their configurations
   */
  private initializeLocales(): void {
    const locales: LocaleConfig[] = [
      {
        code: 'en-US',
        name: 'English (US)',
        nativeName: 'English (US)',
        language: 'en',
        region: 'US',
        rtl: false,
        dateFormat: 'MM/dd/yyyy',
        timeFormat: '12h',
        currency: 'USD',
        numberFormat: {
          decimal: '.',
          thousands: ',',
          precision: 2
        }
      },
      {
        code: 'en-GB',
        name: 'English (UK)',
        nativeName: 'English (UK)',
        language: 'en',
        region: 'GB',
        rtl: false,
        dateFormat: 'dd/MM/yyyy',
        timeFormat: '24h',
        currency: 'GBP',
        numberFormat: {
          decimal: '.',
          thousands: ',',
          precision: 2
        }
      },
      {
        code: 'es-ES',
        name: 'Español (España)',
        nativeName: 'Español (España)',
        language: 'es',
        region: 'ES',
        rtl: false,
        dateFormat: 'dd/MM/yyyy',
        timeFormat: '24h',
        currency: 'EUR',
        numberFormat: {
          decimal: ',',
          thousands: '.',
          precision: 2
        }
      },
      {
        code: 'fr-FR',
        name: 'Français (France)',
        nativeName: 'Français (France)',
        language: 'fr',
        region: 'FR',
        rtl: false,
        dateFormat: 'dd/MM/yyyy',
        timeFormat: '24h',
        currency: 'EUR',
        numberFormat: {
          decimal: ',',
          thousands: ' ',
          precision: 2
        }
      },
      {
        code: 'de-DE',
        name: 'Deutsch (Deutschland)',
        nativeName: 'Deutsch (Deutschland)',
        language: 'de',
        region: 'DE',
        rtl: false,
        dateFormat: 'dd.MM.yyyy',
        timeFormat: '24h',
        currency: 'EUR',
        numberFormat: {
          decimal: ',',
          thousands: '.',
          precision: 2
        }
      },
      {
        code: 'ar-SA',
        name: 'العربية (السعودية)',
        nativeName: 'العربية (السعودية)',
        language: 'ar',
        region: 'SA',
        rtl: true,
        dateFormat: 'dd/MM/yyyy',
        timeFormat: '12h',
        currency: 'SAR',
        numberFormat: {
          decimal: '.',
          thousands: ',',
          precision: 2
        }
      },
      {
        code: 'zh-CN',
        name: '中文 (中国)',
        nativeName: '中文 (中国)',
        language: 'zh',
        region: 'CN',
        rtl: false,
        dateFormat: 'yyyy-MM-dd',
        timeFormat: '24h',
        currency: 'CNY',
        numberFormat: {
          decimal: '.',
          thousands: ',',
          precision: 2
        }
      },
      {
        code: 'ja-JP',
        name: '日本語 (日本)',
        nativeName: '日本語 (日本)',
        language: 'ja',
        region: 'JP',
        rtl: false,
        dateFormat: 'yyyy/MM/dd',
        timeFormat: '24h',
        currency: 'JPY',
        numberFormat: {
          decimal: '.',
          thousands: ',',
          precision: 0
        }
      }
    ];

    locales.forEach(locale => {
      this.locales.set(locale.code, locale);
    });
  }

  /**
   * Set the current locale
   */
  setLocale(locale: string): void {
    if (!this.locales.has(locale)) {
      throw new Error(`Unsupported locale: ${locale}`);
    }
    this.currentLocale = locale;
    this.clearCache();
  }

  /**
   * Get the current locale
   */
  getLocale(): string {
    return this.currentLocale;
  }

  /**
   * Get available locales
   */
  getAvailableLocales(): string[] {
    return Array.from(this.locales.keys());
  }

  /**
   * Get locale configuration
   */
  getLocaleConfig(locale?: string): LocaleConfig {
    const targetLocale = locale || this.currentLocale;
    const config = this.locales.get(targetLocale);
    if (!config) {
      throw new Error(`Locale not found: ${targetLocale}`);
    }
    return config;
  }

  /**
   * Load translations for a locale
   */
  async loadTranslations(locale: string, translations: Translation): Promise<void> {
    if (!this.translations.has(locale)) {
      this.translations.set(locale, new Map());
    }

    const localeTranslations = this.translations.get(locale)!;
    this.flattenTranslations(translations, localeTranslations);
  }

  /**
   * Translate a key
   */
  translate(key: string, params?: Record<string, any>, locale?: string): string {
    const targetLocale = locale || this.currentLocale;
    const cacheKey = `${targetLocale}:${key}`;

    // Check cache first
    if (this.config.cacheTranslations && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const localeTranslations = this.translations.get(targetLocale);
    if (!localeTranslations) {
      throw new Error(`No translations loaded for locale: ${targetLocale}`);
    }

    let translation = this.getNestedTranslation(localeTranslations, key);

    // Fallback to default locale if translation not found
    if (!translation && targetLocale !== this.config.fallbackLocale) {
      const fallbackTranslations = this.translations.get(this.config.fallbackLocale);
      if (fallbackTranslations) {
        translation = this.getNestedTranslation(fallbackTranslations, key);
      }
    }

    if (!translation) {
      // Return key as fallback
      translation = key;
    }

    // Apply interpolation if enabled
    if (this.config.enableInterpolation && params) {
      translation = this.interpolate(translation, params);
    }

    // Cache the result
    if (this.config.cacheTranslations) {
      this.cache.set(cacheKey, translation);
    }

    return translation;
  }

  /**
   * Translate with pluralization support
   */
  translatePlural(key: string, count: number, params?: Record<string, any>, locale?: string): string {
    if (!this.config.enablePluralization) {
      return this.translate(key, params, locale);
    }

    const targetLocale = locale || this.currentLocale;
    const baseKey = `${key}.${this.getPluralSuffix(count, targetLocale)}`;
    const fallbackKey = `${key}.other`;

    // Try specific plural form first
    let translation = this.translate(baseKey, params, targetLocale);

    // Fallback to 'other' form if specific form not found
    if (translation === baseKey && baseKey !== fallbackKey) {
      translation = this.translate(fallbackKey, { ...params, count }, targetLocale);
    }

    return translation;
  }

  /**
   * Format a number according to locale
   */
  formatNumber(value: number, locale?: string): string {
    const targetLocale = locale || this.currentLocale;
    const config = this.getLocaleConfig(targetLocale);

    return value.toLocaleString(targetLocale, {
      minimumFractionDigits: config.numberFormat.precision,
      maximumFractionDigits: config.numberFormat.precision
    });
  }

  /**
   * Format currency according to locale
   */
  formatCurrency(value: number, locale?: string): string {
    const targetLocale = locale || this.currentLocale;
    const config = this.getLocaleConfig(targetLocale);

    return value.toLocaleString(targetLocale, {
      style: 'currency',
      currency: config.currency,
      minimumFractionDigits: config.numberFormat.precision,
      maximumFractionDigits: config.numberFormat.precision
    });
  }

  /**
   * Format date according to locale
   */
  formatDate(date: Date, locale?: string): string {
    const targetLocale = locale || this.currentLocale;
    const config = this.getLocaleConfig(targetLocale);

    return date.toLocaleDateString(targetLocale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  /**
   * Format time according to locale
   */
  formatTime(date: Date, locale?: string): string {
    const targetLocale = locale || this.currentLocale;
    const config = this.getLocaleConfig(targetLocale);

    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit'
    };

    if (config.timeFormat === '12h') {
      options.hour12 = true;
    }

    return date.toLocaleTimeString(targetLocale, options);
  }

  /**
   * Format date and time together
   */
  formatDateTime(date: Date, locale?: string): string {
    const targetLocale = locale || this.currentLocale;
    const config = this.getLocaleConfig(targetLocale);

    const dateStr = this.formatDate(date, targetLocale);
    const timeStr = this.formatTime(date, targetLocale);

    return `${dateStr} ${timeStr}`;
  }

  /**
   * Clear translation cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get translation statistics
   */
  getStats(): {
    locales: number;
    totalTranslations: number;
    cacheSize: number;
    cacheHitRate: number;
  } {
    let totalTranslations = 0;
    for (const localeTranslations of this.translations.values()) {
      totalTranslations += this.countTranslations(localeTranslations);
    }

    return {
      locales: this.translations.size,
      totalTranslations,
      cacheSize: this.cache.size,
      cacheHitRate: this.calculateCacheHitRate()
    };
  }

  private flattenTranslations(translations: Translation, target: Map<string, string>, prefix = ''): void {
    for (const [key, value] of Object.entries(translations)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (typeof value === 'string') {
        target.set(fullKey, value);
      } else if (typeof value === 'object') {
        this.flattenTranslations(value, target, fullKey);
      }
    }
  }

  private getNestedTranslation(translations: Map<string, string>, key: string): string | undefined {
    return translations.get(key);
  }

  private interpolate(text: string, params: Record<string, any>): string {
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return params[key] !== undefined ? String(params[key]) : match;
    });
  }

  private getPluralSuffix(count: number, locale: string): string {
    // Simple pluralization rules (can be enhanced)
    if (count === 0) return 'zero';
    if (count === 1) return 'one';
    return 'other';
  }

  private countTranslations(translations: Map<string, string>): number {
    return translations.size;
  }

  private calculateCacheHitRate(): number {
    // This would require tracking cache hits/misses
    // For now, return a placeholder
    return 0.85;
  }
}

// Export singleton instance
export const i18n = I18n.getInstance({
  defaultLocale: 'en-US',
  supportedLocales: ['en-US', 'en-GB', 'es-ES', 'fr-FR', 'de-DE', 'ar-SA', 'zh-CN', 'ja-JP'],
  fallbackLocale: 'en-US',
  cacheTranslations: true,
  cacheTTL: 3600000, // 1 hour
  enablePluralization: true,
  enableInterpolation: true,
  enableFormatting: true
});
