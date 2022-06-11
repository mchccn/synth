export enum TokenType {
    // Function calls, operator associativity
    LeftParen,
    RightParen,

    // Arrays, indexing, slicing
    LeftBrace,
    RightBrace,

    // Begin scope, end scope
    LeftBracket,
    RightBracket,

    // Assignment
    Colon,

    // End of property definition
    Semicolon,

    // Separate function arguments
    Comma,

    // Mark property or type as optional
    QuestionMark,

    // Subtract numbers, negation operator
    Minus,

    // Boolean literals
    True,
    False,

    // String literals
    StringLiteral,
    RegexStringLiteral,
    SourceStringLiteral,

    // Number literals, can be hex, octal, binary or decimal
    NumberLiteral,

    // Identifiers
    Identifier,

    // Comments
    Comment,

    // End of file
    Eof,

    // Marker for use by errors
    Marker,
}
