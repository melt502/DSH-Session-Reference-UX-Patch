# DSH Session Reference UX Patch

独立、可回滚的 DSH Desktop 安装态补丁插件。它保存经过验证的 5 个插件产物，并在 DSH Host 启动时检查/重新应用，防止 Desktop 或相关包更新静默覆盖修改。

## 功能

- 空 `@` 只查询当前工作区 Session，并将标题读取限制为 8 个，改善响应速度。
- Session 候选以对话标题为主，无标题时显示短 ID。
- `@` 候选使用两行布局。
- 侧边栏 Session 可拖入输入区形成原子引用。
- 拖放与侧边栏排序隔离；校验 canonical mention、自引用和最多 3 个不同 Session。

## 命令

```powershell
cd D:\chat\dsh-session-reference-ux-patch
node bin\patch.mjs doctor
node bin\patch.mjs apply
node bin\patch.mjs restore
```

可用 `DSH_DESKTOP_UNPACKED` 覆盖 DSH 安装根目录；默认：

```text
D:\dsh\DSH Desktop\resources\app.asar.unpacked
```

## 安装到 web profile

在 `C:\Users\tt123\.dsh\profiles\web\package.json` 中加入：

```json
"dsh-session-reference-ux-patch": "link:D:/chat/dsh-session-reference-ux-patch"
```

并将 `dsh-session-reference-ux-patch` 加入 `dsh.profile.bundles`。随后重启 DSH Desktop。

## 更新后的行为

启动时插件运行 `apply --quiet`：

- 文件未变化：不写盘。
- 上游更新覆盖目标：先按 SHA-256 保存新上游文件到 `patches/backups/`，再应用模板。
- 上游大改导致模板不兼容：插件不会自动知道语义变化；应运行 `doctor`、语法检查并人工回归。模板是完整编译产物，因此适配新 DSH 版本时应重新生成，不建议长期跨大版本强制覆盖。

## 回滚

执行 `restore`，然后从 profile 的 bundles/dependencies 删除本插件并重启 DSH Desktop。

## 注意

本插件把安装态热修复变成可重复、可检测、可回滚的补丁，但并不等同于上游源码合并。目标包跨版本更新后仍需兼容性复核。
