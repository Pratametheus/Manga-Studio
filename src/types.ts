export type TargetPasar = 'shonen' | 'shojo' | 'seinen' | 'josei';

export interface ProjectManga {
  id: string;
  user_id: string;
  judul: string;
  logline: string;
  tema: string;
  target_pasar: TargetPasar;
  sinopsis_lengkap: string;
  world_building: string;
  status: string;
  cover_url?: string;
  link_publikasi?: string;
  is_featured?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Character {
  id: string;
  project_manga_id: string;
  nama: string;
  peran: string;
  profil_detail: string;
  desain_visual_path: string;
  umur?: string;
  tinggi_badan?: string;
  berat_badan?: string;
  ulang_tahun?: string;
  golongan_darah?: string;
  kepribadian?: string;
  kekuatan_senjata?: string;
  kesukaan_ketidaksukaan?: string;
  desain_visual_samping_path?: string;
  desain_visual_belakang_path?: string;
}

export interface Storyboard {
  id: string;
  project_manga_id: string;
  bab: number;
  draf_kasar_path: string;
  catatan_pacing_layout: string;
  status_approval: 'draf' | 'review_editor' | 'revisi' | 'disetujui';
}

export interface ReferenceShiryo {
  id: string;
  project_manga_id: string;
  kategori: 'lokasi' | 'arsitektur' | 'pakaian' | 'pose';
  keterangan: string;
  foto_path: string;
}

export interface NaskahBab {
  id: string;
  project_manga_id: string;
  bab: number;
  judul_bab?: string;
  konten: string;
  status: string;
  tahap_produksi?: 'naskah' | 'storyboard' | 'inking' | 'coloring' | 'selesai';
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  order_index: number;
}

export interface PublicCreator {
  id: string;
  nama_pena: string;
  role: string;
  bio?: string;
  avatar_url?: string;
  order_index: number;
}

export interface Artwork {
  id: string;
  title: string;
  description?: string;
  image_url: string;
  created_at?: string;
}
