# DSH Session Reference UX Patch

独立、可回滚的 DSH Desktop 安装态补丁插件。它保存经过验证的 5 个插件产物，并在 DSH Host 启动时检查/重新应用，防止 Desktop 或相关包更新静默覆盖修改。

当前版本适配 **DSH 上游 0.1.2-rc.1**（`2026‑08‑29` 重构：conversation 输入改为 Lexical editor、session-reference 预览标题改为投影读取、候选新增 `sameWorkspace` 字段）。

## 功能

- 空 `@` 只查询当前工作区 Session；查询非空时仍跨全部工作区搜索。
- 空查询把文件/Session 候选各限制为 8 个，菜单打开更快。
- Session 候选主行就是对话标题，无标题时回退到 Session ID（空白标题也回退）。
- `@` 候选使用两行布局（标题 + 副行），副行带完整描述悬停提示。
- 侧边栏 Session 可拖入输入区形成原子引用（`keyboard.insertReference` + Lexical caret span）。
- 拖放与侧边栏排序隔离：命中输入区 `dropEffect='copy'` 不触发行重排。
- 校验 canonical mention、拒绝自引用、最多 3 个不同 Session。

## 命令

```powershell
cd dsh-session-reference-ux-patch
node bin\patch.mjs doctor
node bin\patch.mjs apply
node bin\patch.mjs restore
```

可用 `DSH_DESKTOP_UNPACKED` 覆盖 DSH 安装根目录；默认：

```text
D:\dsh\DSH Desktop\resources\app.asar.unpacked
```

## 安装到 web profile

在 `<DSH_HOME>\profiles\web\package.json`（例如 `%USERPROFILE%\.dsh\profiles\web\package.json`）中加入：

```json
"dsh-session-reference-ux-patch": "link:<repo-path>"
```

并将 `dsh-session-reference-ux-patch` 加入 `dsh.profile.bundles`。随后重启 DSH Desktop。

## 更新后的行为

启动时插件运行 `apply --quiet`：

- 文件未变化：不写盘。
- 上游更新覆盖目标：先按 SHA-256 保存新上游文件到 `patches/backups/`，再应用模板。
- 上游大改导致模板不兼容：插件不会自动知道语义变化；应运行 `doctor`、语法检查并人工回归。模板是完整编译产物，因此适配新 DSH 版本时应重新生成，不建议长期跨大版本强制覆盖。

## 版本历史

- **0.2.0** — 适配 DSH 0.1.2‑rc.1：重写全部 5 个补丁到新上游基线上；沿用空查询工作区过滤与 8 个限制、两行布局、拖放引用；借助上游新的投影标题/`sameWorkspace` 减少宿主端改动。
- **0.1.0** — 初始版本（旧上游基线）。

## 回滚

执行 `restore`，然后从 profile 的 bundles/dependencies 删除本插件并重启 DSH Desktop。

## 注意

本插件把安装态热修复变成可重复、可检测、可回滚的补丁，但并不等同于上游源码合并。目标包跨版本更新后仍需兼容性复核。
