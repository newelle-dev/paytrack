# UI Architecture & Design System for Arzi Business Dashboard  
The "Arzi Business Dashboard" is designed to deliver a premium fintech experience, prioritizing rapid data entry, high readability, and a luxurious aesthetic. The design system follows a "Luxurious Metallic Gold" and "Gilded Ivory" theme paired with consistent data legibility for dense financial tables.

---

## 1. The Color Palette (Tailwind CSS Configuration)  

Below is the Tailwind configuration for the theme's `extend.colors` object.

### Tailwind Configuration
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        ivory: {
          DEFAULT: '#FBFAF5', // Base Gilded Ivory, used for backgrounds
          light: '#FFFFFF', // Pure white for primary background contrast
          cream: '#F3F0E5', // Soft cream for secondary content areas
        },
        gold: {
          DEFAULT: '#C5A880', // Luxurious Metallic Gold for primary elements
          dark: '#A38862', // Gold hover/dark states
          light: '#E1CBA3', // Subtle gold highlight variations
        },
        semantic: {
          success: '#27AE60', // High-contrast green for Paid/Success states
          error: '#E74C3C', // Rich red for Overdue/Deficit states
          warning: '#E2A03F', // Deep amber for warning states
        },
        text: {
          primary: '#2C2C2C', // Dark charcoal for primary text on ivory
          secondary: '#6B6B6B', // Muted gray for secondary text
        },
      },
    },
  },
};
```

### Descriptions  
1. **Background Layers (Gilded Ivory)**  
   - `ivory.DEFAULT` (#FBFAF5): Default background for primary app sections.  
   - `ivory.light` (#FFFFFF): High-contrast white for cards and focused content.  
   - `ivory.cream` (#F3F0E5): Secondary background to create distinct layers.  

2. **Primary Actions (Luxurious Metallic Gold)**  
   - `gold.DEFAULT` (#C5A880): Bold primary actions (buttons, active states).  
   - `gold.dark` (#A38862): Hover or active states for buttons.  
   - `gold.light` (#E1CBA3): Used sparingly for decorative highlights or accents.  

3. **Semantic Colors (Success, Error, Warning)**  
   - **Success**: `success` (#27AE60): High-contrast green, intuitive for Paid status.  
   - **Error**: `error` (#E74C3C): Rich red ensuring clarity for overdue balances.  
   - **Warning**: `warning` (#E2A03F): Amber for edge cases requiring attention but not critical (e.g., nearing payment due).  

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
- **Background**: `ivory.light` (#FFFFFF) to provide high contrast.  
- **Borders**: Thin 1px border using `ivory.cream`.  
- **Shadow**:  
  ```css
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.05);
  ```  
- **Spacing**:  
  - Padding: `py-6 px-8` (24px x 32px).  
  - Card Gutter: `gap-6` between multiple cards.  
- **Typography**:
  - Header: `text-lg font-bold text-text-primary` (e.g., “Total Capital”).  
  - Value: `text-xl font-medium text-gold.DEFAULT` (#C5A880).

---

### **Loan Creation Form**  
#### Layout  
The Loan Creation Form uses a **card-based layout** with clear input focus:  
- **Form Fields**:  
  - Use **card background** (`ivory.light`) with input fields aligned vertically.  
  - Inputs styled with high-contrast, clickable borders:
    ```css
    border: 1px solid #C5A880; /* Default Metallic Gold Border */
    focus: border-2 border-gold.dark; /* Darker focus state */
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
- **Input Focus**: Use prominent golden borders with `border-gold.dark` (#A38862).  

#### Actions  
- **Primary Button ("Submit Log")**:  
  - Background: `gold.DEFAULT` (#C5A880).  
  - Hover: `gold.dark` (#A38862).  
  - Disabled: `opacity-50` and `cursor-not-allowed`.  

---

This design system ensures a premium, accessible, and highly functional user experience tailored for rapid financial operations.