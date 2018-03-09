export class ForumSpeak {
  constructor(){
    this.rate = 1.4;
    this.voices = [];
    this.speaking = false;
    this.paused = false;
    this.currentComment = 0;
    if(this.canParse(document.body)){
      this.initialize();
    } else {
      this.parseFailHandler();
    }
  }

  initialize(){
    this.setupMessageListeners();
    this.setupKeyboardListeners();
    this.initializeVoices(() => {
      this.voices = this.filterVoices(speechSynthesis.getVoices());
      this.authorsObject = this.assignVoicesToAuthors(document.body, this.voices);
      this.contentArray = this.objectifyContent(document.body, this.authorsObject);
    });
  }

  parseFailHandler(){
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
        utterance.text = entry.comment;
        utterance.pitch = entry.pitch;
        utterance.voice = entry.voice;
        utterance.rate = this.rate;
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

  objectifyContent(el, authors){
    const contentEl = el.getElementsByClassName('entry');
    const content = [...contentEl];
    const contentArray = [];
    content.forEach((comment, i) => {
      console.log('hah', authors);
      const author = this.findAuthor(comment);
      const body = this.findBody(comment);
      contentArray.push({
        author,
        comment: body,
        voice: authors[author].voice,
        op: authors[author].op,
        pitch: authors[author].pitch,
      });
    });
    return contentArray;
  }

  getRandomPitch(){
    return (Math.random() * (0.2 - 1.8) + 1.8).toFixed(4)
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

  utteranceEndHandler(e){
    if(this.speaking){
      this.currentComment++;
    }
  }

  nextComment(){
    currentComment++;
    speakComments(currentComment);
  }

  previousComment(){
    currentComment--;
    speakComments(currentComment);
  }

  startSpeaking(){
    if(this.voices.length && this.contentArray.length){
      this.utterances = this.contentToUtterances(this.contentArray);
    } else {
      console.log("can't parse");
    }
  }

  speakComments(currentComment){
    this.speaking = false;
    speechSynthesis.cancel();
    this.speaking = true;
    if(this.currentComment < 0 || this.currentComment > utterances.length - 1){
      console.log('page complete');
    }
    for(var i = this.currentComment; i < utterances.length; i++){
      this.speakComment(utterances[i]);
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
            case "init":
              console.log('do we need init?');
              break;
          }
        }.bind(this)
      )
    }
  }
}

const initContent = () => {
  const fs = new ForumSpeak();
};

initContent();
