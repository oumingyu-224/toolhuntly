# AGENTS.md

## 提交规则（除非用户明确强调，否则每次提交默认全部提交）

- 用户说「提交 / 提交代码」= `git add -A` + `git commit` + `git push` 一步完成
- 默认提交**全部改动**，不需要查看 git status / git diff，不需要检查文件内容
- 除非用户明确说「只提交 XX 文件」之类，否则一律 `git add -A` 全部提交

## 铁律0号 + 状态机（最高优先级，每次会话第一条消息起强制生效）

- 处理任何会改动项目的需求前（改代码/改文件/执行命令），必须先明确告知现状（有/没有，存在/不存在，能做/不能做），绝不猜测、绝不擅自决定
- 等用户明确确认后，再执行改动。任何情况下不得跳过此步骤
- 纯提问（问知识/问代码逻辑/问现状）不走审批流程，直接回答答案本身，短句、中文、不铺垫
- 只回答用户当前的问题，禁止任何没有必要的延展猜测，所有需求以用户明确输入为边界，禁止任何超出用户需求的行为

### 状态机
- 只读操作（读文件/搜索/查看代码/查资料）：免审批，直接做，做完直接给结论
- 写入类操作（改代码/改文件/执行命令/导入导出数据）：仅在用户说出触发词（开始/改/做/动手）后进行；操作完成后自动回到等待状态；若触发词消息本身已含完整方案（如「按这个方案改XX」），直接执行
- 任何其他情况：只说话，不动手
- 用户情绪、语气、沉默、催促都不构成授权；「我认为合理」永远不构成转移条件

### CoT（动手前一行方案，禁止长篇思考）
- 需要执行时，先回一行：现状 + 我要做什么，等用户说出触发词再动手
- 纯提问时不写任何模板、不输出思考过程
- 模板之外不写任何思考

### CoV 回检（输出前内部自查，不落文字）
- 是否在用户原话范围内？是否用了触发词以外的理由行动？
- 任何一条不过 → 停手，回到等待确认

### 最高原则
- 没有任何「我认为合理」的判断权，规则是唯一标准
- 任何想法与规则冲突，想法作废
- 用户定的规则和脑中的想法冲突时，规则优先，无条件

This file provides guidance to Code Agents (Codex, Cursor, etc.) when working with code in this repository.

## Project Overview

Mkdirs is a Next.js 14 directory website template with Sanity CMS, enabling AI-powered directory sites with listings, payments, authentication, blog, and newsletter features.

## Commands

- **Dev server**: `pnpm dev`
- **Build**: `pnpm build`
- **Start production**: `pnpm start`
- **Lint**: `pnpm lint` (Biome - checks and auto-fixes)
- **Lint with unsafe fixes**: `pnpm lint:fix`
- **Format**: `pnpm format` (Biome)
- **Generate Sanity types**: `pnpm typegen` (run after schema changes)
- **Email preview**: `pnpm email` (starts email dev server on port 3333)
- **Batch item operations**: `pnpm item:import`, `pnpm item:fetch`, `pnpm item:update`, `pnpm item:remove`
- **Batch all**: `pnpm batch` (or `pnpm batch:import`, `pnpm batch:update`, `pnpm batch:remove`)

## Architecture

### Route Structure (Next.js App Router)

The app uses two top-level route groups:

- `src/app/(website)/` - Main website with nested groups:
  - `(public)/` - Public pages: home, search, item, category, tag, collection, blog, pricing
  - `(protected)/` - Auth-required pages: dashboard, settings, submit, edit
  - `(newsletter)/` - Newsletter unsubscribe
  - `auth/` - Login, register, reset password, email verification
- `src/app/(sanity)/` - Sanity Studio admin interface (accessible at `/studio`)
- `src/app/api/` - API routes: auth, webhook (Stripe), og images, draft mode, send-email, upload-image

### Route Protection

`src/routes.ts` defines public routes, auth routes, and API auth prefix. `src/middleware.ts` enforces access control. Authenticated users on auth routes redirect to `/dashboard`.

### Data Layer

- **Sanity CMS** is the primary content store. Schemas live in `src/sanity/schemas/documents/` organized by domain: `directory/` (item, category, tag, collection, group), `blog/` (post, author), `page/`, `order/`, `auth/`, and `settings.ts`.
- **`src/data/`** contains data access functions (item.ts, blog.ts, collection.ts, user.ts, account.ts, order.ts, submission.ts, etc.) used by server components and actions.
- **`src/sanity/lib/`** has Sanity client utilities and GROQ query helpers.
- **`sanity.types.ts`** contains auto-generated TypeScript types from Sanity schemas (regenerate with `pnpm typegen`).

### Server Actions

`src/actions/` contains all server actions for mutations: authentication (login, register, reset), item operations (submit, edit, publish, unpublish), payment (checkout sessions, customer portal), settings, newsletter subscription, and admin operations.

### Key Integrations

- **Auth**: NextAuth v5 (beta.18) configured in `src/auth.ts` and `src/auth.config.ts`. Supports credentials + OAuth providers.
- **Payments**: Stripe via `src/lib/stripe.ts`, with checkout session creation in actions and webhook handling in `src/app/api/webhook/route.ts`.
- **AI**: Vercel AI SDK with multiple providers (OpenAI, Google, DeepSeek, xAI, OpenRouter) for content generation assistance.
- **Email**: React Email templates in `emails/` sent via Resend (`src/lib/mail.ts`).
- **Analytics**: OpenPanel integration (`@openpanel/nextjs`).
- **Image metadata**: Microlink (`@microlink/mql`) for fetching website screenshots/metadata.

### Components Organization

`src/components/` is organized by feature domain: `auth/`, `blog/`, `item/`, `category/`, `collection/`, `tag/`, `dashboard/`, `payment/`, `pricing/`, `search/`, `submit/`, `edit/`, `publish/`, `newsletter/`, `settings/`, `home/` (+ `home2/`, `home3/` variants), `layout/`, `shared/`, `icons/`, and `ui/` (shadcn/ui primitives).

### Configuration

- `src/config/site.ts` - Site-wide settings (name, URL, description)
- `src/config/price.ts` - Pricing plans configuration
- `src/config/dashboard.ts` - Dashboard navigation
- `src/config/hero.ts`, `footer.ts`, `faq.ts`, `marketing.ts` - Landing page sections
- `src/lib/constants.ts` - Shared constants
- `src/lib/schemas.ts` - Zod validation schemas used across forms and actions

### Styling

Tailwind CSS with `tailwind.config.ts`. UI primitives are Radix UI-based shadcn/ui components in `src/components/ui/`. Biome ignores `src/components/ui/*.tsx` (generated code).

### Environment

Copy `.env.example` to `.env`. Key variables: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `SANITY_API_TOKEN`, `NEXTAUTH_SECRET`, `STRIPE_SECRET_KEY`, Resend API key, and AI provider keys.
