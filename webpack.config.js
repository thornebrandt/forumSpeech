module.exports = {
    entry: './src/app.js',
    output: {
        path: __dirname,
        filename: 'forum_speak_content.js'
    },
    module: {
        loaders: [
            {
                loader: 'babel-loader'
            }
        ]
    }
};