# Development

## Pre-requisites

Tungsten.js supports [nodejs] versions **4.0.0** and later.

[nodejs]: https://nodejs.org/

## Getting Started Locally

```bash
git clone https://github.com/wayfair/tungstenjs.git
cd tungstenjs
npm install
```

## Building Tungsten.js

Tungsten.js has 5 build targets; `build-plugins`, `build-bb`, `build-bb-dev`,
`build-ampersand`, and `build-ampsersand-dev`. These can be run individually
using npm scripts eg (`npm run build-bb`).

Alternatively, you can run all of the builds with `npm run prepublish`.

The `dist/` directory can be cleaned with `npm run clean`.

## Testing and Style

Tungsten.js is tested with [Jasmine] running in node and linted using [eslint].

Run lint and unit tests with:
```bash
npm test
```

If you need to troubleshoot a test failure, `npm run tests-debug` is there to
help.  It will build and run tests with [debugging in node] enabled. You will be
able to set breakpoints, step through code, and evaluate values in a repl.

[Jasmine]: http://jasmine.github.io/
[eslint]: http://eslint.org/
[debugging in node]: https://nodejs.org/api/debugger.html

## Travis CI

Tungsten.js uses [Travis CI] to test branches and validate PRs.

You can see CI results here: https://travis-ci.org/wayfair/tungstenjs

[Travis CI]: https://travis-ci.org
