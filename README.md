# Team Clock

A small always-on-top desktop widget showing the current time in **Melbourne, Brisbane, Adelaide and Colombo**.

- Daylight saving is handled automatically (Melbourne and Adelaide shift; Brisbane and Colombo don't).
- Each city shows its UTC offset and how far it is **ahead of or behind you**.
- A **green dot** marks cities in working hours (Mon–Fri, 9am–5pm local).
- "Tomorrow" / "Yesterday" is shown when a city is on a different date from you.
- Drag it anywhere. It remembers its position.
- Click **⋯** for settings: always on top, 12/24-hour, seconds, light/dark theme, opacity, launch at login, reset position, quit.

## Install on Windows

Pick one file from the `dist` folder:

| File | What it does |
|---|---|
| `Team Clock Setup 1.0.0.exe` | Installs the app with Start Menu and Desktop shortcuts. **Recommended.** |
| `TeamClock-Portable-1.0.0.exe` | Runs without installing. |

Both work on Intel/AMD and ARM PCs. The app isn't code-signed, so Windows SmartScreen may show "Windows protected your PC". Click **More info → Run anyway**.

To start it automatically, open the widget's **⋯** menu and tick **Launch at login**.

## Install on macOS

A Mac installer (`.dmg`) has to be built on a Mac or in the cloud. Choose one way:

**Option A: build on any Mac** (needs [Node.js](https://nodejs.org) 18+)

```bash
cd team-clock-widget
npm install
npm run dist:mac
```

This creates `dist/Team Clock-1.0.0-universal.dmg`, which runs on Intel and Apple Silicon. Open it and drag **Team Clock** to Applications.

**Option B: GitHub Actions.** Push this folder to a GitHub repo, then open **Actions → Build Team Clock → Run workflow**. It builds both the Windows `.exe` and the Mac `.dmg` for you to download.

The first time you open it on a Mac, right-click the app → **Open** → **Open**, because the app isn't signed with an Apple developer certificate.

## Change the cities

Edit the `zones` list near the top of the `<script>` in `index.html`:

```js
{ city: 'Colombo', region: 'LK', tz: 'Asia/Colombo' }
```

`tz` must be an [IANA time-zone name](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones). Then rebuild with `npm run dist:win` or `npm run dist:mac`.

## Run from source

```bash
npm install
npm start
```
