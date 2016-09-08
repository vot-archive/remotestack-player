const electron = require('electron');
const Menu = electron.Menu;
const app = electron.app;

function intialise() {
  var template = [
    {
      label: "RemoteStack",
      submenu: [
          { label: "About Application", selector: "orderFrontStandardAboutPanel:" },
          // { label: 'Preferences', click: function () {
          //     ipc.send('open-settings-window')
          //   }
          // },
          { type: "separator" },
          { label: "Quit", accelerator: "Command+Q", click: function() { app.quit(); }}
      ]
    },
    {
      label: "Edit",
      submenu: [
          { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
          { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
          { type: "separator" },
          { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
          { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
          { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
          { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
};

module.exports.intialise = intialise;

// http://electron.atom.io/docs/api/menu/
