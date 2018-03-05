let chrome, speechSynthesis;

import { ForumSpeak } from '../src/app';
import * as fixtures from '../__fixtures__/reddit.js';
import { voices } from '../__fixtures__/voices.js';

describe('forum speak content script?', () => {
  let fs;

  beforeEach(() => {
    fs = new ForumSpeak();
    speechSynthesis = {
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

  });

  it('has a forumSpeak class', () => {
    expect(fs).toBeTruthy();
  });

  it('parses quotes correctly', () => {
    expect(fs.parseSpeech('<blockquote>hey</blockquote>')).toEqual('quote!, hey, unquote!,');
  });

  it('creates fixture comments correctly', () => {
    const comment = fixtures.createComment('foo');
    expect(fs.findBody(comment)).toBe('foo');
  });

  it('creates a group of fixture comments correctly', () => {
    const comments = ['hello', 'hi', 'howdy'];
    const authors = ['a1', 'a2', 'a3'];
    const forum = fixtures.createRedditPage(comments, authors);
    expect(fs.objectifyContent(forum).length).toBe(3);
  });

  it('gets voices', () => {
    expect(speechSynthesis.getVoices()).toBe(voices);
  });
});