// main.js
const { app, BrowserWindow, ipcMain, screen } = require('electron')
const path = require('path')

let mainWindow
let extWindow

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  mainWindow.loadFile('main.html')

  // 초기 상태 전송
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('ext-window-status', {
      isOpen: false,
      display: null
    })
  })
}

function createExtWindow() {
  const displays = screen.getAllDisplays()
  const externalDisplay = displays.find((display) => {
    return display.bounds.x !== 0 || display.bounds.y !== 0
  })

  if (externalDisplay) {
    extWindow = new BrowserWindow({
      x: externalDisplay.bounds.x,
      y: externalDisplay.bounds.y,
      width: externalDisplay.bounds.width,
      height: externalDisplay.bounds.height,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      },
      frame: false,
      fullscreen: true,
      alwaysOnTop: true
    })
  } else {
    extWindow = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      },
      frame: false,
      fullscreen: true
    })
  }

  extWindow.loadFile('ext.html')

  extWindow.on('closed', () => {
    extWindow = null
    if (mainWindow) {
      mainWindow.webContents.send('ext-window-status', {
        isOpen: false,
        display: null
      })
    }
  })

  extWindow.webContents.on('did-finish-load', () => {
    if (mainWindow) {
      mainWindow.webContents.send('ext-window-status', {
        isOpen: true,
        display: externalDisplay ? 'external' : 'primary'
      })
    }
  })

  extWindow.setFullScreenable(false)
}

ipcMain.handle('get-displays', async () => {
  const displays = screen.getAllDisplays()
  return displays.map(display => ({
    id: display.id,
    name: display.label || `Display ${display.id}`,
    bounds: display.bounds,
    isPrimary: display.bounds.x === 0 && display.bounds.y === 0
  }))
})

// 확장 화면 상태 확인 - 수정된 버전
ipcMain.handle('get-ext-window-status', () => {
  return {
    isOpen: extWindow !== null,
    display: extWindow ? (
      extWindow.getBounds().x !== 0 || extWindow.getBounds().y !== 0 ? 'external' : 'primary'
    ) : null
  }
})

ipcMain.on('open-ext-window', () => {
  if (!extWindow) {
    createExtWindow()
  }
})

ipcMain.on('close-ext-window', () => {
  if (extWindow) {
    extWindow.close()
    extWindow = null
  }
})

app.whenReady().then(createMainWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow()
  }
})