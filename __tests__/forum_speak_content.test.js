import chrome from 'sinon-chrome/extensions';
import { ForumSpeak } from '../src/app';
import * as fixtures from '../__fixtures__/reddit.js';
import { voices } from '../__fixtures__/voices.js';

let fs, utteranceEndHandler;

describe('forum speak content script?', () => {

  beforeEach(() => {
    fs = new ForumSpeak();
    fs.getRandomPitch = () => 1;
    utteranceEndHandler = jest.fn();
    fs.utteranceEndHandler = utteranceEndHandler;
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
  });

  it('checks if it can parse the page', () => {
    const comments = ['hello'];
    const authors = ['author1'];
    const forum = fixtures.createRedditPage(comments, authors);
    expect(fs.canParse(forum)).toBeTruthy();
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
    const authorsObject = fs.assignVoicesToAuthors(forum, voices);
    expect(fs.objectifyContent(forum, authorsObject)).toEqual([
      {
        author: 'a1',
        comment: 'hello',
        voice: voices[0],
        op: true,
        pitch: 1,
      }
    ]);
  });

  it('creates utterances queue from content', () => {
    const contentArray = [
      {
        author: 'a1',
        comment: 'hello',
        voice: voices[0],
        pitch: 1,
      }
    ];
    expect(fs.contentToUtterances(contentArray)[0].voice)
      .toEqual(voices[0]);

  });


  it('uses chrome', () => {
    expect(chrome).toBeTruthy();
  });


});