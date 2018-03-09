/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ForumSpeak = exports.ForumSpeak = function () {
  function ForumSpeak() {
    _classCallCheck(this, ForumSpeak);
  }

  _createClass(ForumSpeak, [{
    key: 'init',
    value: function init() {
      return true;
    }
  }, {
    key: 'parseLinks',
    value: function parseLinks(body) {
      var reg = /<a[\s\S]*?>\n?([\s\S]*?)\n?<\/a>/g;
      return body.replace(reg, '$1, link posted,');
    }
  }, {
    key: 'parseQuotes',
    value: function parseQuotes(body) {
      var reg = /<blockquote[\s\S]*?>\n?([\s\S]*?)\n?<\/blockquote>/g;
      return body.replace(reg, 'quote!, $1, unquote!,');
    }
  }, {
    key: 'parseSpeech',
    value: function parseSpeech(body) {
      var parsed_body = this.parseLinks(body);
      return this.parseQuotes(parsed_body);
    }
  }, {
    key: 'findBody',
    value: function findBody(item) {
      var userTextEl = item.querySelector('.usertext-body');
      var body = '';
      if (userTextEl) {
        userTextEl.innerHTML = this.parseSpeech(userTextEl.innerHTML);
        body = userTextEl.textContent.trim();
      }
      return body;
    }
  }, {
    key: 'findAuthor',
    value: function findAuthor(item, i) {
      var authorEl = item.querySelector('.author');
      if (authorEl) {
        var author = authorEl.textContent.trim();
        return author;
      }
      return false;
    }
  }, {
    key: 'objectifyContent',
    value: function objectifyContent(el) {
      var userBodiesEl = el.getElementsByClassName('entry');
      var userBodies = [].concat(_toConsumableArray(userBodiesEl));
      var content = [];
      userBodies.forEach(function (item, i) {
        content.push(item);
      });
      return content;
    }
  }]);

  return ForumSpeak;
}();

var initContent = exports.initContent = function initContent() {
  var fs = new ForumSpeak();

  var speaking = false;
  var paused = false;
  var canParse = true;
  var currentComment = 0;
  var voices = void 0;
  var entries = document.getElementsByClassName("entry");
  var posts = [];
  var utterances = [];

  var returnTrue = function returnTrue() {
    return true;
  };

  var parseLinks = function parseLinks(body) {
    var reg = /<a[\s\S]*?>\n?([\s\S]*?)\n?<\/a>/g;
    return body.replace(reg, '$1, link posted,');
  };

  var parseQuotes = function parseQuotes(body) {
    var reg = /<blockquote[\s\S]*?>\n?([\s\S]*?)\n?<\/blockquote>/g;
    return body.replace(reg, 'quote!, $1, unquote!,');
  };

  var parseSpeech = function parseSpeech(body) {
    var parsed_body = parseLinks(body);
    return parseQuotes(parsed_body);
  };

  var findAuthor = function findAuthor(item, i) {
    var authorEl = item.querySelector('.author');
    if (authorEl) {
      var author = authorEl.textContent;
      var OP = item.querySelector('.submitter');
      if (OP) {
        if (i === 0) {
          var _OP = author;
          author = "The original poster, " + _OP;
        } else {
          author = "OP";
        }
      }
      return author;
    }
    return false;
  };

  var togglePause = function togglePause() {
    if (paused) {
      speechSynthesis.resume();
      paused = false;
      speaking = true;
    } else {
      speechSynthesis.pause();
      paused = true;
      speaking = false;
    }
  };

  var stopSpeaking = function stopSpeaking() {
    speechSynthesis.pause();
    paused = true;
    speaking = false;
  };

  var utteranceEndHandler = function utteranceEndHandler(e) {
    currentComment++;
  };

  var nextComment = function nextComment() {
    currentComment++;
    speakComments(currentComment);
  };

  var previousComment = function previousComment() {
    currentComment--;
    speakComments(currentComment);
  };

  var findBody = function findBody(item) {
    var userTextEl = item.querySelector('.usertext-body');
    var body = '';
    if (userTextEl) {
      userTextEl.innerHTML = fs.parseSpeech(userTextEl.innerHTML);
      body = userTextEl.textContent;
    }
    return body;
  };

  var parseVoices = function parseVoices() {
    return speechSynthesis.getVoices().filter(function (voice) {
      return voice.lang === 'en-US' && voice.localService;
    });
  };

  var parseContent = function parseContent() {
    if (!utterances.length) {
      for (var i = 0; i < entries.length; i++) {
        var author = findAuthor(entries.item(i), i);
        if (author) {
          var body = findBody(entries.item(i));
          //if author
          //const post = author + " writes,," + body;
          var post = " , " + body + " , "; //voice changes reference comment changes
          posts.push(post);
          var utterance = new SpeechSynthesisUtterance();
          utterance.text = post;
          utterance.rate = 1.5;
          utterance.pitch = (Math.random() * (0.2 - 1.8) + 1.8).toFixed(4);
          utterance.voice = voices[i % (voices.length - 1)];
          utterance.onend = utteranceEndHandler;
          utterances.push(utterance);
        }
      }
      if (!utterances.length) {
        canParse = false;
      }
    }
  };

  var speakContent = function speakContent() {
    if (canParse) {
      voices = parseVoices();
      parseContent();
      speakComments(currentComment);
    } else {
      console.log("can't parse");
    }
  };

  var speakComments = function speakComments(currentComment) {
    //loads up queue
    speechSynthesis.cancel();
    if (currentComment < 0 || currentComment > utterances.length - 1) {
      console.log('out of range');
    } else {
      for (var i = currentComment; i < utterances.length; i++) {
        speakComment(i);
      }
      speaking = true;
    }
  };

  var speakComment = function speakComment(comment) {
    speechSynthesis.speak(utterances[comment]);
  };

  var initializeSpeaking = function initializeSpeaking() {
    currentComment = 0;
    speechSynthesis.onvoiceschanged = function () {
      speakContent(currentComment);
    };

    if (speechSynthesis.getVoices().length) {
      speakContent(currentComment);
    }
  };

  function init() {
    document.onkeydown = function (evt) {
      switch (evt.code) {
        case "Space":
          togglePause();
          break;
        case "ArrowRight":
          if (speaking) {
            nextComment();
          };
        case "ArrowLeft":
          if (speaking) {
            previousComment();
          };
        default:
          //console.log(evt.code);
          break;
      }
    };
  }

  if (typeof chrome !== 'undefined') {
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
      switch (request.message) {
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
    });
  }
};

initContent();

/***/ })
/******/ ]);