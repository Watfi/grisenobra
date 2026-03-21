export interface ContactSubmission {
  id?: string;
  name: string;
  email: string;
  message: string;
  status: 'abierto' | 'cerrado';
  reply?: string;
  createdAt: Date;
  repliedAt?: Date;
}
