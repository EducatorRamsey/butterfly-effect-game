export class Narrator {
  rate = 1;
  text = "";
  enabled = false;
  read(text = this.text) {
    this.text = text;
    this.stop();
    if (!("speechSynthesis" in window)) return false;
    const speech = new SpeechSynthesisUtterance(text);
    speech.rate = this.rate;
    window.speechSynthesis.speak(speech);
    return true;
  }
  stop() {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  }
  update(text: string) {
    this.text = text;
    if (this.enabled) this.read();
  }
}
