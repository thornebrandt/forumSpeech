import React from 'react';
import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import FSInterface from '../src/FSInterface';
import { voices } from '../__fixtures__/voices.js';

configure({ adapter: new Adapter() });


describe("FSInterface", () => {
  let fsComponent, localStorageMock;
  const contentArray = [
    {
      author: 'a1',
      comment: 'hello',
      voice: voices[0],
      pitch: 1,
    }
  ];

  beforeEach(() => {


    fsComponent = shallow(<FSInterface
      currentComment={0}
      contentArray={contentArray}
      rate={1.4}
    />);
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

    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock
    });
  });

  it("loads without warnings", () => {
    expect(fsComponent).toBeTruthy();
  });

  it('gets voices from the system', () => {
    expect(speechSynthesis.getVoices()).toBe(voices);
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
    expect(fsComponent.instance().contentToUtterances(contentArray)[0].text)
      .toEqual(' , hello , ');
  });

  it('saves an item to local storage', () => {
    fsComponent.instance().savePositionToStorage('foo', 99);
    expect(localStorage.getItem('fs:foo')).toBe("99");
  });

  it('increments a comment', () => {
    fsComponent.instance().incrementComment();
    expect(fsComponent.instance().state.currentComment).toBe(1);
  });

  it('incrementing a comment updates localStorage', () => {
    fsComponent.instance().state.currentComment = 9;
    fsComponent.instance().incrementComment();
    expect(localStorage.getItem('fs:test:')).toBe("10");
  });

  it('saves jumped comment to localStorage', () => {
    fsComponent.instance().state.jumpComment = 3;
    fsComponent.instance().jumpToComment();
    expect(localStorage.getItem('fs:test:')).toBe("3");
  });

  it('saves external jumped comment to localStorage', () => {
    fsComponent.instance().externalJumpComment(5);
    expect(localStorage.getItem('fs:test:')).toBe("5");
  });
});