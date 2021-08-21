// import { ConfigurationFactory } from 'webpack'
import path from 'path';
import CopyWebpackPlugin from 'copy-webpack-plugin';

const config: any = () => {
  return {
    // eval回避
    devtool: 'cheap-source-map',
    entry: {
      devtools: path.join(__dirname, 'src', 'devtools.ts'),
      panel: path.join(__dirname, 'src', 'panel.ts'),
      background: path.join(__dirname, 'src', 'background.ts'),
      contentScript: path.join(__dirname, 'src', 'contentScript.ts'),
    },
    output: {
      // buildディレクトリにcontent_scripts.jsを吐く
      path: path.join(__dirname, 'build'),
      filename: '[name].js'
    },
    module: {
      rules: [
        {
          test: /.ts$/,
          use: 'ts-loader',
          exclude: '/node_modules/'
        }
      ]
    },
    resolve: {
      extensions: ['.ts', '.js']
    },
    plugins: [
      // publicディレクトリにあるファイルをdistディレクトリにコピーする
      new CopyWebpackPlugin({
        patterns: [
        { from: 'public', to: '.' }
      ]})
    ]
  }
}

export default config