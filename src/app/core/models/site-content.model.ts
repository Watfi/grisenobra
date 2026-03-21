export interface HeroContent {
  title: string;
  subtitle: string;
  bgImage: string;
}

export interface PhilosophyContent {
  title: string;
  text: string;
  image: string;
}

export interface ContactContent {
  email: string;
  phone: string;
  address: string;
  instagram: string;
  whatsapp: string;
}

export interface SiteContent {
  hero: HeroContent;
  philosophy: PhilosophyContent;
  contact: ContactContent;
}

export const DEFAULT_SITE_CONTENT: SiteContent = {
  hero: {
    title: 'donde cada detalle cuenta',
    subtitle: 'Arquitectura & Diseño de Interiores en Medellín',
    bgImage: '/img/hero_image.jpg',
  },
  philosophy: {
    title: 'Nuestra Filosofía',
    text: 'Creamos espacios que trascienden lo funcional. Cada proyecto es una conversación entre la arquitectura, la luz y quienes lo habitan.',
    image: '/img/Residencia_Aura.jpg',
  },
  contact: {
    email: 'hola@grisenobra.com',
    phone: '+57 300 000 0000',
    address: 'Medellín, Antioquia',
    instagram: '@grisenobra',
    whatsapp: '+573000000000',
  },
};
