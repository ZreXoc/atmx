const {
    addLessLoader,
    fixBabelImports,
    override,
    addWebpackResolve
} = require("customize-cra");

module.exports = {
    webpack: override(
        addLessLoader({
            javascriptEnabled: true
        }),
        fixBabelImports("babel-plugin-import", {
            libraryName: "antd-mobile",
            style: true
        }),
        addWebpackResolve({extensions:['.js','.jsx','.d.ts','.ts','.tsx']})
    )
};
