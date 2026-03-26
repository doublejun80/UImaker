import type { Language, NodeStyles, StoredProject, UiverseNode } from "@uiverse/schema";
import { applyDesignKitToProject } from "./design-kits";
import { createMockImageDataUri } from "./image-placeholders";

type LocalizedText = Record<Language, string>;

type TemplateLayoutMode = "split" | "centered" | "spotlight";
type TemplatePreviewStyle =
  | "marketing"
  | "story"
  | "event"
  | "dashboard"
  | "product"
  | "portfolio"
  | "editorial"
  | "docs"
  | "app"
  | "commerce";

interface TemplateTheme {
  canvas: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  accent: string;
  accentSoft: string;
  accentText: string;
  text: string;
  muted: string;
  heroGradient: string;
}

interface TemplatePresetDefinition {
  id: string;
  categoryId: string;
  name: LocalizedText;
  focus: LocalizedText;
  description: LocalizedText;
  specializedFor: LocalizedText;
  emphasis: LocalizedText;
  layout: TemplateLayoutMode;
  preview: TemplatePreviewStyle;
  theme: TemplateTheme;
}

interface TemplateCategoryDefinition {
  id: string;
  name: LocalizedText;
  summary: LocalizedText;
  presets: TemplatePresetDefinition[];
}

export interface ProjectTemplatePresetSummary {
  id: string;
  categoryId: string;
  name: string;
  focus: string;
  description: string;
  specializedFor: string;
  emphasis: string;
  accent: string;
  accentSoft: string;
  preview: TemplatePreviewStyle;
}

export interface ProjectTemplateCategorySummary {
  id: string;
  name: string;
  summary: string;
  presets: ProjectTemplatePresetSummary[];
}

function t(value: LocalizedText, language: Language): string {
  return value[language];
}

function slugify(value: string, fallback = "template"): string {
  const slug = value
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || fallback;
}

function createId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

function createNodeFactory() {
  let nodeCount = 0;

  function nextId(prefix: string): string {
    nodeCount += 1;
    return `${prefix}-${nodeCount}`;
  }

  function box(
    type: UiverseNode["type"],
    name: string,
    styles: NodeStyles,
    children: UiverseNode[] = []
  ): UiverseNode {
    return {
      id: nextId(type),
      type,
      name,
      styles,
      children
    };
  }

  return {
    root: (name: string, styles: NodeStyles, children: UiverseNode[]) => ({
      id: nextId("root"),
      type: "root" as const,
      name,
      styles,
      children
    }),
    section: (name: string, styles: NodeStyles, children: UiverseNode[]) =>
      box("section", name, styles, children),
    container: (name: string, styles: NodeStyles, children: UiverseNode[]) =>
      box("container", name, styles, children),
    stack: (name: string, styles: NodeStyles, children: UiverseNode[]) =>
      box("stack", name, styles, children),
    card: (name: string, styles: NodeStyles, children: UiverseNode[]) => box("card", name, styles, children),
    text: (name: string, text: string, styles: NodeStyles): UiverseNode => ({
      id: nextId("text"),
      type: "text",
      name,
      content: { text },
      styles,
      children: []
    }),
    button: (name: string, label: string, styles: NodeStyles): UiverseNode => ({
      id: nextId("button"),
      type: "button",
      name,
      content: { label },
      styles,
      children: []
    }),
    input: (name: string, placeholder: string, styles: NodeStyles): UiverseNode => ({
      id: nextId("input"),
      type: "input",
      name,
      content: { placeholder },
      styles,
      children: []
    }),
    image: (name: string, src: string, alt: string, styles: NodeStyles): UiverseNode => ({
      id: nextId("image"),
      type: "image",
      name,
      content: { src, alt },
      styles,
      children: []
    })
  };
}

function headingStyles(theme: TemplateTheme, large = false, centered = false): NodeStyles {
  return {
    fontSize: { base: large ? "34px" : "28px", lg: large ? "56px" : "38px" },
    fontWeight: { base: "800" },
    lineHeight: { base: large ? "1.02" : "1.1" },
    color: { base: theme.text },
    textAlign: { base: centered ? "center" : "left" }
  };
}

function bodyStyles(theme: TemplateTheme, centered = false): NodeStyles {
  return {
    fontSize: { base: "16px", lg: "18px" },
    lineHeight: { base: "1.65" },
    color: { base: theme.muted },
    textAlign: { base: centered ? "center" : "left" }
  };
}

function eyebrowStyles(theme: TemplateTheme, centered = false): NodeStyles {
  return {
    fontSize: { base: "13px" },
    fontWeight: { base: "700" },
    letterSpacing: { base: "0.16em" },
    color: { base: theme.accent },
    textAlign: { base: centered ? "center" : "left" }
  };
}

function heroShellStyles(theme: TemplateTheme, layout: TemplateLayoutMode): NodeStyles {
  return {
    display: { base: "flex" },
    direction: { base: "column", lg: layout === "centered" ? "column" : "row" },
    justify: { base: layout === "centered" ? "center" : "between" },
    align: { base: layout === "centered" ? "center" : "stretch" },
    gap: { base: "24px", lg: "36px" },
    padding: { base: "28px", lg: "42px" },
    backgroundGradient: { base: theme.heroGradient },
    borderRadius: { base: "28px" },
    borderWidth: { base: "1px" },
    borderStyle: { base: "solid" },
    borderColor: { base: theme.border }
  };
}

function panelStyles(theme: TemplateTheme, padding = "24px"): NodeStyles {
  return {
    display: { base: "flex" },
    direction: { base: "column" },
    gap: { base: "14px" },
    padding: { base: padding },
    backgroundColor: { base: theme.surface },
    borderRadius: { base: "20px" },
    borderWidth: { base: "1px" },
    borderStyle: { base: "solid" },
    borderColor: { base: theme.border }
  };
}

function softCardStyles(theme: TemplateTheme): NodeStyles {
  return {
    display: { base: "flex" },
    direction: { base: "column" },
    gap: { base: "12px" },
    padding: { base: "18px" },
    backgroundColor: { base: theme.surfaceAlt },
    borderRadius: { base: "18px" },
    borderWidth: { base: "1px" },
    borderStyle: { base: "solid" },
    borderColor: { base: theme.border }
  };
}

function ctaButtonStyles(theme: TemplateTheme, secondary = false): NodeStyles {
  return secondary
    ? {
        padding: { base: "14px 18px" },
        backgroundColor: { base: theme.surfaceAlt },
        color: { base: theme.text },
        fontWeight: { base: "700" },
        borderRadius: { base: "999px" },
        borderWidth: { base: "1px" },
        borderStyle: { base: "solid" },
        borderColor: { base: theme.border }
      }
    : {
        padding: { base: "14px 18px" },
        backgroundGradient: { base: `linear-gradient(135deg, ${theme.accent} 0%, ${theme.accentSoft} 100%)` },
        color: { base: theme.accentText },
        fontWeight: { base: "800" },
        borderRadius: { base: "999px" },
        boxShadow: { base: `0px 18px 42px ${theme.accent}33` }
      };
}

function imageCard(factory: ReturnType<typeof createNodeFactory>, theme: TemplateTheme, label: string): UiverseNode {
  return factory.card("Preview Card", panelStyles(theme), [
    factory.text(
      "Preview Label",
      label,
      { fontSize: { base: "13px" }, fontWeight: { base: "700" }, color: { base: theme.accent } }
    ),
    factory.image(
      "Template Image",
      createMockImageDataUri({
        accent: theme.accent,
        canvas: theme.canvas,
        surface: theme.surface,
        surfaceAlt: theme.surfaceAlt
      }),
      label,
      { width: { base: "100%" }, borderRadius: { base: "18px" } }
    )
  ]);
}

function buildHero(
  factory: ReturnType<typeof createNodeFactory>,
  preset: TemplatePresetDefinition,
  language: Language,
  side: UiverseNode
): UiverseNode {
  const centered = preset.layout === "centered";

  return factory.section("Hero Section", heroShellStyles(preset.theme, preset.layout), [
    factory.stack(
      "Hero Copy",
      {
        display: { base: "flex" },
        direction: { base: "column" },
        gap: { base: "18px" },
        width: { base: "100%", lg: centered ? "100%" : "56%" },
        align: { base: centered ? "center" : "stretch" }
      },
      [
        factory.text("Hero Eyebrow", t(preset.focus, language), eyebrowStyles(preset.theme, centered)),
        factory.text("Hero Title", t(preset.name, language), headingStyles(preset.theme, true, centered)),
        factory.text("Hero Body", t(preset.description, language), bodyStyles(preset.theme, centered)),
        factory.container(
          "Hero Buttons",
          {
            display: { base: "flex" },
            direction: { base: "row" },
            gap: { base: "12px" },
            justify: { base: centered ? "center" : "start" },
            align: { base: "center" }
          },
          [
            factory.button(
              "Primary Action",
              language === "ko" ? "이 샘플로 시작" : "Start with this sample",
              ctaButtonStyles(preset.theme)
            ),
            factory.button(
              "Secondary Action",
              language === "ko" ? "핵심 구조 보기" : "View key structure",
              ctaButtonStyles(preset.theme, true)
            )
          ]
        )
      ]
    ),
    side
  ]);
}

function buildInsightPanel(
  factory: ReturnType<typeof createNodeFactory>,
  preset: TemplatePresetDefinition,
  language: Language,
  extraRows: Array<{ label: string; value: string }>
): UiverseNode {
  return factory.card("Insight Panel", panelStyles(preset.theme), [
    factory.text(
      "Specialized Label",
      language === "ko" ? "특화" : "Specialized for",
      { fontSize: { base: "12px" }, fontWeight: { base: "700" }, letterSpacing: { base: "0.16em" }, color: { base: preset.theme.accent } }
    ),
    factory.text("Specialized Value", t(preset.specializedFor, language), headingStyles(preset.theme, false, false)),
    factory.text(
      "Emphasis Label",
      language === "ko" ? "중점" : "Emphasis",
      { fontSize: { base: "12px" }, fontWeight: { base: "700" }, letterSpacing: { base: "0.16em" }, color: { base: preset.theme.accent } }
    ),
    factory.text("Emphasis Value", t(preset.emphasis, language), bodyStyles(preset.theme, false)),
    factory.container(
      "Insight Rows",
      { display: { base: "grid" }, gridColumns: { base: "2" }, gap: { base: "12px" } },
      extraRows.map((row) =>
        factory.card("Insight Row", softCardStyles(preset.theme), [
          factory.text("Insight Row Label", row.label, { fontSize: { base: "12px" }, color: { base: preset.theme.muted } }),
          factory.text("Insight Row Value", row.value, { fontSize: { base: "18px" }, fontWeight: { base: "700" }, color: { base: preset.theme.text } })
        ])
      )
    )
  ]);
}

function buildFeatureGrid(
  factory: ReturnType<typeof createNodeFactory>,
  theme: TemplateTheme,
  title: string,
  items: Array<{ title: string; body: string }>
): UiverseNode {
  return factory.section("Feature Grid", panelStyles(theme, "28px"), [
    factory.text("Feature Grid Title", title, headingStyles(theme)),
    factory.container(
      "Feature Grid Items",
      { display: { base: "grid" }, gridColumns: { base: "1", lg: "3" }, gap: { base: "16px" } },
      items.map((item) =>
        factory.card("Feature Card", softCardStyles(theme), [
          factory.text("Feature Title", item.title, { fontSize: { base: "20px" }, fontWeight: { base: "700" }, color: { base: theme.text } }),
          factory.text("Feature Body", item.body, bodyStyles(theme))
        ])
      )
    )
  ]);
}

function buildStatStrip(
  factory: ReturnType<typeof createNodeFactory>,
  theme: TemplateTheme,
  stats: Array<{ label: string; value: string }>
): UiverseNode {
  return factory.section(
    "Stat Strip",
    { display: { base: "grid" }, gridColumns: { base: "1", md: "2", lg: "4" }, gap: { base: "14px" } },
    stats.map((stat) =>
      factory.card("Stat Card", softCardStyles(theme), [
        factory.text("Stat Value", stat.value, { fontSize: { base: "26px" }, fontWeight: { base: "800" }, color: { base: theme.text } }),
        factory.text("Stat Label", stat.label, bodyStyles(theme))
      ])
    )
  );
}

function buildChecklistSection(
  factory: ReturnType<typeof createNodeFactory>,
  theme: TemplateTheme,
  title: string,
  items: string[]
): UiverseNode {
  return factory.section("Checklist Section", panelStyles(theme, "28px"), [
    factory.text("Checklist Title", title, headingStyles(theme)),
    factory.stack(
      "Checklist Items",
      { display: { base: "flex" }, direction: { base: "column" }, gap: { base: "12px" } },
      items.map((item) =>
        factory.card("Checklist Item", softCardStyles(theme), [
          factory.text("Checklist Item Text", item, bodyStyles(theme))
        ])
      )
    )
  ]);
}

function marketingPage(
  preset: TemplatePresetDefinition,
  language: Language,
  options: {
    metrics: Array<{ label: string; value: string }>;
    featureTitle: string;
    featureItems: Array<{ title: string; body: string }>;
    checklistTitle: string;
    checklistItems: string[];
    imageLabel: string;
  }
): UiverseNode {
  const factory = createNodeFactory();

  return factory.root(
    t(preset.name, language),
    {
      display: { base: "flex" },
      direction: { base: "column" },
      gap: { base: "24px", lg: "32px" },
      padding: { base: "24px", lg: "48px" },
      backgroundColor: { base: preset.theme.canvas }
    },
    [
      buildHero(
        factory,
        preset,
        language,
        preset.layout === "spotlight"
          ? imageCard(factory, preset.theme, options.imageLabel)
          : buildInsightPanel(factory, preset, language, options.metrics.slice(0, 4))
      ),
      buildStatStrip(factory, preset.theme, options.metrics),
      buildFeatureGrid(factory, preset.theme, options.featureTitle, options.featureItems),
      buildChecklistSection(factory, preset.theme, options.checklistTitle, options.checklistItems)
    ]
  );
}

function dashboardPage(preset: TemplatePresetDefinition, language: Language): UiverseNode {
  const factory = createNodeFactory();
  const theme = preset.theme;
  const metrics =
    preset.id === "admin-ops-pulse"
      ? [
          { label: language === "ko" ? "오늘 처리된 작업" : "Tasks handled today", value: "184" },
          { label: language === "ko" ? "긴급 알림" : "Critical alerts", value: "07" },
          { label: language === "ko" ? "자동화 완료율" : "Automation completion", value: "92%" },
          { label: language === "ko" ? "활성 팀" : "Active teams", value: "14" }
        ]
      : preset.id === "admin-revenue-board"
        ? [
            { label: language === "ko" ? "월 매출" : "Monthly revenue", value: "$128k" },
            { label: language === "ko" ? "전환률" : "Conversion rate", value: "6.8%" },
            { label: language === "ko" ? "파이프라인" : "Pipeline", value: "$480k" },
            { label: language === "ko" ? "업셀 기회" : "Upsell opportunities", value: "21" }
          ]
        : [
            { label: language === "ko" ? "미응답 티켓" : "Open tickets", value: "36" },
            { label: language === "ko" ? "평균 응답 시간" : "Avg. response time", value: "08m" },
            { label: language === "ko" ? "SLA 충족률" : "SLA health", value: "97%" },
            { label: language === "ko" ? "상담 만족도" : "CSAT", value: "4.8" }
          ];

  const boardTitle =
    preset.id === "admin-revenue-board"
      ? language === "ko"
        ? "매출 흐름과 파이프라인을 한눈에 보는 운영판"
        : "A revenue board focused on pipeline and growth visibility"
      : preset.id === "admin-support-desk"
        ? language === "ko"
          ? "대기열, SLA, 우선순위를 빠르게 정리하는 지원 센터"
          : "A support desk layout tuned for queues, SLAs, and priorities"
        : language === "ko"
          ? "실시간 지표와 작업 흐름을 한 화면에 담은 운영 대시보드"
          : "An operations dashboard that keeps metrics and workflow on one screen";

  return factory.root(
    t(preset.name, language),
    {
      display: { base: "flex" },
      direction: { base: "column" },
      gap: { base: "22px", lg: "28px" },
      padding: { base: "24px", lg: "40px" },
      backgroundColor: { base: theme.canvas }
    },
    [
      factory.section("Dashboard Hero", heroShellStyles(theme, preset.layout), [
        factory.stack(
          "Dashboard Hero Copy",
          { display: { base: "flex" }, direction: { base: "column" }, gap: { base: "16px" }, width: { base: "100%", lg: "60%" } },
          [
            factory.text("Dashboard Focus", t(preset.focus, language), eyebrowStyles(theme)),
            factory.text("Dashboard Name", t(preset.name, language), headingStyles(theme, true)),
            factory.text("Dashboard Body", boardTitle, bodyStyles(theme)),
            factory.container(
              "Dashboard Hero Actions",
              { display: { base: "flex" }, direction: { base: "row" }, gap: { base: "12px" } },
              [
                factory.button("Primary Dashboard CTA", language === "ko" ? "보드 열기" : "Open board", ctaButtonStyles(theme)),
                factory.button("Secondary Dashboard CTA", language === "ko" ? "필터 보기" : "View filters", ctaButtonStyles(theme, true))
              ]
            )
          ]
        ),
        buildInsightPanel(factory, preset, language, metrics.slice(0, 4))
      ]),
      buildStatStrip(factory, theme, metrics),
      factory.section(
        "Dashboard Grid",
        { display: { base: "grid" }, gridColumns: { base: "1", lg: "2" }, gap: { base: "16px" } },
        [
          buildChecklistSection(
            factory,
            theme,
            language === "ko" ? "우선 확인 패널" : "Priority queue",
            preset.id === "admin-support-desk"
              ? [
                  language === "ko" ? "응답 대기 시간이 긴 문의 먼저 확인" : "Review conversations with the longest wait time",
                  language === "ko" ? "VIP 고객 태그를 우선 노출" : "Surface VIP tags first",
                  language === "ko" ? "반복 이슈는 자동응답으로 이동" : "Move repetitive issues to automation"
                ]
              : [
                  language === "ko" ? "핵심 지표 변동이 큰 항목을 먼저 본다" : "Check the metrics with the largest movement first",
                  language === "ko" ? "실행 대기 중인 작업을 카드로 묶는다" : "Group pending tasks into action cards",
                  language === "ko" ? "상태 변화를 팀 단위로 비교한다" : "Compare status by team"
                ]
          ),
          buildFeatureGrid(
            factory,
            theme,
            language === "ko" ? "주요 보드 위젯" : "Main board widgets",
            preset.id === "admin-revenue-board"
              ? [
                  { title: language === "ko" ? "수익 추적" : "Revenue tracking", body: language === "ko" ? "월간 흐름과 목표 대비 실적을 함께 본다." : "Keep monthly trends and target progress together." },
                  { title: language === "ko" ? "전환 깔때기" : "Conversion funnel", body: language === "ko" ? "각 단계 이탈을 빠르게 찾는다." : "Spot drop-offs at a glance." },
                  { title: language === "ko" ? "업셀 레이더" : "Upsell radar", body: language === "ko" ? "확장 가능 고객을 따로 묶는다." : "Separate accounts ready for expansion." }
                ]
              : [
                  { title: language === "ko" ? "작업 큐" : "Work queue", body: language === "ko" ? "지금 처리할 항목을 묶어 보여준다." : "Group the work that needs action now." },
                  { title: language === "ko" ? "상태 보드" : "Status board", body: language === "ko" ? "팀별 흐름과 병목을 같이 확인한다." : "Track progress and bottlenecks by team." },
                  { title: language === "ko" ? "알림 패널" : "Alert panel", body: language === "ko" ? "급한 이슈를 카드로 드러낸다." : "Pull critical issues into clear cards." }
                ]
          )
        ]
      )
    ]
  );
}

function docsPage(preset: TemplatePresetDefinition, language: Language): UiverseNode {
  const factory = createNodeFactory();
  const theme = preset.theme;

  return factory.root(
    t(preset.name, language),
    {
      display: { base: "flex" },
      direction: { base: "column" },
      gap: { base: "24px", lg: "30px" },
      padding: { base: "24px", lg: "48px" },
      backgroundColor: { base: theme.canvas }
    },
    [
      factory.section("Docs Hero", heroShellStyles(theme, preset.layout), [
        factory.stack(
          "Docs Hero Stack",
          { display: { base: "flex" }, direction: { base: "column" }, gap: { base: "16px" }, width: { base: "100%", lg: "58%" } },
          [
            factory.text("Docs Focus", t(preset.focus, language), eyebrowStyles(theme)),
            factory.text("Docs Name", t(preset.name, language), headingStyles(theme, true)),
            factory.text("Docs Description", t(preset.description, language), bodyStyles(theme)),
            factory.input(
              "Search Input",
              language === "ko" ? "예: 비밀번호 변경, 결제 실패, 새 프로젝트 만들기" : "Example: change password, payment failed, create project",
              {
                padding: { base: "16px 18px" },
                backgroundColor: { base: theme.surfaceAlt },
                color: { base: theme.text },
                borderRadius: { base: "18px" },
                borderWidth: { base: "1px" },
                borderStyle: { base: "solid" },
                borderColor: { base: theme.border }
              }
            )
          ]
        ),
        buildInsightPanel(factory, preset, language, [
          { label: language === "ko" ? "주요 질문" : "Popular tasks", value: "12" },
          { label: language === "ko" ? "가이드 묶음" : "Guide bundles", value: "08" },
          { label: language === "ko" ? "언어" : "Languages", value: "02" },
          { label: language === "ko" ? "업데이트" : "Freshness", value: "Live" }
        ])
      ]),
      buildFeatureGrid(
        factory,
        theme,
        language === "ko" ? "가장 많이 찾는 작업" : "Most common tasks",
        [
          { title: language === "ko" ? "시작하기" : "Get started", body: language === "ko" ? "처음 10분 안에 끝내는 핵심 흐름을 먼저 보여줍니다." : "Put the core first-10-minutes flow up front." },
          { title: language === "ko" ? "기능별 안내" : "Feature guides", body: language === "ko" ? "기능 단위로 짧고 분리된 문서를 둡니다." : "Break content into short feature-specific guides." },
          { title: language === "ko" ? "문제 해결" : "Troubleshooting", body: language === "ko" ? "오류 중심으로 바로 찾을 수 있게 구성합니다." : "Structure issues around the problem users report." }
        ]
      ),
      buildChecklistSection(
        factory,
        theme,
        language === "ko" ? "추천 목차 구성" : "Recommended structure",
        [
          language === "ko" ? "1. 시작 가이드" : "1. Getting started",
          language === "ko" ? "2. 계정/결제" : "2. Account and billing",
          language === "ko" ? "3. 핵심 기능" : "3. Core features",
          language === "ko" ? "4. 오류와 해결" : "4. Errors and fixes"
        ]
      )
    ]
  );
}

function contentPage(
  preset: TemplatePresetDefinition,
  language: Language,
  options: {
    featureTitle: string;
    featureItems: Array<{ title: string; body: string }>;
    checklistTitle: string;
    checklistItems: string[];
    imageLabel: string;
  }
): UiverseNode {
  return marketingPage(preset, language, {
    metrics: [
      { label: language === "ko" ? "주요 블록" : "Primary blocks", value: "04" },
      { label: language === "ko" ? "카드 구역" : "Card zones", value: "06" },
      { label: language === "ko" ? "강조 액션" : "Priority CTA", value: "02" },
      { label: language === "ko" ? "반응형 단계" : "Responsive steps", value: "03" }
    ],
    featureTitle: options.featureTitle,
    featureItems: options.featureItems,
    checklistTitle: options.checklistTitle,
    checklistItems: options.checklistItems,
    imageLabel: options.imageLabel
  });
}

const TEMPLATE_CATEGORIES: TemplateCategoryDefinition[] = [
  {
    id: "landing",
    name: { ko: "랜딩 페이지", en: "Landing page" },
    summary: {
      ko: "히어로, 신뢰 요소, 기능 카드, CTA 흐름을 빠르게 만드는 분류입니다.",
      en: "A category for quick hero, proof, feature, and CTA-driven pages."
    },
    presets: [
      {
        id: "landing-trust-launch",
        categoryId: "landing",
        name: { ko: "트러스트 런치", en: "Trust Launch" },
        focus: { ko: "초기 서비스 소개", en: "Early product launch" },
        description: {
          ko: "첫 방문자에게 신뢰와 핵심 가치를 빠르게 보여주는 균형형 랜딩입니다.",
          en: "A balanced landing page that establishes trust and value quickly."
        },
        specializedFor: { ko: "SaaS, 스타트업, 신규 서비스", en: "SaaS, startups, new launches" },
        emphasis: { ko: "히어로, 로고/수치, 기능 카드, 선명한 CTA", en: "Hero, proof strip, feature cards, clear CTA" },
        layout: "split",
        preview: "marketing",
        theme: {
          canvas: "#080b10",
          surface: "#11161d",
          surfaceAlt: "#161d26",
          border: "rgba(121, 171, 255, 0.16)",
          accent: "#8ec5ff",
          accentSoft: "#5f7cff",
          accentText: "#051425",
          text: "#f5f8ff",
          muted: "#afbdd3",
          heroGradient: "linear-gradient(135deg, #111825 0%, #0b0f16 52%, #122740 100%)"
        }
      },
      {
        id: "landing-feature-sprint",
        categoryId: "landing",
        name: { ko: "피처 스프린트", en: "Feature Sprint" },
        focus: { ko: "기능 중심 설명", en: "Feature-forward pitch" },
        description: {
          ko: "기능과 사용 장면을 많이 보여주고 싶을 때 쓰는 제품 설명형 구조입니다.",
          en: "A layout built to spotlight features and product usage moments."
        },
        specializedFor: { ko: "프로덕트 소개, B2B 툴", en: "Product showcases, B2B tools" },
        emphasis: { ko: "스크린샷, 사용 흐름, 섹션별 기능 설명", en: "Screenshots, flows, sectional feature stories" },
        layout: "spotlight",
        preview: "marketing",
        theme: {
          canvas: "#0a0a0d",
          surface: "#141419",
          surfaceAlt: "#1b1c24",
          border: "rgba(255, 171, 77, 0.16)",
          accent: "#ffb24a",
          accentSoft: "#ff6f61",
          accentText: "#231407",
          text: "#fbf7f2",
          muted: "#c7b7ab",
          heroGradient: "linear-gradient(135deg, #191114 0%, #101317 48%, #2a1d18 100%)"
        }
      },
      {
        id: "landing-bold-campaign",
        categoryId: "landing",
        name: { ko: "볼드 캠페인", en: "Bold Campaign" },
        focus: { ko: "광고/캠페인 전환", en: "Campaign conversion" },
        description: {
          ko: "강한 메시지와 짧은 스크롤로 빠르게 전환을 만들고 싶은 구조입니다.",
          en: "A bold high-contrast structure designed for short-scroll conversion."
        },
        specializedFor: { ko: "프로모션, 런칭 캠페인", en: "Promotions, launch campaigns" },
        emphasis: { ko: "강한 헤드라인, CTA 우선 배치, 큰 시각 대비", en: "Strong headline, CTA-first structure, high contrast" },
        layout: "centered",
        preview: "marketing",
        theme: {
          canvas: "#07090c",
          surface: "#12151b",
          surfaceAlt: "#1a2028",
          border: "rgba(103, 255, 201, 0.18)",
          accent: "#79f9c2",
          accentSoft: "#28c9c1",
          accentText: "#05261d",
          text: "#f5fffc",
          muted: "#b1cfc7",
          heroGradient: "linear-gradient(135deg, #12231b 0%, #0d1014 48%, #10313a 100%)"
        }
      }
    ]
  },
  {
    id: "about",
    name: { ko: "회사 소개", en: "About page" },
    summary: {
      ko: "브랜드 이야기, 가치, 팀 분위기, 성과를 담는 소개형 분류입니다.",
      en: "A story-driven category for brand narrative, values, team, and proof."
    },
    presets: [
      {
        id: "about-brand-story",
        categoryId: "about",
        name: { ko: "브랜드 스토리", en: "Brand Story" },
        focus: { ko: "브랜드 서사 중심", en: "Narrative-first profile" },
        description: {
          ko: "회사 배경과 변화 과정을 차분하게 풀어내는 스토리형 소개 페이지입니다.",
          en: "A calm narrative layout for telling your company story."
        },
        specializedFor: { ko: "브랜드 소개, 리브랜딩", en: "Brand pages, rebrands" },
        emphasis: { ko: "서사 흐름, 신뢰 지표, 가치 카드", en: "Narrative flow, trust metrics, value cards" },
        layout: "split",
        preview: "story",
        theme: {
          canvas: "#0b0b10",
          surface: "#171720",
          surfaceAlt: "#202231",
          border: "rgba(202, 167, 255, 0.18)",
          accent: "#c8a7ff",
          accentSoft: "#7a7cff",
          accentText: "#190c2f",
          text: "#f8f5ff",
          muted: "#c0bad9",
          heroGradient: "linear-gradient(135deg, #1d1630 0%, #111219 48%, #16224a 100%)"
        }
      },
      {
        id: "about-culture-deck",
        categoryId: "about",
        name: { ko: "컬처 덱", en: "Culture Deck" },
        focus: { ko: "팀 분위기 소개", en: "Culture-forward page" },
        description: {
          ko: "팀 문화와 일하는 방식을 밝고 선명하게 보여주는 구조입니다.",
          en: "A structure that makes team culture and process feel visible."
        },
        specializedFor: { ko: "채용, 조직 소개", en: "Hiring, company culture" },
        emphasis: { ko: "가치 카드, 일하는 방식, 팀 소개", en: "Value cards, ways of working, team blocks" },
        layout: "centered",
        preview: "story",
        theme: {
          canvas: "#090d0b",
          surface: "#141a16",
          surfaceAlt: "#1b241f",
          border: "rgba(166, 255, 164, 0.16)",
          accent: "#a8f78c",
          accentSoft: "#5bd189",
          accentText: "#11250e",
          text: "#f6fff6",
          muted: "#b6d0b4",
          heroGradient: "linear-gradient(135deg, #182316 0%, #101413 50%, #13342a 100%)"
        }
      },
      {
        id: "about-studio-profile",
        categoryId: "about",
        name: { ko: "스튜디오 프로필", en: "Studio Profile" },
        focus: { ko: "작은 팀의 전문성", en: "Boutique expertise" },
        description: {
          ko: "소규모 팀이나 에이전시가 전문성과 작업 결과를 강조할 때 쓰는 구조입니다.",
          en: "A polished profile layout for boutique teams and agencies."
        },
        specializedFor: { ko: "에이전시, 크리에이티브 팀", en: "Studios, agencies, creative teams" },
        emphasis: { ko: "작업 방식, 성과 사례, 문의 유도", en: "Process, impact proof, lead capture" },
        layout: "spotlight",
        preview: "story",
        theme: {
          canvas: "#0d0908",
          surface: "#1b1513",
          surfaceAlt: "#251c18",
          border: "rgba(255, 186, 130, 0.16)",
          accent: "#ffc08d",
          accentSoft: "#ff7a59",
          accentText: "#2b1208",
          text: "#fff7f1",
          muted: "#d7c0b0",
          heroGradient: "linear-gradient(135deg, #241614 0%, #15110f 50%, #3a241d 100%)"
        }
      }
    ]
  },
  {
    id: "event",
    name: { ko: "이벤트 페이지", en: "Event page" },
    summary: {
      ko: "행사 소개, 일정, 연사, 등록 CTA 흐름을 만드는 분류입니다.",
      en: "A category for event pages with schedule, speakers, and registration flow."
    },
    presets: [
      {
        id: "event-summit-pass",
        categoryId: "event",
        name: { ko: "서밋 패스", en: "Summit Pass" },
        focus: { ko: "컨퍼런스/서밋 등록", en: "Conference registration" },
        description: {
          ko: "행사 일정과 등록 정보를 빠르게 훑게 하는 정돈된 구조입니다.",
          en: "A clear event structure that prioritizes schedule and registration."
        },
        specializedFor: { ko: "컨퍼런스, 세미나", en: "Conferences, summits" },
        emphasis: { ko: "일정 카드, 좌석 정보, CTA 우선", en: "Schedule cards, seat info, CTA-first flow" },
        layout: "split",
        preview: "event",
        theme: {
          canvas: "#080b12",
          surface: "#101722",
          surfaceAlt: "#152030",
          border: "rgba(125, 189, 255, 0.18)",
          accent: "#7fd2ff",
          accentSoft: "#6177ff",
          accentText: "#071829",
          text: "#f3f8ff",
          muted: "#afc0d8",
          heroGradient: "linear-gradient(135deg, #11233d 0%, #0b1017 52%, #142140 100%)"
        }
      },
      {
        id: "event-speaker-spotlight",
        categoryId: "event",
        name: { ko: "스피커 스포트라이트", en: "Speaker Spotlight" },
        focus: { ko: "연사 소개 중심", en: "Speaker-led event" },
        description: {
          ko: "연사와 세션 매력을 먼저 보여주고 기대감을 만드는 구성입니다.",
          en: "A speaker-first event layout tuned for session appeal."
        },
        specializedFor: { ko: "세션 행사, 커뮤니티 모임", en: "Talk events, community meetups" },
        emphasis: { ko: "연사 카드, 세션 소개, 감성형 헤더", en: "Speaker cards, session details, atmospheric hero" },
        layout: "spotlight",
        preview: "event",
        theme: {
          canvas: "#0a0810",
          surface: "#17121f",
          surfaceAlt: "#1f1729",
          border: "rgba(255, 170, 210, 0.18)",
          accent: "#ffb4d0",
          accentSoft: "#8d67ff",
          accentText: "#2f0b1e",
          text: "#fff7fc",
          muted: "#d6bdd1",
          heroGradient: "linear-gradient(135deg, #2a1730 0%, #110f15 48%, #3b1c38 100%)"
        }
      },
      {
        id: "event-launch-night",
        categoryId: "event",
        name: { ko: "런치 나이트", en: "Launch Night" },
        focus: { ko: "브랜드 런칭/행사 홍보", en: "Launch event campaign" },
        description: {
          ko: "짧고 강한 메시지로 기대감을 올리는 프로모션형 행사 페이지입니다.",
          en: "A high-energy event page built for launch-style momentum."
        },
        specializedFor: { ko: "런칭 파티, 브랜드 행사", en: "Launch parties, brand events" },
        emphasis: { ko: "비주얼 강세, 등록 CTA, 하이라이트 섹션", en: "Visual punch, signup CTA, highlight sections" },
        layout: "centered",
        preview: "event",
        theme: {
          canvas: "#0c0907",
          surface: "#18120f",
          surfaceAlt: "#211915",
          border: "rgba(255, 203, 125, 0.18)",
          accent: "#ffd27d",
          accentSoft: "#ff8153",
          accentText: "#2b1706",
          text: "#fff8ef",
          muted: "#d7c0ab",
          heroGradient: "linear-gradient(135deg, #2f1b12 0%, #110f10 48%, #3d2516 100%)"
        }
      }
    ]
  },
  {
    id: "admin",
    name: { ko: "관리자 대시보드", en: "Admin dashboard" },
    summary: {
      ko: "카드, 지표, 활동 목록, 운영 패널 중심의 관리형 분류입니다.",
      en: "An operations-focused category built around cards, KPIs, and control panels."
    },
    presets: [
      {
        id: "admin-ops-pulse",
        categoryId: "admin",
        name: { ko: "옵스 펄스", en: "Ops Pulse" },
        focus: { ko: "실시간 운영 흐름", en: "Live operations view" },
        description: {
          ko: "팀 상태와 작업 흐름을 한눈에 보는 기본형 운영 대시보드입니다.",
          en: "A general operations board for real-time team status and workflow."
        },
        specializedFor: { ko: "운영팀, PM, 내부 도구", en: "Operations, PMs, internal tools" },
        emphasis: { ko: "카드형 KPI, 상태 보드, 우선 작업 목록", en: "KPI cards, status boards, priority tasks" },
        layout: "split",
        preview: "dashboard",
        theme: {
          canvas: "#070b10",
          surface: "#10161e",
          surfaceAlt: "#151e29",
          border: "rgba(137, 198, 255, 0.18)",
          accent: "#8fd7ff",
          accentSoft: "#5295ff",
          accentText: "#081a28",
          text: "#f5faff",
          muted: "#adbbcb",
          heroGradient: "linear-gradient(135deg, #102033 0%, #0b1016 50%, #14273a 100%)"
        }
      },
      {
        id: "admin-revenue-board",
        categoryId: "admin",
        name: { ko: "레버뉴 보드", en: "Revenue Board" },
        focus: { ko: "매출/파이프라인 추적", en: "Revenue and pipeline" },
        description: {
          ko: "매출, 전환, 파이프라인을 숫자 중심으로 확인하는 영업형 보드입니다.",
          en: "A sales-oriented board tuned for revenue, conversion, and pipeline."
        },
        specializedFor: { ko: "영업, 성장팀, B2B", en: "Sales, growth teams, B2B" },
        emphasis: { ko: "숫자 카드, 흐름 비교, 업셀 포착", en: "Number cards, trend comparison, upsell visibility" },
        layout: "spotlight",
        preview: "dashboard",
        theme: {
          canvas: "#0a0907",
          surface: "#171511",
          surfaceAlt: "#211d18",
          border: "rgba(255, 209, 148, 0.18)",
          accent: "#ffd297",
          accentSoft: "#ff8855",
          accentText: "#2a1507",
          text: "#fff9f2",
          muted: "#d6c2ad",
          heroGradient: "linear-gradient(135deg, #241a10 0%, #11100d 50%, #3a2518 100%)"
        }
      },
      {
        id: "admin-support-desk",
        categoryId: "admin",
        name: { ko: "서포트 데스크", en: "Support Desk" },
        focus: { ko: "문의 처리와 SLA", en: "Support workflow" },
        description: {
          ko: "문의 큐와 응답 속도, 우선순위를 관리하는 고객지원형 보드입니다.",
          en: "A support desk layout focused on queues, speed, and SLA visibility."
        },
        specializedFor: { ko: "CS팀, 헬프데스크", en: "Support teams, help desks" },
        emphasis: { ko: "티켓 목록, 우선순위, SLA 건강도", en: "Tickets, priority, SLA health" },
        layout: "centered",
        preview: "dashboard",
        theme: {
          canvas: "#090a0e",
          surface: "#141722",
          surfaceAlt: "#1c2130",
          border: "rgba(183, 170, 255, 0.18)",
          accent: "#bba9ff",
          accentSoft: "#6d8dff",
          accentText: "#170f35",
          text: "#f7f5ff",
          muted: "#bcb8d8",
          heroGradient: "linear-gradient(135deg, #1d1634 0%, #111219 52%, #1c2751 100%)"
        }
      }
    ]
  },
  {
    id: "product",
    name: { ko: "상품 소개", en: "Product showcase" },
    summary: {
      ko: "특징, 비교 포인트, 사용 장면을 제품 중심으로 보여주는 분류입니다.",
      en: "A category for product-led pages with feature and use-case emphasis."
    },
    presets: [
      {
        id: "product-feature-shelf",
        categoryId: "product",
        name: { ko: "피처 셸프", en: "Feature Shelf" },
        focus: { ko: "기능 전시형", en: "Feature-led page" },
        description: {
          ko: "핵심 기능을 섹션별로 차분하게 설명하는 제품 소개 구조입니다.",
          en: "A product page designed to explain features section by section."
        },
        specializedFor: { ko: "소프트웨어, 디지털 제품", en: "Software, digital products" },
        emphasis: { ko: "핵심 기능, 비교 포인트, 사용 사례", en: "Core features, comparisons, use cases" },
        layout: "split",
        preview: "product",
        theme: {
          canvas: "#080c0a",
          surface: "#121915",
          surfaceAlt: "#19231d",
          border: "rgba(121, 245, 184, 0.16)",
          accent: "#80f0c0",
          accentSoft: "#43c98f",
          accentText: "#092217",
          text: "#f5fff9",
          muted: "#b1ccb9",
          heroGradient: "linear-gradient(135deg, #15281d 0%, #0f1312 48%, #13302d 100%)"
        }
      },
      {
        id: "product-premium-detail",
        categoryId: "product",
        name: { ko: "프리미엄 디테일", en: "Premium Detail" },
        focus: { ko: "고급형 제품 소개", en: "Premium product page" },
        description: {
          ko: "고급 제품이나 서비스의 완성도와 디테일을 강조하는 구조입니다.",
          en: "A polished product page that leans into premium detail."
        },
        specializedFor: { ko: "프리미엄 서비스, 럭셔리 제품", en: "Premium services, luxury products" },
        emphasis: { ko: "비주얼, 디테일 카드, 가격대 가치", en: "Visual polish, detail cards, value framing" },
        layout: "spotlight",
        preview: "product",
        theme: {
          canvas: "#090807",
          surface: "#151311",
          surfaceAlt: "#1f1c18",
          border: "rgba(240, 214, 159, 0.16)",
          accent: "#f0d59d",
          accentSoft: "#cf9c54",
          accentText: "#251909",
          text: "#fffaf1",
          muted: "#d4c3a8",
          heroGradient: "linear-gradient(135deg, #241d13 0%, #110f0d 50%, #342917 100%)"
        }
      },
      {
        id: "product-conversion-spotlight",
        categoryId: "product",
        name: { ko: "컨버전 스포트라이트", en: "Conversion Spotlight" },
        focus: { ko: "바로 문의/구매 유도", en: "CTA-oriented page" },
        description: {
          ko: "긴 설명보다 전환과 문의 버튼을 앞세우는 짧은 구조입니다.",
          en: "A shorter product page that puts conversion ahead of long storytelling."
        },
        specializedFor: { ko: "광고 유입, 단일 제품", en: "Paid traffic, single-product pages" },
        emphasis: { ko: "CTA, 혜택 요약, 빠른 신뢰 보강", en: "CTA, benefit summary, quick trust cues" },
        layout: "centered",
        preview: "product",
        theme: {
          canvas: "#090a0f",
          surface: "#131722",
          surfaceAlt: "#1b2131",
          border: "rgba(142, 184, 255, 0.18)",
          accent: "#8fbfff",
          accentSoft: "#8d7fff",
          accentText: "#0c1634",
          text: "#f7f9ff",
          muted: "#b7bfd9",
          heroGradient: "linear-gradient(135deg, #16213f 0%, #10131a 52%, #26204f 100%)"
        }
      }
    ]
  },
  {
    id: "portfolio",
    name: { ko: "포트폴리오", en: "Portfolio" },
    summary: {
      ko: "작업 사례와 과정, 성과를 보여주는 개인/스튜디오 분류입니다.",
      en: "A case-study and work-sample category for portfolios and studios."
    },
    presets: [
      {
        id: "portfolio-case-grid",
        categoryId: "portfolio",
        name: { ko: "케이스 그리드", en: "Case Grid" },
        focus: { ko: "작업 사례 정리", en: "Case-study overview" },
        description: {
          ko: "여러 프로젝트를 빠르게 비교하고 살펴보게 하는 그리드형 포트폴리오입니다.",
          en: "A portfolio layout designed for quickly scanning multiple case studies."
        },
        specializedFor: { ko: "디자이너, 프리랜서", en: "Designers, freelancers" },
        emphasis: { ko: "프로젝트 카드, 결과 중심 요약", en: "Project cards, results-first summaries" },
        layout: "split",
        preview: "portfolio",
        theme: {
          canvas: "#0a0b10",
          surface: "#141822",
          surfaceAlt: "#1b2130",
          border: "rgba(160, 190, 255, 0.16)",
          accent: "#a5c4ff",
          accentSoft: "#7a7eff",
          accentText: "#101734",
          text: "#f7f8ff",
          muted: "#bcc4db",
          heroGradient: "linear-gradient(135deg, #18203a 0%, #10131b 52%, #23254c 100%)"
        }
      },
      {
        id: "portfolio-minimal-resume",
        categoryId: "portfolio",
        name: { ko: "미니멀 레주메", en: "Minimal Resume" },
        focus: { ko: "간결한 자기 소개", en: "Minimal personal site" },
        description: {
          ko: "프로필과 대표 작업을 간결하게 보여주는 미니멀형 포트폴리오입니다.",
          en: "A compact portfolio built around profile clarity and selected work."
        },
        specializedFor: { ko: "개인 소개, 이직용", en: "Personal sites, job search" },
        emphasis: { ko: "짧은 소개, 대표 작업, 연락 CTA", en: "Short intro, selected work, contact CTA" },
        layout: "centered",
        preview: "portfolio",
        theme: {
          canvas: "#090a0a",
          surface: "#151717",
          surfaceAlt: "#1d2020",
          border: "rgba(182, 228, 210, 0.16)",
          accent: "#b6f1d7",
          accentSoft: "#61cda3",
          accentText: "#0f261f",
          text: "#f5fffb",
          muted: "#b7cbc2",
          heroGradient: "linear-gradient(135deg, #16211d 0%, #101313 52%, #1c2f2d 100%)"
        }
      },
      {
        id: "portfolio-creative-showcase",
        categoryId: "portfolio",
        name: { ko: "크리에이티브 쇼케이스", en: "Creative Showcase" },
        focus: { ko: "비주얼 중심 포트폴리오", en: "Visual-first portfolio" },
        description: {
          ko: "강한 비주얼과 작업 분위기를 먼저 전달하는 쇼케이스형 구조입니다.",
          en: "A visually bold portfolio structure made for strong first impressions."
        },
        specializedFor: { ko: "브랜딩, 크리에이티브 작업", en: "Branding, visual work" },
        emphasis: { ko: "큰 썸네일, 이미지 중심 카드, 감성 헤더", en: "Large thumbnails, image-heavy cards, expressive hero" },
        layout: "spotlight",
        preview: "portfolio",
        theme: {
          canvas: "#0c090d",
          surface: "#19131c",
          surfaceAlt: "#221a26",
          border: "rgba(255, 172, 214, 0.16)",
          accent: "#ffb0d1",
          accentSoft: "#9b7fff",
          accentText: "#321124",
          text: "#fff7fc",
          muted: "#d4bfd1",
          heroGradient: "linear-gradient(135deg, #2b1730 0%, #121016 52%, #32223d 100%)"
        }
      }
    ]
  },
  {
    id: "blog",
    name: { ko: "블로그/매거진", en: "Blog / magazine" },
    summary: {
      ko: "대표 글, 최신 글, 주제 카드, 구독 CTA를 담는 콘텐츠 분류입니다.",
      en: "A content category for featured posts, latest stories, and subscription CTA."
    },
    presets: [
      {
        id: "blog-editorial-home",
        categoryId: "blog",
        name: { ko: "에디토리얼 홈", en: "Editorial Home" },
        focus: { ko: "대표 기사 중심", en: "Featured editorial front page" },
        description: {
          ko: "대표 글과 최신 글을 균형 있게 보여주는 기본형 매거진 구조입니다.",
          en: "A balanced magazine-style homepage with featured and latest content."
        },
        specializedFor: { ko: "브랜드 블로그, 매거진", en: "Brand blogs, magazines" },
        emphasis: { ko: "대표 글, 최신 글, 주제 구분", en: "Featured story, latest posts, topic clarity" },
        layout: "split",
        preview: "editorial",
        theme: {
          canvas: "#0b0b0c",
          surface: "#171719",
          surfaceAlt: "#212126",
          border: "rgba(210, 210, 223, 0.16)",
          accent: "#dfe2ff",
          accentSoft: "#8a9cff",
          accentText: "#1a1f3c",
          text: "#f7f7fb",
          muted: "#c2c2cd",
          heroGradient: "linear-gradient(135deg, #1d1f2c 0%, #111114 50%, #22242e 100%)"
        }
      },
      {
        id: "blog-insight-feed",
        categoryId: "blog",
        name: { ko: "인사이트 피드", en: "Insight Feed" },
        focus: { ko: "짧은 인사이트 모음", en: "Insight-driven publishing" },
        description: {
          ko: "짧은 글과 카드형 요약이 잘 어울리는 피드 중심 블로그 구조입니다.",
          en: "A card-led blog feed designed for insight posts and quick reads."
        },
        specializedFor: { ko: "뉴스레터, 인사이트 글", en: "Newsletter sites, insights" },
        emphasis: { ko: "카드 피드, 태그 분류, 구독 유도", en: "Card feed, tags, newsletter CTA" },
        layout: "centered",
        preview: "editorial",
        theme: {
          canvas: "#090b0f",
          surface: "#131821",
          surfaceAlt: "#1b2230",
          border: "rgba(137, 203, 255, 0.16)",
          accent: "#91d6ff",
          accentSoft: "#6e8cff",
          accentText: "#0d1931",
          text: "#f7fbff",
          muted: "#b4c2d3",
          heroGradient: "linear-gradient(135deg, #17213a 0%, #101318 50%, #1c2c43 100%)"
        }
      },
      {
        id: "blog-creator-journal",
        categoryId: "blog",
        name: { ko: "크리에이터 저널", en: "Creator Journal" },
        focus: { ko: "개인 브랜딩 글쓰기", en: "Creator-led writing" },
        description: {
          ko: "개인 에세이와 작업 노트를 감성적으로 풀어내는 저널형 구조입니다.",
          en: "A warmer editorial layout for personal writing and maker notes."
        },
        specializedFor: { ko: "개인 브랜딩, 에세이", en: "Personal branding, essays" },
        emphasis: { ko: "작성자 톤, 대표 글, 부드러운 리듬", en: "Author voice, featured essays, softer rhythm" },
        layout: "spotlight",
        preview: "editorial",
        theme: {
          canvas: "#0d0a08",
          surface: "#191412",
          surfaceAlt: "#221b18",
          border: "rgba(255, 200, 162, 0.16)",
          accent: "#ffcf9b",
          accentSoft: "#ff8f70",
          accentText: "#2c1708",
          text: "#fff8f2",
          muted: "#d6c1b1",
          heroGradient: "linear-gradient(135deg, #291912 0%, #141110 52%, #36261d 100%)"
        }
      }
    ]
  },
  {
    id: "docs",
    name: { ko: "도움말/문서", en: "Help / docs" },
    summary: {
      ko: "검색, 빠른 작업, 가이드, 문제 해결 중심의 셀프서브 분류입니다.",
      en: "A self-serve category organized around search, tasks, guides, and troubleshooting."
    },
    presets: [
      {
        id: "docs-quick-answers",
        categoryId: "docs",
        name: { ko: "퀵 앤서", en: "Quick Answers" },
        focus: { ko: "검색 우선 도움말", en: "Search-first help center" },
        description: {
          ko: "질문을 바로 검색하고 자주 찾는 작업을 빠르게 누르게 하는 구조입니다.",
          en: "A help center layout that pushes search and common tasks first."
        },
        specializedFor: { ko: "SaaS 헬프센터, 고객지원", en: "SaaS help centers, support" },
        emphasis: { ko: "검색, 인기 작업, 짧은 가이드", en: "Search, popular tasks, short guides" },
        layout: "centered",
        preview: "docs",
        theme: {
          canvas: "#090b11",
          surface: "#121722",
          surfaceAlt: "#1a2130",
          border: "rgba(138, 196, 255, 0.16)",
          accent: "#8fd0ff",
          accentSoft: "#6784ff",
          accentText: "#09172e",
          text: "#f6faff",
          muted: "#b4bfd3",
          heroGradient: "linear-gradient(135deg, #172442 0%, #10131a 52%, #1f2b4d 100%)"
        }
      },
      {
        id: "docs-guided-setup",
        categoryId: "docs",
        name: { ko: "가이드 셋업", en: "Guided Setup" },
        focus: { ko: "온보딩 문서", en: "Onboarding guides" },
        description: {
          ko: "처음 시작하는 사람이 단계별로 따라가기 쉬운 구조입니다.",
          en: "A documentation layout tuned for step-by-step onboarding."
        },
        specializedFor: { ko: "제품 시작 가이드", en: "Getting-started experiences" },
        emphasis: { ko: "단계 카드, 체크리스트, 흐름 설명", en: "Step cards, checklists, setup flow" },
        layout: "split",
        preview: "docs",
        theme: {
          canvas: "#090d0b",
          surface: "#131b18",
          surfaceAlt: "#1b2521",
          border: "rgba(154, 240, 181, 0.16)",
          accent: "#9af3b6",
          accentSoft: "#53cd8d",
          accentText: "#0a2114",
          text: "#f6fff8",
          muted: "#b5ccbb",
          heroGradient: "linear-gradient(135deg, #173025 0%, #101513 50%, #17342f 100%)"
        }
      },
      {
        id: "docs-troubleshooting-hub",
        categoryId: "docs",
        name: { ko: "트러블슈팅 허브", en: "Troubleshooting Hub" },
        focus: { ko: "오류 해결 중심", en: "Problem-solving docs" },
        description: {
          ko: "문제 유형별로 해결 방법을 바로 찾게 하는 문제해결형 구조입니다.",
          en: "A troubleshooting layout built around issue categories and fixes."
        },
        specializedFor: { ko: "지원센터, 기술문서", en: "Support hubs, technical docs" },
        emphasis: { ko: "오류 카테고리, 상태 안내, 관련 링크", en: "Issue categories, status guidance, related links" },
        layout: "spotlight",
        preview: "docs",
        theme: {
          canvas: "#0b0a0a",
          surface: "#171414",
          surfaceAlt: "#211d1d",
          border: "rgba(255, 173, 173, 0.16)",
          accent: "#ffb3b3",
          accentSoft: "#ff7e7e",
          accentText: "#331010",
          text: "#fff8f8",
          muted: "#d6c1c1",
          heroGradient: "linear-gradient(135deg, #2d1616 0%, #121111 52%, #372121 100%)"
        }
      }
    ]
  },
  {
    id: "app",
    name: { ko: "모바일 앱 소개", en: "Mobile app landing" },
    summary: {
      ko: "앱 다운로드와 스크린샷, 기능, 후기 중심의 앱 소개 분류입니다.",
      en: "A mobile app category built around installs, screenshots, and trust."
    },
    presets: [
      {
        id: "app-store-launch",
        categoryId: "app",
        name: { ko: "스토어 런치", en: "Store Launch" },
        focus: { ko: "앱 설치 유도", en: "App install page" },
        description: {
          ko: "다운로드 버튼과 스크린샷을 깔끔하게 보여주는 앱 출시형 구조입니다.",
          en: "A clean app page built for install CTAs and screenshots."
        },
        specializedFor: { ko: "신규 앱 출시", en: "New app launches" },
        emphasis: { ko: "앱 스토어 CTA, UI 스크린샷, 핵심 기능", en: "Store CTA, UI screenshots, top features" },
        layout: "split",
        preview: "app",
        theme: {
          canvas: "#080c10",
          surface: "#121820",
          surfaceAlt: "#18212d",
          border: "rgba(138, 221, 255, 0.16)",
          accent: "#8fe0ff",
          accentSoft: "#5e91ff",
          accentText: "#07192e",
          text: "#f5fbff",
          muted: "#b2c2d4",
          heroGradient: "linear-gradient(135deg, #15253d 0%, #101418 50%, #1b3257 100%)"
        }
      },
      {
        id: "app-habit-coach",
        categoryId: "app",
        name: { ko: "해빗 코치", en: "Habit Coach" },
        focus: { ko: "라이프스타일 앱 소개", en: "Lifestyle app page" },
        description: {
          ko: "부드럽고 친근한 감성으로 앱 사용 장면을 보여주는 구조입니다.",
          en: "A softer app layout made for habit, wellness, and daily-use products."
        },
        specializedFor: { ko: "웰니스, 생산성 앱", en: "Wellness, productivity apps" },
        emphasis: { ko: "사용 장면, 후기, 감성형 메시지", en: "Usage moments, testimonials, warm messaging" },
        layout: "centered",
        preview: "app",
        theme: {
          canvas: "#090d0c",
          surface: "#141b18",
          surfaceAlt: "#1c2520",
          border: "rgba(167, 246, 195, 0.16)",
          accent: "#abf2c3",
          accentSoft: "#59c99a",
          accentText: "#0b241a",
          text: "#f5fff9",
          muted: "#b6cdbf",
          heroGradient: "linear-gradient(135deg, #183128 0%, #101414 50%, #1a2d36 100%)"
        }
      },
      {
        id: "app-utility-snapshot",
        categoryId: "app",
        name: { ko: "유틸리티 스냅샷", en: "Utility Snapshot" },
        focus: { ko: "빠른 가치 전달", en: "Fast value proposition" },
        description: {
          ko: "짧은 설명과 강한 CTA로 앱 효용을 빠르게 전달하는 구조입니다.",
          en: "A concise utility app layout designed to communicate value fast."
        },
        specializedFor: { ko: "도구형 앱, 생산성 앱", en: "Utility apps, productivity tools" },
        emphasis: { ko: "핵심 혜택, 간단한 기능 카드, CTA", en: "Core benefits, compact features, CTA" },
        layout: "spotlight",
        preview: "app",
        theme: {
          canvas: "#0a0a10",
          surface: "#151824",
          surfaceAlt: "#1d2230",
          border: "rgba(191, 179, 255, 0.16)",
          accent: "#c1b3ff",
          accentSoft: "#6d88ff",
          accentText: "#180f37",
          text: "#f8f7ff",
          muted: "#bfbddb",
          heroGradient: "linear-gradient(135deg, #1f1936 0%, #101219 50%, #1c2c4a 100%)"
        }
      }
    ]
  },
  {
    id: "commerce",
    name: { ko: "이커머스 스토어", en: "Ecommerce store" },
    summary: {
      ko: "카테고리, 상품 카드, 추천 블록, 신뢰 정보 중심의 스토어 분류입니다.",
      en: "An ecommerce category centered on category navigation, product cards, and trust."
    },
    presets: [
      {
        id: "commerce-catalog-spotlight",
        categoryId: "commerce",
        name: { ko: "카탈로그 스포트라이트", en: "Catalog Spotlight" },
        focus: { ko: "전체 카테고리 탐색", en: "Catalog-first store" },
        description: {
          ko: "여러 카테고리를 넓게 보여주고 탐색을 돕는 기본형 스토어 구조입니다.",
          en: "A storefront that highlights breadth and makes category discovery easy."
        },
        specializedFor: { ko: "카탈로그형 쇼핑몰", en: "Catalog stores" },
        emphasis: { ko: "카테고리 분류, 상품 카드, 검색 진입", en: "Category grouping, product cards, search entry" },
        layout: "split",
        preview: "commerce",
        theme: {
          canvas: "#090907",
          surface: "#171511",
          surfaceAlt: "#221d17",
          border: "rgba(255, 214, 150, 0.16)",
          accent: "#ffd596",
          accentSoft: "#ff9457",
          accentText: "#2d1708",
          text: "#fffaf1",
          muted: "#d7c4ab",
          heroGradient: "linear-gradient(135deg, #241a11 0%, #11100d 50%, #362214 100%)"
        }
      },
      {
        id: "commerce-deal-floor",
        categoryId: "commerce",
        name: { ko: "딜 플로어", en: "Deal Floor" },
        focus: { ko: "프로모션/행사 매장", en: "Promo-first store" },
        description: {
          ko: "행사 상품과 혜택을 크게 드러내는 프로모션 중심의 구조입니다.",
          en: "A high-visibility storefront for campaigns, launches, and deals."
        },
        specializedFor: { ko: "프로모션, 시즌 행사", en: "Promotions, seasonal campaigns" },
        emphasis: { ko: "혜택 타일, 프로모션 배너, 빠른 CTA", en: "Offer tiles, banners, quick CTA" },
        layout: "centered",
        preview: "commerce",
        theme: {
          canvas: "#0a0809",
          surface: "#171216",
          surfaceAlt: "#211920",
          border: "rgba(255, 166, 198, 0.16)",
          accent: "#ffb0c9",
          accentSoft: "#ff7b5c",
          accentText: "#320f1e",
          text: "#fff7fb",
          muted: "#d7beca",
          heroGradient: "linear-gradient(135deg, #2b1720 0%, #120f12 50%, #3b2416 100%)"
        }
      },
      {
        id: "commerce-boutique-story",
        categoryId: "commerce",
        name: { ko: "부티크 스토리", en: "Boutique Story" },
        focus: { ko: "브랜드 무드와 큐레이션", en: "Brand-led store" },
        description: {
          ko: "브랜드 무드와 선별된 상품을 함께 보여주는 부티크형 구조입니다.",
          en: "A curated storefront that blends brand story with selected products."
        },
        specializedFor: { ko: "브랜드 스토어, 큐레이션 숍", en: "Brand stores, curated shops" },
        emphasis: { ko: "브랜드 스토리, 큐레이션 카드, 신뢰 배지", en: "Brand story, curated cards, trust badges" },
        layout: "spotlight",
        preview: "commerce",
        theme: {
          canvas: "#090a0a",
          surface: "#141716",
          surfaceAlt: "#1b201e",
          border: "rgba(182, 237, 207, 0.16)",
          accent: "#b8efcf",
          accentSoft: "#67c69a",
          accentText: "#0f2219",
          text: "#f5fff9",
          muted: "#b9cdc1",
          heroGradient: "linear-gradient(135deg, #172620 0%, #101413 50%, #24342f 100%)"
        }
      }
    ]
  }
];

function findPreset(templateId: string): TemplatePresetDefinition | undefined {
  return TEMPLATE_CATEGORIES.flatMap((category) => category.presets).find((preset) => preset.id === templateId);
}

function buildTemplateRoot(preset: TemplatePresetDefinition, language: Language): UiverseNode {
  switch (preset.categoryId) {
    case "landing":
      return contentPage(preset, language, {
        featureTitle: language === "ko" ? "이 샘플의 기본 블록" : "Core blocks in this sample",
        featureItems: [
          { title: language === "ko" ? "히어로 소개" : "Hero intro", body: language === "ko" ? "첫 문장과 CTA를 눈에 띄게 배치합니다." : "Lead with a visible headline and CTA." },
          { title: language === "ko" ? "신뢰 요소" : "Trust proof", body: language === "ko" ? "수치, 로고, 리뷰 자리로 신뢰를 보강합니다." : "Reserve space for logos, stats, or reviews." },
          { title: language === "ko" ? "기능 카드" : "Feature cards", body: language === "ko" ? "핵심 기능을 짧은 카드로 끊어 설명합니다." : "Break key features into concise cards." }
        ],
        checklistTitle: language === "ko" ? "바로 수정하면 좋은 항목" : "First things to customize",
        checklistItems: [
          language === "ko" ? "헤드라인을 서비스 한 줄 소개로 교체" : "Swap the headline with your one-line promise",
          language === "ko" ? "CTA 문구와 버튼 색상을 브랜드 기준으로 변경" : "Adjust CTA copy and button color to your brand",
          language === "ko" ? "기능 카드 내용을 실제 제품 포인트로 교체" : "Replace feature cards with real product points"
        ],
        imageLabel: language === "ko" ? "랜딩 미리보기" : "Landing preview"
      });
    case "about":
      return contentPage(preset, language, {
        featureTitle: language === "ko" ? "소개 페이지에 넣기 좋은 블록" : "Best-fit about page blocks",
        featureItems: [
          { title: language === "ko" ? "브랜드 소개" : "Brand intro", body: language === "ko" ? "우리가 누구인지 짧게 설명합니다." : "Explain who you are in one compact section." },
          { title: language === "ko" ? "가치 카드" : "Value cards", body: language === "ko" ? "핵심 가치와 태도를 카드로 정리합니다." : "Turn brand values into skimmable cards." },
          { title: language === "ko" ? "성과/신뢰" : "Proof section", body: language === "ko" ? "숫자나 주요 고객, 프로젝트를 배치합니다." : "Support the story with numbers or notable work." }
        ],
        checklistTitle: language === "ko" ? "수정 우선순위" : "What to customize first",
        checklistItems: [
          language === "ko" ? "회사 소개 문장을 실제 브랜드 문장으로 교체" : "Replace the intro copy with your real brand story",
          language === "ko" ? "가치 카드 3개를 실제 팀 가치로 교체" : "Swap the value cards with your real principles",
          language === "ko" ? "문의 CTA와 링크 방향 정리" : "Update the contact CTA and next-step flow"
        ],
        imageLabel: language === "ko" ? "브랜드 소개 미리보기" : "Brand profile preview"
      });
    case "event":
      return contentPage(preset, language, {
        featureTitle: language === "ko" ? "행사 페이지 핵심 블록" : "Event page core blocks",
        featureItems: [
          { title: language === "ko" ? "행사 정보" : "Event overview", body: language === "ko" ? "일시, 장소, 참가 포인트를 한 구역에 묶습니다." : "Group date, venue, and value into one clear zone." },
          { title: language === "ko" ? "일정/연사" : "Schedule and speakers", body: language === "ko" ? "관심도를 높이는 핵심 세션을 먼저 보여줍니다." : "Lead with the sessions people care about most." },
          { title: language === "ko" ? "등록 CTA" : "Registration CTA", body: language === "ko" ? "등록 버튼과 좌석 정보를 가까이 둡니다." : "Keep registration and seat info close together." }
        ],
        checklistTitle: language === "ko" ? "실제 행사 정보로 바꿀 부분" : "What to replace with real event info",
        checklistItems: [
          language === "ko" ? "행사 날짜/장소/참가 대상 입력" : "Set the date, venue, and target audience",
          language === "ko" ? "세션 카드와 연사 이름 교체" : "Replace the sample sessions and speaker names",
          language === "ko" ? "등록 버튼 문구와 링크 수정" : "Update the registration CTA and link"
        ],
        imageLabel: language === "ko" ? "행사 구조 미리보기" : "Event structure preview"
      });
    case "admin":
      return dashboardPage(preset, language);
    case "product":
      return contentPage(preset, language, {
        featureTitle: language === "ko" ? "제품 소개에 자주 쓰는 블록" : "Common product page blocks",
        featureItems: [
          { title: language === "ko" ? "기능 강조" : "Feature emphasis", body: language === "ko" ? "대표 기능을 한 번에 스캔되게 정리합니다." : "Arrange top features for quick scanning." },
          { title: language === "ko" ? "비교 포인트" : "Comparison points", body: language === "ko" ? "무엇이 다른지 짧게 구분해 보여줍니다." : "Clarify what makes the product different." },
          { title: language === "ko" ? "사용 장면" : "Use cases", body: language === "ko" ? "실제 사용 장면을 카드로 연결합니다." : "Connect the product to realistic use cases." }
        ],
        checklistTitle: language === "ko" ? "첫 수정 포인트" : "First product edits",
        checklistItems: [
          language === "ko" ? "제품명과 핵심 가치 문구 입력" : "Set the product name and core value statement",
          language === "ko" ? "가격/플랜 정보가 있으면 CTA 근처에 추가" : "Add pricing or plan detail near the CTA",
          language === "ko" ? "기능 카드와 비교 문구를 실서비스에 맞게 교체" : "Replace the sample features and comparison copy"
        ],
        imageLabel: language === "ko" ? "제품 소개 미리보기" : "Product page preview"
      });
    case "portfolio":
      return contentPage(preset, language, {
        featureTitle: language === "ko" ? "포트폴리오 구성 블록" : "Portfolio page building blocks",
        featureItems: [
          { title: language === "ko" ? "대표 작업" : "Featured work", body: language === "ko" ? "첫 화면에서 대표 작업 2~3개를 먼저 보여줍니다." : "Lead with two or three flagship case studies." },
          { title: language === "ko" ? "역할 설명" : "Role context", body: language === "ko" ? "내 역할과 결과를 짧게 적습니다." : "Keep role and outcome visible, not buried." },
          { title: language === "ko" ? "문의 유도" : "Contact CTA", body: language === "ko" ? "다음 행동이 보이게 CTA를 둡니다." : "Make the next action obvious with a contact CTA." }
        ],
        checklistTitle: language === "ko" ? "포트폴리오 교체 포인트" : "Portfolio customization checklist",
        checklistItems: [
          language === "ko" ? "대표 프로젝트 썸네일과 제목 교체" : "Swap in your real project thumbnails and titles",
          language === "ko" ? "내 역할/성과 중심 문장으로 수정" : "Rewrite the summary around your role and results",
          language === "ko" ? "연락 방법과 CTA 문구 정리" : "Set the right contact method and CTA copy"
        ],
        imageLabel: language === "ko" ? "포트폴리오 미리보기" : "Portfolio preview"
      });
    case "blog":
      return contentPage(preset, language, {
        featureTitle: language === "ko" ? "콘텐츠 페이지 핵심 구조" : "Core content page structure",
        featureItems: [
          { title: language === "ko" ? "대표 글" : "Featured article", body: language === "ko" ? "가장 읽히길 원하는 글을 앞에 둡니다." : "Put the most important article first." },
          { title: language === "ko" ? "최신 글 묶음" : "Latest stories", body: language === "ko" ? "최신 글 목록을 카드형으로 이어 붙입니다." : "Use a compact card feed for recent content." },
          { title: language === "ko" ? "구독 CTA" : "Subscribe CTA", body: language === "ko" ? "뉴스레터나 팔로우 행동을 같이 둡니다." : "Pair articles with a clear subscribe action." }
        ],
        checklistTitle: language === "ko" ? "콘텐츠 사이트 첫 수정" : "First blog edits",
        checklistItems: [
          language === "ko" ? "대표 글 제목과 카테고리 정리" : "Set the featured headline and categories",
          language === "ko" ? "최신 글 카드 제목/요약 교체" : "Replace the sample article cards",
          language === "ko" ? "구독 CTA와 보조 문구 조정" : "Adjust the subscribe CTA and support copy"
        ],
        imageLabel: language === "ko" ? "블로그 미리보기" : "Blog preview"
      });
    case "docs":
      return docsPage(preset, language);
    case "app":
      return contentPage(preset, language, {
        featureTitle: language === "ko" ? "앱 소개에 필요한 블록" : "App page essentials",
        featureItems: [
          { title: language === "ko" ? "스토어 CTA" : "Store CTA", body: language === "ko" ? "다운로드 버튼을 첫 구역에서 바로 보여줍니다." : "Surface the install CTA at the first glance." },
          { title: language === "ko" ? "스크린샷" : "Screenshots", body: language === "ko" ? "앱 실제 화면으로 기대를 맞춥니다." : "Use screenshots to set clear expectations." },
          { title: language === "ko" ? "후기/신뢰" : "Reviews and proof", body: language === "ko" ? "리뷰나 숫자 지표를 함께 둡니다." : "Add ratings, reviews, or trust metrics." }
        ],
        checklistTitle: language === "ko" ? "앱 페이지 수정 우선순위" : "App page first edits",
        checklistItems: [
          language === "ko" ? "앱 이름과 핵심 한 줄 소개 입력" : "Set the app name and benefit statement",
          language === "ko" ? "앱 스크린샷과 버튼 라벨 교체" : "Replace screenshots and button labels",
          language === "ko" ? "후기/평점 위치를 서비스에 맞게 조정" : "Adjust ratings or testimonial placement"
        ],
        imageLabel: language === "ko" ? "앱 소개 미리보기" : "App landing preview"
      });
    case "commerce":
      return contentPage(preset, language, {
        featureTitle: language === "ko" ? "스토어 기본 블록" : "Storefront core blocks",
        featureItems: [
          { title: language === "ko" ? "카테고리 진입" : "Category entry", body: language === "ko" ? "어떤 상품을 파는지 바로 이해되게 합니다." : "Show the breadth of categories right away." },
          { title: language === "ko" ? "대표 상품" : "Featured products", body: language === "ko" ? "상품 카드와 혜택을 같이 드러냅니다." : "Highlight product cards together with benefits." },
          { title: language === "ko" ? "신뢰 정보" : "Trust details", body: language === "ko" ? "배송, 반품, 리뷰 정보를 붙입니다." : "Keep shipping, returns, and review trust signals visible." }
        ],
        checklistTitle: language === "ko" ? "스토어 커스터마이즈 포인트" : "Store customization checklist",
        checklistItems: [
          language === "ko" ? "카테고리 이름과 대표 상품 교체" : "Replace the sample categories and hero products",
          language === "ko" ? "프로모션 문구와 CTA 정리" : "Update promotion copy and primary CTA",
          language === "ko" ? "배송/반품/리뷰 정보 추가" : "Add shipping, returns, and review details"
        ],
        imageLabel: language === "ko" ? "스토어 미리보기" : "Storefront preview"
      });
    default:
      return marketingPage(preset, language, {
        metrics: [
          { label: language === "ko" ? "섹션" : "Sections", value: "04" },
          { label: language === "ko" ? "카드" : "Cards", value: "06" },
          { label: language === "ko" ? "강조 CTA" : "Key CTA", value: "02" },
          { label: language === "ko" ? "반응형" : "Responsive", value: "03" }
        ],
        featureTitle: language === "ko" ? "기본 샘플 구조" : "Default sample structure",
        featureItems: [
          { title: language === "ko" ? "히어로" : "Hero", body: language === "ko" ? "첫 화면에서 핵심 메시지를 보여줍니다." : "Lead with the key message." },
          { title: language === "ko" ? "카드 영역" : "Card area", body: language === "ko" ? "중요 항목을 카드로 정리합니다." : "Organize primary content into cards." },
          { title: language === "ko" ? "CTA" : "CTA", body: language === "ko" ? "마지막 행동을 분명히 제안합니다." : "Finish with a clear next action." }
        ],
        checklistTitle: language === "ko" ? "바로 수정하기" : "Customize first",
        checklistItems: [
          language === "ko" ? "제목과 설명 문구 바꾸기" : "Replace the headline and body copy",
          language === "ko" ? "색상과 CTA 조정" : "Adjust colors and CTA",
          language === "ko" ? "카드 내용 교체" : "Swap the card content"
        ],
        imageLabel: language === "ko" ? "샘플 미리보기" : "Sample preview"
      });
  }
}

export function getProjectTemplateCategories(language: Language): ProjectTemplateCategorySummary[] {
  return TEMPLATE_CATEGORIES.map((category) => ({
    id: category.id,
    name: t(category.name, language),
    summary: t(category.summary, language),
    presets: category.presets.map((preset) => ({
      id: preset.id,
      categoryId: preset.categoryId,
      name: t(preset.name, language),
      focus: t(preset.focus, language),
      description: t(preset.description, language),
      specializedFor: t(preset.specializedFor, language),
      emphasis: t(preset.emphasis, language),
      accent: preset.theme.accent,
      accentSoft: preset.theme.accentSoft,
      preview: preset.preview
    }))
  }));
}

export function createProjectFromTemplate(
  templateId: string,
  language: Language,
  existingProjectCount: number,
  designKitId?: string
): StoredProject {
  const preset = findPreset(templateId);
  if (!preset) {
    throw new Error(`Unknown template: ${templateId}`);
  }

  const projectId = createId("project");
  const screenId = createId("screen");
  const projectName = t(preset.name, language);
  const displayName = existingProjectCount > 0 ? `${projectName} ${existingProjectCount + 1}` : projectName;
  const root = buildTemplateRoot(preset, language);
  const description = `${t(preset.focus, language)} · ${t(preset.description, language)}`;
  const createdAt = nowIso();

  const project: StoredProject = {
    id: projectId,
    name: displayName,
    slug: slugify(displayName, `project-${projectId}`),
    description,
    ...(designKitId ? { designKitId } : {}),
    createdAt,
    updatedAt: createdAt,
    lastOpenedScreenId: screenId,
    screens: [
      {
        id: screenId,
        name: language === "ko" ? "메인 화면" : "Main Screen",
        slug: slugify(displayName, `screen-${screenId}`),
        root,
        lastEditedAt: createdAt
      }
    ]
  };

  return designKitId ? applyDesignKitToProject(project, designKitId) : project;
}
