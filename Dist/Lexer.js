// Define the token types
var TokenType;
(function (TokenType) {
    TokenType["ID"] = "ID";
    TokenType["NUMBER"] = "NUMBER";
    TokenType["WHITESPACE"] = "WHITESPACE";
    TokenType["PUNCTUATION"] = "PUNCTUATION";
    TokenType["KEYWORD"] = "KEYWORD";
})(TokenType || (TokenType = {}));
// Function to perform lexical analysis
function lex(input) {
    const programs = lexPrograms(input);
    let output = "";
    programs.forEach((program, index) => {
        output += `Program ${index + 1}:\n`;
        let errorsExist = false;
        let WarningExist = false;
        program.forEach(token => {
            if (token.Warning) {
                WarningExist = true;
                output += `Warning: ${token.Warning} at line ${token.position.line}:${token.position.column}\n`;
            }
            else if (token.error) {
                errorsExist = true;
                output += `Error - ${token.error} at line ${token.position.line}:${token.position.column}\n`;
            }
            else {
                let tokenDescription = "";
                if (token.type === TokenType.KEYWORD) {
                    tokenDescription = `Keyword "${token.char}"`;
                }
                else if (token.type === TokenType.WHITESPACE) {
                    return;
                }
                else {
                    tokenDescription = `Debug-Lexer- [ ${token.char} ], Type: ${token.type}`;
                }
                output += `${tokenDescription}, found at (${token.position.line}:${token.position.column})\n`;
            }
        });
        if (!errorsExist) {
            output += "\n";
        }
    });
    return output;
}
// Function to skip whitespace characters
function skipWhitespace(input, currentIndex) {
    let index = currentIndex;
    while (index < input.length && /\s/.test(input[index])) {
        if (input[index] === '"') {
            const nextQuoteIndex = input.indexOf('"', index + 1);
            if (nextQuoteIndex !== -1) {
                index = nextQuoteIndex + 1;
            }
            else {
                return index;
            }
        }
        else {
            index++;
        }
    }
    return index;
}
// Function to perform lexical analysis on multiple programs
function lexPrograms(input) {
    const sourceCode = input.trim();
    const programs = [[]];
    let line = 1;
    let column = 1;
    let currentProgramIndex = 0;
    let insideComment = false;
    let insideString = false;
    let currentIndex = skipWhitespace(sourceCode, 0);
    if (sourceCode[currentIndex] === '/' && sourceCode[currentIndex + 1] === '*') {
        insideComment = true;
        currentIndex = sourceCode.indexOf('*/', currentIndex + 2);
        if (currentIndex === -1) {
            console.error("ERROR: Unclosed comment");
            return programs;
        }
        currentIndex += 2;
    }
    for (let i = currentIndex; i < sourceCode.length; i++) {
        let currentChar = sourceCode[i];
        if (currentChar === '"') {
            insideString = !insideString;
        }
        if (insideString) {
            continue;
        }
        // Inside the main loop that iterates through the source code character by character
        if (!insideString) {
            // Check for capital letters (errors)
            if (/[A-Z]/.test(currentChar)) {
                programs[currentProgramIndex].push({
                    char: currentChar,
                    type: TokenType.PUNCTUATION,
                    position: { line, column },
                    error: `Invalid character "${currentChar}" (Capital letters are not allowed)`
                });
                continue; // Skip this character
            }
            // Check for numbers
            if (/^[0-9]+$/.test(currentChar)) {
                // Construct the complete number
                let currentNumber = currentChar;
                let j = i + 1;
                while (/^[0-9]+$/.test(sourceCode[j]) && j < sourceCode.length) {
                    currentNumber += sourceCode[j];
                    j++;
                }
                programs[currentProgramIndex].push({
                    char: currentNumber,
                    type: TokenType.NUMBER,
                    position: { line, column }
                });
                i = j - 1; // Move the index to the last digit of the number
                continue; // Skip this number
            }
            // Check for identifiers (IDs)
            if (/^[a-z]+$/.test(currentChar)) {
                // Construct the complete keyword
                let currentKeyword = currentChar;
                let j = i + 1;
                while (/^[a-z]+$/.test(sourceCode[j]) && j < sourceCode.length) {
                    currentKeyword += sourceCode[j];
                    j++;
                }
                // Check if the constructed word is a keyword
                if (isKeyword(currentKeyword)) {
                    // If it's a keyword, treat it as a whole word
                    programs[currentProgramIndex].push({
                        char: currentKeyword,
                        type: TokenType.KEYWORD,
                        position: { line, column }
                    });
                    i = j - 1; // Move the index to the last character of the keyword
                    continue; // Skip this keyword
                }
            }
        }
        // Inside the main loop that iterates through the source code character by character
        if (insideComment) {
            if (currentChar === "*" && sourceCode[i + 1] === "/") {
                insideComment = false; // Exiting comment
                i++; // Skip next character
            }
            continue; // Skip this character
        }
        // Check if current character starts a comment
        if (currentChar === "/" && sourceCode[i + 1] === "*") {
            insideComment = true; // Entering comment
            i++; // Skip next character
            continue; // Skip this character
        }
        const multiCharOperators = ["==", "!=", "+="]; // Add other multi-character operators as needed
        for (const op of multiCharOperators) {
            if (sourceCode.slice(i, i + op.length) === op) {
                programs[currentProgramIndex].push({
                    char: op,
                    type: TokenType.PUNCTUATION,
                    position: { line, column }
                });
                i += op.length - 1; // Move the index past the operator
                continue; // Skip this operator
            }
        }
        if (currentChar === "{") {
            programs[currentProgramIndex].push({
                char: `${currentChar} : Open Block notation ${currentProgramIndex + 1} found at line ${line}`,
                type: TokenType.PUNCTUATION,
                position: { line, column }
            });
        }
        else if (currentChar === "}") {
            programs[currentProgramIndex].push({
                char: `${currentChar} : closing Block notation ${currentProgramIndex + 1} found at line ${line}`,
                type: TokenType.PUNCTUATION,
                position: { line, column }
            });
        }
        else if (currentChar === "(") {
            programs[currentProgramIndex].push({
                char: `${currentChar} : Open Method notation ${currentProgramIndex + 1} found at line ${line}`,
                type: TokenType.PUNCTUATION,
                position: { line, column }
            });
        }
        else if (currentChar === ")") {
            programs[currentProgramIndex].push({
                char: `${currentChar} : Close Method notation ${currentProgramIndex + 1} found at line ${line}`,
                type: TokenType.PUNCTUATION,
                position: { line, column }
            });
        }
        else if (currentChar === "=") {
            programs[currentProgramIndex].push({
                char: `${currentChar} : Assignment notation ${currentProgramIndex + 1} found at line ${line}`,
                type: TokenType.PUNCTUATION,
                position: { line, column }
            });
        }
        else if (currentChar === "+") {
            programs[currentProgramIndex].push({
                char: `${currentChar} : Addition notation ${currentProgramIndex + 1} found at line ${line}`,
                type: TokenType.PUNCTUATION,
                position: { line, column }
            });
        }
        else if (currentChar === "==") {
            programs[currentProgramIndex].push({
                char: `${currentChar} : Equality notation ${currentProgramIndex + 1} found at line ${line}`,
                type: TokenType.PUNCTUATION,
                position: { line, column }
            });
        }
        else if (currentChar === "!=") {
            programs[currentProgramIndex].push({
                char: `${currentChar} : Inequality notation ${currentProgramIndex + 1} found at line ${line}`,
                type: TokenType.PUNCTUATION,
                position: { line, column }
            });
        }
        else if (currentChar === '"') {
            const remainingSource = sourceCode.slice(i);
            const closingIndex = remainingSource.indexOf('"');
            if (closingIndex === -1) {
                programs[currentProgramIndex].push({
                    char: currentChar,
                    type: TokenType.PUNCTUATION,
                    position: { line, column },
                    Warning: "Unclosed quote"
                });
            }
        }
        else if (currentChar === '/') {
            if (sourceCode[i + 1] === '*') {
                insideComment = true;
                i++;
                continue;
            }
        }
        if (currentChar === "$") {
            programs[currentProgramIndex].push({
                char: currentChar,
                type: TokenType.PUNCTUATION,
                position: { line, column }
            });
            programs[currentProgramIndex].push({
                char: `EOP notation ${currentProgramIndex + 1} found at line ${line}`,
                type: TokenType.PUNCTUATION,
                position: { line, column }
            });
            currentProgramIndex++;
            programs[currentProgramIndex] = [];
            line++;
            column = 1;
            continue;
        }
        let currentToken = '';
        while (/[a-zA-Z0-9]/.test(currentChar) && i < sourceCode.length) {
            currentToken += currentChar;
            i++;
            currentChar = sourceCode[i];
        }
        const tokenType = getTokenType(currentToken, sourceCode, i);
        // If it's a keyword, treat it as a whole word
        if (tokenType === TokenType.KEYWORD) {
            programs[currentProgramIndex].push({
                char: currentToken,
                type: tokenType,
                position: { line, column }
            });
        }
        else {
            // Otherwise, treat each character individually
            for (let char of currentToken) {
                programs[currentProgramIndex].push({
                    char,
                    type: TokenType.ID,
                    position: { line, column }
                });
            }
        }
        if (currentChar === "\n") {
            line++;
            column = 1;
        }
        else {
            column++;
        }
    }
    if (insideComment) {
        programs[currentProgramIndex].push({
            char: "",
            type: TokenType.PUNCTUATION,
            position: { line, column },
            Warning: "Unclosed comment at the end of the source code"
        });
    }
    return programs;
}
// Function to determine token type
function getTokenType(token, sourceCode, currentIndex) {
    if (isKeyword(token)) {
        return TokenType.KEYWORD;
    }
    if (/^[0-9]+$/.test(token)) {
        return TokenType.NUMBER;
    }
    if (/^\s+$/.test(token)) {
        return TokenType.WHITESPACE;
    }
    if (/^(""|\(\)|==|!=|\+|\{\}|\$)$/.test(token)) {
        return TokenType.PUNCTUATION;
    }
    if (/^[a-z]+$/.test(token)) {
        return TokenType.ID;
    }
    if (/^"([a-z\s]*)"$/.test(token)) {
        return TokenType.ID;
    }
    return TokenType.ID;
}
// Function to check if a token is a keyword
function isKeyword(token) {
    return keywords.includes(token);
}
// Define the list of keywords
const keywords = ["print", "while", "if", "int", "string", "boolean", "true", "false"];
//# sourceMappingURL=Lexer.js.map