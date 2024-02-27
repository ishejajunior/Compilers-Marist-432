// Define the AST node types
interface ASTNode {
    type: string;
}

interface NumberNode extends ASTNode {
    type: "NumberNode";
    value: number;
}

interface IdentifierNode extends ASTNode {
    type: "IdentifierNode";
    value: string;
}

interface AssignmentNode extends ASTNode {
    type: "AssignmentNode";
    identifier: IdentifierNode;
    expression: ASTNode;
}

interface ExpressionNode extends ASTNode {
    type: "ExpressionNode";
    operator: string;
    left: ASTNode;
    right: ASTNode;
}

interface PrintStatementNode extends ASTNode {
    type: "PrintStatementNode";
    expression: ASTNode;
}

interface VarDeclNode extends ASTNode {
    type: "VarDeclNode";
    typeSpecifier: string;
    identifier: IdentifierNode;
}

interface WhileStatementNode extends ASTNode {
    type: "WhileStatementNode";
    condition: ASTNode;
    block: ASTNode;
}

interface IfStatementNode extends ASTNode {
    type: "IfStatementNode";
    condition: ASTNode;
    block: ASTNode;
}

interface BlockNode extends ASTNode {
    type: "BlockNode";
    statements: ASTNode[]; // This should be an array of ASTNode
}

interface BooleanExprNode extends ASTNode {
    type: "BooleanExprNode";
    operator: string;
    left: ASTNode;
    right: ASTNode;
}

// Function to perform parsing
function parse(tokens: Token[][]): ASTNode[] {
    const astNodes: ASTNode[] = [];

    tokens.forEach(program => {
        const programAST = parseProgram(program);
        astNodes.push(programAST);
    });

    return astNodes;
}

// Function to parse a program
function parseProgram(program: Token[]): ASTNode {
    const block = parseBlock(program);
    return block;
}

// Function to parse a block
function parseBlock(program: Token[]): ASTNode {
    const blockStartIndex = program.findIndex(token => token.char === "{");
    const blockEndIndex = program.findIndex(token => token.char === "}");

    if (blockStartIndex === -1 || blockEndIndex === -1) {
        // Handle error: Missing curly braces for block
        return { type: "ErrorNode", message: "Missing curly braces for block" };
    }

    const statementList = parseStatementList(program.slice(blockStartIndex + 1, blockEndIndex));
    return { type: "BlockNode", statements: statementList };
}

// Function to parse a statement list
function parseStatementList(tokens: Token[]): ASTNode[] {
    const statements: ASTNode[] = [];

    while (tokens.length > 0) {
        const statementEndIndex = tokens.findIndex(token => token.char === ",");
        const statementTokens = statementEndIndex === -1 ? tokens : tokens.slice(0, statementEndIndex);
        const statement = parseStatement(statementTokens);

        statements.push(statement);

        if (statementEndIndex === -1) break; // No more statements
        tokens = tokens.slice(statementEndIndex + 1).filter(token => token.char !== "space");
    }

    return statements;
}

// Function to parse a statement
function parseStatement(tokens: Token[]): ASTNode {
    if (tokens.length === 0) {
        // Handle error: Empty statement
        return { type: "ErrorNode", message: "Empty statement" };
    }

    const firstToken = tokens[0];

    if (firstToken.char === "print") {
        return parsePrintStatement(tokens);
    } else if (firstToken.char === "int" || firstToken.char === "string" || firstToken.char === "boolean") {
        return parseVarDecl(tokens);
    } else if (firstToken.char === "while") {
        return parseWhileStatement(tokens);
    } else if (firstToken.char === "if") {
        return parseIfStatement(tokens);
    } else if (firstToken.char === "{") {
        return parseBlock(tokens);
    } else if (tokens.find(token => token.char === "=")) {
        return parseAssignmentStatement(tokens);
    } else {
        // Handle error: Invalid statement
        return { type: "ErrorNode", message: "Invalid statement" };
    }
}

// Function to parse a print statement
function parsePrintStatement(tokens: Token[]): ASTNode {
    const exprStartIndex = tokens.findIndex(token => token.char === "(");
    const exprEndIndex = tokens.findIndex(token => token.char === ")");

    if (exprStartIndex === -1 || exprEndIndex === -1 || exprStartIndex > exprEndIndex) {
        // Handle error: Malformed print statement
        return { type: "ErrorNode", message: "Malformed print statement" };
    }

    const exprTokens = tokens.slice(exprStartIndex + 1, exprEndIndex);
    const expr = parseExpr(exprTokens);
    return { type: "PrintStatementNode", expression: expr };
}

// Function to parse an assignment statement
function parseAssignmentStatement(tokens: Token[]): ASTNode {
    const equalIndex = tokens.findIndex(token => token.char === "=");

    if (equalIndex === -1 || equalIndex === 0 || equalIndex === tokens.length - 1) {
        // Handle error: Malformed assignment statement
        return { type: "ErrorNode", message: "Malformed assignment statement" };
    }

    const idToken = tokens[equalIndex - 1];
    const exprTokens = tokens.slice(equalIndex + 1);
    const id = { type: "IdentifierNode", value: idToken.char };
    const expr = parseExpr(exprTokens);

    return { type: "AssignmentStatementNode", identifier: id, expression: expr };
}

// Function to parse a variable declaration
function parseVarDecl(tokens: Token[]): ASTNode {
    if (tokens.length < 2) {
        // Handle error: Malformed variable declaration
        return { type: "ErrorNode", message: "Malformed variable declaration" };
    }

    const typeToken = tokens[0];
    const idToken = tokens[1];
    const id = { type: "IdentifierNode", value: idToken.char };

    return { type: "VarDeclNode", typeSpecifier: typeToken.char, identifier: id };
}

// Function to parse a while statement
function parseWhileStatement(tokens: Token[]): ASTNode {
    const boolExprStartIndex = tokens.findIndex(token => token.char === "(");
    const boolExprEndIndex = tokens.findIndex(token => token.char === ")");
    const blockStartIndex = tokens.findIndex(token => token.char === "{");
    const blockEndIndex = tokens.findIndex(token => token.char === "}");

    if (boolExprStartIndex === -1 || boolExprEndIndex === -1 || blockStartIndex === -1 || blockEndIndex === -1) {
        // Handle error: Malformed while statement
        return { type: "ErrorNode", message: "Malformed while statement" };
    }

    const boolExprTokens = tokens.slice(boolExprStartIndex + 1, boolExprEndIndex);
    const blockTokens = tokens.slice(blockStartIndex + 1, blockEndIndex);
    const boolExpr = parseBooleanExpr(boolExprTokens);
    const block = parseBlock(blockTokens);

    return { type: "WhileStatementNode", condition: boolExpr, block };
}

// Function to parse an if statement
function parseIfStatement(tokens: Token[]): ASTNode {
    const boolExprStartIndex = tokens.findIndex(token => token.char === "(");
    const boolExprEndIndex = tokens.findIndex(token => token.char === ")");
    const blockStartIndex = tokens.findIndex(token => token.char === "{");
    const blockEndIndex = tokens.findIndex(token => token.char === "}");

    if (boolExprStartIndex === -1 || boolExprEndIndex === -1 || blockStartIndex === -1 || blockEndIndex === -1) {
        // Handle error: Malformed if statement
        return { type: "ErrorNode", message: "Malformed if statement" };
    }

    const boolExprTokens = tokens.slice(boolExprStartIndex + 1, boolExprEndIndex);
    const blockTokens = tokens.slice(blockStartIndex + 1, blockEndIndex);
    const boolExpr = parseBooleanExpr(boolExprTokens);
    const block = parseBlock(blockTokens);

    return { type: "IfStatementNode", condition: boolExpr, block };
}

// Function to parse an expression
function parseExpr(tokens: Token[]): ASTNode {
    // Implement parsing logic for expressions
}

// Function to parse a boolean expression
function parseBooleanExpr(tokens: Token[]): ASTNode {
    // Implement parsing logic for boolean expressions
}
