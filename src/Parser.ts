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
    tokens: Token[];
    currentTokenIndex: number;
    currentToken: Token | null;

    constructor(tokens: Token[]) {
        this.tokens = tokens;
        this.currentTokenIndex = 0;
        this.currentToken = this.tokens[this.currentTokenIndex];
    }

    advance() {
        this.currentTokenIndex++;
        this.currentToken = this.tokens[this.currentTokenIndex];
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
    }

    // Grammar Rules
    parseProgram() {
        console.log("Parsing Program...");
        this.parseBlock();
        this.match(TokenType.EoP);
        console.log("Program Parsed Successfully!");
    }

    parseBlock() {
        console.log("Parsing Block...");
        this.match(TokenType.OPENING_BLOCK);
        this.parseStatementList();
        this.match(TokenType.CLOSING_BLOCK);
        console.log("Block Parsed Successfully!");
    }

    parseStatementList() {
        console.log("Parsing Statement List...");
        if (this.currentToken && 
            (this.currentToken.type === TokenType.PrintState ||
             this.currentToken.type === TokenType.ID ||
             this.currentToken.type === TokenType.DTYPE ||
             this.currentToken.type === TokenType.WhileState ||
             this.currentToken.type === TokenType.IfState ||
             this.currentToken.type === TokenType.OPENING_BLOCK)) {
            this.parseStatement();
           
        }
        console.log("Statement List Parsed Successfully!");
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
    }

    parsePrintStatement() {
        console.log("Parsing Print Statement...");
        this.match(TokenType.PrintState);
        this.match(TokenType.PUNCTUATION); // Opening Parenthesis
        this.parseExpr();
        this.match(TokenType.PUNCTUATION); // Closing Parenthesis
        console.log("Print Statement Parsed Successfully!");
    }

    parseAssignmentStatement() {
        console.log("Parsing Assignment Statement...");
        this.match(TokenType.ID);
        this.match(TokenType.Assigment);
        this.parseExpr();
        console.log("Assignment Statement Parsed Successfully!");
    }

    parseVarDecl() {
        console.log("Parsing Variable Declaration...");
        this.match(TokenType.DTYPE);
        this.match(TokenType.ID);
        console.log("Variable Declaration Parsed Successfully!");
    }

    parseWhileStatement() {
        console.log("Parsing While Statement...");
        this.match(TokenType.WhileState);
        this.parseBooleanExpr();
        this.parseBlock();
        console.log("While Statement Parsed Successfully!");
    }

    parseIfStatement() {
        console.log("Parsing If Statement...");
        this.match(TokenType.IfState);
        this.parseBooleanExpr();
        this.parseBlock();
        console.log("If Statement Parsed Successfully!");
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
    }

    parseBooleanExpr() {
        console.log("Parsing Boolean Expression...");
        this.match(TokenType.OPENING_BLOCK);
        this.parseExpr();
        this.match(TokenType.BOOLOP);
        this.parseExpr();
        this.match(TokenType.CLOSING_BLOCK);
        console.log("Boolean Expression Parsed Successfully!");
    }
}

// Example usage
const tokens: Token[] = [
    { char: '{', type: TokenType.OPENING_BLOCK, position: { line: 1, column: 1 }},
    { char: 'print', type: TokenType.PrintState, position: { line: 1, column: 2 }},
    { char: '(', type: TokenType.PUNCTUATION, position: { line: 1, column: 3 }},
    { char: '5', type: TokenType.NUMBER, position: { line: 1, column: 4 }},
    { char: ')', type: TokenType.PUNCTUATION, position: { line: 1, column: 5 }},
    { char: '{', type: TokenType.OPENING_BLOCK, position: { line: 1, column: 6 }},
    { char: 'int', type: TokenType.DTYPE, position: { line: 1, column: 7 }},
    { char: 'x', type: TokenType.ID, position: { line: 1, column: 8 }},
    { char: '=', type: TokenType.Assigment, position: { line: 1, column: 9 }},
    { char: '2', type: TokenType.NUMBER, position: { line: 1, column: 10 }},
    { char: '$', type: TokenType.EoP, position: { line: 1, column: 11 }}
];

const parser = new Parser(tokens);
parser.parseProgram();
