# JSON Space Analyzer

[![CI](https://github.com/jamesbvaughan/json-space-analyzer/actions/workflows/ci.yaml/badge.svg?branch=main&event=push)](https://github.com/jamesbvaughan/json-space-analyzer/actions/workflows/ci.yaml)

This is a tool that visualizes the size of the values in a JSON document. It's
meant for situations where you're dealing with JSON data that's larger than you
expected, and you want to know what's taking up the space.

## Usage

Go to [json-space-analyzer.com](https://json-space-analyzer.com) and drop in a JSON file!

## Development

To install dependencies:

```bash
bun install
```

To run in development mode:

```bash
bun run dev
```

This will run a small web server and `bun build` in watch mode.

## Contributing

No special rules - just open a PR and I'll review it as soon as I'm able to.

## Resources

- [The JSON spec](https://www.json.org/json-en.html)
