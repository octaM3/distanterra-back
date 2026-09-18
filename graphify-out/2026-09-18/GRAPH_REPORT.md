# Graph Report - distanterra-back  (2026-09-18)

## Corpus Check
- 214 files · ~49,994 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1642 nodes · 3308 edges · 117 communities (76 shown, 41 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 136 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d492d403`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- AppConfig
- gallery.controller.ts
- Experience
- comments.controller.ts
- images.controller.ts
- ContactMessagesController
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
- upload-targets.ts
- rxjs
- CampaignsService
- uuid
- StockItemsService
- CLAUDE.md
- CampaignExpense
- campaign-stock.service.ts
- Company
- CampaignPackAnimal
- CampaignActivityLog
- vehicles.service.ts
- VehiclesService
- EmployeeInsurancePolicy
- package.json
- exceljs
- @nestjs/common
- sharp
- PuntoInteres
- campaign-vehicles.service.ts
- CampaignVehicle
- EmployeeMedicalExam
- @nestjs/cli
- campaign-guides.service.ts
- CampaignVehiclesController
- employees.service.ts
- ts-node
- tsconfig-paths
- Vehicle
- @types/multer
- FinancialDocument
- VehiclesController
- @typescript-eslint/eslint-plugin
- campaign-export.service.ts
- @types/cookie-parser
- .create
- EmployeesService
- CampaignStockItem
- service-records.service.ts
- CampaignGuide
- campaigns.module.ts
- campaigns.service.ts
- FinancialDocumentsService
- CurrentAdmin
- dotenv
- financial-documents.service.ts
- campaign-expenses.controller.ts
- eslint-config-prettier
- campaigns.controller.ts
- fast-xml-parser
- @nestjs/config
- class-transformer
- typeorm
- source-map-support
- @types/adm-zip
- auth.controller.ts
- @types/passport-jwt
- Campañas
- file-upload.util.ts
- ContactMessage
- ServiceRecordsService
- contact-messages.controller.ts
- .assertCampaignEditable
- @types/bcrypt
- @types/node
- typescript
- CampaignStockController
- JwtAuthGuard
- Módulos
- campaigns.types.ts
- CreateEmployeeDto
- Referencia de la API
- Archivos subidos
- Autenticación y seguridad
- Despliegue
- Distanterra API
- Administración
- Empleados
- Mapa
- .create
- Cálculo de costos
- eslint-plugin-prettier

## God Nodes (most connected - your core abstractions)
1. `Campaign` - 35 edges
2. `CampaignsService` - 30 edges
3. `JwtAuthGuard` - 27 edges
4. `AppConfig` - 27 edges
5. `Company` - 26 edges
6. `StockCategory` - 26 edges
7. `FinancialDocument` - 25 edges
8. `CampaignExpense` - 24 edges
9. `CampaignStockItem` - 24 edges
10. `CampaignVehicle` - 24 edges

## Surprising Connections (you probably didn't know these)
- `main()` --calls--> `uploadsBaseDir()`  [EXTRACTED]
  scripts/migrate-uploads-split.ts → src/common/uploads/upload-targets.ts
- `main()` --calls--> `visibilityOf()`  [EXTRACTED]
  scripts/migrate-uploads-split.ts → src/common/uploads/upload-targets.ts
- `CampaignListItem` --references--> `CampaignStatus`  [EXTRACTED]
  src/campaigns/campaigns.types.ts → src/campaigns/campaigns.util.ts
- `CampaignListItem` --references--> `CampaignKind`  [EXTRACTED]
  src/campaigns/campaigns.types.ts → src/database/entities/campaign.entity.ts
- `CampaignExpenseView` --references--> `InvoiceType`  [EXTRACTED]
  src/campaigns/campaigns.types.ts → src/database/entities/campaign-expense.entity.ts

## Import Cycles
- None detected.

## Communities (117 total, 41 thin omitted)

### Community 0 - "AppConfig"
Cohesion: 0.17
Nodes (9): AppModule, Module, AuthModule, Module, JwtStrategy, Injectable, InjectRepository, AppConfig (+1 more)

### Community 1 - "gallery.controller.ts"
Cohesion: 0.06
Nodes (39): Max, GalleryImage, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, CreateGalleryImageDto (+31 more)

### Community 2 - "Experience"
Cohesion: 0.06
Nodes (39): ArrayMinSize, ExperienceDescriptionBlock, Experience, Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn (+31 more)

### Community 3 - "comments.controller.ts"
Cohesion: 0.07
Nodes (33): CommentResponse, CommentsController, Body, Controller, Delete, Get, Param, Post (+25 more)

### Community 4 - "images.controller.ts"
Cohesion: 0.07
Nodes (31): Image, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, CreateImageDto, IsInt (+23 more)

### Community 5 - "ContactMessagesController"
Cohesion: 0.18
Nodes (7): ContactMessagesController, Controller, Delete, Get, Param, Put, UseGuards

### Community 6 - "devDependencies"
Cohesion: 0.13
Nodes (15): eslint, devDependencies, eslint, prettier, ts-loader, @types/express, @types/pg, @types/uuid (+7 more)

### Community 7 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowSyntheticDefaultImports, baseUrl, declaration, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, forceConsistentCasingInFileNames (+16 more)

### Community 8 - "scripts"
Cohesion: 0.14
Nodes (14): scripts, build, db:init, db:reset, db:seed-admin, db:seed-experiences, format, lint (+6 more)

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
Cohesion: 0.09
Nodes (25): StockCategory, Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, CreateStockCategoryDto (+17 more)

### Community 14 - "dependencies"
Cohesion: 0.22
Nodes (9): adm-zip, class-validator, cookie-parser, joi, dependencies, adm-zip, class-validator, cookie-parser (+1 more)

### Community 17 - "trackings.service.ts"
Cohesion: 0.07
Nodes (35): collectLineStrings(), findFirstPlacemarkName(), parseCoordinatesText(), ParsedKmzTrack, parseKmzTrack(), xmlParser, Tracking, Column (+27 more)

### Community 19 - "app.module.ts"
Cohesion: 0.08
Nodes (23): CampaignsModule, Module, FriendlyThrottlerGuard, Injectable, envValidationSchema, DatabaseModule, Module, EmployeesModule (+15 more)

### Community 31 - "upload-targets.ts"
Cohesion: 0.11
Nodes (29): dryRun, main(), moveInto(), SkipThrottle, assertSafeRelativePath(), isInsideRoot(), KNOWN_PRIVATE_SUBFOLDERS, KNOWN_PUBLIC_SUBFOLDERS (+21 more)

### Community 33 - "CampaignsService"
Cohesion: 0.15
Nodes (14): CampaignsController, Body, Controller, Delete, Param, Post, Put, Query (+6 more)

### Community 38 - "StockItemsService"
Cohesion: 0.06
Nodes (34): StockItem, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn (+26 more)

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
Nodes (38): CampaignPackAnimalsController, Body, Controller, Delete, Param, Post, Put, UseGuards (+30 more)

### Community 44 - "CampaignActivityLog"
Cohesion: 0.10
Nodes (20): CampaignActivityLogsController, Body, Controller, Delete, Param, Post, Put, UseGuards (+12 more)

### Community 45 - "vehicles.service.ts"
Cohesion: 0.16
Nodes (14): CreateVehicleDto, IsBoolean, IsNumber, IsOptional, IsString, MaxLength, Min, Type (+6 more)

### Community 47 - "EmployeeInsurancePolicy"
Cohesion: 0.09
Nodes (27): EmployeeInsurancePolicy, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn (+19 more)

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

### Community 55 - "EmployeeMedicalExam"
Cohesion: 0.10
Nodes (25): EmployeeMedicalExam, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn (+17 more)

### Community 57 - "campaign-guides.service.ts"
Cohesion: 0.13
Nodes (16): AssignGuideDto, IsDateString, IsInt, IsNumber, IsOptional, IsString, Min, Type (+8 more)

### Community 58 - "CampaignVehiclesController"
Cohesion: 0.21
Nodes (8): CampaignVehiclesController, Body, Controller, Delete, Param, Post, Put, UseGuards

### Community 59 - "employees.service.ts"
Cohesion: 0.14
Nodes (15): Employee, EMPLOYMENT_STATUSES, EmploymentStatus, Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany (+7 more)

### Community 62 - "Vehicle"
Cohesion: 0.22
Nodes (8): Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, Vehicle, InjectRepository

### Community 64 - "FinancialDocument"
Cohesion: 0.09
Nodes (21): FinancialDocument, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany (+13 more)

### Community 65 - "VehiclesController"
Cohesion: 0.22
Nodes (7): Controller, Delete, Get, Param, Query, UseGuards, VehiclesController

### Community 67 - "campaign-export.service.ts"
Cohesion: 0.17
Nodes (8): CampaignExportService, HEADER_FILL, HEADER_FONT, Injectable, Get, Res, CampaignDetail, campaignStatusLabel()

### Community 69 - ".create"
Cohesion: 0.15
Nodes (13): CampaignExpensesController, Body, Controller, Delete, Param, Post, Put, UploadedFile (+5 more)

### Community 70 - "EmployeesService"
Cohesion: 0.11
Nodes (17): EmployeesController, Body, Controller, Delete, Get, Param, Post, Put (+9 more)

### Community 72 - "CampaignStockItem"
Cohesion: 0.14
Nodes (13): CampaignStockService, Injectable, InjectRepository, InjectRepository, CampaignStockItem, Column, CreateDateColumn, DeleteDateColumn (+5 more)

### Community 73 - "service-records.service.ts"
Cohesion: 0.15
Nodes (12): IsOptional, IsString, Matches, UpdateServiceRecordDto, ServiceRecordsController, Body, Controller, Get (+4 more)

### Community 74 - "CampaignGuide"
Cohesion: 0.11
Nodes (17): CampaignGuidesController, Body, Controller, Delete, Param, Post, Put, UseGuards (+9 more)

### Community 75 - "campaigns.module.ts"
Cohesion: 0.17
Nodes (16): Admin, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, Campaign, Column (+8 more)

### Community 76 - "campaigns.service.ts"
Cohesion: 0.31
Nodes (11): computeBlendedUnitCost(), computeCampaignStatus(), computeGuideCost(), computeStockItemCost(), computeVehicleCost(), daysBetweenInclusive(), effectiveEndDate(), monthKeyOf() (+3 more)

### Community 77 - "FinancialDocumentsService"
Cohesion: 0.12
Nodes (14): FinancialDocumentsController, Body, Controller, Delete, Get, Param, Post, Put (+6 more)

### Community 78 - "CurrentAdmin"
Cohesion: 0.13
Nodes (14): Req, AuthController, Body, Controller, Get, HttpCode, Post, Res (+6 more)

### Community 80 - "financial-documents.service.ts"
Cohesion: 0.15
Nodes (18): DOCUMENT_CURRENCIES, DocumentCurrency, FINANCIAL_DOCUMENT_TYPES, FinancialDocumentType, CreateFinancialDocumentDto, IsDateString, IsIn, IsInt (+10 more)

### Community 81 - "campaign-expenses.controller.ts"
Cohesion: 0.18
Nodes (12): CreateCampaignExpenseDto, IsDateString, IsIn, IsInt, IsNumber, IsOptional, IsString, MaxLength (+4 more)

### Community 83 - "campaigns.controller.ts"
Cohesion: 0.20
Nodes (11): CreateCampaignDto, IsDateString, IsIn, IsInt, IsOptional, IsString, MaxLength, Type (+3 more)

### Community 90 - "auth.controller.ts"
Cohesion: 0.22
Nodes (8): LOGIN_THROTTLE_LIMIT, ChangePasswordDto, IsString, MinLength, LoginDto, IsString, MinLength, JwtPayload

### Community 92 - "Campañas"
Cohesion: 0.14
Nodes (13): Bitácora, Campañas, Categorías de stock, Dos lecturas distintas de la disponibilidad, Empresas, Estados, Exportación a Excel, Fechas y bloqueo (+5 more)

### Community 93 - "file-upload.util.ts"
Cohesion: 0.21
Nodes (13): resolveUploadDir(), ALLOWED_MIME_TYPES, buildImageMemoryMulterOptions(), buildImageMulterOptions(), buildKmzMemoryMulterOptions(), buildPdfMemoryMulterOptions(), deleteUploadedFile(), imageFileFilter() (+5 more)

### Community 94 - "ContactMessage"
Cohesion: 0.20
Nodes (9): ContactMessagesService, Injectable, InjectRepository, ContactMessage, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn (+1 more)

### Community 96 - "contact-messages.controller.ts"
Cohesion: 0.23
Nodes (8): CONTACT_THROTTLE_LIMIT, ContactMessagesModule, Module, CreateContactMessageDto, IsEmail, IsOptional, IsString, MaxLength

### Community 97 - ".assertCampaignEditable"
Cohesion: 0.27
Nodes (4): CampaignGuidesService, Injectable, InjectRepository, validateAssignmentDateRange()

### Community 101 - "CampaignStockController"
Cohesion: 0.21
Nodes (8): CampaignStockController, Body, Controller, Delete, Param, Post, Put, UseGuards

### Community 102 - "JwtAuthGuard"
Cohesion: 0.35
Nodes (6): JwtAuthGuard, Injectable, CreateActivityLogDto, IsDateString, IsString, UpdateActivityLogDto

### Community 103 - "Módulos"
Cohesion: 0.20
Nodes (10): Bloques de descripción, Comentarios (testimonios), Contenido bilingüe, Contenido del sitio, Experiencias, Galería, Imágenes (logos), Mensajes de contacto (+2 more)

### Community 104 - "campaigns.types.ts"
Cohesion: 0.22
Nodes (9): CampaignActivityLogView, CampaignExpenseMonthSummary, CampaignExpenseView, CampaignGuideView, CampaignPackAnimalView, CampaignStockItemView, CampaignVehicleView, CampaignStatus (+1 more)

### Community 105 - "CreateEmployeeDto"
Cohesion: 0.20
Nodes (10): CreateEmployeeDto, IsBoolean, IsDateString, IsIn, IsNumber, IsOptional, IsString, MaxLength (+2 more)

### Community 106 - "Referencia de la API"
Cohesion: 0.22
Nodes (9): Administración, Archivos, Autenticación, Campañas, Catálogos de campañas, Contenido del sitio, Empleados, Mapa (+1 more)

### Community 107 - "Archivos subidos"
Cohesion: 0.25
Nodes (8): Archivos subidos, Dos árboles, según quién puede verlos, El endpoint privado, Las rutas en la base no llevan el prefijo, Límites, Migración desde el layout viejo, Optimización de imágenes, Un detalle de la cookie

### Community 108 - "Autenticación y seguridad"
Cohesion: 0.29
Nodes (7): Autenticación y seguridad, Contraseñas, El login está oculto, Flujo de sesión, Otras medidas, Protecciones del formulario de contacto, Rate limiting

### Community 109 - "Despliegue"
Cohesion: 0.29
Nodes (7): Despliegue, Orden de despliegue, Pasos, Pendiente: `trust proxy`, Respaldos, Uploads y Nginx, Versiones

### Community 110 - "Distanterra API"
Cohesion: 0.29
Nodes (7): Distanterra API, Documentación, Estructura, Puesta en marcha, Qué hace, Scripts, Stack

### Community 111 - "Administración"
Cohesion: 0.33
Nodes (5): Administración, Campos, Documentos financieros, El estado no se marca a mano, Estado de servicios

### Community 112 - "Empleados"
Cohesion: 0.33
Nodes (6): Cómo se arma el listado, Datos del legajo, Empleados, Exámenes médicos, Pólizas de seguro, Una limitación conocida

### Community 113 - "Mapa"
Cohesion: 0.33
Nodes (5): Carga en dos pasos, En el panel, Mapa, Puntos de interés, Trackings

### Community 114 - ".create"
Cohesion: 0.40
Nodes (4): Body, HttpCode, Post, Throttle

### Community 115 - "Cálculo de costos"
Cohesion: 0.50
Nodes (4): Baqueanos y animales de carga, Cálculo de costos, Cómo pisar el cálculo, Stock y vehículos

## Knowledge Gaps
- **204 isolated node(s):** `collection`, `sourceRoot`, `deleteOutDir`, `name`, `version` (+199 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **41 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `JwtAuthGuard` connect `JwtAuthGuard` to `gallery.controller.ts`, `Experience`, `comments.controller.ts`, `images.controller.ts`, `StockCategory`, `trackings.service.ts`, `upload-targets.ts`, `StockItemsService`, `campaign-stock.service.ts`, `Company`, `CampaignPackAnimal`, `vehicles.service.ts`, `EmployeeInsurancePolicy`, `PuntoInteres`, `campaign-vehicles.service.ts`, `EmployeeMedicalExam`, `campaign-guides.service.ts`, `employees.service.ts`, `service-records.service.ts`, `financial-documents.service.ts`, `campaign-expenses.controller.ts`, `campaigns.controller.ts`, `auth.controller.ts`, `contact-messages.controller.ts`?**
  _High betweenness centrality (0.088) - this node is a cross-community bridge._
- **Why does `AppConfig` connect `AppConfig` to `contact-messages.controller.ts`, `FinancialDocument`, `gallery.controller.ts`, `comments.controller.ts`, `images.controller.ts`, `EmployeesService`, `CampaignStockItem`, `service-records.service.ts`, `campaigns.module.ts`, `campaigns.service.ts`, `CurrentAdmin`, `financial-documents.service.ts`, `trackings.service.ts`, `app.module.ts`, `auth.controller.ts`, `employees.service.ts`, `ContactMessage`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **Why does `Comment` connect `comments.controller.ts` to `campaigns.module.ts`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **What connects `collection`, `sourceRoot`, `deleteOutDir` to the rest of the system?**
  _204 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `gallery.controller.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.059322033898305086 - nodes in this community are weakly interconnected._
- **Should `Experience` be split into smaller, more focused modules?**
  _Cohesion score 0.062146892655367235 - nodes in this community are weakly interconnected._
- **Should `comments.controller.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07256894049346879 - nodes in this community are weakly interconnected._