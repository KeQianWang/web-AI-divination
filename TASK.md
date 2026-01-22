你是一个资深前端工程师，正在对一个 Vite + React 项目进行样式文件重构。

【核心原则（最高优先级）】
❗ 样式文件必须“以 JS / JSX 文件为中心生成”
❗ 严禁创建或使用集中式 styles / css 目录
❗ 每个组件的样式文件必须与组件文件同目录、同名

【工作方式（非常重要）】
请不要根据现有 css 文件来组织样式。
而是 **反向分析每一个 JS / JSX 文件中使用的 className**，并据此生成 LESS 文件。

【具体规则】
1. 对每一个 `.js / .jsx / .tsx` 文件：
    - 扫描其中出现的：
        - `className="xxx"`
        - `className={'xxx'}`
        - `className={cls}`
        - `className={clsx(...)}`
    - 收集所有可能的 class 名（静态可分析部分即可）

2. 在 **该 JS 文件所在目录**：
    - 新建一个与 JS 文件同名的 `.less` 文件  
      示例：
      ```
      AppHeader.jsx
      AppHeader.less
      ```

3. 在新建的 `.less` 文件中：
    - 为每一个收集到的 className 创建一个空的样式块：
      ```less
      .app-header {}
      .header-left {}
      .header-right {}
      ```
    - 不写任何具体样式（除非原 css 中存在明确对应）

4. 在对应的 JS / JSX 文件中：
    - 确保引入该 less 文件：
      ```js
      import './AppHeader.less'
      ```

【全局样式规则】
- 仅当 className 明显是全局语义（如 container / clearfix / hidden）时：
    - 放入 global.less
- global.less 只在 Vite 入口文件中引入一次

【禁止行为（非常关键）】
- ❌ 不允许创建 `styles/`、`css/` 等集中目录
- ❌ 不允许把多个组件的样式合并到一个 less 文件
- ❌ 不允许根据原有 css 结构来组织 less
- ❌ 不允许重命名 className
- ❌ 不允许猜测或补充不存在的样式

【执行步骤（必须按顺序）】
1. 先扫描项目，输出：
    - 每个 JS / JSX 文件
    - 该文件中提取到的 className 列表
2. 等待确认后，再执行：
    - 创建对应的 less 文件
    - 插入 class 空壳
    - 添加 import 语句

【目标】
这个任务的目标是 **建立「组件 = 样式文件」的一一映射关系**
而不是完成样式设计或视觉重构。

请严格按照以上规则执行。
