import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import "../assets/style/style.css";

/* =========================================================
   DATA
========================================================= */

// Tapered filled grass blade
const leafPath = (bx, by, tx, ty, w) => {
  const cx = bx + (tx - bx) * 0.15;
  const cy = by + (ty - by) * 0.55;

  return `
    M${bx - w} ${by}
    Q${cx - w * 0.5} ${cy} ${tx} ${ty}
    Q${cx + w * 0.5} ${cy} ${bx + w} ${by}
    Z
  `;
};

/* =========================================================
   SIDE LEAVES
========================================================= */

const SIDE_LEAVES = [
  [205, 675, 52, 130, 7, false],
  [215, 675, 85, 175, 3.5, true],
  [195, 675, 42, 350, 6, false],
  [185, 675, 34, 465, 6, false],
  [225, 675, 95, 290, 5, false],
  [235, 675, 120, 330, 4, true],
];

/* =========================================================
   CENTER LEAVES
========================================================= */

const CENTER_LEAVES = [
  [250, 675, 212, 590, 4],
  [250, 675, 232, 565, 3.5],
  [250, 675, 268, 565, 3.5],
  [250, 675, 288, 590, 4],
  [245, 675, 195, 625, 3.5],
  [255, 675, 305, 625, 3.5],
  [250, 675, 250, 580, 3],
];

/* =========================================================
   STEMS
========================================================= */

const STEMS = [
  ["M250 655 Q225 500 110 365", "#9b6bff"],
  ["M250 655 Q240 480 178 284", "#8a63ff"],
  ["M250 655 L250 203", "#2fb6ff"],
  ["M250 655 Q260 480 330 265", "#ff4d73"],
  ["M250 655 Q275 500 398 341", "#ff4d73"],
];

/* =========================================================
   FLOWERS
========================================================= */

const FLOWERS = [
  [110, 365, 0.75, -24],
  [178, 284, 0.85, -11],
  [250, 203, 1.0, 0],
  [330, 265, 0.85, 11],
  [398, 341, 0.75, 24],
];

/* =========================================================
   BERRIES
========================================================= */

const BERRIES = Array.from({ length: 10 }, (_, i) => {
  const t = i / 9;

  return {
    x: 118 + t * 100 + Math.sin(i * 2.1) * 6,
    y: 545 + t * 92 + Math.cos(i * 1.7) * 5,
    r: 20 + i * 17,
  };
});

/* =========================================================
   FLOWER COMPONENT
========================================================= */

function Flower({ cx, cy, s, tilt }) {
  return (
    <g
      className="flower"
      data-cx={cx}
      data-cy={cy}
    >
      <g
        className="flower-hover"
        data-cx={cx}
        data-cy={cy}
      >

        {/* Flower glow */}
        <circle
          className="flower-glow"
          cx={cx}
          cy={cy - 20 * s}
          r={84 * s}
          fill="url(#flowerGlow)"
          opacity="0"
        />

        {/* Flower */}
        <g
          transform={`translate(${cx} ${cy}) rotate(${tilt}) scale(${s})`}
        >
          <g filter="url(#softGlow)">

            {/* Purple / blue side petals */}
            {[-78, 78].map((a) => (
              <ellipse
                key={a}
                cx="0"
                cy="-26"
                rx="12"
                ry="27"
                transform={`rotate(${a})`}
                fill="url(#petalPurple)"
                stroke="#6af0ff"
                strokeWidth="1.2"
              />
            ))}

            {/* Lower petal */}
            <ellipse
              cx="0"
              cy="-20"
              rx="7"
              ry="22"
              transform="rotate(180)"
              fill="url(#petalPurple)"
              stroke="#6af0ff"
              strokeWidth="1.2"
            />

            {/* White petals */}
            {[-22, 22, 0].map((a) => {
              const big = a === 0;

              return (
                <g
                  key={a}
                  transform={`rotate(${a})`}
                >
                  <ellipse
                    cx="0"
                    cy={big ? -50 : -44}
                    rx="6.5"
                    ry={big ? 42 : 36}
                    fill="url(#petalWhite)"
                    stroke="#9ff8ff"
                    strokeWidth="1"
                  />

                  <ellipse
                    cx="0"
                    cy={big ? -74 : -62}
                    rx="2.6"
                    ry="8"
                    fill="#ff6fae"
                    opacity="0.85"
                  />

                  <line
                    x1="0"
                    y1="-8"
                    x2="0"
                    y2={big ? -66 : -54}
                    stroke="#fff"
                    strokeWidth="0.8"
                    opacity="0.7"
                  />
                </g>
              );
            })}

            {/* Flower center */}
            <circle
              r="5"
              fill="#d9fdff"
            />

          </g>
        </g>

        {/* Hover hit area */}
        <circle
          className="flower-hit"
          cx={cx}
          cy={cy - 28 * s}
          r={46 * s}
          fill="none"
          pointerEvents="all"
        />

      </g>
    </g>
  );
}

/* =========================================================
   HOME
========================================================= */

export default function Home() {
  const threeRef = useRef(null);
  const svgRef = useRef(null);

  useEffect(() => {

    /* =====================================================
       THREE.JS BACKGROUND
    ===================================================== */

    const container = threeRef.current;

    if (!container) return;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );

    camera.position.z = 8;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, 2)
    );

    renderer.setSize(
      container.clientWidth,
      container.clientHeight
    );

    container.appendChild(renderer.domElement);

    /* =====================================================
       PARTICLES
    ===================================================== */

    const particleCount = 170;

    const positions = new Float32Array(
      particleCount * 3
    );

    const colors = new Float32Array(
      particleCount * 3
    );

    const palette = [
      new THREE.Color(0x8eeaff),
      new THREE.Color(0xff7bd5),
      new THREE.Color(0xffffff),
      new THREE.Color(0xa88cff),
    ];

    for (let i = 0; i < particleCount; i++) {

      positions[i * 3] =
        (Math.random() - 0.5) * 8;

      positions[i * 3 + 1] =
        (Math.random() - 0.5) * 9;

      positions[i * 3 + 2] =
        (Math.random() - 0.5) * 4;

      const c =
        palette[
          Math.floor(
            Math.random() * palette.length
          )
        ];

      colors.set(
        [c.r, c.g, c.b],
        i * 3
      );
    }

    const geometry =
      new THREE.BufferGeometry();

    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(
        positions,
        3
      )
    );

    geometry.setAttribute(
      "color",
      new THREE.BufferAttribute(
        colors,
        3
      )
    );

    const material =
      new THREE.PointsMaterial({
        size: 0.035,
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
      });

    const particles =
      new THREE.Points(
        geometry,
        material
      );

    scene.add(particles);

    /* =====================================================
       THREE ANIMATION
    ===================================================== */

    const clock = new THREE.Clock();

    let rafId;

    const mouse = {
      x: 0,
      y: 0,
    };

    const onMouseMove = (e) => {

      mouse.x =
        (e.clientX / window.innerWidth - 0.5) * 2;

      mouse.y =
        (e.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener(
      "mousemove",
      onMouseMove
    );

    function animateThree() {

      const t =
        clock.getElapsedTime();

      particles.rotation.y =
        t * 0.012;

      particles.rotation.x =
        Math.sin(t * 0.15) * 0.03;

      particles.position.y =
        Math.sin(t * 0.2) * 0.15;

      particles.position.x +=
        (-mouse.x * 0.2 -
          particles.position.x) *
        0.03;

      particles.position.y +=
        (mouse.y * 0.12 -
          particles.position.y) *
        0.03;

      material.opacity =
        0.7 +
        Math.sin(t * 1.5) * 0.15;

      renderer.render(
        scene,
        camera
      );

      rafId =
        requestAnimationFrame(
          animateThree
        );
    }

    animateThree();

    /* =====================================================
       SVG ANIMATION
    ===================================================== */

    const svg = svgRef.current;

    if (!svg) return;

    const q = (selector) =>
      svg.querySelectorAll(selector);

    /* =====================================================
       INITIAL STATES
    ===================================================== */

    q(".leaf").forEach((el) => {

      gsap.set(el, {
        svgOrigin:
          `${el.dataset.ox} ${el.dataset.oy}`,
        scale: 0,
      });

    });

    q(".berry").forEach((el) => {

      gsap.set(el, {
        svgOrigin:
          `${el.dataset.cx} ${el.dataset.cy}`,
        scale: 0,
        opacity: 0,
      });

    });

    q(".flower").forEach((el) => {

      gsap.set(el, {
        svgOrigin:
          `${el.dataset.cx} ${el.dataset.cy}`,
        scale: 0,
        rotation: -50,
        opacity: 0,
      });

    });

    gsap.set(
      q(".stem"),
      {
        strokeDasharray: 1,
        strokeDashoffset: 1,
      }
    );

    gsap.set(
      q(".flower-glow"),
      {
        opacity: 0,
      }
    );

    /* =====================================================
       GSAP TIMELINE
    ===================================================== */

    const tl =
      gsap.timeline();

    /* 1. SIDE LEAVES */

    tl.to(
      q(".side-leaf"),
      {
        scale: 1,
        duration: 1.6,
        stagger: 0.12,
        ease: "power2.out",
      }
    );

    /* 2. CENTER LEAVES */

    tl.to(
      q(".center-leaf"),
      {
        scale: 1,
        duration: 1,
        stagger: 0.08,
        ease: "power2.out",
      },
      "-=0.9"
    );

    /* BERRIES */

    tl.to(
      q(".berry"),
      {
        scale: 1,
        opacity: 1,
        duration: 0.5,
        stagger: 0.05,
        ease: "back.out(2)",
      },
      "<0.3"
    );

    /* 3. STEMS */

    tl.to(
      q(".stem"),
      {
        strokeDashoffset: 0,
        duration: 1.4,
        stagger: 0.15,
        ease: "power2.inOut",
      },
      "-=0.2"
    );

    /* 4. FLOWERS */

    tl.to(
      q(".flower"),
      {
        scale: 1,
        rotation: 0,
        opacity: 1,
        duration: 1.1,
        stagger: 0.35,
        ease: "back.out(1.7)",
      },
      "-=0.5"
    );

    /* 5. FLOWER GLOW */

    tl.addLabel(
      "glow",
      "+=0.2"
    );

    tl.to(
      q(".flower-glow"),
      {
        opacity: 1,
        duration: 0.5,
        stagger: 0.06,
        ease: "power2.out",
      },
      "glow"
    );

    tl.to(
      q(".flower-glow"),
      {
        opacity: 0.25,
        duration: 1,
        ease: "power2.inOut",
      }
    );

    /* =====================================================
       IDLE FLOAT
    ===================================================== */

    const idle = [];

    let hoverReady = false;

    tl.call(() => {

      hoverReady = true;

      q(".flower").forEach(
        (el, i) => {

          idle.push(
            gsap.to(
              el,
              {
                y: -3,
                duration:
                  1.6 + i * 0.15,
                ease: "sine.inOut",
                yoyo: true,
                repeat: -1,
              }
            )
          );

        }
      );

    });

    /* =====================================================
       FLOWER HOVER
    ===================================================== */

    const hoverEls =
      Array.from(
        q(".flower-hover")
      );

    hoverEls.forEach(
      (el) => {

        gsap.set(
          el,
          {
            svgOrigin:
              `${el.dataset.cx} ${el.dataset.cy}`,
          }
        );

      }
    );

    const onEnter = (e) => {

      if (!hoverReady) return;

      const el =
        e.currentTarget;

      gsap.to(
        el,
        {
          scale: 1.22,
          rotation: 6,
          duration: 0.5,
          ease: "back.out(2)",
          overwrite: "auto",
        }
      );

      gsap.to(
        el.querySelector(
          ".flower-glow"
        ),
        {
          opacity: 1,
          scale: 1.4,
          transformOrigin:
            "50% 50%",
          duration: 0.4,
          overwrite: "auto",
        }
      );
    };

    const onLeave = (e) => {

      const el =
        e.currentTarget;

      gsap.to(
        el,
        {
          scale: 1,
          rotation: 0,
          duration: 0.7,
          ease: "elastic.out(1, 0.5)",
          overwrite: "auto",
        }
      );

      gsap.to(
        el.querySelector(
          ".flower-glow"
        ),
        {
          opacity: 0.25,
          scale: 1,
          duration: 0.6,
          overwrite: "auto",
        }
      );
    };

    hoverEls.forEach(
      (el) => {

        el.addEventListener(
          "mouseenter",
          onEnter
        );

        el.addEventListener(
          "mouseleave",
          onLeave
        );

      }
    );

    /* =====================================================
       RESPONSIVE
    ===================================================== */

    const handleResize = () => {

      const w =
        container.clientWidth;

      const h =
        container.clientHeight;

      camera.aspect =
        w / h;

      camera.updateProjectionMatrix();

      renderer.setSize(
        w,
        h
      );
    };

    window.addEventListener(
      "resize",
      handleResize
    );

    /* =====================================================
       CLEANUP
    ===================================================== */

    return () => {

      window.removeEventListener(
        "resize",
        handleResize
      );

      window.removeEventListener(
        "mousemove",
        onMouseMove
      );

      hoverEls.forEach(
        (el) => {

          el.removeEventListener(
            "mouseenter",
            onEnter
          );

          el.removeEventListener(
            "mouseleave",
            onLeave
          );

        }
      );

      idle.forEach(
        (animation) =>
          animation.kill()
      );

      cancelAnimationFrame(
        rafId
      );

      tl.kill();

      geometry.dispose();

      material.dispose();

      renderer.dispose();

      if (
        renderer.domElement.parentNode
      ) {
        renderer.domElement.parentNode.removeChild(
          renderer.domElement
        );
      }
    };

  }, []);

  /* =========================================================
     LEAF PROPS
  ========================================================= */

  const leafProps = (
    l,
    mirror
  ) => {

    const m = (x) =>
      mirror ? 500 - x : x;

    return {
      d: leafPath(
        m(l[0]),
        l[1],
        m(l[2]),
        l[3],
        l[4]
      ),

      "data-ox": m(l[0]),

      "data-oy": l[1],
    };
  };

  /* =========================================================
     JSX
  ========================================================= */

  return (
    <div className="plant-page">

      {/* THREE.JS FULL SCREEN */}
      <div
        ref={threeRef}
        className="three-background"
      />

      {/* SVG FULL SCREEN */}
      <svg
        ref={svgRef}
        className="plant-svg"
        viewBox="0 0 500 700"
        preserveAspectRatio="xMidYMax meet"
      >

        {/* =================================================
            SVG DEFINITIONS
        ================================================= */}

        <defs>

          {/* Background glow */}

          <radialGradient id="bgGlow">

            <stop
              offset="0%"
              stopColor="#053c49"
              stopOpacity="0.55"
            />

            <stop
              offset="50%"
              stopColor="#16052e"
              stopOpacity="0.4"
            />

            <stop
              offset="100%"
              stopColor="#000"
              stopOpacity="0"
            />

          </radialGradient>

          {/* Leaf gradient */}

          <linearGradient
            id="leafGrad"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >

            <stop
              offset="0%"
              stopColor="#8dff6a"
            />

            <stop
              offset="100%"
              stopColor="#0a9a46"
            />

          </linearGradient>

          {/* Light leaf */}

          <linearGradient
            id="leafLight"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >

            <stop
              offset="0%"
              stopColor="#c6ff9a"
            />

            <stop
              offset="100%"
              stopColor="#3fbf5a"
            />

          </linearGradient>

          {/* Purple flower */}

          <radialGradient
            id="petalPurple"
            cx="50%"
            cy="85%"
            r="80%"
          >

            <stop
              offset="0%"
              stopColor="#3fd9ff"
            />

            <stop
              offset="55%"
              stopColor="#7a5cff"
            />

            <stop
              offset="100%"
              stopColor="#b25cff"
            />

          </radialGradient>

          {/* White flower */}

          <linearGradient
            id="petalWhite"
            x1="0"
            y1="1"
            x2="0"
            y2="0"
          >

            <stop
              offset="0%"
              stopColor="#5eeaff"
            />

            <stop
              offset="50%"
              stopColor="#e8feff"
            />

            <stop
              offset="100%"
              stopColor="#ffffff"
            />

          </linearGradient>

          {/* Flower glow */}

          <radialGradient id="flowerGlow">

            <stop
              offset="0%"
              stopColor="#5ff0ff"
              stopOpacity="0.85"
            />

            <stop
              offset="60%"
              stopColor="#38a8ff"
              stopOpacity="0.3"
            />

            <stop
              offset="100%"
              stopColor="#38a8ff"
              stopOpacity="0"
            />

          </radialGradient>

          {/* Glow filter */}

          <filter
            id="glow"
            x="-30%"
            y="-30%"
            width="160%"
            height="160%"
          >

            <feGaussianBlur
              stdDeviation="3"
              result="blur"
            />

            <feMerge>

              <feMergeNode in="blur" />

              <feMergeNode in="SourceGraphic" />

            </feMerge>

          </filter>

          {/* Soft glow */}

          <filter
            id="softGlow"
            x="-40%"
            y="-40%"
            width="180%"
            height="180%"
          >

            <feGaussianBlur
              stdDeviation="1.6"
              result="blur"
            />

            <feMerge>

              <feMergeNode in="blur" />

              <feMergeNode in="SourceGraphic" />

            </feMerge>

          </filter>

        </defs>

        {/* =================================================
            BACKGROUND SVG GLOW
        ================================================= */}

        <ellipse
          className="background-glow"
          cx="250"
          cy="400"
          rx="230"
          ry="290"
          fill="url(#bgGlow)"
        />

        {/* =================================================
            BIG SIDE LEAVES
        ================================================= */}

        <g
          stroke="rgba(200,255,170,0.45)"
          strokeWidth="0.8"
          filter="url(#glow)"
        >

          {/* LEFT */}

          {SIDE_LEAVES.map(
            (l, i) => (

              <path
                key={`left-${i}`}
                className="leaf side-leaf"
                fill={
                  l[5]
                    ? "url(#leafLight)"
                    : "url(#leafGrad)"
                }
                {...leafProps(
                  l,
                  false
                )}
              />

            )
          )}

          {/* RIGHT */}

          {SIDE_LEAVES.map(
            (l, i) => (

              <path
                key={`right-${i}`}
                className="leaf side-leaf"
                fill={
                  l[5]
                    ? "url(#leafLight)"
                    : "url(#leafGrad)"
                }
                {...leafProps(
                  l,
                  true
                )}
              />

            )
          )}

        </g>

        {/* =================================================
            BERRIES
        ================================================= */}

        <g
          fill="none"
          strokeWidth="1.6"
          filter="url(#softGlow)"
        >

          {/* LEFT BERRIES */}

          {BERRIES.map(
            (b, i) => (

              <ellipse
                key={`bl-${i}`}
                className="berry"
                data-cx={b.x}
                data-cy={b.y}
                cx={b.x}
                cy={b.y}
                rx="9"
                ry="5.5"
                transform={`rotate(
                  ${b.r}
                  ${b.x}
                  ${b.y}
                )`}
                stroke="#4fc8ff"
              />

            )
          )}

          {/* RIGHT BERRIES */}

          {BERRIES.map(
            (b, i) => (

              <ellipse
                key={`br-${i}`}
                className="berry"
                data-cx={500 - b.x}
                data-cy={b.y}
                cx={500 - b.x}
                cy={b.y}
                rx="9"
                ry="5.5"
                transform={`rotate(
                  ${-b.r}
                  ${500 - b.x}
                  ${b.y}
                )`}
                stroke="#ff7bb8"
              />

            )
          )}

        </g>

        {/* =================================================
            STEMS
        ================================================= */}

        <g
          fill="none"
          strokeWidth="3.5"
          strokeLinecap="round"
          filter="url(#glow)"
        >

          {STEMS.map(
            ([d, color], i) => (

              <path
                key={i}
                className="stem"
                pathLength="1"
                d={d}
                stroke={color}
              />

            )
          )}

        </g>

        {/* =================================================
            CENTER SPROUTS
        ================================================= */}

        <g
          fill="url(#leafGrad)"
          stroke="rgba(200,255,170,0.45)"
          strokeWidth="0.8"
          filter="url(#glow)"
        >

          {CENTER_LEAVES.map(
            (l, i) => (

              <path
                key={i}
                className="leaf center-leaf"
                d={leafPath(
                  l[0],
                  l[1],
                  l[2],
                  l[3],
                  l[4]
                )}
                data-ox={l[0]}
                data-oy={l[1]}
              />

            )
          )}

        </g>

        {/* =================================================
            FLOWERS
        ================================================= */}

        {FLOWERS.map(
          (
            [cx, cy, s, tilt],
            i
          ) => (

            <Flower
              key={i}
              cx={cx}
              cy={cy}
              s={s}
              tilt={tilt}
            />

          )
        )}

      </svg>

    </div>
  );
}