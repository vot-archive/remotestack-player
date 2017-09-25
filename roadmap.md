# Roadmap

## Top TODOs

* Delete cache on exit
* Persist cache on request (on per-track basis)
* Add proper right click interaction
* Multiple playlists + feeds


## Known issues
* Not stopping at the end of the playlist (repeating last track)
* Repeated deletions with icon switch active item
* Format support is limited
* Track caching needs a progress meter + lock
* No autoupdate


## Backlog
* Fetching videos on request
* Remote source search
* UI: Custom range inputs
* UI: Selectable and multi-selectable items in playlist
* UI: Right click menu on selected playlist items
* Renderer: New common adapter to support webaudio and webvideo (Replace Wavesurfer)
* Clean up playlist and file resolutions (not all metadata is needed)
* Loops / mark playable sections
* System tray icon
* Allow custom key mapping
* Change rendering engine (Vue?)
* All UI to be event driven
* Basic Support for video
* Optimised caching system
* Caching options (persistence, limits)
* Exporting playlists
* Custom front-end components (waveform, custom sliders, good right click support/gestures)
* Evaluate alternative playback engines (ffplay? ffserver?)
* Support for auto-updating channels/feeds
* Remote streaming
* Controlling remote instances of player


## 0.1.0 goals
* ~Implementation cleanup~
* ~Caching defaulting to audio format~
* ~Interface windows separated~
* Reading ID3
