# Making lectures smoother: speed fixes, focus lock, and battery saver

Published on September 19, 2026 · Updates v1.0.8.3 & v1.0.8.4

When you study for hours every day, small glitches get in your way. A laggy slider or a freezing tab breaks your study groove.

Over the past two weeks, students shared honest feedback and opened issues on our GitHub repository. We listened to those complaints, fixed the annoying bugs, and made playback much lighter on older laptops.

---

## Fixing the speed slider and lag

A student named Pranshu pointed out an annoying problem with our speed control. When you held down the mouse button to drag the slider, the video player thought you wanted 2x fast-forward. The slider also stuttered and lagged while moving.

We reworked the speed slider to fix both issues:

* **Wider slider bar:** We made the speed slider wider (200 pixels) so it is easy to grab with your mouse without misclicking.
* **No more stutter:** The slider no longer calculates heavy math while you drag. It updates smoothly and only saves when you let go of your mouse.
* **Direct speed typing:** A student contributor named Mayank Mahaur added a new way to pick your speed. You can now click right on the speed number (like 1.0x) and type exact numbers like 1.25x or 1.75x.

---

## Focus lock and the missing buttons bug

Another student contributor named Parth built Focus Lock mode to help you stay in the zone.

With one click, Focus Lock puts your lecture into full screen. If you get distracted and leave full screen, your video pauses right away so you never miss what the teacher is explaining.

In our first release of this feature, we ran into a frustrating bug. Turning on the option to hide the video timer accidentally hid the play, settings, and full screen buttons.

We fixed that issue. Focus Lock now keeps things simple by handling full screen and pausing on exit. If you want to hide live chat, student doubts, or notes, you can turn those off one by one using the normal switches.

---

## No more website freezes on budget laptops

Some students told us that the extension made Physics Wallah lag or crash on older computers. That was our fault, and we tracked down why it happened.

The extension was scanning the web page multiple times every second to find the video player controls. On top of that, live classes with thousands of floating reaction emojis forced the extension to do extra work.

We cleaned up how the extension watches the page:

* It now finds the video player controls once and remembers them.
* It ignores live class emoji animations so your computer does not waste power.
* The video player now runs smoothly without freezing your web browser.

---

## Battery saver for skip silence

Skip Silence automatically cuts out quiet gaps when a teacher pauses or writes on the board.

Listening to audio in real time takes extra battery power. If you are studying on a laptop without a charger nearby, your battery drains faster and the fans can get loud.

We added a new "Low CPU / Battery Saver" switch inside the Skip Silence settings tab. Turning it on cuts the audio workload in half so your laptop runs cooler and your battery lasts longer.

---

### Special thanks

Enhancer for Physics Wallah is an open-source tool made for students, by students. Special thanks to **Mayank Mahaur** for direct speed typing and **Parth** for Focus Lock.

Have ideas or questions? Drop an issue on our GitHub or leave a review on the Chrome Web Store!
