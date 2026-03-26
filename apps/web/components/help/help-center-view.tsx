"use client";

import Link from "next/link";
import { BookOpen, CircleHelp, Languages, Palette, Rocket, Wrench } from "lucide-react";
import { WorkspaceNav } from "@/components/chrome/workspace-nav";
import { Card } from "@/components/ui/card";
import { useCopy, useLanguage } from "@/lib/copy";

export function HelpCenterView(): React.ReactElement {
  const copy = useCopy();
  const language = useLanguage();

  const guide =
    language === "ko"
      ? {
          checklistTitle: "처음 10분 체크리스트",
          checklist: [
            "1. 왼쪽 아래의 `새 프로젝트`를 누릅니다.",
            "2. 프로젝트 카드에서 `편집 열기`를 누릅니다.",
            "3. 왼쪽 `요소 추가`에서 `섹션`, `텍스트`, `버튼`을 눌러 넣습니다.",
            "4. 가운데 캔버스에서 바꾸고 싶은 요소를 클릭합니다.",
            "5. 오른쪽 `속성 편집`에서 문구와 색상을 바꿉니다.",
            "6. 상단의 `코드 보기` 또는 `내보내기`로 결과를 확인합니다."
          ],
          sections: [
            {
              id: "start",
              icon: BookOpen,
              title: "1. 시작 전에 알아두기",
              body: [
                "프로젝트는 작업 폴더입니다. 여러 화면을 한 프로젝트 안에 넣을 수 있습니다.",
                "화면은 실제 한 페이지 또는 한 섹션 시안입니다.",
                "요소는 텍스트, 버튼, 카드처럼 화면을 구성하는 조각입니다.",
                "처음에는 복잡한 옵션을 다 볼 필요 없습니다. `섹션 -> 텍스트 -> 버튼`만 써도 충분합니다."
              ]
            },
            {
              id: "first-project",
              icon: Rocket,
              title: "2. 첫 프로젝트 만드는 순서",
              body: [
                "대시보드에서 `새 프로젝트`를 누릅니다.",
                "왼쪽 `화면 목록`에서 편집할 화면을 고릅니다.",
                "왼쪽 `요소 추가`에서 `섹션`을 먼저 넣고, 그 안에 `텍스트`와 `버튼`을 추가합니다.",
                "가운데 미리보기에서 요소를 클릭하면 오른쪽 속성 편집 패널이 바뀝니다.",
                "오른쪽에서 문구를 먼저 수정하고, 그 다음 색상과 간격을 손보면 훨씬 덜 헷갈립니다."
              ]
            },
            {
              id: "colors",
              icon: Palette,
              title: "3. 색상 바꾸기",
              body: [
                "이제 색상은 `#000000`만 직접 입력할 필요가 없습니다.",
                "색상칩을 눌러 바로 고르거나, 색상 팔레트를 열어서 시각적으로 선택할 수 있습니다.",
                "직접 색상 코드를 넣는 칸은 고급 입력용입니다. 필요할 때만 쓰면 됩니다.",
                "처음에는 `글자 색상`, `배경 색상`, `테두리 색상` 세 가지만 바꿔도 화면 느낌이 크게 달라집니다."
              ]
            },
            {
              id: "settings",
              icon: Languages,
              title: "4. 설정 바꾸기",
              body: [
                "설정 화면에서 `표시 언어`를 `한국어` 또는 `English`로 바꿀 수 있습니다.",
                "포인트 색상은 앱의 주요 버튼과 강조 색에 반영됩니다.",
                "기본 내보내기 형식은 React/Tailwind 또는 HTML/CSS 중 자주 쓰는 방식으로 미리 정해둘 수 있습니다."
              ]
            },
            {
              id: "export",
              icon: Wrench,
              title: "5. 코드 내보내기",
              body: [
                "편집 화면 오른쪽 위 `코드 보기`를 누르거나 프로젝트 카드의 `내보내기`를 누릅니다.",
                "어떤 화면 코드를 받을지 먼저 고릅니다.",
                "현재 파일만 다운로드할 수도 있고, JSON 번들을 함께 받을 수도 있습니다.",
                "처음에는 React/Tailwind 한 가지 형식만 써도 충분합니다."
              ]
            },
            {
              id: "troubleshooting",
              icon: CircleHelp,
              title: "6. 자주 막히는 문제",
              body: [
                "아무것도 안 바뀌면: 먼저 가운데 요소를 클릭해서 오른쪽 속성 패널이 바뀌는지 확인하세요.",
                "색상이 안 먹는 것 같으면: `배경 그라디언트`가 들어간 요소인지 먼저 확인하세요. 그라디언트가 있으면 단색 배경보다 우선 보일 수 있습니다.",
                "프로젝트가 안 보이면: 이 앱은 현재 로컬 저장 방식이라 다른 브라우저나 시크릿 모드에서는 데이터가 안 보일 수 있습니다.",
                "어디부터 시작해야 할지 모르겠으면: `섹션 하나`, `제목 하나`, `버튼 하나`만 만드는 연습부터 하세요."
              ]
            }
          ],
          feedbackTitle: "더 쉽게 바꿔야 할 부분이 있나요?",
          feedbackBody: "어디에서 막혔는지 알려주시면 그 동선을 기준으로 더 단순한 화면으로 계속 줄여나갈 수 있습니다."
        }
      : {
          checklistTitle: "First 10-minute checklist",
          checklist: [
            "1. Click `Create Project` in the left sidebar.",
            "2. Open a project card with `Open Editor`.",
            "3. Add `Section`, `Text`, and `Button` from the left panel.",
            "4. Click an element on the canvas.",
            "5. Change text and color from the inspector on the right.",
            "6. Use `Code view` or `Export` to inspect the result."
          ],
          sections: [
            {
              id: "start",
              icon: BookOpen,
              title: "1. Before you begin",
              body: [
                "A project is a working folder. It can contain multiple screens.",
                "A screen is a page or a layout draft.",
                "An element is a piece of UI such as text, button, or card.",
                "At first, you only need Section, Text, and Button."
              ]
            },
            {
              id: "first-project",
              icon: Rocket,
              title: "2. Your first project",
              body: [
                "Create a project from the dashboard.",
                "Choose a screen from the left panel.",
                "Add a Section first, then place Text and Button inside it.",
                "Click an element on the canvas to open the inspector.",
                "Edit text first, then adjust color and spacing."
              ]
            },
            {
              id: "colors",
              icon: Palette,
              title: "3. Changing colors",
              body: [
                "You no longer need to rely only on raw hex values.",
                "Use swatches or the palette first, then type a color code only if you want to.",
                "Start with text color, background color, and border color."
              ]
            },
            {
              id: "settings",
              icon: Languages,
              title: "4. Changing settings",
              body: [
                "Switch the display language between Korean and English.",
                "Accent color updates the app's primary emphasis color.",
                "Choose your default export format in advance."
              ]
            },
            {
              id: "export",
              icon: Wrench,
              title: "5. Exporting code",
              body: [
                "Open `Code view` from the editor or `Export` from a project card.",
                "Choose which screen to export first.",
                "Download a single generated file or the full JSON bundle."
              ]
            },
            {
              id: "troubleshooting",
              icon: CircleHelp,
              title: "6. Common issues",
              body: [
                "If nothing changes, make sure an element is selected on the canvas first.",
                "If a color seems ignored, check whether a background gradient is applied.",
                "This app currently stores data locally, so another browser may not show the same projects."
              ]
            }
          ],
          feedbackTitle: "Still confusing somewhere?",
          feedbackBody: "Tell us which step felt hard and we can simplify that path even more."
        };

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-[1680px] gap-0 px-0">
      <WorkspaceNav />
      <section className="min-w-0 flex-1 px-5 py-8 md:px-8 lg:px-10">
        <div className="mb-8 max-w-4xl">
          <p className="mb-3 text-xs uppercase tracking-[0.28em] text-[var(--text-muted)]">{copy.common.helpCenter}</p>
          <h1 className="text-4xl font-extrabold tracking-[-0.06em]">{copy.help.title}</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--text-secondary)]">{copy.help.description}</p>
        </div>

        <div className="mb-8 grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          <Card className="surface-panel bg-[rgba(17,20,23,0.92)] p-6">
            <h2 className="text-2xl font-bold tracking-[-0.04em]">{guide.checklistTitle}</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {guide.checklist.map((item) => (
                <div key={item} className="rounded-[16px] border border-[rgba(70,72,75,0.15)] bg-[var(--surface)] px-4 py-4 text-sm leading-6 text-[var(--text-secondary)]">
                  {item}
                </div>
              ))}
            </div>
          </Card>

          <Card className="surface-panel h-fit bg-[rgba(17,20,23,0.92)] p-6 xl:sticky xl:top-24">
            <h2 className="text-lg font-bold tracking-[-0.03em]">{copy.help.toc}</h2>
            <div className="mt-4 space-y-2">
              {guide.sections.map((section) => (
                <Link
                  key={section.id}
                  href={`#${section.id}`}
                  className="block rounded-[12px] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text-secondary)] transition hover:bg-[var(--surface-highest)] hover:text-[var(--text-primary)]"
                >
                  {section.title}
                </Link>
              ))}
              <Link
                href="#feedback"
                className="block rounded-[12px] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text-secondary)] transition hover:bg-[var(--surface-highest)] hover:text-[var(--text-primary)]"
              >
                {guide.feedbackTitle}
              </Link>
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          {guide.sections.map((section) => {
            const Icon = section.icon;
            return (
              <Card key={section.id} id={section.id} className="surface-panel scroll-mt-24 bg-[rgba(17,20,23,0.92)] p-6">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[rgba(155,168,255,0.12)] text-[var(--color-primary)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="text-2xl font-bold tracking-[-0.04em]">{section.title}</h2>
                </div>
                <div className="grid gap-3">
                  {section.body.map((item) => (
                    <div key={item} className="rounded-[16px] border border-[rgba(70,72,75,0.15)] bg-[var(--surface)] px-4 py-4 text-sm leading-7 text-[var(--text-secondary)]">
                      {item}
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}

          <Card id="feedback" className="surface-panel scroll-mt-24 bg-[rgba(17,20,23,0.92)] p-6">
            <h2 className="text-2xl font-bold tracking-[-0.04em]">{guide.feedbackTitle}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--text-secondary)]">{guide.feedbackBody}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/projects"
                className="inline-flex h-10 items-center justify-center rounded-[8px] bg-[linear-gradient(135deg,var(--color-primary)_0%,var(--color-primary-dim)_100%)] px-4 text-sm font-semibold text-[var(--color-on-primary)] shadow-[0_20px_48px_rgba(73,99,255,0.28)] transition duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:brightness-110"
              >
                {copy.common.projects}
              </Link>
              <Link
                href="/settings"
                className="inline-flex h-10 items-center justify-center rounded-[8px] bg-[var(--surface-bright)] px-4 text-sm font-semibold text-[var(--text-primary)] transition duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[var(--surface-highest)]"
              >
                {copy.common.settings}
              </Link>
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}
