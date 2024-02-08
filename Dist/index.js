function selectTestCase(testCase) {
    // Update input based on the selected test case
    var inputTextarea = document.getElementById("inputTextarea");

    switch (testCase) {
        case 'TestCase1':
            inputTextarea.value = `
/* Test case for WhileStatement.
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
            break;
        case 'TestCase2':
            inputTextarea.value = "Test Case 2 input text";
            break;
        // Add more cases as needed
        default:
            inputTextarea.value = "";
    }
}



function executeCode() {
    // Read input from the input textarea
    var inputTextarea = document.getElementById("inputTextarea");
    var input = inputTextarea.value;

    // Create a new Lexer instance and tokenize the input
    var lexer = new Lexer(input);
    var tokens = lexer.tokenize();

    // Display the tokens in the output textarea
    var outputTextarea = document.getElementById("outputTextarea");
    outputTextarea.value = JSON.stringify(tokens, null, 2);
}
