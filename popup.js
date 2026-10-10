const noteInput = document.getElementById("ta-noteInput");
const btnSave = document.getElementById("btn-Save");
const errorMessage = document.getElementById("p-errorMessage");

function timeFormat(time) {
  return Math.floor(time / 60) + ":" + ("0" + Math.floor(time % 60)).slice(-2);
}

function buildNoteObject(time, noteText) {
  return {
    id: Date.now(),
    time: time,
    noteText: noteText,
  };
}

btnSave.addEventListener("click", async () => {
  const refinedInput = noteInput.value.trim();
  if (refinedInput.length === 0) {
    errorMessage.textContent = "Please enter a note before saving.";
    noteInput.focus();
    return;
  }
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true }); //gets active tab that i am looking at and the one that the pop is open in
    const response = await chrome.tabs.sendMessage(tab.id, { action: "getTimeStamp" });
    if (!response.success) {
      errorMessage.textContent = "Error: " + response.error;
      return;
    }
    const formattedTime = timeFormat(response.time);
    const videoID = new URL(tab.url).searchParams.get("v"); //this is how i get the video id from the url of the the current tab which i got earlier
    if (!videoID) {
      //no key was found for saving so im returning an error message so i dont get a bunch of "null" as keys
      errorMessage.textContent = "Error: no valid videoID found for this video.";
      return;
    }

    const noteObject = buildNoteObject(response.time, refinedInput);

    //checking if the current vid already has note and storing the note in chrome storage
    const stored = await chrome.storage.local.get(videoID);
    const existingNotes = stored[videoID] || [];
    existingNotes.push(noteObject);
    await chrome.storage.local.set({ [videoID]: existingNotes });
    console.log("saved note for videoID:", videoID, "Note: ", noteObject);

    noteInput.value = "";
    errorMessage.textContent = "";
    errorMessage.style.color = "green";
    errorMessage.textContent = "Note saved successfully!";
    console.log("Response from content script:", response, "Note: ", refinedInput, "TimeStamp: ", formattedTime);
  } catch (error) {
    console.error("There was an issue reaching the content script:", error);
  }
});
