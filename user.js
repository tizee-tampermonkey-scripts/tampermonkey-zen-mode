// ==UserScript==
// @name         Zen Mode for Youtube and Bilibili
// @namespace    https://github.com/tizee/tempermonkey-zen-mode
// @version      2025-02-09
// @description  Hide YouTube home screen for a more zen experience
// @author       You
// @match        https://*.youtube.com/*
// @match        https://*.bilibili.com/*
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
        hideItemStyle('home screen', 'ytd-two-column-browse-results-renderer');
        hideItemStyle('video comments', 'ytd-comments');
        hideItemStyle('recommendation video', 'ytd-item-section-renderer.ytd-watch-next-secondary-results-renderer');
    }

    function B23ZenMode(){
        hideItemStyle('home screen', '.recommended-container_floor-aside');
        hideItemStyle('video comments', 'bili-comments');
        hideItemStyle('recommendation video', '.recommend-list-v1');
        hideItemStyle('topic panel', '.topic-panel');
    }

    function GetZenMode() {
        if (location.href.includes("youtube.com")) {
            return YtbZenMode;
        }
        else if (location.href.includes("bilibili.com")) {
            return B23ZenMode;
        }
    }
    const debouncedZenMode = GetZenMode();
    debouncedZenMode();

})();
