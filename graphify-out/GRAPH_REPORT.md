# Graph Report - distanterra-back  (2026-09-02)

## Corpus Check
- 147 files · ~32,040 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1138 nodes · 2223 edges · 72 communities (34 shown, 38 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 101 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `aa8dbd2b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- app.module.ts
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
- CampaignExpense
- CampaignStockItem
- Company
- CampaignPackAnimal
- CampaignActivityLog
- VehiclesService
- CampaignGuide
- campaigns.module.ts
- package.json
- exceljs
- @nestjs/common
- sharp
- CampaignsModule
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
- class-validator
- @types/cookie-parser
- @types/pg
- typescript

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
- `CreateCampaignExpenseDto` --references--> `InvoiceType`  [EXTRACTED]
  src/campaigns/dto/create-campaign-expense.dto.ts → src/database/entities/campaign-expense.entity.ts
- `CampaignActivityLog` --references--> `Admin`  [EXTRACTED]
  src/database/entities/campaign-activity-log.entity.ts → src/database/entities/admin.entity.ts
- `Campaign` --references--> `Admin`  [EXTRACTED]
  src/database/entities/campaign.entity.ts → src/database/entities/admin.entity.ts
- `CampaignExpense` --references--> `Admin`  [EXTRACTED]
  src/database/entities/campaign-expense.entity.ts → src/database/entities/admin.entity.ts

## Import Cycles
- None detected.

## Communities (72 total, 38 thin omitted)

### Community 0 - "app.module.ts"
Cohesion: 0.06
Nodes (38): Req, AppModule, Module, AuthController, LOGIN_THROTTLE_LIMIT, Body, Controller, Get (+30 more)

### Community 1 - "gallery.controller.ts"
Cohesion: 0.06
Nodes (39): Max, GalleryImage, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, CreateGalleryImageDto (+31 more)

### Community 2 - "Experience"
Cohesion: 0.06
Nodes (41): ArrayMinSize, ExperienceDescriptionBlock, Experience, Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn (+33 more)

### Community 3 - "comments.controller.ts"
Cohesion: 0.06
Nodes (39): CommentResponse, CommentsController, Body, Controller, Delete, Get, Param, Post (+31 more)

### Community 4 - "images.controller.ts"
Cohesion: 0.07
Nodes (32): toPublicFileUrl(), Image, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, CreateImageDto (+24 more)

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
Nodes (7): bcrypt, class-transformer, dependencies, bcrypt, class-transformer, typeorm, typeorm

### Community 11 - "seed-experiences.ts"
Cohesion: 0.29
Nodes (3): Block, experiences, SeedExperience

### Community 12 - "nest-cli.json"
Cohesion: 0.40
Nodes (4): collection, compilerOptions, deleteOutDir, sourceRoot

### Community 13 - "StockCategory"
Cohesion: 0.09
Nodes (25): StockCategory, Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, CreateStockCategoryDto (+17 more)

### Community 18 - "Distanterra API"
Cohesion: 0.11
Nodes (18): 1. Prerequisites, 2. Install dependencies, 3. Configure environment variables, 4. Create the database schema, 5. Create the admin account, 6. (Optional) Migrate the original hardcoded experiences, 7. Run the API, API overview (+10 more)

### Community 33 - "campaigns.service.ts"
Cohesion: 0.06
Nodes (50): CampaignExportService, HEADER_FILL, HEADER_FONT, Injectable, CampaignsController, Body, Controller, Delete (+42 more)

### Community 38 - "StockItemsService"
Cohesion: 0.06
Nodes (36): StockItem, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn (+28 more)

### Community 40 - "CampaignExpense"
Cohesion: 0.06
Nodes (38): CampaignExpensesController, Body, Controller, Delete, Param, Post, Put, UploadedFile (+30 more)

### Community 41 - "CampaignStockItem"
Cohesion: 0.06
Nodes (38): CampaignStockController, Body, Controller, Delete, Param, Post, Put, UseGuards (+30 more)

### Community 42 - "Company"
Cohesion: 0.08
Nodes (28): CompaniesController, Body, Controller, Delete, Get, Param, Post, Put (+20 more)

### Community 43 - "CampaignPackAnimal"
Cohesion: 0.06
Nodes (38): CampaignPackAnimalsController, Body, Controller, Delete, Param, Post, Put, UseGuards (+30 more)

### Community 44 - "CampaignActivityLog"
Cohesion: 0.10
Nodes (24): CampaignActivityLogsController, Body, Controller, Delete, Param, Post, Put, UseGuards (+16 more)

### Community 45 - "VehiclesService"
Cohesion: 0.08
Nodes (24): CreateVehicleDto, IsBoolean, IsNumber, IsOptional, IsString, MaxLength, Min, Type (+16 more)

### Community 46 - "CampaignGuide"
Cohesion: 0.06
Nodes (39): JwtAuthGuard, Injectable, CampaignGuidesController, Body, Controller, Delete, Param, Post (+31 more)

### Community 47 - "campaigns.module.ts"
Cohesion: 0.21
Nodes (12): DatabaseModule, Module, Campaign, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn (+4 more)

### Community 48 - "package.json"
Cohesion: 0.25
Nodes (7): description, engines, node, license, name, private, version

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
Cohesion: 0.20
Nodes (9): Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, Vehicle, Module (+1 more)

## Knowledge Gaps
- **137 isolated node(s):** `collection`, `sourceRoot`, `deleteOutDir`, `name`, `version` (+132 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **38 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `JwtAuthGuard` connect `CampaignGuide` to `app.module.ts`, `campaigns.service.ts`, `Experience`, `comments.controller.ts`, `gallery.controller.ts`, `ContactMessage`, `images.controller.ts`, `StockItemsService`, `CampaignExpense`, `CampaignStockItem`, `Company`, `CampaignPackAnimal`, `CampaignActivityLog`, `StockCategory`, `VehiclesService`, `campaign-vehicles.service.ts`?**
  _High betweenness centrality (0.079) - this node is a cross-community bridge._
- **Why does `CampaignVehicle` connect `CampaignVehicle` to `campaigns.service.ts`, `VehiclesService`, `CampaignGuide`, `campaigns.module.ts`, `campaign-vehicles.service.ts`, `CampaignVehiclesController`, `Vehicle`?**
  _High betweenness centrality (0.047) - this node is a cross-community bridge._
- **Why does `Admin` connect `app.module.ts` to `CampaignExpense`, `CampaignActivityLog`, `campaigns.module.ts`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **What connects `collection`, `sourceRoot`, `deleteOutDir` to the rest of the system?**
  _137 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `app.module.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.061343204653622425 - nodes in this community are weakly interconnected._
- **Should `gallery.controller.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.059322033898305086 - nodes in this community are weakly interconnected._
- **Should `Experience` be split into smaller, more focused modules?**
  _Cohesion score 0.059227921734531994 - nodes in this community are weakly interconnected._