
# Divergent Flow CLI

Tools empowering neurodivergent minds to flow.

## Prerequisites

- Node.js >= 18
- API server must be running and accessible at `http://localhost:8080/openapi.json` for API client generation

## Getting Started

### Install dependencies

```sh
npm install
```

### Run the CLI (development)

```sh
npm run dev
```

### Run the CLI (built)

```sh
npm run build
npm start
```

### Direct Commands

- `npm run dev version` — Show CLI version
- `npm run dev version api` — Show API version (calls API)

## API Client Generation

The API client is generated from the OpenAPI spec using [openapi-typescript-codegen](https://github.com/ferdikoomen/openapi-typescript-codegen).

To regenerate the API client after API changes:

1. Ensure the API server is running and accessible at `http://localhost:8080/openapi.json`.
2. Run:

 ```sh
 npm run generate:api-client
 ```

This will update the files in `src/api-client/`.

### Manual Files to Maintain

After generating the API client, you must maintain these files manually:

- `src/api-client/interfaces/IApiClient.ts` — TypeScript interface for the API client (for DI, mocking, and testability)
- `src/api-client/ApiClientImpl.ts` — Concrete implementation of `IApiClient` that wires up the generated services
- `src/di/container.ts` — tsyringe DI container setup (registers `ApiClientImpl` for `IApiClient`)

If you add new API endpoints/services, update these files to reflect the changes.

## Dependency Injection

This CLI uses [tsyringe](https://github.com/microsoft/tsyringe) for dependency injection. All commands that use the API client resolve it via the DI container for consistency and testability.

## Project Structure

- `src/commands/` — CLI command modules
- `src/menus/` — Menu UI logic
- `src/api-client/` — Generated API client and manual interface/implementation
- `src/di/` — Dependency injection container setup
- `src/index.ts` — CLI entry point and command router

## License

MIT

## Author

GSC Prod, a division of Gibson Service Company, LLC
