# Contributing

Thanks for making your way to this file, the more the merrier :)

If you'd like to contribute to the project you should start by
[raising an issue](https://github.com/vot/remotestack-player/issues)
and explaining what you would like to be changed.

Feel free to create pull requests but you should still raise an issue first
to explain the reasoning behind it for the sake of visibility.

If you don't know where to start - this file used to be a roadmap.
Below is the list of things that I have so far planned. It is rather large
(and still growing) so you can pick something from here for yourself.

You should begin with having a look through codebase to try to make some sense
of it - it's currently at prototype quality so expect the implementation of
many things to be rough.

After you've picked something please raise an issue briefly explaining
what it is you'd like to do. You can use an item from the list as issue title
and just start a conversation.
Don't hesitate to ask questions if something's not clear.


# Task list

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
