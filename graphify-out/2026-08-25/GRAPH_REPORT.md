# Graph Report - distanterra-back  (2026-08-25)

## Corpus Check
- 112 files · ~19,794 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 859 nodes · 1618 edges · 52 communities (28 shown, 24 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 68 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2b974d1b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- campaigns.controller.ts
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
- class-validator
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
- StockItem
- CLAUDE.md
- CampaignExpense
- CampaignStockItem
- Company
- campaigns.module.ts
- CampaignActivityLogsService
- database.module.ts
- CampaignActivityLog
- Campaign
- campaign-activity-logs.service.ts
- exceljs
- @nestjs/common
- sharp

## God Nodes (most connected - your core abstractions)
1. `CampaignsService` - 24 edges
2. `CampaignStockItem` - 24 edges
3. `Campaign` - 24 edges
4. `compilerOptions` - 24 edges
5. `CampaignActivityLog` - 23 edges
6. `CampaignExpense` - 23 edges
7. `Experience` - 22 edges
8. `Company` - 21 edges
9. `StockItem` - 20 edges
10. `AppConfig` - 19 edges

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

## Communities (52 total, 24 thin omitted)

### Community 0 - "campaigns.controller.ts"
Cohesion: 0.09
Nodes (26): Req, AuthController, LOGIN_THROTTLE_LIMIT, Body, Controller, Get, HttpCode, Post (+18 more)

### Community 1 - "gallery.controller.ts"
Cohesion: 0.06
Nodes (42): Max, Query, logger, OPTIMIZABLE_MIME_TYPES, optimizeAndSaveImage(), GalleryImage, Column, CreateDateColumn (+34 more)

### Community 2 - "Experience"
Cohesion: 0.06
Nodes (41): ArrayMinSize, ExperienceDescriptionBlock, Experience, Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn (+33 more)

### Community 3 - "comments.controller.ts"
Cohesion: 0.07
Nodes (33): CommentResponse, CommentsController, Body, Controller, Delete, Get, Param, Post (+25 more)

### Community 4 - "images.controller.ts"
Cohesion: 0.06
Nodes (38): ALLOWED_MIME_TYPES, buildImageMemoryMulterOptions(), buildImageMulterOptions(), imageFileFilter(), logger, MAX_UPLOAD_SIZE_BYTES, toPublicFileUrl(), Image (+30 more)

### Community 5 - "ContactMessage"
Cohesion: 0.08
Nodes (28): CONTACT_THROTTLE_LIMIT, ContactMessagesController, Body, Controller, Delete, Get, HttpCode, Param (+20 more)

### Community 6 - "devDependencies"
Cohesion: 0.05
Nodes (41): eslint, eslint-config-prettier, eslint-plugin-prettier, @nestjs/cli, devDependencies, eslint, eslint-config-prettier, eslint-plugin-prettier (+33 more)

### Community 7 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowSyntheticDefaultImports, baseUrl, declaration, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, forceConsistentCasingInFileNames (+16 more)

### Community 8 - "scripts"
Cohesion: 0.10
Nodes (19): description, engines, node, license, name, private, scripts, build (+11 more)

### Community 9 - "exclude"
Cohesion: 0.20
Nodes (9): dist, node_modules, scripts, **/*spec.ts, sql, test, ./tsconfig.json, exclude (+1 more)

### Community 10 - "dependencies"
Cohesion: 0.29
Nodes (7): bcrypt, class-transformer, dependencies, bcrypt, class-transformer, typeorm, typeorm

### Community 11 - "seed-experiences.ts"
Cohesion: 0.29
Nodes (3): Block, experiences, SeedExperience

### Community 12 - "nest-cli.json"
Cohesion: 0.40
Nodes (4): collection, compilerOptions, deleteOutDir, sourceRoot

### Community 18 - "Distanterra API"
Cohesion: 0.11
Nodes (18): 1. Prerequisites, 2. Install dependencies, 3. Configure environment variables, 4. Create the database schema, 5. Create the admin account, 6. (Optional) Migrate the original hardcoded experiences, 7. Run the API, API overview (+10 more)

### Community 33 - "campaigns.service.ts"
Cohesion: 0.06
Nodes (43): CampaignExportService, HEADER_FILL, HEADER_FONT, Injectable, CampaignsController, Body, Controller, Delete (+35 more)

### Community 38 - "StockItem"
Cohesion: 0.07
Nodes (32): StockItem, Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, CreateStockItemDto (+24 more)

### Community 40 - "CampaignExpense"
Cohesion: 0.07
Nodes (32): CampaignExpensesController, Body, Controller, Delete, Param, Post, Put, UploadedFile (+24 more)

### Community 41 - "CampaignStockItem"
Cohesion: 0.07
Nodes (32): CampaignStockController, Body, Controller, Delete, Param, Post, Put, UseGuards (+24 more)

### Community 42 - "Company"
Cohesion: 0.09
Nodes (27): CompaniesController, Body, Controller, Delete, Get, Param, Post, Put (+19 more)

### Community 43 - "campaigns.module.ts"
Cohesion: 0.15
Nodes (12): AppModule, Module, AuthModule, Module, CampaignsModule, Module, envValidationSchema, DatabaseModule (+4 more)

### Community 44 - "CampaignActivityLogsService"
Cohesion: 0.16
Nodes (10): CampaignActivityLogsController, Body, Controller, Delete, Param, Post, Put, UseGuards (+2 more)

### Community 45 - "database.module.ts"
Cohesion: 0.24
Nodes (8): InjectRepository, Admin, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, decimalTransformer

### Community 46 - "CampaignActivityLog"
Cohesion: 0.18
Nodes (10): InjectRepository, CampaignActivityLog, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne (+2 more)

### Community 47 - "Campaign"
Cohesion: 0.22
Nodes (9): Campaign, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn (+1 more)

### Community 48 - "campaign-activity-logs.service.ts"
Cohesion: 0.48
Nodes (4): CreateActivityLogDto, IsDateString, IsString, UpdateActivityLogDto

## Knowledge Gaps
- **134 isolated node(s):** `collection`, `sourceRoot`, `deleteOutDir`, `name`, `version` (+129 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **24 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `JwtAuthGuard` connect `campaigns.controller.ts` to `gallery.controller.ts`, `Experience`, `comments.controller.ts`, `images.controller.ts`, `ContactMessage`, `StockItem`, `CampaignStockItem`, `Company`?**
  _High betweenness centrality (0.068) - this node is a cross-community bridge._
- **Why does `Experience` connect `Experience` to `database.module.ts`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **Why does `Company` connect `Company` to `database.module.ts`, `Campaign`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **What connects `collection`, `sourceRoot`, `deleteOutDir` to the rest of the system?**
  _134 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `campaigns.controller.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09013605442176871 - nodes in this community are weakly interconnected._
- **Should `gallery.controller.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05505952380952381 - nodes in this community are weakly interconnected._
- **Should `Experience` be split into smaller, more focused modules?**
  _Cohesion score 0.059227921734531994 - nodes in this community are weakly interconnected._