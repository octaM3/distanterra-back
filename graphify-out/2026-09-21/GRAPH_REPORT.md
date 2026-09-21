# Graph Report - distanterra-back  (2026-09-21)

## Corpus Check
- 208 files · ~57,213 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1710 nodes · 3482 edges · 119 communities (76 shown, 43 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 144 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0b85aef6`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- budget-pdf.service.ts
- gallery.controller.ts
- Experience
- comments.controller.ts
- Image
- ContactMessage
- devDependencies
- compilerOptions
- scripts
- exclude
- UpdateCampaignGuideDto
- seed-experiences.ts
- nest-cli.json
- database.module.ts
- dependencies
- reflect-metadata
- helmet
- trackings.service.ts
- campaigns.module.ts
- @nestjs/core
- @nestjs/jwt
- @nestjs/mapped-types
- @nestjs/passport
- @nestjs/platform-express
- @nestjs/serve-static
- @nestjs/throttler
- .login
- passport
- passport-jwt
- pg
- file-upload.util.ts
- rxjs
- Param
- uuid
- StockItemsController
- CLAUDE.md
- CampaignExpense
- campaign-stock.service.ts
- Company
- campaign-pack-animals.service.ts
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
- Admin
- app.module.ts
- CampaignVehiclesController
- employees.service.ts
- CampaignPackAnimalsService
- CreateStockItemDto
- Vehicle
- @types/multer
- FinancialDocument
- VehiclesController
- @typescript-eslint/eslint-plugin
- campaign-export.service.ts
- campaign-activity-logs.controller.ts
- CampaignsService
- EmployeesService
- CampaignStockItem
- service-records.service.ts
- AssignGuideDto
- StockItemsService
- campaigns.util.ts
- financial-documents.service.ts
- saveRawFile
- dotenv
- ChangePasswordDto
- Employee
- JwtAuthGuard
- campaigns.service.ts
- fast-xml-parser
- @nestjs/config
- class-transformer
- typeorm
- CampaignPackAnimal
- @types/adm-zip
- prettier
- @types/passport-jwt
- Campañas
- LoginDto
- ts-loader
- ServiceRecordsService
- @types/uuid
- @nestjs/cli
- @types/bcrypt
- Los catálogos
- FinancialDocumentsService
- pdfkit
- source-map-support
- Módulos
- Cálculo de costos
- @types/express
- Referencia de la API
- Archivos subidos
- Autenticación y seguridad
- Despliegue
- Distanterra API
- Administración
- Empleados
- Mapa
- @types/pdfkit
- @typescript-eslint/parser
- eslint-config-prettier
- bcrypt
- @nestjs/typeorm

## God Nodes (most connected - your core abstractions)
1. `CampaignsService` - 37 edges
2. `Campaign` - 36 edges
3. `JwtAuthGuard` - 27 edges
4. `AppConfig` - 27 edges
5. `Company` - 26 edges
6. `StockCategory` - 26 edges
7. `FinancialDocument` - 25 edges
8. `CampaignListItem` - 24 edges
9. `CampaignExpense` - 24 edges
10. `CampaignStockItem` - 24 edges

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

## Communities (119 total, 43 thin omitted)

### Community 0 - "budget-pdf.service.ts"
Cohesion: 0.14
Nodes (12): BudgetLine, BudgetPdfService, COLORS, formatDate(), formatDays(), formatMoney(), ISSUER, MONTH_NAMES (+4 more)

### Community 1 - "gallery.controller.ts"
Cohesion: 0.06
Nodes (37): GalleryImage, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, CreateGalleryImageDto, IsInt (+29 more)

### Community 2 - "Experience"
Cohesion: 0.06
Nodes (39): ArrayMinSize, ExperienceDescriptionBlock, Experience, Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn (+31 more)

### Community 3 - "comments.controller.ts"
Cohesion: 0.07
Nodes (33): CommentResponse, CommentsController, Body, Controller, Delete, Get, Param, Post (+25 more)

### Community 4 - "Image"
Cohesion: 0.07
Nodes (30): Image, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, CreateImageDto, IsInt (+22 more)

### Community 5 - "ContactMessage"
Cohesion: 0.08
Nodes (26): CONTACT_THROTTLE_LIMIT, ContactMessagesController, Body, Controller, Delete, Get, HttpCode, Param (+18 more)

### Community 6 - "devDependencies"
Cohesion: 0.12
Nodes (17): eslint, eslint-plugin-prettier, devDependencies, eslint, eslint-plugin-prettier, ts-node, tsconfig-paths, @types/cookie-parser (+9 more)

### Community 7 - "compilerOptions"
Cohesion: 0.08
Nodes (24): compilerOptions, allowSyntheticDefaultImports, baseUrl, declaration, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, forceConsistentCasingInFileNames (+16 more)

### Community 8 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, build, db:init, db:reset, db:seed-admin, db:seed-experiences, format, lint (+7 more)

### Community 9 - "exclude"
Cohesion: 0.20
Nodes (9): dist, node_modules, scripts, **/*spec.ts, sql, test, ./tsconfig.json, exclude (+1 more)

### Community 10 - "UpdateCampaignGuideDto"
Cohesion: 0.12
Nodes (16): CampaignGuidesController, Body, Controller, Delete, Param, Post, Put, UseGuards (+8 more)

### Community 11 - "seed-experiences.ts"
Cohesion: 0.29
Nodes (3): Block, experiences, SeedExperience

### Community 12 - "nest-cli.json"
Cohesion: 0.33
Nodes (5): collection, compilerOptions, assets, deleteOutDir, sourceRoot

### Community 13 - "database.module.ts"
Cohesion: 0.06
Nodes (45): Campaign, CAMPAIGN_APPROVAL_STATUSES, RESERVING_APPROVAL_STATUS, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn (+37 more)

### Community 14 - "dependencies"
Cohesion: 0.22
Nodes (9): adm-zip, class-validator, cookie-parser, joi, dependencies, adm-zip, class-validator, cookie-parser (+1 more)

### Community 17 - "trackings.service.ts"
Cohesion: 0.06
Nodes (43): collectDescriptions(), collectLineStrings(), collectTimestamps(), computeStats(), dedupeDescriptionLines(), findFirstPlacemarkName(), haversineMeters(), htmlToPlainText() (+35 more)

### Community 19 - "campaigns.module.ts"
Cohesion: 0.15
Nodes (13): CampaignGuidesService, Injectable, InjectRepository, validateAssignmentDateRange(), CampaignGuide, Column, CreateDateColumn, DeleteDateColumn (+5 more)

### Community 27 - ".login"
Cohesion: 0.15
Nodes (12): Req, AuthController, Body, Controller, Get, HttpCode, Post, Res (+4 more)

### Community 31 - "file-upload.util.ts"
Cohesion: 0.07
Nodes (43): dryRun, main(), recalculateAll, dryRun, main(), moveInto(), SkipThrottle, assertSafeRelativePath() (+35 more)

### Community 33 - "Param"
Cohesion: 0.21
Nodes (6): Body, Delete, Get, Param, Put, Res

### Community 38 - "StockItemsController"
Cohesion: 0.15
Nodes (12): StockItemsController, Body, Controller, Delete, Get, Param, Post, Put (+4 more)

### Community 40 - "CampaignExpense"
Cohesion: 0.06
Nodes (37): CampaignExpensesController, Body, Controller, Delete, Param, Post, Put, UploadedFile (+29 more)

### Community 41 - "campaign-stock.service.ts"
Cohesion: 0.12
Nodes (18): AssignStockItemDto, IsBoolean, IsDateString, IsInt, IsNumber, IsOptional, IsString, Min (+10 more)

### Community 42 - "Company"
Cohesion: 0.09
Nodes (26): CompaniesController, Body, Controller, Delete, Get, Param, Post, Put (+18 more)

### Community 43 - "campaign-pack-animals.service.ts"
Cohesion: 0.12
Nodes (18): AssignPackAnimalDto, IsDateString, IsInt, IsNumber, IsOptional, IsString, MaxLength, Min (+10 more)

### Community 44 - "CampaignActivityLog"
Cohesion: 0.10
Nodes (20): CampaignActivityLogsController, Body, Controller, Delete, Param, Post, Put, UseGuards (+12 more)

### Community 45 - "vehicles.service.ts"
Cohesion: 0.16
Nodes (14): CreateVehicleDto, IsBoolean, IsNumber, IsOptional, IsString, MaxLength, Min, Type (+6 more)

### Community 47 - "EmployeeInsurancePolicy"
Cohesion: 0.13
Nodes (18): deleteUploadedFile(), EmployeeInsurancePolicy, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne (+10 more)

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
Cohesion: 0.09
Nodes (25): EmployeeMedicalExam, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn (+17 more)

### Community 56 - "Admin"
Cohesion: 0.20
Nodes (8): InjectRepository, InjectRepository, Admin, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn

### Community 57 - "app.module.ts"
Cohesion: 0.05
Nodes (38): AppModule, Module, AuthModule, Module, CampaignsModule, Module, FriendlyThrottlerGuard, Injectable (+30 more)

### Community 58 - "CampaignVehiclesController"
Cohesion: 0.21
Nodes (8): CampaignVehiclesController, Body, Controller, Delete, Param, Post, Put, UseGuards

### Community 59 - "employees.service.ts"
Cohesion: 0.13
Nodes (18): EMPLOYMENT_STATUSES, EmploymentStatus, CreateEmployeeDto, IsBoolean, IsDateString, IsIn, IsNumber, IsOptional (+10 more)

### Community 60 - "CampaignPackAnimalsService"
Cohesion: 0.16
Nodes (10): CampaignPackAnimalsController, Body, Controller, Delete, Param, Post, Put, UseGuards (+2 more)

### Community 61 - "CreateStockItemDto"
Cohesion: 0.21
Nodes (10): CreateStockItemDto, IsBoolean, IsInt, IsNumber, IsOptional, IsString, MaxLength, Min (+2 more)

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

### Community 68 - "campaign-activity-logs.controller.ts"
Cohesion: 0.54
Nodes (4): CreateActivityLogDto, IsDateString, IsString, UpdateActivityLogDto

### Community 69 - "CampaignsService"
Cohesion: 0.20
Nodes (9): CampaignsController, Controller, Post, Query, UseGuards, CampaignsService, Injectable, CampaignListItem (+1 more)

### Community 70 - "EmployeesService"
Cohesion: 0.13
Nodes (15): EmployeesController, Body, Controller, Delete, Get, Param, Post, Put (+7 more)

### Community 72 - "CampaignStockItem"
Cohesion: 0.10
Nodes (20): CampaignStockController, Body, Controller, Delete, Param, Post, Put, UseGuards (+12 more)

### Community 73 - "service-records.service.ts"
Cohesion: 0.15
Nodes (12): IsOptional, IsString, Matches, UpdateServiceRecordDto, ServiceRecordsController, Body, Controller, Get (+4 more)

### Community 74 - "AssignGuideDto"
Cohesion: 0.25
Nodes (8): AssignGuideDto, IsDateString, IsInt, IsNumber, IsOptional, IsString, Min, Type

### Community 76 - "campaigns.util.ts"
Cohesion: 0.24
Nodes (12): ALLOWED_APPROVAL_TRANSITIONS, APPROVAL_LABELS, computeBlendedUnitCost(), computeCampaignStatus(), computeGuideCost(), computeStockItemCost(), computeVehicleCost(), effectiveEndDate() (+4 more)

### Community 77 - "financial-documents.service.ts"
Cohesion: 0.15
Nodes (18): DOCUMENT_CURRENCIES, DocumentCurrency, FINANCIAL_DOCUMENT_TYPES, FinancialDocumentType, CreateFinancialDocumentDto, IsDateString, IsIn, IsInt (+10 more)

### Community 78 - "saveRawFile"
Cohesion: 0.19
Nodes (11): saveRawFile(), EmployeeInsurancePoliciesController, Body, Controller, Delete, Param, Post, Put (+3 more)

### Community 80 - "ChangePasswordDto"
Cohesion: 0.50
Nodes (3): ChangePasswordDto, IsString, MinLength

### Community 81 - "Employee"
Cohesion: 0.20
Nodes (9): Employee, Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn (+1 more)

### Community 82 - "JwtAuthGuard"
Cohesion: 0.23
Nodes (9): LOGIN_THROTTLE_LIMIT, CurrentAdmin, JwtAuthGuard, Injectable, JwtPayload, JwtStrategy, Injectable, AppConfig (+1 more)

### Community 83 - "campaigns.service.ts"
Cohesion: 0.12
Nodes (24): CampaignActivityLogView, CampaignExpenseMonthSummary, CampaignGuideView, CampaignPackAnimalView, CampaignStockItemView, CampaignVehicleView, CampaignStatus, CreateCampaignDto (+16 more)

### Community 88 - "CampaignPackAnimal"
Cohesion: 0.15
Nodes (11): InjectRepository, InjectRepository, CampaignPackAnimal, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn (+3 more)

### Community 92 - "Campañas"
Cohesion: 0.13
Nodes (14): Bitácora, Campañas, Ciclo de vida, Dos lecturas distintas de la disponibilidad, El limbo de `esperando_finalizacion`, El PDF, Estados, Exportación a Excel (+6 more)

### Community 93 - "LoginDto"
Cohesion: 0.50
Nodes (3): LoginDto, IsString, MinLength

### Community 99 - "Los catálogos"
Cohesion: 0.40
Nodes (5): Categorías de stock, Empresas, Los catálogos, Stock, Vehículos

### Community 100 - "FinancialDocumentsService"
Cohesion: 0.12
Nodes (14): FinancialDocumentsController, Body, Controller, Delete, Get, Param, Post, Put (+6 more)

### Community 103 - "Módulos"
Cohesion: 0.20
Nodes (10): Bloques de descripción, Comentarios (testimonios), Contenido bilingüe, Contenido del sitio, Experiencias, Galería, Imágenes (logos), Mensajes de contacto (+2 more)

### Community 104 - "Cálculo de costos"
Cohesion: 0.50
Nodes (4): Baqueanos y animales de carga, Cálculo de costos, Cómo pisar el cálculo, Stock y vehículos

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
- **224 isolated node(s):** `collection`, `sourceRoot`, `deleteOutDir`, `assets`, `name` (+219 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **43 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `JwtAuthGuard` connect `JwtAuthGuard` to `gallery.controller.ts`, `Experience`, `comments.controller.ts`, `ContactMessage`, `database.module.ts`, `trackings.service.ts`, `campaigns.module.ts`, `file-upload.util.ts`, `campaign-stock.service.ts`, `Company`, `campaign-pack-animals.service.ts`, `vehicles.service.ts`, `EmployeeInsurancePolicy`, `PuntoInteres`, `campaign-vehicles.service.ts`, `EmployeeMedicalExam`, `employees.service.ts`, `CreateStockItemDto`, `campaign-activity-logs.controller.ts`, `service-records.service.ts`, `financial-documents.service.ts`, `campaigns.service.ts`?**
  _High betweenness centrality (0.097) - this node is a cross-community bridge._
- **Why does `AppConfig` connect `JwtAuthGuard` to `FinancialDocument`, `gallery.controller.ts`, `comments.controller.ts`, `Image`, `ContactMessage`, `CampaignPackAnimal`, `employees.service.ts`, `service-records.service.ts`, `database.module.ts`, `financial-documents.service.ts`, `Employee`, `trackings.service.ts`, `campaigns.service.ts`, `Admin`, `app.module.ts`, `.login`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **Why does `toFileUrl()` connect `file-upload.util.ts` to `gallery.controller.ts`, `comments.controller.ts`, `FinancialDocumentsService`, `Image`, `EmployeesService`, `service-records.service.ts`, `campaigns.util.ts`, `financial-documents.service.ts`, `trackings.service.ts`, `JwtAuthGuard`, `campaigns.service.ts`, `employees.service.ts`, `ServiceRecordsService`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **What connects `collection`, `sourceRoot`, `deleteOutDir` to the rest of the system?**
  _224 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `budget-pdf.service.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.14130434782608695 - nodes in this community are weakly interconnected._
- **Should `gallery.controller.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.062310949788263764 - nodes in this community are weakly interconnected._
- **Should `Experience` be split into smaller, more focused modules?**
  _Cohesion score 0.062146892655367235 - nodes in this community are weakly interconnected._