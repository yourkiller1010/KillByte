// ==UserScript==
// @name        SL TECH BD V2.6 - Verified Gate (Static Key)
// @version     2.6-static-key
// @description Same script + Avatar URL support + License Key (No Firebase)
// @author      SL (modified)
// @match       *://market-qx.trade/*
// @match       *://market-qx.pro/*
// @match       *://qxbroker.com/*
// @grant       none
// ==/UserScript==

(function () {
  'use strict';

  /* -------------------------
     Create verify UI and return controls (same as before)
     ------------------------- */
  function createUserPanel() {
    const container = document.createElement("div");
    container.id = "verifyCard";
    container.style.cssText = `
      position:fixed;
      top:50%;
      left:50%;
      transform:translate(-50%,-50%);
      background: linear-gradient(180deg, rgba(255,255,255,0.95), rgba(250,250,252,0.88));
      border: 1px solid rgba(255,255,255,0.15);
      backdrop-filter: blur(10px) saturate(120%);
      padding:28px;
      border-radius:16px;
      text-align:center;
      width:380px;
      max-width:96vw;
      box-shadow: 0 18px 60px rgba(8,22,48,0.32), inset 0 1px 0 rgba(255,255,255,0.6);
      font-family: 'Inter', 'Poppins', 'Segoe UI', system-ui, -apple-system, sans-serif;
      z-index:999999;
    `;
    const localStyle = document.createElement("style");
    localStyle.textContent = `
      #verifyCard h2 { margin:0 0 8px 0; font-size:20px; font-weight:700; cursor:pointer; }
      #verifyCard input[type="text"]{ width:100%; padding:12px 14px; margin-bottom:12px; border-radius:10px; border:1px solid #ddd; }
      #verifyCard button.verify-btn{ width:100%; padding:12px; border-radius:10px; border:none; background:linear-gradient(90deg,#0d6efd,#7c3aed); color:#fff; font-weight:700; cursor:pointer; }
      #verifyCard .msg{ min-height:18px; margin-top:8px; font-weight:600; }
      #verifyCard .devices{ font-size:13px; margin-top:8px; }
      #verifyCard .device-id{ font-size:12px; color:#666; margin-top:6px; }
    `;
    document.head.appendChild(localStyle);

    const title = document.createElement("h2");
    title.innerText = "@ShahriyarSeyam — License Verify";
    title.onclick = () => window.open("https://t.me/ShahriyarSeyam", "_blank");
    container.appendChild(title);

    const subtitle = document.createElement("div");
    subtitle.style.marginBottom = "12px";
    subtitle.style.color = "#445566";
    subtitle.style.fontSize = "13px";
    subtitle.innerText = "Enter your license key to continue";
    container.appendChild(subtitle);

    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "License key";
    container.appendChild(input);

    const button = document.createElement("button");
    button.className = "verify-btn";
    button.innerText = "Verify License";
    container.appendChild(button);

    const message = document.createElement("div");
    message.className = "msg";
    message.style.color = "#e74c3c";
    container.appendChild(message);

    const activeDevicesDisplay = document.createElement("div");
    activeDevicesDisplay.className = "devices";
    container.appendChild(activeDevicesDisplay);

    let uniqueDeviceID = localStorage.getItem("uniqueDeviceID");
    if (!uniqueDeviceID) {
      uniqueDeviceID = `dev_${Math.random().toString(36).substring(2,10)}_${Date.now()}`;
      localStorage.setItem("uniqueDeviceID", uniqueDeviceID);
    }

    const deviceId = document.createElement("div");
    deviceId.className = "device-id";
    deviceId.innerText = `Device ID: ${uniqueDeviceID}`;
    container.appendChild(deviceId);

    document.body.appendChild(container);

    return { input, button, message, container, activeDevicesDisplay, uniqueDeviceID };
  }

  /* -------------------------
     initLicenseVerification: static key check
     ------------------------- */
  function initLicenseVerification(onSuccess) {
    const { input, button, message, container, activeDevicesDisplay, uniqueDeviceID } = createUserPanel();

    function displayError(text) {
      message.style.color = "#e74c3c";
      message.innerText = text;
    }
    function displaySuccess(text) {
      message.style.color = "#2ecc71";
      message.innerText = text;
    }

    button.addEventListener("click", function() {
      const licenseKey = input.value.trim();
      message.innerHTML = "";
      activeDevicesDisplay.innerHTML = "";
      if (!licenseKey) {
        displayError("Please enter a license key.");
        return;
      }

      // 🔑 আপনার নিজের লাইসেন্স কী/কীসমূহ এখানে বসান
      const VALID_KEYS = ["SLTECH-2024", "QXPRO-ADMIN", "mySecret123"];

      if (!VALID_KEYS.includes(licenseKey)) {
        displayError("Invalid license key!");
        return;
      }

      // ✅ লাইসেন্স সঠিক
      displaySuccess("License Verified!");
      setTimeout(() => { document.title = "Live trading | Quotex"; }, 50);

      setTimeout(() => {
        try { window.onbeforeunload = null; } catch (e) {}
        container.remove();
        setTimeout(() => {
          autoTriggerBalanceDropdown();
          scheduleFastUIUpdate();
        }, 300);
        try { onSuccess(); } catch (e) { console.error("onSuccess error", e); }
      }, 700);
    });

    input.addEventListener("keydown", function(e) {
      if (e.key === "Enter") {
        e.preventDefault();
        button.click();
      }
    });
  }

  function getRowData(row) {
    const data = {};

    // avatar
    const avatarImg = row.querySelector(
      '.---react-features-Sidepanel-LeaderBoard-styles-module__avatar--ZVpcN img'
    );
    if (avatarImg) data.avatar = avatarImg.src;

    // name
    const nameEl = row.querySelector(
      '.---react-features-Sidepanel-LeaderBoard-styles-module__name--'
    );
    if (nameEl) data.name = nameEl.textContent.trim();

    // flag code
    const flag = row.querySelector('svg.flag');
    if (flag) {
      const cls = [...flag.classList].find(c => c.startsWith('flag-'));
      if (cls) data.flagCode = cls.replace('flag-', '');
    }

    // profit / amount
    const moneyEl = row.querySelector(
      '.---react-features-Sidepanel-LeaderBoard-styles-module__money--'
    );
    if (moneyEl) data.profit = moneyEl.textContent.trim();

    return data;
  }

  function replacePopupFromRow(row) {
    const popup = document.querySelector(
      '.---react-features-Sidepanel-LeaderBoard-Information-styles-module__information--QuHyA'
    );
    if (!popup) return;

    const d = getRowData(row);

    // avatar
    const avatarImg = popup.querySelector('[class*="__avatar--"] img');
    if (avatarImg && d.avatar) avatarImg.src = d.avatar;

    // name
    const nameEl = popup.querySelector('[class*="__name--"]');
    if (nameEl && d.name) nameEl.childNodes[0].textContent = d.name;

    // country
    const locEl = popup.querySelector('[class*="__location--"]');
    if (locEl && d.flagCode) {
      const map = {
        bd: "Bangladesh",
        in: "India",
        pk: "Pakistan",
        us: "United States"
      };
      locEl.textContent = map[d.flagCode] || d.flagCode.toUpperCase();
    }
  
    // profit
    const values = popup.querySelectorAll('[class*="__value--"]');
    if (values[2] && d.profit) values[2].textContent = d.profit;
  }

  function waitForPopupReady(row) {
    const popup = document.querySelector(
      '.---react-features-Sidepanel-LeaderBoard-Information-styles-module__information--QuHyA'
    );
    if (!popup) return;

    if (
      popup.querySelector(
        '.---react-features-Sidepanel-LeaderBoard-Information-styles-module__loader--'
      )
    ) {
      requestAnimationFrame(() => waitForPopupReady(row));
      return;
    }

    replacePopupFromRow(row);
  }
    
  /* -------------------------
     MAIN SCRIPT (unchanged)
     ------------------------- */
  function runMain() {

  // ===== FAST UI SCHEDULER (ADD) =====
  let __uiScheduled = false;
  function scheduleFastUIUpdate(){
    if(__uiScheduled) return;
    __uiScheduled = true;
    requestAnimationFrame(() => {
      try{
        spoofUI();
        updateUI();
        formatAccountDropdownBalances();
      }catch(e){}
      __uiScheduled = false;
    });
  }
  // ===== END FAST UI SCHEDULER =====

    /* -------------------------
       Auto remove 70% bonus banner (always)
    ------------------------- */
    (function autoRemoveBonusBanner(){
      const bannerSelector = 'div[class*="Banner-styles-module__container"]';
      const bannerBgImgSelector = 'img.---react-features-Banner-styles-module__bg--cVZfw';

      function removeBanner(){
        document.querySelectorAll(bannerSelector).forEach(el => el.remove());
        document.querySelectorAll(bannerBgImgSelector).forEach(el => el.remove());
      }

      removeBanner();
      new MutationObserver(removeBanner).observe(document.body, {
        childList: true,
        subtree: true
      });
    })();

    /* -------------------------
       Helper: host-aware paths for multiple domains
    ------------------------- */
    const hostOrigin = location.protocol + '//' + location.host; // e.g. https://market-qx.trade
    const pathname = location.pathname + (location.search || '') + (location.hash || '');

    // ===== FORCE LIVE FEEL EARLY =====
    if (location.pathname.includes("demo")) {
      Object.defineProperty(document, "title", {
        get(){ return "Live trading | Quotex"; }
      });
    }
    // ===== END =====

    /* Demo→Live spoof (host-aware) */
    // ===== SAFE DEMO → LIVE (NO RELOAD) =====
    // ===== HARD TITLE LOCK (REACT SAFE) =====
    (function lockLiveTitle(){
      const LIVE_TITLE = "Live trading | Quotex";

      function forceTitle(){
        if (document.title !== LIVE_TITLE) {
          document.title = LIVE_TITLE;
        }
      }

      // instant
      forceTitle();
    
      // React overwrite protection
      setInterval(forceTitle, 200);

      // visibility change protection
      document.addEventListener("visibilitychange", forceTitle);

    })();

    /* -------------------------
       Helpers & Keys
    ------------------------- */
    const now = Date.now();
    const pwKey = atob("c2x0ZWNoX3ZlcmlmaWVkX2luZm8=");
    const balKey = atob("aW5pdGlhbEJhbGFuY2VJbmZv");
    const lbKey = atob("c2x0ZWNoX2xlYWRlcmJvYXJkX2RhdGE=");

    const selectors = {
      positionHeaderMoney: ".---react-features-Sidepanel-LeaderBoard-Position-styles-module__money--BwWCZ.--green, .---react-features-Sidepanel-LeaderBoard-Position-styles-module__money--BwWCZ.--red, .---react-features-Sidepanel-LeaderBoard-Position-styles-module__money--BwWCZ",
      usermenuBalance: ".---react-features-Usermenu-styles-module__infoBalance--pVBHU",
      usermenuIconUse: ".---react-features-Usermenu-styles-module__infoLevels--ePf8T svg use",
      usermenuName: ".---react-features-Usermenu-styles-module__infoName--SfrTV.---react-features-Usermenu-styles-module__demo--TmWTp",
      levelName: ".---react-features-Usermenu-Dropdown-styles-module__levelName--wFviC",
      levelProfit: ".---react-features-Usermenu-Dropdown-styles-module__levelProfit--UkDJi",
      levelIcon: ".---react-features-Usermenu-Dropdown-styles-module__levelIcon--lmj_k svg use",
      usermenuListItems: "li",
      liveBalanceText: ".---react-features-Usermenu-styles-module__infoText--58LeE .---react-features-Usermenu-styles-module__infoBalance--pVBHU"
    };

    const activeClass = '---react-features-Usermenu-Dropdown-styles-module__active--P5n2A';
    const $ = s => document.querySelector(s);
    const $$ = s => [...document.querySelectorAll(s)];
    const numFromText = s => s ? parseFloat(s.replace(/[^0-9.-]/g, "")) : NaN;

    // ===== FAST BALANCE CACHE =====
    let __cachedBalance = null;
    function getLiveBalance(){
      if(__cachedBalance !== null) return __cachedBalance;
      __cachedBalance =
        numFromText(document.querySelector(selectors.usermenuBalance)?.textContent) || 0;
      setTimeout(()=>__cachedBalance=null,200);
      return __cachedBalance;
    }
    // ===== END CACHE =====

    function formatWithThousands(num) {
      return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    function formatAmount(num) {
      return "$" + num.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }
    function isMobile() {
      return /Mobi|Android|iPhone|iPad|iPod|Opera Mini|IEMobile|Mobile/i.test(navigator.userAgent);
    }

    /* Balance spoof + expand slider */
    let initialBal = 0;
    const savedBal = localStorage.getItem(balKey);
    if (savedBal) {
      try {
        const d = JSON.parse(savedBal);
        if (now - d.timestamp < 864e5) initialBal = parseFloat(d.balance);
      } catch { }
    }

    function spoofUI() {
      const listItems = $$(selectors.usermenuListItems);
      if (!listItems.length) return;
      const demoLi = listItems.find(li => li.innerText.includes("Demo Account"));
      const liveLi = listItems.find(li => li.innerText.includes("Live"));
      if (!demoLi || !liveLi) return;
      const demoBalanceElem = demoLi.querySelector("b");
      const liveBalanceElem = liveLi.querySelector("b");
      if (!demoBalanceElem || !liveBalanceElem) return;
      demoBalanceElem.textContent = formatAmount(10000);
      const liveBalanceFromUI = $(selectors.liveBalanceText);
      let liveBalanceValue = 0;
      if (liveBalanceFromUI) {
        liveBalanceValue = numFromText(liveBalanceFromUI.textContent);
        if (isNaN(liveBalanceValue)) liveBalanceValue = 0;
      }
      liveBalanceElem.textContent = formatAmount(liveBalanceValue);
      if (demoLi.classList.contains(activeClass)) demoLi.classList.remove(activeClass);
      if (!liveLi.classList.contains(activeClass)) liveLi.classList.add(activeClass);
    }

    let lastProfitDiff = null;
    let currentExpandPercent = parseInt(localStorage.getItem('expandPercent')) || 0;
    function updatePositionExpandOnProfitChange() {
      const bal = getLiveBalance();
      if (isNaN(bal)) return;
      const diff = bal - initialBal;
      if (diff !== lastProfitDiff) {
        currentExpandPercent = Math.floor(Math.random() * 91) + 10;
        lastProfitDiff = diff;
        localStorage.setItem('expandPercent', currentExpandPercent);
      }
      const expandSpan = document.querySelector(
        '.---react-features-Sidepanel-LeaderBoard-Position-styles-module__loading--h38TV ' +
        '.---react-features-Sidepanel-LeaderBoard-Position-styles-module__expand--KBHoM'
      );
      if (expandSpan) expandSpan.style.width = currentExpandPercent + "%";
      const slider = document.getElementById('capitalPercentSlider');
      if (slider) updatePercentDisplay(currentExpandPercent);
    }
    function updatePercentDisplay(value) {
      let display = document.getElementById("sliderPercentDisplay");
      if (display) display.textContent = value + "%";
    }

    /* UI updater */
    function updateUI() {
      const bal = getLiveBalance();
      const profitEl = $(selectors.positionHeaderMoney);
      const levelIconUse = $(selectors.usermenuIconUse);
      const levelIconDropdown = $(selectors.levelIcon);
      if (!isNaN(bal) && profitEl) {
        const diff = bal - initialBal;

        if (diff < 0) {
          // LOSS → red
          profitEl.innerText = `-${formatWithThousands(Math.abs(diff))}$`;

          profitEl.classList.remove(
            '---react-features-Sidepanel-LeaderBoard-Position-styles-module__green--LD4pW'
          );
          profitEl.classList.add(
            '---react-features-Sidepanel-LeaderBoard-Position-styles-module__red--qUPWg'
          );
        } else {
          // PROFIT → green
          profitEl.innerText = `$${formatWithThousands(diff)}`;

          profitEl.classList.remove(
            '---react-features-Sidepanel-LeaderBoard-Position-styles-module__red--qUPWg'
          );
          profitEl.classList.add(
            '---react-features-Sidepanel-LeaderBoard-Position-styles-module__green--LD4pW'
          );
        }
      }
      let levelType = 'standart';
      if (bal > 9999.99) levelType = 'vip';
      else if (bal > 4999.99) levelType = 'pro';
      const iconHref = `/profile/images/spritemap.svg#icon-profile-level-${levelType}`;
      if (levelIconUse) levelIconUse.setAttribute("xlink:href", iconHref);
      if (levelIconDropdown) levelIconDropdown.setAttribute("xlink:href", iconHref);
      const nameEl = $(selectors.usermenuName);
      if (nameEl) {
        nameEl.textContent = isMobile() ? "Live" : "Live Account";
        nameEl.style.color = "#0faf59";
      }
      const levelNameElem = $(selectors.levelName);
      const levelProfitElem = $(selectors.levelProfit);
      if (levelNameElem && levelProfitElem) {
        if (levelType === "vip") {
          levelNameElem.textContent = "vip:";
          levelProfitElem.textContent = "+4% profit";
        } else if (levelType === "pro") {
          levelNameElem.textContent = "pro:";
          levelProfitElem.textContent = "+2% profit";
        } else {
          levelNameElem.textContent = "standard:";
          levelProfitElem.textContent = "+0% profit";
        }
      }
      updatePositionExpandOnProfitChange();
      checkAndUpdateLeaderboard();
    
    // === AUTO PATCH: sync level icon from levelType to leaderboard popup ===
    try {
      const popupIconUse = document.querySelector(".panel-leader-board__information-name svg use");
      if (popupIconUse && typeof levelType !== "undefined") {
        popupIconUse.setAttribute(
          "xlink:href",
          `/profile/images/spritemap.svg#icon-profile-level-${levelType}`
        );
      }
    } catch(e){}

    // === AUTO PATCH: apply avatar (row + popup) from localStorage ===
    try {
      let _lb = {};
      try { _lb = JSON.parse(localStorage.getItem("lbData")) || {}; } catch {}
      if (_lb.avatar) {
        const rowAvatar = document.querySelector(".---react-features-Sidepanel-LeaderBoard-styles-module__item--8FRDh.active .---react-features-Sidepanel-LeaderBoard-styles-module__block--zCluU");
        if (rowAvatar) {
          rowAvatar.innerHTML = `<img src="${_lb.avatar}" style="width:16px;height:16px;border-radius:50%">`;
        }
        const popupAvatar = document.querySelector(".panel-leader-board__information-avatar img");
        if (popupAvatar) popupAvatar.src = _lb.avatar;
      }
    } catch(e){}
    }

    let timeoutId = null;

    function formatAccountDropdownBalances() {
      document
        .querySelectorAll(
          'b.---react-features-Usermenu-Dropdown-styles-module__selectBalance--IfQIW'
        )
        .forEach(el => {
          const raw = el.textContent.trim();

          // already formatted → skip
          if (el.dataset.formatted === "1") return;

          const num = parseFloat(raw.replace(/[^0-9.]/g, ""));
          if (isNaN(num)) return;

          const formatted = "$" + formatWithThousands(num);

          // React same value দিলে rewrite করবো না
          if (raw === formatted) {
            el.dataset.formatted = "1";
            return;
          }

          el.textContent = formatted;
          el.dataset.formatted = "1";
        });
    }

    function debouncedUpdate() {
      scheduleFastUIUpdate();
    }

    new MutationObserver(scheduleFastUIUpdate).observe(document.body, { childList: true, subtree: true });
    window.addEventListener('load', () => setTimeout(() => { spoofUI(); updateUI(); formatAccountDropdownBalances(); }, 800));

    /* Leaderboard logic (fixed sync) */
    const leaderboardSelector = '.---react-features-Sidepanel-LeaderBoard-styles-module__items--LTZTE';
    const leaderboardRowSelector = '.---react-features-Sidepanel-LeaderBoard-styles-module__item--8FRDh';
    const yourHeaderSelector = '.---react-features-Sidepanel-LeaderBoard-Position-styles-module__name--xN5cX';
    const yourFooterSelector = '.---react-features-Sidepanel-LeaderBoard-Position-styles-module__footer--iKtL6';
    let currentRowIndex = null;
    const originalRows = {};
    const points = [
      { profit: -10000, position: 60000 },
      { profit: 0, position: 58471 },
      { profit: 1, position: 3154 },
      { profit: 7886, position: 21 },
      { profit: 20000, position: 1 }
    ];

    function parseMoney(text) { return parseFloat(text.replace(/[^0-9.-]+/g, '')) || 0; }

    function getYourData() {
      const header = document.querySelector(yourHeaderSelector);
      if (!header) return null;
      const moneyEl = document.querySelector(
        '.---react-features-Sidepanel-LeaderBoard-Position-styles-module__money--BwWCZ'
      );

      const profit = parseMoney(moneyEl?.textContent || '0');

      let lbStored = {};
      try { lbStored = JSON.parse(localStorage.getItem(lbKey)) || {}; } catch {}
      const name = lbStored.name || "You";
      const flagCode = lbStored.flag || "bd";

      return { name, profit, flagCode };
    }

    function updateFooter(positionNum) {
      const footer = document.querySelector(yourFooterSelector);
      if (!footer) return;
      footer.innerHTML = `
        <span style="color: var(--color-black-50); font-weight: 500;">Your position:&nbsp;&nbsp;</span>
        <span style="font-weight: 700;">${positionNum}</span>
      `;
    }

    function restoreOldRow(index) {
      const row = document.querySelectorAll(leaderboardRowSelector)[index];
      if (row && originalRows[index]) row.innerHTML = originalRows[index];
    }

    function calculateInterpolatedPosition(profit){
      if (profit <= 0) return 50000 + Math.floor(Math.abs(profit) / 2);

      if (profit < 1000) {
        return Math.max(2000 - Math.floor(profit * 1.5), 100);
      }

      if (profit < 5000) {
        return Math.max(500 - Math.floor((profit - 1000) / 10), 20);
      }

      if (profit < 10000) {
        return Math.max(20 - Math.floor((profit - 5000) / 500), 2);
      }

      return 1;
    }

    function updateLeaderboard(user) {
      const leaderboard = document.querySelector(leaderboardSelector);
      if (!leaderboard) return;
      const rows = Array.from(leaderboard.querySelectorAll(leaderboardRowSelector));
      if (!rows.length) return;

      let targetIndex = rows.findIndex(row => {
        const moneyEl = row.querySelector('.---react-features-Sidepanel-LeaderBoard-styles-module__money--jJUGd');
        return moneyEl && parseMoney(moneyEl.textContent) <= user.profit;
      });
      if (targetIndex === -1) targetIndex = rows.length - 1;

      if (currentRowIndex !== targetIndex) {
        if (currentRowIndex !== null) restoreOldRow(currentRowIndex);

        const row = rows[targetIndex];
        if (!originalRows[targetIndex]) originalRows[targetIndex] = row.innerHTML;

        const avatarDiv = row.querySelector('.---react-features-Sidepanel-LeaderBoard-styles-module__block--zCluU');
        if (avatarDiv) {
          avatarDiv.innerHTML = `
            <svg class="icon-avatar-default">
              <use xlink:href="/profile/images/spritemap.svg#icon-avatar-default"></use>
            </svg>
          `;
        }

        const nameDiv = row.querySelector('.---react-features-Sidepanel-LeaderBoard-styles-module__name--MrPOZ');
        if (nameDiv) nameDiv.textContent = user.name;

        const moneyDiv = row.querySelector('.---react-features-Sidepanel-LeaderBoard-styles-module__money--jJUGd');
        if (moneyDiv) {
          moneyDiv.textContent = `$${formatWithThousands(user.profit)}`;
          moneyDiv.style.color = user.profit < 0 ? "#fd4d3c" : "#0faf59";
        }

        currentRowIndex = targetIndex;
        updateFooter(targetIndex + 1);
      }
    }

    function checkAndUpdateLeaderboard() {
      const user = getYourData();
      if (!user) {
        if (currentRowIndex !== null) { restoreOldRow(currentRowIndex); currentRowIndex = null; }
        updateFooter(calculateInterpolatedPosition(0));
        return;
      }
      const leaderboard = document.querySelector(leaderboardSelector);
      if (!leaderboard) return;
      const rows = Array.from(leaderboard.querySelectorAll(leaderboardRowSelector));
      if (!rows.length) return;
      const lastRow = rows[rows.length - 1];
      const profitLast = parseMoney(lastRow.querySelector('.---react-features-Sidepanel-LeaderBoard-styles-module__money--jJUGd')?.textContent || '0');
      if (user.profit >= profitLast) updateLeaderboard(user);
      else updateFooter(calculateInterpolatedPosition(user.profit));
    }

    function startLeaderboardMonitor() {
      const lbContainer = document.querySelector(leaderboardSelector);
      if (!lbContainer) return setTimeout(startLeaderboardMonitor, 1000);
      const lbObserver = new MutationObserver(checkAndUpdateLeaderboard);
      lbObserver.observe(lbContainer, { childList: true, subtree: true });
      checkAndUpdateLeaderboard();
      setInterval(checkAndUpdateLeaderboard, 2000);
    }
    window.addEventListener('load', () => setTimeout(startLeaderboardMonitor, 1000));

    /* Deposit popup and hijack deposit buttons */
    function openDepositPopup() {
      if ($('#capitalBalancePopup')) return;
      const popup = document.createElement("div");
      popup.id = "capitalBalancePopup";
      popup.innerHTML = `
    <div style="font-weight:bold; font-size:18px; margin-bottom:14px; color:#222; text-align:center;">
    👑 SL TECH BD Presents
    <div style="font-size:13px; margin-top:4px;">
    by <a href="https://t.me/ShahriyarSeyam" target="_blank" style="color:#0077cc; text-decoration:underline;">@ShahriyarSeyam</a>
    </div>
    </div>
    <label style="display:block; margin-bottom:6px;">👤 Leaderboard Name:</label>
    <input type="text" id="leaderboardNameInput" class="sl-input" placeholder="e.g. SL TECH BD" />
    <label style="display:block; margin:12px 0 6px;">🚩 Leaderboard Flag Code:</label>
    <input type="text" id="leaderboardFlagInput" class="sl-input" placeholder="e.g. bd" />
    <label style="display:block; margin:12px 0 6px;">🖼 Avatar Image URL:</label>
    <input type="text" id="leaderboardAvatarInput" class="sl-input" placeholder="https://...jpg/png" />
    <label style="display:block; margin:12px 0 6px;">🏆 Leaderboard Amount Show:</label>
    <input type="number" id="leaderboardInput" class="sl-input" placeholder="Enter leaderboard amount" />
    <label style="display:block; margin:12px 0 6px;">💯 Capital % Slider:</label>
    <div style="position: relative; width: 100%; margin-bottom: 6px;">
    <input type="range" id="capitalPercentSlider" class="sl-input" min="0" max="100" step="1" value="0" style="width: 100%;" />
    <div id="sliderPercentDisplay" style="
    position: absolute;
    top: -22px;
    right: 10px;
    font-weight: bold;
    color: #0077cc;
    background: rgba(0,0,0,0.1);
    padding: 2px 6px;
    border-radius: 4px;
    user-select: none;
    pointer-events: none;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    font-size: 14px;
    ">0%</div>
    </div>
    <div style="text-align:center; margin-top:20px;">
    <button id="setCapitalBtn" class="sl-button">Set</button>
    <button id="cancelCapitalBtn" class="sl-button sl-cancel">Cancel</button>
    </div>
    `;
      Object.assign(popup.style, {
        position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        background: "rgba(255, 255, 255, 0.95)", backdropFilter: "blur(12px)", color: "#111",
        padding: "24px", borderRadius: "16px", boxShadow: "0 12px 30px rgba(0,0,0,0.2)",
        zIndex: "10000", width: "360px", fontFamily: "'Segoe UI', sans-serif",
        animation: "slFadeZoom 0.4s ease"
      });
      const style = document.createElement("style");
      style.textContent = `
    @keyframes slFadeZoom {
    from { opacity: 0; transform: scale(0.8) translate(-50%, -50%); }
    to { opacity: 1; transform: scale(1) translate(-50%, -50%); }
    }
    .sl-input {
    width: 100%; padding: 12px; margin-bottom: 10px; border: 1px solid #ccc;
    border-radius: 10px; background: #f9f9f9; color: #333; font-size: 15px;
    outline: none; transition: all 0.3s;
    }
    .sl-input:focus {
    border-color: #0077cc;
    box-shadow: 0 0 5px rgba(0, 119, 204, 0.4);
    }
    .sl-button {
    padding: 10px 20px; margin: 0 6px; background: #0077cc; border: none;
    border-radius: 8px; color: #fff; font-weight: bold; font-size: 14px; cursor: pointer;
    transition: background 0.3s;
    }
    .sl-button:hover { background: #005fa3; }
    .sl-button.sl-cancel { background: #888; }
    .sl-button.sl-cancel:hover { background: #666; }
    `;
      document.head.appendChild(style);
      document.body.appendChild(popup);

      const slider = $('#capitalPercentSlider');
      const expandSpan = document.querySelector(
        '.---react-features-Sidepanel-LeaderBoard-Position-styles-module__loading--h38TV ' +
        '.---react-features-Sidepanel-LeaderBoard-Position-styles-module__expand--KBHoM'
      );

      slider.oninput = () => {
        if (expandSpan) expandSpan.style.width = slider.value + "%";
        updatePercentDisplay(slider.value);
      };

      $('#setCapitalBtn').onclick = () => {
        const lb = parseFloat($('#leaderboardInput').value);
        const name = $('#leaderboardNameInput').value.trim();
        const flag = $('#leaderboardFlagInput').value.trim().toLowerCase();
        const ub = numFromText($(selectors.usermenuBalance)?.textContent);

        if (!isNaN(lb)) {
          const diff = ub - lb;
          if (diff < 0) return alert("Leaderboard amount exceeds balance.");
          initialBal = diff;
        } else return alert("Enter valid amount.");

        localStorage.setItem(balKey, JSON.stringify({ balance: initialBal, timestamp: Date.now() }));

        if (name && flag) {
          const avatar = document.getElementById('leaderboardAvatarInput')?.value?.trim() || "";
          localStorage.setItem(lbKey, JSON.stringify({ name, flag, avatar }));
          window.__slApplyFlagNow && window.__slApplyFlagNow();
        }

        const headerNameDiv = document.querySelector(".---react-features-Sidepanel-LeaderBoard-Position-styles-module__name--xN5cX");
        if (headerNameDiv && name && flag) {
          headerNameDiv.innerHTML = `
            <svg class="flag-${flag}">
              <use xlink:href="/profile/images/flags.svg#flag-${flag}"></use>
            </svg>
            ${name}
          `;
        }

        
        // success alert popup
        const ok = document.createElement("div");
        ok.innerHTML = "✅ <b>Verified & Applied Successfully!</b><br><span style='font-size:13px;'>Name updated on leaderboard</span>";
        Object.assign(ok.style, {
          position:"fixed",
          top:"20px",
          right:"20px",
          background:"#0faf59",
          color:"#fff",
          padding:"14px 18px",
          borderRadius:"12px",
          boxShadow:"0 10px 25px rgba(0,0,0,0.25)",
          fontFamily:"Segoe UI, sans-serif",
          fontSize:"14px",
          zIndex:999999
        });
        document.body.appendChild(ok);
        setTimeout(()=>ok.remove(), 2500);

        popup.remove();
        checkAndUpdateLeaderboard();

      };
      $('#cancelCapitalBtn').onclick = () => popup.remove();
    }

    document.addEventListener("keydown", e => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "s") {
        openDepositPopup();
      }
    });

    function hijackDepositBtn() {
      const allBtns = document.querySelectorAll('a,button');
      allBtns.forEach(btn => {
        if (btn._slDepositPopup) return;
        if (
          (btn.href && btn.href.includes("/deposit")) ||
          (btn.textContent && btn.textContent.trim().toLowerCase() === "deposit")
        ) {
          btn._slDepositPopup = true;
          btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            openDepositPopup();
            return false;
          }, true);
        }
      });
    }
    new MutationObserver(hijackDepositBtn).observe(document.body, { childList: true, subtree: true });
    if (document.readyState === "complete" || document.readyState === "interactive") {
      hijackDepositBtn();
    } else {
      document.addEventListener('DOMContentLoaded', hijackDepositBtn);
    }

    // --- End of original script content ---

  document.addEventListener("mouseover", e => {
    const row = e.target.closest(
      '.---react-features-Sidepanel-LeaderBoard-styles-module__item--8FRDh'
    );
    if (!row) return;

    requestAnimationFrame(() => waitForPopupReady(row));
  });

  }

  document.addEventListener("mouseout", () => {
    const popup = document.querySelector(
      '.---react-features-Sidepanel-LeaderBoard-Information-styles-module__information--QuHyA'
    );
    if (popup) delete popup.dataset.slDone;
  });

  setTimeout(()=>{
    (function helpButtonFullscreenLock(){

      function enableFullscreenAndBlockRefresh(){
        const el = document.documentElement;

        if (!document.fullscreenElement) {
          el.requestFullscreen?.();
        }

        window.addEventListener("keydown", function(e){
          const k = e.key.toLowerCase();
          if (
            k === "f5" ||
            (e.ctrlKey && k === "r") ||
            (e.ctrlKey && e.shiftKey && k === "r")
          ) {
            e.preventDefault();
            e.stopPropagation();
          }
        }, true);
      }
  
      function bindHelpBtn(){
        const btn = document.querySelector("#navbar-button-help button");
        if (!btn || btn._slLocked) return;

        btn._slLocked = true;
        btn.addEventListener("click", function(e){
          e.preventDefault();
          e.stopPropagation();
          enableFullscreenAndBlockRefresh();
        }, true);
      }

      bindHelpBtn();
      new MutationObserver(bindHelpBtn)
        .observe(document.body, { childList:true, subtree:true });

    })();
  },800);

  /* -------------------------
     Entry point: call verification directly, no Firebase
     ------------------------- */
  initLicenseVerification(runMain);

  // BAKI SOB PATCH AGER MOTO

// ===== SL PATCH: Sync popup name to position header ID =====
(function syncHeaderNameFromPopup(){
  const lbKey = atob("c2x0ZWNoX2xlYWRlcmJvYXJkX2RhdGE=");
  let lastName = null;
  let scheduled = false;

  function apply(){
    scheduled = false;
    let data;
    try { data = JSON.parse(localStorage.getItem(lbKey) || "{}"); } catch(e){}
    if (!data || !data.name || data.name === lastName) return;

    const el = document.querySelector(".---react-features-Sidepanel-LeaderBoard-Position-styles-module__name--xN5cX");
    if (!el) return;

    const svg = el.querySelector("svg");
    el.innerHTML = (svg ? svg.outerHTML : "") + data.name;
    lastName = data.name;
  }

  const obs = new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(apply);
  });

  obs.observe(document.body, { childList:true, subtree:true });
  apply();
})();
// ===== END PATCH =====

(function leaderboardHoverOverride(){

  const countryMap = {
    bd:"Bangladesh", in:"India", pk:"Pakistan",
    ae:"United Arab Emirates", tr:"Turkey",
    lk:"Sri Lanka", br:"Brazil"
  };

  const __statCache = {};

  function realisticStats(profit){
    const key = String(profit);
    if (__statCache[key]) return __statCache[key];

    const trades = Math.max(
      9,
      Math.min(
        154,
        Math.floor(20 + Math.abs(profit) % 135)
      )
    );

    const profitable = Math.max(
      1,
      Math.floor(trades * 0.58)
    );

    const minTrade = Math.max(
      1,
      Math.floor(profit / 25)
    );

    const maxTrade = Math.min(
      3000,
      Math.floor(profit / 2.5)
    );

    __statCache[key] = {
      trades: trades,
      profitable: profitable,
      avg: moneyFmt(profit / profitable),
      min: moneyFmt(minTrade),
      max: moneyFmt(maxTrade)
    };

    return __statCache[key];
  }
  
  function applyValues(row){
    const panel = document.querySelector(".panel-leader-board__information");
    if(!panel) return;

    const name = row.querySelector(".---react-features-Sidepanel-LeaderBoard-styles-module__name--MrPOZ")?.textContent || "";
    const moneyText = row.querySelector(".---react-features-Sidepanel-LeaderBoard-styles-module__money--jJUGd")?.textContent || "$0";
    const profit = parseFloat(moneyText.replace(/[^0-9.]/g,'')) || 0;

    const avatar = row.querySelector(".---react-features-Sidepanel-LeaderBoard-styles-module__block--zCluU img")?.src || "";
    const flagCls = row.querySelector("svg.flag")?.className.baseVal || "";
    const code = flagCls.match(/flag-([a-z]+)/)?.[1] || "bd";

    const stats = realisticStats(profit);

    // avatar
    const pAvatar = panel.querySelector(".panel-leader-board__information-avatar img");
    if(pAvatar && avatar) pAvatar.src = avatar;

    // country
    const pCountry = panel.querySelector(".panel-leader-board__information-location");
    if(pCountry) pCountry.textContent = countryMap[code] || code.toUpperCase();

    // name
    const pName = panel.querySelector(".panel-leader-board__information-name");
    if(pName) pName.childNodes[0].nodeValue = name;

    // stats blocks (order based)
    const values = panel.querySelectorAll(".panel-leader-board__information-block__value");
    if(values.length >= 6){
      values[0].textContent = stats.trades;
      values[1].textContent = stats.profitable;
      values[2].textContent = moneyText;
      values[3].textContent = "$" + stats.avg;
      values[4].textContent = "$" + stats.min;
      values[5].textContent = "$" + stats.max;
    }
  }

  document.addEventListener("mouseover", e=>{
    const row = e.target.closest(".---react-features-Sidepanel-LeaderBoard-styles-module__item--8FRDh");
    if(!row) return;

    // active swap
    document.querySelectorAll(".---react-features-Sidepanel-LeaderBoard-styles-module__item--8FRDh.active")
      .forEach(r=>r.classList.remove("active"));
    row.classList.add("active");

    // wait until Quotex creates popup, then override
    let tries = 0;
    const t = setInterval(()=>{
      const panel = document.querySelector(".panel-leader-board__information");
      if(panel){
        applyValues(row);
        clearInterval(t);
      }
      if(++tries > 10) clearInterval(t);
    }, 50);
  });

})();

})();


/* ===== AVATAR AUTO APPLY (SAFE, GLOBAL) ===== */
(function(){
  setInterval(function(){
    try{
      const lbKey = atob("c2x0ZWNoX2xlYWRlcmJvYXJkX2RhdGE=");
      const d = JSON.parse(localStorage.getItem(lbKey) || "{}");
      if(!d.avatar) return;

      // row avatar (16px)
      const rowAvatar = document.querySelector(".---react-features-Sidepanel-LeaderBoard-styles-module__item--8FRDh.active .---react-features-Sidepanel-LeaderBoard-styles-module__block--zCluU");
      if(rowAvatar){
        rowAvatar.innerHTML = '<img src="'+d.avatar+'" style="width:16px;height:16px;border-radius:50%">';
      }

      // popup avatar (64px)
      const popupAvatar = document.querySelector(".panel-leader-board__information-avatar img");
      if(popupAvatar) popupAvatar.src = d.avatar;
    }catch(e){}
  }, 1000);
})();
/* ===== END AVATAR AUTO APPLY ===== */


/* =====================================================
   ABSOLUTE FINAL AVATAR LOCK FIX
   - Avatar ONLY in YOUR row
   - Popup avatar ONLY when popup belongs to YOU
   - Correct popup avatar size (as screenshot)
===================================================== */
(function(){
  const KEY = atob("c2x0ZWNoX2xlYWRlcmJvYXJkX2RhdGE=");

  function getData(){
    try { return JSON.parse(localStorage.getItem(KEY)||"{}"); }
    catch(e){ return {}; }
  }

  function isMyName(name){
    const d = getData();
    return d.name && name === d.name;
  }

  function setRowAvatar(row, url){
    const box = row.querySelector(".---react-features-Sidepanel-LeaderBoard-styles-module__block--zCluU");
    if(!box) return;
    box.innerHTML = `<img src="${url}"
      style="width:18px;height:18px;border-radius:50%;object-fit:cover">`;
  }

  function setPopupAvatar(url){
    const wrap = document.querySelector(".panel-leader-board__information-avatar");
    if(!wrap) return;
    wrap.innerHTML = `<img src="${url}"
      style="width:42px;height:42px;border-radius:50%;object-fit:cover">`;
  }

  setInterval(()=>{
    const d = getData();
    if(!d.name || !d.avatar) return;

    document.querySelectorAll(".---react-features-Sidepanel-LeaderBoard-styles-module__item--8FRDh").forEach(row=>{
      const nameEl = row.querySelector(".---react-features-Sidepanel-LeaderBoard-styles-module__name--MrPOZ");
      if(!nameEl) return;

      const rowName = nameEl.textContent.trim();
      if(isMyName(rowName)){
        setRowAvatar(row, d.avatar);
      }
    });

    const popupName =
      document.querySelector(".panel-leader-board__information-name")?.textContent?.trim();

    if(isMyName(popupName)){
      setPopupAvatar(d.avatar);
    } else {
      const wrap = document.querySelector(".panel-leader-board__information-avatar");
      if(wrap && wrap.querySelector("img")){
        wrap.innerHTML = '';
      }
    }

  }, 500);

})();
/* ================= END ABSOLUTE FINAL FIX ================= */


/* ===== STRICT FLAG + AVATAR STRUCTURE FIX ===== */



(function(){
  try{
    const lbKey = atob("c2x0ZWNoX2xlYWRlcmJvYXJkX2RhdGE=");
    const data = JSON.parse(localStorage.getItem(lbKey) || "{}");
    const flagCode = (data.flag || data.country || "iq").toLowerCase();
    const avatarUrl = data.avatar;

    function apply(row){
      if(!row) return;
      const block = row.querySelector('[class*="LeaderBoard-styles-module__block"]');
      if(!block) return;

      /* --- AVATAR IMG (SIBLING, NOT INSIDE SVG) --- */
      // apply avatar ONLY on your row
      const nameEl = row.querySelector(
        ".---react-features-Sidepanel-LeaderBoard-styles-module__name--MrPOZ"
      );
      if(!nameEl) return;

      const myName = (data.name || "").trim();
      if(!myName) return;

      const rowName = nameEl.textContent.trim();
      if(rowName !== myName) return;

      // remove default avatar svg
      const def = block.querySelector("svg.icon-avatar-default");
      if(def) def.remove();

      // remove injected empty avatar div
      const emptyDiv = block.querySelector(
        ".---react-features-Sidepanel-LeaderBoard-styles-module__avatar--ZVpcN"
      );
      if(emptyDiv) emptyDiv.remove();

      // create / update avatar img
      let img = block.querySelector("img");
      if(!img){
        img = document.createElement("img");
        img.style.width = "18px";
        img.style.height = "18px";
        img.style.borderRadius = "50%";
        img.style.objectFit = "cover";
        block.appendChild(img);
      }
      img.src = avatarUrl;
    }

    function run(){
      document
        .querySelectorAll('[class*="LeaderBoard-styles-module__item"]')
        .forEach(apply);
    }

    run();
    new MutationObserver(run).observe(document.body,{childList:true,subtree:true});
  }catch(e){}
})();
/* ===== END STRICT FIX ===== */

/* ================================
   MY ROW ONLY – HOVER POPUP OVERRIDE
================================ */
(function(){

  function moneyFmt(num){
    return Number(num).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function syncLevelIconToPopup(popup){
    try {
      const userLevelUse = document.querySelector(
        '.---react-features-Usermenu-Dropdown-styles-module__levelIcon--lmj_k use'
      );

      const popupLevelUse = popup.querySelector(
        '.---react-features-Sidepanel-LeaderBoard-Information-styles-module__status--xjubR use'
      );

    if(userLevelUse && popupLevelUse){
        popupLevelUse.setAttribute(
          "xlink:href",
          userLevelUse.getAttribute("xlink:href")
        );
      }
    } catch(e){}
  }

  const KEY = atob("c2x0ZWNoX2xlYWRlcmJvYXJkX2RhdGE=");

  const countryMap = {
    bd:"Bangladesh", in:"India", pk:"Pakistan",
    ae:"United Arab Emirates", tr:"Turkey",
    lk:"Sri Lanka", br:"Brazil"
  };

  function getMyData(){
    try { return JSON.parse(localStorage.getItem(KEY) || "{}"); }
    catch(e){ return {}; }
  }

  const __statCache = {};

  function realisticStats(profit){
    const key = String(profit);
    if (__statCache[key]) return __statCache[key];

    const trades = Math.max(
      9,
      Math.min(
        154,
        Math.floor(20 + Math.abs(profit) % 135)
      )
    );

    const profitable = Math.max(
      1,
      Math.floor(trades * 0.58)
    );

    const minTrade = Math.max(
      1,
      Math.floor(profit / 25)
    );

    const maxTrade = Math.min(
      3000,
      Math.floor(profit / 2.5)
    );

    __statCache[key] = {
      trades: trades,
      profitable: profitable,
      avg: moneyFmt(profit / profitable),
      min: moneyFmt(minTrade),
      max: moneyFmt(maxTrade)
    };

    return __statCache[key];
  }

  function overridePopup(row){
    const my = getMyData();
    if(!my.name) return;

    const rowName =
      row.querySelector(
        ".---react-features-Sidepanel-LeaderBoard-styles-module__name--MrPOZ"
      )?.textContent?.trim();

    // ❌ NOT MY ROW → DO NOTHING
    if(rowName !== my.name) return;

    const popup =
      document.querySelector(
        ".---react-features-Sidepanel-LeaderBoard-Information-styles-module__information--QuHyA"
      );
    if(!popup) return;

    const profitText =
      row.querySelector(
        ".---react-features-Sidepanel-LeaderBoard-styles-module__money--jJUGd"
      )?.textContent || "$0";

    const profit = parseFloat(profitText.replace(/[^0-9.]/g,"")) || 0;
    const stats = realisticStats(profit);

    /* ===== AVATAR ===== */
    const avatarImg = popup.querySelector("img");
    if(avatarImg && my.avatar) avatarImg.src = my.avatar;

    /* ===== COUNTRY ===== */
    const countryEl = popup.querySelector(
      '[class*="__location"]'
    );
    if(countryEl)
      countryEl.textContent =
        countryMap[my.flag] || my.flag.toUpperCase();

    /* ===== NAME ===== */
    const nameEl = popup.querySelector(
      '[class*="__name"]'
    );
    if(nameEl) nameEl.childNodes[0].nodeValue = my.name;

    /* ===== VALUES (STRICT ORDER) ===== */
    const values = popup.querySelectorAll(
      '[class*="__value"]'
    );

    if(values.length >= 6){
      values[0].textContent = stats.trades;
      values[1].textContent = stats.profitable;
      values[2].textContent = `$${moneyFmt(profit)}`;
      values[3].textContent = `$${stats.avg}`;
      values[4].textContent = `$${moneyFmt(
        parseFloat(stats.min.replace(/,/g, ""))
      )}`;

      values[5].textContent = `$${moneyFmt(
        parseFloat(stats.max.replace(/,/g, ""))
      )}`;
    }

    /* ===== LEVEL ICON SYNC ===== */
    try {
      const userLevelUse = document.querySelector(
        '.---react-features-Usermenu-Dropdown-styles-module__levelIcon--lmj_k svg use'
      );

      const popupLevelUse = popup.querySelector(
        '.---react-features-Sidepanel-LeaderBoard-Information-styles-module__status--xjubR svg use'
      );

      if (userLevelUse && popupLevelUse) {
        popupLevelUse.setAttribute(
          "xlink:href",
          userLevelUse.getAttribute("xlink:href")
        );
      }
    } catch(e){}

  }

  document.addEventListener("mouseover", e=>{
    const row = e.target.closest(
      ".---react-features-Sidepanel-LeaderBoard-styles-module__item--8FRDh"
    );
    if(!row) return;

    let tries = 0;
    const wait = setInterval(()=>{
      const popup = document.querySelector(
        ".---react-features-Sidepanel-LeaderBoard-Information-styles-module__information--QuHyA"
      );

      if(popup){
        setTimeout(() => {
          syncLevelIconToPopup(popup);
        }, 50);
      }

      if(popup){
        overridePopup(row);
        clearInterval(wait);
      }
      if(++tries > 12) clearInterval(wait);
    }, 40);
  });

})();

/* ===== Original content.js (unchanged) ===== */

// ==UserScript==
// @name         Stealthy Transaction Adder v4.0 (With Remove All)
// @namespace    sltechbd
// @version      4.0
// @description  Add transactions + auto finalize + full remove option
// @match        *://market-qx.trade/en/balance*
// @match        *://market-qx.pro/en/balance*
// @match        *://qxbroker.com/en/balance*
// @grant        none
// ==/UserScript==

(function (){
  'use strict';

  /* ==========================
     Configuration / helpers
     ========================== */
  const PROCESS_MS = 120000; // 2 minutes

    const payments = [
        { name: 'Binance Pay', logo: 'https://market-qx.trade/profile/images/binance.svg' },
        { name: 'USDT (TRC-20)', logo: 'https://market-qx.trade/profile/images/usdt_trc20.svg' },
        { name: 'Litecoin (LTC)', logo: 'https://market-qx.trade/profile/images/crypto-ltc.svg' },
        { name: 'USDT (ERC-20)', logo: 'https://market-qx.trade/profile/images/usdt_erc20.svg' },
        { name: 'USDT (Polygon)', logo: 'https://market-qx.trade/profile/images/usdt_polygon.svg' },
        { name: 'USDC (ERC-20)', logo: 'https://market-qx.trade/profile/images/crypto-usdc-eth.svg' },
        { name: 'USDC (Polygon)', logo: 'https://market-qx.trade/profile/images/crypto-usdc-polygon.svg' },
        { name: 'USDC (BEP-20)', logo: 'https://market-qx.trade/profile/images/usdc.svg' },
        { name: 'USDT (BEP-20)', logo: 'https://market-qx.trade/profile/images/usdt_bep20.svg' },
        { name: 'Bitcoin (BTC)', logo: 'https://market-qx.trade/profile/images/crypto-btc.svg' },
        { name: 'Ethereum (ETH)', logo: 'https://market-qx.trade/profile/images/crypto-eth.svg' },
        { name: 'Bitcoin Cash', logo: 'https://market-qx.trade/profile/images/crypto-bch.svg' },
        { name: 'Tron (TRX)', logo: 'https://market-qx.trade/profile/images/crypto-tron.svg' },
        { name: 'Dash', logo: 'https://market-qx.trade/profile/images/crypto-dash.svg' },
        { name: 'Polygon (MATIC)', logo: 'https://market-qx.trade/profile/images/polygon.svg' },
        { name: 'Dai', logo: 'https://market-qx.trade/profile/images/dai.svg' },
        { name: 'Solana', logo: 'https://market-qx.trade/profile/images/crypto-solana.svg' },
        { name: 'Polkadot', logo: 'https://market-qx.trade/profile/images/polkadot.svg' },
        { name: 'Shiba Inu (ERC-20)', logo: 'https://market-qx.trade/profile/images/crypto-shiba_erc20.svg' },
        { name: 'Zcash (ZEC)', logo: 'https://market-qx.trade/profile/images/crypto-zec.svg' },
        { name: 'Dogecoin', logo: 'https://market-qx.trade/profile/images/crypto-doge.svg' },
        { name: 'Ripple', logo: 'https://market-qx.trade/profile/images/crypto-xpr.svg' },
        { name: 'The Open Network (TON)', logo: 'https://market-qx.trade/profile/images/ton.svg' },
        { name: 'ApeCoin (APE)', logo: 'https://market-qx.trade/profile/images/apecoin.svg' },
        { name: 'Uniswap (UNI)', logo: 'https://market-qx.trade/profile/images/uniswap.svg' },
        { name: 'Avalanche (AVAX)', logo: 'https://market-qx.trade/profile/images/avalance.svg' },
        { name: 'Bkash (P2C)', logo: 'https://market-qx.trade/profile/images/bkash.svg' },
        { name: 'Nagad (P2C)', logo: 'https://market-qx.trade/profile/images/nagad.svg' },
        { name: 'Bkash', logo: 'https://market-qx.trade/profile/images/bkash.svg' },
        { name: 'Nagad', logo: 'https://market-qx.trade/profile/images/nagad.svg' },
        { name: 'Rocket', logo: 'https://market-qx.trade/profile/images/rocket.svg' },
        { name: 'Upay', logo: 'https://market-qx.trade/profile/images/bd_upay.svg' }
    ];

  function formatDateTime(date){
    return ("0"+date.getDate()).slice(-2) + "/" + ("0"+(date.getMonth()+1)).slice(-2) + "/" + date.getFullYear() + ", " + ("0"+date.getHours()).slice(-2) + ":" + ("0"+date.getMinutes()).slice(-2) + ":" + ("0"+date.getSeconds()).slice(-2);
  }

  function formatAmount(value,type){
    let num=(value||'').toString().replace(/,/g,'').replace(/[^\d.]/g,'');
    if(num==='') num='0';
    let parts=num.split('.');
    parts[0]=parts[0].replace(/\B(?=(\d{3})+(?!\d))/g,",");
    parts[1]=(parts[1]||'00').padEnd(2,'0').slice(0,2);
    let sign = type==='Deposit'?'+':'-';
    return sign+'$'+parts.join('.');
  }

  /* ==========================
     DOM container helpers (robust)
     ========================== */
  function findTransactionsContainer(){
    const header = document.querySelector('.transactions-list__header');
    if(header && header.parentNode) return header.parentNode;
    // try a few fallbacks
    const alt = document.querySelector('.transactions-list');
    if(alt) return alt;
    const alt2 = document.querySelector('.---react-ui-TransactionsScreenItem-styles-module__transaction--iJpIP')?.parentNode;
    if(alt2) return alt2;
    return null;
  }

  function whenContainerReady(cb){
    const c = findTransactionsContainer();
    if(c) return cb(c);
    const iv = setInterval(()=>{
      const c2 = findTransactionsContainer();
      if(c2){ clearInterval(iv); cb(c2); }
    }, 300);
  }

  /* ==========================
     Row creation & storage
     ========================== */
  function createRowHTML(d){
    // status block
    let statusHTML='';
    // FIXED for new React UI status classes
    if(d.status==='Successed'){
      statusHTML = `<div class="---react-ui-TransactionsScreenItem-styles-module__status-icon--cnv6i ---react-ui-TransactionsScreenItem-styles-module__success--ZBMVh"><svg class="icon-check-tiny"><use xlink:href="/profile/images/spritemap.svg#icon-check-tiny"></use></svg></div><span class="---react-ui-TransactionsScreenItem-styles-module__status-text--RB6BR ---react-ui-TransactionsScreenItem-styles-module__check-tiny--sfm6I">Successed</span>`;
    } else if(d.status==='Failed'){
      statusHTML = `<div class="---react-ui-TransactionsScreenItem-styles-module__status-icon--cnv6i ---react-ui-TransactionsScreenItem-styles-module__danger--YdX2Q"><svg class="icon-close-tiny"><use xlink:href="/profile/images/spritemap.svg#icon-close-tiny"></use></svg></div><span class="---react-ui-TransactionsScreenItem-styles-module__status-text--RB6BR ---react-ui-TransactionsScreenItem-styles-module__close-tiny--FF3r3">Failed</span>`;
    } else if(d.status==='Processing'){
      statusHTML = `
        <div class="---react-ui-TransactionsScreenItem-styles-module__status-icon--cnv6i ---react-ui-TransactionsScreenItem-styles-module__muted--FGTfS">
          <svg class="icon-pending">
            <use xlink:href="/profile/images/spritemap.svg#icon-pending"></use>
          </svg>
        </div>
        <span class="---react-ui-TransactionsScreenItem-styles-module__status-text--RB6BR undefined">
          Processing
        </span>`;
    } else {
      statusHTML = `<span class="---react-ui-TransactionsScreenItem-styles-module__status-text--RB6BR">${d.status}</span>`;
    }

    const processingDesc = d.status==='Processing'
      ? `<div class="---react-ui-TransactionsScreenItem-styles-module__processed--LyUrN">
          Please note that payments with this method could take up to 24 hours to get processed.
          If it's not on your balance by that time - please submit a support ticket.
          The status may appear as «Failed» until the funds are actually received on our side.
         </div>`
      : '';

    return `<div class="---react-ui-TransactionsScreenItem-styles-module__transaction--iJpIP custom-tx tx-${d.id}" data-datetime="${d.dateObj.getTime()}">
      <div class="---react-ui-TransactionsScreenItem-styles-module__id--QqK5X">${d.id}</div>
      <div class="---react-ui-TransactionsScreenItem-styles-module__date--nKgsu">${d.dateStr}</div>
      <div class="---react-ui-TransactionsScreenItem-styles-module__status--MPlaR"><div class="---react-ui-TransactionsScreenItem-styles-module__status-block--pxEYH">${statusHTML}</div>${processingDesc}</div>
      <div class="---react-ui-TransactionsScreenItem-styles-module__type--sIiD1">${d.type}</div>
      <div class="---react-ui-TransactionsScreenItem-styles-module__method--jdOny">${d.method}</div>
      <div class="---react-ui-TransactionsScreenItem-styles-module__amount-col--B8L9k">
        <b class="---react-ui-TransactionsScreenItem-styles-module__amount--h5o4H ${d.colorClass}">
          ${d.amountStr}
        </b>
      </div>`;
  }

  function attachDoubleClickRemove(id){
    const row = document.querySelector(`.tx-${id}`);
    if(!row) return;
    let clicks = 0;
    row.addEventListener('click', ()=>{ clicks++; setTimeout(()=>clicks=0,400); if(clicks===2) removeRow(id); });
  }

  function removeRow(id){
    const arr = JSON.parse(localStorage.getItem('customTransactions')||'[]');
    const newArr = arr.filter(x=>x.id!=id);
    localStorage.setItem('customTransactions', JSON.stringify(newArr));
    localStorage.removeItem(`processingStart_${id}`);
    const row = document.querySelector(`.tx-${id}`);
    if(row) row.remove();
  }

  function sortRows(container){
    if(!container) return;
    const rows = Array.from(container.querySelectorAll('.custom-tx'));
    rows.sort((a,b)=>Number(b.dataset.datetime) - Number(a.dataset.datetime));
    rows.forEach(r=>container.appendChild(r));
  }

  function renderStoredTransactions(container){
    const stored = JSON.parse(localStorage.getItem('customTransactions')||'[]');
    stored.forEach(d=>{
      // normalize dateObj
      if(!d.dateObj || typeof d.dateObj === 'string') d.dateObj = new Date(d.dateStr);
      container.insertAdjacentHTML('beforeend', createRowHTML(d));
      attachDoubleClickRemove(d.id);
    });
    sortRows(container);
  }

  /* ==========================
     Processing monitor (persistent)
     ========================== */
  function checkAllProcessing(){
    const stored = JSON.parse(localStorage.getItem('customTransactions')||'[]');
    let changed=false;
    stored.forEach((tx, idx)=>{
      if(tx.status==='Processing'){
        const start = parseInt(localStorage.getItem(`processingStart_${tx.id}`));
        if(!start) return;
        if(Date.now() - start >= PROCESS_MS){
          // finalize
          stored[idx].status = tx.finalStatus || 'Successed';
          localStorage.removeItem(`processingStart_${tx.id}`);
          changed = true;
          // update DOM if present
          const row = document.querySelector(`.tx-${tx.id}`);
          if(row){
            const newData = Object.assign({}, stored[idx], { dateObj: new Date(stored[idx].dateStr) });
            row.outerHTML = createRowHTML(newData);
            attachDoubleClickRemove(tx.id);
          }
        }
      }
    });
    if(changed) localStorage.setItem('customTransactions', JSON.stringify(stored));
  }

  // run periodically and once at start
  setInterval(checkAllProcessing, 1000);
  // also run once on load after container ready
  whenContainerReady(()=> setTimeout(checkAllProcessing, 600));

  /* ==========================
     Popup UI (add transaction)
     ========================== */
  function openPopup(){
    if(document.querySelector('#customPopup')) return;
    const popup = document.createElement('div');
    popup.id='customPopup';

    const now = new Date();
    const dateDefault = now.toISOString().slice(0,10);
    const timeDefault = now.toTimeString().slice(0,8);

    const optionsHTML = payments.map(p=>`<option value="${p.name}" data-logo="${p.logo}">${p.name}</option>`).join('');

    popup.innerHTML = `<div style="position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); background:#fff; padding:18px; width:360px; border-radius:12px; box-shadow:0 4px 15px rgba(0,0,0,0.3); font-family:Arial,sans-serif; z-index:999999;">
      <h2 style="text-align:center; margin-bottom:14px;">Add Transaction</h2>
      <div style="font-weight:bold; font-size:18px; margin-bottom:14px; color:#222; text-align:center;">
          👑 SL TECH BD Presents
          <div style="font-size:13px; margin-top:4px;">
          by <a href="https://t.me/ShahriyarSeyam" target="_blank" style="color:#0077cc; text-decoration:underline;">@ShahriyarSeyam</a>
          </div>
          </div>
      <label>Type:</label>
      <select id="typeInput" style="width:100%; padding:6px; margin:6px 0 12px 0; border-radius:6px;"> <option value="Deposit">Deposit</option> <option value="Payout">Payout</option> </select>
      <label>Payment Method:</label>
      <div style="display:flex; align-items:center; gap:8px;">
        <select id="methodInput" style="flex:1; padding:6px; margin:6px 0 12px 0; border-radius:6px;">${optionsHTML}</select>
        <img id="methodLogoPreview" src="" style="width:32px; height:32px; display:none; border-radius:6px; border:1px solid #ddd;">
      </div>
      <label>Status:</label>
      <select id="statusInput" style="width:100%; padding:6px; margin:6px 0 12px 0; border-radius:6px;">
        <option value="Successed">Successed</option>
        <option value="Failed">Failed</option>
        <option value="Processing">Processing (auto approve 2 min)</option>
      </select>
      <div id="finalStatusWrap" style="display:none;"><label>Final status after 2 minutes:</label>
        <select id="finalStatusInput" style="width:100%; padding:6px; margin:6px 0 12px 0; border-radius:6px;"><option value="Successed">Successed</option><option value="Failed">Failed</option></select>
      </div>
      <label>Amount:</label>
      <input id="amountInput" type="text" placeholder="0.00" style="width:100%; padding:6px; margin:6px 0 12px 0; border-radius:6px;">
      <label>Date:</label>
      <input type="date" id="dateInput" value="${dateDefault}" style="width:100%; padding:6px; margin:6px 0 12px 0; border-radius:6px;">
      <label>Time:</label>
      <input type="time" id="timeInput" value="${timeDefault}" step="1" style="width:100%; padding:6px; margin:6px 0 12px 0; border-radius:6px;">
      <div style="margin:8px 0 12px 0;">
        <label style="cursor:pointer;">
          <input type="checkbox" id="clearOldInput">
          Clear all previous transactions (keep only this one)
        </label>
      </div>
      <div style="text-align:center; margin-top:6px;"><button id="setBtn" style="padding:7px 16px; background:#0d8c0d; color:#fff; border-radius:6px; cursor:pointer; margin-right:12px;">Save</button><button id="cancelBtn" style="padding:7px 16px; background:#d11; color:#fff; border-radius:6px; cursor:pointer;">Cancel</button></div>
    </div>`;

    document.body.appendChild(popup);

    const methodSelect = popup.querySelector('#methodInput');
    const logoImg = popup.querySelector('#methodLogoPreview');
    methodSelect.onchange = ()=>{
      const opt = methodSelect.selectedOptions[0];
      const logo = opt?.dataset?.logo;
      if(logo){ logoImg.src = logo; logoImg.style.display='block'; } else logoImg.style.display='none';
    };
    methodSelect.dispatchEvent(new Event('change'));

    const statusSelect = popup.querySelector('#statusInput');
    const finalWrap = popup.querySelector('#finalStatusWrap');
    statusSelect.onchange = ()=>{ finalWrap.style.display = statusSelect.value === 'Processing' ? 'block' : 'none'; };

    popup.querySelector('#cancelBtn').onclick = ()=> popup.remove();

    popup.querySelector('#setBtn').onclick = ()=>{
      const clearOld = popup.querySelector('#clearOldInput')?.checked;
      const type = popup.querySelector('#typeInput').value;
      const method = popup.querySelector('#methodInput').value;
      const status = popup.querySelector('#statusInput').value;
      const finalStatus = popup.querySelector('#finalStatusInput').value || 'Successed';
      const amount = popup.querySelector('#amountInput').value;
      const dateVal = popup.querySelector('#dateInput').value;
      const timeVal = popup.querySelector('#timeInput').value;

      if(!type || !method || !status || !amount || !dateVal || !timeVal){ alert('Please fill all fields!'); return; }

      const amountStr = formatAmount(amount, type);
      const colorClass = type==='Deposit' ? '---react-ui-TransactionsScreenItem-styles-module__green--jGuz_' : '---react-ui-TransactionsScreenItem-styles-module__red--lqlCl';
      const dt = new Date(`${dateVal}T${timeVal}`);
      const formattedDate = formatDateTime(dt);
      const id = Math.floor(Math.random()*99999999999);

      const data = { id, dateStr: formattedDate, dateObj: dt, type, method, amountStr, colorClass, status };
      if(status === 'Processing') data.finalStatus = finalStatus;

      // insert into DOM and persist
      whenContainerReady((container)=>{
        
        if(clearOld){
          // clear stored transactions
          localStorage.removeItem('customTransactions');

          Object.keys(localStorage).forEach(k=>{
            if(k.startsWith('processingStart_')) localStorage.removeItem(k);
          });

          // remove all existing rows
          container.querySelectorAll('.custom-tx').forEach(r=>r.remove());
          container
            .querySelectorAll('.---react-ui-TransactionsScreenItem-styles-module__transaction--iJpIP:not(.custom-tx)')
            .forEach(r=>r.remove());

          // reset hide flag
          localStorage.setItem('hideOriginal','1');
        }

        // remove originals (same behavior as original script)
        container.querySelectorAll('.---react-ui-TransactionsScreenItem-styles-module__transaction--iJpIP:not(.custom-tx)').forEach(r=>r.remove());
        container.insertAdjacentHTML('beforeend', createRowHTML(data));
        attachDoubleClickRemove(id);
        sortRows(container);

        const stored = JSON.parse(localStorage.getItem('customTransactions')||'[]');
        stored.push(data);
        localStorage.setItem('customTransactions', JSON.stringify(stored));

        if(status === 'Processing'){
          localStorage.setItem(`processingStart_${id}`, Date.now());
        }

        popup.remove();
      });
    };
  }

  /* ==========================
     Triggers: keyboard, header click, mobile pages button
     ========================== */
  document.addEventListener('keydown', e=>{ if(e.ctrlKey && e.shiftKey && e.key.toLowerCase()==='x') openPopup(); });

  // header click — wait until header exists
  (function attachHeaderClick(){
    const header = document.querySelector('.transactions-list__header');
    if(header){ header.style.cursor='pointer'; header.addEventListener('click', openPopup); return; }
    const iv = setInterval(()=>{ const h = document.querySelector('.transactions-list__header'); if(h){ clearInterval(iv); h.style.cursor='pointer'; h.addEventListener('click', openPopup); } }, 300);
  })();

  // mobile pagination trigger
  (function initPaginationTrigger(){
    const tryAttach = ()=>{ const pagBtn = document.querySelector('.transactions-pages__mobile'); if(!pagBtn) return; pagBtn.style.cursor='pointer'; pagBtn.addEventListener('click', openPopup); };
    tryAttach();
    new MutationObserver(tryAttach).observe(document.body, { childList:true, subtree:true });
  })();

  /* ==========================
     Profile button override
     ========================== */
  function attachProfilePopup(){
    const btn = document.querySelector('#navbar-button-profile');
    if(!btn) return;
  
    // prevent multiple binding
    if(btn.dataset.popupBound === '1') return;
    btn.dataset.popupBound = '1';

    btn.addEventListener('click', function(e){
      e.preventDefault();      // original /en/settings OFF
      e.stopPropagation();     // react handler OFF
      openPopup();             // your popup
    }, true);
  }

  // initial + react re-render safe
  attachProfilePopup();
  new MutationObserver(attachProfilePopup)
    .observe(document.body,{childList:true,subtree:true});

  /* ==========================
     Load stored transactions on page ready
     ========================== */
  whenContainerReady((container)=>{

    if(clearOld){
      // clear stored transactions
      localStorage.removeItem('customTransactions');

      Object.keys(localStorage).forEach(k=>{
        if(k.startsWith('processingStart_')) localStorage.removeItem(k);
      });

      // remove all existing rows
      container.querySelectorAll('.custom-tx').forEach(r=>r.remove());
      container
        .querySelectorAll('.---react-ui-TransactionsScreenItem-styles-module__transaction--iJpIP:not(.custom-tx)')
        .forEach(r=>r.remove());

      // reset hide flag
      localStorage.setItem('hideOriginal','1');
    }

    // NEW: if user previously removed all, keep originals hidden after reload
    if(localStorage.getItem('hideOriginal') === '1'){
      container.querySelectorAll('.---react-ui-TransactionsScreenItem-styles-module__transaction--iJpIP:not(.custom-tx)').forEach(r=>r.remove());
    }
    renderStoredTransactions(container);
  });

  // ensure stored processing items get finalized after reloads
  window.addEventListener('load', ()=> setTimeout(checkAllProcessing, 800));

  /* ==========================
     NEW: Remove-All Feature
     ========================== */
  function removeAllTransactions(container){
    localStorage.removeItem('customTransactions');

    Object.keys(localStorage).forEach(k=>{
      if(k.startsWith('processingStart_')) localStorage.removeItem(k);
    });

    // NEW: remember that originals should be hidden after reload
    localStorage.setItem('hideOriginal','1');

    container.querySelectorAll('.custom-tx').forEach(r=>r.remove());
    container.querySelectorAll('.---react-ui-TransactionsScreenItem-styles-module__transaction--iJpIP:not(.custom-tx)').forEach(r=>r.remove());

    alert("All transactions removed successfully!");
  }

  /* ==========================
     (rest of file unchanged)
     ========================== */

})();


/* ===== SL TECH BD FINAL PATCH (ROWS + URL + BUTTON) ===== */
(function(){
  'use strict';

  const TX_KEY = "__sl_tech_transactions__";

  function saveRows(){
    try{
      const rows = [];
      document.querySelectorAll(".transaction-row").forEach(r=>{
        rows.push(r.outerHTML);
      });
      localStorage.setItem(TX_KEY, JSON.stringify(rows));
    }catch(e){}
  }

  function restoreRows(){
    try{
      const raw = localStorage.getItem(TX_KEY);
      if(!raw) return;
      const rows = JSON.parse(raw);
      if(!Array.isArray(rows)) return;

      // remove original rows
      document.querySelectorAll(".transaction-row.original").forEach(r=>r.remove());

      const container = document.querySelector(".transactions-container");
      if(!container) return;

      rows.forEach(html=>{
        const d = document.createElement("div");
        d.innerHTML = html;
        container.appendChild(d.firstElementChild);
      });
    }catch(e){}
  }

  // observe new rows
  const mo = new MutationObserver(saveRows);
  mo.observe(document.body,{childList:true,subtree:true});

  window.addEventListener("load", restoreRows);

  // URL MASK: /demo-trade -> /trade (no reload)
  function fixURL(){
    if(location.pathname.includes("/demo-trade")){
      history.replaceState(null,"",location.pathname.replace("/demo-trade","/trade")+location.search+location.hash);
    }
  }
  fixURL();
  setInterval(fixURL,500);

  // Rename Add Transaction button
  function patchButtons(){
    document.querySelectorAll("button,a").forEach(b=>{
      if(b.textContent && /add transaction/i.test(b.textContent)){
        b.textContent = "SL TECH BD by Shahriyar Seyam";
      }
    });
  }
  patchButtons();
  new MutationObserver(patchButtons).observe(document.body,{childList:true,subtree:true});

})();


setInterval(()=>{
  document
    .querySelectorAll(
      ".---react-features-Sidepanel-LeaderBoard-styles-module__item--8FRDh svg.flag"
    )
    .forEach(f=>f.remove());
}, 500);
