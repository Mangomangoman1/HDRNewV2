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
- Magnetic button effect on the hero CTA buttons
- Parallax scrolling on the hero section background elements
- Animated SVG device illustrations (exploded phone view) for the services cards
- CSS-only animated tool icons on the service cards (wrench spinning, screen glowing)
- Interactive before/after slider for repair photos
- Text scramble effect on section headlines as they enter viewport
- Custom scrollbar styling to match the theme
- Floating mountain particles in the hero (themed to Hailey/Sun Valley)
- Enhanced dark mode with subtle noise/grain texture overlay
- Scroll-triggered counter animation for stats (response time, repairs done, etc.)
