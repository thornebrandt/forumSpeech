import FSInterface from './FSInterface';
import React from 'react';
import ReactDOM from 'react-dom';
let fs;

export class ForumSpeak {
  constructor(content){
    console.log('constructing forumSpeak class');
    this.rate = 1.4;
    this.voices = [];
    this.speaking = false;
    this.paused = false;
    if(this.canParse(content)){
      this.initialize();
    } else {
      this.parseFailHandler();
    }
  }

  initialize(){
    //move to a local storage handler
    const el = document.getElementById('fs');
    if(!el){
      this.sendMessage('canParse', { speaking: speechSynthesis.speaking });
      this.setupMessageListeners();
      this.currentComment = this.getPositionFromStorage(window.location.href);
      this.initializeVoices(() => {
        this.voices = this.filterVoices(speechSynthesis.getVoices());
        this.authorsObject = this.assignVoicesToAuthors(document.body, this.voices);
        this.contentArray = this.objectifyContent(document.body, this.authorsObject);
        this.addButton(this.contentArray[3].el);
        this.sendMessage('commentCount', {
          count: this.contentArray.length
        });
        this.sendMessage('currentComment', {
          currentComment: this.currentComment
        });
        this.createInterface();
      });
    }
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

  findBody(item){
    const el = this.displaySpeech ? item : item.cloneNode(true);
    const userTextEl = el.querySelector('.usertext-body');
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
          el: comment,
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
        el: {},
        voice: contentArray[0].voice,
        op: true,
        pitch: contentArray[0].pitch
      });
    }
    return contentArray;
  }

  addButton(comment){
    const btn = document.createElement('a');
    btn.innerHTML = 'speak';
    btn.href = '#';
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      this.commentClickHandler();
    });
    comment.appendChild(btn);
  }

  commentClickHandler(){
    this.fsComponent.externalJumpComment(34);
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

  previousComment(){
    this.currentComment--;
    this.speakComments(this.currentComment);
  }

  setupMessageListeners(){
    if( typeof(chrome) !== 'undefined' ) {
      chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
          switch(request.message){
            case "jump":
              this.currentComment = request.data;
              this.stopSpeaking();
              break;
            case "speak":
              this.startSpeaking();
              break;
            case "stop":
              this.stopSpeaking();
              break;
            case "pause":
              this.togglePause();
              break;
            case "testMessage":
              console.log('wtf');
              break;
          }
        }.bind(this)
      );
      window.onbeforeunload = () => {
        this.stopSpeaking();
      }
    }
  }

  savePositionToStorage(urlName, position){
    window.localStorage.setItem('fs:' + urlName, position);
  }

  getPositionFromStorage(urlName){
    const match = window.localStorage.getItem('fs:' + urlName);
    return match ? parseInt(match) : 0;
  }

  createInterface(){
    const styles = {
      display: "block",
      width: "300px",
      height: "200px",
      backgroundColor: "white",
      border: "1px black solid",
      position: "fixed",
      left: "0px",
      top: "0px",
      zIndex: "1000",
    }
    this.fsEl = document.createElement("div");
    Object.assign(this.fsEl.style, styles);
    this.fsEl.id = "fs";
    document.body.appendChild(this.fsEl);
    this.fsComponent = ReactDOM.render(
        <FSInterface
          contentArray={this.contentArray}
          currentComment={this.currentComment}
          rate={this.rate}
        />,
      document.getElementById('fs'),
    );
  }
}

const initContent = () => {
  if(!fs){
    fs = new ForumSpeak(document.body);
  } else {
    console.log('fs.currentComment', fs.currentComment);
  }
};

initContent();
