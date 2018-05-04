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
exports.ForumSpeak = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _interface = __webpack_require__(1);

var _interface2 = _interopRequireDefault(_interface);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var fs = void 0;

var ForumSpeak = exports.ForumSpeak = function () {
  function ForumSpeak(content) {
    _classCallCheck(this, ForumSpeak);

    this.rate = 1.4;
    this.voices = [];
    this.speaking = false;
    this.paused = false;
    if (this.canParse(content)) {
      this.initialize();
    } else {
      this.parseFailHandler();
    }
  }

  _createClass(ForumSpeak, [{
    key: 'createInterface',
    value: function createInterface() {
      this.fsi = new _interface2.default();
    }
  }, {
    key: 'initialize',
    value: function initialize() {
      var _this = this;

      //move to a local storage handler
      this.createInterface();
      this.sendMessage('canParse', { speaking: speechSynthesis.speaking });
      this.setupMessageListeners();
      this.setupKeyboardListeners();
      this.currentComment = this.getPositionFromStorage(window.location.href);
      if (!speechSynthesis.speaking && !this.currentComment) {
        this.initializeVoices(function () {
          _this.voices = _this.filterVoices(speechSynthesis.getVoices());
          _this.authorsObject = _this.assignVoicesToAuthors(document.body, _this.voices);
          _this.contentArray = _this.objectifyContent(document.body, _this.authorsObject);
          _this.sendMessage('commentCount', {
            count: _this.contentArray.length
          });
          _this.sendMessage('currentComment', {
            currentComment: _this.currentComment
          });
        });
      } else {
        console.log('this.contentArray', this.contentArray);
      }
    }
  }, {
    key: 'sendMessage',
    value: function sendMessage(message, data) {
      if (typeof chrome !== 'undefined') {
        chrome.runtime.sendMessage({
          message: message,
          data: data
        });
      }
    }
  }, {
    key: 'parseFailHandler',
    value: function parseFailHandler() {
      this.sendMessage('parseFail');
      //send message back to popup to clear interface.
    }
  }, {
    key: 'initializeVoices',
    value: function initializeVoices(voicesLoadedCallback) {
      speechSynthesis.onvoiceschanged = voicesLoadedCallback;
      if (speechSynthesis.getVoices().length) {
        voicesLoadedCallback();
      }
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
    key: 'filterVoices',
    value: function filterVoices(voices) {
      return voices.filter(function (voice) {
        return voice.lang === 'en-US' && voice.localService;
      });
    }
  }, {
    key: 'contentToUtterances',
    value: function contentToUtterances(contentArray) {
      var _this2 = this;

      var utterances = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

      if (!utterances.length) {
        contentArray.forEach(function (entry, i) {
          var utterance = new window.SpeechSynthesisUtterance();
          utterance.text = ' , ' + entry.comment + ' , ';
          utterance.pitch = entry.pitch;
          utterance.voice = entry.voice;
          utterance.rate = _this2.rate;
          utterance.onend = _this2.utteranceEndHandler.bind(_this2);
          utterances.push(utterance);
        });
        return utterances;
      }
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
    key: 'assignVoicesToAuthors',
    value: function assignVoicesToAuthors(el, voices) {
      var _this3 = this;

      var contentEl = el.getElementsByClassName('entry');
      var content = [].concat(_toConsumableArray(contentEl));
      var authorObject = {};
      content.forEach(function (item, i) {
        var author = _this3.findAuthor(item, i);
        authorObject[author] = authorObject[author] || {
          voice: voices[i % voices.length],
          op: i === 0,
          pitch: _this3.getRandomPitch()
        };
      });
      return authorObject;
    }
  }, {
    key: 'canParse',
    value: function canParse(el) {
      var contentEl = el.getElementsByClassName('entry');
      return contentEl.length > 0;
    }
  }, {
    key: 'hasTitle',
    value: function hasTitle(el) {
      var titleEl = el.querySelectorAll('a.title');
      return titleEl.length > 0;
    }
  }, {
    key: 'findTitle',
    value: function findTitle(el) {
      return el.querySelectorAll('a.title')[0].textContent.trim();
    }
  }, {
    key: 'objectifyContent',
    value: function objectifyContent(el, authors) {
      var _this4 = this;

      var contentEl = el.getElementsByClassName('entry');
      var content = [].concat(_toConsumableArray(contentEl));
      var contentArray = [];
      content.forEach(function (comment, i) {
        var author = _this4.findAuthor(comment);
        var body = _this4.findBody(comment);
        if (author) {
          contentArray.push({
            author: author,
            comment: body,
            voice: authors[author].voice,
            op: authors[author].op,
            pitch: authors[author].pitch
          });
        }
      });
      if (this.hasTitle(el)) {
        var title = this.findTitle(el);
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
  }, {
    key: 'getRandomPitch',
    value: function getRandomPitch() {
      return (Math.random() * (0.3 - 1.7) + 1.7).toFixed(4);
    }
  }, {
    key: 'togglePause',
    value: function togglePause() {
      if (this.paused) {
        speechSynthesis.resume();
        this.paused = false;
        this.speaking = true;
      } else {
        speechSynthesis.pause();
        this.paused = true;
        this.speaking = false;
      }
    }
  }, {
    key: 'stopSpeaking',
    value: function stopSpeaking() {
      speechSynthesis.pause();
      this.paused = true;
      this.speaking = false;
    }
  }, {
    key: 'utteranceEndHandler',
    value: function utteranceEndHandler(e, dude) {
      if (this.speaking) {
        this.currentComment++;
        this.sendMessage('currentComment', {
          currentComment: this.currentComment
        });
      }
    }
  }, {
    key: 'nextComment',
    value: function nextComment() {
      this.currentComment++;
      this.speakComments(this.currentComment);
    }
  }, {
    key: 'previousComment',
    value: function previousComment() {
      this.currentComment--;
      this.speakComments(this.currentComment);
    }
  }, {
    key: 'startSpeaking',
    value: function startSpeaking() {
      if (this.voices.length && this.contentArray.length) {
        this.utterances = this.contentToUtterances(this.contentArray);
        this.speakComments(this.currentComment);
      } else {
        console.log("can't parse");
      }
    }
  }, {
    key: 'speakComments',
    value: function speakComments(currentComment) {
      this.speaking = false;
      speechSynthesis.cancel();
      this.speaking = true;
      if (this.currentComment < 0 || this.currentComment > this.utterances.length - 1) {
        console.log('stop handler');
      } else {
        for (var i = this.currentComment; i < this.utterances.length; i++) {
          this.speakComment(this.utterances[i]);
        }
      }
    }
  }, {
    key: 'speakComment',
    value: function speakComment(utterance) {
      speechSynthesis.speak(utterance);
    }
  }, {
    key: 'setupKeyboardListeners',
    value: function setupKeyboardListeners() {
      document.onkeydown = function (evt) {
        switch (evt.code) {
          case "Space":
            this.togglePause();
            break;
          case "ArrowRight":
            if (this.speaking) {
              this.nextComment();
            };
          case "ArrowLeft":
            if (this.speaking) {
              this.previousComment();
            };
          default:
            //console.log(evt.code);
            break;
        }
      }.bind(this);
    }
  }, {
    key: 'setupMessageListeners',
    value: function setupMessageListeners() {
      if (typeof chrome !== 'undefined') {
        chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
          switch (request.message) {
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
          }
        }.bind(this));
      }
    }
  }, {
    key: 'savePositionToStorage',
    value: function savePositionToStorage(urlName, position) {
      window.localStorage.setItem('fs:' + urlName, position);
    }
  }, {
    key: 'getPositionFromStorage',
    value: function getPositionFromStorage(urlName) {
      var match = window.localStorage.getItem('fs:' + urlName);
      return match ? parseInt(match) : 0;
    }
  }]);

  return ForumSpeak;
}();

var initContent = function initContent() {
  if (!fs) {
    console.log('no fs', fs);
    fs = new ForumSpeak(document.body);
  } else {
    console.log('fs.currentComment', fs.currentComment);
  }
};

initContent();

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ForumSpeakInterface = function () {
  function ForumSpeakInterface() {
    _classCallCheck(this, ForumSpeakInterface);

    this.createEl();
  }

  _createClass(ForumSpeakInterface, [{
    key: "createEl",
    value: function createEl() {
      var styles = {
        display: "block",
        width: "300px",
        height: "300px",
        backgroundColor: "white",
        border: "30px blue solid",
        position: "fixed",
        left: "0px",
        top: "0px",
        zIndex: "1000"
      };

      this.fsEl = document.createElement("div");
      Object.assign(this.fsEl.style, styles);
      this.fsEl.classList.add('fs');
    }
  }]);

  return ForumSpeakInterface;
}();

exports.default = ForumSpeakInterface;

/***/ })
/******/ ]);