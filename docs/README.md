# @kelsny/synth

**⚡️ Synthesize your types into runtime validators.**

**👑 Control your program logic and behavior**

**♾ Enjoy the endless applications**

## Contents

-   [Getting started](./getting-started/README.md)

-   [Reference](./reference/README.md)

    -   [Synth language](./reference/lang/README.md)
    -   [Core API](./reference/api/README.md)
    -   [Type guards](./reference/guards/README.md)
    -   [Value matching](./reference/matches/README.md)
    -   [Overloading](./reference/overloads/README.md)
    -   [Tree manipulation](./reference/trees/README.md)
    -   [Synth CLI](./reference/cli/README.md)
    -   [Plugin system](./reference/plugins/README.md)

-   [For contributors](./for-contributors/README.md)

    -   [Language design](./for-contributors/lang/README.md)
    -   [Synth internals](./for-contributors/core/README.md)
    -   [Core API](./for-contributors/api/README.md)
    -   [Synth CLI](./for-contributors/cli/README.md)
    -   [Synth plugins](./for-contributors/plugins/README.md)

## Features

### Generate type guards

The main aspect of this project is to transform a type into a real validator at runtime.
Both precompiled and dynamically created ones work, but for the best developer experience, you should precompile all your types, as they include more specific TypeScript types.
This will give you better editor suggestions and less of a fuss working with Synth.

When generated, these validators hold a specific raw TypeScript type that you can use.
To utilize the type, you can use the function `is` provided by Synth, or the type `GetSynthesized`, also provided by Synth.

Assuming you precompiled this schema under the file name `ServerError.synth`:

```ts
{
    code: number;
    message: string;
}
```

You can then use it directly by importing it from Synth:

```ts
import { is, ServerError, GetNodeType } from "@kelsny/synth";

// Get raw type if needed
// ServerErrorType is { code: number; message: string; }
type ServerErrorType = GetNodeType<typeof ServerError>;

// Create a type guard
// isServerError is (value: unknown) => value is { code: number; message: string; };
const isServerError = is(ServerError);

// Call type guard with the value as well as the validator
if (is(ServerError, value)) {
    // value is { code: number; message: string; }
    console.log(value);
}
```

### Manipulate tree-like data

Originally, this tool was only going to be a TSurgeon and TRegex library for JavaScript, but I found many more applications other than just tree data structure manipulation.
You can find, search, replace, or remove anything you want in the tree.
And because in JavaScript, a plain old object is already a tree, it works quite nicely.

Let's precompile this type (`BinaryExpression.synth`):

```ts
{
    type: string;
    lhs: {
        type: "CONSTANT";
        value: number;
    }
    rhs: {
        type: "CONSTANT";
        value: number;
    }
}
```

Assuming that our AST for some language has this kind of representation, we can then find all the constant expressions in our tree:

```ts
import { find, BinaryExpression } from "@kelsny/synth";

// By default it is depth-first search
const found = find(BinaryExpression, ast);

// Synth found all the children that match the type 'BinaryExpression'
console.log(found);
```

### Handle overloading like Java and C++

Because we've got types in TypeScript, you can define overloaded functions with multiple signatures.
However, in the function body, you still have to manually differentiate between all the overloads.
This can be troublesome and quickly reduce the readabliity of the function.
Wouldn't it be nice if we could do it like Java or C++?

### Fluent matching of values like Rust
