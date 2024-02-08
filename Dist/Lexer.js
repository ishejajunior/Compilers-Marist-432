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
    match(pattern) {
        const match = this.sourceCode.substr(this.currentPosition).match(pattern);
        if (match && match.index === 0) {
            const value = match[0];
            this.updatePosition(value);
            this.currentPosition += value.length;
            return value;
        }
        return null;
    }
    skipWhitespace() {
        this.match(/^\s+/);
    }
    tokenizeId() {
        const value = this.match(/^[a-zA-Z]+/);
        if (value !== null) {
            return new Token('ID', value, this.currentLine, this.currentColumn - value.length + 1);
        }
        return null;
    }
    tokenizeNumber() {
        const value = this.match(/^\d+/);
        if (value !== null) {
            return new Token('NUMBER', value, this.currentLine, this.currentColumn - value.length + 1);
        }
        return null;
    }
    // Implement other tokenization methods similarly
    tokenize() {
        const tokens = [];
        const errors = [];
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
            outputTextarea.value = errors.map(error => `Error at line ${error.line}, column ${error.column}: ${error.message}`).join('\n');
        }
        return tokens;
    }
}
//# sourceMappingURL=Lexer.js.map