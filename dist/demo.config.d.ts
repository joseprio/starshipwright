declare const _exports: {
    entry: string;
    module: {
        rules: {
            test: RegExp;
            use: string;
            exclude: RegExp;
        }[];
    };
    resolve: {
        extensions: string[];
    };
    output: {
        filename: string;
        path: any;
    };
    optimization: {
        minimize: boolean;
    };
};
export = _exports;
