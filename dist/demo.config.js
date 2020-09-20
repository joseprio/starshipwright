const path = require("path");
module.exports = {
    entry: "./src/demo.js",
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: [".ts", ".js", ".json"],
    },
    output: {
        filename: "demo.js",
        path: path.resolve(__dirname, "demo"),
    },
    optimization: {
        minimize: false,
    },
};
