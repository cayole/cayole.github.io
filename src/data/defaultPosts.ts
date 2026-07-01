import type { Post } from '../types'

export const defaultPosts: Post[] = [
  {
    id: 'quiet-software',
    slug: 'quiet-software',
    title: '安静的软件，和那些没有提示音的决定',
    excerpt: '我开始重新理解“好用”：不是更多的入口，而是让正确的动作自然发生，让界面在完成任务后安静地退场。',
    date: '2026-06-22',
    readTime: 7,
    tags: ['设计', '随笔'],
    cover: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=1800&q=85',
    content: `## 界面不是主角

我们常把“功能丰富”当成进步，却很少计算注意力被切碎的成本。真正成熟的工具，往往不会一直提醒你它的存在。

> 好的软件像一张整理干净的书桌：东西都在，但没有任何一件东西抢着说话。

### 从减少开始

我最近给自己的项目加了一条规则：每增加一个入口，都要回答它替代了哪一次犹豫。答不上来，就先不做。

\`\`\`ts
type Decision = {
  action: string
  removesFriction: boolean
}

const shouldShip = (decision: Decision) =>
  decision.removesFriction
\`\`\`

这不是极简主义，而是把复杂度留给系统，不留给使用系统的人。`,
  },
  {
    id: 'between-iterations',
    slug: 'between-iterations',
    title: '迭代之间，留一点空白',
    excerpt: '暂停并不是开发流程的空洞。很多真正重要的判断，只会在光标停止闪烁之后出现。',
    date: '2026-06-03',
    readTime: 5,
    tags: ['开发', '方法'],
    cover: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1800&q=85',
    content: `## 速度不是唯一变量

连续交付很容易被误解为连续敲击键盘。可一个系统的质量，往往取决于我们有没有在两个版本之间停下来，看清楚变化本身。

如果把一次迭代的价值写成一个极简模型：

$$
V = \\frac{I \\times C}{D + 1}
$$

其中 $I$ 是洞察，$C$ 是清晰度，$D$ 是无效决策。速度并未消失，它只是不能单独构成价值。

### 我的停顿清单

- 这次改动解决的是症状，还是结构？
- 删除它，用户是否真的会感知？
- 六个月后的我，能否在十分钟内理解它？

空白不是浪费。它是判断发生的地方。`,
  },
  {
    id: 'notes-from-a-small-window',
    slug: 'notes-from-a-small-window',
    title: '从一扇小窗里观察世界',
    excerpt: '六月的光每天都从同一个角度进来，但落在桌上的位置从不完全相同。重复生活里，变化通常很轻。',
    date: '2026-05-18',
    readTime: 4,
    tags: ['日常', '摄影'],
    cover: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1800&q=85',
    content: `## 六点四十分的光

窗帘没有完全拉开。光越过杯沿，在桌上留下一个短暂的椭圆。大约十二分钟后，它就移动到了键盘下面。

![窗边的书桌](https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1600&q=85)

我没有急着拍照。先看了一会儿。

我们总想把感受保存成文件，好像保存之后才算真正拥有。但也有一些东西，适合只存在于当时。`,
  },
]
