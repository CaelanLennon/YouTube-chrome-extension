console.log("Content script loaded");
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getTimeStamp") {
    const video = document.querySelector("video");
    if (video) {
      sendResponse({ success: true, time: Math.floor(video.currentTime) });
    } else {
      sendResponse({ success: false, error: "No video was found :(" });
    }
  }
});
