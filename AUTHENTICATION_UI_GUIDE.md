# Authentication UI Visual Guide

## Login Page Design

```
┌─────────────────────────────────────────┐
│                                         │
│          Gradient Background            │
│        (from-slate-100 to-slate-200)    │
│                                         │
│      ┌─────────────────────────────┐   │
│      │                             │   │
│      │      Welcome Back           │   │
│      │                             │   │
│      │  Sign in to your Student    │   │
│      │  Risk Prediction Dashboard  │   │
│      │                             │   │
│      ├─────────────────────────────┤   │
│      │                             │   │
│      │  Email Address              │   │
│      │  ┌─────────────────────────┐│   │
│      │  │student@example.com      ││   │
│      │  └─────────────────────────┘│   │
│      │                             │   │
│      │  Password                   │   │
│      │  ┌─────────────────────────┐│   │
│      │  │••••••••                ││   │
│      │  └─────────────────────────┘│   │
│      │                             │   │
│      │  ┌─────────────────────────┐│   │
│      │  │     Sign In             ││   │
│      │  └─────────────────────────┘│   │
│      │                             │   │
│      │  Don't have an account?     │   │
│      │  Create one here            │   │
│      │                             │   │
│      └─────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘

Colors:
- Background: Slate-100 to Slate-200 gradient
- Card: White
- Button: Blue-600 to Blue-700 gradient
- Text: Slate-900 (primary), Slate-600 (secondary)
- Links: Blue-600
```

---

## Signup Page Design

```
┌─────────────────────────────────────────┐
│                                         │
│          Gradient Background            │
│        (from-slate-100 to-slate-200)    │
│                                         │
│      ┌─────────────────────────────┐   │
│      │                             │   │
│      │     Create Account          │   │
│      │                             │   │
│      │  Sign up to access the      │   │
│      │  Student Risk Prediction    │   │
│      │  Dashboard                  │   │
│      │                             │   │
│      ├─────────────────────────────┤   │
│      │                             │   │
│      │  Full Name                  │   │
│      │  ┌─────────────────────────┐│   │
│      │  │John Doe                 ││   │
│      │  └─────────────────────────┘│   │
│      │                             │   │
│      │  Email Address              │   │
│      │  ┌─────────────────────────┐│   │
│      │  │student@example.com      ││   │
│      │  └─────────────────────────┘│   │
│      │                             │   │
│      │  Student ID                 │   │
│      │  ┌─────────────────────────┐│   │
│      │  │STU001                   ││   │
│      │  └─────────────────────────┘│   │
│      │                             │   │
│      │  Department                 │   │
│      │  ┌─────────────────────────┐│   │
│      │  │ Computer Science    ▼   ││   │
│      │  └─────────────────────────┘│   │
│      │                             │   │
│      │  Semester                   │   │
│      │  ┌─────────────────────────┐│   │
│      │  │ 4th Semester        ▼   ││   │
│      │  └─────────────────────────┘│   │
│      │                             │   │
│      │  Password                   │   │
│      │  ┌─────────────────────────┐│   │
│      │  │••••••••                ││   │
│      │  └─────────────────────────┘│   │
│      │  Minimum 6 characters       │   │
│      │                             │   │
│      │  Confirm Password           │   │
│      │  ┌─────────────────────────┐│   │
│      │  │••••••••                ││   │
│      │  └─────────────────────────┘│   │
│      │                             │   │
│      │  ┌─────────────────────────┐│   │
│      │  │  Create Account         ││   │
│      │  └─────────────────────────┘│   │
│      │                             │   │
│      │  Already have an account?   │   │
│      │  Login here                 │   │
│      │                             │   │
│      └─────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘

Colors:
- Background: Slate-100 to Slate-200 gradient
- Card: White with shadow
- Input borders: Slate-200 → Slate-300 on focus
- Labels: Slate-900
- Helpers: Slate-500
- Button: Blue-600 to Blue-700 gradient
- Links: Blue-600
```

---

## Form States

### Normal State
```
┌──────────────────────┐
│ Email Address        │
│ [student@email.com   │
└──────────────────────┘
  Input focused, user can type
```

### Filled State
```
┌──────────────────────┐
│ Email Address        │
│ student@example.com  │
└──────────────────────┘
  User has entered data
```

### Error State
```
┌──────────────────────┐
│ Email Address        │
│ [invalid.email       │
└──────────────────────┘
┌──────────────────────┐
│ ! Please enter a     │
│   valid email        │
└──────────────────────┘
  Shows error message
```

### Disabled State
```
┌──────────────────────┐
│ Email Address        │
│ [student@email.com   │
└──────────────────────┘
  Grayed out during form submission
```

---

## Loading States

### Form Loading
```
┌──────────────────────┐
│                      │
│  [⟳] Signing in...   │
│                      │
└──────────────────────┘
  Spinner + loading text
```

### Success Message
```
┌──────────────────────┐
│ ✓ Account created    │
│   successfully!       │
│   Redirecting to     │
│   login...           │
└──────────────────────┘
  Green background with checkmark
```

### Error Message
```
┌──────────────────────┐
│ ! Email already      │
│   registered. Please │
│   try logging in.    │
└──────────────────────┘
  Red background with alert icon
```

---

## Responsive Behavior

### Desktop (> 1024px)
```
Full width: 400px
Centered on screen
Large padding
```

### Tablet (768px - 1024px)
```
Max width: 90%
Centered with margins
Medium padding
Slightly larger font
```

### Mobile (< 768px)
```
Max width: 95%
Full height on small screens
Adaptive padding
Touch-friendly buttons (min 44px height)
Larger text for readability
```

---

## Color Palette

### Primary Colors
- Blue-600: #2563EB (Primary action)
- Blue-700: #1D4ED8 (Hover state)
- Slate-900: #0F172A (Primary text)

### Secondary Colors
- Slate-600: #475569 (Secondary text)
- Slate-500: #64748B (Helper text)
- Slate-200: #E2E8F0 (Borders)

### State Colors
- Red: #DC2626 (Errors)
- Green: #16A34A (Success)
- Amber: #D97706 (Warnings)

### Background
- Gradient: from-slate-100 to-slate-200

---

## Typography

### Headings
- h1/h2: 24px, weight 600
- Title: 18px, weight 600

### Body
- Regular: 14px, weight 400
- Label: 14px, weight 500
- Helper: 12px, weight 400

### Button
- Size: 14-16px
- Weight: 500
- Min height: 40px

---

## Spacing

### Card
- Padding: 24px
- Max width: 400px
- Border radius: 8px
- Shadow: lg (0 10px 15px rgba(0,0,0,0.1))

### Form Fields
- Margin bottom: 16px
- Label margin bottom: 8px
- Input padding: 8px 12px

### Buttons
- Width: 100%
- Height: 40px
- Border radius: 6px
- Font size: 14px

---

## Interactive Elements

### Buttons
```
Default:
┌─────────────────────┐
│    Sign In          │ Blue-600
└─────────────────────┘

Hover:
┌─────────────────────┐
│    Sign In          │ Blue-700 (darker)
└─────────────────────┘

Active:
┌─────────────────────┐
│ [⟳] Signing in...   │ Disabled with spinner
└─────────────────────┘

Disabled:
┌─────────────────────┐
│    Sign In          │ Gray (opacity 50%)
└─────────────────────┘
```

### Links
```
Default: Blue-600, underline on hover
Active: Blue-700
Visited: (same as default for auth links)
Focus: Blue outline
```

### Inputs
```
Default: Slate-200 border
Focus: Blue-600 border, shadow outline
Error: Red-600 border
Disabled: Gray background, no cursor
```

---

## Accessibility

### Focus Indicators
```
Input focused:
┌─────────────────────────────┐
│ Email Address              │
│ [student@example.com        │
└─────────────────────────────┘
  Blue outline visible
```

### Keyboard Navigation
- Tab: Move to next field
- Shift+Tab: Move to previous field
- Enter: Submit form / Click button
- Space: Toggle checkbox (if added)

### Screen Reader Support
- Form labels properly associated
- Error messages announced
- Loading states indicated
- Success/error messages live regions

---

## Mobile Optimization

### Touch Targets
- Minimum 44x44px for all interactive elements
- Adequate spacing between buttons
- Easy-to-tap links and buttons

### Mobile Keyboard
- Email field shows email keyboard
- Password field shows secure keyboard
- Numbers field shows numeric keyboard (if added)

### Mobile Layout
```
┌──────────────────────────┐
│                          │
│  Create Account          │
│  ─────────────────────── │
│                          │
│  Full Name               │
│  [____________________]  │
│                          │
│  Email Address           │
│  [____________________]  │
│                          │
│  Student ID              │
│  [____________________]  │
│                          │
│  ... (scrollable)        │
│                          │
│  ┌──────────────────────┐│
│  │ Create Account       ││
│  └──────────────────────┘│
│                          │
└──────────────────────────┘
```

---

## Animation & Transitions

### Button Hover
- Transition: 200ms ease
- Changes: background color, shadow

### Form Shake (on error)
- Duration: 300ms
- Effect: Small left-right shake

### Loading Spinner
- Rotation: Continuous 360°
- Duration: 1s per rotation
- Color: Blue-600

### Success Checkmark
- Fade in: 300ms
- Color change: Blue to Green

---

## Dark Mode (Future)

When implementing dark mode:
```
Background: Slate-900 to Slate-800
Card: Slate-800
Text: Slate-50
Borders: Slate-700
Input bg: Slate-700
Primary: Blue-500
```

---

This visual guide provides a comprehensive overview of the authentication UI design.
All components are implemented using shadcn/ui and Tailwind CSS.
