
# Divergent Flow CLI

Tools empowering neurodivergent minds to flow.

## Install

Install globally from npm:

```sh
npm install -g divergent-flow-cli
```

Then run:

```sh
divergent-flow --help
```

## Usage

After installing globally, use either `divergent-flow` or the short alias `dflw`:

```sh
# Show help
divergent-flow --help

# Show CLI version
divergent-flow version

# Show API version (calls the Divergent Flow API)
divergent-flow version api

# First-time setup (guided prompts)
divergent-flow config init

# View or change config values
divergent-flow config list
divergent-flow config get API_BASE_URL
divergent-flow config set API_BASE_URL http://localhost:3001
divergent-flow config unset USER_ID

# Quick capture
divergent-flow dump "Write down that idea quickly"

# Start interactive capture session
divergent-flow dump session
```

Configuration is stored in `~/.grindrc` (JSON). Important keys:

- `APP_MODE`: `divergent` (default) or `typical`
- `API_BASE_URL`: Base URL for the API (e.g., `http://localhost:3001`)
- `LOG_LEVEL`: `info`, `warn`, `error`, `debug`
- `USER_ID`: Optional; if set, the CLI includes this when creating captures

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

## CLI Configuration (`.grindrc`)

The CLI stores user configuration in `~/.grindrc` as JSON. Some important keys:

- `APP_MODE` — UI mode, one of `divergent` or `typical`. Set by the interactive init wizard.
- `API_BASE_URL` — Base URL for the API (e.g. `http://localhost:3001`). The CLI uses this for all API calls.
- `USER_ID` — Optional: an explicit user id to attach to captures. If set, the CLI will send this `userId` when creating captures; otherwise the CLI falls back to a placeholder id.
- `LOG_LEVEL` — Logging level used by the CLI (`info`, `warn`, `error`, `debug`).

Examples:

Set or update keys using the CLI `config` command:

```bash
# interactive init (prompts for APP_MODE, API_BASE_URL, LOG_LEVEL)
node dist/index.js config init

# set USER_ID
node dist/index.js config set USER_ID e1ccf5f8-e1d6-4541-ae0a-72946f5fb3d9

# unset/remove USER_ID
node dist/index.js config unset USER_ID

# view current config
node dist/index.js config list

# get a single value
node dist/index.js config get USER_ID
```

Note: `USER_ID` is optional and intentionally not part of the interactive init wizard.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Author

GSC Prod, a division of Gibson Service Company, LLC
