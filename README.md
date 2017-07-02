# regex-pipe

[![NPM Version][npm-image]][npm-url]

A transformation piping tool based on regex.

<br><br>

## Table of contents

-   [Installation](#installation)
-   [Examples](#examples)
 -   [Parsing](#parsing)
 -   [Replacing](#replacing)
-   [Feedback](#feedback)
-   [License](#license)

<br><br>

## Installation

This module is available on [npm][npm-url]:
```bash
$ npm install regex-pipe
```

## Examples

### Parsing

The following example will show how to transform the content of a file to another.

```javascript
const Pipe = require('regex-pipe');

const regex = /(blue|red|yellow)/;
const transformation = matches => 'I have a ' + matches[1] + ' house\n';

new Pipe('./in.txt', './out.txt')
   .parse(regex, transformation, { delimiter: Pipe.DELIMITERS.LINE_BY_LINE })
   .then(() => {
      // Now the out.txt file contains the output...
   })
   .catch(err => {
      // An error happened...
   });
```

Considering the `in.txt` content as:

```text
They have a blue house
They have a red house
They have a yellow house
```

After the execution, the `out.txt` content will be:

```text
I have a blue house
I have a red house
I have a yellow house
```

In other words, the `Pipe.parse` will replace every chunk of data with the return of the `transformation` function

<br><br>

### Replacing

The following example will show how to replace the content of a file to another.

```javascript
const Pipe = require('regex-pipe');

const regex = /blue/;
const replacement = 'red';

new Pipe('./in.txt', './out.txt')
   .replace(regex, replacement, { delimiter: Pipe.DELIMITERS.LINE_BY_LINE })
   .then(() => {
      // Now the out.txt file contains the output...
   })
   .catch(err => {
      // An error happened...
   });
```

Considering the `in.txt` content as:

```text
They have a blue house
```

After the execution, the `out.txt` content will be:

```text
They have a red house
```

This is much like to what the `String.replace` does

<br><br>

## Feedback

If you want a feature to be added or give some other feedback, feel free to open an [issue](https://github.com/Potentii/regex-pipe/issues).

<br><br>

## License
[MIT](LICENSE.txt)

[npm-image]: https://img.shields.io/npm/v/regex-pipe.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/regex-pipe
