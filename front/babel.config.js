module.exports = {
    presets: [
      [
        '@babel/preset-env',
        {
          targets: {
            browsers: [
              'last 2 versions',
              'not dead',
              'not < 2%',
            ],
          },
          useBuiltIns: 'usage',
          corejs: 3,
        },
      ],
      '@babel/preset-react',
    ],
    plugins: [
      '@babel/plugin-proposal-class-properties',
      '@babel/plugin-transform-runtime',
    ],
  };
  