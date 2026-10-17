ESCAPE THE PRISON — STARTER PROJECT
==================================

FILES
-----
index.html                 Home page and chapter selection
assets/game.css            Shared black/maroon glassmorphism design
assets/game.js             Shared game logic and local save system
chapters/chapter-1.html    The Cell
chapters/chapter-2.html    Guard Station
chapters/chapter-3.html    Maintenance Tunnel
chapters/chapter-4.html    Security Hub
chapters/chapter-5.html    The Final Exit

HOW TO RUN
----------
1. Extract the ZIP file.
2. Keep the folders and files in the same structure shown above.
3. Open index.html in a browser, or upload the whole folder to a static host.
4. Start Chapter 1. Inspect the room objects and use the terminal panel.
5. The code for each chapter appears as a clue when you inspect the window or desk.
6. Progress is stored in this browser using localStorage.

CONTROLS
--------
- Tap room objects to inspect them.
- Use the Move buttons or keyboard A/D / left-right arrow keys.
- Use "Inspect nearby" to inspect the object nearest your character.
- Terminal commands: help, look, inventory, status, hint, clear, code ####
- Enter the chapter's code as: code 4312 (Chapter 1), code 2580 (Chapter 2),
  code 7046 (Chapter 3), code 1963 (Chapter 4), code 8251 (Chapter 5).

IMPORTANT
---------
This is a fictional puzzle game starter. The terminal is simulated; it does not
run Python or system commands. Save data is local to the current browser/device.
The room art and puzzles are a starter foundation that you can customize.
