export const returnTrue = () => {
  return true;
}

export class ForumSpeak {
  init(){
    return true;
  }

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

  findBody(item){
    const userTextEl = item.querySelector('.usertext-body');
    let body = '';
    if(userTextEl) {
      userTextEl.innerHTML = this.parseSpeech(userTextEl.innerHTML);
      body = userTextEl.textContent.trim();
    }
    return body;
  }

}

export const initContent = () => {
  const fs = new ForumSpeak();

  let speaking = false;
  let paused = false;
  let canParse = true;
  let currentComment = 0;
  let voices;
  const entries = document.getElementsByClassName("entry");
  const posts = [];
  const utterances = [];

  const returnTrue = () => {
    return true;
  }

  const parseLinks = (body) => {
    const reg = /<a[\s\S]*?>\n?([\s\S]*?)\n?<\/a>/g;
    return body.replace(reg, '$1, link posted,');
  }

  const parseQuotes = (body) => {
    const reg = /<blockquote[\s\S]*?>\n?([\s\S]*?)\n?<\/blockquote>/g;
    return body.replace(reg, 'quote!, $1, unquote!,');
  }

  const parseSpeech = (body) => {
    let parsed_body = parseLinks(body);
    return parseQuotes(parsed_body);
  }

  const findAuthor = (item, i) => {
    const authorEl = item.querySelector('.author');
    if(authorEl){
      let author = authorEl.textContent;
      const OP = item.querySelector('.submitter');
      if( OP ){
        if ( i === 0 ) {
          const OP = author;
          author = "The original poster, " + OP;
        } else {
          author = "OP";
        }
      }
      return author;
    }
    return false;
  }

  const togglePause = () => {
    if(paused){
      speechSynthesis.resume();
      paused = false;
      speaking = true;
    } else {
      speechSynthesis.pause();
      paused = true;
      speaking = false;
    }
  };

  const stopSpeaking = () => {
    speechSynthesis.pause();
    paused = true;
    speaking = false;
  };

  const utteranceEndHandler = (e) => {
    currentComment++;
  };

  const nextComment = () => {
    currentComment++;
    speakComments(currentComment);
  };

  const previousComment = () => {
    currentComment--;
    speakComments(currentComment);
  };

  const findBody = (item) => {
    const userTextEl = item.querySelector('.usertext-body');
    let body = '';
    if(userTextEl) {
      userTextEl.innerHTML = fs.parseSpeech(userTextEl.innerHTML);
      body = userTextEl.textContent;
    }
    return body;
  }

  const parseVoices = () => {
    return speechSynthesis.getVoices().filter((voice) => (
      voice.lang === 'en-US' && voice.localService));
  };

  const parseContent = () => {
    if(!utterances.length) {
      for(var i = 0; i < entries.length; i++){
        const author = findAuthor(entries.item(i), i);
        if(author) {
          const body = findBody(entries.item(i));
          //if author
          //const post = author + " writes,," + body;
          const post = " , " + body + " , "; //voice changes reference comment changes
          posts.push(post);
          const utterance = new SpeechSynthesisUtterance();
          utterance.text = post;
          utterance.rate = 1.5;
          utterance.pitch = (Math.random() * (0.2 - 1.8) + 1.8).toFixed(4)
          utterance.voice = voices[i % (voices.length - 1)];
          utterance.onend = utteranceEndHandler;
          utterances.push(utterance);
        }
      }
      if(!utterances.length){
        canParse = false;
      }
    }
  };

  const speakContent = () => {
    if(canParse){
      voices = parseVoices();
      parseContent();
      speakComments(currentComment);
    } else {
      console.log("can't parse");
    }
  };

  const speakComments = (currentComment) => {
    //loads up queue
    speechSynthesis.cancel();
    if( currentComment < 0 ||
      currentComment > utterances.length - 1 ) {
      console.log('out of range');
    } else {
      for(var i = currentComment; i < utterances.length; i++){
        speakComment(i);
      }
      speaking = true;
    }
  };

  const speakComment = (comment) => {
    speechSynthesis.speak(utterances[comment]);
  };

  const initializeSpeaking = () => {
    currentComment = 0;
    speechSynthesis.onvoiceschanged = function() {
      speakContent(currentComment);
    };

    if(speechSynthesis.getVoices().length){
      speakContent(currentComment);
    }
  };

  function init(){
    document.onkeydown = function(evt) {
      switch(evt.code){
        case "Space":
          togglePause();
          break;
        case "ArrowRight":
          if(speaking){
            nextComment();
          };
        case "ArrowLeft":
          if(speaking){
            previousComment();
          };
        default:
          //console.log(evt.code);
          break;
      }
    };
  }

  if( typeof(chrome) !== 'undefined' ) {
    chrome.runtime.onMessage.addListener(
      function(request, sender, sendResponse) {
        switch(request.message){
          case "speak":
            initializeSpeaking();
            break;
          case "stop":
            stopSpeaking();
            break;
          case "pause":
            togglePause();
            break;
          case "init":
            init();
            break;
        }
      }
    );
  }
};

initContent();
