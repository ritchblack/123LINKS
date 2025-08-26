"use strict";

// With background scripts you can communicate with popup
// and contentScript files.
// For more information on background script,
// See https://developer.chrome.com/extensions/background_pages

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "GREETINGS") {
    const message = `Hi Pan, my name is Bac. I am from Background. It's great to hear from you.`;

    // Log message coming from the `request` parameter
    console.log(request.payload.message);
    // Send a response message
    sendResponse({
      message,
    });
  }
});
chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
  chrome.contextMenus.create({
    id: "addTo123Links",
    title: "Send to 123Links",
    type: "normal",
    contexts: ["selection", "link", "page"],
  });
});
chrome.contextMenus.onClicked.addListener((item, tab) => {
  const tld = item.menuItemId;
  if (tld === "addTo123Links") {
    chrome.runtime.sendMessage(item, (response) => {
      console.log("Response from background:", response);
    });
  }
});
