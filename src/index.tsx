import React, { useState, useEffect, useRef } from "react";
import { useGoogleTranslate } from "./useGoogleTranslate";
import { GLOBAL_LANGUAGES } from "./constants";
import {
  LanguageOption,
  UseGoogleTranslateOptions,
  UseGoogleTranslateResult,
  GoogleTranslateProps,
  GoogleTranslateDropdownProps,
} from "./types";

export {
  useGoogleTranslate,
  GLOBAL_LANGUAGES,
  LanguageOption,
  UseGoogleTranslateOptions,
  UseGoogleTranslateResult,
  GoogleTranslateProps,
  GoogleTranslateDropdownProps,
};

// Inline SVG Icons to avoid external dependencies
const GlobeIcon = ({ style }: { style?: React.CSSProperties }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
    <path d="M2 12h20" />
  </svg>
);

const ChevronUpIcon = ({ style }: { style?: React.CSSProperties }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
  >
    <path d="m18 15-6-6-6 6" />
  </svg>
);

const CheckIcon = ({ style }: { style?: React.CSSProperties }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const defaultStyles = {
  wrapper: {
    position: "fixed" as const,
    bottom: "24px",
    right: "24px",
    zIndex: 99999,
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  },
  button: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "#1a1a1a",
    color: "#ffffff",
    border: "2px solid rgba(255, 255, 255, 0.1)",
    boxShadow: "3px 3px 0px 0px #ff4c00",
    transition: "all 0.15s ease-in-out",
    padding: "12px 16px",
    fontWeight: "bold",
    fontSize: "10px",
    textTransform: "uppercase" as const,
    letterSpacing: "0.15em",
    cursor: "pointer",
    userSelect: "none" as const,
    outline: "none",
  },
  dropdown: {
    position: "absolute" as const,
    bottom: "calc(100% + 8px)",
    right: 0,
    backgroundColor: "#1a1a1a",
    border: "2px solid rgba(255, 255, 255, 0.1)",
    width: "180px",
    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.5), 0 8px 10px -6px rgba(0,0,0,0.5)",
    zIndex: 99999,
    overflow: "hidden",
  },
  header: {
    padding: "10px 12px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  headerText: {
    margin: 0,
    fontSize: "8px",
    fontWeight: 800,
    color: "#ff4c00",
    textTransform: "uppercase" as const,
    letterSpacing: "0.1em",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  list: {
    maxHeight: "220px",
    overflowY: "auto" as const,
    padding: "4px 0",
    margin: 0,
    listStyle: "none",
  },
  item: (isActive: boolean, isHovered: boolean) => ({
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 16px",
    fontSize: "10px",
    fontWeight: "bold",
    textTransform: "uppercase" as const,
    letterSpacing: "0.1em",
    textAlign: "left" as const,
    border: "none",
    cursor: "pointer",
    backgroundColor: isActive ? "#ff4c00" : isHovered ? "rgba(255, 255, 255, 0.05)" : "transparent",
    color: isActive ? "#ffffff" : "#d1d5db",
    transition: "background-color 0.15s, color 0.15s",
    outline: "none",
  }),
};

// 1. GoogleTranslate - Brutalist floating button & dropdown selector
export function GoogleTranslate({
  customLanguages,
  className,
  style,
  buttonClassName,
  buttonStyle,
  dropdownClassName,
  dropdownStyle,
  options,
  flagUrlTemplate = (code) => `https://flagcdn.com/20x15/${code.toLowerCase()}.png`,
  renderButton,
  renderDropdown,
}: GoogleTranslateProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isBtnHovered, setIsBtnHovered] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const translateOptions: UseGoogleTranslateOptions = {
    ...options,
    ...(customLanguages ? { languages: customLanguages } : {}),
  };

  const {
    currentLanguage,
    current,
    changeLanguage,
    languages,
  } = useGoogleTranslate(translateOptions);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = () => setIsOpen((prev) => !prev);

  const selectedLangObj = current || languages[0];

  const handleSelectLanguage = (value: string) => {
    setIsOpen(false);
    changeLanguage(value);
  };

  return (
    <div
      ref={dropdownRef}
      className={`notranslate ${className || ""}`}
      style={{ ...defaultStyles.wrapper, ...style }}
      translate="no"
    >
      {renderButton ? (
        renderButton(selectedLangObj, isOpen, toggle)
      ) : (
        <button
          onClick={toggle}
          onMouseEnter={() => setIsBtnHovered(true)}
          onMouseLeave={() => setIsBtnHovered(false)}
          className={buttonClassName}
          style={{
            ...defaultStyles.button,
            boxShadow: isBtnHovered
              ? "3px 3px 0px 0px #1a1a1a"
              : "3px 3px 0px 0px #ff4c00",
            transform: isBtnHovered ? "translate(0.5px, 0.5px)" : "none",
            backgroundColor: isBtnHovered ? "#ff4c00" : "#1a1a1a",
            ...buttonStyle,
          }}
          aria-label="Select translation language"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          {selectedLangObj?.flag && (
            <img
              src={flagUrlTemplate(selectedLangObj.flag)}
              width={16}
              height={12}
              alt=""
              style={{ objectFit: "contain" }}
            />
          )}
          <span>{(selectedLangObj?.value || "").toUpperCase()}</span>
          <ChevronUpIcon
            style={{
              color: "rgba(255, 255, 255, 0.5)",
              transform: isOpen ? "rotate(180deg)" : "none",
              transition: "transform 0.2s",
            }}
          />
        </button>
      )}

      {isOpen && (
        <>
          {renderDropdown ? (
            renderDropdown(languages, currentLanguage, handleSelectLanguage, isOpen)
          ) : (
            <div
              className={dropdownClassName}
              style={{ ...defaultStyles.dropdown, ...dropdownStyle }}
            >
              <div style={defaultStyles.header}>
                <p style={defaultStyles.headerText}>
                  <GlobeIcon style={{ color: "#ff4c00" }} /> Langue / Language
                </p>
              </div>
              <div style={defaultStyles.list}>
                {languages.map((lang, idx) => {
                  const isActive = lang.value === currentLanguage;
                  return (
                    <button
                      key={lang.value}
                      onClick={() => handleSelectLanguage(lang.value)}
                      onMouseEnter={() => setHoveredIdx(idx)}
                      onMouseLeave={() => setHoveredIdx(null)}
                      style={defaultStyles.item(isActive, hoveredIdx === idx)}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        {lang.flag && (
                          <img
                            src={flagUrlTemplate(lang.flag)}
                            width={16}
                            height={12}
                            alt=""
                            style={{ objectFit: "contain" }}
                          />
                        )}
                        <span>{lang.label}</span>
                      </div>
                      {isActive && <CheckIcon style={{ flexShrink: 0 }} />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// 2. GoogleTranslateDropdown - Standard selector component
export function GoogleTranslateDropdown({
  customLanguages,
  className,
  style,
  selectClassName,
  selectStyle,
  options,
}: GoogleTranslateDropdownProps) {
  const translateOptions: UseGoogleTranslateOptions = {
    ...options,
    ...(customLanguages ? { languages: customLanguages } : {}),
  };

  const { currentLanguage, changeLanguage, languages } = useGoogleTranslate(translateOptions);

  const selectDefaultStyles = {
    padding: "8px 12px",
    fontSize: "14px",
    borderRadius: "6px",
    border: "1px solid #d1d5db",
    backgroundColor: "#ffffff",
    color: "#1f2937",
    cursor: "pointer",
    outline: "none",
    fontFamily: "inherit",
  };

  return (
    <div className={`notranslate ${className || ""}`} style={{ display: "inline-block", ...style }} translate="no">
      <select
        value={currentLanguage || ""}
        onChange={(e) => changeLanguage(e.target.value)}
        className={selectClassName}
        style={{ ...selectDefaultStyles, ...selectStyle }}
      >
        {languages.map((lang) => (
          <option key={lang.value} value={lang.value}>
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
}
