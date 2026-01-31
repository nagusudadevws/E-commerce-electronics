# UI/UX Design Guidelines
## Multi-Vendor Electronics & IoT E-Commerce Platform

---

## Overview

This document defines the comprehensive UI/UX design system for the Multi-Vendor Electronics & IoT E-Commerce Platform. These guidelines ensure consistency, accessibility, and a premium user experience across all phases of development.

**Design Philosophy**: Modern, Minimal, Institute-Style UI with clean layouts, strong visual hierarchy, and professional, educational, premium feel.

---

## Design Principles

### 1. Modern & Minimal
- Clean, uncluttered interfaces
- Generous white space
- Focus on essential elements
- Remove unnecessary visual noise

### 2. Institute-Style Aesthetic
- Professional and educational feel
- Premium quality perception
- Trustworthy and authoritative
- Academic yet approachable

### 3. Strong Visual Hierarchy
- Clear information architecture
- Logical content flow
- Prominent call-to-action buttons
- Scannable content structure

### 4. Bold Typography
- Prominent headings for impact
- Readable body text
- Clear font size hierarchy
- Consistent font weights

---

## Color Palette

### Primary Colors
```css
/* Primary Blue - Main brand color */
--blue-50: #eff6ff;
--blue-100: #dbeafe;
--blue-600: #2563eb;  /* Primary actions, links */
--blue-700: #1d4ed8;  /* Hover states */
--blue-800: #1e40af;  /* Active states */
```

### Secondary Colors
```css
/* Gray Scale - Text and backgrounds */
--gray-50: #f9fafb;   /* Light backgrounds */
--gray-100: #f3f4f6;  /* Subtle backgrounds */
--gray-200: #e5e7eb;  /* Borders, dividers */
--gray-300: #d1d5db;  /* Input borders */
--gray-600: #4b5563;  /* Secondary text */
--gray-700: #374151;  /* Body text */
--gray-900: #111827;  /* Headings */
```

### Status Colors
```css
/* Success */
--green-100: #dcfce7;
--green-600: #16a34a;
--green-800: #166534;

/* Warning */
--yellow-100: #fef3c7;
--yellow-600: #ca8a04;
--yellow-800: #854d0e;

/* Error */
--red-100: #fee2e2;
--red-600: #dc2626;
--red-800: #991b1b;

/* Info */
--blue-100: #dbeafe;
--blue-600: #2563eb;
```

### Accent Colors
```css
/* Purple - Secondary accent */
--purple-50: #faf5ff;
--purple-600: #9333ea;
--purple-700: #7e22ce;
```

---

## Typography

### Font Family
- **Primary**: System font stack (San Francisco, Segoe UI, Roboto, sans-serif)
- **Fallback**: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`

### Font Sizes
```css
/* Headings */
--text-4xl: 2.25rem;    /* 36px - Hero titles */
--text-3xl: 1.875rem;   /* 30px - Page titles */
--text-2xl: 1.5rem;     /* 24px - Section titles */
--text-xl: 1.25rem;     /* 20px - Subsection titles */
--text-lg: 1.125rem;    /* 18px - Large body text */

/* Body */
--text-base: 1rem;     /* 16px - Default body text */
--text-sm: 0.875rem;    /* 14px - Secondary text */
--text-xs: 0.75rem;     /* 12px - Labels, captions */
```

### Font Weights
```css
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Typography Scale Usage

**Hero Section**
- Heading: `text-4xl md:text-5xl lg:text-6xl font-bold`
- Subheading: `text-xl md:text-2xl text-gray-600`

**Page Titles**
- Main: `text-3xl font-bold text-gray-900`
- Subtitle: `text-lg text-gray-600`

**Section Headings**
- Primary: `text-2xl font-bold text-gray-900`
- Secondary: `text-xl font-semibold text-gray-900`

**Body Text**
- Default: `text-base text-gray-700`
- Secondary: `text-sm text-gray-600`
- Muted: `text-xs text-gray-500`

---

## Spacing System

### Base Unit
- **Base**: 4px (0.25rem)
- All spacing values are multiples of 4px

### Spacing Scale
```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
```

### Usage Guidelines
- **Component padding**: `p-4` to `p-8` (16px - 32px)
- **Section spacing**: `py-12` to `py-20` (48px - 80px)
- **Element gaps**: `gap-4` to `gap-8` (16px - 32px)
- **Card padding**: `p-6` (24px) default

---

## Component Standards

### Buttons

#### Primary Button
```tsx
<Button variant="primary" size="md">
  Primary Action
</Button>
```

**Styles**:
- Background: `bg-blue-600`
- Text: `text-white`
- Hover: `hover:bg-blue-700`
- Active: `active:bg-blue-800`
- Focus: `focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`
- Padding: `px-4 py-2` (md), `px-6 py-3` (lg)
- Border radius: `rounded-lg`
- Font: `font-semibold`

#### Secondary Button
```tsx
<Button variant="secondary" size="md">
  Secondary Action
</Button>
```

**Styles**:
- Background: `bg-gray-200`
- Text: `text-gray-900`
- Hover: `hover:bg-gray-300`

#### Outline Button
```tsx
<Button variant="outline" size="md">
  Outline Action
</Button>
```

**Styles**:
- Border: `border-2 border-blue-600`
- Text: `text-blue-600`
- Hover: `hover:bg-blue-50`
- Background: Transparent

#### Ghost Button
```tsx
<Button variant="ghost" size="md">
  Ghost Action
</Button>
```

**Styles**:
- Background: Transparent
- Text: `text-gray-700`
- Hover: `hover:bg-gray-100`

#### Button Sizes
- **Small**: `px-3 py-1.5 text-sm`
- **Medium**: `px-4 py-2 text-base` (default)
- **Large**: `px-6 py-3 text-lg`

#### Button States
- **Default**: Normal appearance
- **Hover**: Slightly darker background
- **Active**: Pressed state (darker)
- **Disabled**: `opacity-50 cursor-not-allowed`
- **Loading**: Show spinner + "Loading..." text

### Input Fields

#### Standard Input
```tsx
<Input
  label="Email Address"
  type="email"
  placeholder="you@example.com"
  required
/>
```

**Styles**:
- Border: `border border-gray-300`
- Focus: `focus:ring-2 focus:ring-blue-500 focus:border-transparent`
- Padding: `px-4 py-2.5`
- Border radius: `rounded-lg`
- Error state: `border-red-500 focus:ring-red-500`

#### Input States
- **Default**: Gray border
- **Focus**: Blue ring, transparent border
- **Error**: Red border, red ring
- **Disabled**: `bg-gray-50 opacity-50`

#### Label Styles
- Font: `text-sm font-medium text-gray-700`
- Spacing: `mb-1.5` below label

#### Error Message
- Font: `text-sm text-red-600`
- Spacing: `mt-1.5` below input

### Cards

#### Standard Card
```tsx
<Card className="p-6">
  Card Content
</Card>
```

**Styles**:
- Background: `bg-white`
- Border: `border border-gray-200`
- Shadow: `shadow-sm`
- Border radius: `rounded-xl`
- Padding options: `p-4` (sm), `p-6` (md), `p-8` (lg)

#### Card Variants
- **Default**: White background, subtle shadow
- **Hover**: `hover:shadow-lg` for interactive cards
- **Elevated**: `shadow-md` for important content

### Navigation

#### Header Navigation
- Background: `bg-white`
- Border: `border-b border-gray-200`
- Height: `h-16` (64px)
- Sticky: `sticky top-0 z-50`

#### Navigation Links
- Default: `text-gray-700`
- Hover: `hover:text-blue-600`
- Active: `text-blue-600 bg-blue-50`
- Font: `font-medium`
- Transition: `transition-colors`

#### Mobile Menu
- Background: `bg-white`
- Border: `border-t border-gray-200`
- Padding: `py-4`
- Full width links with proper spacing

### Status Badges

#### Success Badge
```tsx
<span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
  Active
</span>
```

#### Warning Badge
```tsx
<span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
  Pending
</span>
```

#### Error Badge
```tsx
<span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
  Failed
</span>
```

#### Info Badge
```tsx
<span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
  Info
</span>
```

### Loading States

#### Spinner
```tsx
<div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-600"></div>
```

**Sizes**:
- Small: `w-4 h-4`
- Medium: `w-8 h-8` (default)
- Large: `w-12 h-12`

#### Skeleton Loader
```tsx
<div className="animate-pulse">
  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
</div>
```

### Tables

#### Table Container
- Background: `bg-white`
- Border: `border border-gray-200`
- Border radius: `rounded-lg`
- Overflow: `overflow-x-auto`

#### Table Header
- Background: `bg-gray-50`
- Text: `text-xs font-medium text-gray-500 uppercase`
- Padding: `px-6 py-3`
- Border: `border-b border-gray-200`

#### Table Rows
- Hover: `hover:bg-gray-50`
- Border: `border-b border-gray-200`
- Padding: `px-6 py-4`

#### Table Cells
- Text: `text-sm text-gray-900`
- Secondary text: `text-sm text-gray-500`

---

## Animation Guidelines

### Principles
- **Subtle**: Animations should be noticeable but not distracting
- **Purposeful**: Every animation should serve a purpose
- **Fast**: Animations should complete quickly (200-300ms)
- **Smooth**: 60fps target, no janky animations

### Transition Durations
```css
--transition-fast: 150ms;    /* Micro-interactions */
--transition-base: 200ms;    /* Standard transitions */
--transition-slow: 300ms;     /* Page transitions */
```

### Animation Types

#### Hover Effects
```css
/* Button hover */
transition-colors duration-200

/* Card hover */
hover:shadow-lg transition-shadow duration-200

/* Link hover */
hover:text-blue-600 transition-colors duration-200
```

#### Loading Animations
```css
/* Spinner */
animate-spin

/* Pulse (skeleton) */
animate-pulse

/* Fade in */
animate-fade-in
```

#### Page Transitions
- Fade: `opacity-0` → `opacity-100`
- Slide: `translate-x-4` → `translate-x-0`
- Duration: 200-300ms

### Micro-Interactions

#### Button Press
- Scale: `active:scale-95`
- Duration: 100ms

#### Card Lift
- Transform: `hover:scale-105`
- Shadow: `hover:shadow-lg`
- Duration: 200ms

#### Input Focus
- Ring: `focus:ring-2 focus:ring-blue-500`
- Border: `focus:border-transparent`
- Duration: 150ms

---

## Responsive Design

### Breakpoints
```css
/* Tailwind CSS Breakpoints */
sm: 640px   /* Small devices (tablets) */
md: 768px   /* Medium devices (small laptops) */
lg: 1024px  /* Large devices (desktops) */
xl: 1280px  /* Extra large devices */
2xl: 1536px /* 2X Extra large devices */
```

### Mobile-First Approach
- Design for mobile first (320px+)
- Enhance for larger screens
- Use responsive utilities: `sm:`, `md:`, `lg:`, `xl:`

### Responsive Patterns

#### Grid Layouts
```tsx
{/* Mobile: 1 column, Desktop: 3 columns */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  {/* Content */}
</div>
```

#### Typography
```tsx
{/* Responsive text sizes */}
<h1 className="text-3xl md:text-4xl lg:text-5xl">
  Heading
</h1>
```

#### Spacing
```tsx
{/* Responsive padding */}
<div className="px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
  {/* Content */}
</div>
```

#### Navigation
- Desktop: Horizontal menu
- Mobile: Hamburger menu with slide-out drawer

### Touch Targets
- Minimum size: 44px × 44px
- Adequate spacing between touch targets
- No hover-only interactions on mobile

---

## Layout Patterns

### Page Structure
```
┌─────────────────────────┐
│      Header/Nav         │ (sticky)
├─────────────────────────┤
│                         │
│      Main Content       │ (flex-grow)
│                         │
├─────────────────────────┤
│        Footer           │
└─────────────────────────┘
```

### Container Widths
- **Full width**: `w-full`
- **Container**: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- **Narrow content**: `max-w-4xl mx-auto`
- **Form width**: `max-w-2xl mx-auto`

### Section Spacing
- **Between sections**: `py-12 md:py-16 lg:py-20`
- **Within sections**: `space-y-6` or `space-y-8`

### Grid Patterns

#### Product Grid
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {/* Product cards */}
</div>
```

#### Dashboard Grid
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {/* Stat cards */}
</div>
```

#### Two-Column Layout
```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
  {/* Content */}
</div>
```

---

## Accessibility Guidelines

### WCAG 2.1 AA Compliance

#### Color Contrast
- **Text on background**: Minimum 4.5:1 ratio
- **Large text**: Minimum 3:1 ratio
- **Interactive elements**: Minimum 3:1 ratio

#### Keyboard Navigation
- All interactive elements must be keyboard accessible
- Focus indicators visible (ring-2)
- Logical tab order
- Skip links for main content

#### Screen Readers
- Semantic HTML elements
- ARIA labels where needed
- Alt text for images
- Form labels associated with inputs

#### Focus Management
- Visible focus indicators
- Focus trap in modals
- Focus return after modal close

### Best Practices

#### Forms
- Clear labels for all inputs
- Error messages associated with inputs
- Required fields clearly marked
- Success feedback after submission

#### Images
- Descriptive alt text
- Decorative images: `alt=""`
- Informative images: Descriptive alt text

#### Links
- Descriptive link text (avoid "click here")
- External links: Indicate with icon or text
- Visited state: Different color

---

## Error Handling

### Error Messages
- **Color**: Red (`text-red-600`)
- **Background**: Light red (`bg-red-50`)
- **Border**: Red border (`border-red-200`)
- **Icon**: Error icon (optional)
- **Location**: Near the relevant field or action

### Error Display Pattern
```tsx
<div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
  Error message here
</div>
```

### Success Messages
- **Color**: Green (`text-green-700`)
- **Background**: Light green (`bg-green-50`)
- **Border**: Green border (`border-green-200`)

### Validation States
- **Default**: Gray border
- **Error**: Red border + error message
- **Success**: Green border (optional)
- **Loading**: Disabled state + spinner

---

## Empty States

### Empty State Pattern
```tsx
<div className="text-center py-12">
  <div className="text-5xl mb-4">📦</div>
  <h3 className="text-lg font-semibold text-gray-900 mb-2">
    No products found
  </h3>
  <p className="text-gray-600 mb-6">
    Get started by adding your first product.
  </p>
  <Button>Add Product</Button>
</div>
```

### Guidelines
- Clear icon or illustration
- Descriptive heading
- Helpful description
- Call-to-action button

---

## Loading States

### Page Loading
- Full-page spinner
- Skeleton screens for content
- Progress indicators for long operations

### Button Loading
- Spinner inside button
- "Loading..." text
- Disabled state

### Table Loading
- Skeleton rows
- Shimmer effect
- Maintain table structure

### Form Loading
- Disable submit button
- Show spinner
- Prevent multiple submissions

---

## Iconography

### Icon Style
- **Style**: Outline icons (preferred)
- **Size**: Match text size
- **Color**: Inherit from text color
- **Library**: Heroicons or similar

### Icon Sizes
- **Small**: `w-4 h-4` (16px)
- **Medium**: `w-5 h-5` (20px) - default
- **Large**: `w-6 h-6` (24px)
- **XLarge**: `w-8 h-8` (32px)

### Icon Usage
- Use icons to enhance, not replace text
- Consistent icon style throughout
- Accessible (with aria-labels if needed)

---

## Form Design

### Form Layout
- Single column on mobile
- Two columns on desktop (where appropriate)
- Consistent spacing between fields
- Clear section grouping

### Form Validation
- Real-time validation (on blur)
- Clear error messages
- Success indicators (optional)
- Prevent submission with errors

### Form Actions
- Primary action (Submit) on the right
- Secondary action (Cancel) on the left
- Clear button hierarchy

---

## Modal/Dialog Patterns

### Modal Structure
```tsx
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
    {/* Modal content */}
  </div>
</div>
```

### Modal Guidelines
- Backdrop: Semi-transparent black
- Centered on screen
- Close button (X) in top-right
- Escape key to close
- Focus trap inside modal
- Return focus after close

---

## Data Display

### Tables
- Clear headers
- Alternating row colors (optional)
- Hover states for rows
- Responsive (scroll on mobile)
- Sortable columns (where applicable)

### Lists
- Consistent spacing
- Clear hierarchy
- Hover states
- Action buttons aligned

### Cards
- Consistent padding
- Clear visual hierarchy
- Hover effects for interactive cards
- Proper spacing between cards

---

## Brand Identity

### Logo Usage
- Consistent placement (top-left in header)
- Minimum size: 120px width
- Maintain aspect ratio
- High contrast on backgrounds

### Brand Colors
- Primary: Blue (#2563eb)
- Use consistently across all pages
- Maintain color hierarchy

### Voice & Tone
- Professional yet approachable
- Clear and concise
- Helpful and informative
- Trustworthy

---

## Implementation Checklist

### For Each Component
- [ ] Follows color palette
- [ ] Uses correct typography scale
- [ ] Proper spacing (4px grid)
- [ ] Responsive design
- [ ] Accessible (keyboard, screen reader)
- [ ] Loading states
- [ ] Error states
- [ ] Hover/active states
- [ ] Smooth animations
- [ ] Consistent with design system

### For Each Page
- [ ] Clear visual hierarchy
- [ ] Proper spacing between sections
- [ ] Responsive layout
- [ ] Accessible navigation
- [ ] Loading states
- [ ] Error handling
- [ ] Empty states (if applicable)
- [ ] Consistent header/footer

---

## Tools & Resources

### Design Tools
- **Figma**: For design mockups
- **Tailwind CSS**: For implementation
- **Heroicons**: For iconography

### Color Tools
- **Coolors.co**: Color palette generation
- **WebAIM Contrast Checker**: Accessibility validation

### Typography Tools
- **Type Scale**: Typography scale generator
- **Google Fonts**: Font selection

---

## Version History

- **v1.0** (2024): Initial design system documentation
- Created for Multi-Vendor E-Commerce Platform

---

## Notes for Developers

1. **Consistency is Key**: Follow these guidelines strictly across all phases
2. **Mobile-First**: Always design for mobile first
3. **Accessibility**: Never compromise on accessibility
4. **Performance**: Keep animations smooth (60fps)
5. **User Testing**: Test with real users when possible
6. **Iteration**: Design system can evolve, but maintain consistency

---

**Last Updated**: 2024  
**Status**: Active Design System  
**Applies To**: All Development Phases (0-6)

