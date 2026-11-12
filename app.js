/* ==========================================================================
   Vijay267 — static build. Plain JS, no framework, no build step.
   Ports the React app's behavior: theme, scroll progress, live status
   (clock + Open-Meteo weather), particle network, chat widget, stats
   count-up, accordions, case-study filters, resume menu.
   ========================================================================== */
(function () {
  "use strict";

  var THEME_KEY = "vijay267-theme";
  var EMAIL = "yadavvijay267@gmail.com";
  var LINKEDIN = "https://www.linkedin.com/in/vijaykryadav";
  var RESUME = "downloads/vijay-kumar-yadav-resume.pdf";

  /* ------------------------------------------------ scroll to top on load */
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  try { window.scrollTo(0, 0); } catch (e) { /* no-op */ }

  /* ------------------------------------------------ hero greeting by time of day */
  function setGreeting(hour) {
    var el = document.getElementById("hero-greeting");
    if (!el) return;
    var h = (typeof hour === "number") ? hour : new Date().getHours();
    var g;
    if (h >= 5 && h < 12) g = "Good morning";
    else if (h >= 12 && h < 17) g = "Good afternoon";
    else if (h >= 17 && h < 21) g = "Good evening";
    else g = "Good night";
    el.textContent = g + ", I am";
  }
  setGreeting();

  /* ------------------------------------------------ weather theme (Open-Meteo code -> theme name) */
  function weatherThemeName(code) {
    if (code === 0 || code === 1) return "sunny";
    if (code === 2 || code === 3) return "cloudy";
    if (code === 45 || code === 48) return "foggy";
    if (code === 51 || code === 53 || code === 55 || code === 56 || code === 57 ||
        code === 61 || code === 63 || code === 65 || code === 66 || code === 67 ||
        code === 80 || code === 81 || code === 82) return "rainy";
    if (code === 71 || code === 73 || code === 75 || code === 77 || code === 85 || code === 86) return "snowy";
    if (code === 95 || code === 96 || code === 99) return "storm";
    return null;
  }
  function applyWeatherTheme(code) {
    var t = weatherThemeName(code);
    if (t) {
      document.documentElement.setAttribute("data-weather", t);
      try { localStorage.setItem("vijay267-weather", t); } catch (e) { /* storage unavailable */ }
    } else {
      document.documentElement.removeAttribute("data-weather");
      try { localStorage.removeItem("vijay267-weather"); } catch (e) { /* storage unavailable */ }
    }
  }

  /* ------------------------------------------------ theme toggle */
  var themeBtn = document.getElementById("theme-toggle");
  function currentTheme() {
    return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
  }
  function paintThemeButton(theme) {
    if (!themeBtn) return;
    var isDark = theme === "dark";
    themeBtn.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
    themeBtn.title = isDark ? "Light mode" : "Dark mode";
    themeBtn.innerHTML = isDark
      ? '<svg fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>'
      : '<svg fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>';
  }
  function applyTheme(t) {
    document.documentElement.dataset.theme = t;
    try { localStorage.setItem(THEME_KEY, t); } catch (e) { /* storage unavailable */ }
    paintThemeButton(t);
  }
  if (themeBtn) {
    paintThemeButton(currentTheme());
    themeBtn.addEventListener("click", function () {
      applyTheme(currentTheme() === "dark" ? "light" : "dark");
    });
  }

  /* ------------------------------------------------ sidebar minimise (desktop) */
  var SIDEBAR_KEY = "vijay267-sidebar";
  var sidebarBtn = document.getElementById("sidebar-toggle");
  function paintSidebarButton(collapsed) {
    if (!sidebarBtn) return;
    sidebarBtn.setAttribute("aria-label", collapsed ? "Expand sidebar" : "Minimise sidebar");
    sidebarBtn.title = collapsed ? "Expand sidebar" : "Minimise sidebar";
    sidebarBtn.innerHTML = collapsed
      ? '<svg fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" aria-hidden="true"><polyline points="13 17 18 12 13 7"/><polyline points="6 17 11 12 6 7"/></svg>'
      : '<svg fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" aria-hidden="true"><polyline points="11 17 6 12 11 7"/><polyline points="18 17 13 12 18 7"/></svg>';
  }
  function applySidebar(collapsed) {
    document.body.classList.toggle("sidebar-collapsed", collapsed);
    try { localStorage.setItem(SIDEBAR_KEY, collapsed ? "collapsed" : "expanded"); } catch (e) { /* storage unavailable */ }
    paintSidebarButton(collapsed);
  }
  if (sidebarBtn) {
    var savedSidebar = null;
    try { savedSidebar = localStorage.getItem(SIDEBAR_KEY); } catch (e) { /* storage unavailable */ }
    applySidebar(savedSidebar === "collapsed");
    sidebarBtn.addEventListener("click", function () {
      applySidebar(!document.body.classList.contains("sidebar-collapsed"));
    });
  }

  /* ------------------------------------------------ mobile sidebar drawer (phone) */
  var menuBtn = document.getElementById("menu-toggle");
  var backdrop = document.getElementById("sidebar-backdrop");
  function setDrawer(open) {
    document.body.classList.toggle("sidebar-open", open);
    if (menuBtn) menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }
  if (menuBtn) {
    menuBtn.addEventListener("click", function () {
      setDrawer(!document.body.classList.contains("sidebar-open"));
    });
  }
  if (backdrop) {
    backdrop.addEventListener("click", function () { setDrawer(false); });
  }
  // close the drawer when a nav link inside it is tapped
  var drawerLinks = document.querySelectorAll(".site-header .page-nav a");
  for (var i = 0; i < drawerLinks.length; i++) {
    drawerLinks[i].addEventListener("click", function () { setDrawer(false); });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setDrawer(false);
  });

  /* ------------------------------------------------ app update icon (Android app only) */
  // The update icon sits next to the theme toggle. It is only shown when
  // the site runs inside the Bio Android app (which injects window.BioApp).
  var appUpdateBtn = document.getElementById("app-update-btn");
  if (appUpdateBtn && typeof window.BioApp !== "undefined" && window.BioApp && window.BioApp.checkForUpdate) {
    appUpdateBtn.hidden = false;
    appUpdateBtn.addEventListener("click", function () {
      try { window.BioApp.checkForUpdate(); } catch (e) { /* no-op */ }
    });
  }

  /* ------------------------------------------------ scroll progress */
  var progressBar = document.querySelector("#scroll-progress > div");
  if (progressBar) {
    var updateProgress = function () {
      var el = document.documentElement;
      var max = el.scrollHeight - el.clientHeight;
      var p = max > 0 ? Math.min(1, el.scrollTop / max) : 0;
      progressBar.style.width = (p * 100) + "%";
    };
    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
  }

  /* ------------------------------------------------ resume dropdown menu */
  var resumeMenu = document.querySelector(".resume-menu");
  if (resumeMenu) {
    var resumeBtn = resumeMenu.querySelector(".pill");
    var resumeChev = resumeMenu.querySelector(".pill .chev");
    var resumeMenuEl = resumeMenu.querySelector(".menu");
    var lastPointer = "";
    var isCollapsed = function () { return document.body.classList.contains("sidebar-collapsed"); };
    var setOpen = function (open) {
      if (open && isCollapsed() && resumeMenuEl && resumeBtn) {
        var r = resumeBtn.getBoundingClientRect();
        resumeMenuEl.style.top = r.top + "px";
      } else if (resumeMenuEl) {
        resumeMenuEl.style.top = "";
      }
      resumeMenu.classList.toggle("open", open);
      if (resumeBtn) resumeBtn.setAttribute("aria-expanded", open ? "true" : "false");
      if (resumeChev) resumeChev.classList.toggle("open", open);
    };
    resumeMenu.addEventListener("pointerenter", function (e) {
      if (e.pointerType === "mouse" && !isCollapsed()) setOpen(true);
    });
    resumeMenu.addEventListener("pointerleave", function (e) {
      if (e.pointerType === "mouse" && !isCollapsed()) setOpen(false);
    });
    resumeMenu.addEventListener("pointerdown", function (e) { lastPointer = e.pointerType; });
    if (resumeBtn) {
      resumeBtn.addEventListener("click", function (e) {
        if (isCollapsed() || e.detail === 0 || lastPointer !== "mouse") {
          setOpen(!resumeMenu.classList.contains("open"));
        }
      });
    }
    document.addEventListener("pointerdown", function (e) {
      if (!resumeMenu.contains(e.target)) setOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });
    resumeMenu.querySelectorAll(".menu-inner a").forEach(function (a) {
      a.addEventListener("click", function () { setOpen(false); });
    });
  }

  /* ------------------------------------------------ live status: clock + weather */
  var liveRoot = document.getElementById("live-status");
  if (liveRoot) {
    var clockEl = document.getElementById("live-clock");
    var dateEl = document.getElementById("live-date");
    var weatherEl = document.getElementById("live-weather");

    var place = { name: "Noida", admin1: "Uttar Pradesh", country: "India", latitude: 28.5355, longitude: 77.391 };
    var manualPick = false;

    function weatherInfo(code) {
      if (code === 0) return { label: "Clear sky", icon: "☀️" };
      if (code === 1) return { label: "Mainly clear", icon: "🌤️" };
      if (code === 2) return { label: "Partly cloudy", icon: "⛅" };
      if (code === 3) return { label: "Overcast", icon: "☁️" };
      if (code === 45 || code === 48) return { label: "Foggy", icon: "🌫️" };
      if (code === 51 || code === 53 || code === 55) return { label: "Drizzle", icon: "🌦️" };
      if (code === 56 || code === 57 || code === 66 || code === 67) return { label: "Freezing rain", icon: "🌧️" };
      if (code === 61 || code === 63 || code === 65) return { label: "Rain", icon: "🌧️" };
      if (code === 71 || code === 73 || code === 75 || code === 77) return { label: "Snow", icon: "❄️" };
      if (code === 80 || code === 81 || code === 82) return { label: "Rain showers", icon: "🌦️" };
      if (code === 85 || code === 86) return { label: "Snow showers", icon: "🌨️" };
      if (code === 95 || code === 96 || code === 99) return { label: "Thunderstorm", icon: "⛈️" };
      return { label: "—", icon: "🌡️" };
    }

    function renderWeather(w) {
      if (!weatherEl) return;
      if (w === null) {
        weatherEl.innerHTML = '<span class="muted">Weather unavailable right now</span>';
        document.documentElement.removeAttribute("data-weather");
        return;
      }
      applyWeatherTheme(w.code);
      var info = weatherInfo(w.code);
      var placeStr = place.name +
        (place.admin1 ? ", " + place.admin1 : "") +
        (place.country ? ", " + place.country : "");
      var sunStr = "";
      if (w.sunrise && w.sunset) {
        sunStr = ' · <span class="muted">🌅 ' + fmtSunTime(w.sunrise) + ' · 🌇 ' + fmtSunTime(w.sunset) + '</span>';
        updateSun(w.sunrise, w.sunset);
      }
      weatherEl.innerHTML =
        info.icon + ' <span class="temp">' + Math.round(w.temp) + '°C</span> · ' + info.label +
        ' · <span class="muted">' + placeStr + ' · Humidity ' + w.humidity + '% · Wind ' +
        Math.round(w.wind) + ' km/h</span>' + sunStr;
    }

    /* ------------------------------------------------ sun & moon arc (time-based) */
    var sunTimes = null; // { sunrise: Date, sunset: Date }
    function fmtSunTime(iso) {
      var d = new Date(iso);
      if (isNaN(d.getTime())) return iso;
      return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
    }
    function ensureSunTimes() {
      if (sunTimes) return;
      // Fallback until the weather fetch returns: 6 AM sunrise, 6 PM sunset.
      var today = new Date();
      sunTimes = {
        sunrise: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 6, 0, 0),
        sunset: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 18, 0, 0)
      };
    }
    function sunSky(now, sr, ss) {
      var dawnEnd = new Date(sr.getTime() + 30 * 60 * 1000);
      var goldenStart = new Date(ss.getTime() - 60 * 60 * 1000);
      var duskEnd = new Date(ss.getTime() + 30 * 60 * 1000);
      if (now >= sr && now < dawnEnd) return "dawn";
      if (now >= dawnEnd && now < goldenStart) return "day";
      if (now >= goldenStart && now < ss) return "golden";
      if (now >= ss && now < duskEnd) return "dusk";
      return "night";
    }
    function updateSun(sunriseIso, sunsetIso) {
      if (sunriseIso && sunsetIso) {
        sunTimes = { sunrise: new Date(sunriseIso), sunset: new Date(sunsetIso) };
      }
      ensureSunTimes();
      var now = new Date();
      var sr = sunTimes.sunrise, ss = sunTimes.sunset;
      // Sky + greeting follow the real time.
      var hero = document.getElementById("hero");
      if (hero) hero.setAttribute("data-sky", sunSky(now, sr, ss));
      setGreeting(now.getHours());
    }
    updateSun(null, null);
    setInterval(function () { updateSun(null, null); }, 60000);

    function loadWeather() {
      if (!weatherEl) return;
      weatherEl.innerHTML = '<span class="muted">Loading weather…</span>';
      fetch("https://api.open-meteo.com/v1/forecast?latitude=" + place.latitude +
        "&longitude=" + place.longitude +
        "&current=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m&daily=sunrise,sunset&timezone=auto")
        .then(function (r) { if (!r.ok) throw new Error("weather fetch failed"); return r.json(); })
        .then(function (d) {
          renderWeather({
            temp: d.current.temperature_2m,
            code: d.current.weather_code,
            humidity: d.current.relative_humidity_2m,
            wind: d.current.wind_speed_10m,
            sunrise: d.daily && d.daily.sunrise && d.daily.sunrise[0],
            sunset: d.daily && d.daily.sunset && d.daily.sunset[0]
          });
        })
        .catch(function () { renderWeather(null); });
    }

    function tickClock() {
      var now = new Date();
      if (clockEl) {
        clockEl.textContent = now.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      }
      if (dateEl) {
        dateEl.textContent = now.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short", year: "numeric" });
      }
    }
    tickClock();
    setInterval(tickClock, 1000);
    loadWeather();

    function applyCoords(lat, lng) {
      fetch("https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=" + lat +
        "&longitude=" + lng + "&localityLanguage=en")
        .then(function (r) { return r.json(); })
        .then(function (d) {
          if (manualPick) return;
          place = {
            name: d.city || d.locality || "Your location",
            admin1: d.principalSubdivision || undefined,
            country: d.countryName || undefined,
            latitude: lat, longitude: lng
          };
          loadWeather();
        })
        .catch(function () { /* keep the fallback name; weather still loads */ });
      if (manualPick) return;
      place = { name: place.name, admin1: place.admin1, country: place.country, latitude: lat, longitude: lng };
      loadWeather();
    }

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        function (pos) {
          if (manualPick) return;
          applyCoords(pos.coords.latitude, pos.coords.longitude);
        },
        function () {},
        { timeout: 10000, maximumAge: 600000 }
      );
    }
  }

  /* ------------------------------------------------ weather theme on pages without the live strip */
  (function weatherThemeInit() {
    if (document.getElementById("live-status")) return; // index.html: the strip sets it
    function fetchTheme(lat, lng) {
      fetch("https://api.open-meteo.com/v1/forecast?latitude=" + lat +
        "&longitude=" + lng + "&current=weather_code&timezone=auto")
        .then(function (r) { if (!r.ok) throw new Error("weather fetch failed"); return r.json(); })
        .then(function (d) { applyWeatherTheme(d.current.weather_code); })
        .catch(function () { /* leave the default theme */ });
    }
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        function (pos) { fetchTheme(pos.coords.latitude, pos.coords.longitude); },
        function () { fetchTheme(28.5355, 77.391); },
        { timeout: 10000, maximumAge: 600000 }
      );
    } else {
      fetchTheme(28.5355, 77.391);
    }
  })();

  /* ------------------------------------------------ particle network background */
  var canvas = document.getElementById("bg-canvas");
  if (canvas) {
    var ctx = canvas.getContext("2d");
    if (ctx) {
      var LINE_RGB_DARK = "6,182,212";
      var LINE_RGB_LIGHT = "14,116,144";
      var points = [];
      var target = { x: -9999, y: -9999 };
      var raf = 0;
      var running = true;
      var visible = true;
      var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      function easeInOutCirc(t) {
        return t < 0.5
          ? (1 - Math.sqrt(1 - Math.pow(2 * t, 2))) / 2
          : (Math.sqrt(1 - Math.pow(-2 * t + 2, 2)) + 1) / 2;
      }
      function dist2(a, b) { return (a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y); }

      function build() {
        var w = canvas.clientWidth;
        var h = canvas.clientHeight;
        if (!w || !h) return;
        canvas.width = w;
        canvas.height = h;
        var spacing = 60;
        points = [];
        var x, y;
        for (x = 0; x < w; x += spacing) {
          for (y = 0; y < h; y += spacing) {
            var px = x + Math.random() * spacing;
            var py = y + Math.random() * spacing;
            points.push({
              x: px, y: py, originX: px, originY: py, closest: [],
              radius: 2 + Math.random() * 2, circleActive: 0, active: 0,
              fromX: px, fromY: py, toX: px, toY: py,
              start: performance.now(), dur: 1000 + Math.random() * 1000
            });
          }
        }
        // 5 closest neighbours for each point
        for (var i = 0; i < points.length; i++) {
          var p1 = points[i];
          var closest = [];
          for (var j = 0; j < points.length; j++) {
            var p2 = points[j];
            if (p1 === p2) continue;
            if (closest.length < 5) { closest.push(p2); continue; }
            var far = 0;
            for (var k = 1; k < 5; k++) {
              if (dist2(p1, closest[k]) > dist2(p1, closest[far])) far = k;
            }
            if (dist2(p1, p2) < dist2(p1, closest[far])) closest[far] = p2;
          }
          p1.closest = closest;
        }
      }

      function draw(now) {
        var w = canvas.width;
        var h = canvas.height;
        var lineRgb = document.documentElement.dataset.theme === "dark" ? LINE_RGB_DARK : LINE_RGB_LIGHT;
        ctx.clearRect(0, 0, w, h);
        for (var i = 0; i < points.length; i++) {
          var p = points[i];
          if (reduced) {
            p.active = 0.06;
            p.circleActive = 0.12;
          } else {
            var t = Math.min(1, (now - p.start) / p.dur);
            var e = easeInOutCirc(t);
            p.x = p.fromX + (p.toX - p.fromX) * e;
            p.y = p.fromY + (p.toY - p.fromY) * e;
            if (t >= 1) {
              p.fromX = p.x; p.fromY = p.y;
              p.toX = p.originX - 50 + Math.random() * 100;
              p.toY = p.originY - 50 + Math.random() * 100;
              p.start = now;
              p.dur = 1000 + Math.random() * 1000;
            }
            var d = dist2(target, p);
            if (d < 4000) { p.active = 0.3; p.circleActive = 0.6; }
            else if (d < 20000) { p.active = 0.1; p.circleActive = 0.3; }
            else if (d < 40000) { p.active = 0.02; p.circleActive = 0.1; }
            else { p.active = 0; p.circleActive = 0; }
          }
          if (p.active) {
            for (var c = 0; c < p.closest.length; c++) {
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p.closest[c].x, p.closest[c].y);
              ctx.strokeStyle = "rgba(" + lineRgb + "," + p.active + ")";
              ctx.stroke();
            }
          }
          if (p.circleActive) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI);
            ctx.fillStyle = "rgba(" + lineRgb + "," + p.circleActive + ")";
            ctx.fill();
          }
        }
        drawWx(now);
      }

      /* ---------- weather live wallpaper (rain / snow / sun / storm / clouds / fog / stars) */
      var wx = [];
      var wxKind = "";
      var flashUntil = 0;
      var nextFlash = 0;
      function wxColor() {
        var w = document.documentElement.dataset.weather || "";
        var dark = document.documentElement.dataset.theme === "dark";
        if (w === "rainy" || w === "storm") return "147,197,253";
        if (w === "snowy") return "255,255,255";
        if (w === "sunny") return dark ? "255,255,255" : "251,191,36";
        if (w === "cloudy") return "148,163,184";
        if (w === "foggy") return "203,213,225";
        return lineRgb;
      }
      function buildWx() {
        var w = document.documentElement.dataset.weather || "";
        var dark = document.documentElement.dataset.theme === "dark";
        var kind = w + (dark ? "-dark" : "-light");
        if (kind === wxKind) return;
        wxKind = kind;
        wx = [];
        var cw = canvas.width, ch = canvas.height;
        if (!cw || !ch) return;
        var i;
        if (w === "rainy" || w === "storm") {
          for (i = 0; i < 70; i++) wx.push({ x: Math.random() * cw, y: Math.random() * ch, len: 10 + Math.random() * 12, sp: 9 + Math.random() * 8 });
        } else if (w === "snowy") {
          for (i = 0; i < 55; i++) wx.push({ x: Math.random() * cw, y: Math.random() * ch, r: 1.5 + Math.random() * 2, sp: 0.5 + Math.random() * 1, ph: Math.random() * 6.28 });
        } else if (w === "sunny") {
          if (dark) {
            for (i = 0; i < 45; i++) wx.push({ x: Math.random() * cw, y: Math.random() * ch, r: 0.8 + Math.random() * 1.4, ph: Math.random() * 6.28, sp: 0 });
          } else {
            for (i = 0; i < 28; i++) wx.push({ x: Math.random() * cw, y: Math.random() * ch, r: 2 + Math.random() * 2.5, sp: 0.3 + Math.random() * 0.5 });
          }
        } else if (w === "cloudy") {
          for (i = 0; i < 16; i++) wx.push({ x: Math.random() * cw, y: Math.random() * ch, r: 40 + Math.random() * 60, sp: 0.15 + Math.random() * 0.35 });
        } else if (w === "foggy") {
          for (i = 0; i < 12; i++) wx.push({ x: Math.random() * cw, y: Math.random() * ch, r: 80 + Math.random() * 80, sp: 0.08 + Math.random() * 0.2 });
        }
      }
      function drawWx(now) {
        var w = document.documentElement.dataset.weather || "";
        if (!w || reduced) return;
        buildWx();
        var cw = canvas.width, ch = canvas.height;
        var dark = document.documentElement.dataset.theme === "dark";
        var rgb = wxColor();
        var i, p;
        if (w === "rainy" || w === "storm") {
          ctx.strokeStyle = "rgba(" + rgb + ",0.45)";
          ctx.lineWidth = 1;
          for (i = 0; i < wx.length; i++) {
            p = wx[i];
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x - 2, p.y + p.len);
            ctx.stroke();
            p.y += p.sp; p.x -= 0.6;
            if (p.y > ch) { p.y = -p.len; p.x = Math.random() * (cw + 40); }
          }
          if (w === "storm") {
            if (now > nextFlash) { flashUntil = now + 120; nextFlash = now + 4000 + Math.random() * 5000; }
            if (now < flashUntil) { ctx.fillStyle = "rgba(255,255,255,0.12)"; ctx.fillRect(0, 0, cw, ch); }
          }
        } else if (w === "snowy") {
          ctx.fillStyle = "rgba(" + rgb + ",0.85)";
          for (i = 0; i < wx.length; i++) {
            p = wx[i];
            ctx.beginPath();
            ctx.arc(p.x + Math.sin(now / 900 + p.ph) * 12, p.y, p.r, 0, 2 * Math.PI);
            ctx.fill();
            p.y += p.sp;
            if (p.y > ch + 4) { p.y = -4; p.x = Math.random() * cw; }
          }
        } else if (w === "sunny") {
          if (dark) {
            for (i = 0; i < wx.length; i++) {
              p = wx[i];
              var a = 0.35 + 0.35 * Math.abs(Math.sin(now / 700 + p.ph));
              ctx.fillStyle = "rgba(255,255,255," + a.toFixed(2) + ")";
              ctx.beginPath();
              ctx.arc(p.x, p.y, p.r, 0, 2 * Math.PI);
              ctx.fill();
            }
          } else {
            ctx.fillStyle = "rgba(" + rgb + ",0.55)";
            for (i = 0; i < wx.length; i++) {
              p = wx[i];
              ctx.beginPath();
              ctx.arc(p.x, p.y, p.r, 0, 2 * Math.PI);
              ctx.fill();
              p.y -= p.sp;
              if (p.y < -6) { p.y = ch + 6; p.x = Math.random() * cw; }
            }
          }
        } else if (w === "cloudy" || w === "foggy") {
          var alpha = w === "cloudy" ? 0.07 : 0.05;
          ctx.fillStyle = "rgba(" + rgb + "," + alpha + ")";
          for (i = 0; i < wx.length; i++) {
            p = wx[i];
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, 2 * Math.PI);
            ctx.fill();
            p.x += p.sp;
            if (p.x - p.r > cw) { p.x = -p.r; p.y = Math.random() * ch; }
          }
        }
      }

      function loop(now) {
        if (!running) return;
        if (visible && !reduced) draw(now);
        raf = requestAnimationFrame(loop);
      }
      function onMouse(e) {
        var r = canvas.getBoundingClientRect();
        target = { x: e.clientX - r.left, y: e.clientY - r.top };
      }
      function onResize() { wxKind = ""; build(); }

      build();
      if (reduced) { draw(performance.now()); }
      else { raf = requestAnimationFrame(loop); }
      if (!("ontouchstart" in window)) window.addEventListener("mousemove", onMouse);
      var ro = new ResizeObserver(onResize);
      ro.observe(canvas);
      var io = new IntersectionObserver(function (entries) { visible = entries[0].isIntersecting; });
      io.observe(canvas);
      window.addEventListener("beforeunload", function () {
        running = false;
        cancelAnimationFrame(raf);
        window.removeEventListener("mousemove", onMouse);
        ro.disconnect();
        io.disconnect();
      });
    }
  }

  /* ------------------------------------------------ stats count-up */
  var counters = document.querySelectorAll("[data-count]");
  counters.forEach(function (el) {
    var value = parseInt(el.getAttribute("data-count"), 10) || 0;
    var suffix = el.getAttribute("data-suffix") || "";
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = value + suffix;
      return;
    }
    var started = false;
    var io = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting && !started) {
        started = true;
        var t0 = performance.now();
        var dur = 1200;
        var tick = function (t) {
          var k = Math.min(1, (t - t0) / dur);
          el.textContent = Math.round(value * (1 - Math.pow(1 - k, 3))) + suffix;
          if (k < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        io.disconnect();
      }
    }, { threshold: 0.4 });
    io.observe(el);
  });

  /* ------------------------------------------------ experience timeline accordion */
  var timelineItems = document.querySelectorAll(".timeline-item");
  timelineItems.forEach(function (item) {
    var head = item.querySelector(".timeline-head");
    var body = item.querySelector(".collapse");
    if (!head || !body) return;
    head.addEventListener("click", function () {
      var isOpen = item.classList.contains("open");
      timelineItems.forEach(function (other) {
        other.classList.remove("open");
        var o = other.querySelector(".collapse");
        if (o) o.classList.remove("open");
        var h = other.querySelector(".timeline-head");
        if (h) h.setAttribute("aria-expanded", "false");
      });
      if (!isOpen) {
        item.classList.add("open");
        body.classList.add("open");
        head.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* ------------------------------------------------ skills accordion (one open at a time) */
  var skillCards = document.querySelectorAll(".skill-card");
  skillCards.forEach(function (card) {
    var head = card.querySelector(".skill-head");
    var body = card.querySelector(".collapse");
    if (!head || !body) return;
    head.addEventListener("click", function () {
      var isOpen = card.classList.contains("open");
      skillCards.forEach(function (other) {
        other.classList.remove("open");
        var o = other.querySelector(".collapse");
        if (o) o.classList.remove("open");
        var h = other.querySelector(".skill-head");
        if (h) h.setAttribute("aria-expanded", "false");
      });
      if (!isOpen) {
        card.classList.add("open");
        body.classList.add("open");
        head.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* ------------------------------------------------ case study filters */
  var filterBtns = document.querySelectorAll(".filter-btn");
  var caseCards = document.querySelectorAll(".case-card");
  if (filterBtns.length && caseCards.length) {
    filterBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var f = btn.getAttribute("data-filter");
        filterBtns.forEach(function (b) { b.classList.toggle("active", b === btn); });
        caseCards.forEach(function (card) {
          var tag = card.getAttribute("data-tag");
          card.style.display = (f === "All" || tag === f) ? "" : "none";
        });
      });
    });
  }

  /* ------------------------------------------------ flip chips: tap toggles on touch (one at a time) */
  document.querySelectorAll(".flip-chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      var wasFlipped = chip.classList.contains("flipped");
      document.querySelectorAll(".flip-chip.flipped").forEach(function (other) {
        other.classList.remove("flipped");
      });
      if (!wasFlipped) chip.classList.add("flipped");
    });
  });

  /* ------------------------------------------------ chat widget */
  var chatRoot = document.getElementById("chat-widget");
  if (chatRoot) {
    var fab = document.getElementById("chat-fab");
    var panel = document.getElementById("chat-panel");
    var log = document.getElementById("chat-log");
    var form = document.getElementById("chat-form");
    var input = document.getElementById("chat-input");
    var closeBtn = document.getElementById("chat-close");
    var typing = false;

    /* AI fallback: ask Gemini through this site's own worker proxy
       (server-side key — no key needed from the visitor). The prompt
       carries Vijay's real facts so the AI answers about him accurately
       and never invents jobs, numbers or contact details. */
    var AI_PROXY_URL = "/api/gemini";
    var AI_MODEL = "gemini-3.5-flash-lite";
    var AI_CONTEXT =
      "You are Vijay Kumar Yadav's personal AI assistant on his portfolio website. " +
      "Answer any question the visitor asks, using your own knowledge freely. " +
      "When the question is about Vijay, use the facts below. " +
      "For Vijay's professional details, use only the facts below and never invent jobs, numbers or contact details; if the facts don't cover it, say you don't know and suggest emailing him at yadavvijay267@gmail.com. " +
      "You do not have live or real-time information — for today's prices, rates, news or weather, say honestly that you don't have live data. " +
      "Keep answers short and natural (2-3 sentences). " +
      "Reply in the same language as the visitor's question: if they write in Hindi or Hinglish (Roman Hindi), reply in Hindi/Hinglish; if they write in English, reply in English. " +
      "If the question is vague, ask one short clarifying question instead of just saying you don't know.\n\n" +
      "Facts about Vijay:\n" +
      "- QC Engineer (Quality Control) at AMSYS IT Service Pvt Ltd, Noida, since Apr 2026, working on quality control in planning and design of the AT&T F2 Fiber project.\n" +
      "- Nearly 5 years in fiber and telecom design, all at AMSYS: Fiber Design Engineer (Dec 2023-Apr 2026), Telecom Design Engineer (Oct 2021-Dec 2023).\n" +
      "- Education: B.Tech in Electrical & Electronics Engineering from KIET; Intermediate and High School in Uttar Pradesh.\n" +
      "- Skills: ARAMIS-DT, GIS, FTTH planning (underground and overhead), Google Maps, Bing Maps.\n" +
      "- Case studies: AT&T F2 Fiber QC, ARAMIS & Fielding packages, FTTH network design.\n" +
      "- 350+ projects completed, 100+ quality checks completed.\n" +
      "- Languages: Hindi and English (he communicates in Hindi/Hinglish as well as English).\n" +
      "- Based in Noida, India. Email: yadavvijay267@gmail.com. LinkedIn: https://www.linkedin.com/in/vijaykryadav. Resume: downloadable as PDF or Word from the site's Resume menu.";

    function askAI(question) {
      return fetch(AI_PROXY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: AI_CONTEXT + "\n\nVisitor's question: " + question + "\n\nAnswer:",
          model: AI_MODEL
        })
      }).then(function (res) {
        return res.json().catch(function () { return null; }).then(function (data) {
          if (!res.ok || !data || !data.text || !data.text.trim()) throw new Error("ai-failed");
          return data.text.trim();
        });
      });
    }

    function scrollLog() {
      if (!log) return;
      if (typeof log.scrollTo === "function") log.scrollTo({ top: log.scrollHeight });
      else log.scrollTop = log.scrollHeight;
    }
    function addMsg(from, text) {
      var wrap = document.createElement("div");
      wrap.className = "chat-msg " + from;
      var p = document.createElement("p");
      p.textContent = text;
      wrap.appendChild(p);
      log.appendChild(wrap);
      scrollLog();
    }
    function send(text) {
      var trimmed = text.trim();
      if (!trimmed || typing) return;
      addMsg("user", trimmed);
      if (input) input.value = "";
      typing = true;
      var tp = document.createElement("div");
      tp.className = "chat-msg bot";
      tp.id = "chat-typing";
      var tpp = document.createElement("p");
      tpp.textContent = "typing…";
      tp.appendChild(tpp);
      log.appendChild(tp);
      scrollLog();
      /* Every reply comes from Gemini; on any failure fall back to email. */
      askAI(trimmed).then(function (answer) {
        var t = document.getElementById("chat-typing");
        if (t) t.remove();
        addMsg("bot", answer);
        typing = false;
      }).catch(function () {
        var t = document.getElementById("chat-typing");
        if (t) t.remove();
        addMsg("bot", "I don't have an answer for that yet. Please email Vijay directly at " + EMAIL + " — he'll get back to you.");
        typing = false;
      });
    }

    function setOpen(open) {
      if (panel) panel.hidden = !open;
      if (fab) {
        fab.setAttribute("aria-label", open ? "Close chat" : "Open chat");
        fab.innerHTML = open
          ? "×"
          : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>';
      }
      if (open) scrollLog();
    }
    if (fab) fab.addEventListener("click", function () { setOpen(panel.hidden); });
    if (closeBtn) closeBtn.addEventListener("click", function () { setOpen(false); });
    if (form && input) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        send(input.value);
      });
    }
  }
})();
