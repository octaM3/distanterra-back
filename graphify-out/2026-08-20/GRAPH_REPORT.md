# Graph Report - distanterra-back  (2026-08-20)

## Corpus Check
- 68 files · ~11,851 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 538 nodes · 867 edges · 40 communities (17 shown, 23 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 30 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2b974d1b`
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
- typeorm
- uuid
- bcrypt
- CLAUDE.md

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 24 edges
2. `Experience` - 22 edges
3. `Comment` - 18 edges
4. `ContactMessage` - 18 edges
5. `AppConfig` - 17 edges
6. `GalleryImage` - 17 edges
7. `Image` - 17 edges
8. `CreateExperienceDto` - 16 edges
9. `CreateCommentDto` - 13 edges
10. `ContactMessagesService` - 13 edges

## Surprising Connections (you probably didn't know these)
- `Experience` --references--> `ExperienceDescriptionBlock`  [EXTRACTED]
  src/database/entities/experience.entity.ts → src/database/entities/experience-description-block.ts
- `CreateExperienceDto` --references--> `DescriptionBlockDto`  [EXTRACTED]
  src/experiences/dto/create-experience.dto.ts → src/experiences/dto/description-block.dto.ts

## Import Cycles
- None detected.

## Communities (40 total, 23 thin omitted)

### Community 0 - "app.module.ts"
Cohesion: 0.05
Nodes (47): Req, Res, AppModule, Module, AuthController, LOGIN_THROTTLE_LIMIT, Body, Controller (+39 more)

### Community 1 - "gallery.controller.ts"
Cohesion: 0.06
Nodes (40): Max, Min, Query, logger, OPTIMIZABLE_MIME_TYPES, optimizeAndSaveImage(), GalleryImage, Column (+32 more)

### Community 2 - "Experience"
Cohesion: 0.06
Nodes (39): ArrayMinSize, IsIn, ExperienceDescriptionBlock, Experience, Column, CreateDateColumn, DeleteDateColumn, Entity (+31 more)

### Community 3 - "comments.controller.ts"
Cohesion: 0.07
Nodes (32): CommentResponse, CommentsController, Body, Controller, Delete, Get, Param, Post (+24 more)

### Community 4 - "images.controller.ts"
Cohesion: 0.07
Nodes (34): ALLOWED_MIME_TYPES, buildImageMemoryMulterOptions(), buildImageMulterOptions(), imageFileFilter(), logger, Image, Column, CreateDateColumn (+26 more)

### Community 5 - "ContactMessage"
Cohesion: 0.07
Nodes (30): IsEmail, JwtAuthGuard, Injectable, CONTACT_THROTTLE_LIMIT, ContactMessagesController, Body, Controller, Delete (+22 more)

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
Nodes (7): class-transformer, @nestjs/common, dependencies, class-transformer, @nestjs/common, sharp, sharp

### Community 11 - "seed-experiences.ts"
Cohesion: 0.29
Nodes (3): Block, experiences, SeedExperience

### Community 12 - "nest-cli.json"
Cohesion: 0.40
Nodes (4): collection, compilerOptions, deleteOutDir, sourceRoot

### Community 18 - "Distanterra API"
Cohesion: 0.11
Nodes (18): 1. Prerequisites, 2. Install dependencies, 3. Configure environment variables, 4. Create the database schema, 5. Create the admin account, 6. (Optional) Migrate the original hardcoded experiences, 7. Run the API, API overview (+10 more)

## Knowledge Gaps
- **126 isolated node(s):** `collection`, `sourceRoot`, `deleteOutDir`, `name`, `version` (+121 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **23 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AppConfig` connect `app.module.ts` to `gallery.controller.ts`, `comments.controller.ts`, `images.controller.ts`, `ContactMessage`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **Why does `Experience` connect `Experience` to `app.module.ts`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **Why does `ContactMessage` connect `ContactMessage` to `app.module.ts`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **What connects `collection`, `sourceRoot`, `deleteOutDir` to the rest of the system?**
  _126 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `app.module.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0502283105022831 - nodes in this community are weakly interconnected._
- **Should `gallery.controller.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05764145954521417 - nodes in this community are weakly interconnected._
- **Should `Experience` be split into smaller, more focused modules?**
  _Cohesion score 0.062146892655367235 - nodes in this community are weakly interconnected._