import React from "react";

export interface LanguageOption {
  /** Display name of the language (e.g., "English", "Français") */
  label: string;
  /** ISO 639-1 language code (e.g., "en", "fr") */
  value: string;
  /** Flag country code for FlagCDN (e.g., "us", "fr", "gb") or custom flag image/emoji */
  flag?: string;
}

export interface UseGoogleTranslateOptions {
  /** The source language of the application (e.g., "fr"). Default is "en". */
  defaultLanguage?: string;
  /** List of languages to display in the selector. Defaults to a comprehensive global list. */
  languages?: LanguageOption[];
  /** Callback fired when the language changes. */
  onLanguageChange?: (lang: string) => void;
  /** Whether to show the original Google Translate hover tooltips. Default is false. */
  showTooltip?: boolean;
  /** Cookie domain to bind the googtrans cookie to. Defaults to location.hostname. */
  cookieDomain?: string;
  /** LocalStorage key to cache the active language. Default is "google_translate_lang". */
  storageKey?: string;
}

export interface UseGoogleTranslateResult {
  /** The current active language code (e.g., "en") */
  currentLanguage: string | null;
  /** Whether the current language is the source default language */
  isDefault: boolean;
  /** Whether the Google Translate API is initialized */
  isInitialized: boolean;
  /** Whether the Google Translate API is loading */
  isLoading: boolean;
  /** The active language option object */
  current: LanguageOption | undefined;
  /** The flag CDN URL for the active language, if any */
  currentFlag: string | null;
  /** Function to switch active translation language */
  changeLanguage: (lang: string) => void;
  /** The list of languages configured for the selector */
  languages: LanguageOption[];
}

export interface GoogleTranslateProps {
  /** Custom language list to override the default global list */
  customLanguages?: LanguageOption[];
  /** Additional CSS class for the root wrapper element */
  className?: string;
  /** Inline styles for the root wrapper element */
  style?: React.CSSProperties;
  /** Additional CSS class for the trigger button */
  buttonClassName?: string;
  /** Inline styles for the trigger button */
  buttonStyle?: React.CSSProperties;
  /** Additional CSS class for the dropdown menu container */
  dropdownClassName?: string;
  /** Inline styles for the dropdown menu container */
  dropdownStyle?: React.CSSProperties;
  /** Configuration options for the useGoogleTranslate hook */
  options?: UseGoogleTranslateOptions;
  /** Custom function to generate flag URLs. Defaults to FlagCDN. */
  flagUrlTemplate?: (flagCode: string) => string;
  /** Render prop to customize the entire floating trigger button */
  renderButton?: (
    selected: LanguageOption | undefined,
    isOpen: boolean,
    toggle: () => void
  ) => React.ReactNode;
  /** Render prop to customize the dropdown list */
  renderDropdown?: (
    languages: LanguageOption[],
    currentLanguage: string | null,
    selectLanguage: (lang: string) => void,
    isOpen: boolean
  ) => React.ReactNode;
}

export interface GoogleTranslateDropdownProps {
  /** Custom language list to override the default global list */
  customLanguages?: LanguageOption[];
  /** Additional CSS class for the select wrapper */
  className?: string;
  /** Inline styles for the select wrapper */
  style?: React.CSSProperties;
  /** Additional CSS class for the native select element */
  selectClassName?: string;
  /** Inline styles for the native select element */
  selectStyle?: React.CSSProperties;
  /** Configuration options for the useGoogleTranslate hook */
  options?: UseGoogleTranslateOptions;
}
