export interface UnitOffice {
    id?: number;
    unit: string;
    unit_office: string;
    name?: string;
    code?: string;
    head?: string;
    head_title?: string;
    member_count?: number;
    active_members?: number;
    status?: 'active' | 'inactive';
    created_at?: string;
    updated_at?: string;
}