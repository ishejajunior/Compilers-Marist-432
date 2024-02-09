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

  private matchString(pattern: RegExp): string | null {
    const value = this.sourceCode.substr(this.currentPosition).match(pattern);

    if (value && value.index === 0) {
        this.updatePosition(value[0]);
        this.currentPosition += value[0].length;
        return value[0];
    }

    return null;
}


private skipWhitespace(): void {
  while (!this.isEOF() && /\s/.test(this.sourceCode[this.currentPosition])) {
      this.updatePosition(this.sourceCode[this.currentPosition]);
  }
}


  private matchRegex(pattern: RegExp): string | null {
      const match = this.sourceCode.substr(this.currentPosition).match(pattern);

      if (match && match.index === 0) {
          const value = match[0];
          this.updatePosition(value);
          this.currentPosition += value.length;
          return value;
      }

      return null;
  }

  private skipComment(): void {
    const startIndex = this.currentPosition;
    while (!this.isEOF() && this.matchString(/\*\//) === null) {
        this.updatePosition(this.sourceCode[this.currentPosition]);
    }
    if (this.isEOF()) {
        console.error(`Unterminated comment starting at line ${this.currentLine}, column ${startIndex}`);
    }
}

  private tokenizeIdOrKeyword(): Token | null {
      const value = this.matchRegex(/^[a-zA-Z][a-zA-Z0-9]*/);

      if (value !== null) {
          return new Token(value.toUpperCase(), value, this.currentLine, this.currentColumn - value.length + 1);
      }

      return null;
  }

  private tokenizeNumber(): Token | null {
      const value = this.matchRegex(/^\d+/);

      if (value !== null) {
          return new Token('NUMBER', value, this.currentLine, this.currentColumn - value.length + 1);
      }

      return null;
  }

  private tokenizeString(): Token | null {
      const value = this.matchRegex(/^"([^"\\]|\\.)*"/);

      if (value !== null) {
          return new Token('STRING', value, this.currentLine, this.currentColumn - value.length + 1);
      }

      return null;
  }

  private tokenizeBooleanValue(): Token | null {
      const value = this.matchRegex(/^(true|false)/);

      if (value !== null) {
          return new Token('BOOLEAN', value, this.currentLine, this.currentColumn - value.length + 1);
      }

      return null;
  }

  private tokenizeOperator(): Token | null {
    const operators = ['==', '!=', '+']; // Add other operators as needed

    for (const operator of operators) {
        const value = this.matchString(new RegExp(`^${operator}`));

        if (value !== null) {
            return new Token('OPERATOR', value, this.currentLine, this.currentColumn - value.length + 1);
        }
    }

    return null;
}


  private tokenizePunctuation(): Token | null {
      const value = this.matchString(/[{}()=;]/);

      if (value !== null) {
          return new Token('PUNCTUATION', value, this.currentLine, this.currentColumn - value.length + 1);
      }

      return null;
  }

  public tokenize(): Token[] {
      const tokens: Token[] = [];
      const errors: { message: string, line: number, column: number }[] = [];

      while (!this.isEOF()) {
        this.skipWhitespace();
        const startPosition = this.currentPosition;
    
        let token =
            this.tokenizeIdOrKeyword() ||
            this.tokenizeNumber() ||
            this.tokenizeString() ||
            this.tokenizeBooleanValue() ||
            this.tokenizeOperator() ||
            this.tokenizePunctuation();
    
        if (token) {
            tokens.push(token);
        } else if (this.matchString(/\/\*/)) {
            this.skipComment();
        } else {
              const invalidToken = this.sourceCode.substring(startPosition, this.currentPosition);
              errors.push({
                  message: `Invalid token "${invalidToken}"`,
                  line: this.currentLine,
                  column: this.currentColumn - invalidToken.length + 1
              });
              this.currentPosition++; // Move to the next character to continue tokenizing
          }
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
