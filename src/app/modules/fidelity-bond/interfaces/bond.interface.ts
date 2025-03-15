export interface FbusBond {
  id?: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  unit_office: string;
  rank: string;
  designation: string;
  mca: number;
  amount_of_bond: number;
  bond_premium: number;
  risk_no: string;
  effective_date: string;
  date_of_cancellation: string;
  contact_no?: string;
  remark?: string;
  is_archived: boolean;
  updated_at?: string;
  profile_image_url?: string;
  designation_image_url?: string;
  risk_image_url?: string;
} 