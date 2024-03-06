// Define the token types
var TokenType;
(function (TokenType) {
    TokenType["PARSER_ID"] = "ID";
    TokenType["PARSER_NUMBER"] = "NUMBER";
    TokenType["PARSER_WHITESPACE"] = "WHITESPACE";
    TokenType["PARSER_PUNCTUATION"] = "PUNCTUATION";
    TokenType["PARSER_KEYWORD"] = "KEYWORD";
    TokenType["PARSER_STRING"] = "STRING";
    TokenType["PARSER_OPENING_BLOCK"] = "Opening Block";
    TokenType["PARSER_CLOSING_BLOCK"] = "Closing Block";
    TokenType["PARSER_DTYPE"] = "DataType";
    TokenType["PARSER_BOOLOP"] = "Boolean Operator";
    TokenType["PARSER_BOOLVAL"] = "Boolean value";
    TokenType["PARSER_INTOP"] = "Additition Sign";
    TokenType["PARSER_WhileState"] = "While Statement";
    TokenType["PARSER_PrintState"] = "Print Statement";
    TokenType["PARSER_IfState"] = "If statement";
    TokenType["PARSER_Assigment"] = "Equal Sign";
    TokenType["PARSER_EoP"] = "End of program";
})(TokenType || (TokenType = {}));
class Parser {
    tokens;
    tokenTypes;
    currentProgramIndex;
    currentTokenIndex;
    currentToken;
    constructor(tokens) {
        this.tokens = tokens;
        this.currentProgramIndex = 0;
        this.currentTokenIndex = 0;
        this.currentToken = this.tokens[this.currentProgramIndex][this.currentTokenIndex];
        this.tokenTypes = this.extractTokenTypes(tokens);
    }
    // Helper function to extract token types from the token stream
    extractTokenTypes(tokens) {
        const tokenTypes = [];
        for (const programTokens of tokens) {
            for (const token of programTokens) {
                tokenTypes.push(token.type);
            }
        }
        return tokenTypes;
    }
    advance() {
        // Move to the next token within the current program
        this.currentTokenIndex++;
        // If reached the end of the current program, move to the next program if available
        if (this.currentTokenIndex >= this.tokens[this.currentProgramIndex].length) {
            this.currentProgramIndex++;
            this.currentTokenIndex = 0;
        }
        // If reached the end of all programs, set currentToken to null
        if (this.currentProgramIndex >= this.tokens.length) {
            this.currentToken = null;
        }
        else {
            this.currentToken = this.tokens[this.currentProgramIndex][this.currentTokenIndex];
        }
    }
    match(tokenType) {
        if (this.currentToken && this.currentToken.type === tokenType) {
            this.advance();
        }
        else {
            this.error(`Expected ${tokenType} but found ${this.currentToken?.type}`);
        }
    }
    error(message) {
        console.error(`Parsing Error: ${message}`);
        console.log(this.currentToken);
    }
    // Grammar Rules
    parseProgram() {
        console.log("Parsing Program...");
        while (this.currentToken && this.currentToken.type === TokenType.OPENING_BLOCK) {
            this.parseBlock();
        }
        // Check for end-of-program token
        if (this.currentToken && this.currentToken.type === TokenType.PARSER_EoP) {
            console.log("Program Parsed Successfully!");
        }
        else {
            this.error("Expected End of Program");
        }
    }
    parseBlock() {
        console.log("Parsing Block...");
        this.match(TokenType.OPENING_BLOCK);
        this.parseStatementList();
        this.match(TokenType.CLOSING_BLOCK);
        console.log("Block Parsed Successfully!");
        console.log(this.currentToken);
    }
    parseStatementList() {
        console.log("Parsing Statement List...");
        while (this.currentToken &&
            (this.currentToken.type === TokenType.PrintState ||
                this.currentToken.type === TokenType.ID ||
                this.currentToken.type === TokenType.DTYPE ||
                this.currentToken.type === TokenType.WhileState ||
                this.currentToken.type === TokenType.IfState ||
                this.currentToken.type === TokenType.OPENING_BLOCK)) {
            this.parseStatement();
        }
        console.log("Statement List Parsed Successfully!");
        console.log(this.currentToken);
    }
    parseStatement() {
        console.log("Parsing Statement...");
        switch (this.currentToken?.type) {
            case TokenType.PrintState:
                this.parsePrintStatement();
                break;
            case TokenType.ID:
                this.parseAssignmentStatement();
                break;
            case TokenType.DTYPE:
                this.parseVarDecl();
                break;
            case TokenType.WhileState:
                this.parseWhileStatement();
                break;
            case TokenType.IfState:
                this.parseIfStatement();
                break;
            case TokenType.OPENING_BLOCK:
                this.parseBlock();
                break;
            default:
                this.error("Invalid Statement");
        }
        console.log("Statement Parsed Successfully!");
        console.log(this.currentToken);
    }
    parsePrintStatement() {
        console.log("Parsing Print Statement...");
        this.match(TokenType.PrintState);
        this.match(TokenType.PUNCTUATION); // Opening Parenthesis
        this.parseExpr();
        this.match(TokenType.PUNCTUATION); // Closing Parenthesis
        console.log("Print Statement Parsed Successfully!");
        console.log(this.currentToken);
    }
    parseAssignmentStatement() {
        console.log("Parsing Assignment Statement...");
        this.match(TokenType.ID);
        this.match(TokenType.Assigment);
        this.parseExpr();
        console.log("Assignment Statement Parsed Successfully!");
        console.log(this.currentToken);
    }
    parseVarDecl() {
        console.log("Parsing Variable Declaration...");
        this.match(TokenType.DTYPE);
        this.match(TokenType.ID);
        console.log("Variable Declaration Parsed Successfully!");
        console.log(this.currentToken);
    }
    parseWhileStatement() {
        console.log("Parsing While Statement...");
        this.match(TokenType.WhileState);
        this.parseBooleanExpr();
        this.parseBlock();
        console.log("While Statement Parsed Successfully!");
        console.log(this.currentToken);
    }
    parseIfStatement() {
        console.log("Parsing If Statement...");
        this.match(TokenType.IfState);
        this.parseBooleanExpr();
        this.parseBlock();
        console.log("If Statement Parsed Successfully!");
        console.log(this.currentToken);
    }
    parseExpr() {
        console.log("Parsing Expression...");
        if (this.currentToken &&
            (this.currentToken.type === TokenType.NUMBER ||
                this.currentToken.type === TokenType.STRING ||
                this.currentToken.type === TokenType.BOOLVAL ||
                this.currentToken.type === TokenType.ID)) {
            this.advance();
        }
        else {
            this.error("Invalid Expression");
        }
        console.log("Expression Parsed Successfully!");
        console.log(this.currentToken);
    }
    parseBooleanExpr() {
        console.log("Parsing Boolean Expression...");
        this.match(TokenType.OPENING_BLOCK);
        this.parseExpr();
        this.match(TokenType.BOOLOP);
        this.parseExpr();
        this.match(TokenType.CLOSING_BLOCK);
        console.log("Boolean Expression Parsed Successfully!");
        console.log(this.currentToken);
    }
}
;
//# sourceMappingURL=Parser.js.map