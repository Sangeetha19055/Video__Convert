const ipc = require("electron").ipcRenderer;
const buttonCreated = document.getElementById("upload");
const process = require("child_process");
const $ = require("jquery");
const path = require("path");
var randomString = require("random-string");
const fs = require("fs");

var format = "mp3";

var dir = "./media";

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

buttonCreated.addEventListener("click", function (event) {
  format = $("#format option:selected").text();
  ipc.send("open-file-dialog-for-file");
});

$("#format").change(function () {
  format = $("#format option:selected").text();
});

ipc.on("selected-file", function (event, paths) {
  console.log(event);
  var randomId = randomString();
  $("#info").append(`
        <div id=${randomId} class="alert alert-success">
          ${paths} is converting So Please Wait
         </div>
    `);
  console.log("Full path: ", paths);

  process.exec(
    `ffmpeg -i "${paths}" media/${randomString()}_video.${format}`,
    function (error, stdout, stderr) {
      console.log("stdout: " + stdout);
      $(`#${randomId}`).detach();
      Notification.requestPermission().then(function (result) {
        var myNotification = new Notification("Conversion Completed", {
          body: "Your file was successfully converted",
        });
      });
      if (error !== null) {
        console.log("exec error: " + error);
      }
    }
  );
});

// Open the DevTools.

if (isDev) {
  require('electron-reload')(__dirname, {
    electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
  });
}

ipcMain.on('notify', (_, message) => {
  new Notification({ title: 'Notification', body: message }).show();
});

ipcMain.on('file-path', (_) => {
  openFile();
});

ipcMain.on('select-directory', (_) => {
  changeDirectory();
});

ipcMain.handle('get-directory', async (event, argument) => {
  let res = await readDirectory(outputDirPath);
  let response = {
    outputDirPath,
    res,
  };
  return response;
});

function readDirectory(url) {
  let dirFiles = [];
  console.log('Reading Directory');
  fs.readdirSync(url).forEach((file) => {
    console.log(file);
    dirFiles.push(file);
  });
  console.log('returning');
  return dirFiles;
}

function changeDirectory() {
  const directoryDialog = dialog
    .showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
    })
    .then((result) => {
      console.log('Directory Path', result.filePaths[0]);
      console.log('File', filename);
      let directoryPath = result.filePaths[0];
      let filePath = filename;

      // Create a output directory
      var outputDir = `${directoryPath}/output/`;
      outputDirPath = outputDir;
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
        console.log('Created Folder');
      }

      console.log('Final Filename: ', filename);
      console.log('Final Output Directory: ', outputDir);

      // Setting output path
      fpPath = outputDir;

      convert360p(filename, outputDir);
      convert480p(filename, outputDir);
      convert720p(filename, outputDir);
    })
    .catch((error) => {
      console.log('File Error', error);
    });
}

// Code
// Select the file to convert
function openFile() {
  const file = dialog
    .showOpenDialog(mainWindow, {
      properties: ['openFile', 'openDirectory'],
      filters: [{ name: 'Movies', extensions: ['mp4'] }],
    })
    .then(async (result) => {
      if (result.canceled) {
        new Notification({
          title: 'Notification',
          body: 'Please select a File to Convert',
        }).show();
        return;
      }
      filename = result.filePaths[0];
      console.log('Selected File', filename);
    })
    .catch((error) => {
      console.log('File Error', error);
    });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {

    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
