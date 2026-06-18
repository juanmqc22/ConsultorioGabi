import { describe, it, expect } from 'vitest'
import { getPatientHealthStatus, formatAge, formatDate, getWeekDays } from './utils'

describe('getPatientHealthStatus', () => {
  it('returns saudavel when allergies is null and no consultation', () => {
    expect(getPatientHealthStatus({ allergies: null }, null)).toBe('saudavel')
  })

  it('returns saudavel when allergies is empty string', () => {
    expect(getPatientHealthStatus({ allergies: '' }, null)).toBe('saudavel')
  })

  it('returns alergia when allergies is set, regardless of consultation status', () => {
    expect(getPatientHealthStatus({ allergies: 'Penicilina' }, null)).toBe('alergia')
    expect(getPatientHealthStatus({ allergies: 'Penicilina' }, { status: 'follow_up' })).toBe('alergia')
    expect(getPatientHealthStatus({ allergies: 'Penicilina' }, { status: 'resolved' })).toBe('alergia')
  })

  it('returns acompanhamento when last consultation is follow_up and no allergies', () => {
    expect(getPatientHealthStatus({ allergies: null }, { status: 'follow_up' })).toBe('acompanhamento')
  })

  it('returns saudavel when last consultation is resolved and no allergies', () => {
    expect(getPatientHealthStatus({ allergies: null }, { status: 'resolved' })).toBe('saudavel')
  })

  it('returns saudavel when last consultation is referral and no allergies', () => {
    expect(getPatientHealthStatus({ allergies: null }, { status: 'referral' })).toBe('saudavel')
  })
})

describe('formatAge', () => {
  it('calculates age correctly for a known birthdate', () => {
    // Born 2003-03-15 → turned 23 in March 2026 → age is 23 as of June 2026
    expect(formatAge('2003-03-15')).toBe(23)
  })
})

describe('formatDate', () => {
  it('formats a date string to dd/MM/yyyy', () => {
    expect(formatDate('2025-06-04')).toBe('04/06/2025')
  })
})

describe('getWeekDays', () => {
  it('returns 7 days starting on Monday for a Wednesday input', () => {
    // 2025-06-04 is a Wednesday
    const days = getWeekDays(new Date('2025-06-04T12:00:00'))
    expect(days).toHaveLength(7)
    expect(days[0].getDay()).toBe(1) // Monday
    expect(days[6].getDay()).toBe(0) // Sunday
    expect(days[0].getDate()).toBe(2)  // Mon Jun 2
    expect(days[6].getDate()).toBe(8)  // Sun Jun 8
  })

  it('returns the same week when given a Monday', () => {
    const days = getWeekDays(new Date('2025-06-02T12:00:00')) // Monday
    expect(days[0].getDate()).toBe(2)
    expect(days[6].getDate()).toBe(8)
  })

  it('handles Sunday correctly — goes back to the previous Monday', () => {
    const days = getWeekDays(new Date('2025-06-08T12:00:00')) // Sunday
    expect(days[0].getDate()).toBe(2) // Mon Jun 2
  })
})
