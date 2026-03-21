export interface ProjectSpace {
  name: string;        // e.g. "Lobby", "Cocina", "Baño"
  beforeImage: string; // URL imagen antes
  afterImage: string;  // URL imagen después
}

export interface Project {
  id?: string;
  title: string;
  category: string;
  description: string;
  coverImage: string;
  images: string[];
  spaces?: ProjectSpace[];
  year: number;
  location: string;
  featured: boolean;
  slug: string;
  createdAt?: Date;
}
