(() => {
  let speaking = false;
  let currentComment = 0;
  let voices;
  const entries = document.getElementsByClassName("entry");
  const posts = [];
  const utterances = [];

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

  const findBody = (item) => {
    const userTextEl = item.querySelector('.usertext-body');
    let body = '';
    if(userTextEl) {
      userTextEl.innerHTML = parseSpeech(userTextEl.innerHTML);
      body = userTextEl.textContent;
    }
    return body;
  }

  const parseVoices = () => {
    return engVoices = speechSynthesis.getVoices().filter((voice) => (
      voice.lang === 'en-US' && voice.localService));
  };

  const parseContent = () => {
    for(var i = 0; i < entries.length; i++){
      const author = findAuthor(entries.item(i), i);
      if(author) {
        const body = findBody(entries.item(i));
        const post = author + " writes,," + body;
        posts.push(post);
        const utterance = new SpeechSynthesisUtterance();
        utterance.text = post;
        utterance.rate = 1.5;
        utterance.voice = voices[i % (voices.length - 1)];
        console.log('what is the voice', utterance.voice);
        utterances.push(utterance);
      }
    }
  };

  const speakContent = () => {
    voices = parseVoices();
    parseContent();
    speakComment(currentComment);
  };

  const speakComment = (comment) => {
    speechSynthesis.cancel();
    speechSynthesis.speak(utterances[comment]);
    speaking = true;
  };

  const initializeSpeaking = () => {
    speechSynthesis.onvoiceschanged = function() {
      speakContent();
    };

    if(speechSynthesis.getVoices().length){
      speakContent();
    }
  };

  const stopSpeaking = () => {
    speechSynthesis.cancel();
    speaking = false;
  };

  const nextComment = () => {
    currentComment++;
    speakComment(currentComment);
  };

  const previousComment = () => {
    currentComment--;
    speakComment(currentComment);
  };

  function init(){
    document.onkeydown = function(evt) {
      switch(evt.code){
        case "Space":
          if(speaking){
            stopSpeaking();
          } else {
            initializeSpeaking();
          }
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

  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      switch(request.message){
        case "speak":
          initializeSpeaking();
          break;
        case "stop":
          stopSpeaking();
          break;
        case "init":
          init();
          break;
      }
    }
  );

})();