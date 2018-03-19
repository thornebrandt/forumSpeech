class ForumPopup {
  constructor(){
    console.log('constructin');
    this.speakContentBtn = document.getElementById('speakContent');
    this.info = document.getElementById('info');
    this.interface = document.getElementById('interface');
    this.stopBtn = document.getElementById('stopSpeaking');
    this.speakContentBtn.addEventListener('click', this.speakContentHandler.bind(this));
    this.stopBtn.addEventListener('click', this.stopSpeakingHandler.bind(this));
    chrome.tabs.executeScript({ file: 'forum_speak_content.js', allFrames: false });
    this.addListeners();
  }

  sendMessage(message){
    chrome.tabs.query({currentWindow: true, active: true}, function (tabs){
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, {
          message
        });
    });
  };

  replaceContent(el, content){
    el.innerHTML = content;
  }

  show(el){
    el.style.display = 'block';
  }

  hide(el){
    el.style.display = 'none';
  }

  speakContentHandler(){
    console.log('speak content handler');
    this.sendMessage('speak');
  }

  stopSpeakingHandler(){
    this.sendMessage('stop');
  }

  parseFailHandler(){
    this.replaceContent(this.info, 'Sorry, could not parse this page.');
  }

  commentCountHandler(count){
    this.replaceContent(this.info, 'Found ' + count + ' comments on reddit');
    this.show(this.interface);
  }

  addListeners(){
    if(typeof chrome !== 'undefined'){
      chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
          switch(request.message){
            case "commentCount":
              this.commentCountHandler(request.data);
              break;
            case "parseFail":
              this.parseFailHandler();
              break;
            case "canParse":
              break;
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

