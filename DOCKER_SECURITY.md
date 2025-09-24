# Docker 安全最佳实践

## 🔒 安全配置说明

### 1. `.dockerignore` 安全防护

#### 恶意文件防护
```dockerfile
# 恶意文件常用目录
temp
tmp
uploads
exports

# 可执行文件和脚本
*.sh
*.bin
*.out
*.log
*.py
```

#### 敏感文件防护
```dockerfile
# 环境变量文件
.env
.env.*
.env.local
.env.development.local
.env.test.local
.env.production.local

# 开发工具
.vscode
.DS_Store
```

### 2. Dockerfile 安全配置

#### 非特权用户
```dockerfile
# 创建非特权用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs
```

#### 健康检查
```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1
```

### 3. Docker Compose 生产环境配置

#### 安全选项
```yaml
security_opt:
  - no-new-privileges:true
  - seccomp:unconfined
```

#### 只读根文件系统
```yaml
read_only: true
tmpfs:
  - /tmp:noexec,nosuid,size=100m
  - /var/tmp:noexec,nosuid,size=100m
```

#### 资源限制
```yaml
deploy:
  resources:
    limits:
      memory: 512M
      cpus: '0.5'
    reservations:
      memory: 256M
      cpus: '0.25'
```

## 🚀 部署命令

### 启动服务
```bash
docker-compose up -d
```

### 停止服务
```bash
docker-compose down
```

### 重新构建并启动
```bash
docker-compose up -d --build
```

## ⚠️ 安全注意事项

1. **锁文件保护**: 保留 `pnpm-lock.yaml` 文件，确保依赖版本一致性
2. **非 root 用户**: 容器以非特权用户运行，降低权限提升风险
3. **只读文件系统**: 防止恶意文件写入，阻断病毒 drop 文件
4. **资源限制**: 防止资源耗尽攻击
5. **健康检查**: 监控容器状态，及时发现异常

## 🔍 安全监控

### 健康检查端点
- URL: `http://localhost:3000/api/health`
- 检查内容: 应用状态、运行时间、环境信息

### 日志监控
```bash
# 查看容器日志
docker-compose logs -f web

# 查看健康检查状态
docker-compose ps
```

## 📋 安全检查清单

- [ ] 使用非特权用户运行容器
- [ ] 启用只读根文件系统
- [ ] 配置资源限制
- [ ] 启用健康检查
- [ ] 排除敏感文件
- [ ] 使用多阶段构建
- [ ] 定期更新基础镜像
- [ ] 监控容器资源使用
