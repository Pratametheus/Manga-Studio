-- Tambahkan kolom inking_path dan coloring_path pada tabel naskah_bab
ALTER TABLE naskah_bab
ADD COLUMN IF NOT EXISTS inking_path TEXT,
ADD COLUMN IF NOT EXISTS coloring_path TEXT;
