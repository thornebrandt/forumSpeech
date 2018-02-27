let chrome;

import { ForumSpeak } from '../src/app';
import { createComment } from '../__fixtures__/reddit.js';


describe('forum speak content script?', () => {
  let fs;

  beforeEach(() => {
    fs = new ForumSpeak();
  });

  it('has a forumSpeak class', () => {
    expect(fs).toBeTruthy();
  });

  it('parses quotes correctly', () => {
    expect(fs.parseSpeech('<blockquote>hey</blockquote>')).toEqual('quote!, hey, unquote!,');
  });

  it('creates fixture comments correctly', () => {
    const comment = createComment('foo');
    expect(fs.findBody(comment)).toBe('foo');
  });

});