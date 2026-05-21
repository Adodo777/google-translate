# google-translate

A highly customizable, zero-dependency React package that seamlessly wraps Google Translate. It offers a headless React Hook for fully custom selector layouts, alongside high-quality pre-styled components (a Brutalist floating button and a clean dropdown).

Designed for production environments, Next.js (SSR), and Vite.

---

## Features

- 🌐 **Worldwide Compatibility**: Supports 85+ global languages out of the box.
- 🪶 **Zero Styling Dependencies**: Default styles are applied via inline JS objects. Works instantly in any project (Tailwind, Vanilla CSS, CSS Modules, Styled Components, etc.) without post-build CSS configuration.
- ⚙️ **Headless Core**: A powerful React Hook (`useGoogleTranslate`) manages singleton script injection, reactive synchronization across multiple components, cookie purging, and MutationObservers to clean up native Google Translate iframe banners.
- 🎨 **Fully Custom Render Props**: Complete control over the HTML structure and styles via `renderButton`, `renderDropdown`, and custom flags (`flagUrlTemplate`).
- ⚡ **Reload-less Transitions**: Syncs translation updates directly through Google's native dropdown element without a page reload if initialized.
- 📦 **Dual Output**: Ship with both CommonJS (CJS) and ES Modules (ESM) outputs via `tsup`.

---

## Installation

```bash
npm install google-translate
# or
yarn add google-translate
# or
pnpm add google-translate
```

---

## Usage

### 1. Default Floating Brutalist Selector

Drop it anywhere in your root layout. It loads the Google Translate script automatically, registers the observer, and provides a floating button in the bottom right corner.

```tsx
import { GoogleTranslate } from "google-translate";

export default function App() {
  return (
    <div>
      {/* Your application content */}
      <GoogleTranslate />
    </div>
  );
}
```

### 2. Standard Dropdown Selector

If you want a normal inline dropdown selector:

```tsx
import { GoogleTranslateDropdown } from "google-translate";

export default function Header() {
  return (
    <header>
      <Logo />
      <GoogleTranslateDropdown />
    </header>
  );
}
```

### 3. Headless Selector (Fully Custom)

Use the hook `useGoogleTranslate` to construct your own custom UI. Multiple hooks on the page will automatically sync their active language states.

```tsx
import { useGoogleTranslate } from "google-translate";

export function CustomSelector() {
  const { currentLanguage, changeLanguage, languages } = useGoogleTranslate({
    defaultLanguage: "fr", // Set default source language
  });

  return (
    <div className="custom-selector">
      <p>Active: {currentLanguage}</p>
      <div className="grid grid-cols-4 gap-2">
        {languages.map((lang) => (
          <button
            key={lang.value}
            onClick={() => changeLanguage(lang.value)}
            className={currentLanguage === lang.value ? "active" : ""}
          >
            {lang.label}
          </button>
        ))}
      </div>
    </div>
  );
}
```

---

## API Reference

### `useGoogleTranslate(options?: UseGoogleTranslateOptions)`

#### Options
| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `defaultLanguage` | `string` | `"en"` | The source language of your website. |
| `languages` | `LanguageOption[]` | *Comprehensive list* | Languages to display in selectors. |
| `onLanguageChange` | `(lang: string) => void` | `undefined` | Callback fired when the active language changes. |
| `showTooltip` | `boolean` | `false` | Show original Google Translate hover tooltips. |
| `cookieDomain` | `string` | `window.location.hostname` | Domain for the `googtrans` cookie. |
| `storageKey` | `string` | `"google_translate_lang"` | LocalStorage key to cache the translation state. |

#### Return Value (`UseGoogleTranslateResult`)
| Value | Type | Description |
| :--- | :--- | :--- |
| `currentLanguage` | `string \| null` | The current active language code (e.g., `"fr"`). |
| `isDefault` | `boolean` | `true` if current language matches `defaultLanguage`. |
| `isInitialized` | `boolean` | `true` if the Google Translate SDK has initialized. |
| `isLoading` | `boolean` | `true` if the SDK script is currently loading. |
| `current` | `LanguageOption \| undefined` | The active language option object. |
| `currentFlag` | `string \| null` | Flag CDN image URL for the active language. |
| `changeLanguage` | `(lang: string) => void` | Updates active language and performs translation. |
| `languages` | `LanguageOption[]` | List of languages configured for the selector. |

---

### `<GoogleTranslate />` Props

| Prop | Type | Description |
| :--- | :--- | :--- |
| `customLanguages` | `LanguageOption[]` | Override the default global list. |
| `className` | `string` | Custom CSS class for the root wrapper element. |
| `style` | `CSSProperties` | Inline styles for the root wrapper element. |
| `buttonClassName` | `string` | Custom CSS class for the trigger button. |
| `buttonStyle` | `CSSProperties` | Inline styles for the trigger button. |
| `dropdownClassName` | `string` | Custom CSS class for the dropdown menu container. |
| `dropdownStyle` | `CSSProperties` | Inline styles for the dropdown menu container. |
| `options` | `UseGoogleTranslateOptions` | Configuration options passed to `useGoogleTranslate`. |
| `flagUrlTemplate` | `(flagCode: string) => string` | Custom function to generate flag image URLs. |
| `renderButton` | `(selected: LanguageOption \| undefined, isOpen: boolean, toggle: () => void) => ReactNode` | Customize the trigger button. |
| `renderDropdown` | `(languages: LanguageOption[], currentLanguage: string \| null, selectLanguage: (lang: string) => void, isOpen: boolean) => ReactNode` | Customize the dropdown list. |

---

### `<GoogleTranslateDropdown />` Props

| Prop | Type | Description |
| :--- | :--- | :--- |
| `customLanguages` | `LanguageOption[]` | Override the default global list. |
| `className` | `string` | Custom CSS class for the select wrapper. |
| `style` | `CSSProperties` | Inline styles for the select wrapper. |
| `selectClassName` | `string` | Custom CSS class for the native select element. |
| `selectStyle` | `CSSProperties` | Inline styles for the native select element. |
| `options` | `UseGoogleTranslateOptions` | Configuration options passed to `useGoogleTranslate`. |

---

## License

MIT © 2026
