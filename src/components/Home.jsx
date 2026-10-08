import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import "../assets/style/style.css";

export default function Home() {
  const threeRef = useRef(null);
  const svgRef = useRef(null);

  useEffect(() => {
    // =========================================================
    // THREE.JS BACKGROUND PARTICLES
    // =========================================================
    const container = threeRef.current;

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

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const particleCount = 180;

    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 6;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );

    const material = new THREE.PointsMaterial({
      color: 0x8eeaff,
      size: 0.035,
      transparent: true,
      opacity: 0.8,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    const clock = new THREE.Clock();

    function animateThree() {
      const elapsed = clock.getElapsedTime();

      particles.rotation.y = elapsed * 0.025;
      particles.rotation.x = Math.sin(elapsed * 0.15) * 0.04;

      renderer.render(scene, camera);
      requestAnimationFrame(animateThree);
    }

    animateThree();

    // =========================================================
    // SVG
    // =========================================================

    const svg = svgRef.current;

    const $ = (selector) => svg.querySelectorAll(selector);

    // Hide all paths initially
    const paths = svg.querySelectorAll(".grow");

    paths.forEach((path) => {
      const length = path.getTotalLength();

      gsap.set(path, {
        strokeDasharray: length,
        strokeDashoffset: length,
        opacity: 0,
      });
    });

    // Flowers initially hidden
    gsap.set($(".flower"), {
      scale: 0,
      opacity: 0,
      transformOrigin: "center center",
    });

    // Small decorative flowers
    gsap.set($(".small-flower"), {
      scale: 0,
      opacity: 0,
      transformOrigin: "center center",
    });

    // =========================================================
    // MAIN TIMELINE
    // =========================================================

    const tl = gsap.timeline({
      repeat: -1,
      repeatDelay: 1,
    });

    // -----------------------------------------
    // 1. Ground glow
    // -----------------------------------------

    tl.fromTo(
      $(".ground-glow"),
      {
        opacity: 0,
        scale: 0.4,
      },
      {
        opacity: 1,
        scale: 1,
        duration: 0.8,
        ease: "power2.out",
      }
    );

    // -----------------------------------------
    // 2. Green leaves grow first
    // -----------------------------------------

    tl.to(
      $(".green-leaf .grow"),
      {
        opacity: 1,
        strokeDashoffset: 0,
        duration: 1.0,
        stagger: 0.1,
        ease: "power2.out",
      },
      "-=0.4"
    );

    // -----------------------------------------
    // 3. Purple stems
    // -----------------------------------------

    tl.to(
      $(".purple-stem .grow"),
      {
        opacity: 1,
        strokeDashoffset: 0,
        duration: 1.0,
        stagger: 0.1,
        ease: "power2.out",
      },
      "-=0.6"
    );

    // -----------------------------------------
    // 4. Pink center stems
    // -----------------------------------------

    tl.to(
      $(".pink-stem .grow"),
      {
        opacity: 1,
        strokeDashoffset: 0,
        duration: 1.0,
        stagger: 0.1,
        ease: "power2.out",
      },
      "-=0.6"
    );

    // -----------------------------------------
    // 5. Flower animation (0.5 seconds after plant leaves & stems)
    // -----------------------------------------

    tl.to(
      $(".small-flower"),
      {
        opacity: 1,
        scale: 1,
        duration: 0.5,
        stagger: 0.1,
        ease: "back.out(2)",
      },
      "+=0.5"
    );

    // -----------------------------------------
    // 6. Main flowers bloom
    // -----------------------------------------

    tl.to(
      $(".flower"),
      {
        opacity: 1,
        scale: 1,
        duration: 0.7,
        stagger: 0.25,
        ease: "elastic.out(1, 0.5)",
      },
      "-=0.2"
    );

    // -----------------------------------------
    // 7. Final glow
    // -----------------------------------------

    tl.to(
      $(".flower-petal"),
      {
        filter: "drop-shadow(0 0 12px #55eaff)",
        duration: 0.5,
        stagger: 0.05,
      }
    );

    // -----------------------------------------
    // 8. Floating final effect
    // -----------------------------------------

    tl.to(
      $(".flower"),
      {
        y: -3,
        duration: 1.5,
        stagger: 0.12,
        ease: "sine.inOut",
        yoyo: true,
        repeat: 1,
      }
    );

    // =========================================================
    // RESPONSIVE
    // =========================================================

    const handleResize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);

      tl.kill();

      geometry.dispose();
      material.dispose();

      renderer.dispose();

      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="plant-page">

      {/* THREE BACKGROUND */}
      <div ref={threeRef} className="three-background" />

      {/* SVG PLANT */}
      <div className="plant-container">

        <svg
          ref={svgRef}
          className="plant-svg"
          viewBox="0 0 500 700"
          preserveAspectRatio="xMidYMid meet"
        >

          <defs>

            {/* Background glow */}
            <radialGradient id="bgGlow">
              <stop offset="0%" stopColor="#053c49" stopOpacity="0.7" />
              <stop offset="45%" stopColor="#16052e" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>

            {/* Green gradient */}
            <linearGradient
              id="greenGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor="#7cff65" />
              <stop offset="100%" stopColor="#00c85a" />
            </linearGradient>

            {/* Purple gradient */}
            <linearGradient
              id="purpleGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor="#a88cff" />
              <stop offset="100%" stopColor="#633cff" />
            </linearGradient>

            {/* Pink gradient */}
            <linearGradient
              id="pinkGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor="#ff7bd5" />
              <stop offset="100%" stopColor="#ff1b9c" />
            </linearGradient>

            {/* Flower gradient */}
            <radialGradient id="flowerGradient">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="35%" stopColor="#74f5ff" />
              <stop offset="70%" stopColor="#9d72ff" />
              <stop offset="100%" stopColor="#ff4fd8" />
            </radialGradient>

            {/* Glow filter */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

          </defs>

          {/* BACKGROUND */}
          <ellipse
            className="background-glow"
            cx="250"
            cy="370"
            rx="220"
            ry="260"
            fill="url(#bgGlow)"
          />

          {/* GROUND GLOW */}
          <ellipse
            className="ground-glow"
            cx="250"
            cy="620"
            rx="145"
            ry="35"
            fill="#5c2aff"
            opacity="0"
            filter="url(#glow)"
          />

          {/* ================================================= */}
          {/* GREEN LEAVES */}
          {/* ================================================= */}

          <g
            className="green-leaf"
            fill="none"
            stroke="url(#greenGradient)"
            strokeWidth="7"
            strokeLinecap="round"
            filter="url(#glow)"
          >

            <path
              className="grow"
              d="M245 620 C205 555 145 490 120 370"
            />

            <path
              className="grow"
              d="M255 620 C295 555 355 490 380 370"
            />

            <path
              className="grow"
              d="M240 615 C190 545 175 470 175 330"
            />

            <path
              className="grow"
              d="M260 615 C310 545 325 470 325 330"
            />

            <path
              className="grow"
              d="M230 615 C170 550 115 510 95 430"
            />

            <path
              className="grow"
              d="M270 615 C330 550 385 510 405 430"
            />

          </g>

          {/* ================================================= */}
          {/* PURPLE STEMS */}
          {/* ================================================= */}

          <g
            className="purple-stem"
            fill="none"
            stroke="url(#purpleGradient)"
            strokeWidth="6"
            strokeLinecap="round"
            filter="url(#glow)"
          >

            <path
              className="grow"
              d="M250 620 C235 530 220 450 205 300"
            />

            <path
              className="grow"
              d="M250 620 C260 525 275 420 295 270"
            />

            <path
              className="grow"
              d="M250 620 C220 540 185 450 160 340"
            />

            <path
              className="grow"
              d="M250 620 C285 535 330 445 350 325"
            />

          </g>

          {/* ================================================= */}
          {/* PINK STEMS */}
          {/* ================================================= */}

          <g
            className="pink-stem"
            fill="none"
            stroke="url(#pinkGradient)"
            strokeWidth="5"
            strokeLinecap="round"
            filter="url(#glow)"
          >

            <path
              className="grow"
              d="M250 620 C250 520 250 420 250 245"
            />

            <path
              className="grow"
              d="M250 620 C280 535 305 445 325 300"
            />

          </g>

          {/* ================================================= */}
          {/* SMALL FLOWERS */}
          {/* ================================================= */}

          <g
            className="small-flower"
            fill="none"
            stroke="#62eaff"
            strokeWidth="3"
            filter="url(#glow)"
          >

            <circle cx="145" cy="455" r="11" />
            <circle cx="165" cy="430" r="10" />
            <circle cx="340" cy="450" r="11" />
            <circle cx="360" cy="425" r="10" />
            <circle cx="190" cy="490" r="9" />
            <circle cx="310" cy="480" r="9" />

          </g>

          {/* ================================================= */}
          {/* FLOWER 1 */}
          {/* ================================================= */}

          <g className="flower">

            <g
              className="flower-petal"
              fill="url(#flowerGradient)"
              filter="url(#glow)"
            >

              <ellipse
                cx="160"
                cy="335"
                rx="15"
                ry="42"
                transform="rotate(-35 160 335)"
              />

              <ellipse
                cx="160"
                cy="335"
                rx="15"
                ry="42"
                transform="rotate(35 160 335)"
              />

              <ellipse
                cx="160"
                cy="335"
                rx="15"
                ry="42"
                transform="rotate(90 160 335)"
              />

              <ellipse
                cx="160"
                cy="335"
                rx="15"
                ry="42"
                transform="rotate(145 160 335)"
              />

            </g>

            <circle
              cx="160"
              cy="335"
              r="11"
              fill="#fff"
              filter="url(#glow)"
            />

          </g>

          {/* ================================================= */}
          {/* FLOWER 2 */}
          {/* ================================================= */}

          <g className="flower">

            <g
              className="flower-petal"
              fill="url(#flowerGradient)"
              filter="url(#glow)"
            >

              <ellipse
                cx="205"
                cy="300"
                rx="16"
                ry="45"
                transform="rotate(-35 205 300)"
              />

              <ellipse
                cx="205"
                cy="300"
                rx="16"
                ry="45"
                transform="rotate(35 205 300)"
              />

              <ellipse
                cx="205"
                cy="300"
                rx="16"
                ry="45"
                transform="rotate(90 205 300)"
              />

              <ellipse
                cx="205"
                cy="300"
                rx="16"
                ry="45"
                transform="rotate(145 205 300)"
              />

            </g>

            <circle
              cx="205"
              cy="300"
              r="12"
              fill="#ffffff"
              filter="url(#glow)"
            />

          </g>

          {/* ================================================= */}
          {/* CENTER FLOWER */}
          {/* ================================================= */}

          <g className="flower">

            <g
              className="flower-petal"
              fill="url(#flowerGradient)"
              filter="url(#glow)"
            >

              <ellipse
                cx="250"
                cy="245"
                rx="18"
                ry="52"
              />

              <ellipse
                cx="250"
                cy="245"
                rx="18"
                ry="52"
                transform="rotate(45 250 245)"
              />

              <ellipse
                cx="250"
                cy="245"
                rx="18"
                ry="52"
                transform="rotate(90 250 245)"
              />

              <ellipse
                cx="250"
                cy="245"
                rx="18"
                ry="52"
                transform="rotate(135 250 245)"
              />

            </g>

            <circle
              cx="250"
              cy="245"
              r="14"
              fill="#ffffff"
              filter="url(#glow)"
            />

          </g>

          {/* ================================================= */}
          {/* FLOWER 4 */}
          {/* ================================================= */}

          <g className="flower">

            <g
              className="flower-petal"
              fill="url(#flowerGradient)"
              filter="url(#glow)"
            >

              <ellipse
                cx="295"
                cy="300"
                rx="16"
                ry="45"
                transform="rotate(-35 295 300)"
              />

              <ellipse
                cx="295"
                cy="300"
                rx="16"
                ry="45"
                transform="rotate(35 295 300)"
              />

              <ellipse
                cx="295"
                cy="300"
                rx="16"
                ry="45"
                transform="rotate(90 295 300)"
              />

              <ellipse
                cx="295"
                cy="300"
                rx="16"
                ry="45"
                transform="rotate(145 295 300)"
              />

            </g>

            <circle
              cx="295"
              cy="300"
              r="12"
              fill="#ffffff"
              filter="url(#glow)"
            />

          </g>

          {/* ================================================= */}
          {/* FLOWER 5 */}
          {/* ================================================= */}

          <g className="flower">

            <g
              className="flower-petal"
              fill="url(#flowerGradient)"
              filter="url(#glow)"
            >

              <ellipse
                cx="350"
                cy="325"
                rx="15"
                ry="42"
                transform="rotate(-35 350 325)"
              />

              <ellipse
                cx="350"
                cy="325"
                rx="15"
                ry="42"
                transform="rotate(35 350 325)"
              />

              <ellipse
                cx="350"
                cy="325"
                rx="15"
                ry="42"
                transform="rotate(90 350 325)"
              />

              <ellipse
                cx="350"
                cy="325"
                rx="15"
                ry="42"
                transform="rotate(145 350 325)"
              />

            </g>

            <circle
              cx="350"
              cy="325"
              r="11"
              fill="#ffffff"
              filter="url(#glow)"
            />

          </g>

        </svg>
      </div>
    </div>
  );
}