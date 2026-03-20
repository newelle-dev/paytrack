# UI Architecture & Design System for Arzi Business Dashboard  
The "Arzi Business Dashboard" is designed to deliver a premium fintech experience, prioritizing rapid data entry, high readability, and a luxurious aesthetic. The design system follows a "Luxurious Metallic Gold" and "Gilded Ivory" theme paired with consistent data legibility for dense financial tables.

---

## 1. The Color Palette (Tailwind CSS v4 Configuration)  

In Tailwind CSS v4, configuration is CSS-first. Custom colors and theme variables are defined within the `@theme` block in your global CSS file.

### Theme Configuration (globals.css)
```css
@import "tailwindcss";

@theme {
  /* Ivory Palette - Base backgrounds */
  --color-ivory: #FBFAF5;
  --color-ivory-light: #FFFFFF;
  --color-ivory-cream: #F3F0E5;

  /* Gold Palette - Primary actions & Branding */
  --color-gold: #C5A880;
  --color-gold-dark: #A38862;
  --color-gold-light: #E1CBA3;

  /* Semantic Palette - Status indicators */
  --color-success: #27AE60;
  --color-error: #E74C3C;
  --color-warning: #E2A03F;

  /* Text Palette */
  --color-text-primary: #2C2C2C;
  --color-text-secondary: #6B6B6B;

  /* Custom Transitions & Effects */
  --animate-gold-glow: gold-glow 2s infinite;

  /* Typography */
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
}

@keyframes gold-glow {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
```


### Descriptions  
1. **Background Layers (Gilded Ivory)**  
   - `ivory` (#FBFAF5): Default background for primary app sections. (CSS: `bg-ivory`)
   - `ivory-light` (#FFFFFF): High-contrast white for cards and focused content. (CSS: `bg-ivory-light`)
   - `ivory-cream` (#F3F0E5): Secondary background to create distinct layers. (CSS: `bg-ivory-cream`)

2. **Primary Actions (Luxurious Metallic Gold)**  
   - `gold` (#C5A880): Bold primary actions (buttons, active states). (CSS: `bg-gold`)
   - `gold-dark` (#A38862): Hover or active states for buttons. (CSS: `bg-gold-dark`)
   - `gold-light` (#E1CBA3): Used sparingly for decorative highlights or accents. (CSS: `bg-gold-light`)

3. **Semantic Colors (Success, Error, Warning)**  
   - **Success**: `success` (#27AE60): High-contrast green for Paid/Success states. (CSS: `text-success`)
   - **Error**: `error` (#E74C3C): Rich red for Overdue/Deficit states. (CSS: `text-error`)
   - **Warning**: `warning` (#E2A03F): Amber for nearing payment due dates. (CSS: `text-warning`)

---

## 2. Typography & Data Legibility  

### Primary Font Family  
- **Font**: Inter (Geometric sans-serif)  
- **Fallbacks**: `sans-serif`  

### Typography Strategy  
#### General
- **Body Text**: Use `text-text-primary` (#2C2C2C) for primary content and `text-text-secondary` (#6B6B6B) for muted content.  
- **Font Size**:  
  - Base: `text-base` (16px)  
  - Tables: `text-sm` (14px) for dense data readability.  

#### Financial Data  
**Critical Rule: Use Tabular Numerals**  
- Financial data (e.g., loan schedules, payments) requires aligned decimal points for legibility.  
```css
font-variant-numeric: tabular-nums; /* CSS */
```

#### Example Usage  
```css
font-family: 'Inter', sans-serif;
font-size: 14px;
line-height: 1.5;
font-weight: 400;
font-variant-numeric: tabular-nums;
color: #2C2C2C;
```

### Header Styles (For Cards and Modals)  
1. **Dashboard Section Headings**:  
   - `text-lg` (18px), bold weight (700).  
   - Use `tracking-tight` for cleaner kerning.  
2. **Modal/Short Headers**:  
   - `text-md` (16px), medium weight (600), same alignment goal.

---

## 3. Core Component Specifications  

### **Dashboard Cards** (Overview Section)  
#### Description  
Cards are used for high-level key metrics, such as Total Capital and Total Interest. They must balance premium aesthetics with readability.  

#### Design Details  
- **Background**: `ivory-light` (#FFFFFF) to provide high contrast.  
- **Borders**: Thin 1px border using `ivory-cream`.  
- **Shadow**:  
  ```css
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.05);
  ```  
- **Spacing**:  
  - Padding: `py-6 px-8` (24px x 32px).  
  - Card Gutter: `gap-6` between multiple cards.  
- **Typography**:
  - Header: `text-lg font-bold text-text-primary` (e.g., “Total Capital”).  
  - Value: `text-xl font-medium text-gold` (#C5A880).

---

### **Loan Creation Form**  
#### Layout  
The Loan Creation Form uses a **card-based layout** with clear input focus:  
- **Form Fields**:  
  - Use **card background** (`ivory-light`) with input fields aligned vertically.  
  - Inputs styled with high-contrast, clickable borders:
    ```css
    border: 1px solid var(--color-gold); /* Default Metallic Gold Border */
    focus: border-2 border-gold-dark; /* Darker focus state via @theme variable */
    ```

#### Example Layout
```plaintext
-----------------------------------------
| Loan Information                      |
| ------------------------------------- |
| [Principal Amount  | Loan Category  ] |
| [Release Date      | Term Type      ] |
| ------------------------------------- |
| Profit Allocations                    |
| [RC: 80%           | EDITH: 20%    ] |
-----------------------------------------
```

#### Spacing  
- Form Segments: `gap-6`  
- Field Padding: `py-2 px-4`  

#### Error Feedback  
- Errors should render below inputs in the semantic `text-error` color (#E74C3C).  

---

### **Payment Modal** (One-Click Payment Logging)  
#### Design Objective  
The Payment Modal prioritizes **minimalism and rapid data entry**. Users should be able to log payments with minimal distraction or clicks.  

#### Layout  
- **Modal Size**: Medium (`sm:max-w-lg` at 500px width).  
- **Form Fields**:  
  (Input examples and labels aligned for clarity)
  ```plaintext
  ------------------------------------
  | Log Payment                      |
  | -------------------------------- |
  | [Borrower Dropdown]              |
  | [Payment Amount]                 |
  | [Payment Method Dropdown]        |
  | [Payment Date Picker]            |
  | -------------------------------- |
  | Notes                            |
  | [Free text input]                |
  | -------------------------------- |
  | [ Cancel ]         [Submit Log ] |
  ------------------------------------
  ```

#### Focus States  
- **Input Focus**: Use prominent golden borders with `border-gold-dark` (#A38862).  

#### Actions  
- **Primary Button ("Submit Log")**:  
  - Background: `gold` (#C5A880).  
  - Hover: `gold-dark` (#A38862).  
  - Disabled: `opacity-50` and `cursor-not-allowed`.  

---

This design system ensures a premium, accessible, and highly functional user experience tailored for rapid financial operations.