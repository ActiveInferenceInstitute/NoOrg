/**
 * Internationalization (i18n) System
 *
 * Comprehensive internationalization support for the NoOrg multi-agent framework.
 * Supports multiple languages, locales, date/time formatting, and cultural adaptations.
 */
export interface LocaleConfig {
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
export interface Translation {
    [key: string]: string | Translation;
}
export interface I18nConfig {
    defaultLocale: string;
    supportedLocales: string[];
    fallbackLocale: string;
    cacheTranslations: boolean;
    cacheTTL: number;
    enablePluralization: boolean;
    enableInterpolation: boolean;
    enableFormatting: boolean;
}
export declare class I18n {
    private static instance;
    private config;
    private locales;
    private translations;
    private cache;
    private currentLocale;
    private constructor();
    static getInstance(config?: I18nConfig): I18n;
    /**
     * Initialize supported locales with their configurations
     */
    private initializeLocales;
    /**
     * Set the current locale
     */
    setLocale(locale: string): void;
    /**
     * Get the current locale
     */
    getLocale(): string;
    /**
     * Get available locales
     */
    getAvailableLocales(): string[];
    /**
     * Get locale configuration
     */
    getLocaleConfig(locale?: string): LocaleConfig;
    /**
     * Load translations for a locale
     */
    loadTranslations(locale: string, translations: Translation): Promise<void>;
    /**
     * Translate a key
     */
    translate(key: string, params?: Record<string, any>, locale?: string): string;
    /**
     * Translate with pluralization support
     */
    translatePlural(key: string, count: number, params?: Record<string, any>, locale?: string): string;
    /**
     * Format a number according to locale
     */
    formatNumber(value: number, locale?: string): string;
    /**
     * Format currency according to locale
     */
    formatCurrency(value: number, locale?: string): string;
    /**
     * Format date according to locale
     */
    formatDate(date: Date, locale?: string): string;
    /**
     * Format time according to locale
     */
    formatTime(date: Date, locale?: string): string;
    /**
     * Format date and time together
     */
    formatDateTime(date: Date, locale?: string): string;
    /**
     * Clear translation cache
     */
    clearCache(): void;
    /**
     * Get translation statistics
     */
    getStats(): {
        locales: number;
        totalTranslations: number;
        cacheSize: number;
        cacheHitRate: number;
    };
    private flattenTranslations;
    private getNestedTranslation;
    private interpolate;
    private getPluralSuffix;
    private countTranslations;
    private calculateCacheHitRate;
}
export declare const i18n: I18n;
//# sourceMappingURL=i18n.d.ts.map