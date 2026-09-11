-- Reemplazo del set de categorías de puntos de interés: las anteriores
-- (refugio/mirador/agua/peligro) salen, quedan las que la operación
-- realmente usa: hospital, gendarmería, campamento, baqueano, restaurante,
-- alojamiento.
ALTER TABLE puntos_interes DROP CONSTRAINT IF EXISTS chk_puntos_interes_categoria;
ALTER TABLE puntos_interes ADD CONSTRAINT chk_puntos_interes_categoria CHECK (
    categoria IN ('hospital', 'gendarmeria', 'campamento', 'baqueano', 'restaurante', 'alojamiento')
);
