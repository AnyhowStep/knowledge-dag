import * as  webpack from "webpack";

if (process.env.WATCH === "TRUE") {
    console.log("WEBPACK SHOULD WATCH");
}
console.log("WEBPACK_MODE", process.env.WEBPACK_MODE);
const rules : webpack.RuleSetRule[] = [
    {
        test : /\.css$/,
        use : [
            "style-loader",
            "css-loader",
        ],
    },
    {
        test : /\.tsx?$/,
        loader : `ts-loader`,
        options : {
            configFile : `${__dirname}/webpack-tsconfig.json`,
            projectReferences : true,
            compilerOptions : {
                strict : true,
                alwaysStrict : true,
            },
            transpileOnly : true,
        },
        exclude : /node_modules/,
    }
];
//TODO Is this even needed?
if (process.env.WEBPACK_MODE === "development") {
    rules.push({
        enforce : "pre",
        test : /\.js$/,
        loader : "source-map-loader",
    });
}

const rawClientConfig = require("./client-config.json");
const clientConfig = Object.keys(rawClientConfig).reduce(
    (obj, key) => {
        obj[key] = JSON.stringify(rawClientConfig[key]);
        return obj;
    },
    {}
);

const config : webpack.Configuration = {
    cache : true,
    entry : {
        main : `${__dirname}/src/client/main.tsx`,
    },
    output : {
        filename : "[name].js",
        chunkFilename: '[name].bundle.js',
        path : `${__dirname}/client/dist`,
    },
    devtool : (process.env.WEBPACK_MODE === "development") ?
        "source-map" :
        undefined,
    resolve : {
        extensions : [".ts", ".tsx", ".js"]
    },
    module : {
        rules : rules,
    },
    externals : {
    },
    watch : (process.env.WATCH === "TRUE"),
    watchOptions : {
        poll : (process.env.WATCH === "TRUE"),
    },
    optimization : {
        splitChunks : {
            chunks : "all",
            cacheGroups : {
                commons : {
                    test : /node_modules/,
                    name : "vendors",
                    chunks : "all"
                }
            }
        }
    },
    plugins : [
        new webpack.DefinePlugin(clientConfig),
    ]
};

module.exports = config;
