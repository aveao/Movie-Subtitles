import React, { useState, useEffect, useRef } from 'react';
import { render } from 'react-dom';
import Subtitles from './subtitles/Subtitles';
import PopupWrapper from './PopupWrapper';
import { styled } from '@material-ui/core/styles';

const BlurredBackground = styled('div')({
  position: 'absolute',
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  userSelect: 'none',
  backdropFilter: 'blur(10px)',
  zIndex: 2147483647,
});

export default function Content({ video, iconWrapper }) {
  const subsEnabledRef = useRef(true);
  const [subsEnabled, setSubsEnabled] = useState(subsEnabledRef.current);
  const speedRef = useRef(0);
  const [speedDisplay, setSpeedDisplay] = useState(false);
  const [menu, setMenu] = useState(false);
  const netflix = window.location.hostname === 'www.netflix.com';
  const editRef = useRef(false);

  // Close the in-video popup menu when the real popup is opened
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.activation) {
      setMenu(false);
    }
  });

  // Listen for shortcut keypress events
  useEffect(() => {
    // Display the icon
    if (iconWrapper) {
      render(
        <img
          onClick={() => setMenu(true)}
          src={chrome.runtime.getURL('movie-subtitles-24.png')}
          alt="Logo"
        />,
        iconWrapper
      );
    }

    // Shortcuts
    document.addEventListener(
      'keydown',
      function (event) {
        const focusedElement = event.target.nodeName;
        const elementId = event.target.id;
        const gt_source_language = "auto";
        const deepl_source_language = "de";
        const translation_target_language = "en";

        if (focusedElement !== 'INPUT' && elementId !== 'contenteditable-root') {
          // Disabling shortcuts when user is typing in search box or writing comments on YouTube
          const key = event.key.toLowerCase();

          if (key === 'c') {
            if (editRef.current) {
              // The execCommand is deprecated though the copy functionality is still supported by all major web browsers!
              document.execCommand('copy');
            } else {
              // Making sure only to toggle subtitles when not in editMode. In edit mode we copy the subtitles instead of toggling them.
              subsEnabledRef.current = !subsEnabledRef.current;
              setSubsEnabled(subsEnabledRef.current);
            }
            event.preventDefault();
            event.stopPropagation();
          } else if (key === 'z' && !netflix) {
            // Rewind 2.5 Seconds
            video.currentTime = video.currentTime - 2.5;
            event.preventDefault();
            event.stopPropagation();
          } else if (key === 'x' && !netflix) {
            // Fast-Forward 2.5 Seconds
            video.currentTime = video.currentTime + 2.5;
            event.preventDefault();
            event.stopPropagation();
          } else if (key === 'ArrowLeft' && !netflix) {
            // Rewind 5 Seconds
            video.currentTime = video.currentTime - 5;
            event.preventDefault();
            event.stopPropagation();
          } else if (key === 'ArrowRight' && !netflix) {
            // Fast-Forward 5 Seconds
            video.currentTime = video.currentTime + 5;
            event.preventDefault();
            event.stopPropagation();
          } else if (key === 'a' && !netflix) {
            // Previous Sentence
            document.getElementById('movie-subtitles-prev-button').click();
            event.preventDefault();
            event.stopPropagation();
          } else if (key === 's' && !netflix) {
            // Next Sentence
            document.getElementById('movie-subtitles-next-button').click();
            event.preventDefault();
            event.stopPropagation();
          } else if (key === 'q') {
            // Decrease Playback Speed
            video.playbackRate = Number((video.playbackRate - 0.25).toFixed(2));
            setSpeedDisplay(video.playbackRate);
            speedRef.current++;
            setTimeout(() => {
              speedRef.current--;
              if (!speedRef.current) setSpeedDisplay(false);
            }, 2000);
            event.preventDefault();
            event.stopPropagation();
          } else if (key === 'w') {
            // Increase Playback Speed
            video.playbackRate = Number((video.playbackRate + 0.25).toFixed(2));
            setSpeedDisplay(video.playbackRate);
            speedRef.current++;
            setTimeout(() => {
              speedRef.current--;
              if (!speedRef.current) setSpeedDisplay(false);
            }, 2000);
            event.preventDefault();
            event.stopPropagation();
          } else if (key === 'g') {
            // Sync subtitles (display them 1 second earlier)
            const syncNow = new CustomEvent('syncNow', { detail: { syncValue: 1, syncLater: false } });
            document.dispatchEvent(syncNow);
            event.preventDefault();
            event.stopPropagation();
          } else if (key === 'h') {
            // Sync subtitles (display them 1 second later)
            const syncNow = new CustomEvent('syncNow', { detail: { syncValue: 1, syncLater: true } });
            document.dispatchEvent(syncNow);
            event.preventDefault();
            event.stopPropagation();
          } else if (key === 'u') {
            // Open subtitle text in Google Translate
            let subtitleText = document.getElementById("movie-subtitles-text-area").innerText.replaceAll("\n", " ").trim();
            if (subtitleText) {
                let url = ("https://translate.google.com/?sl=" + gt_source_language +
                           "&tl=" + translation_target_language +
                           "&text=" + encodeURIComponent(subtitleText) + "&op=translate");
                window.open(url, "_blank");
            }
            event.preventDefault();
            event.stopPropagation();
          } else if (key === 'i') {
            // Open subtitle text in DeepL
            let subtitleText = document.getElementById("movie-subtitles-text-area").innerText.replaceAll("\n", " ").trim();
            if (subtitleText) {
                let url = ("https://www.deepl.com/" + translation_target_language + "/translator#" +
                           deepl_source_language + "/" + translation_target_language + "/" +
                           encodeURIComponent(subtitleText));
                window.open(url, "_blank");
            }
            event.preventDefault();
            event.stopPropagation();
          }
        }
      },
      true
    );
    // eslint-disable-next-line
  }, []);

  return (
    <>
      {menu && <BlurredBackground onClick={() => setMenu(false)} />}
        <Subtitles
          video={video}
          subsEnabled={subsEnabled}
          speedDisplay={speedDisplay}
          netflix={netflix}
          editRef={editRef}
        />
      <PopupWrapper
        popup={false}
        setMenu={setMenu}
        display={menu ? 'block' : 'none'}
      />
    </>
  );
}
