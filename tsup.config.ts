import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/lib/next-json-component/index.ts',
    'server': 'src/lib/next-json-component/server/index.ts',
    'client': 'src/lib/next-json-component/client/index.ts',
  },
  format: ['cjs', 'esm'], // 支持 CommonJS 和 ES Modules
  dts: true,              // 自動生成 .d.ts 類型定義檔
  clean: true,            // 每次打包前清空 dist 目錄
  external: ['react', 'react-dom', 'next', 'zustand'], // 這些標記為外部依賴，不打包
  sourcemap: true,
  treeshake: true,
});
