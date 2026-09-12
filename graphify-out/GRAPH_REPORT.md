# Graph Report - distanterra-back  (2026-09-12)

## Corpus Check
- 166 files · ~35,494 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1258 nodes · 2464 edges · 92 communities (50 shown, 42 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 112 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `9671dbd1`
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
- bcrypt
- seed-experiences.ts
- nest-cli.json
- StockCategory
- dependencies
- reflect-metadata
- helmet
- trackings.service.ts
- Distanterra API
- app.module.ts
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
- campaigns.module.ts
- rxjs
- campaigns.service.ts
- uuid
- stock-items.service.ts
- CLAUDE.md
- CampaignExpense
- campaign-stock.service.ts
- Company
- campaign-pack-animals.service.ts
- CampaignActivityLog
- vehicles.service.ts
- VehiclesService
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
- CampaignPackAnimalsController
- ts-node
- tsconfig-paths
- Vehicle
- @types/multer
- CampaignPackAnimal
- VehiclesController
- @typescript-eslint/eslint-plugin
- Admin
- @types/cookie-parser
- @types/pg
- AssignGuideDto
- CampaignStockItem
- UpdateCampaignGuideDto
- CampaignGuidesService
- Campaign
- .assertCampaignEditable
- main.ts
- CampaignStockController
- dotenv
- StockItem
- StockItemsController
- eslint-config-prettier
- StockItemsService
- fast-xml-parser
- @nestjs/config
- class-transformer
- typeorm
- source-map-support
- @types/adm-zip
- @types/express
- @types/passport-jwt

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

## Communities (92 total, 42 thin omitted)

### Community 0 - "AppConfig"
Cohesion: 0.27
Nodes (6): AuthModule, Module, JwtStrategy, Injectable, InjectRepository, AppConfig

### Community 1 - "gallery.controller.ts"
Cohesion: 0.06
Nodes (37): Max, GalleryImage, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, CreateGalleryImageDto (+29 more)

### Community 2 - "Experience"
Cohesion: 0.06
Nodes (39): ArrayMinSize, ExperienceDescriptionBlock, Experience, Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn (+31 more)

### Community 3 - "comments.controller.ts"
Cohesion: 0.07
Nodes (33): CommentResponse, CommentsController, Body, Controller, Delete, Get, Param, Post (+25 more)

### Community 4 - "images.controller.ts"
Cohesion: 0.07
Nodes (31): Image, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, CreateImageDto, IsInt (+23 more)

### Community 5 - "ContactMessage"
Cohesion: 0.08
Nodes (28): CONTACT_THROTTLE_LIMIT, ContactMessagesController, Body, Controller, Delete, Get, HttpCode, Param (+20 more)

### Community 6 - "devDependencies"
Cohesion: 0.13
Nodes (15): eslint, devDependencies, eslint, ts-loader, @types/bcrypt, @types/node, @types/uuid, typescript (+7 more)

### Community 7 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowSyntheticDefaultImports, baseUrl, declaration, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, forceConsistentCasingInFileNames (+16 more)

### Community 8 - "scripts"
Cohesion: 0.15
Nodes (13): scripts, build, db:init, db:reset, db:seed-admin, db:seed-experiences, format, lint (+5 more)

### Community 9 - "exclude"
Cohesion: 0.20
Nodes (9): dist, node_modules, scripts, **/*spec.ts, sql, test, ./tsconfig.json, exclude (+1 more)

### Community 11 - "seed-experiences.ts"
Cohesion: 0.29
Nodes (3): Block, experiences, SeedExperience

### Community 12 - "nest-cli.json"
Cohesion: 0.40
Nodes (4): collection, compilerOptions, deleteOutDir, sourceRoot

### Community 13 - "StockCategory"
Cohesion: 0.10
Nodes (23): StockCategory, Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, CreateStockCategoryDto (+15 more)

### Community 14 - "dependencies"
Cohesion: 0.22
Nodes (9): adm-zip, class-validator, cookie-parser, joi, dependencies, adm-zip, class-validator, cookie-parser (+1 more)

### Community 17 - "trackings.service.ts"
Cohesion: 0.06
Nodes (42): ALLOWED_MIME_TYPES, buildImageMemoryMulterOptions(), buildImageMulterOptions(), buildKmzMemoryMulterOptions(), imageFileFilter(), kmzFileFilter(), logger, MAX_UPLOAD_SIZE_BYTES (+34 more)

### Community 18 - "Distanterra API"
Cohesion: 0.11
Nodes (18): 1. Prerequisites, 2. Install dependencies, 3. Configure environment variables, 4. Create the database schema, 5. Create the admin account, 6. (Optional) Migrate the original hardcoded experiences, 7. Run the API, API overview (+10 more)

### Community 19 - "app.module.ts"
Cohesion: 0.09
Nodes (21): CampaignsModule, Module, FriendlyThrottlerGuard, Injectable, envValidationSchema, DatabaseModule, Module, ExperiencesModule (+13 more)

### Community 31 - "campaigns.module.ts"
Cohesion: 0.21
Nodes (9): CampaignGuide, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn (+1 more)

### Community 33 - "campaigns.service.ts"
Cohesion: 0.05
Nodes (50): CampaignExportService, HEADER_FILL, HEADER_FONT, Injectable, CampaignsController, Body, Controller, Delete (+42 more)

### Community 38 - "stock-items.service.ts"
Cohesion: 0.15
Nodes (15): CreateStockItemDto, IsBoolean, IsInt, IsNumber, IsOptional, IsString, MaxLength, Min (+7 more)

### Community 40 - "CampaignExpense"
Cohesion: 0.06
Nodes (37): CampaignExpensesController, Body, Controller, Delete, Param, Post, Put, UploadedFile (+29 more)

### Community 41 - "campaign-stock.service.ts"
Cohesion: 0.12
Nodes (18): AssignStockItemDto, IsBoolean, IsDateString, IsInt, IsNumber, IsOptional, IsString, Min (+10 more)

### Community 42 - "Company"
Cohesion: 0.08
Nodes (28): CompaniesController, Body, Controller, Delete, Get, Param, Post, Put (+20 more)

### Community 43 - "campaign-pack-animals.service.ts"
Cohesion: 0.11
Nodes (18): AssignPackAnimalDto, IsDateString, IsInt, IsNumber, IsOptional, IsString, MaxLength, Min (+10 more)

### Community 44 - "CampaignActivityLog"
Cohesion: 0.05
Nodes (47): Req, AuthController, LOGIN_THROTTLE_LIMIT, Body, Controller, Get, HttpCode, Post (+39 more)

### Community 45 - "vehicles.service.ts"
Cohesion: 0.16
Nodes (14): CreateVehicleDto, IsBoolean, IsNumber, IsOptional, IsString, MaxLength, Min, Type (+6 more)

### Community 48 - "package.json"
Cohesion: 0.25
Nodes (7): description, engines, node, license, name, private, version

### Community 52 - "PuntoInteres"
Cohesion: 0.08
Nodes (30): IsLatitude, IsLongitude, CategoriaPuntoInteres, CATEGORIAS_PUNTO_INTERES, PuntoInteres, Column, CreateDateColumn, Entity (+22 more)

### Community 53 - "campaign-vehicles.service.ts"
Cohesion: 0.15
Nodes (14): AssignVehicleDto, IsDateString, IsInt, IsNumber, IsOptional, IsString, Min, Type (+6 more)

### Community 54 - "CampaignVehicle"
Cohesion: 0.16
Nodes (12): CampaignVehiclesService, Injectable, InjectRepository, CampaignVehicle, Column, CreateDateColumn, DeleteDateColumn, Entity (+4 more)

### Community 58 - "CampaignVehiclesController"
Cohesion: 0.21
Nodes (8): CampaignVehiclesController, Body, Controller, Delete, Param, Post, Put, UseGuards

### Community 59 - "CampaignPackAnimalsController"
Cohesion: 0.21
Nodes (8): CampaignPackAnimalsController, Body, Controller, Delete, Param, Post, Put, UseGuards

### Community 62 - "Vehicle"
Cohesion: 0.22
Nodes (8): Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, Vehicle, InjectRepository

### Community 64 - "CampaignPackAnimal"
Cohesion: 0.18
Nodes (10): InjectRepository, CampaignPackAnimal, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne (+2 more)

### Community 65 - "VehiclesController"
Cohesion: 0.22
Nodes (7): Controller, Delete, Get, Param, Query, UseGuards, VehiclesController

### Community 67 - "Admin"
Cohesion: 0.25
Nodes (7): InjectRepository, Admin, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn

### Community 70 - "AssignGuideDto"
Cohesion: 0.25
Nodes (8): AssignGuideDto, IsDateString, IsInt, IsNumber, IsOptional, IsString, Min, Type

### Community 72 - "CampaignStockItem"
Cohesion: 0.14
Nodes (13): CampaignStockService, Injectable, InjectRepository, InjectRepository, CampaignStockItem, Column, CreateDateColumn, DeleteDateColumn (+5 more)

### Community 73 - "UpdateCampaignGuideDto"
Cohesion: 0.25
Nodes (8): IsDateString, IsInt, IsNumber, IsOptional, IsString, Min, Type, UpdateCampaignGuideDto

### Community 74 - "CampaignGuidesService"
Cohesion: 0.15
Nodes (11): CampaignGuidesController, Body, Controller, Delete, Param, Post, Put, UseGuards (+3 more)

### Community 75 - "Campaign"
Cohesion: 0.22
Nodes (9): Campaign, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn (+1 more)

### Community 76 - ".assertCampaignEditable"
Cohesion: 0.39
Nodes (3): CampaignPackAnimalsService, Injectable, validateAssignmentDateRange()

### Community 77 - "main.ts"
Cohesion: 0.40
Nodes (3): AppModule, Module, logger

### Community 78 - "CampaignStockController"
Cohesion: 0.21
Nodes (8): CampaignStockController, Body, Controller, Delete, Param, Post, Put, UseGuards

### Community 80 - "StockItem"
Cohesion: 0.18
Nodes (10): StockItem, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn (+2 more)

### Community 81 - "StockItemsController"
Cohesion: 0.22
Nodes (7): StockItemsController, Controller, Delete, Get, Param, Query, UseGuards

## Knowledge Gaps
- **142 isolated node(s):** `collection`, `sourceRoot`, `deleteOutDir`, `name`, `version` (+137 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **42 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `JwtAuthGuard` connect `CampaignActivityLog` to `gallery.controller.ts`, `Experience`, `comments.controller.ts`, `images.controller.ts`, `ContactMessage`, `stock-items.service.ts`, `campaign-stock.service.ts`, `Company`, `campaign-pack-animals.service.ts`, `StockCategory`, `vehicles.service.ts`, `trackings.service.ts`, `PuntoInteres`, `campaign-vehicles.service.ts`, `campaigns.module.ts`?**
  _High betweenness centrality (0.081) - this node is a cross-community bridge._
- **Why does `AppConfig` connect `AppConfig` to `campaigns.service.ts`, `gallery.controller.ts`, `comments.controller.ts`, `images.controller.ts`, `ContactMessage`, `CampaignStockItem`, `CampaignActivityLog`, `main.ts`, `database.module.ts`, `trackings.service.ts`, `app.module.ts`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Why does `Campaign` connect `Campaign` to `CampaignPackAnimal`, `campaigns.service.ts`, `Admin`, `CampaignStockItem`, `CampaignExpense`, `Company`, `campaign-pack-animals.service.ts`, `.assertCampaignEditable`, `CampaignActivityLog`, `database.module.ts`, `CampaignVehicle`, `campaigns.module.ts`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **What connects `collection`, `sourceRoot`, `deleteOutDir` to the rest of the system?**
  _142 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `gallery.controller.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.062310949788263764 - nodes in this community are weakly interconnected._
- **Should `Experience` be split into smaller, more focused modules?**
  _Cohesion score 0.062146892655367235 - nodes in this community are weakly interconnected._
- **Should `comments.controller.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07256894049346879 - nodes in this community are weakly interconnected._