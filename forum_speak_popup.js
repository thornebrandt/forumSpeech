class ForumPopup {
  constructor(){
    this.speakContentBtn = document.getElementById('speakContent');
    this.info = document.getElementById('info');
    this.interface = document.getElementById('interface');
    this.commentIndicator = document.getElementById('commentIndicator');
    this.totalComments = document.getElementById('totalComments');
    this.currentComment = document.getElementById('currentComment');
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
    console.log('hidded', el);
  }

  speakContentHandler(){
    this.hide(this.speakContentBtn);
    this.show(this.stopBtn);
    this.sendMessage('speak');
  }

  stopSpeakingHandler(){
    this.hide(this.stopBtn);
    this.show(this.speakContentBtn);
    this.sendMessage('stop');
  }

  parseFailHandler(){
    this.replaceContent(this.info, 'Sorry, could not parse this page.');
  }

  commentCountHandler(count){
    this.replaceContent(this.info, 'Found ' + count + ' comments on reddit');
    this.replaceContent(this.totalComments, count);
    this.replaceContent(this.currentComment, 0);
    this.show(this.interface);
    this.hide(this.stopBtn);
    this.show(this.commentIndicator);
  }

  addListeners(){
    if(typeof chrome !== 'undefined'){
      chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
          switch(request.message){
            case "commentCount":
              this.count = request.data;
              this.commentCountHandler(this.count);
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

