import path from "path";
import TsconfigPathsPlugin from "tsconfig-paths-webpack-plugin";

/**
 * ts-loader emits an error when no output is generated. This occurs when using Typescript's emitDeclarationOnluy
 * flag. This plugin suppresses that error so that webpack will consider it a clean build.
 */
class EmitDeclarationOnly {
  apply(compiler) {
    compiler.hooks.shouldEmit.tap("EmitDeclarationOnly", (compilation) =>
      this.handleHook(compiler, compilation)
    );
  }
  handleHook(compiler, compilation) {
    compilation.errors = compilation.errors.filter((error) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      !error.toString().includes("TypeScript emitted no output for");
    });
  }
}

module.exports = {
  entry: "./src/index.ts",
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@core": path.resolve(__dirname, "src/core"),
    },
    extensions: [".tsx", ".ts", ".js"],
    plugins: [
      // Allows to use path aliases defined in tsconfig.json
      new TsconfigPathsPlugin(),
    ],
  },
  plugins: [new EmitDeclarationOnly()],
  output: {
    filename: "index.js",
    path: path.resolve(__dirname, "dist"),
  },
};
