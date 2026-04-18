/* ===========================================================
 * enhance.js — GSAP · ScrollTrigger · Three.js · Lenis · CSS3D
 * Layered ON TOP of script.js (which owns i18n + word splits).
 * Does nothing if libs or motion are unavailable.
 * =========================================================== */

(function () {
  'use strict';

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;
  const small = window.innerWidth < 680;

  const hasGSAP = typeof window.gsap !== 'undefined';
  const hasST = typeof window.ScrollTrigger !== 'undefined';
  const hasTHREE = typeof window.THREE !== 'undefined';
  const hasLenis = typeof window.Lenis !== 'undefined';

  if (!hasGSAP) document.documentElement.classList.add('no-gsap');
  else document.body.classList.add('gsap-ready');

  if (hasST) gsap.registerPlugin(ScrollTrigger);

  // ---------------------------------------------------------------
  // Reveal-system handoff: the CSS `.reveal` class keeps elements at
  // opacity 0 until an IntersectionObserver flips them on. GSAP's
  // `from()` reads the current computed style as the natural target,
  // so if it runs before the observer fires, it sees opacity 0 and
  // animates from 0 to 0 → text never appears. Strip `.reveal` so
  // GSAP (or a fallback) has a clean canvas.
  // ---------------------------------------------------------------
  if (hasGSAP) {
    document.querySelectorAll('.reveal').forEach((el) => {
      el.classList.add('is-visible');     // legacy hooks stay happy
      el.classList.remove('reveal');      // drop the opacity:0 rule
      el.style.opacity = '';
      el.style.transform = '';
    });
  }

  /* ----------------------------------------------------------
   * 1. Lenis smooth inertial scroll (synced with ScrollTrigger)
   * -------------------------------------------------------- */
  let lenis = null;
  if (hasLenis && hasGSAP && !reduced) {
    document.documentElement.classList.add('lenis');
    lenis = new Lenis({
      lerp: 0.09,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.2,
    });

    lenis.on('scroll', () => hasST && ScrollTrigger.update());
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    // Intercept anchor clicks so they ride Lenis
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href');
        if (!id || id === '#' || id.length < 2) return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        e.stopImmediatePropagation();
        lenis.scrollTo(target, { offset: -72, duration: 1.2 });
      }, true);
    });
  }

  /* ----------------------------------------------------------
   * 2. Three.js WebGL aurora — full-screen shader behind hero
   * -------------------------------------------------------- */
  if (hasTHREE && !reduced) initWebGL();

  function initWebGL() {
    const canvas = document.getElementById('gl');
    const heroEl = document.querySelector('.hero');
    if (!canvas || !heroEl) return;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: false,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch (err) { return; }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1 : 1.75));

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const uniforms = {
      uTime:  { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uRes:   { value: new THREE.Vector2(1, 1) },
    };

    const vert = `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = vec4(position, 1.0); }
    `;

    // Fluid aurora FBM shader — reacts to mouse and time.
    const frag = `
      precision highp float;
      varying vec2 vUv;
      uniform float uTime;
      uniform vec2 uMouse;
      uniform vec2 uRes;

      vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
      float snoise(vec2 v){
        const vec4 C = vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy));
        vec2 x0 = v - i + dot(i, C.xx);
        vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod(i, 289.0);
        vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m; m = m*m;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }
      float fbm(vec2 p){
        float v = 0.0; float a = 0.5;
        for (int i = 0; i < 5; i++) { v += a * snoise(p); p *= 2.0; a *= 0.5; }
        return v;
      }

      void main(){
        vec2 uv = vUv;
        float aspect = uRes.x / max(uRes.y, 1.0);
        vec2 p = vec2(uv.x * aspect, uv.y) * 2.2;
        float t = uTime * 0.06;

        vec2 q = vec2(fbm(p + vec2(0.0, t)),
                      fbm(p + vec2(5.2, 1.3) + t));

        vec2 r = vec2(fbm(p + 1.5*q + vec2(1.7, 9.2) + 0.5*t),
                      fbm(p + 1.5*q + vec2(8.3, 2.8) + 0.6*t));

        float f = fbm(p + r);

        // Apple-inspired palette: deep blue → violet → pink on near-black.
        vec3 cBlue   = vec3(0.16, 0.59, 1.00);
        vec3 cPurple = vec3(0.54, 0.36, 0.96);
        vec3 cPink   = vec3(0.96, 0.45, 0.71);
        vec3 cInk    = vec3(0.004, 0.004, 0.018);

        vec3 col = mix(cInk, cBlue, clamp((f*f) * 3.5, 0.0, 1.0));
        col = mix(col, cPurple, clamp(length(q), 0.0, 1.0) * 0.55);
        col = mix(col, cPink,   clamp(r.x,        0.0, 1.0) * 0.32);

        // Mouse glow
        float d = distance(uv, uMouse);
        col += smoothstep(0.38, 0.0, d) * 0.22 * vec3(0.5, 0.8, 1.0);

        // Vignette
        float vig = smoothstep(1.3, 0.35, length(uv - 0.5) * 2.0);
        col *= mix(0.55, 1.0, vig);

        gl_FragColor = vec4(col, 1.0);
      }
    `;

    const mat = new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      uniforms,
    });
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
    scene.add(quad);

    function resize() {
      const w = heroEl.offsetWidth;
      const h = heroEl.offsetHeight;
      renderer.setSize(w, h, false);
      uniforms.uRes.value.set(w, h);
    }
    window.addEventListener('resize', resize);
    resize();

    // Smoothed mouse uniform
    let mx = 0.5, my = 0.5;
    let tx = 0.5, ty = 0.5;
    window.addEventListener('mousemove', (e) => {
      const r = heroEl.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width;
      ty = 1.0 - (e.clientY - r.top) / r.height;
    }, { passive: true });

    const t0 = performance.now();
    let running = true;

    if (hasST) {
      ScrollTrigger.create({
        trigger: heroEl,
        start: 'top top',
        end: 'bottom top',
        onToggle: (self) => { running = self.isActive || self.progress < 1; },
      });
    }

    document.body.classList.add('webgl-ready');

    (function loop(now) {
      if (running) {
        uniforms.uTime.value = (now - t0) / 1000;
        mx += (tx - mx) * 0.06;
        my += (ty - my) * 0.06;
        uniforms.uMouse.value.set(mx, my);
        renderer.render(scene, camera);
      }
      requestAnimationFrame(loop);
    })(t0);
  }

  /* ----------------------------------------------------------
   * 3. GSAP choreography
   * -------------------------------------------------------- */
  if (hasGSAP) {
    // Hero entrance — chained timeline (existing word-part reveal is CSS,
    // this just adds the supporting cast: sub, buttons, icon chips, meta).
    const heroTl = gsap.timeline({ defaults: { ease: 'power4.out' }, delay: 0.15 });
    heroTl
      .from('.hero .eyebrow',       { y: 20, opacity: 0, duration: 0.8 }, 0.0)
      .from('.hero-sub',            { y: 30, opacity: 0, duration: 0.9 }, 0.55)
      .from('.hero-actions .btn',   { y: 22, opacity: 0, duration: 0.8, stagger: 0.08 }, 0.70)
      .from('.hero-icon-row .iconchip', {
        y: 24, opacity: 0, scale: 0.6, rotateX: -40,
        transformOrigin: '50% 100%',
        duration: 0.9, stagger: 0.05,
      }, 0.85)
      .from('.hero-meta > div',     { y: 18, opacity: 0, duration: 0.7, stagger: 0.08 }, 1.00);

    if (hasST) {
      /* ----- Section headlines: slide in once they scroll into view ----- */
      gsap.utils.toArray('section h2').forEach((h) => {
        if (h.closest('.hero')) return;
        gsap.from(h, {
          scrollTrigger: { trigger: h, start: 'top 88%', toggleActions: 'play none none reverse' },
          y: 60, opacity: 0, duration: 1.1, ease: 'power4.out',
        });
      });

      /* ----- Section eyebrow lines ----- */
      gsap.utils.toArray('section .eyebrow').forEach((e) => {
        if (e.closest('.hero')) return;
        gsap.from(e, {
          scrollTrigger: { trigger: e, start: 'top 92%' },
          y: 14, opacity: 0, duration: 0.7, ease: 'power3.out',
        });
      });

      /* ----- Cards lift in (stat / module / skill / tl / case) ----- */
      const cardSel = '.stat, .module, .skill-card, .tl-item, .case, .project';
      gsap.utils.toArray(cardSel).forEach((card, i) => {
        gsap.from(card, {
          scrollTrigger: { trigger: card, start: 'top 92%' },
          y: 44, opacity: 0, duration: 0.85,
          ease: 'power3.out',
          delay: (i % 6) * 0.04,
        });
      });

      /* ----- Hero parallax / dissolve as user scrolls away ----- */
      gsap.to('.hero-title', {
        yPercent: -25, opacity: 0.15, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
      });
      gsap.to('.hero-sub, .hero-actions, .hero-icon-row, .hero-meta', {
        yPercent: -40, opacity: 0, ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
      });

      /* ----- Marquee: gentle scroll-speed parallax ----- */
      gsap.to('.marquee-track', {
        xPercent: -6, ease: 'none',
        scrollTrigger: { trigger: '.marquee', start: 'top bottom', end: 'bottom top', scrub: true }
      });

      /* ----- Scroll-scrubbed bar chart ----- */
      const bars = gsap.utils.toArray('.chart .bar');
      bars.forEach((b) => { b.style.animation = 'none'; });
      gsap.fromTo(bars,
        { scaleY: 0 },
        {
          scaleY: 1, ease: 'power2.out', stagger: 0.08,
          scrollTrigger: {
            trigger: '.project-visual',
            start: 'top 80%',
            end: 'top 30%',
            scrub: 0.7,
          }
        }
      );

      /* ----- Scrubbed SVG chart curve draw ----- */
      const chartCurve = document.querySelector('.chart-curve path');
      if (chartCurve) {
        try {
          const len = chartCurve.getTotalLength();
          chartCurve.style.strokeDasharray = len;
          chartCurve.style.strokeDashoffset = len;
          gsap.to(chartCurve, {
            strokeDashoffset: 0, ease: 'none',
            scrollTrigger: {
              trigger: '.project-visual',
              start: 'top 80%',
              end: 'top 20%',
              scrub: 0.6,
            }
          });
        } catch (e) {}
      }

      /* ----- Timeline progressive line ----- */
      const timeline = document.querySelector('.timeline');
      if (timeline) {
        let line = timeline.querySelector('.tl-progress');
        if (!line) {
          line = document.createElement('span');
          line.className = 'tl-progress';
          timeline.appendChild(line);
        }
        gsap.fromTo(line,
          { height: '0%' },
          {
            height: '100%', ease: 'none',
            scrollTrigger: {
              trigger: timeline,
              start: 'top 70%',
              end: 'bottom 80%',
              scrub: 0.6,
            }
          }
        );

        /* dots light up as the line passes them */
        gsap.utils.toArray('.tl-item').forEach((it) => {
          const dot = it.querySelector('.tl-dot');
          if (!dot) return;
          gsap.fromTo(dot,
            { scale: 0.6, opacity: 0.4, boxShadow: '0 0 0 0 rgba(41,151,255,0)' },
            {
              scale: 1, opacity: 1,
              boxShadow: '0 0 0 6px rgba(41,151,255,0.18)',
              duration: 0.4, ease: 'power2.out',
              scrollTrigger: { trigger: it, start: 'top 70%', toggleActions: 'play none none reverse' }
            }
          );
        });
      }

      /* ----- Language-bar fills driven by ScrollTrigger ----- */
      gsap.utils.toArray('ul.lang .bar-fill').forEach((f) => {
        const w = getComputedStyle(f).getPropertyValue('--w').trim() || '80%';
        gsap.fromTo(f,
          { scaleX: 0 },
          {
            scaleX: 1, transformOrigin: 'left center',
            duration: 1.1, ease: 'power3.out',
            scrollTrigger: { trigger: f, start: 'top 92%', toggleActions: 'play none none reverse' }
          }
        );
      });

      /* ----- Contact card gentle rise ----- */
      gsap.from('.contact-card', {
        y: 50, opacity: 0, duration: 1.1, ease: 'power4.out',
        scrollTrigger: { trigger: '.contact-card', start: 'top 85%' }
      });
    }
  }

  /* ----------------------------------------------------------
   * 4. 3D tilt on cards (pointer devices, non-reduced motion)
   * -------------------------------------------------------- */
  if (fine && !reduced) {
    const sel = '.stat, .module, .skill-card, .case, .project, .tl-card, .contact-card';
    document.querySelectorAll(sel).forEach((el) => {
      const strength = el.classList.contains('contact-card') ? 3 : 6;

      const onMove = (e) => {
        const r = el.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width - 0.5;
        const ny = (e.clientY - r.top) / r.height - 0.5;
        const rx = -ny * strength;
        const ry =  nx * strength;
        el.classList.remove('is-untilting');
        el.classList.add('is-tilting');
        el.style.transform =
          `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateZ(0)`;
        // Shine position for ::before gradient
        el.style.setProperty('--mx', `${((nx + 0.5) * 100).toFixed(1)}%`);
        el.style.setProperty('--my', `${((ny + 0.5) * 100).toFixed(1)}%`);
      };
      const onLeave = () => {
        el.classList.remove('is-tilting');
        el.classList.add('is-untilting');
        el.style.transform = '';
      };
      el.addEventListener('mousemove', onMove, { passive: true });
      el.addEventListener('mouseleave', onLeave);
    });
  }

  /* ----------------------------------------------------------
   * 5. CSS 3D rotating skill cloud (true 3D sphere of keywords)
   * -------------------------------------------------------- */
  (function buildCloud() {
    const cloud = document.getElementById('cloud');
    if (!cloud || reduced) return;

    const labels = [
      'Projektmanagement', 'Operations Research', 'Supply Chain',
      'Lean · KVP', 'Risikoanalyse', 'Meilensteinplan',
      'KPI Analytics', 'Business Cases', 'Excel · Solver',
      'Python · NumPy', 'Matplotlib', 'Produktions­steuerung',
      'Prozess­optimierung', 'Cross-functional', 'ROI · Break-even',
      'Szenario­analyse', 'Fortschritts­kontrolle', 'Agiles PM',
      'Stat. Analyse', 'Entscheidungs­unterstützung',
    ];

    const n = labels.length;
    const radius = small ? 140 : 190;

    // Fibonacci sphere distribution → even spacing
    const nodes = [];
    for (let i = 0; i < n; i++) {
      const phi = Math.acos(-1 + (2 * i) / n);
      const theta = Math.sqrt(n * Math.PI) * phi;
      const x = radius * Math.cos(theta) * Math.sin(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(phi);

      const tag = document.createElement('span');
      tag.className = 'tag3d';
      tag.innerHTML = '<span class="tdot"></span>' + labels[i];
      // Each tag is counter-rotated so it always faces the camera relative to the cloud.
      tag.style.transform =
        `translate(-50%, -50%) translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${z.toFixed(1)}px)`;
      cloud.appendChild(tag);
      nodes.push({ el: tag, x, y, z });
    }

    // Depth → opacity / scale, refreshed on each frame.
    // We piggyback on the CSS animation's current matrix via getComputedStyle.
    // Cheap approximation: grab rotateY angle from the CSS anim time.
    const animDurationMs = 40_000;
    let baseStart = performance.now();

    // Drag to rotate (and pause CSS anim while dragging)
    let dragging = false, startX = 0, startY = 0;
    let rotY = 0, rotX = -8;
    let vrotY = 0, vrotX = 0;

    const apply = () => {
      cloud.style.animation = 'none';
      cloud.style.transform = `rotateY(${rotY.toFixed(2)}deg) rotateX(${rotX.toFixed(2)}deg)`;
    };

    cloud.addEventListener('mousedown', (e) => {
      dragging = true; startX = e.clientX; startY = e.clientY; apply();
    });
    window.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      startX = e.clientX; startY = e.clientY;
      rotY += dx * 0.4;
      rotX = Math.max(-60, Math.min(60, rotX - dy * 0.3));
      vrotY = dx * 0.4;
      vrotX = -dy * 0.3;
      apply();
    });
    window.addEventListener('mouseup', () => { dragging = false; });
    window.addEventListener('mouseleave', () => { dragging = false; });

    // Inertia loop after drag release
    (function inertia() {
      if (!dragging && (Math.abs(vrotY) > 0.02 || Math.abs(vrotX) > 0.02)) {
        rotY += vrotY; rotX += vrotX;
        vrotY *= 0.94; vrotX *= 0.94;
        apply();
      }
      requestAnimationFrame(inertia);
    })();
  })();

  /* ----------------------------------------------------------
   * 6. Refresh ScrollTrigger after everything is laid out
   * -------------------------------------------------------- */
  window.addEventListener('load', () => {
    if (hasST) ScrollTrigger.refresh();
  });
})();
