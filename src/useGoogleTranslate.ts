"use client";

import { useEffect, useState } from "react";
import { UseGoogleTranslateOptions, UseGoogleTranslateResult } from "./types";
import { GLOBAL_LANGUAGES } from "./constants";

declare global {
  interface Window {
    google?: any;
    googleTranslateElementInit?: () => void;
  }
}

// Global script loading state
let scriptLoadingState: "idle" | "loading" | "loaded" | "error" = "idle";
const scriptLoadListeners = new Set<(status: typeof scriptLoadingState) => void>();

// Global translation state store to synchronize multiple hooks
let activeLanguage: string | null = null;
const stateListeners = new Set<(lang: string | null) => void>();

const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
};

const setCookie = (name: string, value: string, domain?: string, path = "/") => {
  if (typeof document === "undefined") return;
  const domainPart = domain ? `;domain=${domain}` : "";
  document.cookie = `${name}=${value}${domainPart};path=${path}`;
};

const deleteCookie = (name: string, domain?: string, path = "/") => {
  if (typeof document === "undefined") return;
  const domainPart = domain ? `;domain=${domain}` : "";
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT${domainPart};path=${path}`;
};

export function useGoogleTranslate(options: UseGoogleTranslateOptions = {}): UseGoogleTranslateResult {
  const {
    defaultLanguage = "en",
    languages = GLOBAL_LANGUAGES,
    onLanguageChange,
    showTooltip = false,
    cookieDomain,
    storageKey = "google_translate_lang",
  } = options;

  const [currentLang, setCurrentLang] = useState<string | null>(activeLanguage);
  const [scriptStatus, setScriptStatus] = useState<typeof scriptLoadingState>(scriptLoadingState);

  // Initialize state on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Detect current language from cookie or localStorage or fallback to default
    const gtCookie = getCookie("googtrans");
    let initialLang = defaultLanguage;
    if (gtCookie) {
      const parts = gtCookie.split("/");
      if (parts.length > 2) {
        initialLang = parts[2];
      }
    } else {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        initialLang = stored;
      }
    }

    if (activeLanguage === null) {
      activeLanguage = initialLang;
    }
    setCurrentLang(activeLanguage);
  }, [defaultLanguage, storageKey]);

  // Subscribe to global language updates (state synchronization)
  useEffect(() => {
    const handleStateChange = (newLang: string | null) => {
      setCurrentLang(newLang);
      if (newLang && onLanguageChange) {
        onLanguageChange(newLang);
      }
    };

    stateListeners.add(handleStateChange);
    return () => {
      stateListeners.delete(handleStateChange);
    };
  }, [onLanguageChange]);

  // Subscribe to global script status updates
  useEffect(() => {
    const handleScriptStatusChange = (status: typeof scriptLoadingState) => {
      setScriptStatus(status);
    };

    scriptLoadListeners.add(handleScriptStatusChange);
    return () => {
      scriptLoadListeners.delete(handleScriptStatusChange);
    };
  }, []);

  // MutationObserver to clean up Google Translate elements and style overrides
  useEffect(() => {
    if (typeof document === "undefined") return;

    // Custom CSS injection
    const styleId = "google-translate-override-styles";
    let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }
    
    styleEl.textContent = `
      .skiptranslate { display: none !important; }
      body { top: 0 !important; }
      #goog-gt-tt, .goog-te-balloon-frame, .goog-te-balloon-frame-main { 
        display: ${showTooltip ? "block" : "none"} !important; 
      }
      .goog-text-highlight { 
        background: transparent !important; 
        box-shadow: none !important; 
      }
      font { 
        background: transparent !important; 
        box-shadow: none !important; 
        color: inherit !important; 
      }
    `;

    const cleanDOM = () => {
      // Hide banner frame
      const banner = document.querySelector(".goog-te-banner-frame");
      if (banner) banner.remove();

      // Hide all element classes
      document.querySelectorAll(".skiptranslate").forEach((el) => {
        if ((el as HTMLElement).style.display !== "none") {
          (el as HTMLElement).style.display = "none";
        }
      });
    };

    const observer = new MutationObserver((mutations) => {
      if (mutations.some((m) => m.addedNodes.length > 0)) {
        cleanDOM();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    cleanDOM();

    return () => {
      observer.disconnect();
      const el = document.getElementById(styleId);
      if (el) el.remove();
    };
  }, [showTooltip]);

  // Load Google Translate script and initialize element
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Ensure hidden element exists
    let translateEl = document.getElementById("google_translate_element");
    if (!translateEl) {
      translateEl = document.createElement("div");
      translateEl.id = "google_translate_element";
      translateEl.style.display = "none";
      document.body.appendChild(translateEl);
    }

    const initWidget = () => {
      try {
        if (window.google?.translate?.TranslateElement) {
          new window.google.translate.TranslateElement(
            { pageLanguage: defaultLanguage, autoDisplay: false },
            "google_translate_element"
          );
          scriptLoadingState = "loaded";
          scriptLoadListeners.forEach((l) => l("loaded"));
        }
      } catch (err) {
        console.error("Google Translate Init failed:", err);
        scriptLoadingState = "error";
        scriptLoadListeners.forEach((l) => l("error"));
      }
    };

    window.googleTranslateElementInit = initWidget;

    if (window.google?.translate?.TranslateElement) {
      scriptLoadingState = "loaded";
      setScriptStatus("loaded");
      initWidget();
      return;
    }

    if (scriptLoadingState === "idle") {
      scriptLoadingState = "loading";
      scriptLoadListeners.forEach((l) => l("loading"));

      const scriptId = "google-translate-sdk-script";
      let script = document.getElementById(scriptId) as HTMLScriptElement | null;
      if (!script) {
        const newScript = document.createElement("script");
        newScript.id = scriptId;
        newScript.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
        newScript.async = true;
        document.body.appendChild(newScript);
      }
    }
  }, [defaultLanguage]);

  const changeLanguage = (lang: string) => {
    if (typeof window === "undefined") return;

    const isDefault = lang === defaultLanguage;
    activeLanguage = lang;
    stateListeners.forEach((l) => l(lang));

    if (isDefault) {
      localStorage.setItem(storageKey, defaultLanguage);

      // Deep purge googtrans cookies
      const host = window.location.hostname;
      const parts = host.split(".");
      const domains = [host, `.${host}`];

      // Add parent domains
      for (let i = 0; i < parts.length - 1; i++) {
        const domain = parts.slice(i).join(".");
        if (domain) {
          domains.push(domain);
          domains.push(`.${domain}`);
        }
      }

      // Add common path structures
      const paths = ["/", "/app", "/account"];
      domains.forEach((d) => {
        paths.forEach((p) => {
          deleteCookie("googtrans", d, p);
          deleteCookie("googtrans", `.${d}`, p);
        });
      });

      paths.forEach((p) => {
        deleteCookie("googtrans", undefined, p);
      });

      // Clear standard document level cookie
      deleteCookie("googtrans");

      // Reset standard native google combo element if present
      const googleCombo = document.querySelector(".goog-te-combo") as HTMLSelectElement;
      if (googleCombo) {
        googleCombo.value = "";
        googleCombo.dispatchEvent(new Event("change"));
      }

      // Hard reload page to clear translated state and restore clean server-side HTML
      window.location.reload();
      return;
    }

    const cookieValue = `/${defaultLanguage}/${lang}`;
    const domain = cookieDomain || window.location.hostname;

    setCookie("googtrans", cookieValue);
    setCookie("googtrans", cookieValue, domain);
    localStorage.setItem(storageKey, lang);

    const googleCombo = document.querySelector(".goog-te-combo") as HTMLSelectElement;
    if (googleCombo) {
      googleCombo.value = lang;
      googleCombo.dispatchEvent(new Event("change"));
    } else {
      window.location.reload();
    }
  };

  const currentLanguage = currentLang;
  const isDefault = currentLanguage === defaultLanguage;
  const current = languages.find((l) => l.value === currentLanguage);
  const currentFlag = current?.flag
    ? `https://flagcdn.com/20x15/${current.flag}.png`
    : null;

  return {
    currentLanguage,
    isDefault,
    isInitialized: scriptStatus === "loaded",
    isLoading: scriptStatus === "loading",
    current,
    currentFlag,
    changeLanguage,
    languages,
  };
}
