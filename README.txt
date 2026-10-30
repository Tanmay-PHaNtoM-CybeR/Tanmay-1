TRIPGENIUS AI — BEGINNER START GUIDE
=====================================

TripGenius AI is a local travel-planning application. It opens in your own web
browser and does not require a login, paid subscription, or API key for its
offline planning features.

QUICK START ON WINDOWS
----------------------

1. Extract the TripGenius-AI ZIP file somewhere easy to find, such as Desktop.
2. Install the free Node.js LTS version if it is not already installed:
   https://nodejs.org/
   During installation, keep the default options selected.
3. Open the extracted "TripGenius-AI" folder.
4. Double-click INSTALL.bat once. It downloads the free project libraries.
   (You need an internet connection only for this first install.)
5. When it finishes, double-click START.bat.
6. Your browser should open TripGenius AI at http://127.0.0.1:5173. If another
   local app is using that port, START.bat uses the next available local address
   and shows the exact address in its window.
7. Keep the black START.bat window open while using the app. Close it when you
   are finished, then close the browser tab.

After the first installation, normally you only need to double-click START.bat.

IF THE BROWSER DOES NOT OPEN
----------------------------

While START.bat is open, copy the local address shown in its window into a
browser (normally http://127.0.0.1:5173).

If Windows shows a firewall prompt, allow Node.js on private networks. The app
is set to run only on this computer (127.0.0.1), not as a public website.

FEATURES THAT WORK OFFLINE
--------------------------

• Complete trip search form with traveller, child-age, room, date, budget,
  timing, hotel, food, and preference fields.
• Sample flight and train routes with price/speed/non-stop filters and sorting.
• Occupancy-safe hotel room recommendations, hotel filters, and totals.
• Day-by-day itinerary with morning, afternoon, evening, food, transport and
  estimated daily expenses.
• Full trip budget: transport, hotel, food, local travel, activities, shopping,
  emergency reserve, total, per-person total, and remaining budget.
• Save, load/edit and delete trips using your browser's local storage.
• Itinerary PDF download.
• Surprise Me destination discovery based on sample budgets.
• Local rule-based Travel Companion for packing, food, safety, transport and
  budgeting questions. It does not pretend to be connected to an AI service.
• Packing checklist, expense tracker, destination comparison and emergency tips.
• Light/dark mode.

DATA TRANSPARENCY — IMPORTANT
-----------------------------

This free local version deliberately uses clearly labelled illustrative sample
airline/train/hotel names, schedules, prices, hotel ratings, facilities and
availability. They are planning estimates, NOT live prices, actual seat/room
availability, reviews, booking confirmations, current weather, or railway
availability. The application shows this wherever those data appear.

The app has buttons that open external live searches for flights, hotels, train
schedules and maps. Use those sources to verify all information before booking.

LIVE DATA / FUTURE API INTEGRATIONS
-----------------------------------

Actual real-time flight, hotel and rail availability requires authorised data
providers, provider agreements, API credentials and, in many cases, paid usage.
No local web app can reliably provide genuine live booking data without them.
The project already separates offline plan data behind src/services/travelData.ts
so a developer can later connect an authorised provider without making the UI
misrepresent estimates as live results.

PROJECT FILES
-------------

src/App.tsx                 Main interface and working interactions
src/core.ts                 Planning, room, itinerary and budget logic
src/core.test.ts            Automated tests for key planning rules
src/services/travelData.ts  Offline provider boundary for future APIs
src/styles.css              Responsive design
INSTALL.bat                 Installs free npm packages
START.bat                   Starts the local app

OPTIONAL TECHNICAL CHECKS
-------------------------

Open Command Prompt in this folder and run:

  npm run test
  npm run build

These run the included planning-rule tests and create a production build.

TROUBLESHOOTING
---------------

• "npm was not found": install Node.js LTS from nodejs.org, then restart
  Windows or open a new folder window and run INSTALL.bat again.
• Port 5173 is busy: close any other TripGenius START.bat window, or press
  Ctrl+C in that window before starting it again.
• Saved trips disappeared: local saved data is stored by your browser. Do not
  clear that browser's site data if you want to retain saved trips.
