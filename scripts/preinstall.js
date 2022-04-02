// 执行安装包命令的校验
if (!/pnpm/.test(process.env.npm_execpath || '')) {
  console.log(
    `\u001b[33mThis repository requires using pnpm as the package manager ` +
      ` for scripts to work properly.\u001b[39m\n`
  )
  // 如果不是pnpm安装 跳出当前进程 0 为成功 1为失败
  process.exit(1)
}
