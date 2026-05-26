# Chess Nimbus — Design Guide

**Goal:** A professional dashboard that feels like Linear — minimal, dense, fast, dark-first, with razor-sharp typography and almost no decorative chrome.  
**Stack:** Next.js + shadcn/ui + Tailwind CSS v4. Full RTL (Hebrew), light/dark theme toggle.

---

## 0. The One Non-Negotiable Rule: shadcn + Tailwind for Everything

> **Every UI element must be built on a shadcn/ui component. No exceptions.**

This is the single most important rule in this guide. Before writing any markup, open the [shadcn/ui docs](https://ui.shadcn.com/docs/components) and find the right component. If one exists — use it. Only reach after getting an explicit permission from the user.

### shadcn component → use case mapping

| Need                 | shadcn component                                                          | Import from                     |
| -------------------- | ------------------------------------------------------------------------- | ------------------------------- |
| Cards / containers   | `Card`, `CardHeader`, `CardContent`, `CardFooter`                         | `@/components/ui/card`          |
| Tables               | `Table`, `TableHeader`, `TableRow`, `TableHead`, `TableBody`, `TableCell` | `@/components/ui/table`         |
| Buttons              | `Button` (variant: `default`, `outline`, `ghost`, `destructive`)          | `@/components/ui/button`        |
| Status labels        | `Badge` (variant: `default`, `secondary`, `destructive`, `outline`)       | `@/components/ui/badge`         |
| Progress / fill bars | `Progress`                                                                | `@/components/ui/progress`      |
| Dividers             | `Separator`                                                               | `@/components/ui/separator`     |
| Mobile drawer nav    | `Sheet`, `SheetContent`, `SheetHeader`, `SheetTitle`                      | `@/components/ui/sheet`         |
| Modals               | `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogFooter`  | `@/components/ui/dialog`        |
| Form fields          | `Input`, `Label`, `Textarea`, `Select`                                    | `@/components/ui/input` etc.    |
| Dropdowns            | `DropdownMenu` and sub-components                                         | `@/components/ui/dropdown-menu` |
| Tooltips             | `Tooltip`, `TooltipContent`, `TooltipTrigger`                             | `@/components/ui/tooltip`       |
| Alerts / banners     | `Alert`, `AlertTitle`, `AlertDescription`                                 | `@/components/ui/alert`         |
| Tabs                 | `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`                          | `@/components/ui/tabs`          |
| Avatar               | `Avatar`, `AvatarImage`, `AvatarFallback`                                 | `@/components/ui/avatar`        |
| Switch / toggle      | `Switch`                                                                  | `@/components/ui/switch`        |
| Checkbox             | `Checkbox`                                                                | `@/components/ui/checkbox`      |
| Skeleton loaders     | `Skeleton`                                                                | `@/components/ui/skeleton`      |
| Command palette      | `Command`, `CommandInput`, `CommandList`, `CommandItem`                   | `@/components/ui/command`       |
| Scroll areas         | `ScrollArea`                                                              | `@/components/ui/scroll-area`   |

### How to extend shadcn components with Tailwind

shadcn components accept a `className` prop — use it to layer Tailwind on top:

```tsx
// Good — shadcn Card base with Linear-style flat border
<Card className="border-border/50 shadow-none rounded-lg bg-card">
  <CardContent className="p-4">...</CardContent>
</Card>

// Good — shadcn Table with Linear-style compact rows
<TableRow className="hover:bg-muted/40 transition-colors duration-75 border-border/40">

// Bad — raw <div> used as a card
<div className="border rounded-lg p-4">...</div>

// Bad — raw <table> used instead of shadcn Table
<table className="w-full">...</table>
```

### When a shadcn component doesn't exist

The only valid reason to use a raw HTML element is when shadcn has no matching primitive. Current examples:

- The stacked rating-bar in `RatingDistribution` (no shadcn multi-segment bar) — use segments inside a `Card`
- Page-level layout wrappers with entrance animation — a single wrapper is acceptable when no shadcn layout primitive applies

If you add a new component type not listed above, check [ui.shadcn.com/docs](https://ui.shadcn.com/docs/components) first. Run `npx shadcn add <name>` to install. Document it in the table above.

---

## 1. Color System

Linear's palette is almost entirely neutral — no bright accent splashes. One muted violet/indigo signal color, everything else is gray.

### Primary accent: Violet-indigo (muted)

```css
:root {
  --primary: oklch(0.511 0.193 277.015); /* indigo-600 */
  --primary-foreground: oklch(0.985 0 0);
  --ring: oklch(0.511 0.193 277.015);
}
.dark {
  --primary: oklch(0.623 0.182 277.015); /* indigo-400 */
  --primary-foreground: oklch(0.145 0 0);
  --ring: oklch(0.623 0.182 277.015);
}
```

### Background layers (dark-first, three depths)

Linear uses three near-black surfaces to create depth without shadows:

| Role                 | Dark token                        | Light token    |
| -------------------- | --------------------------------- | -------------- |
| App shell / sidebar  | `bg-[#0f0f0f]` or `bg-background` | `bg-[#fafafa]` |
| Page body            | `bg-[#141414]` or `bg-muted/30`   | `bg-white`     |
| Card / panel surface | `bg-[#1a1a1a]` or `bg-card`       | `bg-card`      |

Use semantic tokens (`bg-background`, `bg-card`, `bg-muted`) in components. Only set raw hex values in `globals.css` theme definitions.

### Status accent colors

Linear uses muted, low-saturation tints — not vivid greens and reds:

| Role           | Background          | Text               | Border                  |
| -------------- | ------------------- | ------------------ | ----------------------- |
| Success        | `bg-emerald-500/10` | `text-emerald-400` | `border-emerald-500/20` |
| Warning        | `bg-amber-500/10`   | `text-amber-400`   | `border-amber-500/20`   |
| Error          | `bg-red-500/10`     | `text-red-400`     | `border-red-500/20`     |
| Info / primary | `bg-indigo-500/10`  | `text-indigo-400`  | `border-indigo-500/20`  |

In light mode, use the `50` background and `700` text variants instead.

---

## 2. Typography

Linear uses small, dense type. Nothing is large. Hierarchy comes from weight and color contrast, not size.

```
Page title:       text-sm font-medium text-foreground
Section header:   text-xs font-medium text-muted-foreground uppercase tracking-widest
Stat value:       text-2xl font-semibold font-mono tabular-nums text-foreground
Table header:     text-xs font-medium text-muted-foreground (no uppercase — keep it subtle)
Table cell:       text-sm text-foreground
Secondary info:   text-xs text-muted-foreground
Caption / hint:   text-xs text-muted-foreground/60
Numbers & IDs:    font-mono tabular-nums (ratings, counts, phone, dates)
```

**Key difference from standard dashboards:** Page titles are `text-sm`, not `text-xl`. Linear never shouts. Secondary labels fade to `text-muted-foreground/60` — two levels of muting.

---

## 3. Spacing & Layout

Linear is dense. Less padding than a typical dashboard — content fills the space.

- Card padding: `p-3` or `p-4` (not `p-6`)
- Grid gap between cards: `gap-3`
- Vertical section spacing: `space-y-4`
- Table cell: `px-3 py-2` (compact rows)
- Form field stack: `space-y-3` inside modals
- Page content: `px-5 py-4` via `PageShell`, capped at `max-w-screen-xl mx-auto`

---

## 4. RTL — Set Once, Use Logical Properties Everywhere

`dir="rtl"` is set on `<html>` in `layout.tsx`. **Never add it again on individual containers.**  
Text alignment, flex direction, and scroll direction all inherit automatically.

### Use Tailwind logical property utilities

Instead of physical (left/right) utilities, use directional-neutral ones:

| Physical (avoid)            | Logical (use)               |
| --------------------------- | --------------------------- |
| `ml-` / `mr-`               | `ms-` / `me-`               |
| `pl-` / `pr-`               | `ps-` / `pe-`               |
| `left-` / `right-`          | `start-` / `end-`           |
| `border-l-` / `border-r-`   | `border-s-` / `border-e-`   |
| `rounded-l-` / `rounded-r-` | `rounded-s-` / `rounded-e-` |
| `text-left` / `text-right`  | `text-start` / `text-end`   |

### Directional icons

Arrows and chevrons point the wrong way in RTL. Flip them with the `rtl:` variant:

```tsx
<ChevronRight className="rtl:rotate-180 transition-transform" />
<ArrowLeft className="rtl:rotate-180" />
```

Icons that are not directional (Trophy, Users, Calendar) need nothing.

---

## 5. Component Patterns

### Sidebar

Linear's sidebar is ultra-minimal — no background colors on nav items unless active, tight spacing, icons + labels.

```
Background:     bg-background (matches the darkest layer)
Border:         border-e border-border/40
Width:          w-52
Active item:    bg-muted text-foreground rounded-md font-medium
Inactive:       text-muted-foreground hover:bg-muted/60 hover:text-foreground rounded-md transition-colors duration-100
Item:           px-2 py-1.5 flex items-center gap-2 text-sm
Icon:           w-4 h-4 (small — Linear uses 16px icons)
Section label:  text-xs text-muted-foreground/60 uppercase tracking-widest px-2 mb-1 mt-4
Logo area:      px-3 py-4 border-b border-border/40
```

No colored sidebar. No `bg-slate-900`. The sidebar blends into the shell.

### StatCard

Linear stat blocks are borderless or barely bordered — they rely on surface color, not stroke decoration.

```
Background:     bg-card border border-border/40 rounded-lg p-4
No accent stripe (no border-s-4)
Icon:           text-muted-foreground (not colored backgrounds — just the icon itself)
Value:          text-2xl font-semibold font-mono tabular-nums
Label:          text-xs text-muted-foreground
Delta / trend:  text-xs font-mono — green/red text only, no badge
Clickable:      hover:bg-muted/40 cursor-pointer transition-colors duration-100
```

No shadow on cards ever. A `border-border/40` is enough.

### Table

Linear tables are borderless inside — rows are separated by a very faint divider, no outer card border.

```
Wrapper:      bg-card border border-border/40 rounded-lg overflow-hidden
Header row:   bg-transparent (no background tint — text alone signals the header)
Header cell:  px-3 py-2 text-xs font-medium text-muted-foreground text-start
Data row:     border-b border-border/30, hover:bg-muted/30 transition-colors duration-75 (if clickable)
Data cell:    px-3 py-2 text-sm
Empty state:  p-10 text-center text-sm text-muted-foreground/60
```

No zebra rows. No bold header backgrounds. The table should feel like a flat list.

### Buttons

| Variant     | shadcn        | Notes                                                                   |
| ----------- | ------------- | ----------------------------------------------------------------------- |
| `primary`   | `default`     | Indigo fill. Use sparingly — one per toolbar.                           |
| `secondary` | `outline`     | Faint border, no fill. Most actions.                                    |
| `danger`    | `destructive` | Destructive only.                                                       |
| `ghost`     | `ghost`       | Icon buttons, inline actions. This is the most common button in Linear. |

Sizes: prefer `size="sm"` everywhere. Linear buttons are small and unobtrusive.

### Badges

Linear badges are tiny, pill-shaped, and very low contrast:

```
Shape:    rounded-full px-1.5 py-0.5 text-xs font-medium
Style:    bg-muted text-muted-foreground border border-border/40  (default)
Status:   use the status color table from Section 1 — always low-opacity backgrounds
```

Avoid filled, vivid badges. If a badge is calling attention, it should do so with text color only, not a saturated background.

### Inputs & Fields

```
Border:   border border-border/60 rounded-md h-8 bg-background text-sm
Focus:    ring-1 ring-ring/40 ring-offset-0
Disabled: opacity-40 cursor-not-allowed
RTL:      text-start (inherits from dir="rtl")
```

Inputs are slightly smaller (`h-8`) than shadcn defaults. Match Linear's compact form density.

### Modal

```
Overlay:  bg-black/60 backdrop-blur-[2px]
Panel:    bg-card border border-border/50 rounded-xl shadow-md p-5 max-w-md w-full
Title:    text-sm font-medium mb-3
Footer:   flex justify-start gap-2
```

Max shadow on a modal: `shadow-md`. Linear modals barely float — they just sit on the overlay.

### Command Palette (Linear's signature pattern)

For any global search or quick-action surface, use the `Command` shadcn component:

```tsx
<Command className="rounded-lg border border-border/50 bg-card shadow-md">
  <CommandInput placeholder="Type a command..." className="h-9 text-sm" />
  <CommandList>
    <CommandItem className="text-sm gap-2">...</CommandItem>
  </CommandList>
</Command>
```

---

## 6. Animation System

**Rule:** Linear barely animates. If you feel the urge to add an animation, don't. The only motion is micro-transitions on interactive state — hover, focus, active.

### Page / section entrance

A single, subtle entrance on the page content block only:

```tsx
<div className="animate-in fade-in-0 duration-200">{/* page content */}</div>
```

No `slide-in-from-bottom`. No bouncing. Just a fade.

### Micro-interactions (hover / active)

```
Clickable card:    hover:bg-muted/40 transition-colors duration-100
Table row:         hover:bg-muted/30 transition-colors duration-75
Button press:      active:opacity-80 transition-opacity duration-75
Nav item:          transition-colors duration-100
Icon button:       hover:text-foreground transition-colors duration-100
```

### What never animates

- Layout / size changes
- Static text or labels
- The sidebar
- Anything that slides, bounces, or pulses

---

## 7. DO / DON'T

| DO                                                   | DON'T                                                |
| ---------------------------------------------------- | ---------------------------------------------------- |
| `ms-` / `ps-` / `start-` utilities                   | `ml-` / `pl-` / `left-` utilities                    |
| `rtl:rotate-180` for directional icons               | Manually swapping icon components per locale         |
| `font-mono tabular-nums` for every number            | Bold + colored numbers without mono                  |
| Semantic tokens (`bg-card`, `text-muted-foreground`) | Hardcoded colors (`bg-white`, `text-gray-600`)       |
| `shadow-md` max on modals, `shadow-none` on cards    | `shadow-xl`, `shadow-2xl` anywhere                   |
| `hover:bg-muted/30` on rows                          | `hover:scale-105` on rows or cards                   |
| `size="sm"` buttons                                  | Large buttons outside of CTAs                        |
| `border-border/40` faint borders                     | Thick or colored card borders                        |
| `text-xs` for labels and metadata                    | `text-sm` or larger for secondary info               |
| Fade-in only for page entrance                       | Slide-in animations, bounces, or per-card animations |
| One `default` button per action group                | Two filled buttons side by side                      |
| Ghost buttons for most in-table actions              | Outline buttons inside dense lists                   |

---

## 8. Responsiveness

### Target device tiers

This is a management dashboard — the primary user is at a desk. Design for desktop first.

| Breakpoint     | Width        | Expectation                                 |
| -------------- | ------------ | ------------------------------------------- |
| Mobile `< sm`  | `< 640px`    | Usable — sidebar hidden, content scrollable |
| Tablet `sm–lg` | `640–1023px` | Sidebar collapses, content reflows          |
| Desktop `lg+`  | `≥ 1024px`   | Full layout — primary target                |

### Sidebar behavior

```
lg+:   always visible (w-52, fixed start edge)
< lg:  hidden by default, opened via hamburger in the TopBar
       use shadcn Sheet sliding in from the start edge
```

Main content: `lg:ms-52` offset on desktop, full width on mobile.

### Grid layouts

```tsx
// Stat cards
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">

// Two-column split
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">

// Three-column (rare)
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
```

### Tables on small screens

Wrap in a horizontal scroll container using `ScrollArea`:

```tsx
<ScrollArea className="rounded-lg border border-border/40">
  <Table className="min-w-150">...</Table>
</ScrollArea>
```

### Modals on small screens

Use shadcn `Dialog` on desktop and `Drawer` on mobile (the drawer pattern shadcn calls "DrawerDialog"). Full-screen on mobile, centered panel on desktop.

### Typography scaling

```
Page title:   text-sm (no scaling needed — it's already minimal)
Stat value:   text-xl sm:text-2xl
```

---

## 9. Coding Structure Guidelines

These rules exist so any developer can understand a file in 30 seconds, and adding a new feature never requires touching unrelated files.

### File size limits

- **Hard limit: 200 lines.** Start splitting at ~150.
- Split by responsibility, not just by line count — ask "what does this piece do?" before extracting.

### page.tsx is a composer, not a component

`page.tsx` should only:

1. Read from context / receive server props
2. Derive any needed state (one or two `useState` calls max)
3. Compose named section components
4. Render the page layout

It should read like a table of contents. Target: **under 60 lines**.

```tsx
// Good — page.tsx is a coordinator
export default function StudentsPage() {
  const { students } = useData();
  const [selected, setSelected] = useState<Student | null>(null);

  return (
    <PageShell title="שחקנים">
      <StudentsToolbar />
      <StudentsTable students={students} onSelect={setSelected} />
      {selected && (
        <StudentDetailModal
          student={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </PageShell>
  );
}
```

### One component, one job

If you need the word "and" to describe what a component does — split it.

### No state or logic inside display components

Display components (tables, cards, stat blocks) must be pure — they receive data as props and emit callbacks. They never call hooks, manage state, or fetch data themselves. State and data fetching live in `page.tsx` or dedicated hook files.

```tsx
// Good — pure display component
function StudentsTable({ students, onSelect }: Props) { ... }

// Bad — fetching inside a display component
function StudentsTable() {
  const [students, setStudents] = useState([]);
  useEffect(() => { fetchStudents().then(setStudents); }, []);
  ...
}
```

### Component location rules

| Type                      | Location                                            | Rule                       |
| ------------------------- | --------------------------------------------------- | -------------------------- |
| Atoms / shared primitives | `components/shared/`                                | Zero domain knowledge      |
| Domain-specific           | `components/students/`, `components/classes/`, etc. | Used by one domain only    |
| Layout chrome             | `components/layout/`                                | Sidebar, TopBar, PageShell |

Before creating a new component, check `shared/` first. If something close exists, extend it with a prop — don't duplicate.

### Reuse checklist

Before building a new component, ask:

1. Does `shared/` have something that covers 80% of this?
2. Can an existing component accept a new optional prop instead?
3. Is this pattern used in ≥2 places? → `shared/`. Used in 1 place? → domain folder.

### State & data flow

- Data flows **down as props**, events flow **up as callbacks**
- If you find yourself passing props through 3+ levels → use a context or co-locate state closer to the usage
- No Firebase calls inside components — use hooks from `firebase/hooks/` or the `DataContext`
- No formatting or validation logic inside components — use `lib/utils.ts` and `lib/validators.ts`

### Naming conventions

```
Pages:          StudentsPage, ClassesPage (noun + "Page")
Modals:         StudentDetailModal, ClassFormModal (noun + action + "Modal")
Panels:         ClassEnrollmentPanel (sub-section within a page/modal)
Tables:         StudentsTable, ClassesTable
Toolbars:       StudentsToolbar, ClassesToolbar
Shared atoms:   Btn, Modal, Table, Badge, Field, StatCard (short, generic)
```

### Comments: only when the WHY is non-obvious

```tsx
// Good — explains a non-obvious constraint
// formatPhone() must run before every write — storage format is always "053-XXXXXXX"
const phone = formatPhone(formData.phone);

// Bad — explains the what, which the code already says
// Set the phone field
const phone = formData.phone;
```

Hebrew inline comments are fine for labeling sections in larger files.
