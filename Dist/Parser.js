// Function to perform parsing
function parse(tokens) {
    const astNodes = [];
    tokens.forEach(program => {
        const programAST = parseProgram(program);
        astNodes.push(programAST);
    });
    return astNodes;
}
// Function to parse a program
function parseProgram(program) {
    const block = parseBlock(program);
    return block;
}
// Function to parse a block
function parseBlock(program) {
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
function parseStatementList(tokens) {
    const statements = [];
    while (tokens.length > 0) {
        const statementEndIndex = tokens.findIndex(token => token.char === ",");
        const statementTokens = statementEndIndex === -1 ? tokens : tokens.slice(0, statementEndIndex);
        const statement = parseStatement(statementTokens);
        statements.push(statement);
        if (statementEndIndex === -1)
            break; // No more statements
        tokens = tokens.slice(statementEndIndex + 1).filter(token => token.char !== "space");
    }
    return statements;
}
// Function to parse a statement
function parseStatement(tokens) {
    if (tokens.length === 0) {
        // Handle error: Empty statement
        return { type: "ErrorNode", message: "Empty statement" };
    }
    const firstToken = tokens[0];
    if (firstToken.char === "print") {
        return parsePrintStatement(tokens);
    }
    else if (firstToken.char === "int" || firstToken.char === "string" || firstToken.char === "boolean") {
        return parseVarDecl(tokens);
    }
    else if (firstToken.char === "while") {
        return parseWhileStatement(tokens);
    }
    else if (firstToken.char === "if") {
        return parseIfStatement(tokens);
    }
    else if (firstToken.char === "{") {
        return parseBlock(tokens);
    }
    else if (tokens.find(token => token.char === "=")) {
        return parseAssignmentStatement(tokens);
    }
    else {
        // Handle error: Invalid statement
        return { type: "ErrorNode", message: "Invalid statement" };
    }
}
// Function to parse a print statement
function parsePrintStatement(tokens) {
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
function parseAssignmentStatement(tokens) {
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
function parseVarDecl(tokens) {
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
function parseWhileStatement(tokens) {
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
function parseIfStatement(tokens) {
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
function parseExpr(tokens) {
    // Implement parsing logic for expressions
}
// Function to parse a boolean expression
function parseBooleanExpr(tokens) {
    // Implement parsing logic for boolean expressions
}
//# sourceMappingURL=Parser.js.map