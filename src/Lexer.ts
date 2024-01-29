class Token {
    constructor(public type: string, public value: string) {}
  }
  
  class Lexer {
    private sourceCode: string;
    private currentPosition: number;
  
    constructor(sourceCode: string) {
      this.sourceCode = sourceCode;
      this.currentPosition = 0;
    }
    
    private isEOF(): boolean {
        return this.currentPosition >= this.sourceCode.length;
      }

}