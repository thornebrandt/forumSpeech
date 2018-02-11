const sendMessage = (message) => {
  chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
      var activeTab = tabs[0];
      chrome.tabs.sendMessage(activeTab.id, {
        message
      });
  });
};

const speakContentHandler = () => {
  sendMessage('speak');
};

const stopSpeakingHandler = () => {
  sendMessage('stop');
};

const initContent = () => {
  const speakContentBtn = document.getElementById('speakContent');
  const stopBtn = document.getElementById('stopSpeaking');
  speakContentBtn.addEventListener('click', speakContentHandler);
  stopBtn.addEventListener('click', stopSpeakingHandler);
  chrome.tabs.executeScript({ file: 'forumspeak_content.js', allFrames: false }, (e) => {
    sendMessage('init');
  });
};

document.addEventListener("DOMContentLoaded", initContent);

