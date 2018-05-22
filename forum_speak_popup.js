class ForumPopup {
  constructor(){
    this.speakContentBtn = document.getElementById('speakContent');
    this.infoEl = document.getElementById('info');
    chrome.tabs.executeScript({ file: 'forum_speak_content.js', allFrames: false });
    this.addListeners();
  }

  sendMessage(message, data = false){
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, {
          message,
          data
        });
    });
  };

  replaceContent(el, content){
    el.innerHTML = content;
  }

  parseFailHandler(){
    this.replaceContent(this.infoEl, 'Sorry, could not parse this page.');
  }

  closeWindow(){
    window.close();
  }

  addListeners(){
    if(typeof chrome !== 'undefined'){
      chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
          switch(request.message){
            case 'parseFail':
              this.parseFailHandler();
              break;
            case 'canParse':
              this.closeWindow();
          }
        }.bind(this)
      );
    }
  }
}

const initPopup = () => {
  const fp = new ForumPopup();
};

document.addEventListener("DOMContentLoaded", initPopup);

