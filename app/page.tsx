"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";

type Category = {
  id: string;
  name: string;
  color: string;
};

type PromptItem = {
  id: string;
  title: string;
  content: string;
  categoryId: string;
  tags: string[];
  favorite: boolean;
  createdAt: number;
  updatedAt: number;
};

type PromptDraft = Omit<PromptItem, "id" | "createdAt" | "updatedAt" | "favorite"> & {
  id?: string;
  favorite?: boolean;
};

type Theme = "light" | "dark";

const STORAGE_KEY = "prompt-pocket-data-v1";
const PALETTE = ["#ef8354", "#5b8def", "#8b6fd6", "#2a9d8f", "#d4a72c", "#d75d8d"];

const starterCategories: Category[] = [
  { id: "writing", name: "内容写作", color: "#ef8354" },
  { id: "coding", name: "编程开发", color: "#5b8def" },
  { id: "research", name: "研究分析", color: "#8b6fd6" },
  { id: "images", name: "图像创作", color: "#2a9d8f" },
];

const starterPrompts: PromptItem[] = [
  {
    id: "starter-1",
    title: "把复杂概念讲清楚",
    content: "请用清晰、自然的中文解释以下概念。先用一句话给出核心结论，再用一个生活化的类比展开，最后列出三个常见误区。内容：{{粘贴内容}}",
    categoryId: "writing",
    tags: ["解释", "通用"],
    favorite: true,
    createdAt: 1725321600000,
    updatedAt: 1725321600000,
  },
  {
    id: "starter-2",
    title: "代码审查助手",
    content: "你是一名资深工程师。请审查下面的代码，优先找出会导致错误、数据丢失或安全问题的地方。按严重程度排序，并为每个问题给出最小修改方案。\n\n{{粘贴代码}}",
    categoryId: "coding",
    tags: ["代码审查", "开发"],
    favorite: true,
    createdAt: 1725408000000,
    updatedAt: 1725408000000,
  },
  {
    id: "starter-3",
    title: "深度研究提纲",
    content: "围绕主题「{{主题}}」制定一份研究提纲。区分事实、观点和待验证假设，列出需要查找的一手资料，并给出最终报告的章节结构。",
    categoryId: "research",
    tags: ["研究", "提纲"],
    favorite: false,
    createdAt: 1725494400000,
    updatedAt: 1725494400000,
  },
  {
    id: "starter-4",
    title: "产品图视觉描述",
    content: "为以下产品撰写一段可用于图像生成的视觉描述：主体居中，柔和的工作室侧光，真实材质，高级但克制的配色，背景干净，保留充足留白。产品：{{产品信息}}",
    categoryId: "images",
    tags: ["图像", "产品"],
    favorite: false,
    createdAt: 1725580800000,
    updatedAt: 1725580800000,
  },
  {
    id: "starter-5",
    title: "会议纪要整理",
    content: "请把以下会议记录整理为：1. 一句话结论；2. 已确认的决策；3. 待办事项（负责人、截止时间）；4. 尚未解决的问题。不要补充原文中不存在的信息。\n\n{{会议记录}}",
    categoryId: "writing",
    tags: ["办公", "总结"],
    favorite: false,
    createdAt: 1725667200000,
    updatedAt: 1725667200000,
  },
  {
    id: "starter-6",
    title: "SQL 查询优化",
    content: "分析下面的 SQL 查询和表结构，解释性能瓶颈，给出索引建议与改写后的查询，并说明每项修改的预期收益。\n\n{{SQL 与表结构}}",
    categoryId: "coding",
    tags: ["SQL", "性能"],
    favorite: false,
    createdAt: 1725753600000,
    updatedAt: 1725753600000,
  },
];

const blankDraft = (categoryId: string): PromptDraft => ({
  title: "",
  content: "",
  categoryId,
  tags: [],
});

function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat("zh-CN", { month: "short", day: "numeric" }).format(timestamp);
}

function icon(name: string) {
  const icons: Record<string, string> = {
    search: "⌕",
    copy: "⧉",
    favorite: "★",
    more: "•••",
    add: "+",
    close: "×",
    export: "↗",
    import: "↙",
    menu: "☰",
    check: "✓",
    back: "←",
  };
  return icons[name];
}

export default function Home() {
  const [categories, setCategories] = useState<Category[]>(starterCategories);
  const [prompts, setPrompts] = useState<PromptItem[]>(starterPrompts);
  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [editor, setEditor] = useState<PromptDraft | null>(null);
  const [tagText, setTagText] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState("");
  const [categoryManagerOpen, setCategoryManagerOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PromptItem | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [theme, setTheme] = useState<Theme>("light");
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as { categories: Category[]; prompts: PromptItem[] };
        if (Array.isArray(parsed.categories) && Array.isArray(parsed.prompts)) {
          setCategories(parsed.categories);
          setPrompts(parsed.prompts);
        }
      }
      const savedTheme = window.localStorage.getItem("prompt-pocket-theme");
      const preferredTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      setTheme(savedTheme === "dark" || savedTheme === "light" ? savedTheme : preferredTheme);
    } catch {
      setToast("本地数据读取失败，已载入示例内容");
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    if (hydrated) window.localStorage.setItem("prompt-pocket-theme", theme);
  }, [hydrated, theme]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ categories, prompts }));
  }, [categories, hydrated, prompts]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        document.querySelector<HTMLInputElement>(".search-box input")?.focus();
      }
      if (event.key === "Escape") {
        setEditor(null);
        setCategoryManagerOpen(false);
        setDeleteTarget(null);
      }
    }
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  const filteredPrompts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return [...prompts]
      .filter((prompt) => {
        const matchesFilter =
          activeFilter === "all"
            ? true
            : activeFilter === "favorites"
              ? prompt.favorite
              : prompt.categoryId === activeFilter;
        const matchesSearch =
          !query ||
          prompt.title.toLowerCase().includes(query) ||
          prompt.content.toLowerCase().includes(query) ||
          prompt.tags.some((tag) => tag.toLowerCase().includes(query));
        return matchesFilter && matchesSearch;
      })
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }, [activeFilter, prompts, search]);

  const activeTitle =
    activeFilter === "all"
      ? "全部提示词"
      : activeFilter === "favorites"
        ? "我的收藏"
        : categories.find((category) => category.id === activeFilter)?.name ?? "提示词";

  function showToast(message: string) {
    setToast(message);
  }

  function openCreate() {
    const categoryId = categories.some((category) => category.id === activeFilter)
      ? activeFilter
      : categories[0]?.id ?? "uncategorized";
    setEditor(blankDraft(categoryId));
    setTagText("");
  }

  function openEdit(prompt: PromptItem) {
    setEditor({
      id: prompt.id,
      title: prompt.title,
      content: prompt.content,
      categoryId: prompt.categoryId,
      tags: prompt.tags,
      favorite: prompt.favorite,
    });
    setTagText(prompt.tags.join("，"));
  }

  function savePrompt(event: FormEvent) {
    event.preventDefault();
    if (!editor || !editor.title.trim() || !editor.content.trim()) return;
    const now = Date.now();
    const cleanTags = tagText
      .split(/[,，]/)
      .map((tag) => tag.trim())
      .filter(Boolean)
      .slice(0, 8);

    if (editor.id) {
      setPrompts((current) =>
        current.map((prompt) =>
          prompt.id === editor.id
            ? {
                ...prompt,
                title: editor.title.trim(),
                content: editor.content.trim(),
                categoryId: editor.categoryId,
                tags: cleanTags,
                updatedAt: now,
              }
            : prompt,
        ),
      );
      showToast("提示词已更新");
    } else {
      setPrompts((current) => [
        {
          id: crypto.randomUUID(),
          title: editor.title.trim(),
          content: editor.content.trim(),
          categoryId: editor.categoryId,
          tags: cleanTags,
          favorite: false,
          createdAt: now,
          updatedAt: now,
        },
        ...current,
      ]);
      showToast("提示词已保存到本地");
    }
    setEditor(null);
  }

  async function copyPrompt(prompt: PromptItem) {
    try {
      await navigator.clipboard.writeText(prompt.content);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = prompt.content;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
    }
    setCopiedId(prompt.id);
    showToast("已复制到剪贴板");
    window.setTimeout(() => setCopiedId(null), 1600);
  }

  function toggleFavorite(id: string) {
    setPrompts((current) =>
      current.map((prompt) =>
        prompt.id === id ? { ...prompt, favorite: !prompt.favorite, updatedAt: Date.now() } : prompt,
      ),
    );
  }

  function addCategory(event: FormEvent) {
    event.preventDefault();
    const name = newCategory.trim();
    if (!name) return;
    const id = `category-${Date.now()}`;
    setCategories((current) => [
      ...current,
      { id, name, color: PALETTE[current.length % PALETTE.length] },
    ]);
    setNewCategory("");
    setActiveFilter(id);
    showToast("分类已创建");
  }

  function renameCategory(id: string, name: string) {
    if (!name.trim()) return;
    setCategories((current) =>
      current.map((category) => (category.id === id ? { ...category, name: name.trim() } : category)),
    );
  }

  function deleteCategory(id: string) {
    if (categories.length <= 1) {
      showToast("至少需要保留一个分类");
      return;
    }
    const fallbackId = categories.find((category) => category.id !== id)?.id ?? "";
    setPrompts((current) =>
      current.map((prompt) => (prompt.categoryId === id ? { ...prompt, categoryId: fallbackId } : prompt)),
    );
    setCategories((current) => current.filter((category) => category.id !== id));
    if (activeFilter === id) setActiveFilter("all");
    showToast("分类已删除，内容已移入其他分类");
  }

  function exportData() {
    const payload = JSON.stringify(
      { version: 1, exportedAt: new Date().toISOString(), categories, prompts },
      null,
      2,
    );
    const blob = new Blob([payload], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `提示词备份-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
    showToast("本地备份已导出");
  }

  function importData(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as {
          categories?: Category[];
          prompts?: PromptItem[];
        };
        if (!Array.isArray(parsed.categories) || !Array.isArray(parsed.prompts)) throw new Error();
        setCategories(parsed.categories);
        setPrompts(parsed.prompts);
        setActiveFilter("all");
        showToast(`已恢复 ${parsed.prompts.length} 条提示词`);
      } catch {
        showToast("无法读取这个备份文件");
      }
      event.target.value = "";
    };
    reader.readAsText(file);
  }

  function selectFilter(filter: string) {
    setActiveFilter(filter);
    setMobileSidebarOpen(false);
  }

  return (
    <main className="app-shell">
      <aside className={`sidebar ${mobileSidebarOpen ? "sidebar-open" : ""}`}>
        <div className="brand-row">
          <div className="brand-mark"><span>p</span></div>
          <div>
            <div className="brand-name">Prompt Pocket</div>
            <div className="brand-subtitle">你的本地提示词库</div>
          </div>
          <button className="mobile-close" onClick={() => setMobileSidebarOpen(false)} aria-label="关闭菜单">
            {icon("close")}
          </button>
        </div>

        <nav className="main-nav" aria-label="提示词导航">
          <button className={activeFilter === "all" ? "nav-item active" : "nav-item"} onClick={() => selectFilter("all")}>
            <span className="nav-symbol">▦</span>
            <span>全部提示词</span>
            <span className="nav-count">{prompts.length}</span>
          </button>
          <button className={activeFilter === "favorites" ? "nav-item active" : "nav-item"} onClick={() => selectFilter("favorites")}>
            <span className="nav-symbol star">☆</span>
            <span>我的收藏</span>
            <span className="nav-count">{prompts.filter((prompt) => prompt.favorite).length}</span>
          </button>
        </nav>

        <div className="category-heading">
          <span>分类</span>
          <button onClick={() => setCategoryManagerOpen(true)}>管理</button>
        </div>
        <div className="category-list">
          {categories.map((category) => (
            <button
              className={activeFilter === category.id ? "category-item active" : "category-item"}
              key={category.id}
              onClick={() => selectFilter(category.id)}
            >
              <span className="category-dot" style={{ background: category.color }} />
              <span>{category.name}</span>
              <span className="nav-count">
                {prompts.filter((prompt) => prompt.categoryId === category.id).length}
              </span>
            </button>
          ))}
        </div>

        <form className="quick-category" onSubmit={addCategory}>
          <span>{icon("add")}</span>
          <input
            value={newCategory}
            onChange={(event) => setNewCategory(event.target.value)}
            placeholder="新建分类"
            aria-label="新分类名称"
          />
        </form>

        <div className="sidebar-footer">
          <div className="local-status">
            <span className="status-dot" />
            <div>
              <strong>仅存储在本机</strong>
              <small>不会上传到云端</small>
            </div>
          </div>
          <div className="backup-actions">
            <button onClick={() => fileInput.current?.click()} title="导入本地备份">
              <span>{icon("import")}</span> 导入
            </button>
            <button onClick={exportData} title="导出本地备份">
              <span>{icon("export")}</span> 备份
            </button>
          </div>
          <input ref={fileInput} type="file" accept="application/json,.json" hidden onChange={importData} />
        </div>
      </aside>

      {mobileSidebarOpen && <button className="sidebar-backdrop" aria-label="关闭菜单" onClick={() => setMobileSidebarOpen(false)} />}

      <section className="workspace">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setMobileSidebarOpen(true)} aria-label="打开菜单">
            {icon("menu")}
          </button>
          <label className="search-box">
            <span>{icon("search")}</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="搜索标题、内容或标签…"
            />
            {search && <button onClick={() => setSearch("")} aria-label="清空搜索">{icon("close")}</button>}
            <kbd>⌘ K</kbd>
          </label>
          <button
            className="theme-button"
            onClick={() => setTheme((current) => current === "light" ? "dark" : "light")}
            aria-label={theme === "light" ? "切换到暗夜模式" : "切换到明亮模式"}
            title={theme === "light" ? "暗夜模式" : "明亮模式"}
          >
            <span>{theme === "light" ? "◐" : "☀"}</span>
          </button>
          <button className="primary-button" onClick={openCreate}>
            <span>{icon("add")}</span> 新建提示词
          </button>
        </header>

        <div className="content-area">
          <div className="content-heading">
            <div>
              <div className="eyebrow">本地资料库</div>
              <h1>{activeTitle}</h1>
              <p>{search ? `找到 ${filteredPrompts.length} 条匹配结果` : `${filteredPrompts.length} 条提示词，随用随取`}</p>
            </div>
            <div className="privacy-pill"><span /> 本地自动保存</div>
          </div>

          {filteredPrompts.length ? (
            <div className="prompt-grid">
              {filteredPrompts.map((prompt) => {
                const category = categories.find((item) => item.id === prompt.categoryId);
                return (
                  <article className="prompt-card" key={prompt.id}>
                    <div className="card-topline">
                      <span className="category-badge" style={{ "--badge-color": category?.color ?? "#777" } as React.CSSProperties}>
                        <i /> {category?.name ?? "未分类"}
                      </span>
                      <div className="card-actions">
                        <button
                          className={prompt.favorite ? "favorite-button is-favorite" : "favorite-button"}
                          onClick={() => toggleFavorite(prompt.id)}
                          aria-label={prompt.favorite ? "取消收藏" : "添加收藏"}
                        >
                          {icon("favorite")}
                        </button>
                        <div className="card-menu-wrap">
                          <button className="more-button" aria-label="更多操作">{icon("more")}</button>
                          <div className="card-menu">
                            <button onClick={() => openEdit(prompt)}>编辑</button>
                            <button className="danger" onClick={() => setDeleteTarget(prompt)}>删除</button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <button className="card-body" onClick={() => openEdit(prompt)} aria-label={`编辑 ${prompt.title}`}>
                      <h2>{prompt.title}</h2>
                      <p>{prompt.content}</p>
                    </button>
                    <div className="tag-row">
                      {prompt.tags.slice(0, 3).map((tag) => <span key={tag}>#{tag}</span>)}
                    </div>
                    <div className="card-footer">
                      <span>{formatDate(prompt.updatedAt)} 更新</span>
                      <button className={copiedId === prompt.id ? "copy-button copied" : "copy-button"} onClick={() => copyPrompt(prompt)}>
                        <span>{copiedId === prompt.id ? icon("check") : icon("copy")}</span>
                        {copiedId === prompt.id ? "已复制" : "复制提示词"}
                      </button>
                    </div>
                  </article>
                );
              })}
              <button className="new-card" onClick={openCreate}>
                <span>{icon("add")}</span>
                <strong>添加新的提示词</strong>
                <small>把好想法收进口袋</small>
              </button>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-mark">⌕</div>
              <h2>{search ? "没有找到匹配内容" : "这里还是空的"}</h2>
              <p>{search ? "换个关键词试试，或清空当前搜索。" : "创建第一条提示词，之后就能一键复制使用。"}</p>
              <button className="primary-button" onClick={search ? () => setSearch("") : openCreate}>
                {search ? "清空搜索" : "新建提示词"}
              </button>
            </div>
          )}
        </div>
      </section>

      {editor && (
        <div className="modal-layer" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setEditor(null)}>
          <form className="editor-modal" onSubmit={savePrompt}>
            <div className="modal-header">
              <div>
                <span className="eyebrow">{editor.id ? "编辑内容" : "收进口袋"}</span>
                <h2>{editor.id ? "编辑提示词" : "新建提示词"}</h2>
              </div>
              <button type="button" className="close-button" onClick={() => setEditor(null)} aria-label="关闭">{icon("close")}</button>
            </div>
            <div className="modal-content">
              <label className="field">
                <span>标题</span>
                <input
                  autoFocus
                  value={editor.title}
                  onChange={(event) => setEditor({ ...editor, title: event.target.value })}
                  placeholder="例如：文章标题生成器"
                  required
                />
              </label>
              <label className="field">
                <span>提示词内容</span>
                <textarea
                  value={editor.content}
                  onChange={(event) => setEditor({ ...editor, content: event.target.value })}
                  placeholder="在这里输入完整的提示词…"
                  rows={10}
                  required
                />
                <small>{editor.content.length} 个字符</small>
              </label>
              <div className="field-row">
                <label className="field">
                  <span>分类</span>
                  <select value={editor.categoryId} onChange={(event) => setEditor({ ...editor, categoryId: event.target.value })}>
                    {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                  </select>
                </label>
                <label className="field">
                  <span>标签 <em>用逗号分隔</em></span>
                  <input value={tagText} onChange={(event) => setTagText(event.target.value)} placeholder="写作，营销，常用" />
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <span>保存后仅写入此浏览器</span>
              <div>
                <button type="button" className="secondary-button" onClick={() => setEditor(null)}>取消</button>
                <button type="submit" className="primary-button">{editor.id ? "保存修改" : "保存提示词"}</button>
              </div>
            </div>
          </form>
        </div>
      )}

      {categoryManagerOpen && (
        <div className="modal-layer" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setCategoryManagerOpen(false)}>
          <div className="category-modal">
            <div className="modal-header">
              <div>
                <span className="eyebrow">整理资料库</span>
                <h2>管理分类</h2>
              </div>
              <button className="close-button" onClick={() => setCategoryManagerOpen(false)} aria-label="关闭">{icon("close")}</button>
            </div>
            <div className="category-editor-list">
              {categories.map((category) => (
                <div className="category-editor-row" key={category.id}>
                  <span className="category-color-large" style={{ background: category.color }} />
                  <input value={category.name} onChange={(event) => renameCategory(category.id, event.target.value)} aria-label="分类名称" />
                  <span>{prompts.filter((prompt) => prompt.categoryId === category.id).length} 条</span>
                  <button onClick={() => deleteCategory(category.id)} aria-label={`删除 ${category.name}`}>删除</button>
                </div>
              ))}
              <form className="category-add-row" onSubmit={addCategory}>
                <span>{icon("add")}</span>
                <input value={newCategory} onChange={(event) => setNewCategory(event.target.value)} placeholder="输入新分类名称" />
                <button>添加</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="modal-layer" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setDeleteTarget(null)}>
          <div className="confirm-modal">
            <div className="confirm-icon">!</div>
            <h2>删除这条提示词？</h2>
            <p>“{deleteTarget.title}” 将从本地永久删除，此操作无法撤销。</p>
            <div>
              <button className="secondary-button" onClick={() => setDeleteTarget(null)}>取消</button>
              <button className="danger-button" onClick={() => {
                setPrompts((current) => current.filter((prompt) => prompt.id !== deleteTarget.id));
                setDeleteTarget(null);
                showToast("提示词已删除");
              }}>确认删除</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast"><span>{icon("check")}</span>{toast}</div>}
    </main>
  );
}
