class Token {
  constructor(public type: string, public value: string, public line: number, public column: number) {}
}

class Lexer {
  private sourceCode: string;
  private currentPosition: number;
  private currentLine: number;
  private currentColumn: number;

  constructor(sourceCode: string) {
      this.sourceCode = sourceCode;
      this.currentPosition = 0;
      this.currentLine = 1;
      this.currentColumn = 1;
  }

  private updatePosition(value: string) {
      for (const char of value) {
          if (char === '\n') {
              this.currentLine++;
              this.currentColumn = 1;
          } else {
              this.currentColumn++;
          }
      }
  }

  private isEOF(): boolean {
      return this.currentPosition >= this.sourceCode.length;
  }

  private match(pattern: RegExp): string | null {
      const match = this.sourceCode.substr(this.currentPosition).match(pattern);

      if (match && match.index === 0) {
          const value = match[0];
          this.updatePosition(value);
          this.currentPosition += value.length;
          return value;
      }

      return null;
  }

  private skipWhitespace(): void {
      this.match(/^\s+/);
  }

  private tokenizeId(): Token | null {
      const value = this.match(/^[a-zA-Z]+/);

      if (value !== null) {
          return new Token('ID', value, this.currentLine, this.currentColumn - value.length + 1);
      }

      return null;
  }

  private tokenizeNumber(): Token | null {
      const value = this.match(/^\d+/);

      if (value !== null) {
          return new Token('NUMBER', value, this.currentLine, this.currentColumn - value.length + 1);
      }

      return null;
  }

  // Implement other tokenization methods similarly

  public tokenize(): Token[] {
      const tokens: Token[] = [];
      const errors: { message: string, line: number, column: number }[] = [];

      while (!this.isEOF()) {
          this.skipWhitespace();
          const startPosition = this.currentPosition;

          // Tokenize code here

          // If encountered an error
          const invalidToken = this.sourceCode.substring(startPosition, this.currentPosition);
          errors.push({
              message: `Invalid token "${invalidToken}"`,
              line: this.currentLine,
              column: this.currentColumn - invalidToken.length + 1
          });
          this.currentPosition++; // Move to the next character to continue tokenizing
      }

      if (errors.length > 0) {
          // Display errors in a more readable format in the output textarea
          const outputTextarea = document.getElementById("outputTextarea");
          outputTextarea.value = errors.map(error =>
              `Error at line ${error.line}, column ${error.column}: ${error.message}`
          ).join('\n');
      }

      return tokens;
  }
}
