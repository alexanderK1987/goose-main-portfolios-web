const { mergeSassVariables } = require('@vuetify/cli-plugin-utils');

module.exports = {
  // path set according to nginx serving location path
  publicPath: process.env.NODE_ENV === 'production' ? '/goose-tracker' : '/',
  transpileDependencies: ['vuetify'],
  chainWebpack: config => {
    const modules = ['vue-modules', 'vue', 'normal-modules', 'normal'];
    modules.forEach(match => {
      config.module
        .rule('sass')
        .oneOf(match)
        .use('sass-loader')
        .tap(opt => mergeSassVariables(opt, "'@/styles/variables.scss'"));
      config.module
        .rule('scss')
        .oneOf(match)
        .use('sass-loader')
        .tap(opt => mergeSassVariables(opt, "'@/styles/variables.scss';"));
    });
  },
};
