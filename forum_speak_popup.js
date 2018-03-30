class ForumPopup {
  constructor(){
    this.speakContentBtn = document.getElementById('speakContent');
    this.infoEl = document.getElementById('info');
    this.interfaceEl = document.getElementById('interface');
    this.commentIndicatorEl = document.getElementById('commentIndicator');
    this.totalCommentsEl = document.getElementById('totalComments');
    this.currentCommentEl = document.getElementById('currentComment');
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
    this.replaceContent(this.infoEl, 'Found ' + count + ' comments on reddit');
    this.replaceContent(this.totalCommentsEl, count);
    this.replaceContent(this.currentCommentEl, 0);
    this.show(this.commentIndicatorEl);
  }

  currentCommentHandler(currentComment){
    this.replaceContent(this.currentCommentEl, currentComment);
  }

  initInterface(speaking){
    if(speaking){
      this.hide(this.speakContentBtn);
      this.show(this.stopBtn);
    } else {
      this.hide(this.stopBtn);
      this.show(this.speakContentBtn);
    }
    this.show(this.interfaceEl);
  }

  addListeners(){
    if(typeof chrome !== 'undefined'){
      chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
          switch(request.message){
            case 'commentCount':
              this.count = request.data.count;
              this.commentCountHandler(this.count);
              break;
            case 'currentComment':
              this.currentComment = request.data.currentComment;
              this.currentCommentHandler(this.currentComment);
              break;
            case 'parseFail':
              this.parseFailHandler();
              break;
            case 'canParse':
              this.initInterface(request.data.speaking);
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

