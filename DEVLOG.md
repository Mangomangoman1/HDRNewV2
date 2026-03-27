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
