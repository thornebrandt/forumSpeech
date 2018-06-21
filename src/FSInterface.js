import React from 'react';
import { render } from 'react-dom';

class FSInterface extends React.Component {
  constructor(props){
    super(props);
    this.jumpToComment = this.jumpToComment.bind(this);
    this.onChangeJumpComment = this.onChangeJumpComment.bind(this);
    this.startSpeaking = this.startSpeaking.bind(this);
    this.stopSpeaking = this.stopSpeaking.bind(this);
    this.state = {
      currentComment: props.currentComment,
      jumpComment: 0,
      speaking: false,
      totalComments: props.contentArray.length,
      utterances: [],
    }
  }

  componentWillMount(){
    document.addEventListener("keydown", this._handleKeyDown.bind(this));
  } 

  _handleKeyDown (e){
  }

  startSpeaking(e){
    this.setState(prevState => ({
      utterances: this.contentToUtterances(
        this.props.contentArray,
        prevState.utterances
      )
    }), () => {
      this.speakComments(this.state.currentComment);
    });
  }

  stopSpeaking(){
    speechSynthesis.cancel();
    this.setState(prevState => ({
      paused: true,
      speaking: false,
    }));
  }

  speakComments(){
    speechSynthesis.cancel();
    if(this.state.currentComment < 0 || this.state.currentComment > this.state.utterances.length - 1){
      this.setState({
        currentComment: 0,
        speaking: false,
      });
    } else {
      this.setState({
        speaking: true,
      });
      for(var i = this.state.currentComment; i < this.state.utterances.length; i++){
        this.speakComment(this.state.utterances[i]);
      }
    }
  }

  speakComment(utterance){
    speechSynthesis.speak(utterance);
  }

  contentToUtterances(contentArray, utterances = []){
    if(!utterances.length) {
      contentArray.forEach((entry, i) => {
        const utterance = new window.SpeechSynthesisUtterance();
        utterance.text = ' , ' + entry.comment + ' , ';
        utterance.pitch = entry.pitch;
        utterance.voice = entry.voice;
        utterance.rate = this.props.rate;
        utterance.onend = this.utteranceEndHandler.bind(this);
        utterances.push(utterance);
      });
    }
    return utterances;
  }

  utteranceEndHandler(e){
    if(this.state.speaking){
      this.incrementComment();
    }
    this.savePositionToStorage();
  }

  incrementComment(){
    this.setState(prevState => ({
      currentComment: Number(prevState.currentComment) + 1
    }), () => {
      this.savePositionToStorage();
    });
  }

  onChangeJumpComment(e){
    this.setState({
      jumpComment: e.target.value,
    });
  }

  externalJumpComment(jumpComment){
    speechSynthesis.cancel();
    this.setState({
      currentComment: jumpComment,
    }, () => {
      this.startSpeaking();
      this.savePositionToStorage();
    });
  }

  jumpToComment(){
    this.setState(prevState => ({
      currentComment: prevState.jumpComment,
    }), () => {
      this.savePositionToStorage();
    });
  }

  savePositionToStorage(){
    window.localStorage.setItem(
      'fs:' + window.location.href,
      this.state.currentComment
    );
  }

  render(){
    return (
      <div>
        <div id="commentIndicator">
          <strong> {this.state.currentComment} </strong>
            of
          <strong> {this.state.totalComments} </strong>
          <p>Jump to comment
            <input
              type="text"
              id="jumpToComment"
              onChange={this.onChangeJumpComment}
              value={this.state.jumpComment}
            />
            <button
              id="jumpToCommentBtn"
              onClick={this.jumpToComment}
            >
              Jump
            </button>
          </p>
        </div>
        <div id="interface">
          <button
            id="speakContent"
            onClick={this.startSpeaking}
          >
            Start Speaking
          </button>
          <button
            id="stopSpeaking"
            onClick={this.stopSpeaking}
          >
            Stop Speech
          </button>
        </div>
        {this.state.hello}
      </div>
    );
  }
}

export default FSInterface;