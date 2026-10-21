# Design System & Visual Foundation — CareerForge

## 1. Editorial Visual Philosophy
CareerForge adopts an editorial, publication-style aesthetic crafted specifically for professional job discovery. Rather than generic gradient-heavy templates, it uses:
- **Base Canvas**: Soft, natural warm off-white (`#FAF8F5`) avoiding stark eye fatigue.
- **Card Surfaces**: Pure white (`#FFFFFF`) with subtle neutral borders (`#E8E4DC`) and elevated drop shadows.
- **Primary Typography**: Deep charcoal and navy (`#11141A`, `#1E232E`) using `Inter` with strong typographic scale.
- **Accent**: Electric indigo (`#4F46E5`) reserved for actionable links, buttons, and state indicators.
- **Semantic Accents**:
  - Success/Fresher: Soft emerald (`#E8F5E9`, text `#1B5E20`).
  - Warning/Pending: Soft amber (`#FFF8E1`, text `#E65100`).
  - Error/Destructive: Soft rose (`#FFEBEE`, text `#B71C1C`).

---

## 2. Component Inventory

| Component | Path | Description |
|---|---|---|
| **SiteHeader** | `components/layout/SiteHeader.tsx` | Sticky navbar with branding, desktop navigation, and animated mobile drawer |
| **SiteFooter** | `components/layout/SiteFooter.tsx` | Minimalist footer with legal & product directory links |
| **PageContainer** | `components/ui/PageContainer.tsx` | Uniform container constraining content width (`narrow`, `default`, `wide`, `full`) |
| **PrimaryButton** | `components/ui/Button.tsx` | High-contrast black action button with loading spinner & active press state |
| **SecondaryButton** | `components/ui/Button.tsx` | Card-backed bordered button for secondary interactions |
| **SearchInput** | `components/ui/SearchInput.tsx` | Editorial search input with search icon, clear button, and focus ring |
| **FilterSelect** | `components/ui/FilterSelect.tsx` | Clean dropdown selector with custom chevron and accessible label |
| **JobCard** | `components/ui/JobCard.tsx` | Responsive job listing card with salary formatting, fresher badge & tags |
| **SectionHeading** | `components/ui/SectionHeading.tsx` | Standard heading with title, subtitle, kicker tag, and action slots |
| **Badge & Tag** | `components/ui/Badge.tsx` | Status indicators and technical skill chips |
| **LoadingSkeleton** | `components/ui/LoadingSkeleton.tsx` | Subtle pulse placeholders matching JobCard geometry |
| **EmptyState** | `components/ui/EmptyState.tsx` | Informative empty search/filter result fallback |
| **ErrorState** | `components/ui/ErrorState.tsx` | Actionable error alert with retry button |
| **Toast** | `components/ui/Toast.tsx` | Accessible live notification with Framer Motion slide-in and auto-dismiss |
| **ConfirmationDialog** | `components/ui/ConfirmationDialog.tsx` | Accessible modal with focus trapping, backdrop blur, and ESC listener |
| **Mobile Navigation** | Integrated into `SiteHeader` | Animated sliding drawer with accessible ARIA toggle |

---

## 3. Motion & Accessibility Standards
- **Framer Motion**:
  - Restrained entrance animations (`y: 8, opacity: 0` to `y: 0, opacity: 1`).
  - Micro-interactions on buttons (`active:scale-[0.98]`) and cards (`whileHover: { y: -2 }`).
- **Prefers-Reduced-Motion**:
  - Configured globally in `src/index.css` to disable transitions and animations if system reduced-motion is requested.
- **Accessibility**:
  - Standard focus indicators (`*:focus-visible { outline: 2px solid #4F46E5; }`).
  - Strict semantic labels on inputs, dropdowns, and dialogs (`aria-modal`, `aria-labelledby`, `aria-label`).
