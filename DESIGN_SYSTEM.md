# DealFinder Design System

## Color Palette

### Core Theme Colors (Light Theme)
```css
--background: #fafafa           /* Light gray background */
--foreground: #0a0a0a           /* Almost black text */
--card: #ffffff                 /* White cards */
--primary: #4f46e5              /* Indigo-600 primary color */
--secondary: #f3f4f6            /* Light gray secondary */
--muted-foreground: #6b7280     /* Gray-500 for muted text */
--border: #e5e7eb               /* Gray-200 borders */
```

### Status Colors (Complementary to Indigo/Purple)
```css
text-emerald-600    /* Success states (#10b981) */
text-rose-600       /* Error states (#e11d48) */
text-amber-600      /* Warning states (#d97706) */
text-primary        /* Info/Action states (indigo-600) */
```

### Success States
```css
bg-emerald-50       /* Light success background */
border-emerald-200  /* Success borders */
text-emerald-700    /* Success text */
```

### Error States
```css
bg-rose-50          /* Light error background */
border-rose-300     /* Error borders */
text-rose-900       /* Error text */
```

### Warning States
```css
bg-amber-50         /* Light warning background */
border-amber-300    /* Warning borders */
text-amber-600      /* Warning text */
```

**Accessibility**: All text colors meet WCAG AA standards (4.5:1+ contrast ratio)

---

## Icon System (Lucide React)

### Common Icons
```typescript
import {
  CheckCircle2,    // Success/Completed
  Clock,           // Waiting/Pending
  Zap,             // Active/Fast/Current
  AlertCircle,     // Errors/Warnings
  Search,          // Search functionality
  TrendingDown,    // Savings/Decrease
  ArrowUpRight,    // External links
  ShoppingCart,    // Shopping/Amazon
  Package,         // Products/eBay
  Building2,       // Store/Platform/Walmart
  Smartphone,      // Tech products/Best Buy
  Target,          // Target store
} from 'lucide-react'
```

### Icon Standards
- **Stroke Width**: `strokeWidth={1.5}` (consistent, thin and modern)
- **Sizes**: `w-4 h-4` (small), `w-6 h-6` (medium), `w-8 h-8` (large), `w-16 h-16` (xl)
- **Colors**: Use theme colors (`text-primary`, `text-emerald-600`, `text-muted-foreground`)

---

## Component Patterns

### Cards
```tsx
<Card className="border-border shadow-lg">
  <CardContent className="p-6">
    {/* Content */}
  </CardContent>
</Card>
```

### Status Badges
```tsx
// Success (Best Price)
<Badge className="bg-emerald-100 text-emerald-700 border border-emerald-300">
  <TrendingDown className="w-3 h-3 mr-1" />
  Best Price
</Badge>

// Primary (Featured)
<Badge className="bg-primary/20 text-primary border border-primary/30">
  Featured
</Badge>

// Platform Badge
<Badge className="bg-secondary/50 text-foreground border border-border">
  <ShoppingCart className="w-3 h-3 mr-1" strokeWidth={2} />
  Amazon
</Badge>
```

### Buttons
```tsx
// Primary
<Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
  Click Me
</Button>

// With Icon
<Button className="bg-primary hover:bg-primary/90">
  <Search className="w-4 h-4 mr-2" strokeWidth={1.5} />
  Search
</Button>
```

### Progress Indicators
```tsx
// Completed Step
<div className="bg-emerald-50 border-emerald-300 p-4 rounded-lg">
  <CheckCircle2 className="w-6 h-6 text-emerald-600" strokeWidth={1.5} />
  <span className="text-emerald-700">Completed</span>
</div>

// Current Step
<div className="bg-indigo-50 border-indigo-200 p-4 rounded-lg">
  <Zap className="w-6 h-6 text-primary" strokeWidth={1.5} />
  <span className="text-foreground">Processing...</span>
</div>

// Pending Step
<div className="bg-secondary border-border p-4 rounded-lg">
  <Clock className="w-6 h-6 text-muted-foreground" strokeWidth={1.5} />
  <span className="text-muted-foreground">Waiting</span>
</div>
```

### Sticky Headers
```tsx
<header className="sticky top-0 z-40 bg-white/90 border-b border-border backdrop-blur-md shadow-sm">
  {/* Header content */}
</header>
```

### Navigation
```tsx
// Logo with link to home
<Link 
  to="/$lang"
  params={{ lang }}
  className="flex items-center hover:opacity-80 transition-opacity"
>
  <h1 className="text-lg md:text-xl font-bold bg-linear-to-r from-primary to-primary/80 bg-clip-text text-transparent">
    DealFinder
  </h1>
</Link>

// Navigation Link
<Link
  to="/$lang"
  params={{ lang }}
  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm font-medium"
>
  <Home className="w-4 h-4" strokeWidth={1.5} />
  <span>Home</span>
</Link>

// Anchor Link (for same-page navigation)
<a
  href="#how-it-works"
  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm font-medium"
>
  <Search className="w-4 h-4" strokeWidth={1.5} />
  How It Works
</a>
```

---

## Typography

### Headings
```tsx
<h1 className="text-3xl md:text-4xl font-bold text-foreground">
  Main Heading
</h1>

<h2 className="text-2xl font-bold text-foreground">
  Section Heading
</h2>

<h3 className="text-lg font-semibold text-foreground">
  Subsection
</h3>
```

### Hero Heading (Special)
```tsx
<h1 className="passkeys-h1">
  Gradient Indigo/Purple Hero Heading
</h1>
```

### Body Text
```tsx
<p className="text-foreground">Primary text</p>
<p className="text-muted-foreground">Secondary text</p>
<span className="text-sm text-muted-foreground">Meta text</span>
```

---

## Layout & Spacing

### Page Container
```tsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
  {/* Page content */}
</div>
```

### Responsive Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Grid items */}
</div>
```

### Section Spacing
```tsx
<section className="py-20">
  {/* Ample breathing room */}
</section>

<div className="space-y-4">
  {/* Consistent vertical spacing */}
</div>
```

---

## Common Patterns

### Info Box
```tsx
<div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
  <h4 className="text-foreground font-medium mb-2 flex items-center gap-2">
    <Zap className="w-4 h-4 text-primary" strokeWidth={1.5} />
    Pro Tip
  </h4>
  <p className="text-muted-foreground text-sm">Helpful information here</p>
</div>
```

### Stat Card
```tsx
// Regular Stat
<div className="text-center p-4 rounded-lg bg-secondary border border-border">
  <div className="text-3xl font-bold text-foreground">123</div>
  <div className="text-sm text-muted-foreground mt-1">Label</div>
</div>

// Success Stat (Best Price)
<div className="text-center p-4 rounded-lg bg-emerald-50 border border-emerald-200">
  <div className="text-3xl font-bold text-emerald-700">$99.99</div>
  <div className="text-sm text-emerald-600 mt-1">Lowest Price</div>
</div>

// Primary Stat (Savings)
<div className="text-center p-4 rounded-lg bg-violet-50 border border-violet-200">
  <div className="text-3xl font-bold text-violet-700">$50.00</div>
  <div className="text-sm text-violet-600 mt-1">You Save</div>
</div>
```

### Empty State
```tsx
<div className="text-center py-12">
  <div className="flex justify-center mb-4">
    <Search className="w-12 h-12 text-primary" strokeWidth={1.5} />
  </div>
  <h3 className="text-lg text-foreground mb-2">No items found</h3>
  <p className="text-muted-foreground">Try searching again</p>
</div>
```

### Loading State
```tsx
<div className="flex items-center gap-2">
  <Spinner className="w-4 h-4 text-primary" />
  <span className="text-muted-foreground">Loading...</span>
</div>
```

---

## Animations & Effects

### Transitions
```tsx
// Smooth all properties
className="transition-all duration-300"

// Color transitions only
className="transition-colors duration-200"
```

### Hover Effects
```tsx
// Cards
className="hover:shadow-xl transition-all hover:-translate-y-1"

// Buttons
className="hover:scale-105 transition-transform"

// Icons
className="hover:text-primary transition-colors"
```

### Backdrop Effects
```tsx
// Navigation/Headers
className="backdrop-blur-md bg-white/90"

// Overlay (rare usage in light theme)
className="backdrop-blur-sm bg-white/80"
```

---

## Gradient Patterns

### Hero Gradient (Indigo → Violet → Purple)
```tsx
className="bg-gradient-to-r from-indigo-50 via-violet-50 to-purple-50"
```

### Icon Background Gradient
```tsx
className="bg-gradient-to-br from-indigo-100 to-violet-100"
```

### Text Gradient (Hero Heading)
```css
background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
```

---

## Responsive Design

### Breakpoints
- **Mobile**: Default (0px)
- **Tablet**: `sm:` (640px)
- **Desktop**: `md:` (768px)
- **Large**: `lg:` (1024px)
- **XL**: `xl:` (1280px)

### Responsive Patterns
```tsx
// Text sizing
className="text-sm md:text-base lg:text-lg"

// Grid columns
className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"

// Visibility
className="hidden md:block"
```

---

## Platform Colors & Icons

### Platform Mapping
```tsx
const platformIcons = {
  amazon: ShoppingCart,
  ebay: Package,
  walmart: Building2,
  bestbuy: Smartphone,
  target: Target,
}

const platformNames = {
  amazon: 'Amazon',
  ebay: 'eBay',
  walmart: 'Walmart',
  bestbuy: 'Best Buy',
  target: 'Target',
}
```

---

## Quick Reference: Light Theme Update

When updating components to light theme:

```tsx
// ❌ OLD (Dark Theme)
bg-card/50 → bg-white
bg-secondary/30 → bg-secondary
border-border/50 → border-border
text-green-400 → text-emerald-600
text-red-400 → text-rose-600
text-orange-400 → text-amber-600
bg-green-950/20 → bg-emerald-50

// ✅ NEW (Light Theme)
bg-white border border-border shadow-lg
bg-secondary border border-border
bg-emerald-50 border-emerald-200 text-emerald-700
bg-rose-50 border-rose-300 text-rose-900
bg-amber-50 border-amber-300 text-amber-600
bg-indigo-50 border-indigo-200 text-indigo-700
```

---

## Testing Checklist

When adding new components:
- [ ] Text contrast meets WCAG AA (4.5:1) or AAA (7:1)
- [ ] Icons use consistent stroke width (1.5 for standard, 2 for emphasis)
- [ ] Hover states have smooth transitions (transition-all duration-300)
- [ ] Mobile responsive (test at 375px width)
- [ ] Focus indicators visible for keyboard navigation
- [ ] Color not the only way to convey information (use icons + text)
- [ ] Status colors complement the indigo/purple primary color
- [ ] No linting errors (`pnpm lint`)

---

## Reference Files

- **Color Variables**: `src/styles/app.css`
- **Example Components**: 
  - `src/components/SearchPage.tsx` (loading states, progress, status colors)
  - `src/components/ComparisonPage.tsx` (cards, badges, stats, platform display)
  - `src/components/LandingPage.tsx` (hero, sections, cards, gradients)
  - `src/components/Navigation.tsx` (sticky header, backdrop blur)

---

## Color Philosophy

**Primary Color Family**: Indigo → Violet → Purple gradient
- Creates a modern, trustworthy, and professional feel
- Excellent contrast with light backgrounds
- Pairs well with success (emerald), error (rose), and warning (amber) colors

**Status Color Strategy**:
- **Success (Emerald)**: Fresh, positive, complements indigo/purple without clashing
- **Error (Rose)**: Clear danger signal, visible but not jarring
- **Warning (Amber)**: Attention-grabbing, distinct from success and error
- **Info (Indigo)**: Uses primary color for consistency

This color scheme provides excellent visual hierarchy while maintaining accessibility standards.
