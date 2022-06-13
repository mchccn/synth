// I'm sad GitHub doesn't count .d.ts files as TypeScript
// I understand the premise and reasoning behind it, but...
// I can't help but feel that I am missing out on at least
// a thousand lines of .d.ts with this project

// Prettier does not currently support `infer X extends Y`
// which is why I am still using intersections with inferences

// Utility types

type UnknownArray = ReadonlyArray<unknown>;

type Split<Input extends string, Separator extends string = ""> = Input extends ""
    ? []
    : Input extends `${infer Start}${Separator}${infer End}`
    ? [Start, ...Split<End, Separator>]
    : [Input];

type StringLength<T extends string> = Split<T>["length"];

type Increment<N extends UnknownArray> = [...N, unknown];

// Simple Definitions

type TokenType<T extends string> = `tokentype${T}`;

type Token<Type extends string = string, Lexeme extends string = string> = Extract<
    | { lexeme: string; type: TokenType<"leftparen"> }
    | { lexeme: string; type: TokenType<"rightparen"> }
    | { lexeme: string; type: TokenType<"leftbrace"> }
    | { lexeme: string; type: TokenType<"rightbrace"> }
    | { lexeme: string; type: TokenType<"leftbracket"> }
    | { lexeme: string; type: TokenType<"rightbracket"> }
    | { lexeme: string; type: TokenType<"colon"> }
    | { lexeme: string; type: TokenType<"semicolon"> }
    | { lexeme: string; type: TokenType<"comma"> }
    | { lexeme: string; type: TokenType<"questionmark"> }
    | { lexeme: string; type: TokenType<"minus"> }
    | { lexeme: string; type: TokenType<"true"> }
    | { lexeme: string; type: TokenType<"false"> }
    | { lexeme: string; type: TokenType<"stringliteral"> }
    | { lexeme: string; type: TokenType<"regexstringliteral"> }
    | { lexeme: string; type: TokenType<"sourcestringliteral"> }
    | { lexeme: string; type: TokenType<"numberliteral"> }
    | { lexeme: string; type: TokenType<"identifier"> }
    | { lexeme: string; type: TokenType<"comment"> }
    | { lexeme: string; type: TokenType<"eof"> }
    | { type: TokenType<"marker"> },
    { type: Type }
> & { lexeme: Lexeme };

// Mappings

type ScannerKeywords = {
    true: TokenType<"true">;
    false: TokenType<"false">;
};

type ScannerDigitsForBase = {
    b: "0" | "1";
    o: "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7";
    x:
        | "0"
        | "1"
        | "2"
        | "3"
        | "4"
        | "5"
        | "6"
        | "7"
        | "8"
        | "9"
        | "a"
        | "b"
        | "c"
        | "d"
        | "e"
        | "f"
        | "A"
        | "B"
        | "C"
        | "D"
        | "E"
        | "F";
} & {
    // Defaults to decimal
    [key: string]: "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
};

// Actual parsing shit

type ScanTokens<Source extends string, Tokens extends Token[] = []> = Source extends ""
    ? Tokens // Empty source results in scanned tokens
    : // Add 1 to Current
    Source extends `${infer Character}${infer RestOfSource}` // const c = this.#advance();
    ? // readonly #lexmap = new Map(...)
      Character extends " " | "\r" | "\t" | "\v" | "\f" | "\n"
        ? ScanTokens<RestOfSource, Tokens>
        : Character extends "("
        ? ScanTokens<RestOfSource, [...Tokens, Token<TokenType<"leftparen">>]>
        : Character extends ")"
        ? ScanTokens<RestOfSource, [...Tokens, Token<TokenType<"rightparen">>]>
        : Character extends "["
        ? ScanTokens<RestOfSource, [...Tokens, Token<TokenType<"leftbrace">>]>
        : Character extends "]"
        ? ScanTokens<RestOfSource, [...Tokens, Token<TokenType<"rightbrace">>]>
        : Character extends "{"
        ? ScanTokens<RestOfSource, [...Tokens, Token<TokenType<"leftbracket">>]>
        : Character extends "}"
        ? ScanTokens<RestOfSource, [...Tokens, Token<TokenType<"rightbracket">>]>
        : Character extends ":"
        ? ScanTokens<RestOfSource, [...Tokens, Token<TokenType<"colon">>]>
        : Character extends ";"
        ? ScanTokens<RestOfSource, [...Tokens, Token<TokenType<"semicolon">>]>
        : Character extends ","
        ? ScanTokens<RestOfSource, [...Tokens, Token<TokenType<"comma">>]>
        : Character extends "?"
        ? ScanTokens<RestOfSource, [...Tokens, Token<TokenType<"questionmark">>]>
        : Character extends "-"
        ? ScanTokens<RestOfSource, [...Tokens, Token<TokenType<"minus">>]>
        : Character extends '"' | "'"
        ? ExtractString<RestOfSource, Character, TokenType<"stringliteral">> extends [
              infer NewRestOfSource,
              infer ExtractedString,
          ]
            ? ScanTokens<
                  NewRestOfSource & string,
                  [...Tokens, Token<TokenType<"stringliteral">, ExtractedString & string>]
              >
            : never
        : Character extends "#"
        ? // Skip the comment and get new Source and Current values
          SkipComments<RestOfSource> extends [infer NewRestOfSource]
            ? ScanTokens<NewRestOfSource & string, Tokens>
            : never
        : // Past the lexmap now
        IsDigit<Character> extends true
        ? RestOfSource extends `${infer NumericBase}${infer RestOfSource}`
            ? NumericBase extends keyof ScannerDigitsForBase // Is the base even valid
                ? Character extends "0" // Only 0 can be the first character of a number literal with a base
                    ? ExtractNumber<RestOfSource, ScannerDigitsForBase[NumericBase]> extends [
                          infer NewRestOfSource,
                          infer ExtractedNumber,
                      ]
                        ? ScanTokens<
                              NewRestOfSource & string,
                              [...Tokens, Token<TokenType<"numberliteral">, ExtractedNumber & string>]
                          >
                        : never
                    : never
                : never
            : ExtractNumber<RestOfSource, ScannerDigitsForBase[string]> extends [
                  infer NewRestOfSource,
                  infer ExtractedNumber,
              ]
            ? ScanTokens<
                  NewRestOfSource & string,
                  [...Tokens, Token<TokenType<"numberliteral">, ExtractedNumber & string>]
              >
            : never
        : never // Continue implementing (src/core/base/scanner.ts line 83) ...
    : never; // Should never happen because we check if Current is past the Source length

type SkipComments<Source extends string> = Source extends ""
    ? [""]
    : Source extends `${infer IsThisANewLine}${infer RestOfSource}`
    ? IsThisANewLine extends "\n"
        ? [RestOfSource]
        : SkipComments<RestOfSource>
    : never;

type ExtractString<
    Source extends string,
    QuoteToStopAt extends string,
    StringType extends string,
    LastChar extends string = "",
    ResultingString extends string = "",
> = Source extends ""
    ? never
    : Source extends `${infer Character}${infer RestOfSource}`
    ? LastChar extends "\\"
        ? ExtractString<RestOfSource, QuoteToStopAt, StringType, Character, `${ResultingString}${Character}`>
        : Character extends QuoteToStopAt
        ? [RestOfSource, `${QuoteToStopAt}${ResultingString}${QuoteToStopAt}`]
        : ExtractString<RestOfSource, QuoteToStopAt, StringType, Character, `${ResultingString}${Character}`>
    : never; // Should never happen because we check if Source is empty

type ExtractNumber<
    Source extends string,
    AllowedDigits extends string,
    LastChar extends string = "",
    ResultingNumber extends string = "",
> = 0;

type IsDigit<Character extends string> = Character extends "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"
    ? true
    : false;

// Debugging

type OnlyTokenTypes<T> = {
    [K in keyof T]: T[K] extends Token<infer Type> ? (Type extends TokenType<infer S> ? S : never) : T[K];
};

type T01 = OnlyTokenTypes<ScanTokens<`()[]{}:;,?- "" # o k`>>;

type T02 = ScanTokens<`( 'i\\'m kelly' )`>;
