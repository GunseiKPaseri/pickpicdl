import path from 'path';
import CopyWebpackPlugin from 'copy-webpack-plugin';

const config: any = () => {
  return {
    mode: 'development',
    output: {
      path: path.join(__dirname, 'build'),
      filename: '[name].js',
    },
    devtool: 'cheap-source-map',
    // eval回避
    // devtool: 'cheap-source-map',
    entry: {
      devtools: path.join(__dirname, 'src', 'devtools.ts'),
      panel: path.join(__dirname, 'src', 'panel.tsx'),
      background: path.join(__dirname, 'src', 'background.ts'),
      contentScript: path.join(__dirname, 'src', 'contentScript.ts'),
    },
    module: {
      rules: [
        {
          test: /.tsx?$/,
          use: 'ts-loader',
          exclude: '/node_modules/',
        },
      ],
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js'],
    },
    plugins: [
      // publicディレクトリにあるファイルをdistディレクトリにコピーする
      new CopyWebpackPlugin({
        patterns: [
          {from: 'public', to: '.'},
        ],
      }),
    ],
  };
};

export default config;
