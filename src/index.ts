import fsp from 'node:fs/promises'
import fs from 'node:fs'
import path from 'node:path'
import type { UnpluginFactory } from 'unplugin'
import { createUnplugin } from 'unplugin'
import type { Options } from './types'
import { UserConfig, mergeAlias } from 'vite'


export const unpluginFactory: UnpluginFactory<Options | undefined> = (options = { assert: true, public: true, mode: '' }) => {
  if (options.assert !== false ) { options.assert = true}
  if (options.public !== false) { options.public = true }
  let confgPublicDir: string;
  let confgAssertsDir: string;
  // if (options.mode) { 
    const rootPath = process.cwd(); // 还有别方案获取 pkg的根目录吗
    const cacheDir = path.join(rootPath, 'node_modules/.saber');
    // if (options.public) {
      const cachePublicDir = path.join(cacheDir, "public");
      confgPublicDir = cachePublicDir;
      const publicDir = path.join(rootPath, 'public');
      const publicModeDir = path.join(rootPath, "statics", options.mode || '', 'public');
      const copyPublic = async () => {
        if (!fs.existsSync(cachePublicDir)) {
          await fsp.mkdir(cachePublicDir, { recursive: true })
        }
        await fsp.cp(publicDir, cachePublicDir, { recursive: true })
        if (fs.existsSync(publicModeDir)) {
          await fsp.cp(publicModeDir, cachePublicDir, { recursive: true })
        }
      }
      // copyPublic();
    // }
    // if (options.assert) {
      const cacheAssetsDir = path.join(cacheDir, 'assets');
      confgAssertsDir = cacheAssetsDir;
      const assetsDir = path.join(rootPath, 'src/assets');
      const assetsModeDir = path.join(rootPath, "statics", options.mode || '', 'assets');
      const copyAsserts = async () => {
        if (!fs.existsSync(cacheAssetsDir)) {
          await fsp.mkdir(cacheAssetsDir, { recursive: true })
        }
        await fsp.cp(assetsDir, cacheAssetsDir, { recursive: true })
        if (fs.existsSync(assetsModeDir)) {
          await fsp.cp(assetsModeDir, cacheAssetsDir, { recursive: true })
        }
      }
      // copyAsserts();
    // }

  // }
  
  return {
    name: 'unplugin-statics-env',
    async config(config: UserConfig, { command }: any) { 
      if (options.public) {
        config.publicDir = confgPublicDir; 
        if (command === 'build') { 
          await copyPublic();
        }else {
          copyPublic();
        }
      }
      if (options.assert) {
        if (command === 'build') {
          await copyAsserts();
        } else {
          copyAsserts();
        }
        // const a = [
        //   { find: /.*\/assets/, replacement: path.resolve(process.cwd(), "./node_modules/.saber/assets/") },
        // ]
         const a = [
          { find: /.*\/assets/, replacement: confgAssertsDir },
        ]
        const resolvedAlias = mergeAlias(config.resolve?.alias || [], a)
        if (!config.resolve) { 
          config.resolve = {};
        }
        config.resolve.alias = resolvedAlias
      }
    } 
  }
}

export const unplugin = /* #__PURE__ */ createUnplugin(unpluginFactory)

export default unplugin
