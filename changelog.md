# Changelog

## 0.1.1

* Fixed bug where last item on the list would never stop playing (last song repeat)
* Removed log rotation (now it's just one log files for app's last lifecycle only)
* Added developer mode as a setting
* Improved window management
* Added Circle CI and Code Climate integrations
* Stricter linter profile
* Updated dependencies



## 0.1.0 - First open release

* Licensed under GPL
* Removed a lot of unused code
* Simplified templating system
* Consolidated code in one repository
* Switched to remote resolver for higher reliability
* Stopped fetching redundant video data - just audio
* Split interface into multiple windows
* Applying settings without restarting app



## 0.0.28

* Updated height-bound responsiveness



## 0.0.27

* Updated URL updating, nav strip
* Small UI fixes



## 0.0.26

* Sortable playlist



## 0.0.25

* Defaults for window controls to fix missing buttons
* Added new version notifications
* Layering fix



## 0.0.24

* Preferences for window controls



## 0.0.23

* Improved messaging
* Storing Repeat and Shuffle as preferences
* Extra key binds



## 0.0.22

* Repeat and Shuffle



## 0.0.21

* More UI tweaks
* Improved templating, binds and layer separation



## 0.0.20

* No new features
* Code structure and modularity improvements
* Small bug fixes



## 0.0.19

* UI updates: fixed layering for Linux/Windows
* Navigation code updates
* Help page update - visual + showing version number



## 0.0.18

* UI updates: added window controls, removed footer



## 0.0.17

* Various UI updates



## 0.0.16

* Some UI tweaks
* Sorted out debug mode
* Fixed dragging files onto player
* Detaching all events on populatePlaylist calls



## 0.0.15

* Plenty of visual tweaks
* Fixed data paths for Linux
* Improved settings handling



## 0.0.14

* Few small optimisations (hopefully)
* Simplified structure and navigation
* Fixed player-playlist integration



## 0.0.13

* Commented out events from base JSON model to troubleshoot
* New icon



## 0.0.12

* Replaced electron-settings with custom BaseModelJSON to allow multi-file storage
* Updated userData storage location, now logs and cache are stored there as well



## 0.0.11

* Only header is now draggable rather than the whole window (fix for Linux & Windows)



## 0.0.10

* Refreshing playlist on change (fixes playlist update on deletion)



## 0.0.9

* Support for adding folders
* Double-click to play
* Track titles displayed consistently in a single line
* More error logging



## 0.0.8

* Fix for a local source playback
* Confirmation after adding a track



## 0.0.7

* Track names are picked up correctly from online sources



## 0.0.6

* Fixed volume control lockups
* New icon



## 0.0.5

* Highlighting active navigation item
* Reworked templating model for consistency



## 0.0.4

* Added bindings for window close and minimise



## 0.0.3

* Fixed a bug where copy/paste keys wouldn't work



## 0.0.2

Initial alpha release.
* Audio playback
* Support for local and remote files
* Playlist
* Tabs in playlist
* All screens mocked up and in place
* Keyboard shortcuts



## 0.0.1

Initial version. Long-running version number for a pre-release development.
