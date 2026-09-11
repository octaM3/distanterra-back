-- Agrega "otro" como categoría catch-all para puntos que no encajan en las
-- 6 sugeridas (hospital, gendarmeria, campamento, baqueano, restaurante,
-- alojamiento) — ver CATEGORY_LABELS/CATEGORY_SVG_PATHS en categoryIcons.ts
-- del front, que le da un ícono genérico.
ALTER TABLE puntos_interes ALTER COLUMN categoria TYPE VARCHAR(20);
ALTER TABLE puntos_interes DROP CONSTRAINT IF EXISTS chk_puntos_interes_categoria;
ALTER TABLE puntos_interes ADD CONSTRAINT chk_puntos_interes_categoria CHECK (
    categoria IN ('hospital', 'gendarmeria', 'campamento', 'baqueano', 'restaurante', 'alojamiento', 'otro')
);
