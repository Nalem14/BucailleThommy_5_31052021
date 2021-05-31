const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {

    entry: {
        home: ["/assets/scss/pages/home.scss", "/assets/js/index.js", "/assets/js/home.js"],
        product: ["/assets/scss/pages/product.scss", "/assets/js/index.js", "/assets/js/product.js"],
        cart: ["/assets/scss/pages/cart.scss", "/assets/js/index.js", "/assets/js/cart.js"],
        confirmation: ["/assets/scss/pages/order-confirmation.scss", "/assets/js/index.js", "/assets/js/order-confirmation.js"],
    },

    module: {
        rules: [
            {
                test: /.s[ac]ss$/i,
                use: [
                    MiniCssExtractPlugin.loader,
                    // Translates CSS into CommonJS
                    "css-loader",
                    "postcss-loader",
                    // Compiles Sass to CSS
                    "sass-loader",
                ],
            },

            {
                // Load bootstrap 5 icons
                test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                include: path.resolve(__dirname, './node_modules/bootstrap-icons/font/fonts'),
                use: {
                    loader: 'file-loader',
                    options: {
                        name: '[name].[ext]',
                        outputPath: '../webfonts',
                        publicPath: '../webfonts',
                    },
                }
            }
        ],
    },

    output: {
        path: path.resolve(__dirname, "assets/dist/js/"),
    },

    devServer: {
        host: '127.0.0.1',
        port: 8080,
        writeToDisk: true
    },

    plugins: [
        new MiniCssExtractPlugin({
            filename: '../css/[name].css',
        }),
    ],
};