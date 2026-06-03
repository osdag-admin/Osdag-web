/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";

const SectionCards = ({ section, onModuleClick }) => {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const cardRefs = useRef([]);

  useEffect(() => {
    setFocusedIndex(0);
  }, [section?.label]);

  useEffect(() => {
    const target = cardRefs.current[focusedIndex];
    if (target) {
      target.focus();
    }
  }, [focusedIndex]);

  const moveFocus = (nextIndex) => {
    const cardCount = section?.options?.length || 0;
    if (!cardCount) return;
    if (nextIndex < 0 || nextIndex >= cardCount) return;
    setFocusedIndex(nextIndex);
  };

  const handleCardKeyDown = (event, index, opt) => {
    if (opt.status === "development") return;
    const navKeys = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"];
    if (navKeys.includes(event.key)) {
      const delta =
        event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
      event.preventDefault();
      moveFocus(index + delta);
      return;
    }

    if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
      event.preventDefault();
      onModuleClick(opt.key, section.label);
    }
  };

  return (
    <div
      key={section.label}
      className="flex-1 min-w-0 sm:min-w-[380px] w-full border-2 border-osdag-border rounded-xl mb-8 px-4 py-4 shadow-card dark:text-white"
      className="flex-1 min-w-0 sm:min-w-[380px] w-full border-2 border-osdag-border rounded-xl mb-8 px-4 py-4 shadow-card dark:text-white"
    >
      <div
        data-module-grid
        className="flex flex-col items-stretch justify-center md:flex-row md:items-center gap-6"
        className="flex flex-col items-stretch justify-center md:flex-row md:items-center gap-6"
      >
        {section.options.map((opt, idx) => {
          const isDev = opt.status === "development";
          return (
            <button
              key={opt.key}
              type="button"
              data-module-card="true"
              aria-label={`Open ${opt.label}`}
              onClick={() => !isDev && onModuleClick(opt.key, section.label)}
              onFocus={() => !isDev && setFocusedIndex(idx)}
              onKeyDown={(event) => handleCardKeyDown(event, idx, opt)}
              ref={(element) => {
                cardRefs.current[idx] = element;
              }}
              tabIndex={isDev ? -1 : focusedIndex === idx ? 0 : -1}
              disabled={isDev}
              className={`flex-1 h-40 min-w-[120px] w-full md:max-w-[280px] flex flex-col items-center justify-between 
                border rounded-lg shadow-card transition-all duration-200 relative focus:outline-none
                ${
                  isDev
                    ? "bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed dark:bg-gray-800/50 dark:border-gray-700"
                    : "cursor-pointer group bg-white dark:bg-osdag-dark-color/90 hover:bg-osdag-green dark:hover:bg-osdag-green focus:ring-2 focus:ring-osdag-green focus:ring-offset-2 dark:focus:ring-offset-osdag-dark-color"
                }`}
            >
              <div
                style={{ backgroundImage: `url(/images/${opt.img})` }}
                className={`h-32 w-full max-w-[160px] md:h-40 mt-5 mb-2 bg-contain bg-center bg-no-repeat ${isDev ? "opacity-50" : ""}`}
              ></div>
              <div className={`font-semibold mb-2 ${isDev ? "text-gray-400 dark:text-gray-500" : "text-black dark:text-white group-hover:text-white"}`}>
                {opt.label}
              </div>
        {section.options.map((opt, idx) => (
          <button
            key={opt.key}
            type="button"
            data-module-card="true"
            aria-label={`Open ${opt.label}`}
            onClick={() => onModuleClick(opt.key, section.label)}
            onFocus={() => setFocusedIndex(idx)}
            onKeyDown={(event) => handleCardKeyDown(event, idx, opt)}
            ref={(element) => {
              cardRefs.current[idx] = element;
            }}
            tabIndex={focusedIndex === idx ? 0 : -1}
            className="cursor-pointer group flex-1 h-40 min-w-[120px] w-full md:max-w-[280px] flex flex-col items-center justify-between 
               border rounded-lg shadow-card transition-all duration-200 bg-white dark:bg-osdag-dark-color/90
               hover:bg-osdag-green dark:hover:hover:bg-osdag-green relative focus:outline-none
               focus:ring-2 focus:ring-osdag-green focus:ring-offset-2 dark:focus:ring-offset-osdag-dark-color"
          >
            <div
              style={{ backgroundImage: `url(/images/${opt.img})` }}
              className="h-32 w-full max-w-[160px] md:h-40 mt-5 mb-2 bg-contain bg-center bg-no-repeat"
            ></div>
            <div className="font-semibold mb-2 text-black dark:text-white group-hover:text-white">
              {opt.label}
            </div>

              {!isDev && (
                <div
                  className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-full group-hover:translate-y-0
                    opacity-0 group-hover:opacity-100 text-osdag-green font-bold text-base bg-white 
                    border-osdag-border rounded-b-lg py-2 transition-all duration-200 ease-out
                    pointer-events-none w-full text-center"
                >
                  Open
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};


export default SectionCards;
