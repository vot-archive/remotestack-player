const electron = require('electron');
const Menu = electron.menu;

function intialise() {

  var menu = Menu.buildFromTemplate([
    {
      label: 'RemoteStack',
      submenu: [
        {
          label: 'Prefs',
          click: function () {
            ipc.send('open-settings-window')
          }
        }
      ]
    }
  ]);

  Menu.setApplicationMenu(menu);
};

module.exports = {
  intialise: intialise
}

// http://electron.atom.io/docs/api/menu/
