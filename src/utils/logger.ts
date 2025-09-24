/**
 * 安全的日志记录工具
 * 在生产环境中不记录敏感信息
 */

const isDevelopment = process.env.NODE_ENV === 'development';

interface LogLevel {
  ERROR: 'error';
  WARN: 'warn';
  INFO: 'info';
  DEBUG: 'debug';
}

const LOG_LEVELS: LogLevel = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
};

/**
 * 安全的错误日志记录
 * @param message 错误消息
 * @param error 错误对象（可选）
 * @param context 上下文信息（可选）
 */
export function logError(message: string, error?: any, context?: any): void {
  if (isDevelopment) {
    console.error(`[ERROR] ${message}`, error, context);
  } else {
    // 生产环境只记录安全的错误消息
    console.error(`[ERROR] ${message}`);
  }
}

/**
 * 安全的警告日志记录
 * @param message 警告消息
 * @param context 上下文信息（可选）
 */
export function logWarn(message: string, context?: any): void {
  if (isDevelopment) {
    console.warn(`[WARN] ${message}`, context);
  } else {
    console.warn(`[WARN] ${message}`);
  }
}

/**
 * 安全的信息日志记录
 * @param message 信息消息
 * @param context 上下文信息（可选）
 */
export function logInfo(message: string, context?: any): void {
  if (isDevelopment) {
    console.info(`[INFO] ${message}`, context);
  }
  // 生产环境不记录 info 级别的日志
}

/**
 * 安全的调试日志记录
 * @param message 调试消息
 * @param context 上下文信息（可选）
 */
export function logDebug(message: string, context?: any): void {
  if (isDevelopment) {
    console.debug(`[DEBUG] ${message}`, context);
  }
  // 生产环境不记录 debug 级别的日志
}

/**
 * 清理敏感信息
 * @param data 可能包含敏感信息的数据
 * @returns 清理后的数据
 */
export function sanitizeData(data: any): any {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const sensitiveKeys = [
    'password', 'token', 'apiKey', 'secret', 'key',
    'authorization', 'cookie', 'session', 'auth'
  ];

  const sanitized = { ...data };
  
  for (const key in sanitized) {
    if (sensitiveKeys.some(sensitiveKey => 
      key.toLowerCase().includes(sensitiveKey.toLowerCase())
    )) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object') {
      sanitized[key] = sanitizeData(sanitized[key]);
    }
  }

  return sanitized;
}

/**
 * 安全的性能日志记录
 * @param operation 操作名称
 * @param startTime 开始时间
 */
export function logPerformance(operation: string, startTime: number): void {
  if (isDevelopment) {
    const duration = performance.now() - startTime;
    console.log(`[PERF] ${operation} took ${duration.toFixed(2)}ms`);
  }
}
