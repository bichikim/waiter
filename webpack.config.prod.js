module.exports = {
    node: {
        __dirname: true
    },
    entry: './src/app.js',
    output:{
        path: __dirname,
        filename: 'index.js'
    },
    module:{
        loaders:[
            {
                test:/\.sass$/,
                loader: 'style!css!sass'
            }, {
                test: /\.js/,
                loader: 'babel-loader',
                exclude: /(node_modules\bower_components)/,
                query:{
                    presets : ['es2015']
                }
            }
        ]
    },
    watch: true
};