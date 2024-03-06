interface Token {
    char: string;
    type: TokenType;
    position: { line: number; column: number };
    error?: string; 
    warning?: string;
}

// Define the token types
enum TokenType {
    PARSER_ID = "ID",
    PARSER_NUMBER = "NUMBER",
    PARSER_WHITESPACE = "WHITESPACE",
    PARSER_PUNCTUATION = "PUNCTUATION",
    PARSER_KEYWORD = "KEYWORD",
    PARSER_STRING = "STRING",
    PARSER_OPENING_BLOCK = "Opening Block",
    PARSER_CLOSING_BLOCK = "Closing Block",
    PARSER_DTYPE = "DataType",
    PARSER_BOOLOP = "Boolean Operator",
    PARSER_BOOLVAL = "Boolean value",
    PARSER_INTOP = "Additition Sign",
    PARSER_WhileState = "While Statement",
    PARSER_PrintState = "Print Statement",
    PARSER_IfState = "If statement",
    PARSER_Assigment = "Equal Sign",
    PARSER_EoP = "End of program"
}


class Parser {
    tokens: Token[][];
    tokenTypes: TokenType[];
    currentProgramIndex: number;
    currentTokenIndex: number;
    currentToken: Token | null;

    constructor(tokens: Token[][]) {
        this.tokens = tokens;
        this.currentProgramIndex = 0;
        this.currentTokenIndex = 0;
        this.currentToken = this.tokens[this.currentProgramIndex][this.currentTokenIndex];
        this.tokenTypes = this.extractTokenTypes(tokens);
    }

    // Helper function to extract token types from the token stream
    extractTokenTypes(tokens: Token[][]): TokenType[] {
        const tokenTypes: TokenType[] = [];
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
        } else {
            this.currentToken = this.tokens[this.currentProgramIndex][this.currentTokenIndex];
        }
    }
    match(tokenType: TokenType) {
        if (this.currentToken && this.currentToken.type === tokenType) {
            this.advance();
        } else {
            this.error(`Expected ${tokenType} but found ${this.currentToken?.type}`);
        }
    }

    error(message: string) {
        console.error(`Parsing Error: ${message}`);
        console.log(this.currentToken)
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
        } else {
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
        } else {
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
};

