// ==UserScript==
// @name         Zen Mode
// @namespace    https://github.com/tizee-tampermonkey-scripts/tampermonkey-zen-mode
// @version      2.1.7
// @description  Hide YouTube home screen for a more zen experience
// @icon         https://github.com/user-attachments/assets/c69e30bb-84cb-4876-8562-bc8949ede88a
// @author       tizee
// @downloadURL  https://raw.githubusercontent.com/tizee-tampermonkey-scripts/tempermonkey-zen-mode/main/user.js
// @updateURL    https://raw.githubusercontent.com/tizee-tampermonkey-scripts/tempermonkey-zen-mode/main/user.js
// @match        *://*.youtube.com/*
// @match        *://*.bilibili.com/*
// @match        *://*.x.com/*
// @grant        GM_addStyle
// @run-at       document-end
// @license      MIT
// ==/UserScript==

(function () {
  "use strict";

  // Singleton function wrapper
  function once(fn) {
    let hasBeenCalled = false;
    let result;

    return function (...args) {
      if (!hasBeenCalled) {
        result = fn.apply(this, args);
        hasBeenCalled = true;
      }
      return result;
    };
  }

  // Add zen mode styles
  GM_addStyle(`
    #zen-container {
      position: fixed;
      width: 120px;
      height: 48px;
      background: rgba(30, 30, 30, 0.5);
      border-radius: 24px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
      cursor: move;
      display: flex;
      align-items: center;
      padding: 0 12px;
      gap: 8px;
      z-index: 9999;
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      user-select: none;
    }
    #zen-container:hover {
      background: rgba(40, 40, 40, 0.5);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      transition: background 0.3s ease, box-shadow 0.3s ease;
    }
    #zen-title {
      color: rgba(255, 255, 255, 0.9);
      font-size: 13px;
      font-weight: 600;
      white-space: nowrap;
      user-select: none;
      cursor: move;
      font-family: "JetBrains Mono", "SF Mono", Monaco, Menlo, Consolas, "Ubuntu Mono", monospace;
      text-transform: uppercase;
      letter-spacing: 1px;
      opacity: 0.95;
      text-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
      margin-left: 1rem;
    }
    #zen-toggle {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
    }
    #zen-toggle svg {
      width: 18px;
      height: 18px;
      position: absolute;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      transform: translate(-50%, -50%);
      fill: rgba(255, 255, 255, 0.6);
    }
    #zen-toggle .zen-icon-active {
      opacity: 0;
      transform: scale(0.5) rotate(-180deg);
    }
    #zen-toggle .zen-icon-inactive {
      opacity: 1;
      transform: scale(1) rotate(0);
    }
    #zen-toggle:hover svg {
      fill: rgba(255, 255, 255, 1);
    }
    #zen-container.active #zen-toggle .zen-icon-active {
      opacity: 1;
      transform: scale(1) rotate(0);
      fill: rgba(255, 255, 255, 1);
    }
    #zen-container.active #zen-toggle .zen-icon-inactive {
      opacity: 0;
      transform: scale(0.5) rotate(180deg);
    }
  `);

  // Hide elements with CSS
  function hideItemStyle(tagName, selector) {
    GM_addStyle(`.zen-mode ${selector} { display: none !important; }`);
    console.debug(`${tagName} hidden in zen mode`);
  }

  // Hide elements using MutationObserver
  function hideViaObserver(selector, attribute, callback) {
    const el = document.querySelector(selector);
    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (mutation.attributeName === attribute) {
          observer.disconnect();
          callback(el);
          observer.observe(el, config);
        }
      });
    });
    const config = { attributes: true };
    if (el) {
      observer.observe(el, config);
    }
  }

  // Hide elements using requestAnimationFrame
  function hideViaRAF(selector, callback) {
    const el = document.querySelector(selector);

    requestAnimationFrame(() => {
      if (el) {
        callback(el);
      }
    });
  }

  // Hide elements with timeout
  function hideViaTimeout(selector, callback, ms) {
    const el = document.querySelector(selector);

    setTimeout(() => {
      if (el) {
        callback(el);
      }
    }, ms);
  }

  // YouTube specific zen mode
  function YtbZenMode() {
    hideItemStyle("home screen", 'ytd-browse[page-subtype="home"]');
    hideItemStyle("video comments", "ytd-comments");
    hideItemStyle(
      "recommendations",
      "ytd-item-section-renderer.ytd-watch-next-secondary-results-renderer"
    );
    hideItemStyle("feed chip", "ytd-feed-filter-chip-bar-renderer");
  }

  // Bilibili specific zen mode
  function B23ZenMode() {
    hideItemStyle("home screen", ".recommended-container_floor-aside");
    hideItemStyle("video comments", "bili-comments");
    hideItemStyle("recommendations", ".recommend-list-v1");
    hideItemStyle("topic panel", ".topic-panel");
    hideItemStyle("trending", ".trending");
    hideItemStyle("header bar", ".bili-header__bar .left-entry");
    hideViaObserver(".nav-search-input", "placeholder", (el) => {
      el.placeholder = "";
      console.debug("Placeholder hidden");
    });
  }

  // X (Twitter) specific zen mode
  function XZenMode() {
    hideItemStyle(
      "live",
      'div[aria-label="Trending"] div[data-testid="placementTracking"]'
    );
    hideItemStyle(
      "trending region",
      'div[aria-label="Trending"]>div[role="region"]'
    );
    hideItemStyle("trending", 'div[aria-label="Timeline: Trending now"]');
    hideItemStyle("ad", 'aside[role ="complementary"]');
    hideItemStyle("explore more", 'a[href="/explore"]');
    hideItemStyle("trending tweets", 'div[data-testid="trend" role="link"]');
  }

  // Get appropriate zen mode for current site
  function GetZenMode() {
    if (location.href.includes("youtube.com")) return YtbZenMode;
    if (location.href.includes("bilibili.com")) return B23ZenMode;
    if (location.href.includes("x.com")) return XZenMode;
  }

  const ZenMode = once(GetZenMode());
  ZenMode();

  // Create toggle button UI
  function createToggleButton() {
    if (!document.body) {
      setTimeout(createToggleButton, 100);
      return;
    }

    if (document.getElementById("zen-container")) return;

    const container = document.createElement("div");
    container.id = "zen-container";
    container.dataset.enabled = localStorage.getItem("zen-mode") || "false";
    container.dataset.position = JSON.stringify({
      x: window.innerWidth - 140,
      y: window.innerHeight - 68,
    });

    const title = document.createElement("div");
    title.id = "zen-title";
    title.textContent = "Zen Mode";

    const button = document.createElement("div");
    button.id = "zen-toggle";
    button.innerHTML = `
      <svg class="zen-icon-active" viewBox="1 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3-11H9v6h6V9z"/>
      </svg>
      <svg class="zen-icon-inactive" viewBox="0 0 24 24">
        <path d="M13 3h-2v10h2V3zm4.83 2.17l-1.42 1.42C17.99 7.86 19 9.81 19 12c0 3.87-3.13 7-7 7s-7-3.13-7-7c0-2.19 1.01-4.14 2.58-5.42L6.17 5.17C4.23 6.82 3 9.26 3 12c0 4.97 4.03 9 9 9s9-4.03 9-9c0-2.74-1.23-5.18-3.17-6.83z"/>
      </svg>`;

    const pos = JSON.parse(container.dataset.position);
    container.style.left = pos.x + "px";
    container.style.top = pos.y + "px";

    // Initialize based on saved state
    if (container.dataset.enabled === "true") {
      document.body.classList.add("zen-mode");
      container.classList.add("active");
    }

    // Toggle functionality
    button.addEventListener("click", () => {
      const newState = document.body.classList.toggle("zen-mode");
      container.classList.toggle("active");
      container.dataset.enabled = newState;
      // Save new state to localStorage
      localStorage.setItem("zen-mode", newState);
    });

    // Dragging functionality
    let isDragging = false;
    let startX, startY;
    let containerRect;

    const startDragging = (e) => {
      isDragging = true;
      containerRect = container.getBoundingClientRect();
      startX = e.clientX - containerRect.left;
      startY = e.clientY - containerRect.top;
      container.style.transition = "none";
      container.style.cursor = "grabbing";
      document.body.style.cursor = "grabbing";
    };

    container.addEventListener("mousedown", startDragging);
    title.addEventListener("mousedown", startDragging);

    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const newX = e.clientX - startX;
      const newY = e.clientY - startY;
      const maxX = window.innerWidth - containerRect.width;
      const maxY = window.innerHeight - containerRect.height;
      const boundedX = Math.max(0, Math.min(maxX, newX));
      const boundedY = Math.max(0, Math.min(maxY, newY));
      container.style.left = `${boundedX}px`;
      container.style.top = `${boundedY}px`;
    });

    document.addEventListener("mouseup", () => {
      if (!isDragging) return;
      isDragging = false;
      container.style.cursor = "move";
      document.body.style.cursor = "";
      container.style.transition = "";
      container.dataset.position = JSON.stringify({
        x: parseInt(container.style.left),
        y: parseInt(container.style.top),
      });
    });

    container.appendChild(title);
    container.appendChild(button);
    document.body.appendChild(container);
  }

  createToggleButton();
})();

