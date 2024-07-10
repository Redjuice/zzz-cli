'use strict';

import { readFile } from "fs/promises"; // 以promise的方式引入 readFile API
import path from 'path'
import semver from 'semver'
import colors from 'colors'
import rootCheck from 'root-check'
import { pathExistsSync } from 'path-exists'
import userHome from 'user-home'
import chalk from 'chalk'
import minimist from 'minimist'
import dotenv from 'dotenv'

import log from '@zzz-cli/log'
import { getNpmSemverVersion  } from '@zzz-cli/get-npm-info'
import constants from './constants.js'

const pkg = JSON.parse(
  await readFile(new URL('../package.json', import.meta.url))
)

let args = null

function core() {
  try {
    checkPkgVersion()
    checkNodeVersion()
    checkRoot()
    checkUserHome()
    checkInputArgs()
    checkEnv()
    checkGlobalUpdate()
  } catch (error) {
    log.error(error.message)
  }
}

// 检查全局变量是否需要更新
async function checkGlobalUpdate() {
  const currentVersion = pkg.version
  const npmName = pkg.name
  const lastVersion = await getNpmSemverVersion(currentVersion, npmName)
  if (lastVersion && semver.gt(lastVersion, currentVersion)) {
      log.warn('更新提示', colors.yellow(dedent`
      请手动更新 ${npmName}, 当前版本: ${currentVersion}, 最新版本: ${lastVersion}.
      更新命令: npm install -g ${npmName}
      ` ))
  }
}

// 设置默认的环境变量
function createDefaultConfig() {
  const cliConfig = {
    home: userHome,
  }
  if (process.env.CLI_HOME) {
    cliConfig['cliHome'] = path.join(userHome, process.env.CLI_HOME)
  } else {
    cliConfig['cliHome'] = path.join(userHome, constants.DEFAULT_CLI_HOME)
  }
  process.env.CLI_HOME_PATH = cliConfig['cliHome']
}

// 检查版本
function checkEnv() {
  const dotenvPath = path.resolve(userHome, '.env')
  if (pathExistsSync(dotenvPath)) {
    dotenv.config({
      path: dotenvPath
    })
  }
  createDefaultConfig() // 设置默认配置
  log.verbose('环境变量', process.env.CLI_HOME_PATH)
}

// 检查参数
function checkArgs(args) {
  if (args.debug) {
    process.env.LOG_LEVEL = 'verbose'
  } else {
    process.env.LOG_LEVEL = 'info'
  }
  log.level = process.env.LOG_LEVEL
}

// 检查输入参数
function checkInputArgs() {
  args = minimist(process.argv.slice(2))
  checkArgs(args)
}

// 检查用户主目录
function checkUserHome() {
  if (!userHome || !pathExistsSync(userHome)) {
    throw new Error(chalk.red('当前用户主目录不存在'));
  }
}

// 检查root
function checkRoot() {
  // Windows 环境中没有UID的概念，所以需要判断平台
  // if (process.platform !== 'win32') {
  //   console.log(`UID: ${process.getuid()}`);
  // } else {
  //   console.log('Running on Windows, UID is not available.');
  // }
  rootCheck();
}

// 检查node版本
function checkNodeVersion() {
  const currentVersion = process.version.slice(1)
  const lowestVersion = constants.LOWEST_NODE_VERSION;
  if (semver.lt(currentVersion, lowestVersion)) {
    throw new Error(
      colors.red(`zzz-cli 需要安装 v${lowestVersion} 以上版本的 Node.js`)
    );
  }
}

// 检查版本号
function checkPkgVersion() {
  const { version } = pkg;

  log.success('version', version)
}

export default core;