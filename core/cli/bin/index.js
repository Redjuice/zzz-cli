#!/usr/bin/env node

import { fileURLToPath } from 'url';
import importLocal from 'import-local'
import lib from '../lib/index.js'

const __filename = fileURLToPath(import.meta.url);

if (importLocal(__filename)) {
  // log.info('cli', '正在使用 zzz-cli 本地版本')
} else {
  lib(process.argv.slice(3))
}