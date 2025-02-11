// ==UserScript==
// @name         Zen Mode
// @namespace    https://github.com/tizee/tempermonkey-zen-mode
// @version      1.6
// @description  Hide YouTube home screen for a more zen experience
// @author       tizee
// @match        *://*.youtube.com/*
// @match        *://*.bilibili.com/*
// @match        *://*.x.com/*
// @grant        GM_addStyle
// @run-at       document-end
// @license      MIT
// ==/UserScript==

(function () {
    'use strict';
    function once(fn) {
        let hasBeenCalled = false;
        let result;

        return function(...args) {
            if (!hasBeenCalled) {
                result = fn.apply(this, args);
                hasBeenCalled = true;
            }
            return result;
        };
    }

    function hideItemStyle(tagName, selector) {
        GM_addStyle(`
      ${selector} {
            display: none !important;
        }
    `);
        console.debug(`${tagName} is hidden`);
    }

    function hideViaObserver(selector, attribute, callback) {
        const el = document.querySelector('');
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.attributeName === attribute ) {
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

    function hideViaRAF(selector, callback) {
        const el = document.querySelector(selector);

        requestAnimationFrame(() => {
            if (el) {
                callback(el);
            }
        });
    }

    function hideViaTimeout(selector, callback, ms) {
        const el = document.querySelector(selector);

        setTimeout(() => {
            if (el) {
                callback(el);
            }
        },ms);
    }

    function YtbZenMode(){
        hideItemStyle('home screen', 'ytd-browse[page-subtype="home"]');
        hideItemStyle('video comments', 'ytd-comments');
        hideItemStyle('recommendation video', 'ytd-item-section-renderer.ytd-watch-next-secondary-results-renderer');
        hideItemStyle('feed chip','ytd-feed-filter-chip-bar-renderer');
    }

    function B23ZenMode(){
        hideItemStyle('home screen', '.recommended-container_floor-aside');
        hideItemStyle('video comments', 'bili-comments');
        hideItemStyle('recommendation video', '.recommend-list-v1');
        hideItemStyle('topic panel', '.topic-panel');
        hideItemStyle('search bar trending', '.trending');
        hideItemStyle('header bar', '.bili-header__bar .left-entry');
        // after placeholder loaded
        hideViaTimeout('.nav-search-input', (el) => {el.placeholder = ''; console.debug("hide placeholder");}, 1000);

    }

    function XZenMode() {
        hideItemStyle('who', 'div[aria-label="Trending"] div.css-175oi2r.r-1bro5k0');
        hideItemStyle('trending region', 'div[aria-label="Trending"]>div[role="region"]');
        hideItemStyle('trending', 'div[aria-label="Timeline: Trending now"]');
        hideItemStyle('ad', 'aside[role ="complementary"]');
    }

    function GetZenMode() {
        if (location.href.includes("youtube.com")) {
            return YtbZenMode;
        }
        else if (location.href.includes("bilibili.com")) {
            return B23ZenMode;
        }
        else if (location.href.includes("x.com")) {
            return XZenMode;
        }
    }

    const ZenMode = once(GetZenMode());
    ZenMode();

})();
