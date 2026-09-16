# @teachedo/tsconfig

Shared TypeScript configurations for the Orthedo monorepo.

## Available Configurations

- **`@teachedo/tsconfig/base.json`**: Strict baseline TypeScript configuration.
- **`@teachedo/tsconfig/vite.json`**: For client-side React + Vite applications.
- **`@teachedo/tsconfig/vite-node.json`**: For Vite configuration and Node-based tool scripts in Vite apps.
- **`@teachedo/tsconfig/node.json`**: For backend Node.js and Bun services.
- **`@teachedo/tsconfig/library.json`**: For shared TypeScript libraries generating declaration files.
- **`@teachedo/tsconfig/react-library.json`**: For shared React component libraries.

## Usage

In your application or package's `package.json`, add:

```json
{
  "devDependencies": {
    "@teachedo/tsconfig": "workspace:*"
  }
}
```

Then extend the relevant config in your `tsconfig.json`:

```json
{
  "extends": "@teachedo/tsconfig/vite.json",
  "include": ["src"]
}
```
