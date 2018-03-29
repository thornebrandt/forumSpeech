export class ForumSpeak {
  constructor(content){
    this.rate = 1.4;
    this.voices = [];
    this.speaking = false;
    this.paused = false;
    this.currentComment = 0;
    if(this.canParse(content)){
      this.initialize();
    } else {
      this.parseFailHandler();
    }
  }

  initialize(){
    this.sendMessage('canParse');
    this.setupMessageListeners();
    this.setupKeyboardListeners();
    this.initializeVoices(() => {
      this.voices = this.filterVoices(speechSynthesis.getVoices());
      this.authorsObject = this.assignVoicesToAuthors(document.body, this.voices);
      this.contentArray = this.objectifyContent(document.body, this.authorsObject);
      this.sendMessage('commentCount', this.contentArray.length);
    });
  }

  sendMessage(message, data){
    if( typeof(chrome) !== 'undefined' ) {
      chrome.runtime.sendMessage({
        message,
        data
      });
    }
  }

  parseFailHandler(){
    this.sendMessage('parseFail');
    //send message back to popup to clear interface.
  }

  initializeVoices(voicesLoadedCallback){
    speechSynthesis.onvoiceschanged = voicesLoadedCallback;
    if(speechSynthesis.getVoices().length){
      voicesLoadedCallback();
    }
  };

  parseLinks(body){
    const reg = /<a[\s\S]*?>\n?([\s\S]*?)\n?<\/a>/g;
    return body.replace(reg, '$1, link posted,');
  }

  parseQuotes(body){
    const reg = /<blockquote[\s\S]*?>\n?([\s\S]*?)\n?<\/blockquote>/g;
    return body.replace(reg, 'quote!, $1, unquote!,');
  }

  parseSpeech(body){
    let parsed_body = this.parseLinks(body);
    return this.parseQuotes(parsed_body);
  }

  filterVoices(voices){
    return voices.filter((voice) => (
      voice.lang === 'en-US' && voice.localService));
  };

  contentToUtterances(contentArray, utterances = []){
    if(!utterances.length) {
      contentArray.forEach((entry, i) => {
        const utterance = new window.SpeechSynthesisUtterance();
        utterance.text = ' , ' + entry.comment + ' , ';
        utterance.pitch = entry.pitch;
        utterance.voice = entry.voice;
        utterance.rate = this.rate;
        utterance.onend = this.utteranceEndHandler.bind(this);
        utterances.push(utterance);
      });
      return utterances;
    }
  };

  findBody(item){
    const userTextEl = item.querySelector('.usertext-body');
    let body = '';
    if(userTextEl) {
      userTextEl.innerHTML = this.parseSpeech(userTextEl.innerHTML);
      body = userTextEl.textContent.trim();
    }
    return body;
  }

  findAuthor(item, i){
    const authorEl = item.querySelector('.author');
    if(authorEl){
      let author = authorEl.textContent.trim();
      return author;
    }
    return false;
  }

  assignVoicesToAuthors(el, voices){
    const contentEl = el.getElementsByClassName('entry');
    const content = [...contentEl];
    const authorObject = {};
    content.forEach((item, i) => {
      const author = this.findAuthor(item, i);
      authorObject[author] = authorObject[author] || {
        voice: voices[i % voices.length],
        op: i === 0,
        pitch: this.getRandomPitch(),
      }
    });
    return authorObject;
  }

  canParse(el){
    const contentEl = el.getElementsByClassName('entry');
    return contentEl.length > 0;
  }

  hasTitle(el){
    const titleEl = el.querySelectorAll('a.title');
    return titleEl.length > 0;
  }

  findTitle(el){
    return el.querySelectorAll('a.title')[0].textContent.trim();
  }

  objectifyContent(el, authors){
    const contentEl = el.getElementsByClassName('entry');
    const content = [...contentEl];
    const contentArray = [];
    content.forEach((comment, i) => {
      const author = this.findAuthor(comment);
      const body = this.findBody(comment);
      if(author){
        contentArray.push({
          author,
          comment: body,
          voice: authors[author].voice,
          op: authors[author].op,
          pitch: authors[author].pitch,
        });
      }
    });
    if(this.hasTitle(el)){
      const title = this.findTitle(el);
      contentArray.unshift({
        author: contentArray[0].author,
        comment: title,
        voice: contentArray[0].voice,
        op: true,
        pitch: contentArray[0].pitch
      });
    }
    return contentArray;
  }

  getRandomPitch(){
    return (Math.random() * (0.3 - 1.7) + 1.7).toFixed(4)
  }

  togglePause(){
    if(this.paused){
      speechSynthesis.resume();
      this.paused = false;
      this.speaking = true;
    } else {
      speechSynthesis.pause();
      this.paused = true;
      this.speaking = false;
    }
  }

  stopSpeaking(){
    speechSynthesis.pause();
    this.paused = true;
    this.speaking = false;
  }

  utteranceEndHandler(e, dude){
    if(this.speaking){
      this.currentComment++;
      this.sendMessage('currentComment', this.currentComment);
    }
  }

  nextComment(){
    this.currentComment++;
    this.speakComments(this.currentComment);
  }

  previousComment(){
    this.currentComment--;
    this.speakComments(this.currentComment);
  }

  startSpeaking(){
    if(this.voices.length && this.contentArray.length){
      this.utterances = this.contentToUtterances(this.contentArray);
      this.speakComments(this.currentComment);
    } else {
      console.log("can't parse");
    }
  }

  speakComments(currentComment){
    this.speaking = false;
    speechSynthesis.cancel();
    this.speaking = true;
    if(this.currentComment < 0 || this.currentComment > this.utterances.length - 1){
      console.log('stop handler');
    } else {
      for(var i = this.currentComment; i < this.utterances.length; i++){
        this.speakComment(this.utterances[i]);
      }
    }
  }

  speakComment(utterance){
    speechSynthesis.speak(utterance);
  }

  setupKeyboardListeners(){
    document.onkeydown = function(evt) {
      switch(evt.code){
        case "Space":
          this.togglePause();
          break;
        case "ArrowRight":
          if(this.speaking){
            this.nextComment();
          };
        case "ArrowLeft":
          if(this.speaking){
            this.previousComment();
          };
        default:
          //console.log(evt.code);
          break;
      }
    }.bind(this);
  }

  setupMessageListeners(){
    if( typeof(chrome) !== 'undefined' ) {
      chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
          switch(request.message){
            case "speak":
              this.startSpeaking();
              break;
            case "stop":
              this.stopSpeaking();
              break;
            case "pause":
              this.togglePause();
              break;
          }
        }.bind(this)
      )
    }
  }

  savePosition(pathName, position){
    window.localStorage.setItem('forumSpeak.' + pathName, position);
  }

  getPosition(pathName){
    return parseInt(window.localStorage.getItem('forumSpeak.' + pathName));
  }
}

const initContent = () => {
  const fs = new ForumSpeak(document.body);
};

initContent();
