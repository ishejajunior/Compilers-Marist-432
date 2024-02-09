class Token {
    type;
    value;
    line;
    column;
    constructor(type, value, line, column) {
        this.type = type;
        this.value = value;
        this.line = line;
        this.column = column;
    }
}
class Lexer {
    sourceCode;
    currentPosition;
    currentLine;
    currentColumn;
    constructor(sourceCode) {
        this.sourceCode = sourceCode;
        this.currentPosition = 0;
        this.currentLine = 1;
        this.currentColumn = 1;
    }
    updatePosition(value) {
        for (const char of value) {
            if (char === '\n') {
                this.currentLine++;
                this.currentColumn = 1;
            }
            else {
                this.currentColumn++;
            }
        }
    }
    isEOF() {
        return this.currentPosition >= this.sourceCode.length;
    }
    matchString(pattern) {
        const value = this.sourceCode.substr(this.currentPosition).match(pattern);
        if (value && value.index === 0) {
            this.updatePosition(value[0]);
            this.currentPosition += value[0].length;
            return value[0];
        }
        return null;
    }
    skipWhitespace() {
        while (!this.isEOF() && /\s/.test(this.sourceCode[this.currentPosition])) {
            this.updatePosition(this.sourceCode[this.currentPosition]);
        }
    }
    matchRegex(pattern) {
        const match = this.sourceCode.substr(this.currentPosition).match(pattern);
        if (match && match.index === 0) {
            const value = match[0];
            this.updatePosition(value);
            this.currentPosition += value.length;
            return value;
        }
        return null;
    }
    skipComment() {
        const startIndex = this.currentPosition;
        while (!this.isEOF() && this.matchString(/\*\//) === null) {
            this.updatePosition(this.sourceCode[this.currentPosition]);
        }
        if (this.isEOF()) {
            console.error(`Unterminated comment starting at line ${this.currentLine}, column ${startIndex}`);
        }
    }
    tokenizeIdOrKeyword() {
        const value = this.matchRegex(/^[a-zA-Z][a-zA-Z0-9]*/);
        if (value !== null) {
            return new Token(value.toUpperCase(), value, this.currentLine, this.currentColumn - value.length + 1);
        }
        return null;
    }
    tokenizeNumber() {
        const value = this.matchRegex(/^\d+/);
        if (value !== null) {
            return new Token('NUMBER', value, this.currentLine, this.currentColumn - value.length + 1);
        }
        return null;
    }
    tokenizeString() {
        const value = this.matchRegex(/^"([^"\\]|\\.)*"/);
        if (value !== null) {
            return new Token('STRING', value, this.currentLine, this.currentColumn - value.length + 1);
        }
        return null;
    }
    tokenizeBooleanValue() {
        const value = this.matchRegex(/^(true|false)/);
        if (value !== null) {
            return new Token('BOOLEAN', value, this.currentLine, this.currentColumn - value.length + 1);
        }
        return null;
    }
    tokenizeOperator() {
        const operators = ['==', '!=', '+']; // Add other operators as needed
        for (const operator of operators) {
            const value = this.matchString(new RegExp(`^${operator}`));
            if (value !== null) {
                return new Token('OPERATOR', value, this.currentLine, this.currentColumn - value.length + 1);
            }
        }
        return null;
    }
    tokenizePunctuation() {
        const value = this.matchString(/[{}()=;]/);
        if (value !== null) {
            return new Token('PUNCTUATION', value, this.currentLine, this.currentColumn - value.length + 1);
        }
        return null;
    }
    tokenize() {
        const tokens = [];
        const errors = [];
        while (!this.isEOF()) {
            this.skipWhitespace();
            const startPosition = this.currentPosition;
            let token = this.tokenizeIdOrKeyword() ||
                this.tokenizeNumber() ||
                this.tokenizeString() ||
                this.tokenizeBooleanValue() ||
                this.tokenizeOperator() ||
                this.tokenizePunctuation();
            if (token) {
                tokens.push(token);
            }
            else if (this.matchString(/\/\*/)) {
                this.skipComment();
            }
            else {
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
            outputTextarea.value = errors.map(error => `Error at line ${error.line}, column ${error.column}: ${error.message}`).join('\n');
        }
        return tokens;
    }
}
//# sourceMappingURL=Lexer.js.map