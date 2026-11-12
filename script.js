/* アイスカフェラテ びっくりサイズ LP — interactions */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var rand = function (a, b) { return a + Math.random() * (b - a); };

  /* ---------- 浮かぶ泡・氷の装飾 ---------- */
  function addBubbles(host, count) {
    if (!host || reduce) return;
    for (var i = 0; i < count; i++) {
      var b = document.createElement('span');
      var s = rand(8, 46);
      b.className = 'bubble';
      b.style.cssText = 'left:' + rand(0, 96) + '%;width:' + s + 'px;height:' + s + 'px;' +
        'animation-duration:' + rand(9, 22) + 's;animation-delay:-' + rand(0, 22) + 's;' +
        '--dx:' + rand(-60, 60) + 'px;--o:' + rand(0.25, 0.7).toFixed(2);
      host.appendChild(b);
    }
  }
  function addIce(host, count) {
    if (!host || reduce) return;
    for (var i = 0; i < count; i++) {
      var c = document.createElement('span');
      var s = rand(34, 92);
      c.className = 'ice';
      c.style.cssText = 'left:' + rand(2, 90) + '%;top:' + rand(6, 86) + '%;width:' + s + 'px;height:' + s + 'px;' +
        'opacity:' + rand(0.35, 0.8).toFixed(2) + ';animation-duration:' + rand(4, 9) + 's;animation-delay:-' + rand(0, 6) + 's;' +
        '--ix:' + rand(-22, 22) + 'px;--iy:' + rand(-40, -10) + 'px;--r0:' + rand(-20, 10) + 'deg;--r1:' + rand(6, 30) + 'deg';
      host.appendChild(c);
    }
  }
  var small = window.innerWidth < 800;
  addBubbles(document.getElementById('heroDeco'), small ? 12 : 22);
  addBubbles(document.getElementById('ctaDeco'), small ? 10 : 18);
  addIce(document.getElementById('tasteIce'), small ? 6 : 10);

  /* ---------- スクロールでふわっと出現 ---------- */
  var reveals = [].slice.call(document.querySelectorAll('.reveal'));
  // 兄弟要素は少しずつ遅らせて順番に
  reveals.forEach(function (el) {
    var sibs = [].filter.call(el.parentNode.children, function (c) { return c.classList.contains('reveal'); });
    var i = sibs.indexOf(el);
    if (i > 0) el.style.setProperty('--d', Math.min(i * 0.09, 0.45) + 's');
  });
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          io.unobserve(e.target);
          // ホバー演出の遅延と干渉しないよう、登場後にディレイを外す
          setTimeout(function () { e.target.style.removeProperty('--d'); }, 1500);
        }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- パララックス + 進捗バー ---------- */
  var pItems = [].slice.call(document.querySelectorAll('[data-parallax]'));
  var bar = document.getElementById('progressBar');
  var heroFrame = document.querySelector('.hero__visual');
  var ticking = false;
  function onScroll() {
    ticking = false;
    var vh = window.innerHeight;
    var y = window.scrollY || window.pageYOffset;
    var max = document.documentElement.scrollHeight - vh;
    if (bar) bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(y / max, 1) : 0) + ')';
    if (reduce) return;
    pItems.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      var center = r.top + r.height / 2 - vh / 2;
      el.style.transform = 'translate3d(0,' + (-center * parseFloat(el.dataset.parallax)).toFixed(1) + 'px,0)';
    });
    if (heroFrame && y < vh) heroFrame.style.translate = '0 ' + (y * 0.12).toFixed(1) + 'px';
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---------- グラスのピン連動 + 傾き ---------- */
  var stage = document.getElementById('glassStage');
  function activate(n) {
    [].forEach.call(document.querySelectorAll('[data-pin]'), function (el) {
      el.classList.toggle('is-active', n !== null && el.dataset.pin === String(n));
    });
  }
  [].forEach.call(document.querySelectorAll('[data-pin]'), function (el) {
    el.addEventListener('mouseenter', function () { activate(el.dataset.pin); });
    el.addEventListener('mouseleave', function () { activate(null); });
    el.addEventListener('focus', function () { activate(el.dataset.pin); });
    el.addEventListener('click', function () { activate(el.dataset.pin); });
  });
  if (stage && !reduce && window.matchMedia('(hover: hover)').matches) {
    stage.addEventListener('mousemove', function (e) {
      var r = stage.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5;
      var py = (e.clientY - r.top) / r.height - 0.5;
      stage.style.setProperty('--ry', (px * 12).toFixed(2) + 'deg');
      stage.style.setProperty('--rx', (-py * 10).toFixed(2) + 'deg');
    });
    stage.addEventListener('mouseleave', function () {
      stage.style.setProperty('--ry', '0deg');
      stage.style.setProperty('--rx', '0deg');
    });
  }
  // ピンの自動ハイライト（見えている間だけ順番に光る）
  if (stage && 'IntersectionObserver' in window && !reduce) {
    var cur = 0, timer = null, hovering = false;
    var wrap = document.getElementById('glass');
    wrap.addEventListener('mouseover', function (e) { if (e.target.closest('[data-pin]')) hovering = true; });
    wrap.addEventListener('mouseout', function (e) { if (e.target.closest('[data-pin]')) hovering = false; });
    new IntersectionObserver(function (es) {
      if (es[0].isIntersecting && !timer) {
        timer = setInterval(function () { if (!hovering) { cur = cur % 4 + 1; activate(cur); } }, 2200);
      } else if (!es[0].isIntersecting && timer) {
        clearInterval(timer); timer = null; activate(null);
      }
    }, { threshold: 0.3 }).observe(stage);
  }

  /* ---------- 動画: 自動再生の保険 ---------- */
  var video = document.getElementById('heroVideo');
  if (video) {
    video.muted = true;
    var tryPlay = function () { var p = video.play(); if (p && p.catch) p.catch(function () {}); };
    tryPlay();
    document.addEventListener('visibilitychange', function () { if (!document.hidden) tryPlay(); });
    window.addEventListener('touchstart', tryPlay, { once: true, passive: true });
  }

  /* ---------- BGM 再生 / 停止 ---------- */
  var audio = document.getElementById('bgm');
  var btns = [].slice.call(document.querySelectorAll('.js-bgm'));
  var labels = [].slice.call(document.querySelectorAll('.js-bgm-label'));
  var fab = document.getElementById('bgmFab');
  function setState(playing) {
    btns.forEach(function (b) {
      b.classList.toggle('is-playing', playing);
      b.setAttribute('aria-pressed', playing ? 'true' : 'false');
    });
    labels.forEach(function (l) { l.textContent = playing ? 'BGMを停止' : 'BGMを再生'; });
    if (fab) fab.setAttribute('aria-label', playing ? 'BGMを停止' : 'BGMを再生');
  }
  if (audio) {
    audio.volume = 0.55;
    audio.loop = true;
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        if (audio.paused) {
          var p = audio.play();
          if (p && p.catch) p.catch(function () { setState(false); });
        } else {
          audio.pause();
        }
      });
    });
    audio.addEventListener('play', function () { setState(true); });
    audio.addEventListener('pause', function () { setState(false); });
    // loop 属性が効かない環境向けの保険
    audio.addEventListener('ended', function () { audio.currentTime = 0; audio.play(); });
  }

  /* ---------- Q&A: 1つ開いたら他を閉じる ---------- */
  var faqs = [].slice.call(document.querySelectorAll('.faq__item'));
  faqs.forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (d.open) faqs.forEach(function (o) { if (o !== d) o.open = false; });
    });
  });
})();
