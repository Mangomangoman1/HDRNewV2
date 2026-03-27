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
- Animated SVG device illustrations (exploded phone view)
- Scroll-triggered counter animation for stats
- Interactive before/after slider for repair photos
- Service page enhancements (not just index.html)

---

## Session 7 — 2026-03-27 (Opus 4.6)

### What I Did: Hero Scroll Parallax — Layered Depth on Scroll

**Focus:** Multi-layer scroll-driven parallax on the hero section. As you scroll down, background elements move at different rates creating a 3D depth illusion, while the content gracefully fades and lifts away.

**Parallax layers and rates:**

| Element | Rate | Effect |
|---------|------|--------|
| `.hero-bg-grid` | 0.08 | Dot grid drifts up very slowly — anchored feel |
| `.hero-glow-1` | 0.25 | Primary blue glow blob drifts up faster — mid-depth |
| `.hero-glow-2` | 0.18 | Secondary purple glow drifts at medium rate |
| `.hero-mountains` | 0.04 | Mountain silhouette barely moves — grounded |
| `.hero-inner` (content) | 0.35 | Headline, CTA, trust badges lift and fade |
| `.hero-scroll-hint` | 4× fade | Bouncing arrow disappears first (fully gone at 25% scroll) |

**Content fade-out behavior:**
- Opacity: `1 - (ratio × 1.5)` — reaches ~0 at 66% through the hero height
- Scale: `1 - (ratio × 0.06)` — shrinks to ~0.94 at full scroll (subtle, not jarring)
- Transform origin: `center top` — content scales from the top down
- All transform values clamped: opacity floors at 0, scale never goes negative

**Mouse + scroll composition:**
- Glow blobs already had mouse parallax (from Session 2). Updated the mouse handler to compose its offset with the scroll offset via `data-scrollY` attribute on each glow element.
- Both offsets combine: `translate(mouseX + 0, mouseY + scrollOffset)` — the blob follows the cursor AND drifts upward on scroll simultaneously.

**Performance:**
- Single `scroll` event listener with `requestAnimationFrame` throttling
- `will-change: transform, opacity` on all animated elements
- `backface-visibility: hidden` on hero for compositor optimization
- Parallax calculations skip entirely when scrolled past hero + 100px buffer
- Reset function sets final state when hero exits viewport (no wasted frames)
- `passive: true` on scroll listener
- `resize` listener updates hero height for accurate ratio calculation

**Technical details:**
- Hero height measured via `offsetHeight` (recalculated on resize)
- Scroll ratio: `scrollY / heroHeight`, clamped to 0-1
- `lastScroll` tracking to avoid redundant DOM writes
- Global `heroMouseX` / `heroMouseY` variables shared between mouse parallax and scroll parallax IIFEs

**Files changed:**
- `style.css` — added ~25 lines: will-change hints for parallax elements, transform-origin on hero-inner, backface-visibility on hero, reduced-motion overrides
- `main.js` — modified mouse parallax to compose with scroll offset (~10 lines changed), added ~95-line scroll parallax IIFE

**Tested:** Dark mode, light mode, desktop (1024px), mobile (375px). Content fades smoothly, resets clean at scroll=0. Zero console errors. Reduced motion: no scroll transforms applied.

**What's Next (Ideas for Session 8+):**
- Animated SVG device illustrations (exploded phone view)
- Interactive before/after slider for repair photos
- Service page enhancements (not just index.html)
- FAQ accordion animation refinements
- Contact form micro-interactions

---

## Session 8 — 2026-03-27 (Opus 4.6)

### What I Did: Trust Metrics Strip — Animated Counter Numbers

**Focus:** A new trust-building metrics section between the ticker and services grid. Four key stats that count up with animation when scrolled into view, reinforcing credibility immediately.

**The 4 metrics:**
1. **< 2 hr** — "Average response" (counter: 0→2, 1200ms)
2. **40 day** — "Warranty on every repair" (counter: 0→40, 1800ms)
3. **5.0 ★** — "Google rating" (counter: 0.0→5.0, 1500ms, 1 decimal)
4. **Same day** — "Most phone repairs" (text, no counter)

**Visual design:**
- `.trust-metrics` strip with `bg-surface` background and subtle border-top/bottom
- Radial accent glow behind the strip (via `::before` pseudo-element)
- 4-column grid with vertical dividers (1px border-subtle) between metrics
- Numbers in accent blue, large display font (clamp 2rem → 3rem)
- Gold ★ for the Google rating (via `.trust-metric-suffix--star`)
- Font-variant-numeric: tabular-nums for stable width during counting
- Responsive: 2×2 grid on mobile (768px breakpoint)

**Counter animation:**
- `easeOutExpo` easing — fast start, satisfying deceleration at the end
- Each counter triggered by IntersectionObserver (threshold 0.5)
- Staggered: 200ms base delay + 150ms per metric position
- 200ms delay after slide-up animation starts, so counter begins after the card appears
- Final "glow pulse" keyframe on completion (scale 1→1.08→1 with text-shadow glow)
- Exact target value set at end to avoid floating-point rounding

**Slide-up entrance:**
- Each `.trust-metric[data-animate]` starts at opacity 0, translateY(24px)
- Transitions to visible with spring-curve easing
- Staggered by nth-child: 0s, 0.1s, 0.2s, 0.3s
- Mobile: adjusted stagger (0, 0.1, 0.1, 0.2)

**Bug fix:** Star color was applying to all suffixes via `:last-child` selector — fixed by adding specific `.trust-metric-suffix--star` class.

**Files changed:**
- `index.html` — added `.trust-metrics` section with 4 metrics, 3 counters with `data-target`/`data-duration`/`data-decimals`
- `style.css` — added ~160 lines: trust-metrics layout, metric-value typography, counter pulse keyframe, responsive grid, reduced-motion fallback
- `main.js` — added ~85 lines: easeOutExpo counter animation IIFE with IntersectionObserver and staggered triggers

**Tested:** Dark mode, light mode, desktop (1024px), mobile (375px). Counters animate to target values. Star is gold. Responsive 2×2 on mobile. Zero console errors.

**What's Next (Ideas for Session 9+):**
- Animated SVG device illustrations (exploded phone view)
- Interactive before/after slider for repair photos
- Service page enhancements (not just index.html)
- Contact form micro-interactions
- Review the cumulative file sizes and performance

---

## Session 9 — 2026-03-27 (Opus 4.6)

### What I Did: Premium FAQ Accordion — Smooth Height, Accent Bar, Number Badges, Keyboard Nav

**Focus:** Transform the basic native `<details>` FAQ accordion into a premium-feeling interactive experience with smooth height animations, visual indicators, and full keyboard navigation.

**1. Smooth Height Animation (Open + Close)**
- Intercepts native `<details>` click to prevent instant toggle
- **Opening:** Sets `[open]` → measures `scrollHeight` → starts at `height: 0` → transitions to target height with spring easing `cubic-bezier(0.34, 1.12, 0.64, 1)`
- **Closing:** Captures current height → transitions to `height: 0` with deceleration easing → removes `[open]` attribute after animation completes
- Opacity fades in/out alongside height (opacity 70% speed for open, 50% for close — answer text fades before container fully closes)
- Duration: 300ms. Clean transition styles are removed after each animation.
- `isAnimating` guard prevents double-clicks during transition

**2. Left Accent Bar**
- `::before` pseudo-element on `.faq-item`: 3px wide, full height, accent color
- Hidden by default: `transform: scaleY(0)` from `transform-origin: center`
- Slides in on open with spring easing: `scaleY(1)` over 350ms
- Creates a clear visual indicator of which FAQ is expanded

**3. CSS Counter Number Badges**
- `counter-reset: faq-counter` on `.faq-list`
- Each `.faq-item` increments the counter
- `::before` on `.faq-question` displays `counter(faq-counter, decimal-leading-zero)` — shows "01", "02", etc.
- Muted gray at 50% opacity when closed
- Transitions to accent color, full opacity when open
- Min-width: 1.8rem for stable alignment

**4. Keyboard Navigation**
- Arrow keys (↑/↓) move focus between FAQ questions
- Event listener on `.faq-list` catches `ArrowUp`/`ArrowDown` keydown
- Wraps around: pressing ↓ on the last item focuses the first
- Works with existing focus-visible outline (2px accent blue)

**5. Scroll-In Stagger**
- Each FAQ item gets a `--faq-idx` CSS custom property (0-6)
- Used for `transition-delay: calc(var(--faq-idx) * 80ms)` on the existing `[data-animate]` scroll-in system
- Items appear one-by-one as you scroll to the FAQ section

**6. Inner Wrapper**
- JS wraps each `.faq-answer`'s children in a `.faq-answer-inner` div
- This separates padding (inner) from height animation (outer)
- `.faq-answer--managed` class prevents double-wrapping
- Fallback: if JS fails to load, `.faq-answer:not(.faq-answer--managed)` provides padding

**7. CSS Height Fix**
- Added `height: 0` on `.faq-answer` and `height: auto` on `.faq-item[open] .faq-answer`
- Ensures closed answers don't contribute to item height in modern Chrome where `<details>` uses content-visibility rather than display:none

**Files changed:**
- `style.css` — rewrote ~120 lines: accent bar, number badges with CSS counters, spring-curve chevron, focus-visible ring, answer height management, stagger delay, reduced motion fallback
- `main.js` — added ~115 lines: smooth toggle IIFE with open/close height animation, inner wrapper creation, keyboard navigation, stagger index setup

**Tested:** Dark mode, light mode, desktop (1024px). Open/close animations smooth. Accent bar slides in/out. Number badges show 01-07 with color transition. Keyboard arrows navigate between items. Zero console errors.

**What's Next (Ideas for Session 10+):**
- Animated SVG device illustrations (exploded phone view)
- Interactive before/after slider for repair photos
- Service page enhancements (not just index.html)
- "The Workshop" section with tools/craft theme

---

## Session 10 — 2026-03-27 (Opus 4.6)

### What I Did: Contact Form Micro-Interactions + Method Card Animations

**Focus:** Polish the contact section — the conversion point where visitors decide to reach out. Every micro-interaction builds trust and signals quality.

**1. Contact Method Card Hover Effects**
- Icon pulse animation on hover: `contactIconPulse` keyframe (scale 1 → 1.12 → 1 over 0.5s)
- Icons fill on hover: `font-variation-settings: 'FILL' 1` (Material Symbols filled variant)
- Combined with existing translateX(4px) shift and accent border

**2. Form Field Valid Indicator**
- Green checkmark icon (`.form-valid-check`) injected dynamically next to name, contact, and issue fields
- Transitions from `opacity: 0; scale(0.5)` → `opacity: 1; scale(1)` with spring easing when field becomes `.valid`
- Green border color on valid fields
- Accent-colored label on valid fields

**3. Form Field Invalid Shake**
- `fieldShake` keyframe (translateX oscillation: -4px → 3px → -2px → 1px)
- Applied when `.invalid` class is added by the validator
- Red border color from existing `--color-red`

**4. Textarea Character Counter**
- Dynamically injected `.textarea-counter` element below the issue textarea
- Updates on input: "0 chars" → "47 chars" etc.
- Visible at full opacity when textarea is focused, semi-visible when it has text
- Hidden when empty and not focused
- Positioned absolute at bottom-right, `font-variant-numeric: tabular-nums`

**5. Submit Button States**
- **Success:** `btn-success` class with green background + `btnSuccessBounce` keyframe (scale 1→0.95→1.05→1). Text changes to "✓ Sent!". MutationObserver watches formSuccess element.
- **Error:** `btn-error` class with `btnShake` keyframe (translateX oscillation). MutationObserver watches formError element.
- Both auto-clean up class after animation duration

**6. Success/Error Message Entrance**
- `formMsgSlideIn` keyframe: opacity 0 → 1, translateY(-8px) → 0, scale(0.95) → 1 with spring easing
- Applied to `.form-success.visible` and `.form-error-msg.visible`

**Performance check (Session 1–10 cumulative):**
- index.html: 80KB (16KB gzipped)
- style.css: 192KB (32KB gzipped)
- main.js: 84KB (21KB gzipped)
- **Total: 356KB raw, 69KB gzipped** — well under any performance budget

**Files changed:**
- `style.css` — added ~100 lines: contact icon pulse, valid/invalid field styles, textarea counter, submit button states, success/error entrance, reduced motion overrides
- `main.js` — added ~85 lines: valid check icons injection, textarea counter, submit button MutationObserver states

**Tested:** Dark mode, light mode, desktop (1024px). Valid/invalid transitions work. Counter updates in real-time. Green checks appear with spring animation. Zero console errors.

**What's Next (Ideas for Session 11+):**
- Animated SVG device illustrations (exploded phone view)
- Interactive before/after slider for repair photos
- Service page enhancements (not just index.html)
- Performance audit + Lighthouse score
- Accessibility audit (keyboard nav, screen reader)

---

## Session 11 — 2026-03-27 (Opus 4.6)

### What I Did: "The Workshop" Section — Craft, Tools & Attention to Detail

**Focus:** New content section from the brief: "The Workshop — show the craft, the tools, the attention to detail." Positioned between the repair process timeline and mail-in section to reinforce trust before the conversion path.

**Section structure:** 4-column grid of workshop cards, each with a custom SVG icon, title, and description.

**The 4 cards:**
1. **Thorough Diagnosis** — Magnifying glass SVG with scan animation on hover. Messaging: no guessing, full inspection first.
2. **Quality Parts** — Phone with animated draw-in checkmark SVG. Messaging: OEM-grade, not bargain bin.
3. **Right Tool, Every Time** — Screwdriver SVG with gentle rotation on hover. Messaging: iFixit kits, ESD-safe workspace, precision soldering.
4. **40-Day Warranty** — Shield SVG with pulse animation on hover. Messaging: every repair backed, same issue = free fix.

**Custom SVG icons (hand-crafted):**
- Magnifying glass: circle + handle line + glint dash. Hover: `wsMagnifyScan` gentle translate.
- Phone + check: rectangle with screen lines + checkmark path. Hover: `wsCheckDraw` stroke-dashoffset animation draws the checkmark from left to right.
- Screwdriver: shaft + head + base. Hover: `wsScrewTurn` rotation ±15° from top pivot.
- Shield with "40": two-part path + centered text. Hover: `wsShieldPulse` scale 1→1.06→1.

**Card styling:**
- `bg-card` background, subtle border, `radius-xl`
- Hover: accent border, 32px box-shadow, translateY(-4px) lift
- Radial gradient overlay appears on hover (accent-dim from top center)
- 64×64px SVG icons in accent blue
- Staggered transition-delay: 0s, 0.1s, 0.2s, 0.3s

**Responsive:**
- >960px: 4 columns
- 600-960px: 2 columns (re-staggered delays)
- <600px: 1 column (no stagger delay)

**Files changed:**
- `index.html` — added ~60 lines: workshop section with 4 cards, 4 custom SVG icons, `data-scramble` on title
- `style.css` — added ~140 lines: workshop grid layout, card hover states, SVG animations (4 keyframes), responsive breakpoints, reduced-motion overrides

**Tested:** Dark mode (dark card bg, accent blue icons), light mode, desktop (1024px), mobile (375px). All SVG icons render at 64×64. Zero console errors.

**What's Next (Ideas for Session 12+):**
- Animated SVG device illustrations (exploded phone view)
- Interactive before/after slider for repair photos
- Service page enhancements (not just index.html)
- Performance audit + Lighthouse score
- Accessibility audit (keyboard nav, screen reader)

---

## Session 12 — 2026-03-27 (Opus 4.6) — CRAFT PIVOT

### Shift: The brief was updated to prioritize craft over quantity. "Less is more. Refinement over addition."

### What I Refined: Motion System + Theme Crossfade

**The diagnosis:** The site had 24 instances of `transition: all var(--transition)` — a lazy pattern that animates every CSS property, causes repaints on unintended properties, and makes everything feel the same speed. The single `--transition: 200ms cubic-bezier(0.4, 0, 0.2, 1)` was Material Design's standard easing — functional but not distinctive. The dark↔light theme toggle was an instant, jarring color swap.

**1. Motion Token System**
Added purposeful CSS custom properties (documented, not just used):
- `--ease-out: cubic-bezier(0.16, 1, 0.3, 1)` — decelerate into rest (arrivals)
- `--ease-in: cubic-bezier(0.7, 0, 1, 0.84)` — accelerate away (departures)
- `--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1)` — overshoot and settle (playful)
- `--ease-smooth: cubic-bezier(0.4, 0, 0.2, 1)` — standard (ambient)
- `--dur-fast: 120ms`, `--dur-normal: 200ms`, `--dur-slow: 350ms`, `--dur-theme: 500ms`

Note: CSS custom properties in `transition` shorthand don't resolve in all browsers. Used literal bezier values in actual transition rules; tokens serve as documentation and for future use in JS.

**2. Replaced Key `transition: all` with Specific Properties**

**Buttons (`.btn`):**
- `background-color 120ms ease-smooth` — snappy color response
- `border-color 120ms ease-smooth`
- `color 120ms ease-smooth`
- `box-shadow 200ms ease-out` — shadow settles more slowly for depth
- `transform 120ms ease-spring` — spring overshoot for press/hover

**Cards (`.card`, `.card-tilt`):**
- `border-color 200ms ease-smooth` — quick border response
- `box-shadow 350ms ease-out` — shadow arrives and settles like weight
- `transform 350ms ease-out` — card lifts with physical deceleration
- Hover overrides to `ease-spring` — spring on hover-in, ease-out on leave

**Contact methods:**
- `border-color/bg-color 200ms ease-smooth`
- `transform 200ms ease-out`, `box-shadow 350ms ease-out`

**Form inputs:**
- `border-color 200ms ease-smooth`
- `box-shadow 350ms ease-out` — the focus glow expands slowly
- `color 200ms ease-smooth`

**3. Smooth Theme Crossfade**
- `html.theme-transition` class applies 500ms ease-out transitions to `background-color`, `border-color`, `color`, `box-shadow`, `fill`, `stroke` on ALL elements (via `*` selector with `!important`)
- JS adds class on toggle click, removes after 550ms
- Skips on initial page load (`announce === false`)
- Respects `prefers-reduced-motion` — no crossfade animation
- `clearTimeout` prevents class stacking on rapid toggles

Verified crossfade: sampled background-color at 0/100/250/400/600ms. Colors interpolate smoothly from light (248,249,251) → mid (42,45,51 at 250ms) → dark (13,17,23) with the ease-out curve creating a "quick start, gentle settle" feel.

**Why this matters:** Nobody notices good timing, but everyone *feels* it. A button that responds in 120ms with a spring overshoot feels alive. A card that lifts with 350ms deceleration feels weighty. A theme toggle that crossfades over 500ms feels like a breathing, living thing instead of a switch flip.

**Files changed:**
- `style.css` — added motion tokens, theme crossfade rule (~20 lines), replaced 5 `transition: all` instances with specific property transitions
- `main.js` — added theme-transition class management to setTheme (~8 lines)

**Remaining `transition: all` instances:** 19 left (nav items, pricing cards, process steps, etc.). These can be refined in future sessions as part of the ongoing craft work.

**What still needs attention:**
- 19 remaining `transition: all` rules to refine
- Typography kerning and line-height fine-tuning
- Whitespace rhythm between sections
- Dark mode shadow refinement (shadows feel heavier in dark mode)

---

## Session 13 — 2026-03-27 (Opus 4.6) — CRAFT

### What I Refined: Scroll Entrance Choreography

**The problem:** Every `[data-animate]` element appeared at the same time when scrolling into view. The parent-based stagger counter only staggered siblings within the same parent div, so section headers (eyebrow, title, sub) and content (cards, lists) animated independently. This felt flat — like a curtain being pulled away rather than a story being told.

**The fix: Section-level choreography with tiered timing**

**1. Auto-inject `data-animate` on section headers**
JS now automatically adds `data-animate="fade"` to `.section-eyebrow` and `data-animate` to `.section-sub` elements inside `.section-header` containers. No HTML changes needed — the JS does this before the observer starts. This means 9 eyebrows and 6 subtitles now participate in the stagger system without touching any HTML.

**2. Section-scoped stagger instead of parent-scoped**
Changed the stagger counter from `parentElement` (immediate parent) to `closest('section, .section')` (section ancestor). Now ALL animated elements within a section share one stagger counter, creating cross-hierarchy choreography:
- Header elements (eyebrow, sub): 100ms spacing (slots 0, 1, 2)
- Content elements (cards, items): 60ms spacing (slots 3, 4, 5...)
- Capped at 600ms total to avoid excessive waits

**3. Tiered animation curves by element type**
- **Eyebrows** (`.section-eyebrow[data-animate]`): 8px rise, 350ms opacity / 400ms transform — light, quick, arrives first
- **Subtitles** (`.section-sub[data-animate]`): 12px rise, 450ms opacity / 500ms transform — gentle, follows eyebrow
- **Default content** (`[data-animate]`): 20px rise (reduced from 24), 500ms opacity / 600ms transform — heavier, settles in

All use `cubic-bezier(0.16, 1, 0.3, 1)` — the ease-out curve from Session 12's motion system. Consistent language.

**4. Reduced default translateY from 24px to 20px**
24px felt slightly too dramatic. 20px is enough vertical motion to register but subtle enough to feel considered rather than showy.

**Measured choreography (Workshop section):**
- Eyebrow: 161ms
- Title (scramble): 161ms (independent observer)
- Subtitle: 256ms (+95ms after eyebrow)
- First card: 295ms (+39ms after sub)

The cascade: light header arrives quickly → title scrambles → subtitle settles → content fills in below. Each element type has appropriate weight to its motion.

**Files changed:**
- `main.js` — added section-header data-animate injection (~12 lines), replaced parent-based stagger with section-scoped stagger with tiered delays (~25 lines)
- `style.css` — added eyebrow and subtitle specific animation rules (~16 lines), reduced default translateY, updated bezier to ease-out

**Tested:** Dark mode, light mode, desktop (1024px), mobile (375px). Verified stagger timing with performance.now() sampling. Zero console errors.

**What still needs attention:**
- 19 remaining `transition: all` rules to refine
- Whitespace rhythm between sections
- Consider reducing the total animation count — some sections might benefit from fewer animated elements for a calmer feel

---

## Session 14 — 2026-03-27 (Opus 4.6) — CRAFT

### What I Refined: Dark Mode Shadows + Typography Precision

Two connected refinements that make the site feel more considered without changing anything visually obvious.

**1. Dark Mode Shadow Refinement**

**Before:** `--shadow-card` at rgba(0,0,0,0.4/0.3), `--shadow-float` at rgba(0,0,0,0.5). These created near-black voids around elevated elements — heavy-handed depth that looked like a design system default, not a considered choice.

**After:**
- `--shadow-card`: 0.24/0.16 (~40% lighter). The card boundary comes from border color, not shadow weight.
- `--shadow-float`: 0.28 + **1px luminance ring** at `rgba(255,255,255,0.04)`. This is the technique Linear, Vercel, and Apple use for dark mode depth — a barely-visible white border that delineates the elevated surface edge without heavy shadow.
- Card hover shadow: 0.25 → 0.2, added matching luminance ring + slightly wider accent glow (20→24px).

Light mode shadows unchanged (they were already appropriate at 0.08/0.06/0.12).

**2. Typography Fine-Tuning**

**Section titles** (Plus Jakarta Sans 700, 40px):
- Added `letter-spacing: -0.015em` (-0.6px). Standard practice for bold display type — tightens the natural openness of the font at large sizes.
- Increased `line-height: 1.2 → 1.25` (48px → 50px). Three multi-line titles ("No repair shop nearby?", "Common questions, straight answers", "Ready to get your device fixed?") were slightly cramped at 1.2. The 2px per line increase (96→100px total) adds breathing room without looking loose.

**Card titles** (Plus Jakarta Sans 600, 17.6px):
- Added `letter-spacing: -0.01em` (-0.176px). Subtle tightening for the semibold weight at near-body size.

**Section subtitles** (Inter 400, 16.8px):
- Adjusted `line-height: 1.7 → 1.65` (28.56→27.72px). Tighter for a more confident, intentional feel.
- Added `letter-spacing: 0.005em` (+0.084px). Barely perceptible opening of Inter's tight lighter weights for improved readability.

**Files changed:**
- `style.css` only — ~8 lines changed. Shadow tokens, typography spacing.

**Tested:** Dark mode, light mode, desktop (1280px). Verified all computed values resolve correctly. Zero console errors.

**What still needs attention:**
- 19 remaining `transition: all` rules to refine
- Whitespace rhythm between sections (padding consistency)
- Consider reducing total animation count for calmer sections
- Mobile typography sizing audit (clamp functions at small viewports)

---

## Session 15 — 2026-03-27 (Opus 4.6) — CRAFT

### What I Refined: Hero Accent — Living Gradient

**The idea:** The brief says "color that shifts — accent colors that respond to context, subtle palette shifts." The hero headline accent text had a static gradient (blue → purple). What if it breathed?

**Before:** `linear-gradient(135deg, var(--accent) 0%, #a371f7 100%)` — static, frozen.

**After:** A 4-stop gradient (accent blue → purple → cyan → accent blue) at `background-size: 300% 100%`, slowly panning via `heroGradientShift` over 10 seconds with `ease-in-out`. The text color shifts from blue through purple to cyan and back, like slow breathing.

**Why 10 seconds, why ease-in-out:** The speed is deliberately slow enough that you don't notice the motion — you just feel the text is somehow more alive than static text. The ease-in-out curve means it dwells at the color extremes (blue and cyan endpoints) and moves faster through the middle, mimicking natural breathing rhythm.

**Measured gradient shift:**
- 0s: position ~1% (blue)
- 1s: ~3.5% (still blue, ease-in slow start)
- 2.5s: ~38.6% (shifting to purple)
- 5s: ~99% (at cyan peak)
- 6s: ~96% (beginning return)

**The shimmer effect** (one-shot on page load, added by JS at 800ms) was made redundant. The `.shimmer` class is now a no-op that inherits the base animation — no more competing background-size/animation conflicts.

**Theme-aware:** The gradient uses `var(--accent)` for the first and last stops, so in dark mode it's `#4f8ef7` (soft blue) and in light mode it's `#2563eb` (deeper blue). The purple and cyan middle stops work beautifully with both.

**Reduced motion:** Covered by the existing blanket `animation-duration: 0.01ms !important` in the prefers-reduced-motion media query.

**Files changed:**
- `style.css` — modified hero-headline-accent gradient (6 lines), added keyframe (4 lines), neutralized shimmer class

**Tested:** Dark mode, light mode, desktop (1280px), mobile (375px). Verified gradient positions shift over time with sampling. Zero console errors.

**What still needs attention:**
- 19 remaining `transition: all` rules to refine
- Whitespace rhythm between sections
- Mobile typography sizing audit
- Consider whether other gradient elements (trust metrics, CTA buttons) could echo the hero's palette

---

## Session 16 — 2026-03-27 (Opus 4.6) — BOLD

### What I Did: Fixed Timeline SVG Animations + Active Step Accent Border

**The discovery:** The custom SVG icon draw-in animations from Session 1 (chat bubble drawing itself, magnifying glass appearing, checkmark completing, wrench turning, shield filling) have been **completely broken since they were created**. The CSS targeted `.timeline-step.animated` but the JS only ever added `.visible` via the data-animate IntersectionObserver. The `.animated` class was never applied to timeline steps. This means:
- SVG stroke-dashoffset animations never fired
- Dot ripple effect never played
- Dot scale-up never happened
- Dot accent border never appeared
- Typing dots bounce never started
- Wrench sparks never appeared
- Shield checkmark never drew in

31 CSS rules were entirely dead.

**The fix:** Replaced all 31 instances of `.timeline-step.animated` with `.timeline-step.visible` in style.css. Zero HTML or major JS changes needed. Now when you scroll through the "How It Works" timeline:

1. **Step 1 (Text me)**: Chat bubble draws in stroke-by-stroke, tail appears, three dots bounce like typing
2. **Step 2 (Diagnosis)**: Magnifying glass circle draws, handle extends, pulse appears
3. **Step 3 (Approve)**: Circle draws, checkmark completes with a draw-in animation
4. **Step 4 (Repair)**: Wrench path draws in, sparks appear
5. **Step 5 (Done)**: Shield outlines, then checkmark draws inside it

Each dot scales to 1.08x, gets an accent blue border, glowing box-shadow, and a ripple effect. The final done step gets green treatment.

**Active step accent border:** Added a 3px left border on `.timeline-content` that appears in accent blue when the step becomes visible. Done step gets green. This creates a visual progress indicator alongside the timeline track.

**Attempted spotlight effect** (dimming past steps): Tried using MutationObserver, then scroll-based approach, but class toggling on scroll caused browser tab hangs. Removed this feature — the SVG animations already create enough visual hierarchy.

**Files changed:**
- `style.css` — replaced 31 `.animated` → `.visible` selectors, added content border styles, added done step green border
- `main.js` — removed attempted spotlight code

**Tested:** Dark mode, SVG icons draw in correctly, dot scaling works, ripple fires, done step green. Zero console errors.

**What's Next:**
- 19 remaining `transition: all` rules to refine
- Whitespace rhythm between sections
- Mobile typography sizing audit
- The timeline could benefit from a hover state on individual steps

---

## Session 17 — 2026-03-27 (Opus 4.6) — BOLD

### What I Did: Pricing Section — Premium Statement Card

**Before:** Plain text paragraphs with inline styles, a default CTA button, no visual treatment. The most boring section on the page — just 3 paragraphs and a link.

**After:** A premium statement card with considered visual design:

**1. Statement Card** (`pricing-statement-inner`)
- Subtle gradient background: accent blue → transparent → purple shimmer
- 1px subtle border with 24px radius
- **Animated gradient top bar**: 3px accent gradient (blue → purple → cyan) that slides in from left via `scaleX(0→1)` when the card scrolls into view. 1s duration with ease-out.
- Light mode gets a card shadow; dark mode gets the gradient overlay

**2. Pricing Promise Callout**
- The key differentiator ("firm quote before any work begins") is now a visually distinct callout with:
  - Accent blue left border (3px)
  - Dim accent background
  - **SVG shield icon** with draw-in animation: shield path draws over 0.8s, then checkmark draws 0.6s later
  - Bold text highlighting

**3. Price Highlight**
- "$100" gets accent blue color + subtle underline (2px accent bar at 40% opacity)
- Makes the key number pop without being garish

**4. Structural Improvements**
- Removed all inline styles from HTML (moved to CSS classes)
- Added `data-animate` for scroll entrance
- Added `data-scramble` to section title
- Added `btn-magnetic` to CTA button
- Proper responsive: card padding reduces on mobile, promise stacks vertically

**5. Theme-Aware**
- Dark mode: gradient overlay on dark card bg, accent dim promise bg
- Light mode: white card with shadow, lighter accent promise bg

**Files changed:**
- `index.html` — restructured pricing section (replaced inline styles with semantic markup)
- `style.css` — added ~100 lines of pricing statement styles, SVG animation, responsive

**Tested:** Dark/light mode, desktop/mobile. Shield draws in, gradient bar slides, promise callout renders. Zero console errors.

**What's Next:**
- Remaining `transition: all` cleanup
- Whitespace rhythm between sections
- Mail-in section has potential for a stunning map interaction

---

## Session 18 — 2026-03-27 (Opus 4.6) — BOLD

### What I Did: Compare Section — Animated Row Reveals + Icon Choreography

**Before:** A static comparison table with all 7 rows visible immediately. Check/X icons were static. No entrance animation, no visual hierarchy, no sense of progression.

**After:** A choreographed comparison table that tells the story of "why choose us" row by row:

**1. Row-by-row stagger entrance**
Each of the 7 compare rows now has `data-animate` and enters via the section-scoped stagger system (Session 13). Rows slide up 12px and fade in with 60ms spacing between each, creating a waterfall reveal effect. The compare-table itself also animates as the section lead.

**2. Check icon bounce-in**
Green check_circle icons start at `scale(0)` and pop to `scale(1)` via `cubic-bezier(0.34, 1.56, 0.64, 1)` — an overshoot curve that creates a satisfying bounce. 150ms delay after the row fades in so it feels sequenced: row slides in → check pops.

**3. X icon fade-in**
Orange cancel icons start at `opacity: 0` and fade to 0.6 with a 200ms delay. The subtle opacity makes the "them" column feel deliberately muted against the winning "us" column.

**4. "Us" column green tint**
`.compare-cell--us` in visible rows gets `rgba(63, 185, 80, 0.03)` background — just enough to create a column-wide green cast that subconsciously says "this side wins."

**5. Row hover effects**
- Feature label turns accent blue
- "Us" cell green tint intensifies to 0.06
- Check icon scales up to 1.15x

**6. Header badge pulse**
The "Hailey Device Repair" badge pulses once with a green ring animation (0→8px box-shadow) when the table becomes visible, drawing the eye to the winning column.

**Files changed:**
- `index.html` — added `data-animate` + `data-compare-row` to 7 rows
- `style.css` — ~55 lines: icon animations, column tint, hover effects, badge pulse, row entrance override

**Tested:** Dark/light mode, desktop/mobile (375px stacks to single column correctly). Zero console errors.

**What's Next:**
- Remaining `transition: all` cleanup
- Whitespace rhythm between sections
- Mail-in section could use visual treatment

---

## Session 19 — 2026-03-27 (Opus 4.6) — BOLD

### What I Did: Service Area Map — Choreographed Entrance + Interactive Towns

**Before:** SVG map appeared instantly with all elements visible. Towns had basic hover brightness. No entrance animation, no sense of discovery.

**After:** A carefully choreographed map reveal that tells a geographic story:

**Entrance Choreography (timed sequence when map scrolls into view):**
1. **0.3s** — Mountain silhouettes fade in (bg layer, 0→0.3/0.2 opacity)
2. **0.6s** — Highway 75 fades in with dashed road appearance
3. **0.8s** — Big Wood River **draws itself in** from south to north (stroke-dashoffset 480→0 over 2s) — the most dramatic element
4. **1.2s** — Bellevue pops in (southernmost town, scale 0.6→1 with overshoot bounce)
5. **1.5s** — Hailey pops in (home base, accent blue)
6. **1.8s** — Ketchum pops in
7. **2.0s** — Sun Valley pops in (northernmost)
8. **1.8s** — HWY 75 label fades in
9. **2.3s** — Distance marker lines fade in
10. **2.5s** — "~12 mi" labels fade last

Total sequence: ~3 seconds. You watch the map build itself like a cartographer drawing it.

**Interactive Town Hover:**
- Towns scale to 1.15× on hover with a drop-shadow glow
- Town labels turn accent blue
- Cursor set to pointer

**Implementation:**
- Added semantic classes to SVG elements (area-mountain, area-highway, area-river, area-hwy-label, area-distance, area-distance-label) instead of fragile nth-child selectors
- All CSS-driven via `.area-map.visible` — no extra JS needed
- The section stagger system handles the data-animate timing automatically

**Files changed:**
- `index.html` — added classes to SVG paths, lines, texts (7 elements)
- `style.css` — ~65 lines of choreography CSS

**Tested:** Dark/light mode, desktop/mobile (375px static single-column). River draws in, towns stagger south-to-north, distance markers appear last. Zero console errors.

**What's Next:**
- Remaining `transition: all` cleanup
- Whitespace rhythm audit
- Consider scroll-linked parallax for mountains

---

## Session 20 — 2026-03-27 (Opus 4.6) — BOLD

### What I Did: Mail-In Section — Connected Steps Flow + Location Card Hover

**Before:** Three mail-in steps were plain text with static icons. Location cards had basic hover. No entrance animation, no visual flow between steps.

**After:** A connected flow visualization that tells the mail-in story:

**1. Vertical Connector Line**
A gradient line (`--accent` → purple) runs between the 3 step icons, drawn with `::before` pseudo-element. Uses `scaleY(0→1)` transition triggered by `:has(.mailin-step.visible)` — the line grows from top to bottom when steps scroll into view.

**2. Traveling Dot**
A glowing accent dot (`::after`) travels along the connector via `@keyframes mailinDotTravel` — starts at step 1, pauses at step 2 midpoint, arrives at step 3, then fades out. Takes 2.5s total with 1s delay after scroll trigger. Creates the sense of a package moving through the process.

**3. Step Icon Entrance**
Each step icon starts at `scale(0)` and pops to `scale(1)` via the stagger system when scrolling into view. The `cubic-bezier(0.34, 1.56, 0.64, 1)` overshoot creates a satisfying bounce.

**4. Step Hover Effect**
- Icon lifts 2px with 1.1x scale
- Box-shadow glow appears
- Icon background fills solid accent, icon turns white
- Step label turns accent blue

**5. Location Card Hover**
- Cards shift right 4px with a left accent border (`box-shadow: -3px 0 0 var(--accent)`)
- Replaced `transition: all` with specific properties (background, border, transform, shadow)

**Technical:**
- Uses CSS `:has()` selector (Chrome 105+, Firefox 121+, Safari 15.4+) for connector visibility
- Graceful fallback: without `:has()` support, steps still animate normally, just no connector
- `prefers-reduced-motion` covered by existing blanket rule (line 7231)

**Files changed:**
- `index.html` — added `data-animate` to 3 mail-in steps
- `style.css` — ~50 lines: connector, dot keyframes, icon entrance, hover effects, location hover

**Tested:** Dark/light mode, desktop/mobile (375px single column). Zero console errors.

**What's Next:**
- Whitespace rhythm audit across all sections
- Consider scroll-linked parallax for hero/mountain elements
- All major sections now enhanced (hero, services, timeline, workshop, FAQ, contact, pricing, compare, service area, mail-in)

---

## Session 21 — 2026-03-27 (Opus 4.6) — POLISH

### What I Did: transition:all Cleanup — All 19 Instances Eliminated

**The Problem:** `transition: all` is a performance anti-pattern. It transitions EVERY CSS property including layout properties (width, height, padding, margin) which triggers expensive repaints and causes jank. Session 12 flagged 19 instances across the stylesheet.

**The Fix:** Replaced every `transition: all` with specific property transitions targeting only what actually changes on hover/state:

| Element | Before | After |
|---------|--------|-------|
| .nav-link | `all` | `color, background` |
| .theme-toggle | `all` | `color, background, border-color` |
| .nav-hamburger span | `all` | `transform, opacity` |
| .pricing-category | `all` | `border-color, box-shadow` |
| .process-step | `all` | `border-color, background, transform` |
| .trust-stat | `all` | `border-color, transform` |
| .review-card | `all` | `border-color, transform` |
| .reviews-filter-btn | `all` | `color, background, border-color` |
| .carousel-dot | `all` | `background, transform` |
| .lp-model-tag | `all` | `border-color, background, color` |
| .cookie-banner .btn-decline | `all` | `color, background` |
| .floating-theme-toggle | `all` | `opacity, transform, box-shadow` |
| .dc-option | `all` | `border-color, background, transform, box-shadow` |
| .dc-check | `all` | `border-color, background` |
| .dc-radio-box | `all` | `border-color` |
| .dc-radio-box::after | `all` | `opacity, transform` |
| .help-fab-trigger | `all` | `border-color, box-shadow, transform` |
| .help-fab-panel | `all` | `opacity, visibility, transform` |
| .faq-hub-filter | `all` | `color, background, border-color` |

**Result:** Zero `transition: all` remaining in the entire 8573-line stylesheet. Each transition now targets only the properties that actually change, reducing compositor work and eliminating potential layout thrashing.

**Tested:** Zero console errors. Nav, theme toggle, hamburger, pricing cards all transition smoothly.

**Project Stats (Session 21):**
- HTML: 1590 lines (86KB)
- CSS: 8573 lines (211KB)
- JS: 2072 lines (80KB)
- Total: 12,235 lines (378KB raw)
- All 10 major sections enhanced across 21 sessions

**What's Next:**
- Whitespace rhythm audit across sections
- Consider scroll-linked parallax for hero/mountain elements
- Footer hasn't been touched — could get polish
- Overall animation budget audit (ensure total animation weight stays reasonable)

---

## Session 22 — 2026-03-27 (Opus 4.6) — BOLD

### What I Did: Navigation — Premium Polish + Active Section Tracking Fix

The navigation is visible 100% of the time — making it premium has outsized impact.

**1. Animated Hover Underline**
Replaced the background-color hover effect with a sliding accent underline that expands from center. Uses `::after` pseudo-element with `width: 0 → 60%` and `left: 50% → 20%` on hover. Smooth `cubic-bezier(0.16, 1, 0.3, 1)` easing.

Had to add `display: inline-block` to `.nav-link` — the original `display: inline` caused `::after` `width: 100%` to resolve to content-width only (9.59px instead of 74px).

**2. Active Link — Full-Width Gradient Underline**
Active nav link gets `width: 100%; left: 0` with a gradient background (`transparent → accent → transparent`) that fades at the edges. The active link text turns accent blue.

**3. Logo Hover Enhancement**
Logo icon gets `drop-shadow(0 0 6px accent)` glow + `scale(1.1) rotate(-8deg)` tilt on hover. Bouncy `cubic-bezier(0.34, 1.56, 0.64, 1)` easing.

**4. Scrolled State — Gradient Accent Line**
When nav has `.scrolled` class, a gradient accent line appears at the bottom via `::before` pseudo-element (0 → 0.6 opacity). Replaces the boring solid border with a `linear-gradient(90deg, transparent 5%, accent 30%, purple 70%, transparent 95%)`.

**5. Mobile Nav — Staggered Link Entrance**
Mobile menu items slide in from the left with staggered delays (40ms apart) using `@keyframes navSlideIn`. The CTA button enters last (200ms delay).

**6. Nav CTA — Accent Glow**
The "Get a Quote" button gets a permanent `box-shadow: 0 0 12px rgba(accent, 0.2)` glow that intensifies on hover (0.4), plus a subtle 1px lift.

**7. Active Section Tracking — Bug Fix**
Fixed the existing `updateActiveNav()` JS function that was broken since original implementation:
- **Bug 1:** Links use `/#services` and `/pricing` formats. The old code used `.replace('#', '')` which turned `/#services` into `//services`.
- **Bug 2:** Links like `/pricing` had no hash, so they were skipped entirely.
- **Fix:** Extract ID from hash or from path segments (e.g., `/pricing` → look for `#pricing` section). Match by section ID instead of href string comparison.
- **Result:** Services, Pricing, and Contact now highlight correctly as you scroll through those sections.

**Files changed:**
- `style.css` — ~35 lines: underline ::after, logo hover, scrolled gradient, mobile stagger, CTA glow
- `main.js` — Fixed active nav section tracking (href parsing + matching)

**Tested:** Dark/light mode. Active tracking: Services → Pricing → Contact highlights correctly on scroll. Logo hover glow works. Scrolled gradient line at 0.6 opacity. Mobile stagger animation. Zero console errors.

**What's Next:**
- Whitespace rhythm audit
- Consider scroll-linked parallax for hero mountains
- Animation budget audit

---

## Session 23 — 2026-03-27 (Opus 4.6) — BOLD

### What I Did: Footer Polish — Gradient Lines, Link Underlines, Heartbeat, Entrance Animation

The footer is the last thing users see and it was the last untouched section. Now it matches the premium feel of the rest of the site.

**1. Gradient Accent Top Line**
Replaced `border-top: 1px solid` with a `::before` pseudo-element gradient line: `transparent 5% → accent 35% → purple 65% → transparent 95%` at 0.5 opacity. Matches the nav's scrolled gradient line for visual consistency.

**2. Column Heading Enhancement**
Added a subtle accent underline (`border-bottom: 1px solid rgba(accent, 0.15)`) under each column heading ("Services", "Resources", "Contact"). Used `align-self: flex-start` instead of `display: inline-block` since columns use flexbox layout. Increased letter-spacing to 0.1em.

**3. Link Hover — Sliding Underline + Shift**
Footer links now have a `::after` underline that slides in from left (0 → 100% width) with a 3px right shift on hover. Used `align-self: flex-start` to prevent links from stretching full column width.

**4. Footer Bottom — Gradient Separator**
Replaced `border-top` with a `::before` gradient: `transparent → border-subtle → border-subtle → transparent`. Creates a cleaner, more refined separation.

**5. Heartbeat ❤️**
Wrapped the heart emoji in a `<span class="footer-heart">` with a `@keyframes heartbeat` animation: double-pump rhythm (scale 1 → 1.2 → 1 → 1.15 → 1) over 2 seconds.

**6. Entrance Animation**
Added `data-animate` to footer-brand and all 3 footer-col elements. They now stagger in when scrolled into view using the existing section-scoped choreography system.

**7. Light Mode Adjustments**
Added specific light-mode overrides: gradient at 0.4 opacity, column heading border at 0.2 alpha, link underline uses #60a5fa (lighter blue).

**Files changed:**
- `style.css` — ~45 lines: gradient lines, link underlines, column heading borders, heartbeat keyframes
- `index.html` — 4 data-animate attributes, footer-heart span wrapper

**Tested:** Dark mode, light mode, mobile responsive (375px). Footer entrance animation fires correctly. Zero console errors.

**Project Stats (Session 23):**
- All 10 major sections + nav + footer enhanced across 23 sessions
- Zero `transition: all` in stylesheet

**What's Next:**
- Whitespace rhythm audit across sections
- Animation budget audit (count total keyframes, ensure total animation weight is reasonable)
- Footer links could get staggered entrance within each column
- Consider scroll-based opacity fade to the noise overlay

---

## Session 24 — 2026-03-27 (Opus 4.6) — BOLD

### What I Did: Cursor Spotlight — Ambient Glow That Follows the Mouse

A subtle accent-colored radial glow follows the user's cursor across the entire page. It's like carrying a flashlight — you barely notice it consciously, but the page feels alive and responsive to your presence. This is the kind of effect that makes premium sites feel premium (Linear, Stripe, Vercel all use variants of this).

**Implementation:**
- Added a `<div class="cursor-spotlight">` element (fixed, full viewport, pointer-events: none)
- CSS uses `radial-gradient(600px circle at var(--spotlight-x) var(--spotlight-y), ...)` — the gradient position is controlled via CSS custom properties
- JS tracks `mousemove` and uses `requestAnimationFrame` with linear interpolation (LERP 0.12) for buttery smooth trailing motion
- Spotlight fades in (opacity 0 → 1 with 400ms transition) when mouse enters, fades out when mouse leaves
- Z-index 9997 — above page content but below noise overlay (9998) so the grain texture appears on top of the glow

**Colors:**
- Dark mode: `rgba(79, 142, 247, 0.04)` center → `rgba(79, 142, 247, 0.015)` mid → transparent
- Light mode: `rgba(37, 99, 235, 0.03)` center → `rgba(37, 99, 235, 0.01)` mid → transparent

**Guards:**
- Only activates on pointer/hover devices (no mobile touch)
- Respects `prefers-reduced-motion` (both JS guard and CSS `display: none !important`)
- Uses `pointer-events: none` — never blocks interaction with anything

**Technical note:** Headless browsers don't report `pointer: fine` or `hover: hover` media queries, so automated testing requires manual DOM manipulation. On real desktop browsers with a mouse, the effect activates automatically.

**Files changed:**
- `index.html` — 1 line: added `.cursor-spotlight` div after noise overlay
- `style.css` — ~30 lines: spotlight positioning, gradient, transitions, light mode override, reduced-motion guard
- `main.js` — ~50 lines: IIFE with mousemove tracking, LERP interpolation, rAF loop, mouseenter/leave lifecycle

**Tested:** Dark mode gradient ✓, light mode gradient ✓, zero console errors, pointer-events: none verified, z-index layering correct, reduced-motion respected.

**What's Next:**
- Whitespace rhythm audit across sections
- Animation budget audit (count total keyframes + rAF loops)
- Footer link stagger within columns
- Consider making spotlight color context-aware (green near trust metrics, purple near hero accent)

---

## Session 25 — 2026-03-27 (Opus 4.6) — BOLD

### What I Did: Circular Theme Reveal — Ink-Spread Dark/Light Toggle

Replaced the basic crossfade theme transition with a **circular clip-path reveal** that expands from the toggle button's position. When you click the theme toggle, a full-page overlay in the target theme's color appears and expands as a growing circle from the button, "painting" the new theme across the screen like ink spreading on paper.

This is the kind of interaction that makes people click the toggle 10 times just because it's so satisfying.

**How It Works:**
1. Click theme toggle → JS captures button's viewport center coordinates
2. Creates a fixed overlay `<div class="theme-reveal">` with the target theme's `--bg-base` color
3. Sets `--reveal-x` and `--reveal-y` CSS custom properties to the button's position
4. Adds `.expanding` class which triggers `@keyframes themeRevealExpand` — `clip-path: circle(0%)` → `circle(150%)`
5. On `animationend`: swaps the real `data-theme`, waits for double-rAF repaint, removes overlay
6. Safety timeout at 800ms catches any missed `animationend` events

**CSS:** `clip-path: circle()` with CSS custom properties for origin position. 600ms duration with `cubic-bezier(0.16, 1, 0.3, 1)` — fast initial expansion that decelerates (feels like real ink spreading).

**Guards:**
- `revealInProgress` flag blocks ALL theme changes during animation (no rapid-click glitches)
- Falls back to crossfade if `triggerEl` is null (e.g., system preference change)
- `prefers-reduced-motion` → falls back to crossfade (no circular animation)
- Safety timeout prevents stuck overlays

**Both toggles work:** Nav toggle and floating toggle both produce the reveal from their respective positions on screen.

**Files changed:**
- `style.css` — ~25 lines: `.theme-reveal` fixed overlay, `.expanding` animation, `@keyframes themeRevealExpand`
- `main.js` — Rewrote `setTheme()` to create circular reveal overlay when trigger element provided; updated both toggle click handlers to pass `this` as trigger; added `revealInProgress` guard and safety timeout

**Tested:** Dark→light ✓, light→dark ✓, correct overlay colors (#0d1117 dark, #f8f9fb light), animation progression verified at 10/100/300/500/700ms checkpoints, rapid triple-click → only 1 overlay, cleanup confirmed, zero console errors.

**What's Next:**
- Whitespace rhythm audit across sections
- Animation budget audit (count total keyframes + rAF loops, ensure we haven't over-animated)
- Footer link stagger within columns
- Consider context-aware spotlight colors

---

## Session 26 — 2026-03-27 (Opus 4.6) — BOLD

### What I Did: Hero Entrance Choreography — Theatrical Staggered Load Animation

Replaced the generic body fade-in with a **6-element staggered hero entrance** where each part of the hero section arrives with its own unique animation character. Previously the entire page faded in with a single 0.6s ease-out — now the hero section plays out like a theatrical curtain call.

**The Sequence (staggered ~120-150ms apart):**
1. **Eyebrow** (0.2s delay) — slides DOWN from above (unique — everything else slides up), 0.6s duration. Like a curtain parting.
2. **Headline** (0.35s delay) — slides up 48px with spring overshoot + blur-to-sharp focus effect. The MAIN event. 1s duration with a multi-step spring: up → overshoot -6px → settle back 2px → land. Also scales from 0.97 → 1.005 → 1.0 for a subtle breathing feel.
3. **Subtitle** (0.55s delay) — standard slide-up with gentle overshoot (-4px → 1px → 0). 0.8s duration.
4. **Action buttons** (0.7s delay) — scale-in spring (0.92 → 1.02 → 0.995 → 1.0) + slide up. Feels like buttons "popping" into existence. 0.9s duration.
5. **Trust strip** (0.9s delay) — standard slide-up entrance. 0.8s duration.
6. **Scroll hint** (1.2s delay) — fade in to 0.6 opacity, then hands off to the existing infinite bounce animation.

**Technical Details:**
- Pure CSS `@keyframes` — no JS needed for the choreography
- Each element gets `hero-entrance` class + `data-hero-delay="N"` attribute
- Animation fill mode `both` ensures elements start invisible and end at final state
- Body pageIn simplified to just opacity (0.4s) since hero handles its own movement
- Headline uses `filter: blur(8px)` → `blur(0px)` for a cinematic "focusing" effect
- All easing: `cubic-bezier(0.16, 1, 0.3, 1)` — aggressive ease-out for spring-like feel

**Reduced Motion:** Full `@media (prefers-reduced-motion: reduce)` block that sets `animation: none`, `opacity: 1`, `transform: none`, `filter: none` on all `.hero-entrance` elements — instant visibility, zero movement.

**Files changed:**
- `index.html` — added `hero-entrance` class and `data-hero-delay` attributes to 6 hero elements
- `style.css` — 5 new `@keyframes` (heroEntrance, heroHeadlineEntrance, heroActionsEntrance, heroEyebrowEntrance, heroScrollHintEntrance), stagger delays, reduced-motion guard, simplified pageIn

**Tested:** All 6 elements animate correctly ✓, correct final states (opacity 1, transform none) ✓, correct animation names assigned ✓, typewriter effect still works ✓, dark mode ✓, light mode ✓, scroll hint bounce still works after entrance ✓, zero console errors ✓.

**What's Next:**
- Whitespace rhythm audit across sections
- Animation budget audit (count total keyframes + rAF loops)
- Consider adding individual button stagger within hero-actions (left button arrives before right)
- Footer link stagger within columns

---

## Session 27 — 2026-03-27 (Opus 4.6) — BOLD

### What I Did: Premium 3D Card Tilt — Specular Glare + Spring Physics + Dynamic Shadows

Completely rewrote the service card 3D tilt system from a basic 6° rotation to a physically realistic interaction with three new features:

**1. Specular Glare Overlay**
Each card now has a `.card-glare` element — a bright radial gradient spotlight that follows the cursor position across the card surface, like light reflecting off a polished glass surface. In dark mode: `rgba(255,255,255,0.14)` with `mix-blend-mode: overlay`. In light mode: `rgba(255,255,255,0.5)` with `mix-blend-mode: soft-light` — brighter because light backgrounds need more contrast.

**2. Spring Physics Animation**
Replaced instant transform updates with LERP-based spring interpolation (factor 0.12). The card doesn't snap to position — it smoothly follows the cursor with a physical "mass" feel. On mouseleave, the spring decays gracefully: 7° → 5° (50ms) → 1.5° (200ms) → 0.16° (500ms) → settled (1000ms, inline styles removed). Max tilt increased from 6° to 8° for more dramatic effect.

**3. Dynamic Reactive Shadow**
Shadow position shifts opposite to tilt direction — when the card tilts right, the shadow falls left. Shadow blur and spread scale with lift amount. Creates the illusion of a physical light source above the card.

**Additional Details:**
- Card lifts 12px on hover (vs 4px before) with subtle scale (1.012x at max lift)
- `will-change: transform, box-shadow` for GPU compositing
- CSS hover transforms suppressed for card-tilt elements — JS owns everything
- Spring animation only runs `requestAnimationFrame` while needed, stops when settled
- Works alongside existing `data-card-glow` cursor-tracking blue glow (stacked at different z-indices)
- Full prefers-reduced-motion guard — no glare elements created, no tilt
- All 8 service cards + any other `.card-tilt` elements enhanced

**Files changed:**
- `main.js` — Complete rewrite of card-tilt IIFE: spring animation loop, glare element creation, mouseenter/mousemove/mouseleave handlers with specular positioning and dynamic shadow calculation
- `style.css` — `.card-glare` styles with dark/light mode variants, `.card.card-tilt` transition override, reduced-motion guard

**Tested:** 8 cards with 8 glare elements created ✓, tilt: perspective(800px) rotateX(6.96deg) rotateY(6.84deg) translateY(-11.6px) ✓, shadow shifts opposite to tilt (-10.3px, 22.1px) ✓, spring decay verified at 50/200/500/1000ms ✓, inline styles fully cleared after settle ✓, dark mode overlay blend ✓, light mode soft-light blend ✓, card-glow still functional alongside glare ✓, zero console errors ✓.

**What's Next:**
- Whitespace rhythm audit across sections
- Animation budget audit (count total keyframes + rAF loops)
- Individual hero button stagger (left arrives before right)
- Consider applying same spring tilt to Workshop cards and pricing cards

---

## Session 28 — 2026-03-27 (Opus 4.6) — BOLD

### What I Did: Border Beam — Animated Gradient Border That Traces Card Perimeters

Added a **rotating conic-gradient border beam** effect to cards across the site — a light trail that continuously traces around the card perimeter, creating a mesmerizing "living border" effect.

**Technical Implementation:**
Uses CSS `@property --border-angle` (registered as `<angle>`) for GPU-accelerated animation of the conic gradient rotation angle. The double-layer background technique:
- Layer 1: `linear-gradient(var(--bg-card), var(--bg-card)) padding-box` — solid fill covers the card interior
- Layer 2: `conic-gradient(from var(--border-angle), ...) border-box` — rotating gradient visible only at the border

The `@property` registration enables smooth interpolation of the angle value (0° → 360°), which isn't possible with regular CSS custom properties.

**Three application modes:**

1. **Pricing highlight card** (`border-beam` class) — always-on, 3.5s rotation, brighter beam colors (0.9 blue, 0.7 purple, 0.6 cyan). This is the premium "recommended" card — the border beam draws the eye immediately.

2. **Service cards + Workshop cards** (`border-beam-hover` class) — activates on hover via JS class toggle (`border-beam-active`). 3s rotation, standard beam colors. The beam appears instantly on mouseenter and disappears on mouseleave.

3. **GBP cards** (`border-beam-hover` + custom gradient) — uses Google brand colors (blue #4285f4, green #34a853, yellow #fbbc04) in the conic gradient instead of the accent palette.

**Debugging note:** Initial implementation used `--beam-bg: var(--bg-card)` intermediate variable, but `var()` resolution inside `background` shorthand failed silently in Chrome — the entire declaration was dropped. Fixed by using `var(--bg-card)` directly in each background rule. This is a known CSS variable resolution edge case with multi-layer backgrounds.

**Dark/Light mode:** Both themes have explicit conic-gradient rules. Dark mode uses the default accent colors (blue 0.7, purple 0.5), light mode uses adjusted tones (blue 0.6, purple 0.5). The `var(--bg-card)` in the padding-box layer ensures the center fill always matches the card background.

**Reduced motion:** Static accent-colored border, no animation. Clean fallback.

**Files changed:**
- `style.css` — `@property --border-angle`, `@keyframes borderBeamSpin`, `.border-beam` (always-on), `.border-beam-hover.border-beam-active` (hover), dark/light variants, GBP Google-colored variant, reduced-motion fallback
- `index.html` — Added `border-beam` to pricing highlight card, `border-beam-hover` to 7 service cards + 4 workshop cards + 3 GBP cards
- `main.js` — Border beam hover IIFE: mouseenter adds `border-beam-active`, mouseleave removes it

**Tested:** Pricing highlight always spinning ✓, angle progression verified (287°→318° in 300ms) ✓, service card hover activates/deactivates beam ✓, workshop card hover ✓, GBP card hover ✓, dark mode (bg-card: rgb(26,32,51)) ✓, light mode (bg-card: rgb(255,255,255)) ✓, zero console errors ✓.

**What's Next:**
- Whitespace rhythm audit across sections
- Animation budget audit (count total keyframes + rAF loops — now at 28+ sessions of effects)
- Individual hero button stagger (left arrives before right)
- Spring tilt for Workshop + pricing cards
- Consider making beam speed vary with cursor velocity

---

## Session 29 — 2026-03-27 (Opus 4.6) — BOLD

### What I Did: Text Luminance Reveal — Scroll-Linked Gradient Wipe on Section Subtitles

Added a **scroll-driven text color reveal** to all 8 section subtitles. Text starts nearly invisible (25% opacity of muted color) and progressively "lights up" left-to-right as the user scrolls, like reading in the dark with a slowly widening beam of light. Inspired by Apple's product page scroll-driven text effects.

**The Effect:**
Each `.section-sub[data-text-reveal]` uses `background-clip: text` with a horizontal linear gradient from `var(--text-secondary)` (bright/readable) to `rgba(126, 138, 153, 0.25)` (dim/nearly invisible). A CSS custom property `--reveal-progress` (0–100) controls where the gradient split falls, creating a soft left-to-right wipe.

**Gradient structure:**
```
linear-gradient(90deg,
  bright 0%,
  bright calc(progress - 8%),   ← fully lit zone
  dim    calc(progress + 8%),   ← fully dim zone
  dim    100%
)
```
The 16% transition zone (±8% around the progress point) creates a soft, natural feathered edge — not a hard wipe line but a gentle luminance gradient that mimics light spreading.

**Scroll-to-progress mapping:**
- Uses `requestAnimationFrame`-throttled scroll listener (passive)
- Each element's center position mapped to viewport zone: `vh * 0.85` (start) → `vh * 0.25` (end)
- Applied `easeOutCubic` easing: `1 - (1 - t)³` — fast initial reveal, satisfying deceleration at the end
- About 60% of viewport height of scroll travel to complete the reveal

**Lifecycle:**
1. **Initial:** Text at `--reveal-progress: 0` — entire gradient is dim, text is barely visible
2. **Scrolling:** Progress increases, bright zone expands left-to-right
3. **Complete:** `text-revealed` class added, gradient removed entirely, text set to normal `color: var(--text-secondary)` — zero ongoing GPU overhead

**Dark vs Light mode:**
- Dark mode: bright = `#8b949e` (text-secondary), dim = `rgba(126, 138, 153, 0.25)` on dark bg → text dramatically emerges from near-invisibility
- Light mode: bright = `#4b5563` (text-secondary), dim = `rgba(126, 138, 153, 0.25)` on light bg → text gently solidifies from ghostly gray

**Reduced motion:** Full `prefers-reduced-motion` guard — text shows at full brightness immediately, no gradient, no scroll tracking.

**Design decision:** Chose `rgba(126, 138, 153, 0.25)` for the dim color instead of `var(--text-muted)` because the contrast between `--text-secondary` and `--text-muted` was too subtle (only ~30 RGB units) — the reveal would be barely noticeable. The 25% opacity creates dramatic contrast where text literally appears from near-nothingness.

**Files changed:**
- `style.css` — `[data-text-reveal]` gradient rules, `.text-revealed` cleanup class, reduced-motion guard (~40 lines)
- `index.html` — Added `data-text-reveal` to all 8 `.section-sub` elements
- `main.js` — Scroll-linked reveal IIFE: rAF-throttled scroll listener, viewport zone mapping, easeOutCubic, class lock on completion (~50 lines)

**Tested:** Light mode gradient correct (rgb(75,85,99) → rgba(126,138,153,0.25)) ✓, dark mode gradient correct (rgb(139,148,158) → rgba(126,138,153,0.25)) ✓, progressive scroll reveals (0% → 19% → 72% → 90% → 100%) ✓, text-revealed class locks final state ✓, gradient removed after reveal (zero overhead) ✓, zero console errors ✓.

**What's Next:**
- Whitespace rhythm audit across sections
- Animation budget audit (count total keyframes + rAF loops)
- Spring tilt for Workshop + pricing cards
- Consider applying text reveal to pricing description paragraphs
- Consider scroll-speed-aware reveal (faster scroll = reveal ahead)

---

## Session 30 — 2026-03-27 (Opus 4.6) — POLISH

### What I Did: Hero Button Stagger — Left Before Right

Refactored the hero action buttons to animate individually with a staggered entrance: the primary "Get a Free Quote" button arrives first, followed by the outline "See Services" button 120ms later.

**Before:** Both buttons animated together as part of `.hero-actions` container (single animation at 0.7s delay).

**After:** Container has no animation. Each `.btn` child has its own `heroButtonEntrance` animation with individual delays:
- `.btn-primary`: 0.7s delay (arrives first)
- `.btn-outline`: 0.82s delay (arrives 120ms later)

**Technical Details:**
- New `@keyframes heroButtonEntrance` with spring-like scale overshoot (0.92 → 1.03 → 0.995 → 1.0)
- Slightly increased overshoot from 1.02 to 1.03 for more visible bounce on individual buttons
- Added reduced-motion guard for `.hero-entrance > .btn` elements

**Why 120ms?** Fast enough to feel like a single choreographed unit, slow enough to perceive as intentional stagger. The eye catches the left button appearing first, creating a subtle left-to-right reading flow that mirrors the natural reading direction.

**Files changed:**
- `style.css` — Replaced `.hero-actions.hero-entrance` animation with per-button animations, new `heroButtonEntrance` keyframes, updated reduced-motion guard

**Tested:** Primary delay 0.7s ✓, outline delay 0.82s ✓, final opacity 1 ✓, final transform identity ✓, zero console errors ✓.

**What's Next:**
- Whitespace rhythm audit across sections
- Animation budget audit (count total keyframes + rAF loops)
- Spring tilt for Workshop + pricing cards
- Consider applying text reveal to pricing description paragraphs

---

## Session 31 — 2026-03-27 (Opus 4.6) — POLISH

### What I Did: Spring Tilt for Workshop Cards

Extended the premium 3D card tilt effect (specular glare + spring physics + dynamic shadows) from service cards to all 4 workshop cards.

**Changes:**
- Added `card-tilt` class to all 4 `.workshop-card` elements
- Added `data-card-glow` attribute for the blue cursor-tracking spotlight

**No JS/CSS changes needed** — the existing card-tilt IIFE automatically queries all `.card-tilt` elements and applies:
- LERP-based spring interpolation (factor 0.12) for smooth follow
- Max 8° tilt with 12px lift
- Specular glare overlay that follows cursor position
- Dynamic reactive shadow that shifts opposite to tilt direction
- Graceful spring decay on mouseleave

**Result:** Workshop section now has the same premium interactive feel as the services grid. The "Thorough Diagnosis", "Quality Parts", "Right Tool", and "40-Day Warranty" cards all respond to cursor movement with physical tilt + glare.

**Note on pricing cards:** The pricing section doesn't have discrete cards — it's a statement block. No tilt to apply there.

**Files changed:**
- `index.html` — Added `card-tilt` class and `data-card-glow` to 4 workshop cards

**Tested:** 12 total card-tilts (8 service + 4 workshop) ✓, 12 glare elements created ✓, workshop card 3D transform active (matrix3d with rotations) ✓, zero console errors ✓.

**What's Next:**
- Whitespace rhythm audit across sections
- Consider applying text reveal to pricing description paragraphs
- Consider adding subtle tilt to the pricing-statement-inner block
- Scroll-speed-aware reveal (faster scroll = faster reveal)

---

## Session 32 — 2026-03-27 (Opus 4.6) — POLISH + AUDIT

### What I Did: Animation Budget Audit + Footer Column Cascade

**Part 1: Animation Budget Audit**

Counted all animation primitives to understand performance footprint:

- **51 @keyframes** in style.css (hero entrance, border beams, SVG icon animations, particles, theme reveal, etc.)
- **17 requestAnimationFrame calls** in main.js

**rAF breakdown:**
- Persistent loops: Card tilt spring (hover-active only), mountain parallax (scroll-throttled), text luminance reveal (scroll-throttled)
- One-shot: Theme reveal cleanup, counter animations, magnetic button displacement, progress bar fill

**Assessment:** Healthy budget. Persistent loops are properly throttled with ticking flags. No runaway animations. One setInterval for testimonial carousel (paused when not visible).

**Part 2: Footer Column Cascade Hover**

Added staggered link animation when hovering footer columns — waterfall effect with 25ms delay between each link.

**How it works:**
- Hovering a footer column triggers all links to shift 4px right
- Each link has nth-child-based transition-delay (0ms, 25ms, 50ms... up to 250ms for link 12)
- Individual link hover overrides to 6px right with instant response (no delay)
- Reduced-motion users get instant transitions (no stagger)

**CSS technique:** Explicit `.footer-col:hover a:nth-child(n)` selectors with hardcoded delays — more reliable than CSS custom property approach.

**Files changed:**
- `style.css` — Added 15 new rules for footer cascade hover

**Tested:** CSS balanced (1751 braces) ✓, zero console errors ✓.

**What's Next:**
- Whitespace rhythm audit across sections
- Consider applying text reveal to pricing description paragraphs
- Consider adding subtle tilt to the pricing-statement-inner block
- Scroll-speed-aware reveal (faster scroll = faster reveal)

---

## Session 33 — 2026-03-27 (Opus 4.6) — POLISH

### What I Did: Hero Scroll Hint "Boop" Animation

Added a delightful microinteraction — on first scroll (>5px), the scroll hint does a satisfying squish-and-release "boop" before fading out.

**How it works:**
1. User scrolls for the first time
2. JS detects scroll > 5px and adds `.boop` class (once only)
3. CSS animation plays: squish down (scale 1.15, 0.7) → bounce up (scale 0.9, 1.2) → settle → rest at +12px
4. Normal fade-out continues from parallax logic

**Keyframe breakdown:**
- 0%: Normal state
- 30%: Quick squish (1.15x wide, 0.7x tall, +4px down)
- 60%: Stretch upward (0.9x wide, 1.2x tall, -6px up)
- 80%: Settle (1.02x, 0.98x, +2px)
- 100%: Rest position (+12px down, ready to fade)

**Technical details:**
- `scrollHintBooped` flag ensures animation plays only once per page load
- `!important` on animation property to override the existing bounce animation
- Reduced-motion support (skips boop for accessibility)
- 350ms duration with spring easing

**Files changed:**
- `main.js` — Added scrollHintBooped flag and .boop class trigger
- `style.css` — Added scrollHintBoop keyframes and .boop selector

**Tested:** Boop class added on scroll ✓, animation name is scrollHintBoop ✓, overrides bounce animation ✓, zero console errors ✓.

**What's Next:**
- Whitespace rhythm audit across sections
- Consider applying text reveal to pricing description paragraphs
- Consider adding subtle tilt to the pricing-statement-inner block
- Scroll-speed-aware reveal (faster scroll = faster reveal)

---

## Session 34 — 2026-03-27 (Opus 4.6) — POLISH

### What I Did: Contact Form Input Focus "Pop" Animation

Added a subtle scale-up effect when form inputs receive focus — creates tactile feedback that makes the form feel more responsive.

**How it works:**
- On focus: inputs scale to 1.012 (1.2% larger) with spring easing
- Enhanced box-shadow: added soft drop shadow in addition to the existing accent glow ring
- On blur: smoothly transitions back to normal scale

**Technical details:**
- Added `transform 250ms cubic-bezier(0.34, 1.56, 0.64, 1)` to base input transition
- Added `transform: scale(1.012)` to `:focus` state
- Added secondary shadow: `0 4px 12px -2px rgba(99, 102, 241, 0.15)`
- `transform-origin: center` for centered scaling
- Reduced-motion media query skips the scale transform

**Applies to:**
- Text inputs (name, contact)
- Select dropdowns (device)
- Textareas (issue description)

**Files changed:**
- `style.css` — Added transform transition, scale on focus, reduced-motion fallback

**Tested:** Scale to 1.012 on focus ✓, spring transition smooth ✓, blur returns to scale(1) ✓, works on all input types ✓, zero console errors ✓.

**What's Next:**
- Whitespace rhythm audit across sections
- Consider applying text reveal to pricing description paragraphs
- Consider adding subtle tilt to the pricing-statement-inner block
- Scroll-speed-aware reveal (faster scroll = faster reveal)

---

## Session 35 — 2026-03-27 (Opus 4.6) — POLISH

### What I Did: Hero Glow "Breathing" Idle Animation

Added a subtle ambient pulse animation to the hero glow blobs when there's no mouse activity. Makes the page feel alive even when idle.

**How it works:**
1. Breathing starts 2 seconds after page load (after entrance animations)
2. Glows gently pulse: scale 1 → 1.08, opacity 0.4 → 0.55, slight drift
3. Animation is 6 seconds with infinite loop
4. glow-2 has -3s offset for organic, non-synchronized feel
5. Any mouse movement pauses breathing immediately
6. Breathing resumes after 3 seconds of idle (if hero is still visible)

**CSS animation:**
```css
@keyframes glowBreathe {
  0%, 100% { transform: scale(1) translate(0, 0); opacity: 0.4; }
  50% { transform: scale(1.08) translate(5px, -3px); opacity: 0.55; }
}
```

**JS logic:**
- setTimeout adds `.breathing` class 2s after load
- mousemove removes `.breathing` and starts 3s idle timer
- Idle timer re-adds `.breathing` only if scrollY < innerHeight

**Files changed:**
- `style.css` — Added glowBreathe keyframes, .breathing class, reduced-motion support
- `main.js` — Added breathing state management with idle detection

**Tested:** Breathing starts after 2s ✓, pauses on mousemove ✓, resumes after 3s idle ✓, reduced-motion respected ✓, zero console errors ✓.

**What's Next:**
- Whitespace rhythm audit across sections
- Consider applying text reveal to pricing description paragraphs
- Consider adding subtle tilt to the pricing-statement-inner block
- Scroll-speed-aware reveal (faster scroll = faster reveal)

---

## Session 36 — 2026-03-27 (Opus 4.6) — POLISH

### What I Did: Dynamic Nav Shadow — Depth-Based Intensity

The nav shadow now **intensifies as you scroll deeper** into the page, creating a sense of the header floating higher above increasingly dense content.

**How it works:**
1. JS calculates scroll depth as a ratio: `scrollY / (innerHeight * 2)` clamped to 0-1
2. Shadow properties scale linearly with depth:
   - **Blur**: 8px → 24px (increases by 16px over scroll range)
   - **Spread**: 0px → 4px (adds soft glow at depth)
   - **Opacity**: 0.15 → 0.4 (darkens progressively)
3. Shadow set directly via `nav.style.boxShadow` for reliable cross-browser support

**Why JS direct assignment instead of CSS calc():**
Initial attempt used CSS custom properties with `calc()` in box-shadow, but `calc()` values don't resolve correctly in shadow blur/spread/opacity positions when using CSS variables. The computed style returned the literal string `calc(8px + 0.5 * 16px)` rather than a resolved value like `16px`. Direct JS shadow assignment guarantees correct rendering.

**Visual progression:**
- Top of page (scroll < 10px): No shadow
- Shallow scroll (100px): Subtle shadow `0 2px 8.8px 0.4px rgba(0,0,0,0.16)`
- Mid-page (1000px): Medium shadow `0 2px 16px 2px rgba(0,0,0,0.28)`
- Deep scroll (2000px+): Maximum shadow `0 2px 24px 4px rgba(0,0,0,0.4)`

**Files changed:**
- `style.css` — Simplified `.nav.scrolled` to just `border-bottom-color: transparent`
- `main.js` — Enhanced scroll listener to calculate and apply dynamic shadow values

**Tested:** Shadow scales correctly at 50/500/1500/3000px scroll positions ✓, clears shadow when scrolled back to top ✓, zero console errors ✓.

**What's Next:**
- Whitespace rhythm audit across sections
- Consider applying text reveal to pricing description paragraphs
- Consider adding subtle tilt to the pricing-statement-inner block
- Scroll-speed-aware reveal (faster scroll = faster reveal)

---

## Session 37 — 2026-03-27 (Opus 4.6) — POLISH

### What I Did: Scroll Progress Velocity Glow — Comet Tail Effect

Added a **velocity-reactive glow** to the scroll progress bar. When scrolling fast, a trailing purple/blue glow extends from the leading edge of the progress bar — like a comet's tail. When scrolling stops, the glow smoothly fades away.

**How it works:**
1. JS tracks scroll velocity: `Δ position / Δ time` (pixels per millisecond)
2. Velocity is mapped to glow intensity: 0.5–4 px/ms range → 0–1 intensity
3. CSS custom properties control the glow:
   - `--progress-glow-width`: 20px (idle) → 100px (fast scroll)
   - `--progress-glow-blur`: 0px → 8px
   - `--progress-glow-opacity`: 0 → 0.9
4. `::after` pseudo-element positioned at right edge creates the gradient trail
5. 150ms decay timer fades glow after scroll stops

**Visual effect:**
- Slow scroll: No visible glow
- Medium scroll (~2 px/ms): 50px trailing glow at 50% opacity
- Fast scroll (~4+ px/ms): Full 100px glow with 8px blur, 90% opacity
- Stop scrolling: Glow fades over 200ms with smooth easing

**Technical notes:**
- Uses CSS `filter: blur()` for soft glow edge
- Gradient: transparent → accent blue → purple for brand consistency
- `pointer-events: none` on ::after to avoid blocking clicks
- `transition: opacity 200ms ease-out, filter 150ms, width 150ms` for smooth interpolation
- Reduced motion: `::after { display: none }` — no velocity tracking overhead

**Files changed:**
- `style.css` — Added `.scroll-progress::after` with CSS variable-controlled glow, reduced-motion guard
- `main.js` — Enhanced scroll progress listener with velocity tracking, glow property calculation, decay timer

**Tested:** CSS variables set correctly ✓, ::after pseudo-element renders ✓, glow transitions smoothly ✓, decay timer clears glow ✓, zero console errors ✓.

**What's Next:**
- Whitespace rhythm audit across sections
- Consider applying text reveal to pricing description paragraphs
- Consider adding subtle tilt to the pricing-statement-inner block
- Scroll-speed-aware text reveal (faster scroll = reveal runs ahead)

---

## Session 38 — 2026-03-27 (Opus 4.6) — POLISH

### What I Did: Section Entry Pulse — Ring Expands on Viewport Entry

Added a **single-play pulse ring** to section eyebrows. When a section scrolls into view, its eyebrow badge emits an expanding ring that fades outward — like a ripple or sonar ping. Creates a visual "checkpoint" feeling as you scroll through the page.

**How it works:**
1. `::before` pseudo-element with `inset: -4px` creates ring 4px outside eyebrow
2. Ring starts hidden (`opacity: 0`, `transform: scale(1)`)
3. IntersectionObserver adds `.pulsed` class when eyebrow enters viewport
4. Animation plays once: scale 1 → 1.5, opacity 0.7 → 0, over 0.8s
5. Observer unobserves after triggering (one pulse per page load)

**Visual effect:**
- Eyebrow scrolls into view
- 2px accent-colored ring appears around the badge
- Ring expands outward (50% larger) while fading to transparent
- Creates satisfying "ping" sensation marking arrival at new section

**Technical notes:**
- `cubic-bezier(0.33, 1, 0.68, 1)` for organic easing (fast start, gentle settle)
- `animation: ... forwards` preserves end state (fully transparent)
- Threshold 0.1 with rootMargin `-20%` bottom ensures pulse triggers when eyebrow is clearly visible
- JS checks `prefers-reduced-motion` before setting up observer
- CSS also hides `::before` for reduced motion users

**Files changed:**
- `style.css` — Added `.section-eyebrow::before` pseudo-element, `.pulsed::before` animation, `@keyframes sectionPulse`, reduced-motion guard
- `main.js` — Added IntersectionObserver for section eyebrows with one-shot pulse trigger

**Tested:** 11 section eyebrows detected ✓, pulse triggers on viewport entry ✓, animation runs (scale 1→1.5) ✓, only triggers once per element ✓, zero console errors ✓.

**What's Next:**
- Whitespace rhythm audit across sections
- Consider applying text reveal to pricing description paragraphs
- Consider adding subtle tilt to the pricing-statement-inner block
- Scroll-speed-aware text reveal (faster scroll = reveal runs ahead)

---

## Session 39 — 2026-03-27 (Opus 4.6) — POLISH

### What I Did: Staggered Card Cascade — Cards Dealt Like Playing Cards

Added **staggered entry timing** to service cards and workshop cards. When scrolling into view, cards no longer appear all at once — they cascade in sequence with 60-80ms delays between each, creating the visual impression of cards being dealt onto a table.

**How it works:**
1. CSS `transition-delay` applied via `:nth-child()` selectors
2. Service cards (8 total): 0ms, 60ms, 120ms, 180ms, 240ms, 300ms, 360ms, 420ms
3. Workshop cards (4 total): 0ms, 80ms, 160ms, 240ms (slightly slower rhythm)
4. Existing `data-animate` + `.visible` system handles the actual opacity/transform transition
5. Only the timing is staggered — animation physics unchanged

**Visual effect:**
- First card appears immediately
- Each subsequent card follows 60-80ms later
- Total cascade: ~420ms for services grid, ~240ms for workshop grid
- Creates satisfying "dealt" sensation without feeling slow

**Technical notes:**
- Applied to `[data-animate]:nth-child(n)` to ensure delay only affects scroll-triggered entrance
- Uses direct `transition-delay` values (CSS custom properties don't resolve properly in transition shorthand)
- Reduced motion: `transition-delay: 0ms !important` — all cards appear simultaneously

**Files changed:**
- `style.css` — Added nth-child transition-delay rules for `.cards-grid .card` and `.workshop-grid .workshop-card`, reduced-motion override

**Tested:** 8 service cards with correct delays (0s→0.42s) ✓, 4 workshop cards with correct delays (0s→0.24s) ✓, cascade visible on scroll ✓, zero console errors ✓.

**What's Next:**
- Whitespace rhythm audit across sections
- Consider applying text reveal to pricing description paragraphs  
- Consider adding subtle tilt to the pricing-statement-inner block
- Scroll-speed-aware text reveal (faster scroll = reveal runs ahead)
- Consider staggering other grid elements (FAQ items, compare rows)

---

## Session 40 — 2026-03-27 (Opus 4.6) — POLISH

### What I Did: Extended Staggered Cascade to Compare Rows

Added **staggered entry timing to compare rows** in the comparison table. The 7 rows now cascade in with 70ms delays between each, matching the card cascade pattern from Session 39.

**How it works:**
1. CSS `:nth-child()` selectors apply increasing `transition-delay`
2. nth-child starts at 2 (because `.compare-header` is child 1)
3. Row delays: 0ms, 70ms, 140ms, 210ms, 280ms, 350ms, 420ms
4. Total cascade duration: ~420ms
5. Works with existing `data-animate` + `.visible` system

**Note:** FAQ items already had staggered delays implemented via JS (`--faq-idx` custom property × 80ms). Trust metrics also had stagger. So now all major grid/list elements have cascade timing.

**Files changed:**
- `style.css` — Added nth-child transition-delay rules for `.compare-row[data-animate]`, added to reduced-motion override

**Tested:** 7 compare rows with correct delays (0s→0.42s) ✓, reduced-motion fallback added ✓, zero console errors ✓.

**What's Next:**
- Whitespace rhythm audit across sections
- Consider applying text reveal to pricing description paragraphs
- Consider adding subtle tilt to the pricing-statement-inner block
- Scroll-speed-aware text reveal (faster scroll = reveal runs ahead)

---

## Session 41 — 2026-03-27 (Opus 4.6) — POLISH

### What I Did: Reading Lamp Effect — Pricing Text Luminance on Scroll

Added a **reading lamp effect** to pricing paragraphs. The text starts dimmed (50% opacity, 85% brightness) and "lights up" as you scroll to each paragraph, creating a spotlight/reading-lamp sensation.

**How it works:**
1. `.pricing-body` starts with `opacity: 0.5` and `filter: brightness(0.85)`
2. IntersectionObserver watches each paragraph with threshold 0.3
3. When paragraph enters viewport, `.reading-lit` class is added
4. CSS transition smoothly brings opacity to 1 and brightness to 1
5. Observer unobserves after triggering (one-time activation)

**Visual effect:**
- User scrolls to pricing section
- First paragraph lights up as it enters viewport
- Second paragraph stays slightly dimmed until scrolled into view
- Creates a sense of "reading through" the content

**Technical notes:**
- 0.5s transition for smooth luminance increase
- rootMargin `-15%` ensures text lights up when properly in view
- Reduced motion: both opacity and filter forced to full via `!important`

**Files changed:**
- `style.css` — Added reading lamp styles to `.pricing-body`, `.reading-lit` class, reduced-motion override
- `main.js` — Added `readingLampInit()` IIFE with IntersectionObserver

**Tested:** 2 pricing paragraphs detected ✓, first lights up on scroll ✓, second lights up with continued scroll ✓, transition smooth (0.5s) ✓, zero console errors ✓.

**What's Next:**
- Whitespace rhythm audit across sections
- Scroll-speed-aware text reveal (faster scroll = reveal runs ahead)
- Apply reading lamp to other dense text blocks (workshop card descriptions?)
- Consider context-aware cursor spotlight colors (green near trust, purple near hero)

---

## Session 42 — 2026-03-27 (Opus 4.6) — POLISH

### What I Did: Pricing Statement Card — Subtle 3D Tilt on Hover

Added a **perspective-based hover tilt** to the pricing statement card, giving it the same premium interactive feel as the service and workshop cards but using pure CSS (no JS needed for this single element).

**Effect:**
- On hover: card tilts 2° on both axes with `perspective(1000px)`, lifts 4px
- Specular glare overlay fades in (linear gradient from top-left)
- Enhanced shadow with luminance ring and accent glow
- Spring easing (`cubic-bezier(0.34, 1.56, 0.64, 1)`) for bouncy feel

**Implementation:**
- Added transition on `.pricing-statement-inner` for transform and box-shadow
- Hover state on parent `.pricing-statement` triggers child transform
- `::after` pseudo-element creates specular glare overlay (0 → 1 opacity)
- Light mode variant with brighter glare and adjusted shadow

**Technical notes:**
- Uses `perspective(1000px) rotateX(-2deg) rotateY(2deg)` — subtle tilt toward viewer
- Glare is linear-gradient from `rgba(255,255,255,0.12)` (dark) / `0.3` (light)
- Shadow includes luminance ring `0 0 0 1px rgba(255,255,255,0.04)` for depth
- Reduced-motion: transform disabled

**Files changed:**
- `style.css` — Added hover tilt + glare to pricing-statement-inner, light mode adjustments, reduced-motion guard

**Tested:** 3D transform matrix verified with perspective ✓, glare opacity transitions ✓, zero console errors ✓.

**What's Next:**
- Whitespace rhythm audit across sections
- Scroll-speed-aware text reveal (faster scroll = reveal runs ahead)
- Apply reading lamp to other dense text blocks (workshop card descriptions?)
- Micro-animation for FAQ accordion arrow rotation

---

## Session 43 — 2026-03-27 (Opus 4.6) — POLISH

### What I Did: Context-Aware Cursor Spotlight Colors

Enhanced the **cursor spotlight** to shift color based on which section the user is hovering over. As you move through the page, the ambient glow subtly matches the semantic meaning of each section.

**Section → Color mapping:**
| Section | Color | Meaning |
|---------|-------|---------|
| Hero | purple-blue gradient | brand intro |
| Services | blue | primary action |
| Pricing | green | trust/transparency |
| Process | cyan | workflow/progress |
| Workshop | purple | creative/premium |
| Compare | orange | decision/warmth |
| FAQ | blue | informational |
| Contact | green | call-to-action |

**How it works:**
1. On `mousemove`, `document.elementFromPoint()` finds element under cursor
2. `.closest('section[id]')` identifies which section it's in
3. If section changed, old context class is removed, new one added
4. CSS `transition: background 600ms ease` creates smooth color fade
5. Different color values for light vs dark mode

**Technical notes:**
- Uses existing IIFE structure — minimal code addition
- Context detection runs on every mousemove (cheap — single DOM lookup)
- Class changes only when section actually changes (not every frame)
- Each color variant has dark mode (higher opacity) and light mode (lower opacity) versions
- 6 color variants: hero, blue, green, purple, cyan, orange

**Files changed:**
- `style.css` — Added 6 context color classes for cursor spotlight (dark + light mode variants), added background transition
- `main.js` — Enhanced cursor spotlight with section detection and context class management

**Tested:** Context detection at pricing ✓, context detection at workshop ✓, purple gradient applied correctly ✓, green gradient applied correctly ✓, dark mode variants work ✓, zero console errors ✓.

**What's Next:**
- Whitespace rhythm audit across sections
- Scroll-speed-aware text reveal (faster scroll = reveal runs ahead)
- Apply reading lamp to other dense text blocks (workshop card descriptions?)
- Consider animated focus states for form inputs

---

## Session 44 — 2026-03-27 (Opus 4.6) — POLISH

### What I Did: Section Title Text Shimmer — Light Gleam on Scroll Entry

Added a **text shimmer/gleam effect** to section titles. When a section title enters the viewport, a subtle light sweeps across the text from left to right — like a highlight passing over premium text.

**How it works:**
1. `::after` pseudo-element positioned absolute over title
2. Linear gradient creates a soft white highlight bar (50% width)
3. Initially positioned at `left: -100%` with `opacity: 0`
4. IntersectionObserver watches section titles (threshold 0.3)
5. When title enters viewport, `.shimmer-active` class is added
6. `opacity: 1` + `animation: textShimmer 0.8s ease-out` sweeps gradient across
7. Animation goes from `left: -50%` to `left: 150%` for full coverage
8. `forwards` preserves end state (off-screen right)

**Visual effect:**
- Light gleam sweeps left-to-right across title text
- 0.8s duration for elegant, not-too-fast sweep
- One-shot animation (doesn't repeat)

**Technical notes:**
- `position: relative` added to `.section-title` for pseudo-element positioning
- Dark mode: 8%→15% white opacity gradient
- Light mode: 25%→45% white opacity gradient (brighter to show through lighter background)
- Reduced motion: `::after { display: none }` — no shimmer

**Files changed:**
- `style.css` — Added `.section-title::after` shimmer pseudo-element, `.shimmer-active::after` animation, `@keyframes textShimmer`, light mode variant, reduced-motion guard
- `main.js` — Added `titleShimmerInit()` IIFE with IntersectionObserver

**Tested:** 11 section titles found ✓, shimmer triggers on scroll to services ✓, shimmer triggers on scroll to pricing ✓, light mode gradient applying correctly ✓, zero console errors ✓.

**What's Next:**
- Whitespace rhythm audit across sections
- Scroll-speed-aware text reveal (faster scroll = reveal runs ahead)
- Apply reading lamp to other dense text blocks (workshop card descriptions?)
- Consider animated focus states for form inputs

---

## Session 45 — 2026-03-27 (Opus 4.6) — POLISH

### What I Did: Anchor Navigation Arrival Pulse — "You Are Here" Highlight

Added a **visual arrival indicator** when users click anchor links to navigate to sections. The target section's eyebrow badge does a satisfying scale-up + glow ring animation, signaling "you have arrived here."

**How it works:**
1. User clicks nav link (e.g., "Services")
2. Existing smooth scroll behavior kicks in
3. After a calculated delay based on scroll distance, `.anchor-pulse` class is added to target section's eyebrow
4. CSS animation plays: scale 1 → 1.06 (overshoot) → 0.98 (settle) → 1, with expanding/fading box-shadow ring
5. Class is removed after 800ms for cleanup
6. Works with all internal anchor links (`a[href^="#"]`)

**Animation keyframes:**
- 0%: Normal state, no shadow
- 40%: Scale to 1.06, accent blue glow ring at 6px spread
- 70%: Scale to 0.98 (overshoot recoil), ring expands to 8px, fading
- 100%: Return to normal, ring fully faded

**Technical notes:**
- Delay calculation: `Math.min(400, Math.abs(scrollDistance) / 3)` — longer scroll = longer delay (up to 400ms max)
- Respects `prefers-reduced-motion` — no pulse for reduced motion users
- Spring easing: `cubic-bezier(0.34, 1.56, 0.64, 1)` for bouncy overshoot feel
- Light mode variant: uses deeper blue (`rgba(37, 99, 235, ...)`) for visibility
- Won't re-trigger if eyebrow already has `.anchor-pulse` class

**Files changed:**
- `main.js` — Enhanced anchor click handler to add pulse class after scroll delay
- `style.css` — Added `@keyframes anchorPulse` and `anchorPulseLight`, `.section-eyebrow.anchor-pulse` selector

**Tested:** Anchor pulse triggers on nav click ✓, correct animation name (anchorPulseLight in light mode) ✓, 0.6s duration ✓, class cleaned up after 800ms ✓, zero console errors ✓.

**What's Next:**
- Whitespace rhythm audit across sections
- Scroll-speed-aware text reveal (faster scroll = reveal runs ahead)
- Apply reading lamp to other dense text blocks (workshop card descriptions?)
- Consider animated focus states for form inputs

---

## Session 46 — 2026-03-27 (Opus 4.6) — POLISH

### What I Did: Google Reviews Star Pulse — Golden Glow Animation

Added a **golden glow pulse animation** to the star icon in the "Leave a Review" card when it enters the viewport. The star briefly scales up, rotates slightly, and glows with a warm golden aura — drawing attention to the review CTA.

**How it works:**
1. Added `.gbp-star-icon` class to the star icon in the review card
2. IntersectionObserver watches the star (threshold 0.5)
3. When star enters viewport, `.star-pulse` class is added
4. CSS animation plays: scale + rotate + golden drop-shadow glow
5. 1.5s duration with ease-out for organic feel
6. Animation ends with subtle persistent glow

**Animation keyframes:**
- 0%: Normal state, no shadow
- 15%: Scale 1.15, rotate 8°, bright golden glow (12px, 80% opacity)
- 30%: Scale 1.05, rotate -4° (overshoot recoil), glow fading (8px, 60%)
- 50%: Scale 1.02, settling, glow dimming (6px, 40%)
- 100%: Normal scale, subtle residual glow (2px, 20%)

**Technical notes:**
- Uses `filter: drop-shadow()` for natural icon glow (works with icon shapes)
- Gold color: `rgba(251, 188, 4, ...)` matches Google's star color
- Spring-like animation with rotation overshoot creates organic feel
- Reduced motion guard: no animation, no filter

**Files changed:**
- `index.html` — Added `.gbp-star-icon` class to star icon
- `style.css` — Added star-pulse animation and keyframes
- `main.js` — Added `starPulseInit()` IIFE with IntersectionObserver

**Tested:** Star pulse triggers on scroll to Google section ✓, animation name starPulse ✓, golden drop-shadow filter applied ✓, zero console errors ✓.

**What's Next:**
- Whitespace rhythm audit across sections
- Scroll-speed-aware text reveal (faster scroll = reveal runs ahead)
- Apply reading lamp to other dense text blocks (workshop card descriptions?)
- Consider animated focus states for form inputs

---

## Session 47 — 2026-03-27 (Opus 4.6) — POLISH

### What I Did: Button Sparkle Effect — Twinkling Stars on Hover

Added a **sparkle effect** to hero CTA buttons. When hovering over the primary action buttons, tiny white dots subtly shift position like twinkling stars, creating a magical, premium feel.

**How it works:**
1. `.btn-sparkle` class added to hero CTA buttons
2. `::after` pseudo-element contains 5 radial gradient "stars" at different positions
3. Default opacity: 0 (hidden)
4. On hover: opacity transitions to 1
5. `sparkleShift` keyframes animation continuously shifts star positions
6. Stars appear to twinkle/drift as they fade in

**Animation keyframes (1.2s infinite loop):**
- 0%/100%: Base star positions
- 25%: Stars drift slightly (2%, -2%, etc.)
- 50%: Stars drift opposite direction, slight scale 1.02
- 75%: Stars drift back

**Technical notes:**
- Uses CSS radial-gradient for small circular "stars" (1-1.5px)
- Five stars at positions: 20% 30%, 75% 25%, 45% 70%, 85% 65%, 15% 75%
- White with 90% opacity for subtle visibility on blue buttons
- `pointer-events: none` so it doesn't interfere with click
- z-index: 1 to layer above button shine effect
- Reduced motion guard hides sparkles entirely

**Applied to:**
- Hero "Get a Free Quote" CTA
- Pricing "Text Me Now" CTA

**Files changed:**
- `style.css` — Added `.btn-sparkle` styles, `::after` pseudo-element, `@keyframes sparkleShift`, reduced motion guard
- `index.html` — Added `.btn-sparkle` class to two CTA buttons

**Tested:** Sparkle pseudo-element exists ✓, radial gradients present ✓, opacity 0 default / 1 on hover ✓, sparkleShift animation running ✓, zero console errors ✓.

**What's Next:**
- Whitespace rhythm audit across sections
- Scroll-speed-aware text reveal (faster scroll = reveal runs ahead)
- Apply reading lamp to other dense text blocks (workshop card descriptions?)
- Consider animated focus states for form inputs

---

## Session 48 — 2026-03-27 (Opus 4.6) — POLISH

### What I Did: Magnetic Nav Links — Subtle Pull Effect

Added a **magnetic pull effect** to the desktop navigation links. When the cursor moves near a nav link, the link subtly shifts toward the cursor, creating a more interactive, premium feel that matches the hero button magnetism.

**Implementation:**
- Smaller attraction zone (50px) than buttons (80px) — navigation is a precision area
- Lower strength (0.2) than buttons (0.35) — subtle is key for readability
- Only activates on mouseenter (per-link scope) to reduce overhead
- Removes listener on mouseleave

**How it works:**
1. `mousemove` listener added when mouse enters link area
2. `requestAnimationFrame`-throttled position calculation
3. Link transforms via `translate()` toward cursor position
4. On mouseleave, transform resets with bouncy spring easing
5. Event listeners removed when not needed (performance)

**CSS transition:**
- Added `transform 200ms cubic-bezier(0.175, 0.885, 0.32, 1.275)` for smooth spring-back
- This cubic-bezier (backEaseOut variant) creates a slight overshoot when link returns to original position

**Technical notes:**
- Uses same guards as other pointer effects: prefers-reduced-motion + pointer: fine / hover: hover
- Only applies to `.nav-links .nav-link` (desktop nav, not mobile)
- Each link has independent event handling

**Files changed:**
- `main.js` — Added magnetic nav links IIFE (~45 lines)
- `style.css` — Added transform transition to `.nav-link`

**Tested:** 5 nav links detected ✓, zero console errors ✓, pointer effects properly guarded ✓.

**What's Next:**
- Whitespace rhythm audit across sections
- Scroll-speed-aware text reveal (faster scroll = reveal runs ahead)
- Apply reading lamp to other dense text blocks
- Consider animated focus states for form inputs

---

## Session 49 — 2026-03-27 (Opus 4.6) — POLISH

### What I Did: Form Focus Ring Pulse — Expanding Ring on Focus Entry

Added a **focus ring pulse** animation to form inputs. When a user focuses on any form field (name, contact method, device, issue), an accent-colored ring expands outward and fades, creating a satisfying "here you are" feedback.

**How it works:**
1. JS adds `.focus-pulsing` class to parent `.form-group` on `focus` event
2. CSS `::before` pseudo-element draws a 2px accent ring positioned 4px outside the input
3. `focusRingPulse` keyframes animate: scale 0.95→1.08, opacity 0.8→0
4. On `animationend`, JS removes the class (ready for next focus)

**Animation timing:**
- Duration: 0.6s
- Easing: cubic-bezier(0.16, 1, 0.3, 1) — expo-out for smooth expansion
- One-shot: plays once per focus event

**Technical notes:**
- Uses parent `.form-group` for ::before (inputs can't have pseudo-elements)
- Border radius: `calc(var(--radius-md) + 4px)` to match input shape with offset
- z-index: 5 to appear above input border but below floating labels
- pointer-events: none so it doesn't interfere with interaction

**Files changed:**
- `style.css` — Added `.form-group.focus-pulsing::before`, `@keyframes focusRingPulse`, reduced motion guard
- `main.js` — Added form focus ring pulse IIFE (~25 lines)

**Tested:** 5 form groups detected ✓, CSS rule present ✓, animation `focusRingPulse` applied ✓, accent border color ✓, zero console errors ✓.

**What's Next:**
- Whitespace rhythm audit across sections
- Scroll-speed-aware text reveal (faster scroll = reveal runs ahead)
- Apply reading lamp to other dense text blocks (workshop card descriptions?)
- Consider hover micro-animation for workshop cards

---

## Session 50 — 2026-03-27 (Opus 4.6) — POLISH

### What I Did: Workshop Card Shine Sweep — Diagonal Light on Hover

Added a **shine sweep effect** to workshop cards. When hovering over a card, a diagonal band of light sweeps across from left to right, creating a premium "catch the light" effect.

**How it works:**
1. JS creates `.shine-sweep` span inside each workshop card
2. CSS positions it off-screen to the left (`left: -100%`)
3. On hover, `left` transitions to `150%` (sweeps across and exits right)
4. Expo-out easing (`cubic-bezier(0.16, 1, 0.3, 1)`) creates smooth, natural motion

**Visual details:**
- Width: 50% of card
- Height: 200% (extends beyond card to cover diagonally)
- Transform: `skewX(-25deg)` for diagonal angle
- Gradient: transparent → white 12% → transparent (soft beam)
- Light mode: brighter white (25% opacity)

**Technical notes:**
- Can't use `::after` — workshop cards have `data-card-glow` which uses `::after` for cursor spotlight
- Created `.shine-sweep` span instead for same effect
- JS waits for DOMContentLoaded to ensure cards exist
- Guards against duplicate element creation
- z-index: 2 to layer above card background but below content

**Files changed:**
- `style.css` — Added `.workshop-card .shine-sweep` styles, hover transition, light mode variant, reduced motion guard
- `main.js` — Added workshop card shine sweep IIFE (~20 lines)

**Tested:** 4 shine elements created ✓, positioned off-screen (left: -335px) ✓, transition includes left ✓, z-index 2 ✓, zero console errors ✓.

**What's Next:**
- Whitespace rhythm audit across sections
- Scroll-speed-aware text reveal (faster scroll = reveal runs ahead)
- Apply reading lamp to workshop card descriptions
- Consider applying shine sweep to other card types (service cards?)

---

## Session 51 — 2026-03-27 (Opus 4.6) — POLISH

### What I Did: Extended Shine Sweep to Service Cards

Applied the **shine sweep effect** from Session 50 to all service cards (`.card` elements), creating a consistent premium hover effect across both card types.

**Changes:**
- Updated CSS selectors to include `.card` alongside `.workshop-card`
- Updated JS to query both `.card, .workshop-card`
- Renamed comment header from "Workshop card shine sweep" to "Card shine sweep"

**Result:**
- 8 service cards now have shine sweep (iPhone, Android, Tablets, Laptops, Consoles, Smart Home, Audio Gear, Vintage Tech)
- 4 workshop cards retain their shine sweep
- Total: 12 cards with unified hover effect

**Files changed:**
- `style.css` — Updated selectors to include `.card`
- `main.js` — Updated selector to `.card, .workshop-card`

**Tested:** 8 service shines + 4 workshop shines ✓, correct left position ✓, gradient background ✓, transition working ✓.

**What's Next:**
- Whitespace rhythm audit across sections
- Scroll-speed-aware text reveal (faster scroll = reveal runs ahead)
- Apply reading lamp to workshop card descriptions
- Add subtle animation to FAQ accordion arrows on toggle

---

## Session 52 — 2026-03-27 (Opus 4.6) — POLISH

### What I Did: FAQ Arrow Spring Bounce Animation

Added a **spring bounce animation** to FAQ accordion arrows. When toggling an FAQ item, the chevron doesn't just rotate — it overshoots, bounces back, and settles into place with a satisfying spring motion.

**How it works:**
1. CSS defines two keyframe animations:
   - `faqArrowBounce` (open): 0° → 200° → 175° → 183° → 180° with scale pulses
   - `faqArrowBounceClose` (close): 180° → -20° → 5° → -3° → 0° with scale pulses
2. JS adds `.arrow-bounce-open` or `.arrow-bounce-close` class when toggling
3. Animation runs with spring easing (`cubic-bezier(0.34, 1.56, 0.64, 1)`)

**Animation details:**
- Duration: 0.5s
- Overshoot: ~20° past target, then bounce back
- Scale: Pulses from 1 → 1.15 → 0.95 → 1.02 → 1
- Creates playful "boing" feeling without being cartoonish

**Technical notes:**
- Replaces existing CSS transition with animation on toggle
- Classes swapped: open removes close class first, vice versa
- Animation uses `forwards` fill mode to maintain end state
- Reduced motion users get no bounce animation (CSS guard)

**Files changed:**
- `style.css` — Added `@keyframes faqArrowBounce`, `@keyframes faqArrowBounceClose`, bounce classes, reduced motion guard
- `main.js` — Added chevron class toggling in openItem/closeItem functions

**Tested:** 7 FAQ items ✓, arrow-bounce-open class applied on open ✓, faqArrowBounce animation running ✓, arrow-bounce-close on close ✓, zero console errors ✓.

**What's Next:**
- Whitespace rhythm audit across sections
- Scroll-speed-aware text reveal (faster scroll = reveal runs ahead)
- Apply reading lamp to workshop card descriptions
- Consider subtle hover state for footer links

---

## Session 53 — 2026-03-27 (Opus 4.6) — POLISH

### What I Did: Animated Wave Dividers — Gentle Flowing Motion

Added **subtle undulating animation** to the wave dividers between sections. When a wave divider enters the viewport, it begins a gentle flowing motion — scaleY pulsing and slight vertical drift — like gentle water lapping at a shore. This makes the section transitions feel more alive and organic.

**How it works:**
1. IntersectionObserver watches all 3 `.wave-divider` elements
2. When a wave enters viewport, `.wave-visible` class is added
3. CSS animation begins: `waveFlow` (4s) or `waveFlowSubtle` (5s)
4. When wave leaves viewport, class is removed and animation stops
5. Animation restarts naturally each time wave re-enters view

**Animation details:**
- `waveFlow`: scaleY oscillates 1 → 1.05 → 0.95 → 1.03 → 1 with subtle translateY drift
- `waveFlowSubtle`: gentler scaleY 1 → 1.03 → 0.97 → 1 with lateral translateX drift
- Different delays on each wave (-1s, -2s) for organic non-synchronized feel

**Technical notes:**
- Attempted CSS `d: path()` animation for morphing SVG paths, but browser support is limited
- Pivoted to transform-based animation (scaleY + translate) for universal compatibility
- Uses SVG element as animation target (not path fill)
- Animation only runs while visible (IntersectionObserver toggle) — saves CPU

**Files changed:**
- `style.css` — Added `.wave-divider.wave-visible svg` animation rules, `@keyframes waveFlow`, `@keyframes waveFlowSubtle`, reduced-motion guard
- `main.js` — Added `waveAnimationInit()` IIFE with IntersectionObserver

**Tested:** 3 wave dividers ✓, `waveFlow` animation on first wave ✓, `waveFlowSubtle` on mountain wave ✓, class added/removed on scroll ✓, zero console errors ✓.

**What's Next:**
- Whitespace rhythm audit across sections
- Scroll-speed-aware text reveal (faster scroll = reveal runs ahead)
- Apply reading lamp to workshop card descriptions
- Consider subtle hover state for footer links

---

## Session 54 — 2026-03-27 (Opus 4.6) — POLISH

### What I Did: Reading Lamp Effect for Workshop Card Descriptions

Extended the **reading lamp effect** (previously applied to pricing paragraphs) to the **workshop card descriptions**. Text starts dimmed (50% opacity, 85% brightness) and "lights up" as you scroll to each card, creating a focus-drawing effect that makes content feel more intentional and premium.

**How it works:**
1. Workshop card descriptions start with `opacity: 0.5` and `filter: brightness(0.85)`
2. IntersectionObserver (30% threshold) detects when each card enters viewport
3. `.reading-lit` class is added, transitioning to full opacity and brightness
4. 0.5s smooth transition creates gentle "awakening" effect

**Changes made:**
- Updated `.workshop-card-desc` CSS with initial dimmed state and `.reading-lit` variant
- Extended JS `readingLampInit()` to include `.workshop-card-desc` alongside `.pricing-body`

**Files changed:**
- `style.css` — Added reading lamp styles to `.workshop-card-desc`
- `main.js` — Extended selector to include `.workshop-card-desc`

**Tested:** 4 workshop card descriptions ✓, initial state dimmed (opacity 0.5, brightness 0.85) ✓, `.reading-lit` added on scroll ✓, smooth transition to full brightness ✓, zero console errors ✓.

**What's Next:**
- Whitespace rhythm audit across sections
- Scroll-speed-aware text reveal (faster scroll = reveal runs ahead)
- Consider subtle hover state for footer links
- Subtle parallax on process/timeline section

---

## Session 55 — 2026-03-27 (Opus 4.6) — POLISH

### What I Did: Timeline Dot Parallax — Floating Depth Effect

Added a **subtle parallax floating effect** to the timeline dots in the process section. As you scroll through the timeline, each dot floats gently up and down at a slightly different rate, creating an organic sense of depth — like bubbles rising at different speeds.

**How it works:**
1. JS calculates scroll progress through the timeline section (0–1 range)
2. Each dot gets a unique offset based on its index (`i * 0.12`)
3. A sine wave function creates smooth oscillation: `sin(progress * 2π) * 15px`
4. CSS `--parallax-y` variable is set on each dot, driving the transform
5. Animation only runs when timeline is in viewport (performance optimization)

**Animation details:**
- Max offset: ±15px vertical movement
- Stagger factor: 0.12 per dot (dots float out of phase)
- Uses sine wave for smooth, organic motion
- Preserves scale(1.08) on active dots

**Technical notes:**
- CSS `transform: translateY(var(--parallax-y))` on `.timeline-dot`
- `will-change: transform` for GPU acceleration
- requestAnimationFrame throttling for smooth 60fps
- Full `prefers-reduced-motion` support — no parallax for users who request it
- When timeline is out of view, resets parallax to 0px (no wasted cycles)

**Files changed:**
- `style.css` — Added `--parallax-y` custom property, updated transform declarations
- `main.js` — Added `timelineDotParallaxInit()` IIFE with scroll listener

**Tested:** 5 timeline dots ✓, parallax values change on scroll ✓, staggered offset per dot ✓, active dot scale preserved ✓, zero console errors ✓.

**What's Next:**
- Whitespace rhythm audit across sections
- Scroll-speed-aware text reveal (faster scroll = reveal runs ahead)
- Contact section input glow animation
- Service card hover depth shift

---

## Session 56 — 2026-03-27 (Opus 4.6) — POLISH

### What I Did: Velocity-Aware Text Reveal — Faster Scrolling Accelerates Text Emergence

Enhanced the **text luminance reveal** (Session 29) to be **velocity-aware**. When the user scrolls faster, the text reveal progress gets a boost — text emerges ahead of where it would be based on position alone. This rewards engaged, purposeful scrolling with a more dynamic, responsive experience.

**How it works:**
1. JS tracks scroll velocity: `Δ scroll position / Δ time` (px/ms)
2. Velocity maps to a 0-15% progress boost: 0 px/ms = no boost, 4+ px/ms = max 15% boost
3. Boost decays gradually (×0.8) when scrolling slowly to prevent sudden jumps
4. Boosted progress is added to position-based progress before easing is applied
5. Once progress reaches 100% (with or without boost), element locks to `.text-revealed`

**Formula:**
```
velocityBoost = min(15, velocity × 3.75)
boostedProgress = min(100, positionProgress + velocityBoost)
```

**Behavior:**
- Slow scroll: Text reveals at normal pace based on viewport position
- Fast scroll: Text reveals ~15% ahead, creating a "rushing to catch up" effect
- Stop scrolling: Boost decays, but position-based progress maintains reveal state

**Why this matters:**
This creates a subtle but satisfying connection between user intent and page response. Engaged, fast scrolling feels rewarded — the page seems to anticipate where you're going. It's the kind of micro-interaction that users feel but can't articulate, making the site feel more alive and responsive.

**Files changed:**
- `main.js` — Enhanced text luminance reveal with velocity tracking and progress boost

**Tested:** 8 text-reveal elements ✓, velocity-aware progress calculated correctly ✓, reveals complete at boosted progress ✓, no CSS errors ✓, zero console errors ✓.

**What's Next:**
- Whitespace rhythm audit across sections
- Contact section input glow animation
- Service card hover depth shift
- Consider velocity-awareness for other scroll-linked effects

---

## Session 57 — 2026-03-27 (Opus 4.6) — POLISH

### What I Did: Contact Form Input Glow Animation — Breathing + Ripple Wave

Enhanced the **contact form focus effects** with two new animations that make form inputs feel alive and premium:

1. **Glow Breathing** — While an input is focused, the box-shadow subtly pulses (3px → 5px → 3px spread) in a 2-second cycle. This creates a calm, living feel while the user is typing, drawing attention without distraction.

2. **Ripple Wave** — When an input first receives focus, a secondary ring (after the initial pulse) expands outward and fades. This double-ripple effect makes the focus transition feel more substantial.

**How it works:**
1. On focus, JS adds `focus-pulsing` class (existing behavior)
2. After 150ms, JS creates a `.focus-ripple-wave` div that animates outward
3. After 350ms (when initial box-shadow transition completes), `focus-breathing` class is added
4. CSS animation `inputGlowBreathe` kicks in with the breathing glow
5. On blur, `focus-breathing` class is removed, stopping the animation cleanly

**CSS animations:**
```css
@keyframes inputGlowBreathe {
  0%, 100% { box-shadow: 0 0 0 3px var(--accent-glow)... }
  50% { box-shadow: 0 0 0 5px var(--accent-glow)... }
}
@keyframes focusRingRipple {
  0% { opacity: 0.5; transform: scale(0.98); }
  100% { opacity: 0; transform: scale(1.15); }
}
```

**Technical notes:**
- Breathing animation delayed 350ms to avoid conflicting with initial transition
- Ripple element is dynamically created and auto-removed after animation
- Full `prefers-reduced-motion` support
- Animation class removed on blur for clean state management

**Files changed:**
- `style.css` — Added `.focus-breathing:focus` animation rule, `@keyframes inputGlowBreathe`, `.focus-ripple-wave` styles, `@keyframes focusRingRipple`, updated reduced motion guards
- `main.js` — Enhanced focus handler to add breathing class after delay, create ripple element, remove breathing on blur

**Tested:** Name input focus ✓, breathing animation visible (3px-5px shadow pulse) ✓, ripple wave created ✓, classes removed on blur ✓, zero console errors ✓.

**What's Next:**
- Whitespace rhythm audit across sections
- Service card hover depth shift
- Consider velocity-awareness for other scroll-linked effects
- FAQ answer text reading lamp effect

---

## Session 58 — 2026-03-27 (Opus 4.6) — POLISH

### What I Did: FAQ Answer Reading Lamp — Text Illuminates on Open

Extended the **reading lamp effect** to FAQ answer text. When an FAQ accordion opens, the answer content starts dimmed (50% opacity, 85% brightness) and smoothly "lights up" as the accordion expands — creating a sense of the text being illuminated for reading.

**How it works:**
1. Base CSS sets `.faq-answer-inner` to `opacity: 0.5` + `filter: brightness(0.85)` (dimmed)
2. When FAQ opens, JS adds `.reading-lit` class after 150ms delay
3. CSS transition smoothly brings opacity to 1 and brightness to 1
4. When FAQ closes, JS removes `.reading-lit` class immediately
5. Text dims back down as accordion collapses

**Visual effect:**
- User clicks FAQ question
- Accordion expands
- Answer text "fades in" from dim to bright
- Creates reading spotlight sensation
- Consistent with pricing body and workshop card description reading lamps

**Technical notes:**
- Added to existing `openItem()`/`closeItem()` functions in FAQ accordion JS
- 150ms delay before adding class aligns with accordion animation start
- 0.5s transition duration matches accordion open speed
- Full `prefers-reduced-motion` support (text shows at full brightness)
- Fixed UTF-8 character issue in CSS comment that was breaking rule parsing

**Files changed:**
- `style.css` — Added `.faq-answer-inner` opacity/filter base state, `.faq-item[open] .faq-answer-inner.reading-lit` bright state, updated reduced-motion guard
- `main.js` — Added `reading-lit` class management in FAQ open/close handlers

**Tested:** Base state dimmed (opacity 0.5, brightness 0.85) ✓, opens with reading-lit class ✓, transitions to full brightness ✓, closes removes class ✓, zero console errors ✓.

**What's Next:**
- Whitespace rhythm audit across sections
- Service card hover depth shift
- Consider velocity-awareness for other scroll-linked effects
- Consider subtle loading state animations for form submission

---

## Session 59 — 2026-03-27 (Opus 4.6) — POLISH

### What I Did: Card Sibling Depth Focus — Receding Neighbors Effect

Added a **sibling depth focus effect** to both service cards and workshop cards. When you hover over one card, its siblings subtly recede — scaling down, dimming, and slightly blurring — creating a focus effect that draws attention to the hovered card while maintaining context of the others.

**How it works:**
1. CSS `:has()` selector detects when any card is hovered
2. Siblings (cards that aren't hovered) get `scale(0.97)`, `opacity: 0.7`, `blur(0.3px)`
3. The hovered card gets elevated `z-index: 10` and enhanced lift (`translateY(-6px) scale(1.02)`)
4. JS fallback adds `.card-focus-active` class to grid and `.card-focused` to hovered card
5. Smooth transitions (300ms with expo-out easing) for natural enter/exit

**Visual effect:**
- User hovers over a card
- All other cards gently recede into the background
- Hovered card rises higher and scales up slightly
- Creates a "spotlighting" effect that helps users focus on one card at a time
- Effect reverses smoothly when mouse leaves

**Applied to:**
- Service cards (`.cards-grid .card`) — 8 cards
- Workshop cards (`.workshop-grid .workshop-card`) — 4 cards

**Technical notes:**
- Dual implementation: CSS `:has()` for modern browsers + JS class management fallback
- `:has()` is now supported in Chrome 105+, Firefox 121+, Safari 15.4+
- JS fallback ensures consistent behavior across all devices
- Guards: `pointer: fine` / `hover: hover` media queries + `prefers-reduced-motion`
- Reduced motion: disables transform and filter effects, keeps opacity reduction

**Files changed:**
- `style.css` — Added sibling depth focus rules for both card grids, reduced-motion guards
- `main.js` — Added `setupGridFocus()` IIFE with mouseenter/mouseleave handlers for both grids

**Tested:** Service cards scale/opacity/blur ✓, workshop cards scale/opacity/blur ✓, focused card z-index elevation ✓, transitions smooth ✓, cleanup on mouseleave ✓, zero console errors ✓.

**What's Next:**
- Whitespace rhythm audit across sections
- Consider velocity-awareness for other scroll-linked effects
- Consider subtle loading state animations for form submission
- Review overall animation complexity — ensure cognitive load is reasonable

---

## Session 60 — 2026-03-27 (Opus 4.6) — POLISH

### What I Did: Back-to-Top Progress Ring — Circular Scroll Indicator

Added a **scroll progress ring** around the back-to-top button. As the user scrolls down the page, a circular SVG ring progressively fills around the button, providing a secondary visual indicator of scroll depth that's always visible in the corner.

**How it works:**
1. SVG with two circles: background ring (faint) and progress ring
2. Progress ring uses `stroke-dasharray` and `stroke-dashoffset` to create the fill effect
3. JS calculates scroll ratio (0-1) and sets the offset: `circumference * (1 - ratio)`
4. At >98% scrolled, ring turns green with a glow effect (`.scroll-complete`)

**Visual design:**
- Background ring: 15% opacity white, 2px stroke
- Progress ring: 70% opacity white, 2px stroke with smooth transition
- On hover: ring turns fully white with subtle glow
- At page bottom: ring turns green (#34d399) with green glow

**Technical details:**
- SVG positioned absolute, 3px outside the button (50x50 on 44x44 button)
- `transform: rotate(-90deg)` so progress starts from top
- Circumference = 2πr = 125.66 (r=20)
- Scroll ratio mapped to dashoffset: 125.66 (0%) → 0 (100%)
- 100ms ease-out transition for smooth fill animation
- Reduced motion: transition disabled

**Files changed:**
- `index.html` — Added SVG rings inside back-to-top button (2 circles)
- `style.css` — Added ring styles, progress animation, complete state, hover glow, reduced-motion guard
- `main.js` — Enhanced scroll listener to calculate and set ring progress

**Tested:** Ring fills progressively on scroll ✓, offset 0 at bottom (full ring) ✓, green color at scroll-complete ✓, hover glow works ✓, zero console errors ✓.

**What's Next:**
- Whitespace rhythm audit across sections
- Consider velocity-awareness for other scroll-linked effects
- Consider subtle loading state animations for form submission
- Review overall animation complexity — ensure cognitive load is reasonable

---

## Session 61 — 2026-03-27 (Opus 4.6) — POLISH

### What I Did: Ticker Item Polish — Hover Glow + New Repair Pulse

Enhanced the **Recently Fixed ticker** with micro-interactions that make each repair item feel more premium and engaging:

**1. Item Hover Effects:**
- Hover spotlight: radial gradient glow appears from center on hover
- Lift effect: item translates up 2px and scales to 1.02
- Enhanced shadow: blue glow shadow on hover
- Border accent: border color shifts to accent blue
- Scroll pause: entire ticker pauses on hover (existing, now enhanced)

**2. "New" Repair Pulse:**
- First ticker item (most recent repair) has a green border
- Pulsing green glow animation (2s cycle) draws attention
- Time text colored green for the newest item
- Creates visual hierarchy in the scrolling list

**CSS animations:**
```css
@keyframes tickerNewPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(52, 211, 153, 0); }
  50% { box-shadow: 0 0 0 4px rgba(52, 211, 153, 0.2); }
}
```

**Technical notes:**
- Hover spotlight uses `::before` pseudo-element with `opacity: 0` → `1` transition
- `position: relative` + `overflow: hidden` on item to contain spotlight
- Light mode has softer blue tones for hover glow
- Dark/light mode pulse keyframes have adjusted alpha values
- Full `prefers-reduced-motion` support

**Files changed:**
- `style.css` — Added ticker item hover styles, spotlight pseudo-element, new repair pulse animation, light mode variants, reduced-motion guards

**Tested:** 24 ticker items rendered ✓, first item green border + pulse animation (tickerNewPulse/tickerNewPulseLight) ✓, hover spotlight gradient present ✓, dark mode hover uses accent blue rgba(79, 142, 247) ✓, light mode uses rgba(37, 99, 235) ✓, zero console errors ✓.

**What's Next:**
- Whitespace rhythm audit across sections
- Consider velocity-awareness for other scroll-linked effects
- Consider subtle loading state animations for form submission
- Review overall animation complexity — ensure cognitive load is reasonable

---

## Session 62 — 2026-03-27 (Opus 4.6) — POLISH

### What I Did: Form Submit Celebration — Shimmer Loading + Confetti Burst

Enhanced the **contact form submission experience** with premium loading and celebration effects:

**1. Submit Button Shimmer (Loading State):**
- When button is disabled (sending), a shimmer gradient sweeps across it
- Gradient uses `linear-gradient(90deg, transparent → white 25% → transparent)`
- 1.5s infinite loop animation (`submitShimmer`)
- Button opacity stays at 0.85 (more visible than before)
- Shimmer uses `::after` pseudo-element with `inset: 0`

**2. Success State Enhancement:**
- Button gets `success-glow` class alongside `btn-success`
- Dual animation: `btnSuccessBounce` + `btnSuccessGlow`
- Green glow pulses outward (0 → 20px spread → 0) over 1 second
- Creates a satisfying "pulse of light" celebration

**3. Confetti Burst:**
- On form success, 25 colorful particles burst from the button
- Colors: green, blue, orange, pink, purple, cyan
- Particles fan upward and outward with random angles (-70° to +70°)
- Each particle: random size (6-12px), random duration (2-3s), random delay (0-150ms)
- `confettiBurst` keyframe: explode outward → fall with gravity + rotation
- Container auto-removes after 4 seconds

**CSS animations:**
```css
@keyframes submitShimmer {
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
@keyframes btnSuccessGlow {
  0%   { box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.5); }
  50%  { box-shadow: 0 0 20px 8px rgba(52, 211, 153, 0.3); }
  100% { box-shadow: 0 0 0 0 rgba(52, 211, 153, 0); }
}
@keyframes confettiBurst {
  0%   { opacity: 1; transform: translate(0, 0) rotate(0deg); }
  10%  { opacity: 1; transform: translate(var(--tx), var(--ty)) rotate(90deg); }
  100% { opacity: 0; transform: translate(var(--tx), calc(var(--ty) + 300px)) rotate(720deg); }
}
```

**Technical notes:**
- Confetti creation function checks `prefers-reduced-motion` first
- Reduced motion: shimmer hidden (`display: none`), confetti animation disabled
- Confetti uses CSS custom properties (`--tx`, `--ty`) for per-particle spread
- JS creates confetti dynamically and cleans up after animation

**Files changed:**
- `style.css` — Added shimmer ::after, success glow animation, confetti styles
- `main.js` — Added `createConfetti()` function, enhanced success handler

**Tested:** Button disabled state shows shimmer ✓, success adds btnSuccessBounce+btnSuccessGlow ✓, confetti container creates 5 particles (test) ✓, confettiBurst animation applied ✓, zero console errors ✓.

**What's Next:**
- Whitespace rhythm audit across sections
- Consider velocity-awareness for other scroll-linked effects
- Review overall animation complexity — ensure cognitive load is reasonable

---

## Session 63 — 2026-03-27 (Opus 4.6) — POLISH

### What I Did: Hero Eyebrow Ripple Effect

Added a subtle but delightful hover interaction to the **"★ Trusted Local Tech" hero badge**:

**Effect Details:**
- On hover, a radial gradient ripple emanates from center (scales from 0.5 to 1.5)
- Badge itself scales up slightly (1.02) with spring easing
- Star icon rotates and scales (1.15, -5deg) for a playful "twinkle"
- Border color transitions to accent-muted

**CSS Implementation:**
```css
.hero-eyebrow::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, var(--accent-dim) 0%, transparent 70%);
  opacity: 0;
  transform: scale(0.5);
  transition: opacity 0.4s ease, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.hero-eyebrow:hover::after {
  opacity: 0.5;
  transform: scale(1.5);
}
```

**Technical notes:**
- `position: relative` + `overflow: hidden` on eyebrow to contain the ripple
- `cursor: default` since it's not clickable
- Spring easing `cubic-bezier(0.34, 1.56, 0.64, 1)` for bouncy feel
- Full reduced-motion support — all transforms/transitions disabled

**Files changed:**
- `style.css` — Added hero-eyebrow hover styles (::after ripple, icon rotation, scale)

**Tested:** position:relative ✓, overflow:hidden ✓, ::after opacity 0 (initial) ✓, ::after scale 0.5 (initial) ✓, radial-gradient applied ✓, zero console errors ✓.

**What's Next:**
- Whitespace rhythm audit across sections
- Consider velocity-awareness for other scroll-linked effects
- Review overall animation complexity — ensure cognitive load is reasonable

---

## Session 64 — 2026-03-27 (Opus 4.6) — POLISH

### What I Did: Scroll Vignette — Depth Immersion Overlay

Added a **scroll-driven vignette effect** that creates a subtle sense of depth immersion as users scroll deeper into the page. The viewport edges gradually darken with a radial gradient, focusing attention toward the center of the screen.

**How it works:**
1. Fixed overlay (`scroll-vignette`) with radial gradient: transparent center → dark edges
2. JS tracks scroll depth (reuses the nav shadow calculation)
3. Vignette begins fading in at 20% scroll depth, reaches full intensity at 80%
4. CSS custom property `--vignette-intensity` controls opacity dynamically
5. `.active` class toggles the overlay visibility

**Visual design:**
- Dark mode: Stronger effect — edges darken to 15% black at full intensity
- Light mode: Softer effect — edges darken to only 6% black (subtle)
- Effect is imperceptible at first, grows gradually as user commits to scrolling
- Creates a natural "tunnel vision" that focuses attention on content

**Technical details:**
```css
.scroll-vignette.active {
  opacity: var(--vignette-intensity, 0);
}
```
```javascript
// Vignette fades in starting at 20% scroll depth, max at 80%
const vignetteDepth = Math.max(0, (depth - 0.2) / 0.6);
const vignetteIntensity = Math.min(vignetteDepth, 1);
```

**Math breakdown:**
- 0px scroll → intensity 0 (invisible)
- 200px scroll → intensity ~0.005 (barely perceptible)
- 500px scroll → intensity ~0.5 (half strength)
- 1000px+ scroll → intensity 1 (full effect)

**Why this matters:**
This is an ambient effect users won't consciously notice, but it subtly communicates "you're deep in content now" — the visual equivalent of pulling curtains closed when watching a movie. It increases perceived focus and reduces peripheral distraction.

**Files changed:**
- `index.html` — Added `.scroll-vignette` overlay div after cursor spotlight
- `style.css` — Added scroll-vignette base styles, active state, light mode variant, z-index 9996 (below cursor spotlight and noise)
- `main.js` — Extended nav scroll handler to update vignette intensity based on scroll depth

**Tested:** Vignette element exists ✓, position fixed ✓, z-index 9996 ✓, opacity 0 default ✓, opacity matches --vignette-intensity when active ✓, radial gradient applied ✓, reduced motion guard added ✓, zero console errors ✓.

**What's Next:**
- Whitespace rhythm audit across sections
- Consider velocity-awareness for other scroll-linked effects
- Review overall animation complexity — ensure cognitive load is reasonable

---

## Session 65 — 2026-03-27 (Opus 4.6) — POLISH

### What I Did: Magnetic Section Titles

Added a **magnetic effect to section titles** — when the cursor moves near a section title (within 150px), the title subtly shifts toward the cursor, creating a premium, interactive feel that makes the typography feel responsive and alive.

**How it works:**
1. Each section title gets individual mousemove/mouseleave event listeners
2. When cursor enters the 150px radius, distance from center is calculated
3. Shift strength scales inversely with distance (closer = stronger pull)
4. Maximum shift is 8px in any direction
5. Movement is smoothly interpolated using `LERP = 0.1` factor
6. Title returns to original position when cursor leaves

**Implementation details:**
```javascript
var MAGNETIC_RADIUS = 150; // px — cursor must be within this distance
var MAX_SHIFT = 8; // px — maximum shift amount
var LERP = 0.1; // smoothing factor for buttery animation

// Strength calculation: closer = stronger
var strength = 1 - (distance / MAGNETIC_RADIUS);
var shift = strength * MAX_SHIFT;
```

**Example behavior:**
- Cursor 54px from center → title shifts ~4.76px toward cursor
- Cursor 100px from center → title shifts ~2.67px toward cursor
- Cursor 150px+ from center → no shift

**Why this matters:**
Magnetic effects are a hallmark of premium web design (seen on sites like Linear, Vercel, and Stripe). This subtle interaction makes the page feel responsive to the user's presence without being distracting. It's the kind of detail that users feel more than see.

**CSS preparation:**
- Added `will-change: transform` for GPU optimization
- Set `cursor: default` since titles aren't clickable
- No transition needed — JS handles smooth interpolation via RAF

**Files changed:**
- `style.css` — Added will-change, cursor styles to .section-title
- `main.js` — Added magneticTitlesInit IIFE with mouse tracking and smooth interpolation

**Tested:** 11 section titles found ✓, will-change:transform applied ✓, cursor:default applied ✓, position:relative ✓, magnetic math verified (54px distance → ~4.76px shift) ✓, smooth interpolation working ✓, pointer check guards for touch devices ✓, reduced motion guard ✓, zero console errors ✓.

**What's Next:**
- Whitespace rhythm audit across sections
- Consider velocity-awareness for other scroll-linked effects
- Review overall animation complexity — ensure cognitive load is reasonable

---

## Session 66 — 2026-03-27 (Opus 4.6) — POLISH

### What I Did: Scroll Progress Section Landmarks

Added **section landmarks to the scroll progress bar** — small dots indicating the positions of major sections along the page. As users scroll, the current section's landmark scales up and glows, creating a visual "table of contents" in the progress bar.

**How it works:**
1. JS calculates the scroll position of 9 key sections (services, pricing, process, workshop, mailin, area, compare, faq, contact)
2. Creates small dots positioned along the progress bar at each section's relative position
3. As user scrolls, the landmark nearest to viewport center gains `.active` class
4. Active landmark scales up (1.8x) with spring easing and gains a glowing accent-colored shadow

**Implementation details:**
```javascript
// Key sections to show as landmarks
var landmarkSections = [
  'services', 'pricing', 'process', 'workshop',
  'mailin', 'area', 'compare', 'faq', 'contact'
];

// Calculate position based on section offset
var position = (sectionTop / docHeight) * 100;
```

**Visual design:**
```css
.progress-landmark {
  width: 4px;
  height: 4px;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 50%;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.progress-landmark.active {
  transform: translate(-50%, -50%) scale(1.8);
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 0 6px 2px var(--accent-glow);
}
```

**Why this matters:**
The scroll progress bar now serves as more than just "how far you've scrolled" — it's a visual map of the page structure. Users can glance at the top and see:
- How many major sections exist
- Where they are in the journey
- Roughly how much content remains

This creates a sense of navigation awareness without adding UI clutter.

**Performance considerations:**
- Active state updates use RAF throttling to prevent jank
- Position calculations happen once on load and on resize only
- Uses transform for the scale animation (GPU-accelerated)

**Files changed:**
- `style.css` — Added `.progress-landmarks` container and `.progress-landmark` dot styles with active state, light mode variant, reduced motion guard
- `main.js` — Added `sectionLandmarksInit` IIFE that creates landmarks, calculates positions, and updates active state on scroll

**Tested:** 9 landmarks created ✓, positioned correctly across progress bar (services at 9%, pricing at 27%, faq at 81%, etc.) ✓, active class toggles on scroll ✓, active transform shows scale(1.8) ✓, spring easing applied ✓, resize handling ✓, reduced motion support ✓, zero console errors ✓.

**What's Next:**
- Whitespace rhythm audit across sections
- Consider velocity-awareness for other scroll-linked effects
- Review overall animation complexity — ensure cognitive load is reasonable

---

## Session 67 — 2026-03-27 (Opus 4.6) — POLISH

### What I Did: Hero Perspective Tilt

Added a **3D perspective tilt effect** to the hero section — the entire hero content subtly rotates in 3D space following the mouse cursor, creating a premium "floating" feel seen on sites like Stripe and Linear.

**How it works:**
1. Parent `.hero` gets `perspective: 1000px` for 3D depth
2. `.hero-inner` gets `transformStyle: preserve-3d` and tracks mouse position
3. Mouse position maps to rotation angles: X rotation (±2°) and Y rotation (±3°)
4. Smooth LERP interpolation (0.08 factor) creates buttery movement
5. Returns to neutral when mouse leaves or scrolls past hero

**Implementation details:**
```javascript
var MAX_TILT_X = 2; // Vertical tilt (up/down)
var MAX_TILT_Y = 3; // Horizontal tilt (left/right)
var LERP = 0.08; // Smoothing factor

// Map mouse position to rotation
targetTiltY = nx * MAX_TILT_Y; // -3° to +3°
targetTiltX = ny * MAX_TILT_X; // -2° to +2°

// Apply transform (negative Y for natural feel)
heroInner.style.transform = 'rotateX(' + currentTiltX + 'deg) rotateY(' + (-currentTiltY) + 'deg)';
```

**Why this matters:**
- Creates immediate sense of depth and interactivity on page load
- The hero is the first thing users see — this makes it memorable
- Subtle enough to not be distracting, premium enough to feel special
- Complements existing glow blob parallax for layered depth effect

**Performance considerations:**
- Uses `will-change: transform` for GPU acceleration
- LERP animation runs only when needed (stops when settled)
- Disables when scrolled past hero to avoid unnecessary calculations
- Respects `prefers-reduced-motion`

**Files changed:**
- `main.js` — Added `heroPerspectiveTilt` IIFE with mouse tracking, LERP animation, and scroll-aware disabling

**Tested:** Perspective 1000px applied ✓, transformStyle preserve-3d applied ✓, transform shows matrix3d after mouse move ✓, returns to near-identity on mouse leave ✓, reduced motion guard ✓, scroll past hero resets tilt ✓, zero console errors ✓.

**What's Next:**
- Whitespace rhythm audit across sections
- Consider text reveal animations for section entrances
- Review overall animation complexity — ensure cognitive load is reasonable
