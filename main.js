const { app, BrowserWindow, Menu, ipcMain, screen } = require('electron');
const path = require('path');
const fs = require('fs');

const WIDTH = 300;
const settingsFile = () => path.join(app.getPath('userData'), 'settings.json');

const defaults = {
  alwaysOnTop: true,
  hour12: false,
  showSeconds: true,
  theme: 'dark',
  opacity: 1,
  x: null,
  y: null
};

function loadSettings() {
  try {
    return { ...defaults, ...JSON.parse(fs.readFileSync(settingsFile(), 'utf8')) };
  } catch {
    return { ...defaults };
  }
}

function saveSettings() {
  try {
    fs.mkdirSync(path.dirname(settingsFile()), { recursive: true });
    fs.writeFileSync(settingsFile(), JSON.stringify(settings, null, 2));
  } catch (e) {
    console.error('Could not save settings', e);
  }
}

let settings;
let win;

function onScreen(x, y) {
  return screen.getAllDisplays().some(({ workArea: a }) =>
    x >= a.x - 50 && y >= a.y - 50 && x < a.x + a.width - 50 && y < a.y + a.height - 50);
}

function createWindow() {
  const wa = screen.getPrimaryDisplay().workArea;
  let { x, y } = settings;
  if (x == null || y == null || !onScreen(x, y)) {
    x = wa.x + wa.width - WIDTH - 24;
    y = wa.y + 24;
  }

  win = new BrowserWindow({
    width: WIDTH,
    height: 340,
    x,
    y,
    frame: false,
    transparent: true,
    resizable: false,
    maximizable: false,
    fullscreenable: false,
    hasShadow: false,
    alwaysOnTop: settings.alwaysOnTop,
    skipTaskbar: false,
    title: 'Team Clock',
    backgroundColor: '#00000000',
    opacity: settings.opacity,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  if (process.platform === 'darwin') {
    win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  }

  win.loadFile('index.html');

  let moveTimer;
  win.on('moved', () => {
    clearTimeout(moveTimer);
    moveTimer = setTimeout(() => {
      const [nx, ny] = win.getPosition();
      settings.x = nx;
      settings.y = ny;
      saveSettings();
    }, 300);
  });
}

function pushSettings() {
  if (win && !win.isDestroyed()) win.webContents.send('settings', settings);
}

function update(patch) {
  Object.assign(settings, patch);
  saveSettings();
  if ('alwaysOnTop' in patch) win.setAlwaysOnTop(settings.alwaysOnTop);
  if ('opacity' in patch) win.setOpacity(settings.opacity);
  pushSettings();
}

function buildMenu() {
  const login = app.getLoginItemSettings().openAtLogin;
  return Menu.buildFromTemplate([
    { label: 'Team Clock', enabled: false },
    { type: 'separator' },
    { label: 'Always on top', type: 'checkbox', checked: settings.alwaysOnTop,
      click: (i) => update({ alwaysOnTop: i.checked }) },
    { label: '12-hour clock', type: 'checkbox', checked: settings.hour12,
      click: (i) => update({ hour12: i.checked }) },
    { label: 'Show seconds', type: 'checkbox', checked: settings.showSeconds,
      click: (i) => update({ showSeconds: i.checked }) },
    { label: 'Theme', submenu: ['dark', 'light'].map((t) => ({
      label: t[0].toUpperCase() + t.slice(1), type: 'radio', checked: settings.theme === t,
      click: () => update({ theme: t }) })) },
    { label: 'Opacity', submenu: [1, 0.9, 0.75, 0.6].map((o) => ({
      label: `${Math.round(o * 100)}%`, type: 'radio', checked: settings.opacity === o,
      click: () => update({ opacity: o }) })) },
    { type: 'separator' },
    { label: 'Launch at login', type: 'checkbox', checked: login,
      enabled: app.isPackaged,
      click: (i) => app.setLoginItemSettings({ openAtLogin: i.checked }) },
    { label: 'Reset position', click: () => {
      const wa = screen.getPrimaryDisplay().workArea;
      win.setPosition(wa.x + wa.width - WIDTH - 24, wa.y + 24);
    } },
    { type: 'separator' },
    { label: 'Quit Team Clock', role: 'quit' }
  ]);
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => { if (win) { win.show(); win.focus(); } });

  app.whenReady().then(() => {
    settings = loadSettings();

    ipcMain.handle('get-settings', () => settings);
    ipcMain.on('open-menu', () => buildMenu().popup({ window: win }));
    ipcMain.on('fit-height', (_e, h) => {
      const height = Math.max(120, Math.min(800, Math.ceil(h)));
      const [w] = win.getSize();
      win.setSize(w, height);
    });

    createWindow();
    app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
  });

  app.on('window-all-closed', () => app.quit());
}
