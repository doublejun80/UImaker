import { type StoredProject, type UiverseNode, type UiverseSettings } from "@uiverse/schema";

function iso(seed: string): string {
  return new Date(seed).toISOString();
}

function textNode(id: string, name: string, text: string): UiverseNode {
  return {
    id,
    type: "text",
    name,
    content: { text },
    styles: {
      fontSize: { base: "16px", lg: "18px" },
      lineHeight: { base: "1.5" },
      color: { base: "#aaabaf" }
    },
    children: []
  };
}

const launchHomeRoot: UiverseNode = {
  id: "root-launch-home",
  type: "root",
  name: "Launch Home",
  styles: {
    display: { base: "flex" },
    direction: { base: "column" },
    gap: { base: "28px", lg: "40px" },
    padding: { base: "32px", lg: "56px" },
    backgroundColor: { base: "#000000" }
  },
  children: [
    {
      id: "section-hero",
      type: "section",
      name: "Hero Section",
      styles: {
        display: { base: "flex" },
        direction: { base: "column", lg: "row" },
        justify: { base: "between" },
        align: { base: "stretch", lg: "center" },
        gap: { base: "24px", lg: "40px" },
        padding: { base: "32px", lg: "48px" },
        backgroundGradient: { base: "linear-gradient(135deg, #171a1d 0%, #0c0e11 100%)" },
        borderRadius: { base: "20px" },
        borderWidth: { base: "1px" },
        borderStyle: { base: "solid" },
        borderColor: { base: "rgba(70,72,75,0.15)" }
      },
      children: [
        {
          id: "stack-copy",
          type: "stack",
          name: "Copy Stack",
          styles: {
            display: { base: "flex" },
            direction: { base: "column" },
            gap: { base: "16px" },
            width: { base: "100%", lg: "52%" }
          },
          children: [
            {
              id: "headline-1",
              type: "text",
              name: "Headline",
              content: { text: "Ship interface architecture before writing production UI." },
              styles: {
                fontSize: { base: "28px", lg: "42px" },
                fontWeight: { base: "800" },
                lineHeight: { base: "1.1" },
                color: { base: "#f9f9fd" }
              },
              children: []
            },
            textNode(
              "body-1",
              "Description",
              "Uiverse turns structural layout, responsive overrides, and CSS decisions into code-ready React and HTML artifacts."
            ),
            {
              id: "button-primary",
              type: "button",
              name: "Primary CTA",
              content: { label: "Start build" },
              styles: {
                display: { base: "block" },
                width: { base: "220px" },
                padding: { base: "16px 24px" },
                fontSize: { base: "16px" },
                fontWeight: { base: "700" },
                color: { base: "#001470" },
                backgroundGradient: { base: "linear-gradient(135deg, #9ba8ff 0%, #4963ff 100%)" },
                borderRadius: { base: "6px" },
                boxShadow: { base: "0px 20px 48px rgba(73,99,255,0.28)" }
              },
              children: []
            }
          ]
        },
        {
          id: "card-metrics",
          type: "card",
          name: "Metrics Card",
          styles: {
            display: { base: "flex" },
            direction: { base: "column" },
            gap: { base: "18px" },
            width: { base: "100%", lg: "38%" },
            padding: { base: "24px" },
            backgroundColor: { base: "#111417" },
            borderRadius: { base: "18px" },
            borderWidth: { base: "1px" },
            borderStyle: { base: "solid" },
            borderColor: { base: "rgba(70,72,75,0.12)" }
          },
          children: [
            {
              id: "metric-title",
              type: "text",
              name: "Metric Title",
              content: { text: "Current workspace readiness" },
              styles: {
                fontSize: { base: "14px" },
                fontWeight: { base: "600" },
                color: { base: "#aaabaf" }
              },
              children: []
            },
            {
              id: "metric-value",
              type: "text",
              name: "Metric Value",
              content: { text: "84%" },
              styles: {
                fontSize: { base: "48px" },
                fontWeight: { base: "800" },
                color: { base: "#81ecff" }
              },
              children: []
            },
            {
              id: "metric-caption",
              type: "text",
              name: "Metric Caption",
              content: { text: "Responsive overrides and export contracts are configured." },
              styles: {
                fontSize: { base: "13px" },
                lineHeight: { base: "1.6" },
                color: { base: "#aaabaf" }
              },
              children: []
            }
          ]
        }
      ]
    },
    {
      id: "section-form",
      type: "section",
      name: "Email Capture",
      styles: {
        display: { base: "flex" },
        direction: { base: "column", md: "row" },
        gap: { base: "12px" },
        padding: { base: "24px" },
        backgroundColor: { base: "#111417" },
        borderRadius: { base: "16px" }
      },
      children: [
        {
          id: "input-email",
          type: "input",
          name: "Email Input",
          content: { placeholder: "team@company.com" },
          styles: {
            width: { base: "100%" },
            padding: { base: "16px" },
            color: { base: "#f9f9fd" },
            backgroundColor: { base: "#171a1d" },
            borderWidth: { base: "1px" },
            borderStyle: { base: "solid" },
            borderColor: { base: "rgba(70,72,75,0.15)" },
            borderRadius: { base: "10px" }
          },
          children: []
        },
        {
          id: "button-join",
          type: "button",
          name: "Join Button",
          content: { label: "Reserve workspace" },
          styles: {
            padding: { base: "16px 22px" },
            fontWeight: { base: "700" },
            backgroundColor: { base: "#23262a" },
            color: { base: "#f9f9fd" },
            borderRadius: { base: "10px" }
          },
          children: []
        }
      ]
    }
  ]
};

const pricingRoot: UiverseNode = {
  id: "root-pricing",
  type: "root",
  name: "Pricing Overview",
  styles: {
    display: { base: "flex" },
    direction: { base: "column" },
    gap: { base: "24px" },
    padding: { base: "36px", lg: "48px" },
    backgroundColor: { base: "#000000" }
  },
  children: [
    {
      id: "pricing-header",
      type: "section",
      name: "Pricing Header",
      styles: {
        display: { base: "flex" },
        direction: { base: "column" },
        gap: { base: "10px" }
      },
      children: [
        {
          id: "pricing-title",
          type: "text",
          name: "Pricing Title",
          content: { text: "Pick the export pipeline that matches your release cadence." },
          styles: {
            fontSize: { base: "30px", lg: "38px" },
            fontWeight: { base: "800" },
            color: { base: "#f9f9fd" }
          },
          children: []
        },
        textNode("pricing-copy", "Pricing Copy", "Bundle design decisions locally, then generate React/Tailwind or HTML/CSS on demand.")
      ]
    },
    {
      id: "pricing-grid",
      type: "container",
      name: "Pricing Grid",
      styles: {
        display: { base: "grid" },
        gap: { base: "18px" }
      },
      children: [
        {
          id: "pricing-card-core",
          type: "card",
          name: "Core Card",
          styles: {
            display: { base: "flex" },
            direction: { base: "column" },
            gap: { base: "14px" },
            padding: { base: "24px" },
            backgroundColor: { base: "#111417" },
            borderRadius: { base: "16px" }
          },
          children: [
            {
              id: "pricing-core-tier",
              type: "text",
              name: "Tier",
              content: { text: "Core" },
              styles: { fontSize: { base: "18px" }, fontWeight: { base: "700" }, color: { base: "#f9f9fd" } },
              children: []
            },
            {
              id: "pricing-core-price",
              type: "text",
              name: "Price",
              content: { text: "$0" },
              styles: { fontSize: { base: "44px" }, fontWeight: { base: "800" }, color: { base: "#9ba8ff" } },
              children: []
            }
          ]
        },
        {
          id: "pricing-card-pro",
          type: "card",
          name: "Pro Card",
          styles: {
            display: { base: "flex" },
            direction: { base: "column" },
            gap: { base: "14px" },
            padding: { base: "24px" },
            backgroundGradient: { base: "linear-gradient(135deg, #171a1d 0%, #23262a 100%)" },
            borderRadius: { base: "16px" }
          },
          children: [
            {
              id: "pricing-pro-tier",
              type: "text",
              name: "Tier",
              content: { text: "Pro" },
              styles: { fontSize: { base: "18px" }, fontWeight: { base: "700" }, color: { base: "#f9f9fd" } },
              children: []
            },
            {
              id: "pricing-pro-price",
              type: "text",
              name: "Price",
              content: { text: "$39" },
              styles: { fontSize: { base: "44px" }, fontWeight: { base: "800" }, color: { base: "#81ecff" } },
              children: []
            }
          ]
        }
      ]
    }
  ]
};

export const demoProjects: StoredProject[] = [
  {
    id: "project-launchpad",
    name: "Launch Pad",
    slug: "launch-pad",
    description: "Marketing launch surfaces and signup funnels.",
    createdAt: iso("2026-03-14T09:00:00+09:00"),
    updatedAt: iso("2026-03-20T09:30:00+09:00"),
    lastOpenedScreenId: "screen-launch-home",
    screens: [
      {
        id: "screen-launch-home",
        name: "Launch Home",
        slug: "launch-home",
        root: launchHomeRoot,
        lastEditedAt: iso("2026-03-20T09:30:00+09:00")
      },
      {
        id: "screen-pricing-overview",
        name: "Pricing Overview",
        slug: "pricing-overview",
        root: pricingRoot,
        lastEditedAt: iso("2026-03-19T14:10:00+09:00")
      }
    ]
  },
  {
    id: "project-crm",
    name: "Workspace CRM",
    slug: "workspace-crm",
    description: "Internal ops panels and sales automation views.",
    createdAt: iso("2026-03-10T11:00:00+09:00"),
    updatedAt: iso("2026-03-19T17:20:00+09:00"),
    lastOpenedScreenId: "screen-activity-feed",
    screens: [
      {
        id: "screen-activity-feed",
        name: "Activity Feed",
        slug: "activity-feed",
        root: {
          id: "root-activity-feed",
          type: "root",
          name: "Activity Feed",
          styles: {
            display: { base: "flex" },
            direction: { base: "column" },
            gap: { base: "20px" },
            padding: { base: "32px" },
            backgroundColor: { base: "#000000" }
          },
          children: [
            {
              id: "activity-header",
              type: "text",
              name: "Header",
              content: { text: "Operational heartbeat" },
              styles: { fontSize: { base: "34px" }, fontWeight: { base: "800" }, color: { base: "#f9f9fd" } },
              children: []
            },
            {
              id: "activity-list-card",
              type: "card",
              name: "Activity Card",
              styles: {
                display: { base: "flex" },
                direction: { base: "column" },
                gap: { base: "14px" },
                padding: { base: "24px" },
                backgroundColor: { base: "#111417" },
                borderRadius: { base: "18px" }
              },
              children: [
                textNode("activity-item-1", "Item 1", "Design export manifest generated for sales-home."),
                textNode("activity-item-2", "Item 2", "Tailwind responsive overrides synced to pricing-overview."),
                textNode("activity-item-3", "Item 3", "CLI manifest downloaded for internal workspace build.")
              ]
            }
          ]
        },
        lastEditedAt: iso("2026-03-19T17:20:00+09:00")
      }
    ]
  },
  {
    id: "project-library",
    name: "UI Library",
    slug: "ui-library",
    description: "Component patterns and reusable brand sections.",
    createdAt: iso("2026-03-08T10:30:00+09:00"),
    updatedAt: iso("2026-03-18T12:15:00+09:00"),
    lastOpenedScreenId: "screen-button-sets",
    screens: [
      {
        id: "screen-button-sets",
        name: "Button Sets",
        slug: "button-sets",
        root: {
          id: "root-button-sets",
          type: "root",
          name: "Button Sets",
          styles: {
            display: { base: "flex" },
            direction: { base: "column" },
            gap: { base: "18px" },
            padding: { base: "32px" },
            backgroundColor: { base: "#000000" }
          },
          children: [
            {
              id: "button-sets-title",
              type: "text",
              name: "Title",
              content: { text: "Action patterns" },
              styles: { fontSize: { base: "32px" }, fontWeight: { base: "800" }, color: { base: "#f9f9fd" } },
              children: []
            },
            {
              id: "button-row",
              type: "container",
              name: "Button Row",
              styles: { display: { base: "flex" }, gap: { base: "14px" } },
              children: [
                {
                  id: "ghost-button",
                  type: "button",
                  name: "Ghost Button",
                  content: { label: "Ghost" },
                  styles: {
                    padding: { base: "14px 18px" },
                    color: { base: "#f9f9fd" },
                    backgroundColor: { base: "#171a1d" },
                    borderRadius: { base: "8px" }
                  },
                  children: []
                },
                {
                  id: "accent-button",
                  type: "button",
                  name: "Accent Button",
                  content: { label: "Accent" },
                  styles: {
                    padding: { base: "14px 18px" },
                    color: { base: "#001470" },
                    backgroundGradient: { base: "linear-gradient(135deg, #9ba8ff 0%, #4963ff 100%)" },
                    borderRadius: { base: "8px" }
                  },
                  children: []
                }
              ]
            }
          ]
        },
        lastEditedAt: iso("2026-03-18T12:15:00+09:00")
      }
    ]
  }
];

export const demoSettings: UiverseSettings = {
  language: "ko",
  profileName: "Studio Admin",
  profileEmail: "admin@uiverse.dev",
  defaultExportTarget: "react-tailwind",
  theme: {
    mode: "dark",
    accent: "#9ba8ff"
  }
};
