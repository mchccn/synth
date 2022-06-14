// I'm sad GitHub doesn't count .d.ts files as TypeScript
// I understand the premise and reasoning behind it, but...
// I can't help but feel that I am missing out on at least
// a thousand lines of .d.ts with this project

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
    | "a" | "b" | "c" | "d"
    | "e" | "f" | "g" | "h"
    | "i" | "j" | "k" | "l"
    | "m" | "n" | "o" | "p"
    | "q" | "r" | "s" | "t"
    | "u" | "v" | "w" | "x"
    | "y" | "z" ;

type UppercaseAlphabet =
    | "A" | "B" | "C" | "D"
    | "E" | "F" | "G" | "H"
    | "I" | "J" | "K" | "L"
    | "M" | "N" | "O" | "P"
    | "Q" | "R" | "S" | "T"
    | "U" | "V" | "W" | "X"
    | "Y" | "Z" ;

type TrimLeadingZeroes<S extends string> = S extends `0${infer R}` ? TrimLeadingZeroes<R> : S;

type IsInteger<S extends string> = S extends `${infer D}${infer R}` ? D extends DecimalDigit ? IsInteger<R> : false : true;

// Number to type

type BinaryTimes<A extends UnknownArray> = [...A, ...A];

type OctalTimes<A extends UnknownArray> = [...A, ...A, ...A, ...A, ...A, ...A, ...A, ...A];

type HexTimes<A extends UnknownArray> = [...A, ...A, ...A, ...A, ...A, ...A, ...A, ...A, ...A, ...A, ...A, ...A, ...A, ...A, ...A, ...A];

type DigitToValue = {
    [K in DecimalDigit]: TupleOfLength<K>;
} & {
    a: TupleOfLength<"10">;
    b: TupleOfLength<"11">;
    c: TupleOfLength<"12">;
    d: TupleOfLength<"13">;
    e: TupleOfLength<"14">;
    f: TupleOfLength<"15">;
} & {
    A: TupleOfLength<"10">;
    B: TupleOfLength<"11">;
    C: TupleOfLength<"12">;
    D: TupleOfLength<"13">;
    E: TupleOfLength<"14">;
    F: TupleOfLength<"15">;
};

type Multiply<
    A extends UnknownArray,
    Times extends UnknownArray,
    TimesDone extends UnknownArray = [],
    Original extends UnknownArray = A,
> = Times["length"] extends 0
    ? []
    : [...TimesDone, unknown]["length"] extends Times["length"]
    ? A
    : Multiply<[...A, ...Original], Times, [...TimesDone, unknown], Original>;

type BinaryExponent<
    Base extends UnknownArray,
    Times extends UnknownArray,
    TimesDone extends UnknownArray = [],
> = Times["length"] extends 0
    ? [unknown]
    : TimesDone["length"] extends Times["length"]
        ? Base
        : BinaryExponent<BinaryTimes<Base>, Times, [...TimesDone, unknown]>;

type OctalExponent<
    Base extends UnknownArray,
    Times extends UnknownArray,
    TimesDone extends UnknownArray = [],
> = Times["length"] extends 0
    ? [unknown]
    : TimesDone["length"] extends Times["length"]
        ? Base
        : OctalExponent<OctalTimes<Base>, Times, [...TimesDone, unknown]>;
    
type HexExponent<
    Base extends UnknownArray,
    Times extends UnknownArray,
    TimesDone extends UnknownArray = [],
> = Times["length"] extends 0
    ? [unknown]
    : TimesDone["length"] extends Times["length"]
        ? Base
        : HexExponent<HexTimes<Base>, Times, [...TimesDone, unknown]>;

type TryBinary<S extends string, Result extends UnknownArray = []> =
    S extends `${infer D}${infer R}` 
    ? D extends keyof DigitToValue
        ? TryBinary<R, [...Result, ...Multiply<BinaryExponent<[unknown], TupleOfLength<`${StringLength<R>}`>>, DigitToValue[D]>]>
        : number
    : Result["length"];

type TryOctal<S extends string, Result extends UnknownArray = []> =
    S extends `${infer D}${infer R}` 
    ? D extends keyof DigitToValue
        //@ts-ignore
        ? TryOctal<R, [...Result, ...Multiply<OctalExponent<[unknown], TupleOfLength<`${StringLength<R>}`>>, DigitToValue[D]>]>
        : number
    : Result["length"];

type TryHex<S extends string, Result extends UnknownArray = []> =
    S extends `${infer D}${infer R}` 
    ? D extends keyof DigitToValue
        //@ts-ignore
        ? TryHex<R, [...Result, ...Multiply<HexExponent<[unknown], TupleOfLength<`${StringLength<R>}`>>, DigitToValue[D]>]>
        : number
    : Result["length"];

type TryRealNumberLiteral<S extends string> =
    S extends `0b${infer N}`
    ? TryBinary<N>
    : S extends `0o${infer N}`
    ? TryOctal<N>
    : S extends `0x${infer N}`
    ? TryHex<N>
    : S extends `${infer N extends number}`
        ? N
        : never

type TupleOfLength<N extends string, R extends UnknownArray = []> = `${R["length"]}` extends N ? R : TupleOfLength<N, [...R, unknown]>;

// Simple Definitions

type Token<Type extends TokenType = TokenType, Lexeme extends string = string> = { type: Type; lexeme: Lexeme };

type TokenType =
    | "leftparen"   | "rightparen"
    | "leftbrace"   | "rightbrace"
    | "leftbracket" | "rightbracket"
    | "colon"       | "semicolon"
    | "comma"       | "questionmark"
    | "minus"       | "sourcestringliteral"
    | "true"        | "regexstringliteral"
    | "false"       | "stringliteral"
    | "identifier"  | "numberliteral"
;

// Mappings

type ScannerKeywords = {
    true: "true";
    false: "false";
};

type ScannerDigitsForBase = {
    b: "0" | "1";
    o: "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7";
    x: "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7"
     | "8" | "9" | "a" | "b" | "c" | "d" | "e" | "f"
                 | "A" | "B" | "C" | "D" | "E" | "F";
};

// Actual scanning shit

type Scan<
    Source extends string,
    Tokens extends Token[] = [],
    LastMinuses extends string = "",
> = string extends Source
    ? Tokens
    : Source extends ""
    ? Tokens // Empty source results in scanned tokens
    // Add 1 to Current
    : Source extends `${infer Character}${infer RestOfSource}` // const c = this.#advance();
    ? // readonly #lexmap = new Map(...)
      Character extends " " | "\r" | "\t" | "\v" | "\f" | "\n"
        ? Scan<RestOfSource, Tokens, LastMinuses>
        : IsDigit<Character> extends true
        ? RestOfSource extends `${infer NumericBase}${infer NextRestOfSource}`
            ? NumericBase extends keyof ScannerDigitsForBase // Is the base even valid
                ? Character extends "0" // Only 0 can be the first character of a number literal with a base
                    ? ExtractNumber<NextRestOfSource, ScannerDigitsForBase[NumericBase]> extends [
                          infer NewRestOfSource extends string,
                          infer ExtractedNumber extends string,
                      ]
                        ? ExtractedNumber extends ""
                            ? never 
                            : Scan<
                                NewRestOfSource,
                                [
                                    ...Tokens,
                                    Token<"numberliteral", `${LastMinuses}0${NumericBase}${ExtractedNumber}`>,
                                ]
                              >
                        : never
                    : never
                : ExtractNumber<Source, DecimalDigit> extends [
                      infer NewRestOfSource extends string,
                      infer ExtractedNumber extends string,
                  ]
                    ? ExtractedNumber extends ""
                        ? never
                        : Scan<
                            NewRestOfSource,
                            [...Tokens, Token<"numberliteral", `${LastMinuses}${ExtractedNumber}`>]
                          >
                    : never
            : ExtractNumber<Source, DecimalDigit> extends [
                  infer NewRestOfSource extends string,
                  infer ExtractedNumber extends string,
              ]
                ? ExtractedNumber extends ""
                    ? never
                    : Scan<
                        NewRestOfSource,
                        [...Tokens, Token<"numberliteral", `${LastMinuses}${ExtractedNumber}`>]
                      >
                : never
        : Character extends "-"
        ? Scan<RestOfSource, Tokens, `${LastMinuses}-`>
        : LastMinuses extends `-${string}` // At least one minus
        ? never
        : Character extends "("
        ? Scan<RestOfSource, [...Tokens, Token<"leftparen", Character>]>
        : Character extends ")"
        ? Scan<RestOfSource, [...Tokens, Token<"rightparen", Character>]>
        : Character extends "["
        ? Scan<RestOfSource, [...Tokens, Token<"leftbrace", Character>]>
        : Character extends "]"
        ? Scan<RestOfSource, [...Tokens, Token<"rightbrace", Character>]>
        : Character extends "{"
        ? Scan<RestOfSource, [...Tokens, Token<"leftbracket", Character>]>
        : Character extends "}"
        ? Scan<RestOfSource, [...Tokens, Token<"rightbracket", Character>]>
        : Character extends ":"
        ? Scan<RestOfSource, [...Tokens, Token<"colon", Character>]>
        : Character extends ";"
        ? Scan<RestOfSource, [...Tokens, Token<"semicolon", Character>]>
        : Character extends ","
        ? Scan<RestOfSource, [...Tokens, Token<"comma", Character>]>
        : Character extends "?"
        ? Scan<RestOfSource, [...Tokens, Token<"questionmark", Character>]>
        : Character extends '"' | "'"
        ? ExtractString<RestOfSource, Character, "stringliteral"> extends [
              infer NewRestOfSource extends string,
              infer ExtractedString extends string,
          ]
            ? Scan<NewRestOfSource, [...Tokens, Token<"stringliteral", ExtractedString>]>
            : never
        : Character extends "#"
        ? // Skip the comment and get new Source and Current values
          SkipComments<RestOfSource> extends [infer NewRestOfSource extends string]
            ? Scan<NewRestOfSource, Tokens>
            : never
        : // Past the lexmap now
        IsIdentifierStart<Character> extends true
        ? ExtractIdentifier<RestOfSource, Character> extends [
              infer NewRestOfSource extends string,
              infer ExtractedToken extends Token,
          ]
            ? Scan<NewRestOfSource, [...Tokens, ExtractedToken]>
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
> = Source extends `${infer Next}${infer RestOfSource}`
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
    : [Source, ResultingNumber];

type ExtractIdentifier<Source extends string, Start extends string> = Start extends "r" | "s"
    ? Source extends `${infer MaybeQuote}${infer RestOfSource}`
        ? MaybeQuote extends "'" | '"'
            ? ExtractString<RestOfSource, MaybeQuote, Start extends "r" ? "regexstringliteral" : "sourcestringliteral"> extends [
                infer NewSource extends string,
                infer ExtractedString extends string,
              ]
                ? [NewSource, Token<Start extends "r" ? "regexstringliteral" : "sourcestringliteral", ExtractedString>]
                : never
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
    : [Source, Token<"identifier", `${Start}${ResultingBody}`>];

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

type Parse<Tokens extends Token[], Pattern extends Expr[] = []> = Tokens extends []
    ? GroupingExpr<Pattern>
    : ParseExpression<Tokens> extends [infer NewTokens extends Token[], infer Parsed extends Expr]
        ? Parse<NewTokens, [...Pattern, Parsed]>
        : never

type ParseExpression<Tokens extends Token[]> = Tokens extends [
    infer First extends Token,
    ...infer RestOfTokens extends Token[]
]
    ? First["type"] extends "leftbracket"
        ? 0
        : First["type"] extends "leftbrace"
            ? ParseTuple<RestOfTokens> extends [
                  infer NewRestOfTokens extends Token[],
                  infer Tuple extends Expr,
              ]
                ? ParsePostmodWrapIntoArray<NewRestOfTokens, Tuple>
                : never
            : ParsePostmod<Tokens>
    : never;

type ParseTuple<Tokens extends Token[], Elements extends GroupingExpr<Expr[]>[] = []> =
    Tokens extends [
        infer First extends Token,
        ...infer RestOfTokens extends Token[],
    ]
        ? First["type"] extends "rightbrace"
            ? [RestOfTokens, TupleExpr<Elements>]
            : ParseTupleElement<Tokens> extends [
                  infer NewRestOfTokens extends Token[],
                  infer Element extends Expr[]
              ]
                ? ParseTuple<NewRestOfTokens, [...Elements, GroupingExpr<Element>]>
                : never
    : never;

type ParseTupleElement<Tokens extends Token[], Element extends Expr[] = []> =
    Tokens extends [
        infer First extends Token,
        ...infer RestOfTokens extends Token[],
    ]
        ? First["type"] extends "rightbrace"
            ? Element extends []
                ? never
                : [Tokens, Element]
            : First["type"] extends "comma"
            ? Element extends []
                ? never
                : [RestOfTokens, Element]
            : ParseExpression<Tokens> extends [
                  infer NewRestOfTokens extends Token[],
                  infer Parsed extends Expr
              ]
                ? ParseTupleElement<NewRestOfTokens, [...Element, Parsed]>
                : never
        : never

type ParsePostmod<Tokens extends Token[]> = ParsePrimary<Tokens> extends [
    infer NewTokens extends Token[],
    infer Parsed extends Expr,
]
    ? ParsePostmodWrapIntoArray<NewTokens, Parsed>
    : never;

type ParsePostmodWrapIntoArray<Tokens extends Token[], Parsed extends Expr> = Tokens extends [
    infer First extends Token,
    ...infer RestOfTokens extends Token[],
]
    ? First["type"] extends "leftbrace"
        ? RestOfTokens extends [
              infer Second extends Token,
              ...infer RestOfTokens extends Token[],
          ]
            ? Second["type"] extends "rightbrace"
                ? ParsePostmodWrapIntoArray<RestOfTokens, ArrayExpr<Parsed>>
                : never
            : never
        : [Tokens, Parsed]
    : [Tokens, Parsed];

type ParsePrimary<Tokens extends Token[]> = Tokens extends [
    infer First extends Token,
    ...infer RestOfTokens extends Token[],
]
        ? First["type"] extends "true"
            ? [RestOfTokens, LiteralExpr<true>]
            : First["type"] extends "false"
                ? [RestOfTokens, LiteralExpr<false>]
                : First["type"] extends "stringliteral" | "sourcestringliteral"
                    ? First["lexeme"] extends `${"s" | ""}${'"' | "'"}${infer S}${'"' | "'"}`
                        ? [RestOfTokens, LiteralExpr<S>]
                        : never
                    : First["type"] extends "regexstringliteral"
                        ? [RestOfTokens, LiteralExpr<RegExp>]
                        : First["type"] extends "numberliteral"
                            ? [RestOfTokens, LiteralExpr<TryRealNumberLiteral<First["lexeme"]>>]
                            : First["type"] extends "identifier"
                                ? RestOfTokens extends [
                                    infer Next extends Token,
                                    ...infer NewRestOfTokens extends Token[],
                                  ]
                                    ? Next["type"] extends "leftparen"
                                        ? ParseCallArgs<NewRestOfTokens> extends [
                                            infer EvenNewerRestOfTokens extends Token[],
                                            infer ParsedArgs extends Record<string, Expr>,
                                          ]
                                            ? [EvenNewerRestOfTokens, CallExpr<First["lexeme"], ParsedArgs>]
                                            : never
                                        : [RestOfTokens, CallExpr<First["lexeme"], {}>]
                                    : [RestOfTokens, CallExpr<First["lexeme"], {}>]
                                : First["type"] extends "leftparen"
                                    ? ParseGroupingExpression<RestOfTokens> extends [
                                          infer EvenNewerRestOfTokens extends Token[],
                                          infer Parsed extends Expr,
                                      ]
                                        ? [EvenNewerRestOfTokens, Parsed]
                                        : never
                                    : never
        : never;

type ParseCallArgs<Tokens extends Token[], Args = {}> =
    Tokens extends [
        infer Ident extends Token,
        infer Colon extends Token,
        ...infer RestOfTokens extends Token[],
    ]
        ? Ident["type"] extends "rightparen"
            ? [[Colon, ...RestOfTokens], Args extends infer O ? { [K in keyof O]: O[K] } : never]
            : Ident["type"] extends "identifier"
                ? Colon["type"] extends "colon"
                    ? ParseExpression<RestOfTokens> extends [
                        infer NewTokens extends Token[],
                        infer Parsed extends Expr,
                      ]
                        ? NewTokens extends [
                            infer Comma extends Token,
                            ...infer NewRestOfTokens extends Token[]
                          ]
                            ? Comma["type"] extends "comma"
                                ? ParseCallArgs<NewRestOfTokens, Args & { [_ in Ident["lexeme"]]: Parsed }>
                                : Comma["type"] extends "rightparen"
                                    ? [NewRestOfTokens, Args & { [_ in Ident["lexeme"]]: Parsed } extends infer O ? { [K in keyof O]: O[K] } : never]
                                    : never
                            : never
                        : never
                    : never
                : never
        : never;

type ParseGroupingExpression<Tokens extends Token[], Pattern extends Expr[] = []> =
    Tokens extends [
        infer First extends Token,
        ...infer RestOfTokens extends Token[],
    ]
        ? First["type"] extends "rightparen"
            ? Pattern extends []
                ? never
                : [RestOfTokens, GroupingExpr<Pattern>]
            : ParseExpression<Tokens> extends [
                  infer NewRestOfTokens extends Token[],
                  infer Parsed extends Expr,
              ]
                ? ParseGroupingExpression<NewRestOfTokens, [...Pattern, Parsed]>
                : never
        : never;

type Expr = { type: string };

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

type OnlyTokenTypes<T> = { [K in keyof T]: T[K] extends Token<infer Type> ? Type : T[K] };

type T01 = OnlyTokenTypes<Scan<`()[]{}:;,?- "" # o k`>>;

type T02 = Scan<`( 'i\\'m kelly' )`>;

type T03 = Scan<`( 42e123.14 ABC true --42 )`>;

type T04 = Scan<`{
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

type T10 = Parse<Scan<`number range(min: 100, max: 100)`>>;

type T11 = Parse<Scan<`[0, 0][]`>>;
