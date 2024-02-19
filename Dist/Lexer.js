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
        let warningExist = false;
        program.forEach(token => {
            if (token.warning) {
                warningExist = true;
                output += `Warning: ${token.warning} at line ${token.position.line}:${token.position.column}\n`;
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
// Function to perform lexical analysis on multiple programs
function lexPrograms(input) {
    const sourceCode = input.trim();
    const programs = [[]];
    let line = 1;
    let column = 1;
    let currentProgramIndex = 0;
    let insideComment = false;
    let insideString = false;
    for (let i = 0; i < sourceCode.length; i++) {
        let currentChar = sourceCode[i];
        if (currentChar === '"') {
            insideString = !insideString;
            continue;
        }
        if (insideString) {
            continue;
        }
        if (insideComment) {
            if (currentChar === '*' && sourceCode[i + 1] === '/') {
                insideComment = false;
                i++; // Skip the closing slash
            }
            continue;
        }
        if (currentChar === '/' && sourceCode[i + 1] === '*') {
            insideComment = true;
            i++; // Skip the asterisk
            continue;
        }
        if (/^[A-Z]+$/.test(currentChar)) {
            programs[currentProgramIndex].push(createErrorToken(currentChar, line, column, "Capital letters are not allowed"));
            continue;
        }
        if (/^[0-9]+$/.test(currentChar)) {
            const { token, newIndex } = readNumberToken(sourceCode, i, line, column);
            programs[currentProgramIndex].push(token);
            i = newIndex;
            continue;
        }
        if (/^[a-z]+$/.test(currentChar)) {
            const { token, newIndex } = readIdentifierOrKeywordToken(sourceCode, i, line, column);
            programs[currentProgramIndex].push(token);
            i = newIndex;
            continue;
        }
        if (currentChar === '$') {
            programs[currentProgramIndex].push({ char: currentChar, type: TokenType.PUNCTUATION, position: { line, column } });
            programs[currentProgramIndex].push({ char: `EOP notation ${currentProgramIndex + 1} found at line ${line}`, type: TokenType.PUNCTUATION, position: { line, column } });
            currentProgramIndex++;
            programs[currentProgramIndex] = [];
            line++;
            column = 1;
            continue;
        }
        const multiCharOperators = ["==", "!=", "+="];
        for (const op of multiCharOperators) {
            if (sourceCode.slice(i, i + op.length) === op) {
                programs[currentProgramIndex].push({ char: op, type: TokenType.PUNCTUATION, position: { line, column } });
                i += op.length - 1;
                continue;
            }
        }
        const punctuationTokens = {
            "{": "Open Block notation",
            "}": "closing Block notation",
            "(": "Open Method notation",
            ")": "Close Method notation",
            "=": "Assignment notation",
            "+": "Addition notation",
            "==": "Equality notation",
            "!=": "Inequality notation",
        };
        if (currentChar in punctuationTokens) {
            const tokenTypeDescription = punctuationTokens[currentChar];
            programs[currentProgramIndex].push({ char: `${currentChar} : ${tokenTypeDescription}`, type: TokenType.PUNCTUATION, position: { line, column } });
            continue;
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
            warning: "Unclosed comment at the end of the source code"
        });
    }
    return programs;
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
// Function to create an error token
function createErrorToken(char, line, column, errorMessage) {
    return {
        char,
        type: TokenType.PUNCTUATION,
        position: { line, column },
        error: `Invalid character "${char}" (${errorMessage})`
    };
}
// Function to read a number token
function readNumberToken(sourceCode, currentIndex, line, column) {
    let index = currentIndex;
    let currentNumber = sourceCode[index];
    let newIndex = index + 1;
    while (/^[0-9]+$/.test(sourceCode[newIndex]) && newIndex < sourceCode.length) {
        currentNumber += sourceCode[newIndex];
        newIndex++;
    }
    return {
        token: { char: currentNumber, type: TokenType.NUMBER, position: { line, column } },
        newIndex: newIndex - 1
    };
}
// Function to read an identifier or keyword token
function readIdentifierOrKeywordToken(sourceCode, currentIndex, line, column) {
    let index = currentIndex;
    let currentToken = sourceCode[index];
    let newIndex = index + 1;
    while (/^[a-z]+$/.test(sourceCode[newIndex]) && newIndex < sourceCode.length) {
        currentToken += sourceCode[newIndex];
        newIndex++;
    }
    const tokenType = isKeyword(currentToken) ? TokenType.KEYWORD : TokenType.ID;
    return {
        token: { char: currentToken, type: tokenType, position: { line, column } },
        newIndex: newIndex - 1
    };
}
// Function to check if a token is a keyword
function isKeyword(token) {
    return keywords.includes(token);
}
// Define the list of keywords
const keywords = ["print", "while", "if", "int", "string", "boolean", "true", "false"];
// Example usage
const input = `/* test case for whilestatement
Prints 23458 */
{
int a
a = 1
{
while (a != 5) {
a = 1 + a
print(a)
}
print(3 + a)
}
}`;
console.log(lex(input));
//# sourceMappingURL=Lexer.js.map