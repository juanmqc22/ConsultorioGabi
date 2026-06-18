export type PatientStatus = 'active' | 'inactive'
export type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
export type ConsultationStatus = 'resolved' | 'follow_up' | 'referral'
export type HealthStatus = 'saudavel' | 'acompanhamento' | 'alergia'

export interface Patient {
  id: string
  full_name: string
  preferred_name: string
  birthdate: string
  cpf: string | null
  email: string | null
  phone: string | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  blood_type: string | null
  allergies: string | null
  chronic_conditions: string | null
  notes: string | null
  status: PatientStatus
  created_at: string
}

export interface Appointment {
  id: string
  patient_id: string
  scheduled_at: string
  reason: string | null
  status: AppointmentStatus
  notes: string | null
  created_at: string
  patient?: Pick<Patient, 'id' | 'preferred_name'>
}

export interface Consultation {
  id: string
  patient_id: string
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
  url?: string | null
}

export interface ConsultationWithDetails extends Consultation {
  patient: Pick<Patient, 'id' | 'preferred_name' | 'full_name'>
  files: ConsultationFile[]
}

export interface ConsultationFilterResult {
  id: string
  consulted_at: string
  chief_complaint: string | null
  diagnosis: string | null
  status: ConsultationStatus
  patient: {
    preferred_name: string
    full_name: string
  } | null
}
