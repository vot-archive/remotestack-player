# Roadmap

## Top TODOs

* Move "Settings" to its own window
* Move "Help" to its own window
* Move "Add" to its own window (+ expose from tray/app icon)
* Add proper right click interaction
* Delete cache on exit
* Persist cache on request (on per-track basis)
* Multiple playlists + feeds


## Backlog
* Allow custom key mapping
* UI: Improve adding of URLs (modal)
* Data flow: Default remote sources to audio formats; video on request
* UI: Custom range inputs
* UI: Selectable and multi-selectable items in playlist
* UI: Right click menu on selected playlist items
* Renderer: New common adapter to support webaudio and webvideo (Replace Wavesurfer)
* Clean up playlist and resolutions (not all metadata is needed)
* All UI to be data tag + event driven



## Known issues
* Not stopping at the end of the playlist (repeating last track)
* Repeated deletions with icon switch active item
* Format support is limited
* Track caching needs a progress meter + lock
* No autoupdate


## Planned milestones

### 0.1.0
* Implementation cleanup
* Caching defaulting to audio format
* Optimised caching system
* Reading ID3


### 0.2.0
* Well functioning audio player (no major known bugs)
* New rendering engine for UI (perhaps Vue)


### 0.3.0
* Basic Support for video
* Caching options (persistence, limits)
* Exporting playlists


### 0.4.0
* Custom front-end components (waveform, custom sliders, good right click support/gestures)


### 0.5.0
* Experimental playback engines (ffplay? ffserver?)


### 1.0.0
* Multiformat + multisource player
* Support for auto-updating channels/feeds
* Effective caching system
* Completely consistent UI across platforms
* Remote streaming
* Controlling remote instances of player
* Lowered resource consumption
