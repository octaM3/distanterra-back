# Graph Report - distanterra-back  (2026-09-11)

## Corpus Check
- 158 files · ~33,787 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1193 nodes · 2333 edges · 87 communities (48 shown, 39 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 106 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `9671dbd1`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Admin
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
- reflect-metadata
- helmet
- joi
- Distanterra API
- campaigns.module.ts
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
- class-validator
- rxjs
- CampaignsService
- uuid
- stock-items.service.ts
- CLAUDE.md
- CampaignExpense
- campaign-stock.service.ts
- Company
- CampaignPackAnimal
- CampaignActivityLog
- VehiclesService
- campaign-expenses.controller.ts
- database.module.ts
- package.json
- exceljs
- @nestjs/common
- sharp
- PuntoInteres
- campaign-vehicles.service.ts
- CampaignVehicle
- eslint-plugin-prettier
- @nestjs/cli
- prettier
- CampaignVehiclesController
- ts-loader
- ts-node
- tsconfig-paths
- Vehicle
- @types/multer
- @types/node
- @types/uuid
- @typescript-eslint/eslint-plugin
- .create
- @types/cookie-parser
- @types/pg
- typescript
- CampaignStockItem
- campaigns.service.ts
- CampaignGuide
- Campaign
- campaigns.util.ts
- StockCategoriesController
- CampaignStockController
- CampaignsController
- StockItem
- StockItemsController
- campaign-export.service.ts
- StockItemsService
- campaigns.types.ts
- @nestjs/config
- class-transformer

## God Nodes (most connected - your core abstractions)
1. `CampaignsService` - 30 edges
2. `Campaign` - 30 edges
3. `StockCategory` - 26 edges
4. `CampaignExpense` - 24 edges
5. `CampaignStockItem` - 24 edges
6. `CampaignVehicle` - 24 edges
7. `compilerOptions` - 24 edges
8. `CampaignActivityLog` - 23 edges
9. `CampaignGuide` - 22 edges
10. `CampaignPackAnimal` - 22 edges

## Surprising Connections (you probably didn't know these)
- `CampaignExpenseView` --references--> `InvoiceType`  [EXTRACTED]
  src/campaigns/campaigns.types.ts → src/database/entities/campaign-expense.entity.ts
- `CampaignListItem` --references--> `CampaignStatus`  [EXTRACTED]
  src/campaigns/campaigns.types.ts → src/campaigns/campaigns.util.ts
- `CampaignActivityLog` --references--> `Admin`  [EXTRACTED]
  src/database/entities/campaign-activity-log.entity.ts → src/database/entities/admin.entity.ts
- `Campaign` --references--> `Admin`  [EXTRACTED]
  src/database/entities/campaign.entity.ts → src/database/entities/admin.entity.ts
- `CampaignExpense` --references--> `Admin`  [EXTRACTED]
  src/database/entities/campaign-expense.entity.ts → src/database/entities/admin.entity.ts

## Import Cycles
- None detected.

## Communities (87 total, 39 thin omitted)

### Community 0 - "Admin"
Cohesion: 0.06
Nodes (37): Req, AppModule, Module, AuthController, LOGIN_THROTTLE_LIMIT, Body, Controller, Get (+29 more)

### Community 1 - "gallery.controller.ts"
Cohesion: 0.06
Nodes (40): Max, toPublicFileUrl(), GalleryImage, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn (+32 more)

### Community 2 - "Experience"
Cohesion: 0.06
Nodes (41): ArrayMinSize, ExperienceDescriptionBlock, Experience, Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn (+33 more)

### Community 3 - "comments.controller.ts"
Cohesion: 0.07
Nodes (33): CommentResponse, CommentsController, Body, Controller, Delete, Get, Param, Post (+25 more)

### Community 4 - "images.controller.ts"
Cohesion: 0.06
Nodes (37): ALLOWED_MIME_TYPES, buildImageMemoryMulterOptions(), buildImageMulterOptions(), imageFileFilter(), logger, MAX_UPLOAD_SIZE_BYTES, Image, Column (+29 more)

### Community 5 - "ContactMessage"
Cohesion: 0.08
Nodes (28): CONTACT_THROTTLE_LIMIT, ContactMessagesController, Body, Controller, Delete, Get, HttpCode, Param (+20 more)

### Community 6 - "devDependencies"
Cohesion: 0.13
Nodes (15): eslint, eslint-config-prettier, devDependencies, eslint, eslint-config-prettier, source-map-support, @types/bcrypt, @types/express (+7 more)

### Community 7 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowSyntheticDefaultImports, baseUrl, declaration, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, forceConsistentCasingInFileNames (+16 more)

### Community 8 - "scripts"
Cohesion: 0.15
Nodes (13): scripts, build, db:init, db:reset, db:seed-admin, db:seed-experiences, format, lint (+5 more)

### Community 9 - "exclude"
Cohesion: 0.20
Nodes (9): dist, node_modules, scripts, **/*spec.ts, sql, test, ./tsconfig.json, exclude (+1 more)

### Community 10 - "dependencies"
Cohesion: 0.29
Nodes (7): bcrypt, dotenv, dependencies, bcrypt, dotenv, typeorm, typeorm

### Community 11 - "seed-experiences.ts"
Cohesion: 0.29
Nodes (3): Block, experiences, SeedExperience

### Community 12 - "nest-cli.json"
Cohesion: 0.40
Nodes (4): collection, compilerOptions, deleteOutDir, sourceRoot

### Community 13 - "StockCategory"
Cohesion: 0.15
Nodes (15): StockCategory, Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, CreateStockCategoryDto (+7 more)

### Community 18 - "Distanterra API"
Cohesion: 0.11
Nodes (18): 1. Prerequisites, 2. Install dependencies, 3. Configure environment variables, 4. Create the database schema, 5. Create the admin account, 6. (Optional) Migrate the original hardcoded experiences, 7. Run the API, API overview (+10 more)

### Community 19 - "campaigns.module.ts"
Cohesion: 0.15
Nodes (13): CampaignsModule, Module, FriendlyThrottlerGuard, Injectable, envValidationSchema, DatabaseModule, Module, StockCategoriesModule (+5 more)

### Community 33 - "CampaignsService"
Cohesion: 0.24
Nodes (6): Body, Post, Put, CampaignsService, Injectable, CampaignListItem

### Community 38 - "stock-items.service.ts"
Cohesion: 0.15
Nodes (15): CreateStockItemDto, IsBoolean, IsInt, IsNumber, IsOptional, IsString, MaxLength, Min (+7 more)

### Community 40 - "CampaignExpense"
Cohesion: 0.14
Nodes (12): CampaignExpensesService, Injectable, InjectRepository, CampaignExpense, Column, CreateDateColumn, DeleteDateColumn, Entity (+4 more)

### Community 41 - "campaign-stock.service.ts"
Cohesion: 0.12
Nodes (18): AssignStockItemDto, IsBoolean, IsDateString, IsInt, IsNumber, IsOptional, IsString, Min (+10 more)

### Community 42 - "Company"
Cohesion: 0.08
Nodes (28): CompaniesController, Body, Controller, Delete, Get, Param, Post, Put (+20 more)

### Community 43 - "CampaignPackAnimal"
Cohesion: 0.06
Nodes (40): JwtAuthGuard, Injectable, CampaignPackAnimalsController, Body, Controller, Delete, Param, Post (+32 more)

### Community 44 - "CampaignActivityLog"
Cohesion: 0.10
Nodes (24): CampaignActivityLogsController, Body, Controller, Delete, Param, Post, Put, UseGuards (+16 more)

### Community 45 - "VehiclesService"
Cohesion: 0.08
Nodes (24): CreateVehicleDto, IsBoolean, IsNumber, IsOptional, IsString, MaxLength, Min, Type (+16 more)

### Community 46 - "campaign-expenses.controller.ts"
Cohesion: 0.18
Nodes (13): CreateCampaignExpenseDto, IsDateString, IsIn, IsInt, IsNumber, IsOptional, IsString, MaxLength (+5 more)

### Community 48 - "package.json"
Cohesion: 0.25
Nodes (7): description, engines, node, license, name, private, version

### Community 52 - "PuntoInteres"
Cohesion: 0.08
Nodes (32): IsLatitude, IsLongitude, Patch, CategoriaPuntoInteres, CATEGORIAS_PUNTO_INTERES, PuntoInteres, Column, CreateDateColumn (+24 more)

### Community 53 - "campaign-vehicles.service.ts"
Cohesion: 0.15
Nodes (14): AssignVehicleDto, IsDateString, IsInt, IsNumber, IsOptional, IsString, Min, Type (+6 more)

### Community 54 - "CampaignVehicle"
Cohesion: 0.16
Nodes (12): CampaignVehiclesService, Injectable, InjectRepository, CampaignVehicle, Column, CreateDateColumn, DeleteDateColumn, Entity (+4 more)

### Community 58 - "CampaignVehiclesController"
Cohesion: 0.21
Nodes (8): CampaignVehiclesController, Body, Controller, Delete, Param, Post, Put, UseGuards

### Community 62 - "Vehicle"
Cohesion: 0.29
Nodes (7): Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, Vehicle

### Community 67 - ".create"
Cohesion: 0.15
Nodes (13): CampaignExpensesController, Body, Controller, Delete, Param, Post, Put, UploadedFile (+5 more)

### Community 72 - "CampaignStockItem"
Cohesion: 0.16
Nodes (12): CampaignStockService, Injectable, InjectRepository, CampaignStockItem, Column, CreateDateColumn, DeleteDateColumn, Entity (+4 more)

### Community 73 - "campaigns.service.ts"
Cohesion: 0.24
Nodes (10): CreateCampaignDto, IsDateString, IsInt, IsOptional, IsString, MaxLength, Type, ExtendCampaignDto (+2 more)

### Community 74 - "CampaignGuide"
Cohesion: 0.06
Nodes (36): CampaignGuidesController, Body, Controller, Delete, Param, Post, Put, UseGuards (+28 more)

### Community 75 - "Campaign"
Cohesion: 0.18
Nodes (10): InjectRepository, Campaign, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne (+2 more)

### Community 76 - "campaigns.util.ts"
Cohesion: 0.26
Nodes (12): computeBlendedUnitCost(), computeCampaignStatus(), computeGuideCost(), computeStockItemCost(), computeVehicleCost(), daysBetweenInclusive(), effectiveEndDate(), monthKeyOf() (+4 more)

### Community 77 - "StockCategoriesController"
Cohesion: 0.18
Nodes (8): StockCategoriesController, Body, Controller, Delete, Param, Post, Put, UseGuards

### Community 78 - "CampaignStockController"
Cohesion: 0.21
Nodes (8): CampaignStockController, Body, Controller, Delete, Param, Post, Put, UseGuards

### Community 79 - "CampaignsController"
Cohesion: 0.24
Nodes (8): CampaignsController, Controller, Delete, Get, Param, Res, UseGuards, CampaignDetail

### Community 80 - "StockItem"
Cohesion: 0.18
Nodes (10): StockItem, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn (+2 more)

### Community 81 - "StockItemsController"
Cohesion: 0.22
Nodes (7): StockItemsController, Controller, Delete, Get, Param, Query, UseGuards

### Community 82 - "campaign-export.service.ts"
Cohesion: 0.24
Nodes (5): CampaignExportService, HEADER_FILL, HEADER_FONT, Injectable, campaignStatusLabel()

### Community 84 - "campaigns.types.ts"
Cohesion: 0.22
Nodes (8): CampaignActivityLogView, CampaignExpenseMonthSummary, CampaignExpenseView, CampaignGuideView, CampaignPackAnimalView, CampaignStockItemView, CampaignVehicleView, CampaignStatus

## Knowledge Gaps
- **137 isolated node(s):** `collection`, `sourceRoot`, `deleteOutDir`, `name`, `version` (+132 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **39 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `JwtAuthGuard` connect `CampaignPackAnimal` to `Admin`, `gallery.controller.ts`, `Experience`, `comments.controller.ts`, `images.controller.ts`, `ContactMessage`, `stock-items.service.ts`, `campaign-stock.service.ts`, `CampaignGuide`, `campaigns.service.ts`, `CampaignActivityLog`, `Company`, `campaign-expenses.controller.ts`, `StockCategory`, `VehiclesService`, `PuntoInteres`, `campaign-vehicles.service.ts`?**
  _High betweenness centrality (0.083) - this node is a cross-community bridge._
- **Why does `Company` connect `Company` to `Campaign`, `database.module.ts`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **Why does `CampaignVehicle` connect `CampaignVehicle` to `campaigns.service.ts`, `Campaign`, `VehiclesService`, `database.module.ts`, `campaigns.module.ts`, `campaign-vehicles.service.ts`, `CampaignVehiclesController`, `Vehicle`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **What connects `collection`, `sourceRoot`, `deleteOutDir` to the rest of the system?**
  _137 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Admin` be split into smaller, more focused modules?**
  _Cohesion score 0.06271186440677966 - nodes in this community are weakly interconnected._
- **Should `gallery.controller.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05764145954521417 - nodes in this community are weakly interconnected._
- **Should `Experience` be split into smaller, more focused modules?**
  _Cohesion score 0.059227921734531994 - nodes in this community are weakly interconnected._