# Bankee - Finance Budget Tracker (React Native / Expo)

EoS Exam Oct 2026 - MCA Sem III - Mobile App Development using React Native
UI follows the Figma layout (header band + rounded light sheet, bottom navigation) in the Bänkee lilac & plum palette.

## Run
```
npm install
npx expo start        # scan QR with Expo Go, or press w for web / a for Android
```

## Demo logins (no back end - data is stored locally with AsyncStorage)
| Role | Email | Password |
|---|---|---|
| Customer | demo@budget.app | demo123 |
| Admin | admin@budget.app | admin123 |

New accounts: Sign Up as Customer, or as Admin using access code `ADMIN2026`.
New customers get sample transactions so charts are not empty.

## Rubric mapping
**Part I - Screens (30)** - `src/screens/`
1. Home (Sign up / Sign in, Admin + Customer) - `Auth.js` (`WelcomeScreen`, `SignInScreen`, `SignUpScreen`)
2. Analysis (Admin + Customer) - `Analysis.js`
3. Profile + Edit Profile (Customer) - `Profile.js`
4. Transactions, month-wise (Customer) - `Transactions.js` (plus Add/Edit/Delete)
5. Overall Categories (Customer) - `Categories.js` (`CategoriesScreen`)
6. Category Details (Customer) - `Categories.js` (`CategoryDetailsScreen`)

**Part II - React Navigation (30)** - `src/navigation.js`
- Stack: auth flow + a stack inside every tab (Add/Edit transaction, Category details, Edit profile)
- Bottom Tabs: Home, Analysis, Transactions, Categories, Profile (Admin: Analysis, Customers)
- Drawer: profile header, shortcuts to every screen, sign out

**Part III - Functional (15)**
- All screens reachable by tabs, drawer, buttons and back navigation
- Personalised alert on every add / edit / delete of a transaction (includes budget warnings) - `AppContext.js`
- Daily / Weekly / Monthly reports on the Home screen - `Home.js`, `buildReport` in `utils.js`

**Extras**
- Dark / light mode switch in the drawer, remembered on the device - `src/theme.js`
- Monthly savings goal + spending limit with progress meters and a confetti celebration on Home - `Home.js`, `Goals.js`
- Export the current Transactions view as a text summary or CSV (share sheet on phones, download/clipboard on web) - `exporters.js`, `share.js`
- Search by text/category/amount, category chips, income/expense filter, amount range and all-months scope - `Transactions.js`
- Forgot password: verify email + mobile, simulated OTP, set new password - `Auth.js`

**Notes:** validation on every form (sign up/in, add transaction, edit profile); no back end or database.
