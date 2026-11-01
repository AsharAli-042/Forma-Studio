import { z } from "zod";

export const services = ["Full-service interiors", "Room refresh", "Design consultation"] as const;
export const budgets = ["Under $5,000", "$5,000–$15,000", "$15,000–$50,000", "$50,000+", "Let’s discuss"] as const;
export const statuses = ["new", "contacted", "completed"] as const;
export const inquirySchema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(100),
  email: z.email("Please enter a valid email address.").max(254),
  service: z.enum(services, { error: "Please choose a service." }),
  budget: z.enum(budgets, { error: "Please choose a budget." }),
  message: z.string().trim().min(10, "Tell us a little more (at least 10 characters).").max(3000),
  website: z.string().max(200).optional(),
});
export type InquiryInput = z.infer<typeof inquirySchema>;
export type InquiryStatus = typeof statuses[number];
export type Inquiry = Omit<InquiryInput, "website"> & { id: string; created_at: string; status: InquiryStatus };
export const statusLabels: Record<InquiryStatus, string> = { new: "New", contacted: "Contacted", completed: "Completed" };

const STORAGE_KEY = "forma-studio-demo-v1";
export function seedInquiries(): Inquiry[] {
  return [
    { id: "sample-1", name: "Olivia Bennett", email: "olivia@example.com", service: services[0], budget: budgets[2], message: "We’re moving into a new apartment and would love help creating a warm, considered home. The living and dining areas are our priority.", status: "new", created_at: new Date(Date.now() - 3600000).toISOString() },
    { id: "sample-2", name: "James Wilson", email: "james@example.com", service: services[1], budget: budgets[1], message: "I’d like to refresh my home office with better lighting, storage, and a calmer palette. I work from home most days.", status: "new", created_at: new Date(Date.now() - 86400000).toISOString() },
    { id: "sample-3", name: "Amelia Chen", email: "amelia@example.com", service: services[2], budget: budgets[0], message: "We’d appreciate a consultation about furniture placement and a cohesive color palette for our first home.", status: "contacted", created_at: new Date(Date.now() - 172800000).toISOString() },
    { id: "sample-4", name: "Noah Williams", email: "noah@example.com", service: services[0], budget: budgets[3], message: "We’re planning a whole-house renovation and looking for a studio to guide the design from concept through installation.", status: "completed", created_at: new Date(Date.now() - 345600000).toISOString() },
  ];
}
export function readDemoInquiries(): Inquiry[] {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    const parsed: unknown = JSON.parse(saved);
    const schema = inquirySchema.omit({ website: true }).extend({ id: z.string(), created_at: z.iso.datetime(), status: z.enum(statuses) });
    const result = z.array(schema).safeParse(parsed);
    if (result.success) return result.data;
    throw new Error("Saved demo data is invalid. Clear this site’s browser storage to reset it.");
  }
  const seed = seedInquiries();
  writeDemoInquiries(seed);
  return seed;
}
export function writeDemoInquiries(inquiries: Inquiry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(inquiries));
}
