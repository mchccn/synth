// Utility types

type UnknownArray = ReadonlyArray<unknown>;

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

type Split<Input extends string, Separator extends string = ""> =
      Input extends "" ? []
    : Input extends `${infer Start}${Separator}${infer End}`
    ? [Start, ...Split<End, Separator>]
    : [Input];

type StringLength<T extends string> = Split<T>["length"];

type Increment<N extends UnknownArray> = [...N, unknown];

type DecimalDigit = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";

type LowercaseAlphabet =
    | "a" | "b" | "c" | "d" | "e" | "f" 
    | "g" | "h" | "i" | "j" | "k" | "l"
    | "m" | "n" | "o" | "p" | "q" | "r" 
    | "s" | "t" | "u" | "v" | "w" | "x"
    | "y" | "z" ;

type UppercaseAlphabet =
    | "A" | "B" | "C" | "D" | "E" | "F" 
    | "G" | "H" | "I" | "J" | "K" | "L"
    | "M" | "N" | "O" | "P" | "Q" | "R" 
    | "S" | "T" | "U" | "V" | "W" | "X"
    | "Y" | "Z" ;

type TrimLeadingZeroes<S extends string> = S extends `0${infer R}` ? TrimLeadingZeroes<R> : S;

type IsInteger<S extends string> = S extends `${infer D}${infer R}` ? D extends DecimalDigit ? IsInteger<R> : false : true;

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

type RemoveUselessNegations<S extends string> = S extends `--${infer N}` ? RemoveUselessNegations<N> : S;

// Number to type

type BinaryTimes<A extends UnknownArray> = [...A, ...A];

type OctalTimes<A extends UnknownArray> = [...A, ...A, ...A, ...A, ...A, ...A, ...A, ...A];

type HexTimes<A extends UnknownArray> = [...A, ...A, ...A, ...A, ...A, ...A, ...A, ...A, ...A, ...A, ...A, ...A, ...A, ...A, ...A, ...A];

type DigitToValue = {
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
} & { [K in DecimalDigit]: TupleOfLength<K> };

type Multiply<
    A extends UnknownArray,
    Times extends UnknownArray,
    TimesDone extends UnknownArray = [],
    Original extends UnknownArray = A,
> = Times["length"] extends 0 ? []
  : [...TimesDone, unknown]["length"] extends Times["length"]
    ? A
    : Multiply<[...A, ...Original], Times, [...TimesDone, unknown], Original>;

type BinaryExponent<
    Base extends UnknownArray,
    Times extends UnknownArray,
    TimesDone extends UnknownArray = [],
> = Times["length"] extends 0 ? [unknown]
  : TimesDone["length"] extends Times["length"]
    ? Base
    : BinaryExponent<BinaryTimes<Base>, Times, [...TimesDone, unknown]>;

type OctalExponent<
    Base extends UnknownArray,
    Times extends UnknownArray,
    TimesDone extends UnknownArray = [],
> = Times["length"] extends 0 ? [unknown]
  : TimesDone["length"] extends Times["length"]
    ? Base
    : OctalExponent<OctalTimes<Base>, Times, [...TimesDone, unknown]>;
    
type HexExponent< // Hexponent???
    Base extends UnknownArray,
    Times extends UnknownArray,
    TimesDone extends UnknownArray = [],
> = Times["length"] extends 0 ? [unknown]
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
        //@ts-ignore Type produces a tuple type that is too large to represent. ts(2799)
        ? TryOctal<R, [...Result, ...Multiply<OctalExponent<[unknown], TupleOfLength<`${StringLength<R>}`>>, DigitToValue[D]>]>
        : number
    : Result["length"];

type TryHex<S extends string, Result extends UnknownArray = []> =
    S extends `${infer D}${infer R}` 
    ? D extends keyof DigitToValue
        //@ts-ignore Type produces a tuple type that is too large to represent. ts(2799)
        ? TryHex<R, [...Result, ...Multiply<HexExponent<[unknown], TupleOfLength<`${StringLength<R>}`>>, DigitToValue[D]>]>
        : number
    : Result["length"];

type TryRealNumberLiteral<S extends string> =
      S extends `0b${infer N}` ? TryBinary<N>
    : S extends `0o${infer N}` ? TryOctal<N>
    : S extends `0x${infer N}` ? TryHex<N>
    : S extends `${infer N extends number}` ? N : never // Credits to @0kku 

type TupleOfLength<N extends string, R extends UnknownArray = []> = `${R["length"]}` extends N ? R : TupleOfLength<N, [...R, unknown]>;

// Simple Definitions

type Token<Type extends TokenType = TokenType, Lexeme extends string = string> = { type: Type; lexeme: Lexeme };

type TokenType =
    | "colon"     | "leftparen"     | "rightparen"
    | "comma"     | "leftbrace"     | "rightbrace"
    | "minus"     | "leftbracket"   | "rightbracket"
    | "true"      | "questionmark"  | "sourcestringliteral"
    | "false"     | "identifier"    | "regexstringliteral"
    | "semicolon" | "stringliteral" | "numberliteral"       ;

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
> = string extends Source ? Tokens
  : Source extends "" ? Tokens // Empty source results in scanned tokens
    : Source extends `${infer Character}${infer RestOfSource}` // const c = this.#advance();
    ? // Skip over whitespace
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
                                    Token<"numberliteral", `${RemoveUselessNegations<LastMinuses>}0${NumericBase}${ExtractedNumber}`>, // Prepend base before number
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
                            [...Tokens, Token<"numberliteral", `${RemoveUselessNegations<LastMinuses>}${ExtractedNumber}`>]
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
                        [...Tokens, Token<"numberliteral", `${RemoveUselessNegations<LastMinuses>}${ExtractedNumber}`>]
                      >
                : never
        // readonly #lexmap = new Map(...)
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

type SkipComments<
    Source extends string,
> = Source extends "" ? [Source]
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
> = Source extends "" ? never
  : Source extends `${infer Character}${infer RestOfSource}`
    ? LastChar extends "\\" // Escaped anyways, so we continue disregarding if the character is a quote to stop at
        ? ExtractString<RestOfSource, QuoteToStopAt, StringType, Character, `${ResultingString}${Character}`>
        : Character extends QuoteToStopAt
        ? [RestOfSource, `${QuoteToStopAt}${ResultingString}${QuoteToStopAt}`]
        : ExtractString<RestOfSource, QuoteToStopAt, StringType, Character, `${ResultingString}${Character}`>
    : never; // Should never happen because we check if Source is empty

type ExtractNumber<
    Source extends string,
    AllowedDigits extends string,
    ExpectingDot extends boolean = true, // Use two flags to keep track of state
    ExpectingE extends boolean = true,   // Allows us to do everything in one type
    LastChar extends string = "",
    ResultingNumber extends string = "",
> = Source extends `${infer Next}${infer RestOfSource}`
    ? Next extends AllowedDigits | "_"
        ? Next extends "_"
            ? LastChar extends "e" | "."
                ? never // Numeric separators not allowed after 'e' or '.'
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
            : LastChar extends "_" // Numeric separators not allowed before 'e' or '.'
            ? never
            : ExtractNumber<RestOfSource, AllowedDigits, false, ExpectingE, Next, `${ResultingNumber}.`>
        : Next extends "e"
        ? ExpectingE extends false
            ? never
            : LastChar extends "_" // Numeric separators not allowed before 'e' or '.'
            ? never
            : ExtractNumber<RestOfSource, AllowedDigits, true, false, Next, `${ResultingNumber}e`>
        : [Source, ResultingNumber]
    : [Source, ResultingNumber];

type ExtractIdentifier<Source extends string, Start extends string> = Start extends "r" | "s"
    ? Source extends `${infer MaybeQuote}${infer RestOfSource}`
        ? MaybeQuote extends "'" | '"' // This is a special string literal
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
        ? [Source, Token<ScannerKeywords[`${Start}${ResultingBody}`], `${Start}${ResultingBody}`>]
        : [Source, Token<"identifier", `${Start}${ResultingBody}`>]
    : [Source, Token<"identifier", `${Start}${ResultingBody}`>];

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
    ? First["type"] extends "leftbracket" // Start of object
        ? ParseObject<RestOfTokens> extends [
              infer NewRestOfTokens extends Token[],
              infer Parsed extends Expr,
          ]
            ? ParsePostmodFinisher<NewRestOfTokens, Parsed> // Apply array modifiers
            : never
        : First["type"] extends "leftbrace" // Start of tuple
            ? ParseTuple<RestOfTokens> extends [
                  infer NewRestOfTokens extends Token[],
                  infer Parsed extends Expr,
              ]
                ? ParsePostmodFinisher<NewRestOfTokens, Parsed> // Apply array modifiers
                : never
            : ParsePostmod<Tokens>
    : never;

type ParseObject<Tokens extends Token[], Props extends PropExpr<string | RegExp, GroupingExpr<Expr[]>, boolean>[] = []> =
    Tokens extends [
        infer First extends Token,
        ...infer RestOfTokens extends Token[],
    ]
        ? First["type"] extends "rightbracket" // End of object
            ? [RestOfTokens, ObjectExpr<Props>]
            : ParseObjectProp<Tokens> extends [
                  infer NewTokens extends Token[],
                  infer ParsedProp extends PropExpr<string | RegExp, GroupingExpr<Expr[]>, boolean>,
              ]
                ? ParseObject<NewTokens, [...Props, ParsedProp]>
                : never
        : never

type ParseObjectProp<Tokens extends Token[]> =
    Tokens extends [
        infer PropName extends Token,
        infer Colon extends Token,
        ...infer RestOfTokens extends Token[],
    ]
        ? Colon["type"] extends "questionmark" // This is an optional property
            ? RestOfTokens extends [
                  infer Colon extends Token,
                  ...infer RestOfTokens extends Token[]
              ]
                ? Colon["type"] extends "colon"
                    ? ParsePropValue<RestOfTokens> extends [
                        infer NewTokens extends Token[],
                        infer ParsedValue extends Expr[],
                    ]
                        ? PropName["type"] extends "numberliteral"
                            ? [NewTokens, PropExpr<`${TryRealNumberLiteral<PropName["lexeme"]>}`, GroupingExpr<ParsedValue>, true>]
                            : PropName["type"] extends "stringliteral" | "sourcestringliteral"
                                ? [NewTokens, PropExpr<PropName["lexeme"] extends `${"s" | ""}${"\"" | "'"}${infer S}${"\"" | "'"}` ? S : never, GroupingExpr<ParsedValue>, true>]
                                : PropName["type"] extends "true" | "false"
                                    ? [NewTokens, PropExpr<PropName["type"], GroupingExpr<ParsedValue>, true>]
                                    : PropName["type"] extends "regexstringliteral"
                                        ? [NewTokens, PropExpr<RegExp, GroupingExpr<ParsedValue>, true>]
                                        : PropName["type"] extends "identifier"
                                            ? [NewTokens, PropExpr<PropName["lexeme"], GroupingExpr<ParsedValue>, true>]
                                            : never
                        : never
                    : never
                : never
            : Colon["type"] extends "colon"
                ? ParsePropValue<RestOfTokens> extends [
                      infer NewTokens extends Token[],
                      infer ParsedValue extends Expr[],
                  ]
                    ? PropName["type"] extends "numberliteral"
                        ? [NewTokens, PropExpr<`${TryRealNumberLiteral<PropName["lexeme"]>}`, GroupingExpr<ParsedValue>, false>]
                        : PropName["type"] extends "stringliteral" | "sourcestringliteral"
                            ? [NewTokens, PropExpr<PropName["lexeme"] extends `${"s" | ""}${"\"" | "'"}${infer S}${"\"" | "'"}` ? S : never, GroupingExpr<ParsedValue>, false>]
                            : PropName["type"] extends "true" | "false"
                                ? [NewTokens, PropExpr<PropName["type"], GroupingExpr<ParsedValue>, false>]
                                : PropName["type"] extends "regexstringliteral"
                                    ? [NewTokens, PropExpr<RegExp, GroupingExpr<ParsedValue>, false>]
                                    : PropName["type"] extends "identifier"
                                        ? [NewTokens, PropExpr<PropName["lexeme"], GroupingExpr<ParsedValue>, false>]
                                        : never
                    : never
                : never
        : never

type ParsePropValue<Tokens extends Token[], Value extends Expr[] = []> =
    Tokens extends [
        infer First extends Token,
        ...infer RestOfTokens extends Token[],
    ]
        ? First["type"] extends "semicolon"
            ? Value extends []
                ? never
                : [RestOfTokens, Value]
            : ParseExpression<Tokens> extends [
                  infer NewRestOfTokens extends Token[],
                  infer Parsed extends Expr
              ]
                ? ParsePropValue<NewRestOfTokens, [...Value, Parsed]>
                : never
        : never;

type ParseTuple<Tokens extends Token[], Elements extends GroupingExpr<Expr[]>[] = []> =
    Tokens extends [
        infer First extends Token,
        ...infer RestOfTokens extends Token[],
    ]
        ? First["type"] extends "rightbrace" // End of tuple
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
        ? First["type"] extends "rightbrace" // Should probably stop if we hit a right brace
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
    ? ParsePostmodFinisher<NewTokens, Parsed>
    : never;

type ParsePostmodFinisher<Tokens extends Token[], Parsed extends Expr> = Tokens extends [
    infer First extends Token,
    ...infer RestOfTokens extends Token[],
]
    ? First["type"] extends "leftbrace"
        ? RestOfTokens extends [
              infer Second extends Token,
              ...infer RestOfTokens extends Token[],
          ]
            ? Second["type"] extends "rightbrace" // Check if it's immediately followed up by a right brace
                ? ParsePostmodFinisher<RestOfTokens, ArrayExpr<Parsed>>
                : [Tokens, Parsed] // If it isn't, it might be a tuple so we return it as is
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
        ? Ident["type"] extends "rightparen" // infer O used to collapse result
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

// Actual generating shit

type IdentifierMap = {
    bigint: bigint;
    boolean: boolean;
    function: (...args: any[]) => any;
    max: string | number;
    min: string | number;
    null: null;
    number: number;
    range: number;
    regex: string;
    string: string;
    symbol: symbol;
    undefined: undefined;
} & { [key: string]: unknown };

type Generate<Expression extends Expr> =
    Expression extends GroupingExpr<infer E>
        ? boolean extends {
              [K in keyof E]: Generate<E[K]>;
          }[keyof E & `${bigint}`]
            ? UnionToIntersection<Exclude<{
                [K in keyof E]: Generate<E[K]>;
              }[keyof E & `${bigint}`], boolean>> & boolean
            : UnionToIntersection<{
                [K in keyof E]: Generate<E[K]>;
              }[keyof E & `${bigint}`]>
        : Expression extends ArrayExpr<infer E>
            ? Generate<E>[]
            : Expression extends LiteralExpr<infer V>
                ? V
                : Expression extends TupleExpr<infer E>
                    ? { [K in keyof E]: Generate<E[K]> }
                    : Expression extends ObjectExpr<infer Props>
                        ? {
                              [K in Extract<Props[number], PropExpr<any, any, false>>["name"] as K extends RegExp ? string : K]: K extends RegExp
                                  ? Generate<Extract<Props[number], PropExpr<RegExp, any, any>>["value"]>
                                  : Generate<Extract<Props[number], PropExpr<K, any, any>>["value"]>
                          } & {
                              [K in Extract<Props[number], PropExpr<any, any, true>>["name"]]?: Generate<Extract<Props[number], PropExpr<K, any, any>>["value"]>;
                          } extends infer O ? { [K in keyof O]: O[K] } : never
                        : Expression extends CallExpr<infer I, infer _> // Args not needed yet
                            ? IdentifierMap[I]
                            : Expression extends PropExpr<any, infer V, any>
                                ? Generate<V>
                                : never;

// The holy grail

//@ts-ignore Type instantiation is excessively deep and possibly infinite. ts(2589)
declare type Eval<S extends string> = Generate<Parse<Scan<S>>>;
