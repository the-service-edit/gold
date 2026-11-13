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
  var inPage = document.querySelector(".buy .btn, .hero .btn");
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

  // Single books: tapping a side cover brings it to the middle; the middle cover and the button open that book.
  document.querySelectorAll("[data-fan]").forEach(function (fan) {
    var items = Array.prototype.slice.call(fan.querySelectorAll(".fan-row li"));
    var n = items.length, half = Math.floor(n / 2);
    var cap = { n: fan.querySelector("[data-fan-n]"), t: fan.querySelector("[data-fan-t]"), link: fan.querySelector("[data-fan-link]") };
    items.forEach(function (li, i) {
      var a = li.querySelector("a");
      a.addEventListener("click", function (e) {
        if (li.getAttribute("data-o") === "0") return;
        e.preventDefault();
        items.forEach(function (other, k) {
          other.setAttribute("data-o", String(((k - i + half + n) % n) - half));
        });
        cap.n.textContent = a.getAttribute("data-n");
        cap.t.textContent = a.getAttribute("data-t");
        cap.link.setAttribute("href", a.getAttribute("href"));
      });
    });
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
