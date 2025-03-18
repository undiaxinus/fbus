export interface BondHistory {
  id?: string;
  bond_id: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  unit_office: string;
  rank: string;
  designation: string;
  mca: string;
  amount_of_bond: string;
  bond_premium: string;
  risk_no: string;
  effective_date: string;
  date_of_cancellation: string;
  contact_no?: string;
  change_type: 'CREATE' | 'UPDATE' | 'DELETE' | 'RENEW';
  changed_fields?: string[];
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  created_at: string;
  created_by?: string;
} 