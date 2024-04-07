"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const serialport_1 = require("serialport");
const electron_1 = require("electron");
const path = require("path");
var mainWindow;
function createWindow() {
    // Create the browser window.
    mainWindow = new electron_1.BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });
    // and load the index.html of the app.
    mainWindow.loadFile(path.join(__dirname, "public", "index.html"));
    // Open the DevTools.
    mainWindow.webContents.openDevTools();
}
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
electron_1.app.whenReady().then(() => {
    createWindow();
    electron_1.app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (electron_1.BrowserWindow.getAllWindows().length === 0)
            createWindow();
    });
});
// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
electron_1.app.on('window-all-closed', function () {
    if (process.platform !== 'darwin')
        electron_1.app.quit();
});
electron_1.ipcMain.on("list", (ev, ...data) => {
    serialport_1.SerialPort.list().then((ports) => {
        var portsOut = [];
        ports.forEach((port) => {
            if (!port.pnpId.startsWith("USB"))
                return;
            //console.log({
            //	locationId: port.locationId,
            //	manufacturer: port.manufacturer,
            //	path: port.path,
            //	pnpId: port.pnpId,
            //	productId: port.productId,
            //	serialNumber: port.serialNumber,
            //	vendorId: port.vendorId
            //});
            portsOut.push(port);
        });
        mainWindow.webContents.send("list", JSON.stringify({ error: false, data: portsOut }));
    }).catch(e => {
        console.trace(e);
        mainWindow.webContents.send("list", JSON.stringify({ error: true, data: e }));
    });
});
var activeSp;
electron_1.ipcMain.on("connect", (ev, ...data) => {
    if (activeSp)
        return;
    var sp = new serialport_1.SerialPort({ baudRate: 115200, path: data[0] });
    [
        "open",
        "close",
        "data",
        "drain",
        "end",
        "error",
        "finish",
        "pause",
        "pipe",
        "readable",
        "resume",
        "unpipe"
    ].forEach((e) => {
        sp.on(e, (d) => {
            mainWindow.webContents.send(`port${e}`, d);
            console.log("event data:", d);
        });
    });
    activeSp = sp;
});
electron_1.ipcMain.on("disconnect", (ev, ...data) => {
    if (!activeSp)
        return;
    activeSp.close();
    activeSp = null;
});
