import { format, parseISO } from "date-fns";
import { defineField, defineType } from "sanity";

export default defineType({
  name: "category",
  title: "Category",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (rule) => rule.required(),
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
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "group",
      title: "Group",
      type: "reference",
      to: [{ type: "group" }],
      description: "The group of the category belongs to",
    }),
    defineField({
      name: "whatIs",
      title: "What is",
      description: "What is this category? (e.g. What is AI Video Editor?)",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "whatDoes",
      title: "Core features",
      description: "Core features to look for in this category of tools.",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "whoUses",
      title: "Who uses it",
      description: "Who uses this category of tools, and how.",
      type: "array",
      of: [
        {
          type: "object",
          name: "whoUseItem",
          title: "Who use item",
          fields: [
            {
              name: "title",
              title: "Title",
              type: "string",
              validation: (rule) => rule.required(),
            },
            {
              name: "description",
              title: "Description",
              type: "text",
              rows: 3,
            },
          ],
        },
      ],
    }),
    defineField({
      name: "howItWorks",
      title: "How it works",
      description: "How do these tools work?",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "faqs",
      title: "FAQs",
      description: "Frequently asked questions for this category",
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
            },
            {
              name: "answer",
              title: "Answer",
              type: "text",
              rows: 3,
              validation: (rule) => rule.required(),
            },
          ],
        },
      ],
    }),
    defineField({
      name: "priority",
      title: "Priority",
      type: "number",
      description: "Priority of the category, used to sort the categories",
      initialValue: 0,
    }),
  ],
  preview: {
    select: {
      name: "name",
      priority: "priority",
      date: "_createdAt",
    },
    prepare({ name, priority, date }) {
      const title = `${priority} - ${name}`;
      const subtitle = format(parseISO(date), "yyyy/MM/dd");
      return {
        title,
        subtitle,
      };
    },
  },
  orderings: [
    {
      title: "Priority",
      name: "priority",
      by: [{ field: "priority", direction: "desc" }],
    },
    {
      title: "Name",
      name: "name",
      by: [{ field: "name", direction: "asc" }],
    },
  ],
});
