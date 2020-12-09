var version = require('./package.json').version;
const path = require('path');
var pyname = 'ipyvolume'

// Custom webpack loaders are generally the same for all webpack bundles, hence
// stored in a separate local variable.
var rules = [
    { test: /\.css$/, use: ['style-loader', 'css-loader']},
    {test: /\.png$/,use: 'url-loader?limit=10000000'},
    {
        test: /\.(js|ts)$/,
        use: ["source-map-loader"],
        enforce: "pre"
      }
];

var resolve =  {
    extensions: ['.ts', '.js']
};


module.exports = [
    {// Notebook extension
     //
     // This bundle only contains the part of the JavaScript that is run on
     // load of the notebook. This section generally only performs
     // some configuration for requirejs, and provides the legacy
     // "load_ipython_extension" function which is required for any notebook
     // extension.
     //
        entry: './lib/extension.js',
        devtool: 'inline-source-map',
        output: {
            filename: 'extension.js',
            path: path.resolve(__dirname, `../${pyname}/static`),
            libraryTarget: 'amd',
            devtoolModuleFilenameTemplate: 'webpack://jupyter-widgets/ipyvolume/[resource-path]?[loaders]',
        },
        resolve: resolve
    },
    {// Bundle for the notebook containing the custom widget views and models
     //
     // This bundle contains the implementation for the custom widget views and
     // custom widget.
     // It must be an amd module
     //
        entry: './lib/index.js',
        devtool: 'inline-source-map',
        output: {
            filename: 'index.js',
            path: path.resolve(__dirname, `../${pyname}/static`),
            libraryTarget: 'amd',
            devtoolModuleFilenameTemplate: 'webpack://jupyter-widgets/ipyvolume/[resource-path]?[loaders]',
        },
        module: {
            rules: rules
        },
        externals: ['three', 'jupyter-js-widgets', '@jupyter-widgets/base'],
        resolve: resolve
    },
    {// Embeddable ipyvolume bundle
     //
     // This bundle is generally almost identical to the notebook bundle
     // containing the custom widget views and models.
     //
     // The only difference is in the configuration of the webpack public path
     // for the static assets.
     //
     // It will be automatically distributed by unpkg to work with the static
     // widget embedder.
     //
     // The target bundle is always `dist/index.js`, which is the path required
     // by the custom widget embedder.
     //
        entry: './lib/embed.js',
        devtool: 'inline-source-map',
        resolve: {
            extensions: ['.ts', '.js', '']
        },
        output: {
            filename: 'index.js',
            path: path.resolve(__dirname, './dist/'),
            libraryTarget: 'amd',
            publicPath: 'https://unpkg.com/ipyvolume@' + version + '/dist/',
            devtoolModuleFilenameTemplate: 'webpack://jupyter-widgets/ipyvolume/[resource-path]?[loaders]',
        },
        devtool: 'source-map',
        module: {
            rules: rules
        },
        externals: ['jupyter-js-widgets', '@jupyter-widgets/base'],
        resolve: resolve
    },
    {
        entry: 'three',
        output: {
            filename: 'three.js',
            path: path.resolve(__dirname, `../${pyname}/static`),
            libraryTarget: 'amd'
        },
        devtool: 'source-map',
        module: {
            rules: rules
        }
    },
];
