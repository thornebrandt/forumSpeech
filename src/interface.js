class ForumSpeakInterface {
  constructor(){
    this.createEl();
  }

  createEl(){
    const styles = {
      display: "block",
      width: "300px",
      height: "300px",
      backgroundColor: "white",
      border: "30px blue solid",
      position: "fixed",
      left: "0px",
      top: "0px",
      zIndex: "1000",
    }

    this.fsEl = document.createElement("div");
    Object.assign(this.fsEl.style, styles);
    this.fsEl.classList.add('fs');
  }
}

export default ForumSpeakInterface;