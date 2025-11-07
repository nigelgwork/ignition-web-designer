const path = require('path');

module.exports = (env, argv) => {
    const mode = argv.mode || 'development';
    const isDevelopment = mode === 'development';

    // External dependencies provided by Ignition Gateway
    // These should NOT be bundled with the module
    const externals = [
        'react',
        'react-dom',
        'react-router-dom',
        '@hookform/resolvers/yup',
        '@hookform/resolvers',
        'react-hook-form',
        'react-redux',
        '@reduxjs/toolkit',
        '@inductiveautomation/ignition-web-ui',
        '@inductiveautomation/ignition-icons',
        'luxon'
    ];

    return {
        mode,
        entry: {
            webdesigner: path.join(__dirname, 'src/index.ts'),
            standalone: path.join(__dirname, 'src/main.tsx')
        },
        output: {
            library: '[name]',
            libraryTarget: 'umd',
            umdNamedDefine: true,
            filename: '[name].js',
            publicPath: '',
            path: path.resolve(__dirname, 'build/generated-resources/mounted/')
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: [
                        {
                            loader: 'babel-loader',
                            options: {
                                presets: [
                                    '@babel/preset-env',
                                    ['@babel/preset-react', { runtime: 'automatic' }],
                                    '@babel/preset-typescript'
                                ]
                            }
                        }
                    ],
                    exclude: /node_modules/
                },
                {
                    test: /\.css$/,
                    use: ['style-loader', 'css-loader']
                }
            ]
        },
        resolve: {
            extensions: ['.tsx', '.ts', '.js', '.jsx']
        },
        externals: function ({ context, request }, callback) {
            // For standalone bundle, don't externalize anything - bundle all dependencies
            // For webdesigner bundle (Gateway integration), externalize React etc.
            if (context && context.includes('main.tsx')) {
                // Standalone mode - bundle everything
                return callback();
            }
            // Gateway mode - check if dependency should be external
            if (externals.indexOf(request) !== -1) {
                return callback(null, request);
            }
            callback();
        },
        devtool: isDevelopment ? 'source-map' : false,
        optimization: {
            minimize: !isDevelopment
        }
    };
};
