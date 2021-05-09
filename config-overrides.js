const {
    addBabelPlugins,
    addLessLoader,
    fixBabelImports,
    override,
    addWebpackResolve
} = require("customize-cra");


module.exports = {
    webpack: override(
        addBabelPlugins( // 支持装饰器
            [
                '@babel/plugin-proposal-decorators',
                {
                    legacy: true
                }
            ]
        ),
        addLessLoader({
            javascriptEnabled: true
        }),
        fixBabelImports("babel-plugin-import", {
            libraryName: "antd-mobile",
            style: true
        }),
        fixBabelImports('import', {
            libraryName: 'antd',
            libraryDirectory: 'es',
            style: 'less',
          }),
        addWebpackResolve({extensions:['.js','.jsx','.d.ts','.ts','.tsx']})
    )
};
