---
title: 安静的软件，和那些没有提示音的决定
excerpt: 我开始重新理解“好用”：不是更多的入口，而是让正确的动作自然发生，让界面在完成任务后安静地退场。
date: 2026-06-22
readTime: 7
tags: 设计, 随笔
cover: https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=1800&q=85
---

## 界面不是主角

我们常把“功能丰富”当成进步，却很少计算注意力被切碎的成本。真正成熟的工具，往往不会一直提醒你它的存在。

> 好的软件像一张整理干净的书桌：东西都在，但没有任何一件东西抢着说话。

### 从减少开始

我最近给自己的项目加了一条规则：每增加一个入口，都要回答它替代了哪一次犹豫。答不上来，就先不做。

```ts
type Decision = {
  action: string
  removesFriction: boolean
}

const shouldShip = (decision: Decision) =>
  decision.removesFriction
```

这不是极简主义，而是把复杂度留给系统，不留给使用系统的人。

