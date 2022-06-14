## Getting started with Synth

### Installation

It's no use if you don't have it.
Install Synth first however you'd like, either with NPM or Yarn:

```
$ npm install @kelsny/synth
```

```
$ yarn add @kelsny/synth
```

Or if you're a gigachad you might want to clone the repository and build it locally:

```
$ git clone https://github.com/kelsny/synth.git
$ cd synth
$ tsc
$ cd ..
```

### Your first Synth

The core of Synth is just a simple compiler.
It takes a schema you write and compiles it into a hierarchy of validators.
To begin, let's try some of the examples.
Here's `BinaryExpression.synth`:

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

We can either put it in a file, or compile it on the fly with the exported `synthesize` function:

```ts
import { synthesize } from "@kelsny/synth";

const BinaryExpression = synthesize`
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
`;
```

But if you left it as a file, you need to compile it with the CLI.
It's really quick and easy to do so as well.
If you didn't install it globally, you might want to, but you can use `npx` anyways:

```
$ npx synth path/to/BinaryExpression.synth
```

This will compile the schema and generate JavaScript and TypeScript typings.
Don't see the output?
Don't fret!
Synth stores the result in the `./node_modules/@kelsny/synth/precompiled` module.
That way, you can import the generated validators anytime you need, from Synth:

```ts
import { BinaryExpresion } from "@kelsny/synth";
```

But this is not really useful by itself!
You need Synth's utilities to work with the validator.

Let's try making a type guard from it:

```ts
import { BinaryExpression, is } from "@kelsny/synth";

const isBinaryExpression = is(BinaryExpression);
```

That was easy, but does it work?

```ts
const value = {} as unknown;

if (isBinaryExpression(value)) {
    value; // { type: string; lhs: { type: "CONSTANT"; ... } ... }
}
```

Magic!
You just got a real TypeScript type from a schema!
You can also use `is` just once like this:

```ts
if (is(BinaryExpression, value)) {
    value; // Same effect as above
}
```


