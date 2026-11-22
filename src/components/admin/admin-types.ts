export type AdminSectionId =
  | "overview"
  | "campaigns"
  | "leads"
  | "companies"
  | "jobs"
  | "pricing"
  | "smtp"
  | "system";

export interface AdminStats {
  totalCampaigns: number;
  paidCampaigns: number;
  totalCompanies: number;
  activeCompanies: number;
  totalEmailsSent: number;
  inventoryByCountry: Record<string, number>;
  inventoryByIndustry: Record<string, number>;
  revenueByCurrency: Record<string, number>;
}

export interface AdminSystemHealth {
  easykashLive: boolean;
  hmacConfigured: boolean;
  currencyOverride: string | null;
  smtpActiveCount: number;
  customAdminPasscode: boolean;
  storageMode: string;
  appUrl: string;
}

export interface SmtpSummary {
  totalAccounts: number;
  activeCount: number;
  totalDailyCapacity: number;
  sentTodayTotal: number;
}

export interface SmtpFormState {
  id: string;
  label: string;
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from_email: string;
  from_name: string;
  daily_limit: number;
}
