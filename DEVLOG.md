# HDR Website Dev — Creative Enhancement Log

## Session 1 — 2026-03-26 (Opus 4.6)

### What I Did: Animated SVG Timeline Icons — "The Repair Journey"

**Focus:** Transformed the "How It Works" process timeline from generic Material Symbols icons into custom animated SVG illustrations that draw in on scroll.

**Changes:**
- **5 custom SVG icons** replacing Material Symbols in timeline dots:
  1. **Chat bubble** — draws in with stroke animation, then shows animated typing dots (three pulsing circles)
  2. **Magnifying glass** — lens circle draws, handle extends, then a scanning pulse radiates inside
  3. **Checkmark in circle** — circle draws, then checkmark sweeps in
  4. **Wrench** — full wrench path draws in with repair sparks that pop off (using CSS custom properties for spark trajectories)
  5. **Shield with check** — shield outline draws, checkmark fills in (green for warranty step)

- **Ripple effect** on each timeline dot when it enters viewport (expands and fades out)

- **Glow dot** that tracks the timeline fill line as you scroll — a glowing accent-colored dot that follows the leading edge of the fill

- **Staggered content reveal** — timeline text content slides in from the right with staggered delays per step

- **Hover micro-interactions** — dots scale up with enhanced glow on hover

- **Full prefers-reduced-motion support** — all animations disabled for users who request it

- **Dark + light mode tested** — works in both themes

- **Mobile responsive** — tested at 375px viewport, dots scale down properly

**Files changed:**
- `index.html` — replaced Material Symbols in timeline dots with inline SVGs + ripple divs
- `style.css` — added ~200 lines of animation CSS (draw-in, typing, scanning, sparks, ripple, glow)
- `main.js` — enhanced timeline fill tracking with glow dot positioning

**What's Next (Ideas for Future Sessions):**
- Parallax scrolling on the hero section background elements
- Animated SVG device illustrations (exploded phone view) for the services cards
- CSS-only animated tool icons on the service cards (wrench spinning, screen glowing)
- Interactive before/after slider for repair photos
- Text scramble effect on section headlines as they enter viewport
- Custom scrollbar styling to match the theme
- Floating mountain particles in the hero (themed to Hailey/Sun Valley)
- Enhanced dark mode with subtle noise/grain texture overlay
- Scroll-triggered counter animation for stats (response time, repairs done, etc.)

---

## Session 2 — 2026-03-26 (Opus 4.6)

### What I Did: Magnetic Buttons + Cursor-Tracking Card Glow + Icon Pop

**Focus:** Premium micro-interactions on the hero CTA buttons and service cards — the two most important conversion areas of the page.

**Changes:**

#### Magnetic Buttons (Hero CTAs)
- Hero "Get a Free Quote" and "See Services" buttons now **magnetically pull toward the cursor** when within 80px radius
- Inner content has a **counter-shift rubber-band effect** (moves 30% of the button's displacement) for a satisfying fluid feel
- On cursor leave, button **springs back** with a bouncy easing curve (`cubic-bezier(0.175, 0.885, 0.32, 1.275)`)
- Inner content automatically wrapped in a `<span class="btn-magnetic-inner">` by JS for the counter-shift
- Only activates on **pointer/hover devices** — disabled on touch to avoid weird mobile behavior

#### Cursor-Tracking Card Glow (Service Cards)
- Each service card has a **radial gradient spotlight** that follows the mouse cursor position
- Uses CSS `::after` pseudo-element with `radial-gradient` centered at `var(--glow-x) var(--glow-y)`
- Border color shifts to accent blue when cursor is over the card
- Highlight card (Mail-In) gets a **brighter spotlight** (12% vs 8% opacity)
- Light mode has a **softer glow** (6% opacity) to match the lighter background

#### Icon Pop Animation
- Card icons **lift and scale** (`translateY(-3px) scale(1.08)`) on hover with a bouncy spring curve
- Each icon color variant gets a **matching colored box-shadow** glow (blue, green, purple, orange, cyan, red, indigo)
- Also triggers on `focus-within` for keyboard accessibility

#### Card Link Arrow Enhancement
- Card link gap **expands** from 0.3rem to 0.6rem on hover
- Arrow icon does a **subtle bounce animation** (translateX 4px → 7px → 4px) that loops, drawing the eye

#### Feature Checkmark Stagger
- Card feature list items **slide in from the left** with 100ms stagger delays
- Only animates on first appearance (IntersectionObserver `data-animate` integration)

**Technical notes:**
- All effects use `requestAnimationFrame` throttling to prevent layout thrashing
- Magnetic buttons use direct `style.transform` for maximum browser compatibility
- Card glow uses CSS custom properties for the position (set by JS, read by CSS)
- Full `prefers-reduced-motion` support — all animations disabled
- Touch-only devices get no hover effects (checked via `pointer: fine` or `hover: hover` media queries)

**Files changed:**
- `index.html` — added `data-magnetic` to hero CTAs, `data-card-glow` to all 8 service cards
- `style.css` — added ~150 lines: magnetic button styles, card glow spotlight, icon pop, arrow bounce, checkmark stagger, reduced motion overrides
- `main.js` — added ~80 lines: magnetic button IIFE with proximity detection, card glow cursor-tracking IIFE

**Tested:** Dark mode, light mode, desktop (1024px), tablet (800px), mobile (375px). Zero console errors.

**What's Next (Ideas for Session 3+):**
- Parallax scrolling on the hero section background elements
- Animated SVG device illustrations (exploded phone view)
- Enhanced dark mode with subtle noise/grain texture overlay
- Custom scrollbar styling to match the theme
- Floating mountain/tech particles in the hero
- Scroll-triggered counter animation for stats
- Interactive before/after slider for repair photos

---

## Session 3 — 2026-03-26 (Opus 4.6)

### What I Did: Text Scramble Reveal — Cipher Decode on Section Headlines

**Focus:** Premium "cipher decode" text effect on all 10 section titles. When a headline scrolls into view, its characters scramble through random glyphs (letters, numbers, symbols) before resolving left-to-right, character by character — like a hacking terminal or a cipher being cracked in real-time.

**How it works:**
1. Each `[data-scramble]` element starts at `opacity: 0`
2. IntersectionObserver fires when 30% of the element enters viewport
3. Text nodes are mapped (preserving `<br>`, `<span>`, and other child elements)
4. All characters are replaced with random glyphs from the set `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*!?+=<>`
5. Characters resolve left-to-right: each position cycles through 3 random characters (at 25ms intervals) before locking to its real value
6. Spaces are preserved (never scrambled) so word boundaries stay recognizable
7. Total effect duration scales with text length — ~1.5-2 seconds for typical headlines

**Visual enhancements:**
- **Dark mode glow:** During scramble, text gets a subtle blue `text-shadow` (`rgba(79, 142, 247, 0.3)`) that fades out when complete
- **Light mode:** No glow (clean look), just the character cycling
- **Transition:** `text-shadow` smoothly fades out over 0.5s when scramble completes

**Accessibility:**
- `aria-label` set to the real text content during scramble, removed after completion
- `prefers-reduced-motion: reduce` — text shows immediately, no scramble
- Works with screen readers throughout

**Integration notes:**
- Elements with BOTH `data-animate` AND `data-scramble` (2 of 10) have CSS overrides so scramble controls opacity instead of the fade-in
- The scramble IntersectionObserver is separate from the existing `[data-animate]` observer
- Complex HTML structures preserved — the mail-in title `No repair shop nearby?<br><span class="text-accent">I'll come to your mailbox.</span>` scrambles correctly with both text nodes animated independently

**Files changed:**
- `index.html` — added `data-scramble` to all 10 `.section-title` elements
- `style.css` — added ~45 lines: scramble visibility states, dark mode glow, data-animate override, reduced motion fallback
- `main.js` — added ~130 lines: text scramble IIFE with `mapTextNodes`, `buildCharMap`, character-by-character resolution, and IntersectionObserver trigger

**Tested:** Dark mode (with blue glow), light mode, desktop (800px), mobile (375px). Complex HTML (br + span) preserved. Zero console errors.

**What's Next (Ideas for Session 4+):**
- Parallax scrolling on the hero section background elements
- Animated SVG device illustrations (exploded phone view)
- Floating mountain/tech particles in the hero
- Scroll-triggered counter animation for stats
- Interactive before/after slider for repair photos
- Easter egg: Konami code or click-the-mountain interaction

---

## Session 4 — 2026-03-26 (Opus 4.6)

### What I Did: Custom Scrollbar + Noise Texture + Mountain Silhouette + Wave Dividers

**Focus:** Premium ambient polish — the kind of details that make a site feel expensive and intentional. Three features that affect the entire page feel:

**1. Custom Scrollbar (WebKit + Firefox)**
- Scrollbar thumb uses accent blue with transparency (35% dark, 30% light)
- Thumb brightens on hover (60% dark, 55% light)
- Track is nearly invisible (3% white in dark, 4% black in light)
- Thumb has rounded corners with a transparent border for padding
- Firefox: `scrollbar-width: thin; scrollbar-color` for native support
- WebKit: `::-webkit-scrollbar`, `::-webkit-scrollbar-thumb`, etc.
- Theme-aware via CSS custom properties (`--scrollbar-thumb`, `--scrollbar-track`, `--scrollbar-thumb-hover`)

**2. Noise/Grain Texture Overlay**
- SVG `feTurbulence` noise filter rendered as a tiling background
- Dedicated `.noise-overlay` div (fixed, inset 0, z-index 9998, pointer-events: none)
- Dark mode: 2.8% opacity, `mix-blend-mode: overlay` — adds subtle film grain texture
- Light mode: 2% opacity, `mix-blend-mode: soft-light` — barely there, just enough to prevent flat backgrounds
- Uses inline data URI SVG for zero extra HTTP requests
- Doesn't block interactions (pointer-events: none)

**3. Mountain Silhouette (Hero Section)**
- Layered SVG mountain range at the bottom of the hero section
- Two paths: back range (4% opacity) and front range (7% opacity) — subtle depth effect
- References the Hailey/Sun Valley mountain landscape
- Light mode gets slightly lighter fills (3% and 5%)
- Anchored to bottom of hero, full width, 120px tall

**4. Additional Wave Dividers**
- Added wave divider before mail-in section (process → mail-in transition) — flip variant
- Added wave divider before FAQ section (compare → FAQ transition) — mountain variant with different curve
- Now 3 total wave dividers creating organic transitions between background changes
- Each uses a different SVG path for visual variety

**5. Section Depth Gradients**
- `section--alt::before` adds a 120px linear-gradient at the top of alternating sections
- Dark mode: `rgba(0,0,0,0.04)` fade — subtle darkening at section start
- Light mode: `rgba(0,0,0,0.015)` — barely perceptible

**Files changed:**
- `index.html` — added `.noise-overlay` div, `.hero-mountains` SVG, 2 new `.wave-divider` elements
- `style.css` — added ~120 lines: scrollbar styles, noise overlay, mountain silhouette, wave variants, section depth gradients, reduced motion fallback

**Tested:** Dark mode, light mode, desktop (1024px, 800px), mobile (375px). Zero console errors. All pointer events pass through noise overlay.

**What's Next (Ideas for Session 5+):**
- Parallax scrolling on the hero background elements
- Animated SVG device illustrations (exploded phone view)
- Scroll-triggered counter animation for stats
- Interactive before/after slider for repair photos
- Easter egg: Konami code or click-the-mountain interaction
- Animated service card icons (wrench spinning, screen pulsing)

---

## Session 5 — 2026-03-26 (Opus 4.6)

### What I Did: Enhanced Tech Particles — Repair Sparks & Circuit Dust

**Focus:** Replaced the basic floating dot particles in the hero with a rich, multi-type particle system themed to device repair — dust motes, circuit traces, screw-head crosses, and bright accent sparks.

**Particle types (4 variants, weighted random distribution):**
1. **Dots (50% weight)** — Tiny dust motes (2-5px), low opacity (6-18%), slow drift upward (10-22s). The ambient base layer.
2. **Sparks (15% weight)** — Brighter accent-colored particles (2-4px), higher opacity (20-50%), faster (4-8s). Have a subtle `box-shadow` glow that pulses with the animation. Like soldering iron sparks.
3. **Crosses (20% weight)** — Plus-sign shapes (5-9px) using `::before` / `::after` pseudo-elements. Subtle nod to screwdriver/phillips head. Rotate as they drift.
4. **Lines (15% weight)** — Short circuit-trace segments (12-28px × 1.5px). Scale in/out as they drift, like electricity arcing briefly. Random rotation angles.

**Motion system:**
- Each particle gets unique CSS custom properties: `--p-drift-y` (vertical travel), `--p-sway` (horizontal wander), `--p-rotate` (spin), `--p-opacity` (max visibility)
- 3 distinct keyframe animations: `particleDrift` (dots/crosses), `particleSpark` (sparks with scale pulse), `particleLine` (traces that scale in then fade)
- Spawned in the bottom 60% of the hero, spread across full width
- Animation delays staggered up to 15 seconds so particles enter at different times

**Mouse parallax:**
- On pointer devices, the entire particle container shifts opposite to cursor position (8px horizontal, 6px vertical)
- Creates depth perception — particles feel like they're on a different plane than the hero text
- Uses `requestAnimationFrame` throttling
- Disabled on touch-only devices

**Technical notes:**
- 35 particles total (4% of page DOM) — lightweight
- All motion via CSS `@keyframes` animations (GPU-accelerated transform + opacity)
- No JS animation loop — particles are created once, CSS handles everything
- Full `prefers-reduced-motion` support via existing `.hero-particles { display: none }` rule
- `will-change: transform, opacity` on each particle for compositor hints

**Files changed:**
- `style.css` — replaced simple `particleFloat` keyframe with 4 particle type styles + 3 animation keyframes (~80 lines net change)
- `main.js` — replaced 12-line particle loop with ~65-line weighted type system + mouse parallax

**Tested:** Dark mode, light mode, desktop (1024px, 800px), mobile (375px). Zero console errors. No parallax on touch devices.

**What's Next (Ideas for Session 6+):**
- Parallax scrolling on the hero background glow blobs
- Animated SVG device illustrations (exploded phone view)
- Scroll-triggered counter animation for stats
- Interactive before/after slider for repair photos
- Hero scroll-to reveal: content unfolds as you scroll down

---

## Session 6 — 2026-03-27 (Opus 4.6)

### What I Did: Service Card Icon Animations + Konami Code Easter Egg

**Focus:** Two features — (1) unique entrance animations for each service card icon that match their meaning, and (2) a fun Konami code Easter egg.

**1. Service Card Icon Entrance Animations**

Each of the 8 service card icons now has a unique entrance animation triggered by IntersectionObserver as the card scrolls into view:

| Card | Animation | Why |
|------|-----------|-----|
| iPhone & iPad | `slide-up` | Phone rising from pocket |
| Android Phones | `spin-in` | Android robot head spinning |
| Laptop & PC | `flip-open` | Laptop lid opening (rotateX) |
| iPad & Tablet | `scale-up` | Zooming in on screen |
| Game Consoles | `bounce-in` | Playful gaming bounce (multi-step) |
| Diagnostics | `pulse` | Magnifying glass pulsing/scanning |
| Tune-ups | `spin-in` | Speedometer needle spinning |
| Mail-In Repair | `slide-right` | Delivery truck sliding in |

**Technical implementation:**
- `data-icon-anim="type"` attribute on each `.card-icon`
- Icons start at `opacity: 0; transform: translateY(12px)` (hidden)
- IntersectionObserver with `threshold: 0.2` triggers animation
- Stagger: 120ms between each card for a satisfying wave effect
- Uses `WeakMap` to track stagger count per parent container
- 6 unique `@keyframes` animations with spring-curve easings (`cubic-bezier(0.34, 1.56, 0.64, 1)`)
- After animation: `.icon-animated` class locks the icon at full opacity
- Reduced motion: icons show immediately, no animation

**2. Konami Code Easter Egg (↑↑↓↓←→←→BA)**

Enter the classic Konami code on any page and you get:
- **CRT scanlines overlay** — horizontal lines across the viewport (repeating-linear-gradient)
- **Vignette effect** — edges darken via radial-gradient
- **Subtle green tint** — CRT monitor phosphor color via rgba overlay
- **Toast notification** — centered popup with retro green-on-black styling, glowing border and text-shadow: "🕹️ KONAMI CODE! You found the secret. Samuel fixes devices like a boss."
- **Chromatic aberration** — hero headline briefly flickers with red/cyan offset
- **Crosshair cursor** — entire page uses crosshair during arcade mode

**Auto-dismiss:** Effect lasts 4.5 seconds, then gracefully fades out. Can be re-triggered after full reset.

**Technical notes:**
- Overlay and toast appended to `document.documentElement` (not body) to avoid fixed-positioning containment issues from body's `overflow-x: hidden`
- Toast uses `position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%)`
- Overlay has `pointer-events: none` so the page remains interactive
- Toast has `role="alert"` for accessibility
- Elements created dynamically (no HTML changes needed for Easter egg)

**Files changed:**
- `index.html` — added `data-icon-anim` to all 8 service card icon divs
- `style.css` — added ~160 lines: 6 icon keyframe animations, arcade mode overlay + toast styles, CRT effects, reduced motion overrides
- `main.js` — added ~90 lines: icon animation IntersectionObserver with stagger, Konami code listener with key sequence tracking and arcade mode activation

**Tested:** Dark mode, light mode, desktop (1024px). Icon animations stagger correctly. Konami code triggers/dismisses properly. Toast centers on viewport. Zero console errors.

**What's Next (Ideas for Session 7+):**
- Parallax scrolling on the hero background glow blobs
- Animated SVG device illustrations (exploded phone view)
- Scroll-triggered counter animation for stats
- Interactive before/after slider for repair photos
- Hero scroll-to reveal: content unfolds as you scroll down
- Service page enhancements (not just index.html)
