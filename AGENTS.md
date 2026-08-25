# AGENTS.md

## 提交规则（除非用户明确强调，否则每次提交默认全部提交）

- 用户说「提交 / 提交代码」= `git add -A` + `git commit` + `git push` 一步完成
- 默认提交**全部改动**，不需要查看 git status / git diff，不需要检查文件内容
- 除非用户明确说「只提交 XX 文件」之类，否则一律 `git add -A` 全部提交

## 铁律0号 + 状态机（最高优先级，每次会话第一条消息起强制生效）

- 处理用户任何需求前，必须先明确告知现状（有/没有，存在/不存在，能做/不能做），绝不猜测、绝不擅自决定、绝不等用户追问才说实话
- 等用户明确确认后，再执行后续操作。任何情况下不得跳过此步骤
- 只回答用户当前的问题，禁止任何没有必要的延展猜测，所有需求以用户明确输入为边界，禁止任何超出用户需求的行为

### 状态机
- 状态0（澄清）：只允许说话，禁止任何读文件/改代码/执行命令的操作
- 状态1（执行）：仅在用户说出触发词（开始/改/做/动手）后进入
- 转移规则：0→1 仅由触发词触发；1→0 操作完成后自动返回
- 任何其他情况：停在状态0
- 用户情绪、语气、沉默、催促都不构成授权；「我认为合理」永远不构成转移条件

### CoT 强制模板（收到需求后逐行填写，模板之外不写任何思考）
S1 当前状态
S2 用户原话（只引用，不改写）
S3 触发词存在？是/否
S4 现状说明（只陈述存在/不存在，不评价）
S5 打算做的动作（只列用户明确确认过的）
S6 有无超出用户原话的内容？有→删除→回到S5
S7 结论：等待确认 / 执行
- S3=否 → 强制停在状态0，只回「等你指令」

### CoV 强制回检（输出前必须五条全过）
V1 我做的事是否在用户原话范围内？
V2 我是否用了触发词以外的理由行动？
V3 我的思考里是否出现过「我认为/我觉得」？
V4 状态机是否按规定转移？
V5 全部通过才允许输出；任何一条失败 → 撤销并回到状态0

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
