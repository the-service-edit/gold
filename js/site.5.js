// Gold Foil Books v2. Small, dependency-free behaviours.
(function () {
  "use strict";
  var money = function (n) { return "$" + n.toFixed(n % 1 ? 2 : 0); };

  // Option tiles: keep every visible price in step with the chosen variant.
  document.querySelectorAll("[data-buy]").forEach(function (form) {
    var prices = JSON.parse(form.getAttribute("data-prices"));
    var update = function () {
      var key = Array.prototype.map.call(form.querySelectorAll("fieldset"), function (fs) {
        var c = fs.querySelector("input:checked");
        return c ? c.value : "";
      }).join("|");
      var price = prices[key];
      if (price == null) return;
      document.querySelectorAll("[data-price]").forEach(function (el) { el.textContent = money(price); });
      var was = form.getAttribute("data-was");
      if (was) { was = JSON.parse(was)[key]; document.querySelectorAll("[data-was]:not([data-buy])").forEach(function (el) { el.textContent = money(was); }); }
      document.querySelectorAll("[data-afterpay]").forEach(function (el) { el.textContent = "A" + money(price / 4); });
      document.querySelectorAll("[data-when]").forEach(function (el) {
        el.hidden = key.indexOf(el.getAttribute("data-when")) !== 0;
      });
    };
    form.addEventListener("change", update);
    update();
  });

  // Gallery counter on phones: "2 of 7".
  var gal = document.querySelector("[data-gal]");
  var count = document.querySelector("[data-gal-count]");
  if (gal && count) {
    var slides = gal.querySelectorAll("figure");
    var tick = function () {
      var mid = gal.scrollLeft + gal.clientWidth / 2, best = 0, dist = Infinity;
      slides.forEach(function (s, i) {
        var d = Math.abs(s.offsetLeft + s.offsetWidth / 2 - mid);
        if (d < dist) { dist = d; best = i; }
      });
      count.textContent = (best + 1) + " of " + slides.length;
    };
    gal.addEventListener("scroll", tick, { passive: true });
    tick();
  }

  // The sticky bar steps aside while the in-page Add to cart button is on screen.
  var bar = document.querySelector(".bar");
  var inPage = document.querySelector(".buy .btn, .hero .btn, .bf-cta .btn");
  if (bar && inPage && "IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      bar.hidden = entries[0].isIntersecting;
    }, { threshold: 0.6 }).observe(inPage);
  }

  // Drawn, then bound: one range input wipes between the illustration and the finished cover.
  document.querySelectorAll(".cmp").forEach(function (c) {
    var r = c.querySelector("input");
    var set = function () { c.style.setProperty("--p", r.value + "%"); };
    r.addEventListener("input", set);
    set();
  });

  // The drawing video loops silently, unless the visitor has asked for less motion.
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll("video[data-loop]").forEach(function (v) {
    if (reduce) { v.removeAttribute("autoplay"); v.pause(); v.controls = true; }
  });

  // The Collection. Mouse: hovering a cover enlarges it where it sits and every cover opens its book.
  // Touch: the row scrolls sideways, one book per swipe, looping; the middle cover is the active one.
  document.querySelectorAll("[data-fan]").forEach(function (fan) {
    var row = fan.querySelector(".fan-row");
    var base = Array.prototype.slice.call(row.children);
    var n = base.length;
    var cap = { n: fan.querySelector("[data-fan-n]"), t: fan.querySelector("[data-fan-t]"), link: fan.querySelector("[data-fan-link]"), hint: fan.querySelector(".fan-hint") };
    var dots = Array.prototype.slice.call(fan.querySelectorAll(".fan-dots li"));
    var caption = function (li, k) {
      var a = li.querySelector("a");
      if (cap.t.textContent !== a.getAttribute("data-t")) {
        cap.n.textContent = a.getAttribute("data-n");
        cap.t.textContent = a.getAttribute("data-t");
        cap.link.setAttribute("href", a.getAttribute("href"));
      }
      dots.forEach(function (d, i) { d.classList.toggle("on", i === k); });
    };
    var canHover = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    if (canHover) {
      var sizes = [1, 0.86, 0.74, 0.68, 0.64];
      var activate = function (li) {
        var pa = +li.getAttribute("data-o");
        base.forEach(function (o) {
          var d = Math.abs(+o.getAttribute("data-o") - pa);
          o.style.setProperty("--s", sizes[d]);
          o.style.setProperty("--d", d);
        });
        caption(li, base.indexOf(li));
      };
      base.forEach(function (li) {
        li.addEventListener("mouseenter", function () { activate(li); });
        li.querySelector("a").addEventListener("focus", function () { activate(li); });
      });
      if (cap.hint) cap.hint.textContent = "Hover over a cover for a closer look, then click to open it.";
      return;
    }

    fan.classList.add("fan--scroll");
    var copy = function () {
      return base.map(function (li) {
        var c = li.cloneNode(true);
        c.setAttribute("aria-hidden", "true");
        c.querySelector("a").tabIndex = -1;
        return c;
      });
    };
    copy().forEach(function (c) { row.insertBefore(c, base[0]); });
    copy().forEach(function (c) { row.appendChild(c); });
    var all = Array.prototype.slice.call(row.children);
    var slot = 0, lefts = [], near = n;
    var measure = function () {
      slot = all[1].offsetLeft - all[0].offsetLeft;
      lefts = all.map(function (li) { return li.offsetLeft + slot / 2; });
    };
    var goTo = function (i, smooth) {
      var left = lefts[i] - row.clientWidth / 2;
      if (smooth && row.scrollTo) row.scrollTo({ left: left, behavior: "smooth" }); else row.scrollLeft = left;
    };
    var paint = function () {
      var c = row.scrollLeft + row.clientWidth / 2, best = Infinity, cw = slot / 0.56;
      all.forEach(function (li, i) {
        var d = (lefts[i] - c) / slot, ad = Math.abs(d), sign = d < 0 ? -1 : 1;
        var s = 1 - 0.16 * Math.min(ad, 1) - 0.14 * Math.min(Math.max(ad - 1, 0), 1) - 0.05 * Math.max(ad - 2, 0);
        var a = li.firstElementChild;
        a.style.setProperty("--s", Math.max(s, 0.55).toFixed(3));
        a.style.setProperty("--tx", (-sign * Math.max(ad - 1, 0) * 0.13 * cw).toFixed(1) + "px");
        a.style.opacity = ad < 2.4 ? 1 : Math.max(0, 1 - (ad - 2.4) / 0.5).toFixed(2);
        li.style.zIndex = 100 - Math.round(ad * 10);
        if (ad < best) { best = ad; near = i; }
      });
      caption(all[near], near % n);
    };
    var queued = false, idle;
    var settle = function () {                       // keep the row endless: hop back to the middle copy once it is at rest
      if (near < n) row.scrollLeft += n * slot; else if (near >= 2 * n) row.scrollLeft -= n * slot;
    };
    row.addEventListener("scroll", function () {
      if (!queued) { queued = true; requestAnimationFrame(function () { queued = false; paint(); }); }
      clearTimeout(idle); idle = setTimeout(settle, 160);
    }, { passive: true });
    row.addEventListener("click", function (e) {
      var a = e.target.closest ? e.target.closest("a") : null;
      if (!a) return;
      var i = all.indexOf(a.parentNode);
      if (i === near) return;                          // the middle cover opens its book
      e.preventDefault(); goTo(i, true);               // any other cover comes to the middle
    });
    base.forEach(function (li, k) {
      li.querySelector("a").addEventListener("focus", function () { goTo(n + k, false); });
    });
    var start = function () { measure(); goTo(n + (near % n), false); paint(); };
    start();
    window.addEventListener("resize", start);
    window.addEventListener("load", start);
    if (cap.hint) cap.hint.textContent = "Swipe to see all five books.";
  });

  // Sale countdown to a real end time. Says nothing once the sale is over.
  document.querySelectorAll("[data-countdown]").forEach(function (el) {
    var end = new Date(el.getAttribute("data-countdown")).getTime();
    var tick = function () {
      var ms = end - Date.now();
      if (ms <= 0) { el.textContent = "now ended"; return; }
      var d = Math.floor(ms / 864e5), h = Math.floor(ms % 864e5 / 36e5), m = Math.floor(ms % 36e5 / 6e4);
      el.textContent = d > 0 ? d + (d === 1 ? " day " : " days ") + h + (h === 1 ? " hr left" : " hrs left") : h > 0 ? h + (h === 1 ? " hr " : " hrs ") + m + " min left" : m + " min left";
    };
    tick(); setInterval(tick, 30000);
  });

  // Sign-up is not wired on the preview build. Say so instead of pretending.
  document.querySelectorAll("[data-signup]").forEach(function (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var note = f.querySelector(".note");
      if (note) note.textContent = "Sign-up is switched off on this preview. On the live site this joins the list.";
    });
  });
})();
