import chrome from 'sinon-chrome/extensions';
import { ForumSpeak } from '../src/app';
import * as fixtures from '../__fixtures__/reddit.js';
import { voices } from '../__fixtures__/voices.js';

let fs, utteranceEndHandler, redditPage;
let sendMessageMock;

describe('forum speak content script', () => {
  beforeEach(() => {
    sendMessageMock = jest.fn();
    ForumSpeak.prototype.sendMessage = sendMessageMock;
    const localStorageMock = (function() {
      let store = {};
      return {
        getItem: key => {
          return store[key] || null;
        },
        setItem: (key, value) => {
          store[key] = value.toString();
        },
        clear: () => {
          store = {};
        },
        getStore: () => {
          return store;
        }
      }
    })();
    const comments = ['hello'];
    const authors = ['author1'];
    redditPage = fixtures.createRedditPage(comments, authors);
    window.speechSynthesis = {
      getVoices: () => {
        return voices;
      },
      speak: jest.fn(),
      cancel: jest.fn(),
      pause: jest.fn(),
      resume: jest.fn(),
      paused: false,
      pending: false,
      speaking: false,
    };
    window.SpeechSynthesisUtterance = () => {
      return {}
    }
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock
    });
  });

  describe('successful parsing of reddit', () => {
    beforeEach(() => {
      fs = new ForumSpeak(redditPage);
      fs.getRandomPitch = () => 1;
      fs.utteranceEndHandler = jest.fn();
    });

    it('checks if it can parse the page', () => {
      expect(fs.canParse(redditPage)).toBeTruthy();
    });

    it('finds body in comments correctly', () => {
      const comment = fixtures.createComment('foo');
      expect(fs.findBody(comment)).toBe('foo');
    });

    it('finds author in comments correctly', () => {
      const comment = fixtures.createComment('foo', 'fakeAuthor');
      expect(fs.findAuthor(comment)).toBe('fakeAuthor');
    });

    it('has a forumSpeak class', () => {
      expect(fs).toBeTruthy();
    });

    it('parses quotes correctly', () => {
      expect(fs.parseSpeech('<blockquote>hey</blockquote>')).toEqual('quote!, hey, unquote!,');
    });

    it('gets voices from the system', () => {
      expect(speechSynthesis.getVoices()).toBe(voices);
    });

    it('gets parsed english voices from forum speak object', () => {
      expect(fs.filterVoices(voices)).toEqual([voices[0]]);
    });

    it('assigns a random pitch', () => {
      expect(fs.getRandomPitch()).toBe(1);
    });

    it('creates a map of authors with associated voices', () => {
      const comments = ['hello', 'world'];
      const authors = ['author1', 'author2'];
      const forum = fixtures.createRedditPage(comments, authors);
      expect(fs.assignVoicesToAuthors(forum, voices)).toEqual({
        author1: {
          voice: voices[0],
          op: true,
          pitch: 1,
        },
        author2: {
          voice: voices[1],
          op: false,
          pitch: 1,
        }
      });
    });

    it('cycles through voices correctly', () => {
      const comments = ['hell', 'low', 'world'];
      const authors = ['author1', 'author2', 'author3'];
      const forum = fixtures.createRedditPage(comments, authors);
      const voices = [
        "voice1",
        "voice2",
      ];
      expect(fs.assignVoicesToAuthors(forum, voices)).toEqual({
        author1: {
          voice: 'voice1',
          op: true,
          pitch: 1,
        },
        author2: {
          voice: 'voice2',
          op: false,
          pitch: 1,
        },
        author3: {
          voice: 'voice1',
          op: false,
          pitch: 1,
        }
      });
    });

    it('does not duplicate authors', () => {
      const comments = ['hey', 'whatsup', 'nothing'];
      const authors = ['author1', 'author2', 'author1'];
      const forum = fixtures.createRedditPage(comments, authors);
      const voices = [
        'ghost'
      ];
      expect(fs.assignVoicesToAuthors(forum, voices)).toEqual({
        author1: {
          voice: 'ghost',
          op: true,
          pitch: 1,
        },
        author2: {
          voice: 'ghost',
          op: false,
          pitch: 1,
        }
      });
    });

    it('objectifies content correctly', () => {
      const comments = ['hello'];
      const authors = ['a1'];
      const forum = fixtures.createRedditPage(comments, authors);
      const el = forum.getElementsByClassName("entry")[0];
      const authorsObject = fs.assignVoicesToAuthors(forum, voices);
      expect(fs.objectifyContent(forum, authorsObject)).toEqual([
        {
          author: 'a1',
          comment: 'hello',
          el: el,
          voice: voices[0],
          op: true,
          pitch: 1,
        }
      ]);
    });

    it('includes a title', () => {
      const comments = ['subtitle'];
      const authors = ['a1'];
      const title = 'title';
      const forum = fixtures.createRedditPage(comments, authors, title);
      const elTitle = forum.getElementsByClassName("title")[1];
      const el = forum.getElementsByClassName("entry")[0];
      const authorsObject = fs.assignVoicesToAuthors(forum, voices);
      expect(fs.hasTitle(forum)).toBeTruthy();
      expect(fs.objectifyContent(forum, authorsObject)).toEqual([
        {
          author: 'a1',
          comment: 'title',
          el: elTitle,
          voice: voices[0],
          op: true,
          pitch: 1,
        },
        {
          author: 'a1',
          comment: 'subtitle',
          el: el,
          voice: voices[0],
          op: true,
          pitch: 1,
        }
      ]);
    });

    xit('creates utterances queue from content', () => {
      //TODO - move to react interface test
      const contentArray = [
        {
          author: 'a1',
          comment: 'hello',
          voice: voices[0],
          pitch: 1,
        }
      ];
      expect(fs.contentToUtterances(contentArray)[0].text)
        .toEqual(' , hello , ');
    });

    it('local storage mocked correctly', () => {
      window.localStorage.setItem('foo', 'bar');
      expect(localStorage.getItem('foo')).toBe('bar');
    });

    it('has local storage methods', () => {
      fs.savePositionToStorage('foo', 1);
      expect(fs.getPositionFromStorage('foo')).toBe(1);
    });

    it('brings up test url specified in jest config', () => {
      expect(window.location.href).toBe('test:');
    });

    it('saves an item to local storage', () => {
      fs.savePositionToStorage('foo', 99);
      expect(localStorage.getItem('fs:foo')).toBe(String(99))
    });
  });
  
  describe('local storage initializations', () => {
    fit('gets currentComment from localStorage', () => {
      localStorage.setItem('fs:test:', 13);
      fs = new ForumSpeak(redditPage);
      fs.utteranceEndHandler = jest.fn();
      expect(fs.currentComment).toBe(13);
    });
  });

  describe('sad paths', () => {
    it('sends a parse fail message on incorrect page', () => {
      const emptyContainer = document.createElement('div');
      fs = new ForumSpeak(emptyContainer);
      expect(sendMessageMock.mock.calls[0][0]).toBe('parseFail');
    });
  });
});