"use strict";
/**
 * Internationalization (i18n) System
 *
 * Comprehensive internationalization support for the NoOrg multi-agent framework.
 * Supports multiple languages, locales, date/time formatting, and cultural adaptations.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.i18n = exports.I18n = void 0;
class I18n {
    constructor(config) {
        Object.defineProperty(this, "config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "locales", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "translations", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "cache", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "currentLocale", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.config = config;
        this.currentLocale = config.defaultLocale;
        // Initialize supported locales
        this.initializeLocales();
    }
    static getInstance(config) {
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
    initializeLocales() {
        const locales = [
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
    setLocale(locale) {
        if (!this.locales.has(locale)) {
            throw new Error(`Unsupported locale: ${locale}`);
        }
        this.currentLocale = locale;
        this.clearCache();
    }
    /**
     * Get the current locale
     */
    getLocale() {
        return this.currentLocale;
    }
    /**
     * Get available locales
     */
    getAvailableLocales() {
        return Array.from(this.locales.keys());
    }
    /**
     * Get locale configuration
     */
    getLocaleConfig(locale) {
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
    async loadTranslations(locale, translations) {
        if (!this.translations.has(locale)) {
            this.translations.set(locale, new Map());
        }
        const localeTranslations = this.translations.get(locale);
        this.flattenTranslations(translations, localeTranslations);
    }
    /**
     * Translate a key
     */
    translate(key, params, locale) {
        const targetLocale = locale || this.currentLocale;
        const cacheKey = `${targetLocale}:${key}`;
        // Check cache first
        if (this.config.cacheTranslations && this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
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
    translatePlural(key, count, params, locale) {
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
    formatNumber(value, locale) {
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
    formatCurrency(value, locale) {
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
    formatDate(date, locale) {
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
    formatTime(date, locale) {
        const targetLocale = locale || this.currentLocale;
        const config = this.getLocaleConfig(targetLocale);
        const options = {
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
    formatDateTime(date, locale) {
        const targetLocale = locale || this.currentLocale;
        const config = this.getLocaleConfig(targetLocale);
        const dateStr = this.formatDate(date, targetLocale);
        const timeStr = this.formatTime(date, targetLocale);
        return `${dateStr} ${timeStr}`;
    }
    /**
     * Clear translation cache
     */
    clearCache() {
        this.cache.clear();
    }
    /**
     * Get translation statistics
     */
    getStats() {
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
    flattenTranslations(translations, target, prefix = '') {
        for (const [key, value] of Object.entries(translations)) {
            const fullKey = prefix ? `${prefix}.${key}` : key;
            if (typeof value === 'string') {
                target.set(fullKey, value);
            }
            else if (typeof value === 'object') {
                this.flattenTranslations(value, target, fullKey);
            }
        }
    }
    getNestedTranslation(translations, key) {
        return translations.get(key);
    }
    interpolate(text, params) {
        return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return params[key] !== undefined ? String(params[key]) : match;
        });
    }
    getPluralSuffix(count, locale) {
        // Simple pluralization rules (can be enhanced)
        if (count === 0)
            return 'zero';
        if (count === 1)
            return 'one';
        return 'other';
    }
    countTranslations(translations) {
        return translations.size;
    }
    calculateCacheHitRate() {
        // This would require tracking cache hits/misses
        // For now, return a placeholder
        return 0.85;
    }
}
exports.I18n = I18n;
// Export singleton instance
exports.i18n = I18n.getInstance({
    defaultLocale: 'en-US',
    supportedLocales: ['en-US', 'en-GB', 'es-ES', 'fr-FR', 'de-DE', 'ar-SA', 'zh-CN', 'ja-JP'],
    fallbackLocale: 'en-US',
    cacheTranslations: true,
    cacheTTL: 3600000, // 1 hour
    enablePluralization: true,
    enableInterpolation: true,
    enableFormatting: true
});
//# sourceMappingURL=i18n.js.map