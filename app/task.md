# Task List - CivicSafe Enhancements

## Admin Panel Translation & Notifications
- `[x]` Add translation keys for admin screens to `src/constants/translations.ts`
- `[x]` Update `src/navigation/AdminNavigator.tsx` bottom tab labels to be dynamic
- `[x]` Implement notification bell, dynamic reported status filtering, and sliding glassmorphism modal on `src/screens/admin/dashboard/AdminDashboardScreen.tsx`
- `[x]` Localize `src/screens/admin/reports/ReportListScreen.tsx`
- `[x]` Localize `src/screens/admin/reports/AdminReportDetailScreen.tsx`
- `[x]` Localize `src/screens/admin/resolution/UploadResolutionScreen.tsx`
- `[x]` Localize `src/screens/admin/analytics/AnalyticsScreen.tsx`
- `[x]` Localize `src/screens/admin/map/LiveMapScreen.tsx`

## Splash Screen & Login/Signup UI Redesign
- `[x]` Replace logo with custom Earth emoji logo 🌏 and halo pulse on `SplashScreen.tsx`
- `[x]` Restructure `SplashScreen.tsx` layout with responsive flex spacing to prevent absolute overlaps
- `[x]` Add floating bouncing micro-animations to icon bubbles in `SplashScreen.tsx`
- `[x]` Add a spring halo pulse animation around the logo in `SplashScreen.tsx`
- `[x]` Add frosted radial gradient background glow graphics in `SplashScreen.tsx`
- `[x]` Build glassmorphic bottom sheet drawer language modal inside `SplashScreen.tsx`
- `[x]` Implement dynamic floating background glow blobs in `LoginScreen.tsx` and `SignupScreen.tsx`
- `[x]` Build light-glassmorphism neon cards with blur filters for login/signup forms matching the splash/dashboard background (#F9FAFB)
- `[x]` Configure scroll views with responsive flex centering to handle different screen heights and keyboard heights
- `[x]` Include matching Earth emoji logo badge next to the headers of login/signup forms
- `[x]` Implement custom glowing text input fields for focused feedback
- `[x]` Enable `PhoneInput.tsx` support for light and dark themes
- `[x]` Restructure login redirect text on `SplashScreen.tsx` to flex sibling elements to resolve "Log In" truncation clipping

## Native Firebase Email Verification System
- `[x]` Implement native Firebase Email Verification handlers (`sendFirebaseVerificationEmail` / `checkEmailVerified`)
- `[x]` Create modal verification dialog drawer inside frontend sign up screen
- `[x]` Link signup flow to gate backend registration until email link is verified
- `[x]` Implement cancellation flow to delete temporary Firebase credentials if user cancels
- `[x]` Configure blurred backdrop overlay (`BlurView` intensity set to `75`) to completely shield background text
- `[x]` Refactor modal layout into an absolute JSX sibling overlay to resolve Android windowing blur limitations
- `[x]` Configure custom opaque white card popup to block visual backdrop text clutter
- `[x]` Adjust action buttons padding and font sizes to prevent text wrapping on mobile screens
- `[x]` Localize verification prompts
- `[x]` Standardize comment formatting across all modified files

## Brand Branding & Translation Complete Fixes
- `[x]` Add all missing admin tab labels, department filters, and status keys to translations dictionary
- `[x]` Restructure Analytics Screen and Report list details to translate categories dynamically in English and Hindi
- `[x]` Exclude Android cache locks using `.easignore` configuration to ensure successful EAS builds
- `[x]` Execute Expo Prebuild tool to overwrite old Android configurations
- `[x]` Synchronize app installation name (`CivicSafe` in strings.xml) and launcher brand icons

## Project Verification
- `[x]` Verify compilation and type safety with `npx tsc --noEmit` in the app
