export interface FidelityBond {
  id?: string;
  unit_office: string;
  rank: string;
  name: string;
  designation: string;
  mca: number;
  amount_of_bond: number;
  bond_premium: number;
  risk_no: string;
  effectivity_date: Date | null;
  date_of_cancellation: Date | null;
  status: string;
  days_remaining?: number | null;
  remark?: string | null;
  contact_no?: string | null;
  created_at?: Date | null;
  updated_at?: Date | null;
  created_by?: string | null;
  updated_by?: string | null;
  deleted_at?: Date | null;
  // Additional fields for user information
  created_by_name?: string | null;
  updated_by_name?: string | null;
} 