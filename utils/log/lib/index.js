'use strict';

import log from 'npmlog'

// 降级处理 log 添加debug模式
log.level = process.env.LOG_LEVEL || 'info';
// 修改前缀
log.heading = 'zzz-cli';
// 添加自定义log
log.addLevel('success', 2000, { fg: 'green', bold: true });

export default log;