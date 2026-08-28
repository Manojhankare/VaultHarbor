chrome.runtime.onMessage.addListener((message: { target?: string; type?: string; text?: string }) => {
  if (message.target !== "offscreen") return;
  const textarea = document.getElementById("clipboard-target") as HTMLTextAreaElement;
  if (!textarea) return;

  if (message.type === "COPY" && message.text) {
    textarea.value = message.text;
    textarea.select();
    document.execCommand("copy");
    textarea.value = "";
  } else if (message.type === "CLEAR") {
    textarea.value = " ";
    textarea.select();
    document.execCommand("copy");
    textarea.value = "";
  }
});
