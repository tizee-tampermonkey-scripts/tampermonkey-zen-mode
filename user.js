// ==UserScript==
// @name         Zen Mode
// @namespace    https://github.com/tizee/tempermonkey-zen-mode
// @version      1.4
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
    function hideItemStyle(tagName, selector) {
        GM_addStyle(`
      ${selector} {
            display: none !important;
        }
    `);
        console.debug(`${tagName} is hidden`);
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
        setTimeout(()=>{
            let input = document.querySelector('.nav-search-input');
            if (input) input.placeholder = '';
        }, 1000);

    }

    function XZenMode() {
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
    const ZenMode = GetZenMode();
    ZenMode();

})();
