export type MissionaryStatus = 'active' | 'transferred' | 'released' | 'medical_leave'
export type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
export type ConsultationStatus = 'resolved' | 'follow_up' | 'referral'
export type HealthStatus = 'saudavel' | 'acompanhamento' | 'alergia'

export interface Mission {
  id: string
  name: string
  short_name: string
  color: string
  created_at: string
}

export interface Missionary {
  id: string
  full_name: string
  preferred_name: string
  birthdate: string
  country_of_origin: string
  mission_id: string
  current_area: string | null
  companion_name: string | null
  mission_start_date: string | null
  mission_expected_end: string | null
  phone: string | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  blood_type: string | null
  allergies: string | null
  chronic_conditions: string | null
  notes: string | null
  status: MissionaryStatus
  created_at: string
  mission?: Mission
}

export interface Appointment {
  id: string
  missionary_id: string
  scheduled_at: string
  reason: string | null
  status: AppointmentStatus
  notes: string | null
  created_at: string
  missionary?: Pick<Missionary, 'id' | 'preferred_name' | 'mission_id'> & { mission?: Pick<Mission, 'short_name' | 'color'> }
}

export interface Consultation {
  id: string
  missionary_id: string
  appointment_id: string | null
  consulted_at: string
  chief_complaint: string | null
  vital_bp: string | null
  vital_temp: number | null
  vital_hr: number | null
  vital_spo2: number | null
  vital_weight: number | null
  clinical_notes: string | null
  diagnosis: string | null
  cid10: string | null
  treatment: string | null
  follow_up_date: string | null
  status: ConsultationStatus
  created_at: string
}

export interface ConsultationFile {
  id: string
  consultation_id: string
  file_name: string
  file_path: string
  file_type: string
  file_size: number
  created_at: string
  url?: string | null  // URL assinada gerada pelo servidor, não armazenada no banco
}

export interface ConsultationWithDetails extends Consultation {
  missionary: Pick<Missionary, 'id' | 'preferred_name' | 'full_name' | 'mission_id'> & {
    mission: Pick<Mission, 'short_name' | 'color'> | null
  }
  files: ConsultationFile[]
}

export interface ConsultationFilterResult {
  id: string
  consulted_at: string
  chief_complaint: string | null
  diagnosis: string | null
  status: ConsultationStatus
  missionary: {
    preferred_name: string
    full_name: string
    mission: Pick<Mission, 'short_name'> | null
  } | null
}
