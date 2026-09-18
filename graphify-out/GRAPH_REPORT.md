# Graph Report - distanterra-back  (2026-09-18)

## Corpus Check
- 216 files · ~52,371 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1658 nodes · 3340 edges · 113 communities (71 shown, 42 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 136 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d492d403`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- CampaignPackAnimal
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
- StockItemsService
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
- stock-items.service.ts
- CLAUDE.md
- CampaignExpense
- campaign-stock.service.ts
- Company
- campaign-pack-animals.service.ts
- campaigns.module.ts
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
- CampaignPackAnimalsController
- campaign-guides.service.ts
- CampaignVehiclesController
- employees.service.ts
- FinancialDocumentsService
- tsconfig-paths
- Vehicle
- @types/multer
- FinancialDocument
- VehiclesController
- @typescript-eslint/eslint-plugin
- campaign-export.service.ts
- StockItem
- CreateFinancialDocumentDto
- EmployeesService
- CampaignStockItem
- service-records.service.ts
- CampaignGuide
- StockItemsController
- campaigns.util.ts
- .update
- app.module.ts
- dotenv
- financial-documents.service.ts
- Employee
- eslint-config-prettier
- campaigns.service.ts
- fast-xml-parser
- @nestjs/config
- class-transformer
- typeorm
- PrivateFilesController
- @types/adm-zip
- prettier
- @types/passport-jwt
- Campañas
- file-upload.util.ts
- ts-loader
- ServiceRecordsService
- @types/uuid
- .assertCampaignEditable
- @types/bcrypt
- @types/node
- typescript
- JwtAuthGuard
- Módulos
- campaigns.types.ts
- Referencia de la API
- Archivos subidos
- Autenticación y seguridad
- Despliegue
- Distanterra API
- Administración
- Empleados
- Mapa
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
- `main()` --calls--> `parseKmzTrack()`  [EXTRACTED]
  scripts/backfill-tracking-stats.ts → src/common/utils/kml-parser.util.ts
- `main()` --calls--> `resolveUploadPath()`  [EXTRACTED]
  scripts/backfill-tracking-stats.ts → src/common/uploads/upload-targets.ts
- `main()` --calls--> `uploadsBaseDir()`  [EXTRACTED]
  scripts/migrate-uploads-split.ts → src/common/uploads/upload-targets.ts
- `main()` --calls--> `visibilityOf()`  [EXTRACTED]
  scripts/migrate-uploads-split.ts → src/common/uploads/upload-targets.ts
- `CampaignListItem` --references--> `CampaignStatus`  [EXTRACTED]
  src/campaigns/campaigns.types.ts → src/campaigns/campaigns.util.ts

## Import Cycles
- None detected.

## Communities (113 total, 42 thin omitted)

### Community 0 - "CampaignPackAnimal"
Cohesion: 0.14
Nodes (13): CampaignPackAnimalsService, Injectable, InjectRepository, InjectRepository, CampaignPackAnimal, Column, CreateDateColumn, DeleteDateColumn (+5 more)

### Community 1 - "gallery.controller.ts"
Cohesion: 0.06
Nodes (39): Max, GalleryImage, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, CreateGalleryImageDto (+31 more)

### Community 2 - "Experience"
Cohesion: 0.06
Nodes (41): ArrayMinSize, ExperienceDescriptionBlock, Experience, Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn (+33 more)

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
Cohesion: 0.12
Nodes (17): eslint, @nestjs/cli, devDependencies, eslint, @nestjs/cli, source-map-support, ts-node, @types/cookie-parser (+9 more)

### Community 7 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowSyntheticDefaultImports, baseUrl, declaration, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, forceConsistentCasingInFileNames (+16 more)

### Community 8 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, build, db:init, db:reset, db:seed-admin, db:seed-experiences, format, lint (+7 more)

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
Cohesion: 0.06
Nodes (45): collectDescriptions(), collectLineStrings(), collectTimestamps(), computeStats(), dedupeDescriptionLines(), findFirstPlacemarkName(), haversineMeters(), htmlToPlainText() (+37 more)

### Community 31 - "upload-targets.ts"
Cohesion: 0.12
Nodes (26): dryRun, main(), recalculateAll, dryRun, main(), moveInto(), assertSafeRelativePath(), isInsideRoot() (+18 more)

### Community 33 - "CampaignsService"
Cohesion: 0.15
Nodes (14): CampaignsController, Body, Controller, Delete, Get, Param, Post, Put (+6 more)

### Community 38 - "stock-items.service.ts"
Cohesion: 0.13
Nodes (17): CreateStockItemDto, IsBoolean, IsInt, IsNumber, IsOptional, IsString, MaxLength, Min (+9 more)

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
Cohesion: 0.12
Nodes (18): AssignPackAnimalDto, IsDateString, IsInt, IsNumber, IsOptional, IsString, MaxLength, Min (+10 more)

### Community 44 - "campaigns.module.ts"
Cohesion: 0.06
Nodes (42): CampaignActivityLogsController, Body, Controller, Delete, Param, Post, Put, UseGuards (+34 more)

### Community 45 - "vehicles.service.ts"
Cohesion: 0.14
Nodes (16): CreateVehicleDto, IsBoolean, IsNumber, IsOptional, IsString, MaxLength, Min, Type (+8 more)

### Community 47 - "EmployeeInsurancePolicy"
Cohesion: 0.09
Nodes (23): saveRawFile(), EmployeeInsurancePolicy, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne (+15 more)

### Community 48 - "package.json"
Cohesion: 0.25
Nodes (7): description, engines, node, license, name, private, version

### Community 52 - "PuntoInteres"
Cohesion: 0.08
Nodes (32): IsLatitude, IsLongitude, CategoriaPuntoInteres, CATEGORIAS_PUNTO_INTERES, PuntoInteres, Column, CreateDateColumn, Entity (+24 more)

### Community 53 - "campaign-vehicles.service.ts"
Cohesion: 0.15
Nodes (14): AssignVehicleDto, IsDateString, IsInt, IsNumber, IsOptional, IsString, Min, Type (+6 more)

### Community 54 - "CampaignVehicle"
Cohesion: 0.16
Nodes (12): CampaignVehiclesService, Injectable, InjectRepository, CampaignVehicle, Column, CreateDateColumn, DeleteDateColumn, Entity (+4 more)

### Community 55 - "EmployeeMedicalExam"
Cohesion: 0.10
Nodes (25): EmployeeMedicalExam, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn (+17 more)

### Community 56 - "CampaignPackAnimalsController"
Cohesion: 0.21
Nodes (8): CampaignPackAnimalsController, Body, Controller, Delete, Param, Post, Put, UseGuards

### Community 57 - "campaign-guides.service.ts"
Cohesion: 0.13
Nodes (16): AssignGuideDto, IsDateString, IsInt, IsNumber, IsOptional, IsString, Min, Type (+8 more)

### Community 58 - "CampaignVehiclesController"
Cohesion: 0.21
Nodes (8): CampaignVehiclesController, Body, Controller, Delete, Param, Post, Put, UseGuards

### Community 59 - "employees.service.ts"
Cohesion: 0.12
Nodes (20): EMPLOYMENT_STATUSES, EmploymentStatus, CreateEmployeeDto, IsBoolean, IsDateString, IsIn, IsNumber, IsOptional (+12 more)

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
Cohesion: 0.25
Nodes (5): CampaignExportService, HEADER_FILL, HEADER_FONT, Injectable, campaignStatusLabel()

### Community 68 - "StockItem"
Cohesion: 0.18
Nodes (10): StockItem, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn (+2 more)

### Community 69 - "CreateFinancialDocumentDto"
Cohesion: 0.18
Nodes (11): CreateFinancialDocumentDto, IsDateString, IsIn, IsInt, IsNumber, IsOptional, IsString, Matches (+3 more)

### Community 70 - "EmployeesService"
Cohesion: 0.12
Nodes (13): EmployeesController, Body, Controller, Delete, Get, Param, Post, Put (+5 more)

### Community 72 - "CampaignStockItem"
Cohesion: 0.10
Nodes (20): CampaignStockController, Body, Controller, Delete, Param, Post, Put, UseGuards (+12 more)

### Community 73 - "service-records.service.ts"
Cohesion: 0.16
Nodes (12): IsOptional, IsString, Matches, UpdateServiceRecordDto, ServiceRecordsController, Body, Controller, Get (+4 more)

### Community 74 - "CampaignGuide"
Cohesion: 0.11
Nodes (17): CampaignGuidesController, Body, Controller, Delete, Param, Post, Put, UseGuards (+9 more)

### Community 75 - "StockItemsController"
Cohesion: 0.22
Nodes (7): StockItemsController, Controller, Delete, Get, Param, Query, UseGuards

### Community 76 - "campaigns.util.ts"
Cohesion: 0.27
Nodes (11): computeBlendedUnitCost(), computeCampaignStatus(), computeGuideCost(), computeStockItemCost(), computeVehicleCost(), daysBetweenInclusive(), effectiveEndDate(), monthKeyOf() (+3 more)

### Community 77 - ".update"
Cohesion: 0.15
Nodes (12): FinancialDocumentsController, Body, Controller, Delete, Get, Param, Post, Put (+4 more)

### Community 78 - "app.module.ts"
Cohesion: 0.05
Nodes (42): Req, AppModule, Module, AuthController, LOGIN_THROTTLE_LIMIT, Body, Controller, Get (+34 more)

### Community 80 - "financial-documents.service.ts"
Cohesion: 0.32
Nodes (7): DOCUMENT_CURRENCIES, DocumentCurrency, FINANCIAL_DOCUMENT_TYPES, FinancialDocumentType, UpdateFinancialDocumentDto, SUBFOLDER_BY_TYPE, FinancialDocumentView

### Community 81 - "Employee"
Cohesion: 0.20
Nodes (9): Employee, Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn (+1 more)

### Community 83 - "campaigns.service.ts"
Cohesion: 0.20
Nodes (14): CampaignDetail, CreateCampaignDto, IsDateString, IsIn, IsInt, IsOptional, IsString, MaxLength (+6 more)

### Community 88 - "PrivateFilesController"
Cohesion: 0.29
Nodes (6): SkipThrottle, FilesModule, Module, PrivateFilesController, Controller, UseGuards

### Community 92 - "Campañas"
Cohesion: 0.11
Nodes (17): Baqueanos y animales de carga, Bitácora, Campañas, Categorías de stock, Cálculo de costos, Cómo pisar el cálculo, Dos lecturas distintas de la disponibilidad, Empresas (+9 more)

### Community 93 - "file-upload.util.ts"
Cohesion: 0.22
Nodes (12): resolveUploadDir(), ALLOWED_MIME_TYPES, buildImageMemoryMulterOptions(), buildImageMulterOptions(), buildKmzMemoryMulterOptions(), buildPdfMemoryMulterOptions(), deleteUploadedFile(), imageFileFilter() (+4 more)

### Community 97 - ".assertCampaignEditable"
Cohesion: 0.27
Nodes (4): CampaignGuidesService, Injectable, InjectRepository, validateAssignmentDateRange()

### Community 102 - "JwtAuthGuard"
Cohesion: 0.30
Nodes (7): JwtAuthGuard, Injectable, CreateEmployeeInsurancePolicyDto, IsDateString, IsString, MaxLength, UpdateEmployeeInsurancePolicyDto

### Community 103 - "Módulos"
Cohesion: 0.20
Nodes (10): Bloques de descripción, Comentarios (testimonios), Contenido bilingüe, Contenido del sitio, Experiencias, Galería, Imágenes (logos), Mensajes de contacto (+2 more)

### Community 104 - "campaigns.types.ts"
Cohesion: 0.22
Nodes (9): CampaignActivityLogView, CampaignExpenseMonthSummary, CampaignExpenseView, CampaignGuideView, CampaignPackAnimalView, CampaignStockItemView, CampaignVehicleView, CampaignStatus (+1 more)

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
Cohesion: 0.22
Nodes (8): Carga en dos pasos, Datos del archivo, En el panel, Mapa, Métricas del recorrido, Puntos de interés, Reprocesar trackings ya cargados, Trackings

## Knowledge Gaps
- **211 isolated node(s):** `collection`, `sourceRoot`, `deleteOutDir`, `name`, `version` (+206 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **42 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `JwtAuthGuard` connect `JwtAuthGuard` to `gallery.controller.ts`, `Experience`, `comments.controller.ts`, `images.controller.ts`, `ContactMessage`, `StockCategory`, `trackings.service.ts`, `upload-targets.ts`, `stock-items.service.ts`, `CampaignExpense`, `campaign-stock.service.ts`, `Company`, `campaign-pack-animals.service.ts`, `campaigns.module.ts`, `vehicles.service.ts`, `PuntoInteres`, `campaign-vehicles.service.ts`, `EmployeeMedicalExam`, `campaign-guides.service.ts`, `employees.service.ts`, `service-records.service.ts`, `app.module.ts`, `financial-documents.service.ts`, `campaigns.service.ts`?**
  _High betweenness centrality (0.079) - this node is a cross-community bridge._
- **Why does `AppConfig` connect `app.module.ts` to `CampaignPackAnimal`, `FinancialDocument`, `gallery.controller.ts`, `comments.controller.ts`, `images.controller.ts`, `ContactMessage`, `service-records.service.ts`, `campaigns.module.ts`, `financial-documents.service.ts`, `Employee`, `trackings.service.ts`, `campaigns.service.ts`, `employees.service.ts`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._
- **Why does `toFileUrl()` connect `upload-targets.ts` to `gallery.controller.ts`, `comments.controller.ts`, `images.controller.ts`, `EmployeesService`, `service-records.service.ts`, `campaigns.util.ts`, `financial-documents.service.ts`, `trackings.service.ts`, `campaigns.service.ts`, `employees.service.ts`, `FinancialDocumentsService`, `ServiceRecordsService`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **What connects `collection`, `sourceRoot`, `deleteOutDir` to the rest of the system?**
  _211 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `CampaignPackAnimal` be split into smaller, more focused modules?**
  _Cohesion score 0.13725490196078433 - nodes in this community are weakly interconnected._
- **Should `gallery.controller.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.059322033898305086 - nodes in this community are weakly interconnected._
- **Should `Experience` be split into smaller, more focused modules?**
  _Cohesion score 0.059227921734531994 - nodes in this community are weakly interconnected._