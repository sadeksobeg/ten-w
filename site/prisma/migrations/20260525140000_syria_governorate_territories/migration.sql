-- Reset partner territories outside Syrian governorates + Salamiyah
UPDATE "PartnerProfile"
SET "territory" = NULL
WHERE "territory" IS NOT NULL
  AND "territory" NOT IN (
    'damascus',
    'rif_dimashq',
    'aleppo',
    'homs',
    'hama',
    'salamiyah',
    'latakia',
    'tartus',
    'idlib',
    'raqqa',
    'deir_ez_zor',
    'hasakah',
    'daraa',
    'suwayda',
    'quneitra'
  );
