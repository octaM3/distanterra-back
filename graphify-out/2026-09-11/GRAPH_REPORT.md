# Graph Report - distanterra-back  (2026-09-11)

## Corpus Check
- 153 files · ~32,625 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1188 nodes · 2324 edges · 86 communities (46 shown, 40 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 106 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `89a0d95b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- .login
- GalleryImage
- Experience
- Comment
- Image
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
- stock-items.service.ts
- CLAUDE.md
- CampaignExpense
- CampaignStockItem
- Company
- campaign-pack-animals.service.ts
- CampaignActivityLog
- vehicles.service.ts
- campaign-guides.service.ts
- campaigns.module.ts
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
- campaign-stock.service.ts
- @types/cookie-parser
- @types/pg
- typescript
- gallery.controller.ts
- campaign-expenses.controller.ts
- CampaignGuide
- CampaignPackAnimal
- StockItemsService
- AppConfig
- CampaignGuidesController
- CampaignPackAnimalsController
- VehiclesController
- VehiclesService
- StockItemsController
- .assertCampaignEditable
- image-optimizer.util.ts
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
- `CreateCampaignExpenseDto` --references--> `InvoiceType`  [EXTRACTED]
  src/campaigns/dto/create-campaign-expense.dto.ts → src/database/entities/campaign-expense.entity.ts
- `CampaignActivityLog` --references--> `Admin`  [EXTRACTED]
  src/database/entities/campaign-activity-log.entity.ts → src/database/entities/admin.entity.ts
- `CampaignExpense` --references--> `Admin`  [EXTRACTED]
  src/database/entities/campaign-expense.entity.ts → src/database/entities/admin.entity.ts
- `CampaignActivityLog` --references--> `Campaign`  [EXTRACTED]
  src/database/entities/campaign-activity-log.entity.ts → src/database/entities/campaign.entity.ts

## Import Cycles
- None detected.

## Communities (86 total, 40 thin omitted)

### Community 0 - ".login"
Cohesion: 0.15
Nodes (12): Req, AuthController, Body, Controller, Get, HttpCode, Post, Res (+4 more)

### Community 1 - "GalleryImage"
Cohesion: 0.06
Nodes (37): Max, GalleryImage, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, CreateGalleryImageDto (+29 more)

### Community 2 - "Experience"
Cohesion: 0.06
Nodes (41): ArrayMinSize, ExperienceDescriptionBlock, Experience, Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn (+33 more)

### Community 3 - "Comment"
Cohesion: 0.07
Nodes (32): CommentsController, Body, Controller, Delete, Get, Param, Post, Put (+24 more)

### Community 4 - "Image"
Cohesion: 0.07
Nodes (30): Image, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, CreateImageDto, IsInt (+22 more)

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
Nodes (7): bcrypt, class-validator, dependencies, bcrypt, class-validator, typeorm, typeorm

### Community 11 - "seed-experiences.ts"
Cohesion: 0.29
Nodes (3): Block, experiences, SeedExperience

### Community 12 - "nest-cli.json"
Cohesion: 0.40
Nodes (4): collection, compilerOptions, deleteOutDir, sourceRoot

### Community 13 - "StockCategory"
Cohesion: 0.09
Nodes (24): StockCategory, Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, CreateStockCategoryDto (+16 more)

### Community 18 - "Distanterra API"
Cohesion: 0.11
Nodes (18): 1. Prerequisites, 2. Install dependencies, 3. Configure environment variables, 4. Create the database schema, 5. Create the admin account, 6. (Optional) Migrate the original hardcoded experiences, 7. Run the API, API overview (+10 more)

### Community 33 - "campaigns.service.ts"
Cohesion: 0.06
Nodes (49): CampaignExportService, HEADER_FILL, HEADER_FONT, Injectable, CampaignsController, Body, Controller, Delete (+41 more)

### Community 38 - "stock-items.service.ts"
Cohesion: 0.16
Nodes (15): CreateStockItemDto, IsBoolean, IsInt, IsNumber, IsOptional, IsString, MaxLength, Min (+7 more)

### Community 40 - "CampaignExpense"
Cohesion: 0.06
Nodes (36): CampaignExpensesController, Body, Controller, Delete, Param, Post, Put, UploadedFile (+28 more)

### Community 41 - "CampaignStockItem"
Cohesion: 0.10
Nodes (20): CampaignStockController, Body, Controller, Delete, Param, Post, Put, UseGuards (+12 more)

### Community 42 - "Company"
Cohesion: 0.08
Nodes (28): CompaniesController, Body, Controller, Delete, Get, Param, Post, Put (+20 more)

### Community 43 - "campaign-pack-animals.service.ts"
Cohesion: 0.12
Nodes (18): AssignPackAnimalDto, IsDateString, IsInt, IsNumber, IsOptional, IsString, MaxLength, Min (+10 more)

### Community 44 - "CampaignActivityLog"
Cohesion: 0.10
Nodes (24): CampaignActivityLogsController, Body, Controller, Delete, Param, Post, Put, UseGuards (+16 more)

### Community 45 - "vehicles.service.ts"
Cohesion: 0.16
Nodes (14): CreateVehicleDto, IsBoolean, IsNumber, IsOptional, IsString, MaxLength, Min, Type (+6 more)

### Community 46 - "campaign-guides.service.ts"
Cohesion: 0.13
Nodes (16): AssignGuideDto, IsDateString, IsInt, IsNumber, IsOptional, IsString, Min, Type (+8 more)

### Community 47 - "campaigns.module.ts"
Cohesion: 0.07
Nodes (41): AppModule, Module, AuthModule, Module, InjectRepository, CampaignsModule, Module, envValidationSchema (+33 more)

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
Cohesion: 0.22
Nodes (8): Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, Vehicle, InjectRepository

### Community 67 - "campaign-stock.service.ts"
Cohesion: 0.12
Nodes (18): AssignStockItemDto, IsBoolean, IsDateString, IsInt, IsNumber, IsOptional, IsString, Min (+10 more)

### Community 72 - "gallery.controller.ts"
Cohesion: 0.19
Nodes (13): JwtAuthGuard, Injectable, CommentResponse, ALLOWED_MIME_TYPES, buildImageMemoryMulterOptions(), buildImageMulterOptions(), imageFileFilter(), logger (+5 more)

### Community 73 - "campaign-expenses.controller.ts"
Cohesion: 0.22
Nodes (9): LOGIN_THROTTLE_LIMIT, CurrentAdmin, ChangePasswordDto, IsString, MinLength, LoginDto, IsString, MinLength (+1 more)

### Community 74 - "CampaignGuide"
Cohesion: 0.16
Nodes (12): CampaignGuidesService, Injectable, InjectRepository, CampaignGuide, Column, CreateDateColumn, DeleteDateColumn, Entity (+4 more)

### Community 75 - "CampaignPackAnimal"
Cohesion: 0.15
Nodes (11): InjectRepository, InjectRepository, CampaignPackAnimal, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn (+3 more)

### Community 77 - "AppConfig"
Cohesion: 0.26
Nodes (5): JwtStrategy, Injectable, InjectRepository, AppConfig, logger

### Community 78 - "CampaignGuidesController"
Cohesion: 0.21
Nodes (8): CampaignGuidesController, Body, Controller, Delete, Param, Post, Put, UseGuards

### Community 79 - "CampaignPackAnimalsController"
Cohesion: 0.21
Nodes (8): CampaignPackAnimalsController, Body, Controller, Delete, Param, Post, Put, UseGuards

### Community 80 - "VehiclesController"
Cohesion: 0.20
Nodes (7): Controller, Delete, Get, Param, Query, UseGuards, VehiclesController

### Community 82 - "StockItemsController"
Cohesion: 0.22
Nodes (7): StockItemsController, Controller, Delete, Get, Param, Query, UseGuards

### Community 83 - ".assertCampaignEditable"
Cohesion: 0.39
Nodes (3): CampaignPackAnimalsService, Injectable, validateAssignmentDateRange()

## Knowledge Gaps
- **137 isolated node(s):** `collection`, `sourceRoot`, `deleteOutDir`, `name`, `version` (+132 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **40 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `JwtAuthGuard` connect `gallery.controller.ts` to `campaigns.service.ts`, `Experience`, `campaign-stock.service.ts`, `ContactMessage`, `stock-items.service.ts`, `campaign-expenses.controller.ts`, `Company`, `campaign-pack-animals.service.ts`, `CampaignActivityLog`, `StockCategory`, `campaign-guides.service.ts`, `vehicles.service.ts`, `PuntoInteres`, `campaign-vehicles.service.ts`?**
  _High betweenness centrality (0.094) - this node is a cross-community bridge._
- **Why does `CampaignVehicle` connect `CampaignVehicle` to `campaigns.service.ts`, `CampaignPackAnimal`, `vehicles.service.ts`, `campaigns.module.ts`, `VehiclesService`, `campaign-vehicles.service.ts`, `CampaignVehiclesController`, `Vehicle`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Why does `Admin` connect `campaigns.module.ts` to `.login`, `CampaignExpense`, `campaign-expenses.controller.ts`, `CampaignActivityLog`, `AppConfig`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **What connects `collection`, `sourceRoot`, `deleteOutDir` to the rest of the system?**
  _137 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `GalleryImage` be split into smaller, more focused modules?**
  _Cohesion score 0.05701754385964912 - nodes in this community are weakly interconnected._
- **Should `Experience` be split into smaller, more focused modules?**
  _Cohesion score 0.059227921734531994 - nodes in this community are weakly interconnected._
- **Should `Comment` be split into smaller, more focused modules?**
  _Cohesion score 0.06980392156862746 - nodes in this community are weakly interconnected._