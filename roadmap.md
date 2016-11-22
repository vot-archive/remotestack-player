# Roadmap

## Next features
* Multiple playlists + feeds
* UI: Improve adding of URLs (modal)
* Data flow: Default remote sources to audio formats; video on request
* UI: Custom range inputs
* UI: Selectable and multi-selectable items in playlist
* UI: Right click menu on selected playlist items
* Renderer: New common adapter to support webaudio and webvideo
* Clean up playlist and resolutions (not all metadata is needed)
* All UI to be data tag + event driven


## Known issues
* Not stopping at the end of the playlist (repeating last track)
* Video stream not displayed
* Repeated deletions with icon switch active item
* Format support is limited
* Track caching needs a progress meter + lock
* No autoupdate


## Planned milestones

### 0.1.0
Well functioning audio player
Optimised caching system - max diskspace usage, max 1 month cache
Caching defaulting to audio format
ID3 reading


### 0.2.0
Support for video + maybe transcoding (ffmpeg?)


### 0.3.0
Refactor - implementation cleanup


### 0.4.0
Experimental playback engines (ffplay and/or ffserver?)


### 0.5.0
Front-end components (waveform, custom sliders, good right click support/gestures)
Caching options (persistence, limits, etc)


### 0.6.0
Public beta release - bug fixes, etc


### 1.0.0
Multiformat + multisource player
Support for auto-updating channels/feeds
Effective caching system
Completely consistent UI across platforms
Controlling remote instances of player
Reasonable resource consumption
