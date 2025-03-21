# Weather MCP

A Model Context Protocol (MCP) implementation for retrieving weather information. This tool provides a command-line interface to access weather data through the MCP protocol.

## Installation

This project uses pnpm as the package manager. To install dependencies:

```bash
pnpm install
```

## Building

To build the project:

```bash
pnpm build
```

This will compile the TypeScript code and create executable scripts in the `build` directory.

## Usage

After building, you can use the weather command:

```bash
./build/weather.js [options]
```

The weather command integrates with MCP to provide weather information in a format that can be consumed by AI models and other applications.

## Development

This project is written in TypeScript and uses the following key dependencies:

- `@modelcontextprotocol/sdk`: Core MCP functionality
- `zod`: Runtime type checking and validation
- `typescript`: For type safety and compilation

## License

ISC License
