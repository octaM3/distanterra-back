# Graph Report - distanterra-back  (2026-08-25)

## Corpus Check
- 119 files · ~20,910 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 907 nodes · 1731 edges · 68 communities (31 shown, 37 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 73 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2b974d1b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- AppConfig
- gallery.controller.ts
- Experience
- comments.controller.ts
- images.controller.ts
- ContactMessage
- devDependencies
- compilerOptions
- scripts
- exclude
- dependencies
- seed-experiences.ts
- nest-cli.json
- StockCategory
- cookie-parser
- dotenv
- helmet
- joi
- Distanterra API
- @nestjs/config
- @nestjs/core
- @nestjs/jwt
- @nestjs/mapped-types
- @nestjs/passport
- @nestjs/platform-express
- @nestjs/serve-static
- @nestjs/throttler
- @nestjs/typeorm
- passport
- passport-jwt
- pg
- reflect-metadata
- rxjs
- campaigns.service.ts
- uuid
- StockItemsService
- CLAUDE.md
- campaign-expenses.controller.ts
- CampaignStockItem
- Company
- app.module.ts
- CampaignActivityLog
- database.module.ts
- CampaignExpense
- Campaign
- package.json
- exceljs
- @nestjs/common
- sharp
- campaigns.module.ts
- main.ts
- class-transformer
- eslint-plugin-prettier
- @nestjs/cli
- prettier
- source-map-support
- ts-loader
- ts-node
- tsconfig-paths
- @types/express
- @types/multer
- @types/node
- @types/uuid
- @typescript-eslint/eslint-plugin
- @typescript-eslint/parser

## God Nodes (most connected - your core abstractions)
1. `CampaignsService` - 24 edges
2. `CampaignStockItem` - 24 edges
3. `Campaign` - 24 edges
4. `StockCategory` - 24 edges
5. `compilerOptions` - 24 edges
6. `CampaignActivityLog` - 23 edges
7. `CampaignExpense` - 23 edges
8. `Experience` - 22 edges
9. `Company` - 21 edges
10. `StockItem` - 20 edges

## Surprising Connections (you probably didn't know these)
- `CampaignStockItemView` --references--> `StockPricingType`  [EXTRACTED]
  src/campaigns/campaigns.types.ts → src/database/entities/stock-item.entity.ts
- `CampaignActivityLog` --references--> `Admin`  [EXTRACTED]
  src/database/entities/campaign-activity-log.entity.ts → src/database/entities/admin.entity.ts
- `Campaign` --references--> `Admin`  [EXTRACTED]
  src/database/entities/campaign.entity.ts → src/database/entities/admin.entity.ts
- `CampaignExpense` --references--> `Admin`  [EXTRACTED]
  src/database/entities/campaign-expense.entity.ts → src/database/entities/admin.entity.ts
- `CampaignActivityLog` --references--> `Campaign`  [EXTRACTED]
  src/database/entities/campaign-activity-log.entity.ts → src/database/entities/campaign.entity.ts

## Import Cycles
- None detected.

## Communities (68 total, 37 thin omitted)

### Community 0 - "AppConfig"
Cohesion: 0.09
Nodes (24): Req, AuthController, LOGIN_THROTTLE_LIMIT, Body, Controller, Get, HttpCode, Post (+16 more)

### Community 1 - "gallery.controller.ts"
Cohesion: 0.06
Nodes (40): Max, Query, logger, OPTIMIZABLE_MIME_TYPES, optimizeAndSaveImage(), GalleryImage, Column, CreateDateColumn (+32 more)

### Community 2 - "Experience"
Cohesion: 0.06
Nodes (39): ArrayMinSize, ExperienceDescriptionBlock, Experience, Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn (+31 more)

### Community 3 - "comments.controller.ts"
Cohesion: 0.08
Nodes (31): CommentResponse, CommentsController, Body, Controller, Delete, Get, Param, Post (+23 more)

### Community 4 - "images.controller.ts"
Cohesion: 0.07
Nodes (32): toPublicFileUrl(), Image, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, CreateImageDto (+24 more)

### Community 5 - "ContactMessage"
Cohesion: 0.08
Nodes (26): CONTACT_THROTTLE_LIMIT, ContactMessagesController, Body, Controller, Delete, Get, HttpCode, Param (+18 more)

### Community 6 - "devDependencies"
Cohesion: 0.13
Nodes (15): eslint, eslint-config-prettier, devDependencies, eslint, eslint-config-prettier, @types/bcrypt, @types/cookie-parser, @types/passport-jwt (+7 more)

### Community 7 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowSyntheticDefaultImports, baseUrl, declaration, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, forceConsistentCasingInFileNames (+16 more)

### Community 8 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, build, db:init, db:seed-admin, db:seed-experiences, format, lint, start (+4 more)

### Community 9 - "exclude"
Cohesion: 0.20
Nodes (9): dist, node_modules, scripts, **/*spec.ts, sql, test, ./tsconfig.json, exclude (+1 more)

### Community 10 - "dependencies"
Cohesion: 0.29
Nodes (7): bcrypt, class-validator, dependencies, bcrypt, class-validator, typeorm, typeorm

### Community 11 - "seed-experiences.ts"
Cohesion: 0.29
Nodes (3): Block, experiences, SeedExperience

### Community 12 - "nest-cli.json"
Cohesion: 0.40
Nodes (4): collection, compilerOptions, deleteOutDir, sourceRoot

### Community 13 - "StockCategory"
Cohesion: 0.10
Nodes (23): StockCategory, Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, CreateStockCategoryDto (+15 more)

### Community 18 - "Distanterra API"
Cohesion: 0.11
Nodes (18): 1. Prerequisites, 2. Install dependencies, 3. Configure environment variables, 4. Create the database schema, 5. Create the admin account, 6. (Optional) Migrate the original hardcoded experiences, 7. Run the API, API overview (+10 more)

### Community 33 - "campaigns.service.ts"
Cohesion: 0.07
Nodes (42): CampaignExportService, HEADER_FILL, HEADER_FONT, Injectable, CampaignsController, Body, Controller, Delete (+34 more)

### Community 38 - "StockItemsService"
Cohesion: 0.09
Nodes (23): CreateStockItemDto, IsBoolean, IsInt, IsNumber, IsOptional, IsString, MaxLength, Min (+15 more)

### Community 40 - "campaign-expenses.controller.ts"
Cohesion: 0.07
Nodes (30): JwtAuthGuard, Injectable, CampaignExpensesController, Body, Controller, Delete, Param, Post (+22 more)

### Community 41 - "CampaignStockItem"
Cohesion: 0.06
Nodes (45): CampaignStockController, Body, Controller, Delete, Param, Post, Put, UseGuards (+37 more)

### Community 42 - "Company"
Cohesion: 0.09
Nodes (25): CompaniesController, Body, Controller, Delete, Get, Param, Post, Put (+17 more)

### Community 43 - "app.module.ts"
Cohesion: 0.11
Nodes (17): AuthModule, Module, CommentsModule, Module, CompaniesModule, Module, envValidationSchema, ContactMessagesModule (+9 more)

### Community 44 - "CampaignActivityLog"
Cohesion: 0.10
Nodes (24): CampaignActivityLogsController, Body, Controller, Delete, Param, Post, Put, UseGuards (+16 more)

### Community 45 - "database.module.ts"
Cohesion: 0.27
Nodes (7): InjectRepository, Admin, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn

### Community 46 - "CampaignExpense"
Cohesion: 0.18
Nodes (10): InjectRepository, CampaignExpense, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne (+2 more)

### Community 47 - "Campaign"
Cohesion: 0.22
Nodes (9): Campaign, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn (+1 more)

### Community 48 - "package.json"
Cohesion: 0.25
Nodes (7): description, engines, node, license, name, private, version

### Community 52 - "campaigns.module.ts"
Cohesion: 0.40
Nodes (4): CampaignsModule, Module, StockItemsModule, Module

### Community 53 - "main.ts"
Cohesion: 0.40
Nodes (3): AppModule, Module, logger

## Knowledge Gaps
- **134 isolated node(s):** `collection`, `sourceRoot`, `deleteOutDir`, `name`, `version` (+129 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **37 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `JwtAuthGuard` connect `campaign-expenses.controller.ts` to `AppConfig`, `campaigns.service.ts`, `Experience`, `comments.controller.ts`, `gallery.controller.ts`, `ContactMessage`, `images.controller.ts`, `StockItemsService`, `CampaignStockItem`, `Company`, `CampaignActivityLog`, `StockCategory`?**
  _High betweenness centrality (0.073) - this node is a cross-community bridge._
- **Why does `Experience` connect `Experience` to `database.module.ts`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **Why does `StockCategory` connect `StockCategory` to `CampaignStockItem`, `campaigns.module.ts`, `database.module.ts`, `StockItemsService`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **What connects `collection`, `sourceRoot`, `deleteOutDir` to the rest of the system?**
  _134 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AppConfig` be split into smaller, more focused modules?**
  _Cohesion score 0.09302325581395349 - nodes in this community are weakly interconnected._
- **Should `gallery.controller.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05764145954521417 - nodes in this community are weakly interconnected._
- **Should `Experience` be split into smaller, more focused modules?**
  _Cohesion score 0.062146892655367235 - nodes in this community are weakly interconnected._