export interface FidelityBond {
  id: string;
  unit_office: string;
  rank: string;
  name: string;
  designation: string;
  mca: number;
  amount_of_bond: number;
  bond_premium: number;
  risk_no: string;
  effectivity_date: string;
  date_of_cancellation: string;
  status: string;
  days_remaining?: number;
  remark?: string;
  contact_no?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  deleted_at?: string;
}

export type FidelityBondCreate = Omit<FidelityBond, 
  'id' | 
  'created_at' | 
  'updated_at' | 
  'created_by' | 
  'updated_by' | 
  'deleted_at' |
  'days_remaining'
>; 