var app = require("electron").app;
var ipc = require("electron").ipcMain;

const os = require("os");
var { dialog } = require("electron");

var BrowserWindow = require("electron").BrowserWindow;

var mainWindow = null;

app.on("ready", function () {
  mainWindow = new BrowserWindow({
    resizable: true,
    height: 600,
    width: 800,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  mainWindow.loadURL("file://" + __dirname + "/homePage.html");

  mainWindow.on("closed", function () {
    mainWindow = null;
  });
});

ipc.on("open-file-dialog-for-file", function (event) {
  console.log("button pressed");

  if (os.platform() === "linux" || os.platform() === "win32") {
    dialog
      .showOpenDialog(null, {
        properties: ["openFile"],
      })
      .then((result) => {
        console.log(result.filePaths); //filePaths is array
        event.sender.send("selected-file", result.filePaths[0]);
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    dialog
      .showOpenDialog(null, {
        properties: ["openFile", "multiSelections"],
      })
      .then((result) => {
        console.log(result.filePaths); //filePaths is array
        event.sender.send("selected-file", result.filePaths[0]);
      })
      .catch((err) => {
        console.log(err);
      });
  }
});
