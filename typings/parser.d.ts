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

type DecimalDigit = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";

type LowercaseAlphabet =
    | "a"
    | "b"
    | "c"
    | "d"
    | "e"
    | "f"
    | "g"
    | "h"
    | "i"
    | "j"
    | "k"
    | "l"
    | "m"
    | "n"
    | "o"
    | "p"
    | "q"
    | "r"
    | "s"
    | "t"
    | "u"
    | "v"
    | "w"
    | "x"
    | "y"
    | "z";

type UppercaseAlphabet =
    | "A"
    | "B"
    | "C"
    | "D"
    | "E"
    | "F"
    | "G"
    | "H"
    | "I"
    | "J"
    | "K"
    | "L"
    | "M"
    | "N"
    | "O"
    | "P"
    | "Q"
    | "R"
    | "S"
    | "T"
    | "U"
    | "V"
    | "W"
    | "X"
    | "Y"
    | "Z";

// Simple Definitions

type Token<Type extends TokenType = TokenType, Lexeme extends string = string> = { type: Type; lexeme: Lexeme };

type TokenType =
    | "leftparen"
    | "rightparen"
    | "leftbrace"
    | "rightbrace"
    | "leftbracket"
    | "rightbracket"
    | "colon"
    | "semicolon"
    | "comma"
    | "questionmark"
    | "minus"
    | "true"
    | "false"
    | "stringliteral"
    | "regexstringliteral"
    | "sourcestringliteral"
    | "numberliteral"
    | "identifier";

// Mappings

type ScannerKeywords = {
    true: "true";
    false: "false";
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
};

// Actual scanning shit

type ScanTokens<Source extends string, Tokens extends Token[] = [], LastMinuses extends string = ""> = Source extends ""
    ? Tokens // Empty source results in scanned tokens
    : // Add 1 to Current
    Source extends `${infer Character}${infer RestOfSource}` // const c = this.#advance();
    ? // readonly #lexmap = new Map(...)
      Character extends " " | "\r" | "\t" | "\v" | "\f" | "\n"
        ? ScanTokens<RestOfSource, Tokens, LastMinuses>
        : IsDigit<Character> extends true
        ? RestOfSource extends `${infer NumericBase}${infer NextRestOfSource}`
            ? NumericBase extends keyof ScannerDigitsForBase // Is the base even valid
                ? Character extends "0" // Only 0 can be the first character of a number literal with a base
                    ? ExtractNumber<NextRestOfSource, ScannerDigitsForBase[NumericBase]> extends [
                          infer NewRestOfSource,
                          infer ExtractedNumber,
                      ]
                        ? ScanTokens<
                              NewRestOfSource & string,
                              [
                                  ...Tokens,
                                  Token<"numberliteral", `${LastMinuses}0${NumericBase}${ExtractedNumber & string}`>,
                              ]
                          >
                        : never
                    : never
                : ExtractNumber<Source, DecimalDigit> extends [infer NewRestOfSource, infer ExtractedNumber]
                ? ScanTokens<
                      NewRestOfSource & string,
                      [...Tokens, Token<"numberliteral", `${LastMinuses}${ExtractedNumber & string}`>]
                  >
                : never
            : ExtractNumber<Source, DecimalDigit> extends [infer NewRestOfSource, infer ExtractedNumber]
            ? ScanTokens<
                  NewRestOfSource & string,
                  [...Tokens, Token<"numberliteral", `${LastMinuses}${ExtractedNumber & string}`>]
              >
            : never
        : Character extends "-"
        ? ScanTokens<RestOfSource, Tokens, `${LastMinuses}-`>
        : LastMinuses extends `-${string}` // At least one minus
        ? never
        : Character extends "("
        ? ScanTokens<RestOfSource, [...Tokens, Token<"leftparen", Character>]>
        : Character extends ")"
        ? ScanTokens<RestOfSource, [...Tokens, Token<"rightparen", Character>]>
        : Character extends "["
        ? ScanTokens<RestOfSource, [...Tokens, Token<"leftbrace", Character>]>
        : Character extends "]"
        ? ScanTokens<RestOfSource, [...Tokens, Token<"rightbrace", Character>]>
        : Character extends "{"
        ? ScanTokens<RestOfSource, [...Tokens, Token<"leftbracket", Character>]>
        : Character extends "}"
        ? ScanTokens<RestOfSource, [...Tokens, Token<"rightbracket", Character>]>
        : Character extends ":"
        ? ScanTokens<RestOfSource, [...Tokens, Token<"colon", Character>]>
        : Character extends ";"
        ? ScanTokens<RestOfSource, [...Tokens, Token<"semicolon", Character>]>
        : Character extends ","
        ? ScanTokens<RestOfSource, [...Tokens, Token<"comma", Character>]>
        : Character extends "?"
        ? ScanTokens<RestOfSource, [...Tokens, Token<"questionmark", Character>]>
        : Character extends '"' | "'"
        ? ExtractString<RestOfSource, Character, "stringliteral"> extends [infer NewRestOfSource, infer ExtractedString]
            ? ScanTokens<NewRestOfSource & string, [...Tokens, Token<"stringliteral", ExtractedString & string>]>
            : never
        : Character extends "#"
        ? // Skip the comment and get new Source and Current values
          SkipComments<RestOfSource> extends [infer NewRestOfSource]
            ? ScanTokens<NewRestOfSource & string, Tokens>
            : never
        : // Past the lexmap now

        IsIdentifierStart<Character> extends true
        ? ExtractIdentifier<RestOfSource, Character> extends [infer NewRestOfSource, infer ExtractedToken]
            ? ExtractedToken extends Token
                ? ScanTokens<NewRestOfSource & string, [...Tokens, ExtractedToken]>
                : never
            : never
        : never
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
    ExpectingDot extends boolean = true,
    ExpectingE extends boolean = true,
    LastChar extends string = "",
    ResultingNumber extends string = "",
> = Source extends ""
    ? never
    : Source extends `${infer Next}${infer RestOfSource}`
    ? Next extends AllowedDigits | "_"
        ? Next extends "_"
            ? LastChar extends "e" | "."
                ? never
                : ExtractNumber<
                      RestOfSource,
                      AllowedDigits,
                      ExpectingDot,
                      ExpectingE,
                      Next,
                      `${ResultingNumber}${Next}`
                  >
            : ExtractNumber<RestOfSource, AllowedDigits, ExpectingDot, ExpectingE, Next, `${ResultingNumber}${Next}`>
        : Next extends "."
        ? ExpectingDot extends false
            ? never
            : LastChar extends "_"
            ? never
            : ExtractNumber<RestOfSource, AllowedDigits, false, ExpectingE, Next, `${ResultingNumber}.`>
        : Next extends "e"
        ? ExpectingE extends false
            ? never
            : LastChar extends "_"
            ? never
            : ExtractNumber<RestOfSource, AllowedDigits, true, false, Next, `${ResultingNumber}e`>
        : [Source, ResultingNumber]
    : never; // Should never happen because we check if Source is empty

type ExtractIdentifier<Source extends string, Start extends string> = Start extends "r" | "s"
    ? Source extends `${infer MaybeQuote}${string}`
        ? MaybeQuote extends "'" | '"'
            ? ExtractString<Source, MaybeQuote, Start extends "r" ? "regexstringliteral" : "sourcestringliteral">
            : ExtractIdentifierBody<Source, Start>
        : ExtractIdentifierBody<Source, Start>
    : ExtractIdentifierBody<Source, Start>;

type ExtractIdentifierBody<
    Source extends string,
    Start extends string,
    ResultingBody extends string = "",
> = Source extends `${infer Character}${infer RestOfSource}`
    ? IsIdentifierBody<Character> extends true
        ? ExtractIdentifierBody<RestOfSource, Start, `${ResultingBody}${Character}`>
        : `${Start}${ResultingBody}` extends keyof ScannerKeywords
        ? [Source, Token<ScannerKeywords[`${Start}${ResultingBody}`]>]
        : [Source, Token<"identifier", `${Start}${ResultingBody}`>]
    : never;

type IsDigit<Character extends string> = Character extends DecimalDigit ? true : false;

type IsIdentifierStart<Character extends string> = Character extends LowercaseAlphabet | UppercaseAlphabet | "_" | "$"
    ? true
    : false;

type IsIdentifierBody<Character extends string> = Character extends
    | LowercaseAlphabet
    | UppercaseAlphabet
    | DecimalDigit
    | "_"
    | "$"
    ? true
    : false;

// Actual parsing shit

type Expr = never;

type ArrayExpr<Expression extends Expr> = {
    type: "array";
    expr: Expression;
};

type CallExpr<Identifier extends string, Args extends Record<string, Expr>> = {
    type: "call";
    identifier: Identifier;
    args: Args;
};

type GroupingExpr<Expression extends Expr[]> = {
    type: "grouping";
    expr: Expression;
};

type LiteralExpr<Value> = {
    type: "literal";
    value: Value;
};

type ObjectExpr<Props extends PropExpr<string | RegExp, GroupingExpr<Expr[]>, boolean>[]> = {
    type: "object";
    props: Props;
};

type PropExpr<Name extends string | RegExp, Value extends GroupingExpr<Expr[]>, Optional extends boolean> = {
    type: "prop";
    name: Name;
    value: Value;
    optional: Optional;
};

type TupleExpr<Elements extends GroupingExpr<Expr[]>[]> = {
    type: "tuple";
    elements: Elements;
};

// Debugging

type OnlyTokenTypes<T> = {
    [K in keyof T]: T[K] extends Token<infer Type> ? Type : T[K];
};

type T01 = OnlyTokenTypes<ScanTokens<`()[]{}:;,?- "" # o k`>>;

type T02 = ScanTokens<`( 'i\\'m kelly' )`>;

// Make negative numbers work later
type T03 = ScanTokens<`( 42e123.14 ABC true --42 )`>;

type T04 = ScanTokens<`{
    type: string;
    lhs: {
        type: "CONSTANT";
        value: number;
    };
    rhs: {
        type: "CONSTANT";
        value: number;
    };
}`>;
