# HDR Website Dev — Creative Enhancement Brief

## What This Is
This is the development/staging version of haileyrepair.com — a device repair business in Hailey, Idaho run by Samuel Torres. The production site is in a separate repo (NEWHDR). This repo is your playground.

## Your Mission
Make this site feel **incredibly thoughtful**. The goal isn't more features — it's making every existing element feel pristine, considered, and intentional. The kind of site where someone pauses and thinks *"woah, holy crap — this is special."*

That feeling comes from **craft**, not quantity.

## Business Context
- **Business:** Hailey Device Repair — phones, laptops, tablets, consoles
- **Owner:** Samuel Torres, solo technician
- **Location:** Hailey, Idaho (small mountain town, Sun Valley area)
- **Vibe:** Approachable, honest, skilled. Not corporate. Real person, real work.
- **CTA:** Text (208) 366-6111 — that's the primary conversion action
- **Website:** haileyrepair.com
- **Email:** samuel@haileyrepair.com

## Philosophy: Thoughtful > Flashy

### What "Special" Means
- **Refinement over addition.** Before adding anything new, look at what's already there. Can it be more polished? Better timed? More harmonious?
- **Details people feel but can't name.** The 200ms ease curve that feels *just right*. The shadow that gives depth without weight. The spacing that breathes. The color that shifts so subtly it feels alive.
- **Surprise through restraint.** One perfect micro-interaction beats ten mediocre ones. If a user notices *one* moment that delights them, you've won.
- **Coherence.** Every element should feel like it belongs to the same universe. Typography, spacing, color, motion — they should all speak the same language.

### The Craft Hierarchy (follow this order)
1. **Refine what exists** — typography, spacing, color harmony, animation timing, transitions. Make current elements feel pristine.
2. **Elevate interactions** — hover states, focus states, scroll behavior, page transitions. Make them feel considered, not default.
3. **Add thoughtful details** — only after 1 and 2 are solid. A single breathtaking detail > many okay ones.

### What Makes Users Think "Holy Crap"
- **Perfect typography** — kerning, line-height, font-weight transitions, responsive sizing that feels natural at every breakpoint
- **Considered motion** — easing curves that feel physical, durations that feel unhurried but not slow, enter/exit choreography
- **Depth and texture** — layered shadows, subtle gradients, grain/noise that adds warmth, glass effects done right
- **Color that shifts** — dark/light mode transitions that feel alive, accent colors that respond to context, subtle palette shifts on scroll
- **Spatial awareness** — whitespace that breathes, elements that feel placed not stacked, rhythm in layout
- **Invisible polish** — smooth scroll behavior, no layout shift, instant perceived responsiveness, graceful degradation
- **One magical moment** — a single interaction or visual that makes someone pull out their phone to show a friend

### Before Each Session, Ask:
1. What currently feels unfinished or default?
2. What animation/transition timing could be tighter?
3. What spacing or typography feels off?
4. Is there ONE thing I could add that would create a "wow" moment?

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
- **Test your changes** — verify HTML renders, check both light and dark mode

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
- **Don't add features just to add features** — every addition must earn its place
- **Don't use generic/default animation curves** — craft each one

## File Structure
- `index.html` — landing page (main focus for refinement)
- `style.css` — main stylesheet
- `main.js` — main JavaScript
- `*.html` — service pages, about, contact, etc.
- `archived/` — sections removed from production, available for reference

## Git
Commit after each meaningful change. Push to origin/main.
Keep commits descriptive — these will be reviewed before merging to production.

## Remember
This is a real business. A real person's livelihood. Make it beautiful AND functional. Every creative choice should serve the user — either by building trust, conveying competence, or making it dead simple to text Samuel for a repair.

**Less is more. Craft is everything. Make people feel something.** 🥭
