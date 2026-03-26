# HDR Website Dev — Creative Enhancement Brief

## What This Is
This is the development/staging version of haileyrepair.com — a device repair business in Hailey, Idaho run by Samuel Torres. The production site is in a separate repo (NEWHDR). This repo is your playground.

## Your Mission
Make this site **exceptional**. Not just functional — genuinely impressive. The kind of site that makes someone stop and say "wait, this is a local repair shop?"

## Business Context
- **Business:** Hailey Device Repair — phones, laptops, tablets, consoles
- **Owner:** Samuel Torres, solo technician
- **Location:** Hailey, Idaho (small mountain town, Sun Valley area)
- **Vibe:** Approachable, honest, skilled. Not corporate. Real person, real work.
- **CTA:** Text (208) 366-6111 — that's the primary conversion action
- **Website:** haileyrepair.com
- **Email:** samuel@haileyrepair.com

## What "Go All Out" Means

### Interactions & Micro-animations
- Smooth, purposeful animations (not gratuitous)
- Parallax that enhances, doesn't distract
- Hover states that feel alive
- Scroll-triggered reveals that tell a story
- Creative cursor effects where appropriate
- Page transitions that feel premium

### Visual Design
- Typography that has personality (variable fonts, creative hierarchy)
- Color transitions and gradients that feel modern
- Creative use of whitespace
- Dark/light mode that both feel intentional, not afterthought
- SVG animations (tool icons that animate, device illustrations)
- Texture, grain, or noise overlays for depth

### Unique Features to Consider
- Interactive device repair timeline/process visualization
- 3D CSS transforms for device mockups or card flips
- Particle effects or floating elements (subtle, mountain/tech themed)
- Animated SVG icons (wrench turning, screen fixing, etc.)
- Scroll-driven storytelling sections
- Creative loading states
- Easter eggs (Konami code? click the mountain?)
- Sound design (optional, tasteful — toggle)
- Magnetic buttons or fluid hover effects
- Text scramble/typewriter effects for headlines
- Morphing shapes or blob animations
- Custom scrollbar styling
- Intersection Observer-driven animations
- CSS container queries for truly responsive components

### Content Ideas
- "The Workshop" section — show the craft, the tools, the attention to detail
- Device anatomy illustrations (exploded view of a phone)
- Repair difficulty meter (visual gauge for different repair types)
- Live-ish status updates section (placeholder for future)
- Mountain/valley themed design elements (Hailey is in the mountains)
- Seasonal themes that auto-rotate

### Technical Excellence
- Performance-first: no heavy frameworks, vanilla JS + CSS
- Accessible: WCAG AA minimum, keyboard navigation, screen reader friendly
- PWA features already in place — enhance them
- Semantic HTML throughout
- CSS custom properties for theming
- requestAnimationFrame for smooth animations
- Intersection Observer over scroll listeners
- will-change hints for animated elements
- Prefers-reduced-motion respected ALWAYS

## What NOT to Do
- Don't break existing functionality (contact forms, navigation, device check wizard)
- Don't change the phone number: (208) 366-6111
- Don't add fake reviews or testimonials
- Don't add pricing that isn't real (no national averages)
- Don't add services we don't offer
- Don't use heavy JS frameworks (React, Vue, etc.) — keep it vanilla
- Don't add a promo/promotional banner
- Don't add "free diagnostics" language
- Don't add "drive to you" service (no car currently)
- Don't sacrifice mobile performance for desktop wow-factor
- Don't add "no fix no charge" or "free if can't fix" language

## File Structure
- `index.html` — landing page (main focus for enhancements)
- `style.css` — main stylesheet
- `main.js` — main JavaScript
- `*.html` — service pages, about, contact, etc.
- `archived/` — sections removed from production, available for reference

## Git
Commit after each meaningful change. Push to origin/main.
Keep commits descriptive — these will be reviewed before merging to production.

## Remember
This is a real business. A real person's livelihood. Make it beautiful AND functional. Every creative choice should serve the user — either by building trust, conveying competence, or making it dead simple to text Samuel for a repair.

Go make something special. 🥭
