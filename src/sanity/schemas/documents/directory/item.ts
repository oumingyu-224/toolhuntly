import { PricePlans } from "@/lib/submission";
import { format, parseISO } from "date-fns";
import type { SanityImageAssetDocument } from "next-sanity";
import { defineField, defineType } from "sanity";

export default defineType({
  name: "item",
  title: "Item",
  type: "document",
  groups: [
    {
      name: "status",
      title: "Status",
    },
    {
      name: "sponsor",
      title: "Sponsor",
    },
  ],
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (rule) => rule.required(),
      description: "工具名称，必填",
    }),
    defineField({
      name: "seoTitle",
      title: "SEO Title",
      type: "string",
      description:
        "SEO 标题，决定浏览器标签页标题；留空则默认使用工具名称 Name",
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "name",
        maxLength: 96,
        isUnique: (value, context) => context.defaultIsUnique(value, context),
      },
      validation: (rule) => rule.required(),
      description: "网址标识，自动从名称生成",
    }),
    defineField({
      name: "featured",
      title: "Mark as Featured",
      type: "boolean",
      initialValue: false,
      description: "是否在首页推荐位展示；If the item is featured, it will be displayed in the featured section",
    }),
    defineField({
      name: "link",
      title: "Link",
      type: "string",
      description: "官网链接，展示在网站上；The link shown on the website",
    }),
    defineField({
      name: "affiliateLink",
      title: "Affiliate Link",
      type: "string",
      description: "推广链接（不展示在网站上），没有就留空；The affiliate link, not shown on the website, leave it blank if you don't have one",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
      description: "一句话简介（列表和详情页顶部展示）",
    }),
    defineField({
      name: "collections",
      title: "Collections",
      description: "合集（手动挑选的工具集合），可留空；The collections of the item, may have multiple collections",
      type: "array",
      of: [
        {
          type: "reference",
          to: [{ type: "collection" }],
        },
      ],
    }),
    defineField({
      name: "categories",
      title: "Categories",
      description: "分类（二级分类），可多选；The categories of the item, may have multiple categories",
      type: "array",
      of: [
        {
          type: "reference",
          to: [{ type: "category" }],
        },
      ],
    }),
    defineField({
      name: "group",
      title: "Group",
      type: "reference",
      to: [{ type: "group" }],
      description: "一级分类，选二级分类后一般会自动归属；The group of the item belongs to",
    }),
    defineField({
      name: "tags",
      title: "Tags",
      description: "标签，可多选；The tags of the item, may have multiple tags",
      type: "array",
      of: [
        {
          type: "reference",
          to: [{ type: "tag" }],
        },
      ],
    }),
    defineField({
      name: "submitter",
      title: "Submitter",
      type: "reference",
      to: [{ type: "user" }],
      description: "提交人，管理员添加可留空",
      // do not require submitter, because the item maybe submitted by admin
      // validation: (rule) => rule.required(),
    }),
    defineField({
      name: "introduction",
      title: "Introduction",
      description: "详细介绍（markdown 格式），可留空；The introduction of the item, in markdown format",
      type: "markdown",
      // https://github.com/sanity-io/sanity-plugin-markdown?tab=readme-ov-file#custom-image-urls
      // The function will be invoked whenever an image is pasted
      // or dragged into the markdown editor, after upload completes.
      options: {
        imageUrl: (imageAsset: SanityImageAssetDocument) => {
          return `${imageAsset.url}?w=400&h=400`;
        },
      },
    }),
    defineField({
      name: "icon",
      title: "Icon",
      type: "image",
      description: "工具图标",
      fields: [
        {
          name: "alt",
          type: "string",
          title: "Alternative Text",
          description: "图标的替代文字（SEO 用）；Important for SEO and accessiblity",
          initialValue: (_, parent) => {
            return `Icon for ${parent?.name || "item"}`;
          },
        },
      ],
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      description: "工具展示大图（详情页顶部预览）",
      options: {
        hotspot: true,
      },
      fields: [
        {
          name: "alt",
          type: "string",
          title: "Alternative Text",
          description: "图片的替代文字（SEO 用）；Important for SEO and accessiblity",
          initialValue: (_, parent) => {
            return `Image for ${parent?.name || "item"}`;
          },
        },
      ],
    }),
    // publish related fields
    defineField({
      name: "publishDate",
      title: "Publish Date",
      description: "发布日期，*必须填写工具才会在目录里展示；*Required if you want to show the item in the directory",
      type: "datetime",
      group: "status",
      // hidden: ({ parent }) => !parent.published,
    }),
    // price plan related fields
    defineField({
      name: "pricePlan",
      title: "Price Plan",
      description: "价格方案，提交后自动设为 free；The price plan of the item, chosen by the submitter",
      type: "string",
      group: "status",
      initialValue: "free",
      options: {
        list: ["free", "pro", "sponsor"],
        layout: "radio",
        direction: "horizontal",
      },
    }),
    defineField({
      name: "freePlanStatus",
      title: "Free Plan Status",
      description: "免费方案状态，管理员审核通过选 Approved；The status of the item when the item is in free plan",
      type: "string",
      group: "status",
      initialValue: "submitting",
      options: {
        list: [
          { title: "Submitting", value: "submitting" },
          { title: "Pending (Waiting for review)", value: "pending" },
          { title: "Approved", value: "approved" },
          { title: "Rejected", value: "rejected" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
      hidden: ({ parent }) => parent.pricePlan !== "free",
    }),
    defineField({
      name: "proPlanStatus",
      title: "Pro Plan Status",
      description: "付费方案状态；The status of the item when the item is in pro plan",
      type: "string",
      group: "status",
      initialValue: "submitting",
      options: {
        list: [
          { title: "Submitting", value: "submitting" },
          { title: "Pending (Waiting for payment)", value: "pending" },
          { title: "Success", value: "success" },
          { title: "Failed", value: "failed" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
      hidden: ({ parent }) => parent.pricePlan !== "pro",
    }),
    defineField({
      name: "rejectionReason",
      title: "Rejection Reason",
      description: "拒绝原因；The reason for rejecting the item",
      type: "string",
      group: "status",
      hidden: ({ parent }) => parent.freePlanStatus !== "rejected",
      initialValue: "Other reasons",
      options: {
        list: [
          "The item is not good fit for our directory",
          "The image of the item is not in good quality",
          "The icon of the item is not in good quality",
          "The information of the item is not clear",
          "The backlink to our site is not provided",
          "Other reasons",
        ],
        layout: "dropdown",
      },
    }),
    // sponsor related fields
    defineField({
      name: "sponsorPlanStatus",
      title: "Sponsor Plan Status",
      description: "赞助方案状态；The status of the item when the item is in sponsor plan",
      type: "string",
      group: ["status", "sponsor"],
      initialValue: "submitting",
      options: {
        list: [
          { title: "Submitting", value: "submitting" },
          { title: "Pending (Waiting for payment)", value: "pending" },
          { title: "Success", value: "success" },
          { title: "Failed", value: "failed" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
      hidden: ({ parent }) => parent.pricePlan !== "sponsor",
    }),
    // payment related fields
    defineField({
      name: "paid",
      title: "Paid",
      description: "是否已支付成功，系统自动管理；If the item is paid, it means the payment is successful",
      type: "boolean",
      group: "status",
      initialValue: false,
      readOnly: true,
    }),
    defineField({
      name: "order",
      title: "Order",
      description: "对应的成功支付订单；The successful payment order of the submission",
      type: "reference",
      group: "status",
      to: [{ type: "order" }],
      hidden: ({ parent }) => !parent.paid,
      // readOnly: true,
    }),
    defineField({
      name: "forceHidden",
      title: "Force Hidden",
      description: "强制隐藏，勾上后网站在任何状态都不显示该工具（临时下架用）；If the item is force hidden, it will not be displayed regardless of the status. It's helpful when you want to hide an item temporarily.",
      type: "boolean",
      group: "status",
      initialValue: false,
    }),
    // sponsor related fields
    defineField({
      name: "sponsor",
      title: "Sponsor",
      description: "(已废弃) 是否标记为赞助；Website owner can mark the item as sponsor",
      type: "boolean",
      group: "sponsor",
      initialValue: false,
    }),
    defineField({
      name: "sponsorStartDate",
      title: "Sponsor Start Date",
      description: "赞助开始日期；The start date of the sponsor",
      type: "datetime",
      group: "sponsor",
      hidden: ({ parent }) => !parent.sponsor,
    }),
    defineField({
      name: "sponsorEndDate",
      title: "Sponsor End Date",
      description: "赞助结束日期；The end date of the sponsor",
      type: "datetime",
      group: "sponsor",
      hidden: ({ parent }) => !parent.sponsor,
    }),
    defineField({
      name: "note",
      title: "Note",
      description: "备注（不对外展示）；Take a note for the item, not visible to the public",
      type: "string",
      group: "sponsor",
    }),
    // display fields for detail page
    defineField({
      name: "planLabel",
      title: "Plan Label",
      description: "价格徽章，单选：Free/Freemium/Premium/Paid/Open Source；Displayed as a pill badge",
      type: "string",
      options: {
        list: ["Free", "Freemium", "Premium", "Paid", "Open Source"],
        layout: "radio",
        direction: "horizontal",
      },
    }),
    defineField({
      name: "platforms",
      title: "Platforms",
      description: "支持平台，可多选；Platforms the tool supports",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: [
          "Web",
          "API",
          "iOS",
          "Android",
          "Windows",
          "macOS",
          "Linux",
          "Chrome Extension",
          "Firefox Extension",
          "Discord",
          "Slack",
        ],
      },
    }),
    defineField({
      name: "whatIs",
      title: "What is this tool?",
      description: "这是什么工具：一段话介绍工具；Short paragraph explaining what the tool is",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "coreFeatures",
      title: "Core Features",
      description: "核心功能列表（编号卡片），每项填标题+描述；Numbered feature list shown as cards",
      type: "array",
      of: [
        {
          type: "object",
          name: "feature",
          title: "Feature",
          fields: [
            {
              name: "title",
              title: "Title",
              type: "string",
              validation: (rule) => rule.required(),
              description: "功能标题（如 01. AI Text Translation）",
            },
            {
              name: "description",
              title: "Description",
              type: "text",
              rows: 2,
              description: "功能描述",
            },
          ],
        },
      ],
    }),
    defineField({
      name: "useCases",
      title: "Use Cases",
      description: "使用场景列表，每项填场景名+描述；Quote-style use cases with title and description",
      type: "array",
      of: [
        {
          type: "object",
          name: "useCase",
          title: "Use Case",
          fields: [
            {
              name: "title",
              title: "Title",
              type: "string",
              validation: (rule) => rule.required(),
              description: "场景名称（如 International Communication）",
            },
            {
              name: "description",
              title: "Description",
              type: "text",
              rows: 2,
              description: "场景描述",
            },
          ],
        },
      ],
    }),
    defineField({
      name: "quickFacts",
      title: "Quick Facts",
      description: "快速信息表：域名权重 / 平台 / 语言；Quick facts table shown on the detail page",
      type: "object",
      fields: [
        {
          name: "domainRating",
          title: "Domain Rating",
          type: "string",
          description: "域名权重，如 DR 72；e.g. DR 72",
        },
        {
          name: "platforms",
          title: "Platforms",
          type: "string",
          description: "平台（逗号分隔），如 Web, API；e.g. Web, API",
        },
        {
          name: "languages",
          title: "Languages",
          type: "string",
          description: "支持的语言（逗号分隔），如 English, German, Spanish；e.g. English, German, Spanish",
        },
      ],
    }),
    defineField({
      name: "faqs",
      title: "FAQs",
      description: "常见问题列表，每项填问题+回答；Frequently asked questions for this tool",
      type: "array",
      of: [
        {
          type: "object",
          name: "faq",
          title: "FAQ",
          fields: [
            {
              name: "question",
              title: "Question",
              type: "string",
              validation: (rule) => rule.required(),
              description: "问题",
            },
            {
              name: "answer",
              title: "Answer",
              type: "text",
              rows: 3,
              validation: (rule) => rule.required(),
              description: "回答",
            },
          ],
        },
      ],
    }),
    defineField({
      name: "alternatives",
      title: "Alternatives",
      description: "同类替代工具（引用其他 item）；Alternative tools shown at the bottom of the detail page",
      type: "array",
      of: [
        {
          type: "reference",
          to: [{ type: "item" }],
        },
      ],
    }),
  ],
  // https://www.sanity.io/docs/previews-list-views
  // Configure and customize how documents are displayed
  // within Sanity Studio's document lists.
  preview: {
    select: {
      name: "name",
      icon: "icon",
      image: "image",
      featured: "featured",
      date: "publishDate",
      pricePlan: "pricePlan",
      freePlanStatus: "freePlanStatus",
      proPlanStatus: "proPlanStatus",
      sponsorPlanStatus: "sponsorPlanStatus",
    },
    prepare({
      name,
      icon,
      image,
      featured,
      date,
      pricePlan,
      freePlanStatus,
      proPlanStatus,
      sponsorPlanStatus,
    }) {
      const error = freePlanStatus === "rejected" || proPlanStatus === "failed" || sponsorPlanStatus === "failed";
      const title = date ? `✅ ${name}` : error ? `❌ ${name}` : `⏳ ${name}`;
      const feature = featured ? "⭐" : "";
      const status = pricePlan.toUpperCase() === PricePlans.FREE.toUpperCase() ? freePlanStatus : pricePlan.toUpperCase() === PricePlans.PRO.toUpperCase() ? proPlanStatus : sponsorPlanStatus;
      const time = date
        ? `date: ${format(parseISO(date), "yyyy/MM/dd")}`
        : "not published";
      const subtitle = `${feature}${pricePlan.toUpperCase()}: ${status}, ${time}`;
      const media = icon ?? image;
      return {
        title,
        media,
        subtitle,
      };
    },
  },
  orderings: [
    {
      title: "Publish Date (Newest)",
      name: "dateDesc",
      by: [{ field: "publishDate", direction: "desc" }],
    },
    {
      title: "Publish Date (Oldest)",
      name: "dateAsc",
      by: [{ field: "publishDate", direction: "asc" }],
    },
    {
      title: "Name (A-Z)",
      name: "name",
      by: [{ field: "name", direction: "asc" }],
    },
  ],
});
