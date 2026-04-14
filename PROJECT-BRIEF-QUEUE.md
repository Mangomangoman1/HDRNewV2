# SPEC: Repair Queue Dashboard — "Live at the Bench"

## Concept & Vision

A real-time public repair queue — the first thing customers see when they visit, and a page they can bookmark to check their own repair's status. It shows what's currently being worked on at the bench: devices in queue, in diagnosis, in repair, and waiting for pickup. No login required — just check the status.

This creates a "live workshop" feel: visitors land and immediately think "this guy is busy, he must be good." It sets real expectations, reduces "when will my phone be done?" texts, and gives Samuel a self-service channel that frees his time. Over time, this becomes a trust artifact — proof that this shop is active, transparent, and dependable.

## Design Language

- **Aesthetic:** Technical-dashboard meets craft workshop. Clean data visualization with warmth — think mission control with a human touch.
- **Color palette:** Uses existing CSS variables. Accent blue for active states, green for done/pickup-ready, orange for in-repair, amber for waiting.
- **Typography:** Inter for data/numbers, Plus Jakarta Sans for headings
- **Motion:** Smooth status transitions, pulsing indicators for active repairs, staggered card entrances
- **Spatial system:** Tighter than most sections — this is data, not marketing copy. Dense but scannable.

## Layout & Structure

### Section placement
This is a **full page** (`/queue`), not an inline homepage section. It lives in the nav alongside Services, Pricing, Tips, About, Contact. URL: `/queue`

### Page Structure
1. **Hero bar** — Compact header with shop name, live clock, and tagline "Currently at the bench"
2. **Status Overview Strip** — 4 glowing stat cards: In Queue | In Repair | Waiting for Parts | Ready for Pickup
3. **The Queue Board** — Kanban-style columns or timeline view showing device cards
4. **Your Repair** — A simple lookup field: enter your device type or rough description, see active repairs with similar devices (anonymous, no personally identifiable info)
5. **Appointment Strip** — "Want to drop off? Reserve a time slot" with a simple calendar-style picker
6. **Footer** — Minimal: contact info + back to home

### Responsive
- Desktop: Kanban columns (Queue | In Repair | Ready)
- Mobile: Stacked timeline view

## Features & Interactions

### Live Queue Board
- Shows mock active repairs as device cards — no real customer data exposed
- Each card shows: device type icon, device name, repair type, time elapsed, status badge
- Status progression: Queued → Diagnosed → In Repair → Waiting for Parts → Ready for Pickup → Picked Up
- Pulsing dot on active repairs
- Cards animate in with stagger when page loads
- "Last updated" timestamp that auto-refreshes (mock, for demo)

### Your Repair Lookup
- Text input: "Enter your device (e.g. iPhone 14, Galaxy S22, MacBook Air...)"
- As user types, filters the visible queue cards to show matching devices
- Shows count: "3 repairs for iPhone right now"
- Empty state: "Nothing matching right now — drop off or mail in your device"

### Quick Status Check
- Simple 3-button selector: "Phone" | "Laptop/Tablet" | "Console"
- Filters queue to that category
- Reset button to show all

### Reserve a Drop-Off Time (Simple Slot Picker)
- Shows today's date and next 3 days
- Each day has 4 slots: Morning (9-11am), Midday (11am-1pm), Afternoon (1-4pm), Late (4-6pm)
- Booked slots are greyed out (mock data)
- Available slots are selectable — clicking one opens a "Confirm" modal
- Confirm modal: phone number field + device description + "Reserve" button
- On confirm: shows confirmation message with instructions to text Samuel

### Live Shop Status
- "Shop Status" indicator: Open | Busy | Closed
- Shows current open hours contextually
- Animated pulse dot

## Component Inventory

### QueueCard
- Device icon (SVG), device name, repair type
- Time elapsed since entering current status
- Status badge (color-coded pill)
- Pulsing dot for active status
- Hover: subtle lift + glow

### StatCard
- Large number, label, icon
- Glow effect matching the stat type

### StatusBadge
- 6 states: queued (grey), diagnosed (blue), in-repair (orange), parts-wait (amber), ready (green), picked-up (muted)

### SlotPicker
- Date tabs (horizontal scroll on mobile)
- Time slot buttons in a 2x2 grid
- Selected state: accent border + fill
- Booked state: greyed, strikethrough label
- Modal overlay for confirmation

### LookupInput
- Large, prominent search input
- Live filter as user types (debounced 200ms)
- Clear button

## Technical Approach

- Vanilla HTML/CSS/JS — same constraint as the rest of the site
- CSS Grid for the Kanban board
- Intersection Observer for scroll-triggered card animations
- `prefers-reduced-motion` respected throughout
- Mock data for the queue (realistic device names, repair types, timestamps)
- localStorage to persist booked slot (demo only)
- No backend — purely client-side demo

## Content Rules
- No real customer names, emails, or identifiable info
- All device entries are mock/generic ("iPhone 14 Pro — Screen Replacement")
- Times are realistic but fictional
- Phone number stays: (208) 366-6111
