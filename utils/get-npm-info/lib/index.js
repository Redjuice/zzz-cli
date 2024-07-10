'use strict';

import axios from 'axios'
import urlJoin from 'url-join'
import semver from'semver'

// 获取npm包信息
function getNpmInfo(npmName, registry) {
  if (!npmName) {
      return null
  }
  registry = registry || getDefaultRegistry()
  const npmInfoUrl = urlJoin(registry, npmName)
  return axios.get(npmInfoUrl).then(response => {
      if (response.status === 200) {
          return response.data
      }
      return null
  }).catch(err => {
      return Promise.reject(err)
  })
}

// 获取默认npm仓库地址
function getDefaultRegistry(isOriginal = false) {
  return isOriginal ? 'https://registry.npmjs.org' : 'https://registry.npmmirror.com/'
}

// 获取npm所有版本
async function getNpmVersions(npmName, registry) {
  const data = await getNpmInfo(npmName, registry)
  if (data) {
      return Object.keys(data.versions)
  } else {
      return []
  }
}

// 获取所有满足条件的版本号
function getNpmSemverVersions(baseVersion, versions) {
  return versions
      .filter(version => semver.satisfies(version, `^${baseVersion}`))
      .sort((a, b) => semver.gt(b, a))
}

// 获取满足条件的最大的版本号(过滤以后)
async function getNpmSemverVersion(baseVersion, npmName, registry) {
  const versions = await getNpmVersions(npmName, registry)
  const newVersions = getNpmSemverVersions(baseVersion, versions)
  if (newVersions && newVersions.length > 0) {
      return newVersions[0]
  }
}

export {
  getDefaultRegistry,
  getNpmVersions,
  getNpmSemverVersions,
  getNpmSemverVersion
}
