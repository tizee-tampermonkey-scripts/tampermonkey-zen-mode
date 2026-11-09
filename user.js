// ==UserScript==
// @name         Zen Mode
// @namespace    https://github.com/tizee-tampermonkey-scripts/tampermonkey-zen-mode
// @version      2.2.5
// @description  Hide YouTube home screen for a more zen experience
// @icon         https://github.com/user-attachments/assets/c69e30bb-84cb-4876-8562-bc8949ede88a
// @author       tizee
// @downloadURL  https://raw.githubusercontent.com/tizee-tampermonkey-scripts/tampermonkey-zen-mode/refs/heads/main/user.js
// @updateURL    https://raw.githubusercontent.com/tizee-tampermonkey-scripts/tampermonkey-zen-mode/refs/heads/main/user.js
// @match        *://*.youtube.com/*
// @match        *://*.bilibili.com/*
// @match        *://*.x.com/*
// @grant        GM_addStyle
// @run-at       document-end
// @noframes
// @license      MIT
// ==/UserScript==

(function () {
  "use strict";

  // Skip execution inside iframes to keep a single instance
  if (window.top !== window.self) {
    return;
  }

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

  // Global MutationObserver with registry pattern
  const observerRegistry = {
    attributeCallbacks: [], // { selector, attribute, callback }
    observer: null,

    init() {
      this.observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.type !== "attribute" || !mutation.target) continue;

          for (const entry of this.attributeCallbacks) {
            if (
              mutation.attributeName === entry.attribute &&
              mutation.target.matches?.(entry.selector)
            ) {
              entry.callback(mutation.target);
            }
          }
        }
      });

      this.observer.observe(document.body, {
        attributes: true,
        attributeOldValue: true,
        subtree: true,
      });
    },

    registerAttributeChange(selector, attribute, callback) {
      this.attributeCallbacks.push({ selector, attribute, callback });
      // Handle existing element
      const el = document.querySelector(selector);
      if (el) callback(el);
    },
  };

  // Hide elements with CSS
  function hideItemStyle(tagName, selector) {
    GM_addStyle(`.zen-mode ${selector} { display: none !important; }`);
    console.debug(`${tagName} hidden in zen mode`);
  }

  // Hide elements using global MutationObserver (attribute changes)
  function hideViaObserver(selector, attribute, callback) {
    observerRegistry.registerAttributeChange(selector, attribute, callback);
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
    hideItemStyle("ad image", ".ad-img");
    hideItemStyle("header bar", ".bili-header__bar .left-entry");
    hideItemStyle("ad card", ".adcard");
    hideItemStyle("slide ad", "#slide_ad");
    hideViaObserver(".nav-search-input", "placeholder", (el) => {
      el.placeholder = "";
      console.debug("Placeholder hidden");
    });
  }

  // X timeline is virtualized with absolutely positioned cells. Hiding a cell
  // does not collapse its reserved height, so shift the following cells up.
  // The old layout uses div[data-testid="cellInnerDiv"], the new layout uses
  // li[data-index]. Support both.
  const X_CELL_SELECTOR =
    'li[data-index], div[data-testid="cellInnerDiv"]';
  const X_AD_SELECTOR = [
    'div[class*="group-has-[[data-ad-disclosure]]"]',
    "[data-ad-disclosure]",
    'div[data-testid="placementTracking"] > article',
    '[data-testid="top-impression-pixel"]',
  ].join(", ");
  const X_BOOSTED_SELECTOR =
    'article > span svg[data-icon="icon-rocket"], article > div > span svg[data-icon="icon-rocket"]';
  const X_PROMOTED_LABELS = new Set([
    "ad",
    "广告",
    "promoted",
    "推广",
    "sponsored",
    "赞助",
    "anzeige",
    "gesponsert",
    "publicité",
    "sponsorisé",
    "anuncio",
    "promocionado",
    "annuncio",
    "promosso",
  ]);
  let xTimelineRepairScheduled = false;
  const xPromotedLabelCache = new WeakMap();

  function parseXCellOffset(cell) {
    const match = cell.style.transform.match(/translateY\((-?[\d.]+)px\)/);
    return match ? Number.parseFloat(match[1]) : null;
  }

  // Old layout has no ad disclosure wrapper. Its label is plain text inside
  // the tweet header, so match exact label text and ignore tweet content.
  function hasXPromotedLabel(cell) {
    const article = cell.querySelector("article");
    if (!article) return false;

    const tweetText = article.querySelector('[data-testid="tweetText"]');

    for (const el of article.querySelectorAll("span")) {
      if (el.children.length > 0) continue;
      if (!X_PROMOTED_LABELS.has(el.textContent.trim().toLowerCase())) {
        continue;
      }
      if (
        el.closest(
          '[data-testid="tweetText"], [data-testid="User-Name"], [data-testid^="card."]'
        )
      ) {
        continue;
      }
      if (
        tweetText &&
        !(
          el.compareDocumentPosition(tweetText) &
          Node.DOCUMENT_POSITION_FOLLOWING
        )
      ) {
        continue;
      }
      return true;
    }

    return false;
  }

  function isXPromotedCell(cell) {
    if (
      cell.matches(X_AD_SELECTOR) ||
      cell.querySelector(X_AD_SELECTOR) ||
      cell.querySelector(X_BOOSTED_SELECTOR)
    ) {
      return true;
    }

    if (!xPromotedLabelCache.has(cell)) {
      xPromotedLabelCache.set(cell, hasXPromotedLabel(cell));
    }

    return xPromotedLabelCache.get(cell);
  }

  function repairXTimeline() {
    if (!location.href.includes("x.com")) return;
    if (!document.body.classList.contains("zen-mode")) return;

    const lists = new Set();
    for (const cell of document.querySelectorAll(X_CELL_SELECTOR)) {
      if (cell.parentElement) lists.add(cell.parentElement);
    }

    for (const list of lists) {
      const cells = [...list.children]
        .filter((cell) => cell.matches?.(X_CELL_SELECTOR))
        .map((cell) => ({
          cell,
          offset: parseXCellOffset(cell),
          promoted: isXPromotedCell(cell),
          height: 0,
        }))
        .filter((entry) => entry.offset !== null)
        .sort((a, b) => a.offset - b.offset);

      if (cells.length === 0) continue;
      list.dataset.zenTimeline = "";

      for (const entry of cells) {
        entry.cell.toggleAttribute("data-zen-promoted", entry.promoted);
      }

      for (let i = 0; i < cells.length - 1; i++) {
        if (cells[i].promoted) {
          cells[i].height = Math.max(0, cells[i + 1].offset - cells[i].offset);
        }
      }

      let shift = 0;
      for (const entry of cells) {
        if (!entry.promoted && shift > 0) {
          entry.cell.style.setProperty("--zen-timeline-shift", `-${shift}px`);
          entry.cell.dataset.zenShift = "";
        } else {
          entry.cell.style.removeProperty("--zen-timeline-shift");
          delete entry.cell.dataset.zenShift;
        }
        if (entry.promoted) shift += entry.height;
      }
    }
  }

  function scheduleXTimelineRepair() {
    if (xTimelineRepairScheduled || !location.href.includes("x.com")) return;
    xTimelineRepairScheduled = true;
    requestAnimationFrame(() => {
      xTimelineRepairScheduled = false;
      repairXTimeline();
    });
  }

  function initXTimelineRepair() {
    const observer = new MutationObserver((mutations) => {
      let needsRepair = false;

      for (const mutation of mutations) {
        const target =
          mutation.target instanceof Element
            ? mutation.target
            : mutation.target.parentElement;

        const cell = target?.closest(X_CELL_SELECTOR);
        if (cell) {
          xPromotedLabelCache.delete(cell);
          needsRepair = true;
        }

        for (const node of mutation.addedNodes) {
          if (node.nodeType !== Node.ELEMENT_NODE) continue;
          if (
            node.matches?.(X_CELL_SELECTOR) ||
            node.querySelector?.(X_CELL_SELECTOR)
          ) {
            needsRepair = true;
            break;
          }
        }
      }

      if (needsRepair) scheduleXTimelineRepair();
    });

    observer.observe(document.body, {
      childList: true,
      characterData: true,
      subtree: true,
    });
    window.addEventListener("scroll", scheduleXTimelineRepair, {
      passive: true,
      capture: true,
    });
    window.addEventListener("resize", scheduleXTimelineRepair);
    scheduleXTimelineRepair();
  }

  // X (Twitter) specific zen mode
  function XZenMode() {
    GM_addStyle(`
      .zen-mode [data-zen-timeline] > :is(${X_CELL_SELECTOR})[data-zen-shift] {
        margin-top: var(--zen-timeline-shift) !important;
      }
      .zen-mode [data-zen-promoted] {
        display: none !important;
      }
    `);

    // Recommendation cards in the right sidebar. The search box stays visible.
    // New layout nests cards in aside/section; the legacy layout uses aside
    // cards directly under sidebarColumn.
    hideItemStyle("sidebar cards", '[data-testid="sidebarColumn"] aside');
    hideItemStyle(
      "trending card",
      '[data-testid="sidebarColumn"] section[aria-labelledby^="accessible-list-"]'
    );

    // Legacy layout keeps trending and news in plain divs, not inside aside.
    hideItemStyle(
      "trending timeline",
      'div[aria-label="Timeline: Trending now"]'
    );
    hideItemStyle("trending topics", 'div[data-testid="trend"]');
    hideItemStyle("news", 'div[data-testid^="news_sidebar_article_"]');

    // Premium entry points in the header and primary navigation
    hideItemStyle("premium promo", 'a[href^="/i/premium_sign_up"]');

    hideItemStyle("explore", 'a[href="/explore"]');
    hideItemStyle("inline prompt", 'div[data-testid="inlinePrompt"]');
    hideItemStyle(
      "premium ad",
      'div[data-testid="super-upsell-UpsellCardRenderProperties"]'
    );

    initXTimelineRepair();
  }

  // Get appropriate zen mode for current site
  function GetZenMode() {
    if (location.href.includes("youtube.com")) return YtbZenMode;
    if (location.href.includes("bilibili.com")) return B23ZenMode;
    if (location.href.includes("x.com")) return XZenMode;
  }

  const ZenMode = once(GetZenMode());
  ZenMode();

  // Initialize global observer after zen mode functions register their callbacks
  observerRegistry.init();

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
      repairXTimeline();
    }

    // Toggle functionality
    button.addEventListener("click", () => {
      const newState = document.body.classList.toggle("zen-mode");
      container.classList.toggle("active");
      container.dataset.enabled = newState;
      // Save new state to localStorage
      localStorage.setItem("zen-mode", newState);
      if (newState) repairXTimeline();
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

