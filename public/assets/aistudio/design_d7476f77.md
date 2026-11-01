# Planora AI — Ultra-Detailed UI/UX Design & Implementation Master Prompt

> **Purpose:** This document is the source of truth for recreating the Planora AI event-planning web application from the attached visual references. Give this file and all five reference images to the coding AI together.
>
> **Non-negotiable rule:** The supplied screenshots are the visual specification. Reproduce their visual language, page hierarchy, spacing, proportions, imagery, component styles, and navigation as closely as possible. Do not redesign, simplify, modernize into a different style, or invent a different layout. Where a screenshot is a collage, use it to understand the mobile information architecture and the individual mobile screens it contains.
>
> **Product name:** Planora AI  
> **Tagline:** Plan Smarter. Celebrate Better.  
> **Product category:** AI-powered planning for weddings, birthdays, and community events.  
> **Primary target:** Desktop-first responsive web app, with a carefully adapted mobile experience.  
> **Visual theme:** Warm cream / ivory background, espresso-brown actions, black editorial serif headings, subtle borders, soft cards, warm event photography, refined gold/copper accents.

---

## 0. How to use the reference images

Use the supplied files as visual references. Keep their names or use the normalized paths below when placing them in a project:

1. `references/01-mobile-ui-collage.png` — mobile UI collage containing the Home screen, My Events, Event Studio, Vendors, Vendor Details, AI Copilot, Budget Planner, Event Timeline, Create New Event, and account/menu screen.
2. `references/02-vendors-desktop.png` — full desktop Vendors marketplace screen.
3. `references/03-event-studio-desktop.png` — full desktop Event Studio / theme inspiration screen.
4. `references/04-my-events-desktop.png` — full desktop My Events dashboard.
5. `references/05-home-desktop.png` — full desktop Home landing/dashboard screen.

### Reference priority

- For the **desktop Home**, match image 5.
- For the **desktop My Events page**, match image 4.
- For the **desktop Event Studio page**, match image 3.
- For the **desktop Vendors page**, match image 2.
- For **mobile layout and screen-specific mobile patterns**, match image 1.
- When an element is clearly visible in a reference, reproduce it rather than substituting a generic component.
- If a screenshot contains a tiny or unreadable detail, preserve the visual intent and nearby hierarchy; do not use that as a reason to change the entire layout.
- Do not render the screenshots as a single background image. Rebuild the UI as real, responsive components, using the supplied images only as visual references and using individual image assets for event/vendor/theme photography where available.

---

## 1. Mission and success criteria

Build a polished, production-minded Planora AI web app that looks and behaves like the supplied references.

The result must:

- Closely match the reference screens, not merely resemble the same product category.
- Preserve the same cream visual theme across all pages.
- Use the same shared header and consistent navigation.
- Include the same key content blocks, cards, labels, controls, and hierarchy shown in the references.
- Be responsive without stretching desktop layouts onto phones.
- Keep the AI assistant as a **single floating launcher** on app pages where it is shown. It must not be duplicated as a second permanent AI navigation panel or a second redundant floating label.
- Make visible controls genuinely interactive, with sensible state changes and working flows.
- Use realistic demo data consistently across screens.
- Avoid fake claims such as real vendor verification, live availability, actual bookings, or actual AI generation unless backed by working functionality. If using demo data, label it appropriately where needed.
- Keep code maintainable, typed where the stack supports it, accessible, and testable.
- Verify the actual rendered UI at desktop and mobile sizes before declaring completion.

### Definition of “as close as possible”

“Close” means preserving:

- Page composition and information architecture.
- Header height and alignment.
- Typography character and hierarchy.
- Main content widths and grid proportions.
- Cream background and brown accent palette.
- Card radius, border softness, shadows, and spacing.
- Image placement, aspect ratios, crop behavior, and overlays.
- Button hierarchy, pill controls, status badges, icons, and microcopy.
- The exact role and placement of the floating AI launcher.
- Mobile navigation and the distinct mobile layouts shown in the collage.

Do not treat the reference as a loose inspiration board. It is the design contract.

---

## 2. Product information architecture

The app uses a shared top navigation on desktop:

- Brand: Planora AI
- Home
- My Events
- Event Studio
- Vendors
- AI Copilot
- Search icon
- Notification bell
- User avatar and profile area
- User name: `Abhishek Gupta` in the provided mockup
- Plan label: `Free Plan`
- Profile dropdown chevron

Use the supplied profile name and avatar as reference/demo content only. Keep user-facing account data configurable rather than hard-coding it throughout the codebase.

### Main routes / views

Implement these views as distinct pages or routed states:

1. **Home**
2. **My Events**
3. **Event Studio**
4. **Vendors**
5. **Vendor Details**
6. **AI Copilot**
7. **Budget Planner**
8. **Event Timeline**
9. **Create New Event** multi-step flow
10. **Profile / account menu**
11. Supporting modal or drawer states: vendor comparison, filters on mobile, theme details/customization, event actions, search, notifications, and AI chat panel.

The main desktop navigation shows Home, My Events, Event Studio, Vendors, and AI Copilot. On mobile, use the bottom navigation shown in the collage for the main app views. Do not force the desktop navigation into a tiny horizontal row on mobile.

---

## 3. Global visual design system

### 3.1 Color direction

Use a warm, light, premium editorial palette. Suggested implementation tokens (tune visually against the references):

```css
:root {
  --page-bg: #FBF7EF;
  --surface: #FFFCF6;
  --surface-soft: #F8F0E4;
  --surface-hover: #F5E7D3;
  --border: #EDE2D3;
  --border-strong: #E2CFB8;
  --text-primary: #171412;
  --text-secondary: #6D6A66;
  --text-muted: #928B83;
  --brand-brown: #7A3D19;
  --brand-brown-dark: #4A2C1B;
  --brand-copper: #B86B2A;
  --brand-gold: #D7A34B;
  --accent-peach: #FBE8D3;
  --success: #16A66A;
  --success-soft: #E1F5E9;
  --warning: #F08A12;
  --warning-soft: #FFF0D8;
  --info: #2674F5;
  --info-soft: #E6EFFF;
  --danger: #E94C45;
  --danger-soft: #FDE8E6;
}
```

These tokens are starting values, not permission to change the palette. Visually compare the rendered UI with the supplied images and adjust as needed.

### 3.2 Background and surfaces

- Main page background: warm ivory/cream, never stark pure white or cold gray.
- Header: same cream family with a very subtle lower border.
- Cards: slightly lighter cream/near-white surface with fine warm border.
- Use restrained shadows; avoid heavy black shadows, glassmorphism, neon gradients, or excessive blur.
- Decorative background motifs may use faint warm-gold sparkles or abstract flourishes, as seen on the Home, Event Studio, and Vendors hero areas. Keep them low contrast and behind content.
- Do not make every panel strongly bordered. Use subtle contrast and spacing to establish grouping.

### 3.3 Typography

- Primary display headings use an elegant editorial serif similar to `Playfair Display`, `DM Serif Display`, or a close serif fallback.
- Body text and UI use a clean sans-serif similar to `Inter`, `DM Sans`, or system sans-serif.
- Brand wordmark “Planora AI” should have a refined serif treatment.
- Page titles are large, dark, editorial serif text.
- Card titles may use the serif face where the reference does so.
- Labels, metadata, tabs, buttons, filters, and descriptions use sans-serif.
- Use appropriate font loading if web fonts are available; include fallbacks to avoid layout shift.
- Do not substitute all headings with bold sans-serif text.

### 3.4 Shapes, spacing, and elevation

- Main cards: moderately rounded corners, approximately 12–18 px depending on size.
- Pills and category selectors: fully or nearly fully rounded.
- Inputs: warm border, soft cream fill, rounded corners, clear placeholder.
- Primary buttons: deep warm brown fill, white text, rounded corners.
- Secondary buttons: cream fill, thin warm border, dark text.
- Icon buttons: compact square/circle with clear hover and focus state.
- Use consistent spacing increments (4, 8, 12, 16, 20, 24, 32, 40, 48 px).
- Desktop content should use a centered, generous content width with margins similar to the screenshots.
- Preserve the screenshots’ dense but readable dashboards; do not introduce excessive empty space or make cards huge.
- Shadows must be soft and low-opacity. Do not use strong elevation on every card.

### 3.5 Icons

Use one consistent line-icon family, such as Lucide. Icons should be black or dark brown, with copper/brown active states. Avoid mixing emoji, filled icons, and multiple inconsistent icon packs. Match the icons’ visual weight and scale in the references.

### 3.6 Images

Photography is a core part of this design, not decoration to be removed.

- Use high-quality, realistic event imagery: seaside weddings, floral mandaps, elegant reception venues, birthday balloon installations, community meetups, catering, photography, entertainment, makeup, table settings, lighting, and floral details.
- Use object-fit cover and carefully chosen focal points.
- Preserve the rounded image corners and crop ratios of the references.
- Put text overlays on images only where the references show them.
- Avoid repeating the exact same image for every card.
- Do not use broken image links, generic gray placeholders, or random unrelated stock images.
- If source images are supplied as individual assets, use them. If only the collages are supplied, source or create matching individual assets and do not use the entire collage as a page background.
- Image loading should not cause cards to jump in height.

---

## 4. Shared application shell

### 4.1 Desktop header

Build a single horizontal header across the top of each desktop page.

**Left:**
- Planora AI logo: warm copper/gold four-point sparkle mark.
- Wordmark “Planora AI”.
- Small tagline: “Plan Smarter. Celebrate Better.”

**Center:**
- Home
- My Events
- Event Studio
- Vendors
- AI Copilot

Each item contains a recognizable icon and label. The active route uses a soft peach/cream pill with brown text/icon. Inactive routes remain on the cream header with dark text. The navigation should be centered and balanced, not pushed to the far left.

**Right:**
- Search icon.
- Notification bell.
- Circular profile image.
- Name and “Free Plan”.
- Dropdown chevron.

Header behavior:
- Keep the header consistent between pages.
- Use a subtle bottom divider.
- Active nav state must match the page.
- Buttons/icons need hover and focus states.
- The profile dropdown opens a menu; do not leave it as a decorative chevron.
- Search opens a real search surface or focused search field.
- Notifications opens a popover/panel with sample activity.
- On smaller screens, replace the full desktop nav with the mobile header and bottom navigation described later.

### 4.2 Floating AI launcher — critical rule

The AI assistant is represented by a **single floating circular button** near the bottom-right of the viewport on the reference screens.

Required behavior and visual treatment:
- One circular dark-brown/espresso button.
- Warm gold/cream outline and a small Planora-style sparkle/AI mark.
- Soft, restrained glow/shadow.
- Fixed to the viewport with comfortable spacing from the right and bottom edges.
- Desktop starting position: approximately 24 px from the right and 24 px from the bottom, adjusted so it never covers important controls.
- Mobile: position above the bottom navigation and safe-area inset, not on top of the navigation.
- Do not show an extra permanent “Ask Planora AI” label next to the launcher by default.
- Do not duplicate the assistant as another floating pill, a second button, or an always-open panel.
- Do not position it on top of event card actions, vendor comparison controls, forms, or important content.
- If the page has a fixed bottom action bar, move the launcher upward.
- Clicking the launcher opens a right-side chat drawer on desktop and a full-height or near-full-height sheet on mobile.
- Clicking outside, pressing Escape, or using a close button dismisses the panel.
- The launcher itself remains accessible and keyboard operable.
- Use a high enough z-index for the drawer but a sensible z-index for the launcher.
- The assistant chat must not open automatically on page load.

### 4.3 Shared footer

The reference screenshots primarily show the app content rather than a marketing footer. Do not add a large, unrelated footer to authenticated dashboard pages if it changes the reference composition. A footer may exist on a public landing page only if it is visually consistent and does not push the main dashboard content away from the screenshot layout.

---

## 5. Desktop Home page — reference 05

The Home screen is an editorial event-discovery dashboard. It combines a large hero, layered event cards, feature highlights, continuation of planning, theme inspiration, and an AI prompt area.

### 5.1 Hero composition

At desktop size, create a wide two-part hero below the shared header.

**Left text column:**
- Small uppercase copper eyebrow: `TURN MOMENTS INTO MEMORIES`.
- Large two-line/three-line serif heading:
  - `Your next`
  - `unforgettable event`
- The word `unforgettable` uses italic serif styling and warm copper/gold color.
- Supporting text: “Plan weddings, birthdays and community events with the power of AI — personalized ideas, budgets, timelines and trusted vendors.”
- Deep-brown primary CTA: `Create Your Event` with right-arrow icon.
- Below CTA, a social-proof row: small overlapping circular avatars, `10K+ happy planners`, star rating, and `4.8/5`.

**Right visual:**
- A layered 3D-like fan/carousel of event cards.
- The central card is the largest and most prominent, featuring a seaside wedding with a floral arch and warm sunset lighting.
- Smaller cards sit behind and at angles on either side.
- Include card labels such as `WEDDING`, `BIRTHDAY`, and `COMMUNITY EVENT`, with small index labels such as `01 03`.
- Central card title: `Seaside Wedding`.
- Side card title examples: `Colorful Birthdays`, `Stronger Together`.
- Small descriptive text overlays at the bottom of the cards.
- Left and right circular carousel controls around the card stack.
- Small pagination dots below the card stack, with one active warm-brown dot.
- The card stack should feel layered and premium, not a flat row of equal cards.

**Important:** Preserve the reference’s composition: text on the left, card carousel on the right, hero not excessively tall. Do not replace the card stack with a generic full-width hero photo.

### 5.2 Feature highlight strip

Below the hero, show four equal-width feature cards:

1. `AI Powered Planning` — “Personalized plans for every occasion”
2. `Smart Budgeting` — “Plan better, spend smarter”
3. `Complete Timelines` — “Stay on track, stress free”
4. `Trusted Vendors` — “Find and compare the best”

Each card contains a circular warm-tinted icon, bold label, and muted supporting text. Use subtle card borders and generous but controlled padding.

### 5.3 Continue planning

Lower-left section:
- Heading `Continue planning`.
- Small subtitle `Pick up where you left off`.
- One horizontal event card for `Riya & Karan — Goa Wedding`.
- Thumbnail at left.
- Event name and metadata:
  - `15 Feb 2026`
  - `Goa, India`
  - `300 Guests`
- Progress bar and `68% complete`.
- Compact overflow/continue action at the right.

On narrow screens this card becomes a stacked or horizontally scrollable card, never a clipped desktop row.

### 5.4 Explore event moods

Lower-right section:
- Heading `Explore event moods`.
- Subtitle `Find inspiration for your special day`.
- `View all` action on the right.
- Five image tiles:
  - Beachside Elegant
  - Royal Traditional
  - Minimal & Modern
  - Boho Garden
  - Colorful Birthday
- Each tile has image and readable text overlay near the bottom.
- Cards should be compact and consistent with the reference.

### 5.5 AI Event Copilot prompt area

At the bottom of the desktop Home page, create a wide, rounded, softly bordered panel.

Left side:
- Small AI sparkle mark.
- Label `AI Event Copilot`.
- Serif heading:
  - `Tell me your vision.`
  - `I’ll shape the plan.`
- Supporting text: `Get personalized ideas, budget plans, timelines, vendor suggestions and more — all with AI.`

Right side:
- Long input with sparkle icon and placeholder similar to:
  `E.g. Plan a beach wedding in Goa for 300 guests with a budget of 8 lakh...`
- Circular warm-brown submit arrow.
- Quick action pills:
  - `Suggest a budget plan`
  - `Find themes`
  - `Compare vendors`
  - `Create timeline`
  - `Plan a birthday`

Interaction:
- The prompt accepts text.
- Submit sends the prompt to the AI service if configured; otherwise show a clearly labeled demo response.
- Quick actions populate or submit an appropriate prompt.
- Do not show an always-open AI panel in addition to the floating launcher. This Home prompt panel is a deliberate part of the Home page; the floating launcher is a separate, single compact entry point.

### 5.6 Home page interactions

- `Create Your Event` opens the Create New Event wizard.
- Hero carousel arrows and dots change the active featured event card.
- Event mood cards open Event Studio with the selected mood/theme.
- Continue-planning card opens the corresponding event detail/timeline.
- Feature cards navigate to the relevant section or page.
- AI prompt and quick actions work.
- Floating AI launcher opens the chat drawer.
- Header navigation works.

---

## 6. My Events page — reference 04

This is a dashboard showing event status, search/filter controls, three large event cards, upcoming list, calendar, and recent activity.

### 6.1 Page heading

- Large serif title: `My Events`.
- Subtitle: `All your special moments in one place`.
- Top-right primary button: `+ Create New Event`.

### 6.2 Summary statistics and filters row

Below the heading, display four statistic cards:
1. `3` — `Total Events` with calendar icon.
2. `1` — `Upcoming` with circular/clock-style icon.
3. `1` — `In Planning` with green check icon.
4. `1` — `Completed` with sparkle icon.

To the right of the statistics row, include:
- Search field: `Search events...`
- Dropdown: `All Events`

Keep the cards and controls aligned as in the reference. On smaller desktop widths, wrap the controls gracefully rather than squeezing the labels.

### 6.3 Main event cards

Three equal-width cards in a desktop row. Each has a large event image at top, a status pill over the image, event title, subtitle, metadata, progress bar, and action row.

**Card 1 — Upcoming**
- Title: `Riya & Karan — Goa Wedding`
- Subtitle: `A celebration of love by the beach`
- Date: `15 Feb 2026`
- Location: `Goa, India`
- Guest count: `300 Guests`
- Progress: `68% Complete`
- Status: green `Upcoming`
- Actions: `View Details`, `Edit`, `Share`, overflow menu.

**Card 2 — In Planning**
- Title: `Aarav’s 5th Birthday`
- Subtitle: `A fun-filled day for our little star`
- Date: `12 May 2026`
- Location: `Pune, India`
- Guest count: `50 Guests`
- Progress: `26% Complete` (the desktop card shows this; the mobile collage has a small list item displaying 35% in one place. Use the desktop screenshot for the desktop card and keep demo data consistent within each selected responsive design state rather than mixing labels arbitrarily.)
- Status: orange `In Planning`
- Actions: `View Details`, `Edit`, `Share`, overflow menu.

**Card 3 — Completed**
- Title: `Tech Community Meetup`
- Subtitle: `Learn. Connect. Build Together.`
- Date: `10 Nov 2025`
- Location: `Bengaluru, India`
- Guest count: `120 Guests`
- Progress: `100% Complete`
- Status: blue `Completed`
- Actions: `View Details`, `View Report`, `Share`, overflow menu.

Card design:
- Images span the card width and use a wide crop.
- Status pills sit near the upper-left of the image.
- Overflow control sits near the upper-right.
- Titles use elegant serif type.
- Metadata uses small line icons and muted text.
- Progress bars use green, orange, and blue respectively.
- Primary action is dark brown; secondary actions are cream with a subtle border.

### 6.4 Lower dashboard row

Three panels in a row.

**Panel A — Upcoming Events**
- Heading `Upcoming Events`, action `View All`.
- Three compact list entries with thumbnails:
  - Riya & Karan — Goa Wedding
  - Aarav’s 5th Birthday
  - Tech Community Meetup
- Each entry includes date, location, guest count, and progress pill.
- The list should remain legible; use compact but not tiny text.

**Panel B — Calendar View**
- Heading `Calendar View`.
- Controls: `Today`, previous month arrow, next month arrow.
- Month title example: `February 2026`.
- Seven-column weekday layout.
- Date cells and small colored dots marking event dates.
- Selected day is a dark-brown circle.
- Calendar arrows update the month. `Today` returns to the current month/day.
- Ensure the calendar’s weekday alignment and number of days are actually correct for the displayed month. Do not copy an obviously inconsistent date layout literally if the result is a broken calendar; preserve the style while using correct calendar logic.

**Panel C — Recent Activity**
- Heading `Recent Activity`, action `View All`.
- Activity rows with colored icon bubbles, title, short description, and time:
  - `Venue booking confirmed` — `Taj Resort, Goa for Riya & Karan Wedding` — `2 hours ago`
  - `Catering proposal received` — `SpiceCraft Catering` — `5 hours ago`
  - `New task assigned` — `Finalize guest list for wedding` — `1 day ago`
  - `Budget updated` — `Photography budget adjusted to ₹70,000` — `1 day ago`
  - `Theme ideas generated` — `5 new beachside theme options` — `2 days ago`
  - `Guest list updated` — `Added 12 new guests` — `2 days ago`

### 6.5 My Events behavior

- Search filters event cards/list by event name or location.
- Status filter supports All Events, Upcoming, In Planning, and Completed.
- Create New Event launches the wizard.
- View Details opens the selected event’s overview.
- Edit opens a pre-filled edit form.
- Share opens a share dialog with copyable link or demo share state.
- Overflow menu shows relevant actions, with confirmation before destructive actions.
- View Report opens a summary for completed events.
- Calendar controls work.
- Recent Activity `View All` opens the full activity list.
- Do not leave buttons as inert decorations.

---

## 7. Event Studio page — reference 03

Event Studio is the inspiration and theme customization workspace. It must feel editorial, image-rich, and organized.

### 7.1 Hero area

Main content is split between a wide left content region and a right-side AI Theme Generator panel.

**Left hero:**
- Large serif heading: `Event Studio`.
- Subheading: `Turn your ideas into beautiful experiences`.
- Supporting text: `Explore stunning themes, decoration ideas, menus, activities and personalized suggestions for your event.`
- A subtle handwritten-style warm copper note: `Ideas Inspiration Your Event` or the same visual treatment shown in the reference.
- A large wedding/event image toward the upper-right edge of the main hero region, blending into the cream background with a soft edge.
- Three wide event-type selection cards:
  - `Wedding` — `Elegant • Romantic • Timeless`
  - `Birthday` — `Fun • Creative • Memorable`
  - `Community Event` — `Impactful • Organized • Together`
- Selected category uses a thin copper border and warm tint.

**Right panel — AI Theme Generator:**
- Title with sparkle icon: `AI Theme Generator`.
- Description: `Describe your vision and get personalized theme ideas with color palettes, decor, outfits and more.`
- Multi-line text input with example:
  `E.g. I want a beach wedding with pastel themes for 300 guests in Goa...`
- Primary brown button: `Generate Theme Ideas →`.
- Soft card surface, fine border, rounded corners, subtle decoration in the upper-right.
- On desktop, keep this panel in the right column as shown; do not move it to a floating modal.

### 7.2 Theme category filters

Horizontal row of pill filters:
- Themes
- Decorations
- Menu Ideas
- Activities
- Invitations
- Outfits
- Music & Entertainment

To the right:
- Search field: `Search themes, ideas...`
- Filter/settings icon button.

Selected filter is deep brown with white text. Inactive filters use cream/transparent backgrounds.

### 7.3 Popular Wedding Themes

- Heading: `Popular Wedding Themes`.
- `View All →` on the right.
- Five image cards across the desktop content region:
  1. `Beachside Elegant` — `Serene and luxurious coastal vibes with natural beauty.`
  2. `Royal Traditional` — `A grand celebration with cultural richness.`
  3. `Minimal & Modern` — `Clean, elegant and contemporary styling.`
  4. `Boho Garden` — `Relaxed, artistic and full of natural charm.`
  5. `Vintage Romance` — `Classic aesthetics with a timeless feel.`
- Heart/favorite control overlays each card image in the top-right.
- Cards have consistent aspect ratios, image crop, title, and short description.
- The theme row can scroll horizontally or show a next arrow; do not clip cards at arbitrary positions.

### 7.4 Theme Details panel

Below the theme cards, create two adjacent panels.

**Left — Theme Details**
- Panel heading `Theme Details`.
- `Save Theme` action.
- Large theme image on the left with previous/next image controls and a save pill near the bottom.
- Right side details:
  - Theme title `Beachside Elegant`
  - Description: `A dreamy coastal celebration with pastel tones, floral décor and a relaxed luxurious vibe.`
  - `Best for` — `Destination Wedding`
  - `Estimated Budget` — `₹6 – 12 lakh`
  - `Color Palette` — pastel swatches
  - `Guest Capacity` — `100 – 500`
  - Primary action `Use This Theme →`

**Right — Theme Elements**
- Heading `Theme Elements`.
- `Customize` action.
- Six image tiles with labels:
  - Mandap / Stage
  - Table Decor
  - Lighting
  - Floral Arrangements
  - Seating Layout
  - Entry Pathway

### 7.5 Right-side inspiration panels

Under the AI Theme Generator:
- **Quick Inspiration** panel with four visual tiles:
  - Color Palettes
  - Stage Designs
  - Table Settings
  - Entry Decor
- **Similar Themes** panel with `View All →` and three image cards:
  - Tropical Paradise
  - Pastel Dream
  - Night Glow

These panels should align with the main content column and preserve the right-side sidebar feel.

### 7.6 Event Studio interactions

- Event-type cards change the selected event type and relevant theme suggestions.
- Category pills filter the content.
- Search filters themes/ideas.
- Heart toggles favorite state.
- Save Theme adds to saved themes and shows feedback.
- Use This Theme applies it to the active event or asks the user to choose/create an event.
- Customize opens a working drawer/modal with editable theme elements.
- AI Theme Generator accepts a prompt and returns structured suggestions when AI is configured; otherwise use a clear demo response.
- Quick Inspiration cards open the relevant category or a detail view.
- Similar Themes `View All` opens a full theme list.
- Floating AI launcher remains the single global assistant entry point.

---

## 8. Vendors marketplace page — reference 02

This is a dense but polished marketplace. Maintain the screenshot’s three-column structure: filters left, vendor results center, comparison/map/AI assistant right.

### 8.1 Vendors hero

At the top under the header:
- Large serif heading: `Find the Perfect Vendors`, with `Perfect` italicized and copper.
- Subtitle: `Compare, plan and book trusted vendors for your special event.`
- Benefit chips:
  - Verified Vendors
  - Compare Easily
  - Get Best Quotes
  - AI Recommendations
- A handwritten-style copper note: `Great events happen with great people`.
- A layered strip of event/vendor photography on the right.
- Small callout card: `Trusted Vendors` / `Beautiful Experiences`.
- Subtle cream/gold decorative flourish behind the hero.

### 8.2 Vendor category navigation

A row of rounded category tabs:
- All Vendors
- Venue
- Catering
- Decoration
- Photography
- Entertainment
- Makeup & Styling
- Invitations
- More dropdown

Active category has a light-peach fill and copper outline. Tabs have line icons and small labels. The `More` menu contains additional categories without making the row overflow uncontrollably.

### 8.3 Three-column marketplace layout

Desktop layout:
- Left filter panel: around 250 px wide.
- Center results: flexible, with search and sort at the top and a 3-column vendor-card grid below.
- Right sidebar: around 320–350 px wide with comparison, map, and AI Vendor Assistant.
- Use responsive breakpoints: at narrower desktop widths, collapse the right sidebar into a lower section or drawer rather than compressing all three columns until unreadable.

### 8.4 Left filter panel

Panel title `Filters`; right-side action `Clear All`.

**Event Location**
- Input prefilled with `Goa, India` in the reference.
- Clear icon.

**Vendor Category**
- Checkbox list:
  - All Categories — 120
  - Venue — 24
  - Catering — 18
  - Decoration — 16
  - Photography — 20
  - Entertainment — 12
  - Makeup & Styling — 10
  - Invitations — 8
  - Others — 12

**Budget Range (₹)**
- Dual-ended range slider.
- Lower label `₹0`.
- Upper label `₹5,00,000+`.

**Rating**
- Checkbox/rating filters:
  - 4.5 & above
  - 4.0 & above
  - 3.5 & above
  - 3.0 & above
- Use star symbols/icons in warm gold, not emoji.

**Availability**
- Date selector showing `15 Feb 2026` in the reference.
- Opens a date picker.

Filter controls must update the displayed results. `Clear All` resets all filters.

### 8.5 Search and sorting

Above the result cards:
- Search input with magnifying-glass icon and placeholder:
  `Search vendors, e.g. "beach wedding venue", "caterer", "photographer"...`
- Sort dropdown with label `Sort by` and selected option `Best Match`.
- Sorting options may include Best Match, Top Rated, Price: Low to High, Price: High to Low, and Nearest, when data supports them.

### 8.6 Vendor cards

Display six vendor cards in a 3-column grid.

**Vendor 1 — Taj Resort Goa**
- Image: beachside wedding venue.
- Badge: `Popular`.
- Favorite heart.
- Name: `Taj Resort Goa`.
- Rating: `4.8 (320 reviews)`.
- Location: `Candolim, Goa`.
- Distance: `2.4 km`.
- Price: `₹2,50,000 – ₹6,00,000`.
- Category: `Venue`.
- Primary button: `View Details →`.
- Secondary chat/message icon.

**Vendor 2 — SpiceCraft Catering**
- Image: catering/buffet.
- Badge: `Top Rated`.
- Rating: `4.9 (210 reviews)`.
- Location: `Panaji, Goa`.
- Distance: `3.1 km`.
- Price: `₹800 – ₹1,500 / plate`.
- Category: `Catering`.

**Vendor 3 — Blush & Bloom Decor**
- Image: floral arch/decoration.
- Badge: `Trending`.
- Rating: `4.7 (180 reviews)`.
- Location: `Calangute, Goa`.
- Distance: `4.8 km`.
- Price: `₹80,000 – ₹2,50,000`.
- Category: `Decoration`.

**Vendor 4 — Moments Studio**
- Image: event photographer.
- Rating: `4.8 (410 reviews)`.
- Location: `Mapusa, Goa`.
- Distance: `5.2 km`.
- Price: `₹50,000 – ₹1,20,000`.
- Category: `Photography`.

**Vendor 5 — Rhythm Events**
- Image: stage/music performance.
- Rating: `4.6 (95 reviews)`.
- Location: `Panaji, Goa`.
- Distance: `3.7 km`.
- Price: `₹25,000 – ₹1,00,000`.
- Category: `Entertainment`.

**Vendor 6 — Glamour Studio**
- Image: makeup artist.
- Rating: `4.7 (260 reviews)`.
- Location: `Calangute, Goa`.
- Distance: `4.1 km`.
- Price: `₹15,000 – ₹60,000`.
- Category: `Makeup & Styling`.

Cards:
- Large image area.
- Top-left badge where applicable.
- Top-right favorite control.
- Serif vendor name.
- Rating row with warm gold star.
- Location/distance row.
- Price/category row.
- Full-width brown `View Details` button.
- Compact message button.
- Do not truncate important price/rating data unnecessarily.

### 8.7 Vendor Comparison panel

Right sidebar panel:
- Title `Vendor Comparison` with scale/balance icon.
- `View All →`.
- Three small selected vendor cards with thumbnails:
  - Taj Resort Goa
  - SeaView Palace
  - Coral Beach Resort
- Each shows a rating and estimated price range.
- Each selected card has a small remove `×`.
- Primary action: `Compare Selected (3) →`.

Behavior:
- Users can add/remove vendors from comparison.
- Keep a visible selected count.
- Compare Selected opens a comparison view with aligned attributes: rating, price range, category, location, capacity/services when known, and strengths/tradeoffs.
- Do not fabricate verified vendor facts. Use clearly labeled demo data if no real data source is connected.

### 8.8 Nearby Vendors map panel

- Title `Nearby Vendors` with location pin icon.
- `View Map →`.
- Embedded map-style visual centered around Candolim / Calangute / Goa.
- Vendor price pins such as `₹2.5L`, `₹2.0L`, `₹2.1L`, `₹1.8L`, `₹3.2L`.
- Zoom in, zoom out, and locate controls.
- If no map API is configured, use a static illustrative map with clearly marked demo vendor pins and functional zoom UI; do not pretend it is live GPS data.

### 8.9 AI Vendor Assistant panel

- Title `AI Vendor Assistant` with sparkle icon.
- Copy: `Tell me what you're looking for, and I'll suggest the best vendors based on your event, budget and preferences.`
- Prompt field example:
  `E.g. Suggest good wedding venues in Goa for 300 guests under 5 lakh...`
- Send button.
- `View All →` action if matching the reference.
- Assistant should use the current event context and active filters when available.
- If AI is not configured, return a demo recommendation clearly labeled as a demo.

### 8.10 Vendor interactions

- Category tabs filter vendors.
- Search filters by vendor name, category, and location.
- Sort changes order.
- Filter checkboxes, range, rating, and date update results.
- Favorite heart toggles saved state.
- View Details opens the Vendor Details page.
- Chat button opens a vendor inquiry composer.
- Add/remove comparison works.
- Compare Selected opens a real comparison view.
- Map controls work if a map is implemented; otherwise they should still produce coherent visual state changes.
- AI Vendor Assistant accepts and submits prompts.
- Mobile filter controls open a bottom sheet/drawer.

---

## 9. Vendor Details page — mobile reference in image 1

The collage shows a mobile vendor detail view for Taj Resort Goa. Build a responsive details page that follows this structure.

### 9.1 Image gallery header

- Large full-width venue photo occupying the top section.
- Back button at top-left.
- Favorite heart and share button at top-right.
- Image counter at bottom-right, example `1/12`.
- Rounded lower corners or a soft card transition into the details surface.
- On desktop, use a wider gallery layout while retaining the same visual style.

### 9.2 Vendor summary

- Title `Taj Resort Goa`.
- Rating `4.8 (320 reviews)`.
- A green `Verified` badge only when the vendor is actually verified; for static demo data, label this as sample/demo if necessary.
- Location: `Candolim, Goa`.
- Distance: `2.4 km`.
- Price: `₹2.5L – ₹6.0L`.
- Category: `Venue`.

### 9.3 Detail tabs

- Overview
- Photos
- Reviews
- Packages

Tabs switch the content section. Active tab uses the brown/peach treatment.

### 9.4 Overview content

- Heading `About`.
- Example copy: `A luxurious beachfront resort offering stunning venue spaces, world-class hospitality, and breathtaking sunset views for your special day.`
- Four circular feature items:
  - Beachfront
  - 500+ Guests
  - Parking
  - In-house Catering
- `Gallery` heading and `View All`.
- Row of small venue photos.

### 9.5 Sticky bottom actions on mobile

- Primary: `Enquire Now`.
- Secondary: `Chat`.
- Keep these above the system safe area.
- Do not let the floating AI launcher overlap these actions; on this detail page, either hide the launcher while the bottom action bar is present or position it above the action bar.

---

## 10. Mobile Home page — reference collage

Mobile is not simply desktop scaled down. Follow the first phone in `01-mobile-ui-collage.png`.

### 10.1 Mobile top header

- Brand icon and wordmark at top-left.
- Compact `Planora AI` logo with small tagline.
- Notification bell and profile avatar at top-right.
- Keep the header short and avoid overflowing controls.

### 10.2 Mobile hero

- Small uppercase eyebrow: `TURN MOMENTS INTO MEMORIES`.
- Heading broken into deliberate lines:
  - `Your next`
  - `unforgettable`
  - `event`
- The word `unforgettable` is italic copper serif.
- Short supporting paragraph.
- Brown `Create Your Event →` button.
- Layered wedding image/card to the right, partially overlapping the hero visual area as in the reference. On narrow phones, prevent the image from covering the heading or CTA.
- Social proof may be reduced or omitted if the viewport is extremely narrow, but preserve the reference’s key content order.

### 10.3 Feature icons

A horizontal row of four compact icon features:
- AI Planning
- Smart Budgeting
- Complete Timelines
- Trusted Vendors

Use circular peach backgrounds and copper icons. Labels can wrap to two lines. Maintain touch-friendly spacing.

### 10.4 Explore event moods

- Heading `Explore event moods`.
- `View all →`.
- Horizontal scroll row of image tiles.
- Use the same theme titles as desktop.
- Show partial next card as a cue that the row scrolls.

### 10.5 Mobile bottom navigation

Use a fixed bottom navigation with five items:
- Home
- My Events
- Event Studio
- Vendors
- AI Copilot

Each item includes icon and small label. Active item uses warm brown/copper. Use a white/cream surface, subtle top border/shadow, and safe-area padding. The floating AI launcher must sit above this bar or be hidden if it would obstruct navigation.

---

## 11. Mobile My Events page — reference collage

Follow the second phone in the mobile collage.

### 11.1 Header

- Title `My Events`.
- Subtitle `All your special moments in one place`.
- Compact square plus button at top-right.

### 11.2 Status filter pills

Horizontal scrollable pills:
- All Events
- Upcoming
- Planning
- Completed

Active filter uses brown fill with white text.

### 11.3 Compact statistics

Four compact statistics with icons:
- `3 Total`
- `1 Upcoming`
- `1 Planning`
- `1 Completed`

Use a compact row that can wrap or horizontally scroll at very narrow widths.

### 11.4 Search and filters

- Search field `Search events...`.
- Filter/settings icon button opens a sheet.
- The search row must not overflow the phone.

### 11.5 Event cards

Stack full-width event cards vertically, matching the collage:
- Wide event image.
- Status pill overlay.
- Favorite/overflow control where appropriate.
- Event title and metadata.
- Progress bar.
- Buttons such as View Details, Edit, overflow.
- Completed event card uses the completed status color.
- Keep card density and typography similar to the reference; do not shrink all text to fit three desktop cards in one row.

### 11.6 Mobile lower content

The mobile collage primarily shows the event cards, so avoid forcing the desktop calendar and activity panels into cramped columns. Place calendar and recent activity below the event cards or expose them through separate sections/tabs.

### 11.7 Mobile interactions

- Plus button launches Create New Event.
- Filter pills change the event list.
- Search filters results.
- View Details opens event detail.
- Edit opens the edit flow.
- Overflow menu opens actions.

---

## 12. Mobile Event Studio page — reference collage

Follow the third phone in the mobile collage.

### 12.1 Header and AI theme prompt

- Brand/compact title `Event Studio`.
- Supporting text `Turn your ideas into beautiful experiences`.
- Compact prompt field `Describe your event theme...`.
- Sparkle action on the right.
- The AI theme prompt should be visible near the top without dominating the whole screen.

### 12.2 Event type selectors

Three horizontal or scrollable cards:
- Wedding
- Birthday
- Community

Selected card has peach/copper styling. Keep labels legible.

### 12.3 Category pills

- Themes
- Decorations
- Menu Ideas
- Activities

More categories may be accessible by horizontal scrolling or a More control.

### 12.4 Popular Wedding Themes

- Heading `Popular Wedding Themes`.
- `View all →`.
- Two-column grid of theme cards in the visible mobile area.
- Images first, title and short copy below.
- Favorite heart overlays image.

### 12.5 Theme Details

- Heading `Theme Details`.
- Save button.
- Large image thumbnail.
- Title `Beachside Elegant`.
- Short description.
- Keep theme details below the grid in the scroll flow.

### 12.6 Mobile behavior

- The desktop AI Theme Generator sidebar becomes an inline card, compact prompt, or a lower section; do not keep a fixed desktop-width sidebar.
- The page scrolls vertically.
- Cards remain touch-friendly.
- Floating AI launcher remains separate from the Event Studio theme generator, and there must not be two overlapping floating AI buttons.

---

## 13. Mobile Vendors page — reference collage

Follow the fourth phone in the mobile collage.

### 13.1 Header and hero

- Compact logo/header.
- Heading `Find the Perfect Vendors`, with `Perfect` italic copper.
- Short copy `Compare, plan and book trusted professionals for your special event.`
- Keep the hero concise; avoid the full desktop layered collage if it consumes too much vertical space.

### 13.2 Search

- Search field with placeholder similar to `Search vendors, e.g. "caterer in Goa"`.
- Full-width rounded input.

### 13.3 Category chips

Horizontal wrapping/scrolling chips:
- All
- Venue
- Catering
- Decoration
- Photography
- Entertainment
- Makeup & Styling
- Additional categories as needed.

### 13.4 Sort and filter row

- `Sort by` / `Best Match` dropdown.
- `Filters` button.
- Filters open a bottom sheet with location, categories, budget range, rating, and availability.

### 13.5 Vendor list cards

Use stacked mobile cards, not a three-column grid:
- Thumbnail on the left or top according to available width.
- Vendor title.
- Rating and review count.
- Location and distance.
- Price range.
- Category label.
- Favorite heart.
- `View Details` button.
- Compact chat button.
- Badges such as Popular/Top Rated/Trending.

### 13.6 Mobile comparison

The desktop comparison panel should not be forced into a permanent sidebar. Show a compact selected-vendor comparison tray or a `Compare (n)` floating/inline action when at least one vendor is selected. Clicking it opens a comparison sheet.

### 13.7 AI Vendor Assistant

- Use the global floating AI launcher as the single assistant entry point.
- If an inline AI Vendor Assistant prompt is retained, make it a normal content section lower on the page rather than another floating widget.
- Never display two floating AI controls simultaneously.

---

## 14. AI Copilot page / assistant drawer — mobile reference collage

The sixth screen in the collage is the AI Copilot interface.

### 14.1 Desktop drawer

- Opens from the right side when the floating AI launcher is clicked.
- Warm cream surface with subtle border/shadow.
- Header:
  - Planora AI sparkle.
  - `Planora AI`
  - Subtitle `Your Event Copilot`
  - Close button.
- Welcome message:
  - `Hi! I’m Planora AI`
  - `Tell me your vision. I’ll shape the plan.`
- Quick action grid:
  - Suggest a budget plan
  - Find themes
  - Compare vendors
  - Create timeline
  - Plan a birthday
  - Help me choose a venue
- Message history area.
- Composer anchored at the bottom, placeholder `Type your message...`.
- Send button with arrow.

### 14.2 Mobile AI Copilot screen

- Can be a dedicated bottom-navigation route as shown in the collage.
- Top branding and subtitle `Your Event Copilot`.
- Welcome content with large sparkle mark.
- Same quick actions in a two-column grid.
- Input anchored at the bottom above the safe area.
- Avoid keyboard covering the message composer.
- Show loading state while AI is responding.
- Display errors and retry affordance if the API fails.

### 14.3 AI behavior

- Do not claim an external AI model is connected unless the app actually uses it.
- Use structured prompts with event context.
- Support follow-up questions and preserve conversation state.
- If event context is available, include selected event details in the prompt.
- For actions that modify budget, tasks, vendors, or event settings, show a preview and request confirmation before committing changes.
- Keep arithmetic and constraints in deterministic application logic; use AI for language understanding and suggestions, not as the only source of truth for calculations.
- Validate AI output before displaying or saving it.
- Handle empty input, rate limits, timeouts, malformed responses, and API errors gracefully.
- Never expose API keys in frontend code.

---

## 15. Budget Planner — mobile reference collage

Follow the seventh phone in the mobile collage.

### 15.1 Header

- Back arrow.
- Title `Budget Planner`.

### 15.2 Budget summary

- Label `Total Budget`.
- Amount `₹8,00,000`.
- Donut chart with center label:
  - `68%`
  - `Allocated`
- Legend on the right:
  - Venue — `₹3,00,000 (37%)`
  - Catering — `₹1,50,000 (19%)`
  - Decoration — `₹1,20,000 (15%)`
  - Photography — `₹80,000 (10%)`
  - Entertainment — `₹50,000 (6%)`
  - Makeup & Styling — `₹40,000 (5%)`
  - Others — `₹60,000 (8%)`

The displayed figures are example data from the design reference. Make the calculation logic internally consistent in the actual implementation. If these exact demo amounts do not sum to the exact displayed percentage, show the calculated percentage from the data or label the values as illustrative; never create misleading arithmetic.

### 15.3 AI Suggestions card

- Sparkle icon.
- Heading `AI Suggestions`.
- Bullets:
  - Consider weekday booking to save 10–15%.
  - Explore local vendors for better rates.
  - Opt for seasonal flowers to reduce costs.

### 15.4 Functional behavior

- Donut chart updates when category amounts change.
- Total budget is editable.
- Category expenses can be added/edited.
- Warn when allocated budget exceeds total budget.
- Use proper INR formatting.
- Do not rely on AI to calculate totals.

---

## 16. Event Timeline — mobile reference collage

Follow the eighth phone in the mobile collage.

### 16.1 Header and event summary

- Back arrow.
- Title `Event Timeline`.
- Event summary:
  - `Riya & Karan — Goa Wedding`
  - `15 Feb 2026`
  - `68% complete`
- Small event thumbnail.

### 16.2 Tabs

- Timeline
- Tasks
- Budget
- Guests

Active tab uses a brown filled pill.

### 16.3 Timeline items

Show a vertical timeline with icon/status markers and date on the right:

1. `Venue Booking` — `Taj Resort Goa` — `Completed` — `12 Aug 2025`
2. `Decor Finalization` — `Blush & Bloom Decor` — `In Progress` — `20 Sep 2025`
3. `Catering Confirmation` — `SpiceCraft Catering` — `Pending` — `05 Oct 2025`
4. `Guest Invitations` — `Pending` — `15 Nov 2025`
5. `Final Rehearsal` — `Pending` — `10 Feb 2026`
6. `Event Day` — `Upcoming` — `15 Feb 2026`

Use green for completed, teal/blue for in-progress, orange/red for pending or urgent, and gray for future neutral tasks. The vertical connector line should align with the markers.

### 16.4 Functional behavior

- Tabs switch between timeline, task list, budget summary, and guest overview.
- Task status can be updated.
- Dates can be edited.
- Task dependencies should be represented in the data model.
- Overdue tasks should be visible and not silently treated as complete.

---

## 17. Create New Event wizard — mobile reference collage

Follow the ninth phone in the mobile collage.

### 17.1 Header and progress stepper

- Back arrow.
- Title `Create New Event`.
- Four-step progress indicator:
  1. Details
  2. Preferences
  3. Budget
  4. Review

The current step is filled in brown; future steps are outlined circles. Labels sit under the circles.

### 17.2 Step 1 — Details

- Section `Event Type`.
- Four selection cards:
  - Wedding
  - Birthday
  - Community
  - Other
- Event Name input with placeholder `e.g. Riya & Karan Wedding`.
- Event Date picker.
- Location input with placeholder `Enter city or venue`.
- Expected Guests dropdown/input with placeholder `Select number of guests`.
- Primary bottom button `Next Step →`.

### 17.3 Step 2 — Preferences

Collect relevant event preferences without overwhelming the user:
- Style/theme preference.
- Indoor/outdoor preference.
- Must-have services.
- Dietary/accessibility needs where relevant.
- Optional notes.

### 17.4 Step 3 — Budget

- Total budget input in INR.
- Budget flexibility.
- Optional category priorities.
- Display an estimated allocation preview.

### 17.5 Step 4 — Review

- Summary of all entered details.
- Ability to go back and edit.
- Primary action `Create Event`.
- On success, navigate to the new event’s dashboard.

### 17.6 Wizard behavior

- Validate required fields and show clear inline messages.
- Preserve entered data when moving between steps.
- Back and Next controls work.
- Do not lose data if a validation error occurs.
- On small screens, keep the primary action accessible above the system safe area.
- If event creation uses a backend, show loading, success, and failure states.

---

## 18. Profile / account menu — mobile reference collage

Follow the last phone in the collage.

- Profile avatar.
- Name `Abhishek Gupta`.
- Plan label `Free Plan`.
- Right chevron.
- Vertical menu:
  - Home
  - My Events
  - Event Studio
  - Vendors
  - AI Copilot
  - Settings
  - Help & Support
  - Upgrade Plan
  - Log Out
- Highlight `Upgrade Plan` with a pale pink/warm accent as shown.
- Bottom promotional card:
  - Crown icon.
  - `Plan Smarter with AI`
  - `Upgrade to Pro for advanced features`

Behavior:
- Menu items navigate appropriately.
- Settings opens settings.
- Help & Support opens support content.
- Upgrade Plan opens a pricing/upgrade view, not a fake checkout.
- Log Out asks for confirmation where appropriate and clears the session if authentication is implemented.
- The account menu should be a real route/drawer, not a decorative screen only.

---

## 19. Responsive behavior and breakpoints

Implement responsive layouts deliberately.

Suggested breakpoints:
- Small phone: 320–374 px
- Standard phone: 375–430 px
- Large phone: 431–767 px
- Tablet: 768–1023 px
- Desktop: 1024–1439 px
- Large desktop: 1440 px and above

### Desktop
- Keep the main desktop composition close to the screenshots.
- Home: two-column hero, layered event card carousel, four feature cards, two lower sections, wide AI prompt panel.
- My Events: four stats, search/filter, three event cards, three lower panels.
- Event Studio: main content and right-side AI/inspiration sidebar.
- Vendors: filter column, vendor results grid, right sidebar.

### Tablet
- Reduce margins and card gaps.
- Preserve type hierarchy.
- Event Studio right sidebar may move below the main theme content.
- Vendors right sidebar may move below results or become tabs.
- My Events cards can shift from three columns to two.
- Keep controls accessible without horizontal page overflow.

### Mobile
- Use the mobile reference layouts, not a scaled desktop.
- Use fixed bottom navigation for the five main destinations.
- Hide the desktop nav row.
- Use stacked event cards.
- Use two-column theme cards where appropriate.
- Use vendor list cards or compact horizontal cards.
- Convert sidebars into inline sections, drawers, or bottom sheets.
- Preserve the floating AI launcher only once, above the bottom nav and safe area.
- Inputs should use at least 16 px font size where needed to prevent mobile browser zoom.
- Buttons and touch targets should be comfortable (approximately 44×44 px minimum).
- Respect `env(safe-area-inset-bottom)` for bottom navigation and sticky actions.
- Prevent accidental horizontal scrolling except inside intentionally horizontal carousels.

### Responsive QA
Test at minimum:
- 390 × 844
- 430 × 932
- 768 × 1024
- 1024 × 768
- 1440 × 900
- 1536 × 960

At each size, verify no clipped titles, overlapping controls, broken grids, obscured buttons, or duplicate AI launchers.

---

## 20. Interaction contract — visible controls must work

Implement real behavior for all visible controls. At minimum:

- Header nav links switch pages and update active state.
- Search opens/focuses and filters relevant data.
- Notification icon opens a notification popover.
- Profile avatar opens account menu.
- Home carousel arrows/dots change the active slide.
- Create Your Event opens the wizard.
- Event-type selectors update state.
- Theme category pills filter themes.
- Theme search filters results.
- Theme favorites toggle.
- Save Theme updates saved state.
- Customize opens a working customization panel.
- Use This Theme applies the theme or asks the user to select an event.
- Event search and status filters work.
- Event edit, share, report, and overflow actions open meaningful views/dialogs.
- Calendar month navigation works.
- Vendor category filters work.
- Vendor search and sorting work.
- Vendor filter controls update the results.
- Vendor favorites toggle.
- Vendor details opens the correct vendor.
- Vendor compare selection updates selected count.
- Vendor comparison opens a comparison view.
- Nearby map controls respond.
- AI prompt fields accept and submit text.
- AI quick actions work.
- Budget values update the chart and totals.
- Timeline tabs switch content.
- Task status changes persist in app state.
- Create Event wizard validates, moves between steps, and creates an event.
- Floating AI launcher opens one assistant panel.
- Drawer/modal close buttons work.
- Escape closes appropriate overlays.
- Keyboard navigation and focus states are supported.

Avoid “fake interactivity” where every button simply shows the same generic alert. Each action should have a meaningful and context-specific response.

---

## 21. Data consistency and domain model

Create a coherent data model rather than hard-coding each screenshot as unrelated content.

Suggested entities:

### Event
- id
- name
- eventType: wedding | birthday | community | other
- date
- location
- guestCount
- totalBudget
- budgetCategories
- status: upcoming | planning | completed
- completionPercent
- selectedThemeId
- vendorIds
- taskIds
- guestIds
- createdAt / updatedAt

### Task
- id
- eventId
- title
- description
- dueDate
- status: pending | in-progress | completed | blocked
- priority
- dependencyIds
- assignedTo (optional)

### Vendor
- id
- name
- category
- location
- distance (if known)
- rating
- reviewCount
- priceMin / priceMax
- priceUnit (optional)
- image
- badges
- description
- services
- capacity (if known)
- verificationStatus
- availability (only if supported by real data)

### Theme
- id
- name
- category
- eventType
- description
- heroImage
- galleryImages
- colorPalette
- estimatedBudgetRange
- guestCapacityRange
- elements

### BudgetCategory
- id
- eventId
- name
- estimatedAmount
- actualAmount
- paidAmount
- priority

### Guest
- id
- eventId
- name
- RSVP status
- dietary notes (optional and handled carefully)
- party size

### Activity
- id
- eventId
- title
- description
- timestamp
- activityType

### AI Conversation
- id
- userId/sessionId
- eventId (optional)
- messages
- createdAt

Use a consistent demo dataset so event cards, timeline, budget, vendor list, and activity panels refer to the same event and vendors. Do not allow the UI to display contradictory values unless the screen is explicitly a different illustrative state.

---

## 22. Engineering quality requirements

These are implementation requirements, not visual redesign permissions.

### 22.1 Architecture
- Use reusable components for the shared header, navigation, cards, buttons, form fields, status badges, tabs, drawers, modals, and floating AI launcher.
- Separate page components, UI components, data/services, domain logic, and styling.
- Avoid giant single-file components.
- Keep state ownership clear.
- Use the routing approach already present in the project if one exists; do not replace the stack unnecessarily.

### 22.2 Code quality
- Use TypeScript or the project’s strongest supported type system.
- Define types for events, tasks, vendors, themes, budget categories, and AI messages.
- Avoid `any` unless there is a documented reason.
- Avoid duplicate implementations of shared UI.
- Keep naming consistent.
- Remove unused imports, dead code, console noise, and placeholder TODOs that imply unfinished core features.

### 22.3 Security
- Never expose private API keys in browser code.
- Validate user inputs on the client and server as appropriate.
- Use server-side authorization for private event data if authentication exists.
- Treat AI output as untrusted input; validate structured data before use.
- Do not execute arbitrary model-generated code or HTML.
- Protect destructive actions with confirmation.
- Do not claim a vendor is verified unless verification is backed by the data source.

### 22.4 Performance
- Optimize image sizes and use responsive image variants.
- Lazy-load below-the-fold images where appropriate.
- Avoid unnecessary re-renders.
- Avoid sending an AI request for every keystroke.
- Cache stable theme/vendor data where appropriate.
- Use loading skeletons that match the cream visual system.
- Keep animations subtle and respect `prefers-reduced-motion`.

### 22.5 Accessibility
- Semantic landmarks and headings.
- Keyboard-accessible navigation, tabs, dialogs, dropdowns, and carousels.
- Visible focus rings in a brand-consistent color.
- Accessible names for icon-only buttons.
- Correct form labels and inline validation messages.
- Sufficient text contrast.
- Do not communicate status through color alone; include labels/icons.
- Respect reduced-motion preferences.
- Use appropriate dialog focus management.

### 22.6 Testing
Test at least:
- Budget calculations and over-budget warnings.
- Event creation wizard validation.
- Search/filter/sort logic.
- Theme favorite/save state.
- Vendor compare add/remove logic.
- Timeline task status and date handling.
- AI response parsing and failure states.
- Mobile navigation and floating AI launcher positioning.
- No horizontal overflow at the required viewports.
- Basic accessibility checks.
- Main user flows end-to-end.

---

## 23. Implementation workflow — follow in order

Do not generate the entire app in one uncontrolled pass.

### Phase 1 — Inspect
1. Inspect the existing repository and identify framework, routing, styling, and installed dependencies.
2. Preserve existing working infrastructure.
3. Review all five reference images.
4. Create a route/component inventory.
5. Identify which pages and interactions already exist.

### Phase 2 — Design foundation
1. Define theme tokens and typography.
2. Build the shared app shell and header.
3. Build button, input, card, badge, tab, modal, drawer, and icon-button primitives.
4. Build the single floating AI launcher and chat drawer.
5. Confirm the cream theme matches the references before creating all pages.

### Phase 3 — Desktop pages
Implement and compare in this order:
1. Home
2. My Events
3. Event Studio
4. Vendors
5. Vendor Details
6. AI Copilot
7. Budget Planner
8. Event Timeline
9. Create New Event
10. Account menu/settings

Match the relevant reference image after each page, before moving on.

### Phase 4 — Mobile adaptations
1. Build mobile header.
2. Build fixed bottom navigation.
3. Adapt each page according to the mobile collage.
4. Add safe-area handling.
5. Convert sidebars to sheets/inline sections.
6. Verify the floating AI launcher never overlaps bottom navigation or sticky actions.

### Phase 5 — Functional behavior
1. Connect all search, filter, sort, tab, carousel, and form interactions.
2. Implement consistent demo state or backend persistence.
3. Implement event creation and editing.
4. Implement budget calculations and timeline state.
5. Implement vendor comparison.
6. Implement AI integration only if configuration is available; otherwise use explicit demo mode.

### Phase 6 — Visual QA
1. Run the app.
2. Capture screenshots at the specified viewports.
3. Compare against reference images side-by-side.
4. Fix macro layout differences first, then typography, spacing, colors, image crop, borders, and micro-interactions.
5. Repeat until the visual hierarchy and proportions are closely aligned.

### Phase 7 — Final QA
1. Run lint/typecheck/build/test commands available in the project.
2. Fix failures caused by the implementation.
3. Test every primary button and navigation route.
4. Test mobile overflow and sticky UI.
5. Confirm no duplicate AI launchers.
6. Summarize completed pages, working interactions, tests run, and any real limitations.

---

## 24. Visual comparison checklist

Before declaring the UI complete, check every page against the relevant reference.

### Global
- [ ] Warm cream background is consistent.
- [ ] Logo and wordmark match the reference style.
- [ ] Header height, alignment, and spacing are close.
- [ ] Active nav pill uses the right warm tint.
- [ ] Serif display headings and sans-serif UI typography are used correctly.
- [ ] Cards have subtle borders, soft corners, and restrained shadows.
- [ ] Images are high quality and use correct aspect ratios.
- [ ] Brown primary buttons are consistent.
- [ ] No unrelated gradients, neon colors, glass effects, or generic dashboard styling.
- [ ] Exactly one floating AI launcher is present where appropriate.
- [ ] Floating AI does not overlap important controls.
- [ ] Focus, hover, and disabled states exist.

### Home
- [ ] Left hero copy and right layered card stack match reference composition.
- [ ] “unforgettable” is italic copper serif.
- [ ] Carousel arrows and dots are present.
- [ ] Four feature cards appear below hero.
- [ ] Continue planning and Explore event moods sections are present.
- [ ] AI Event Copilot prompt panel is present at the bottom of desktop Home.

### My Events
- [ ] Heading and Create New Event button align.
- [ ] Four summary cards are present.
- [ ] Search and status dropdown align with stats.
- [ ] Three event cards use correct image/status/title/metadata hierarchy.
- [ ] Progress bars and action rows match.
- [ ] Upcoming Events, Calendar View, and Recent Activity panels are present.
- [ ] Calendar works and is logically correct.

### Event Studio
- [ ] Hero title, subtitle, event type cards, and AI Theme Generator match.
- [ ] Category pills and search/filter controls align.
- [ ] Five theme cards appear on desktop.
- [ ] Theme Details and Theme Elements panels are present.
- [ ] Quick Inspiration and Similar Themes appear in the right sidebar.
- [ ] Theme favorites/save/customize actions work.

### Vendors
- [ ] Hero heading and layered images match.
- [ ] Vendor category strip appears below hero.
- [ ] Filter sidebar contains all specified sections.
- [ ] Search and sort are aligned above results.
- [ ] Six vendor cards appear in a three-column desktop grid.
- [ ] Comparison, Nearby Vendors map, and AI Vendor Assistant panels appear on the right.
- [ ] Mobile layout becomes a stacked list with a filter sheet.

### Mobile
- [ ] Home, My Events, Event Studio, Vendors, Vendor Details, AI Copilot, Budget Planner, Event Timeline, Create New Event, and account menu are adapted.
- [ ] Bottom navigation is visible and touch-friendly.
- [ ] No desktop three-column layout is squeezed onto a phone.
- [ ] Safe-area insets are respected.
- [ ] Floating AI launcher is above bottom navigation and never duplicates another floating control.
- [ ] Sticky bottom actions remain visible and do not collide with the AI launcher.
- [ ] No horizontal overflow or clipped text.

---

## 25. Explicit “do not” list

Do **not**:

- Do not redesign the app into a different visual style.
- Do not replace the cream/brown editorial theme with a blue/purple SaaS dashboard.
- Do not remove the event photography or replace image cards with generic icons.
- Do not turn the desktop pages into one long generic dashboard.
- Do not add a left sidebar to the desktop shell; the reference uses a top navigation.
- Do not add an extra permanent left-side navigation on pages where the reference does not show one.
- Do not duplicate the AI Copilot: one global floating launcher only, plus intentional inline AI sections that are part of the page design.
- Do not show a permanent “Ask Planora AI” label attached to the floating launcher unless explicitly requested later.
- Do not place the AI launcher over event card buttons, vendor controls, the bottom nav, or sticky actions.
- Do not use the entire reference screenshot as the app’s background.
- Do not invent unsupported claims about real vendors, bookings, availability, user count, ratings, or verification.
- Do not leave buttons inert.
- Do not use generic `alert("Clicked")` as the only interaction.
- Do not let the mobile view become a shrunk desktop layout.
- Do not hard-code the same event data inconsistently across screens.
- Do not sacrifice accessibility or correctness for visual appearance.
- Do not declare success without running the app and checking rendered screenshots.

---

## 26. Final instruction to the coding AI

You are acting as a senior product designer, frontend engineer, and QA engineer. Build Planora AI by treating the supplied screenshots as the binding visual reference. Inspect the existing codebase before making changes. Preserve existing architecture where sensible. Implement the shared design system first, then reproduce each desktop page, then implement the mobile layouts shown in the collage, then connect the interactions and validate the result.

**Your priority order is:**
1. Faithful visual match to the references.
2. Correct page hierarchy and responsive layout.
3. Functional controls and coherent data.
4. Accessibility, security, performance, and maintainable architecture.
5. Final screenshot-based QA.

Do not stop after producing a static mockup. Build a working application. Do not claim that an API, booking, vendor verification, map, or AI model is live unless it is actually configured and working. If something requires credentials or an external service that is not available, implement a graceful, clearly labeled demo state and report the limitation honestly.

At the end, report:
- Pages implemented.
- Interactions implemented.
- Data/backend integrations that are real versus demo.
- Commands/tests run and their results.
- Any remaining gaps.
- Confirmation that the reference screenshots were checked at desktop and mobile viewports.

**Final quality bar:** The finished product should feel like the same Planora AI product shown in the supplied images, not a generic event planner inspired by them.
