import { describe, expect, it } from 'vitest'
import { buildTrip, computeBudget, dateDiff, defaultForm, generateHotels, guideFor, resolveRooms } from './core'

describe('TripGenius planning logic', () => {
  it('counts an inclusive trip period and always returns at least one day', () => {
    expect(dateDiff('2026-11-15', '2026-11-19')).toBe(5)
    expect(dateDiff('2026-11-19', '2026-11-15')).toBe(1)
  })

  it('keeps room recommendations within stated occupancy rules', () => {
    expect(resolveRooms(1, 0, 1)).toMatchObject({ rooms: 1, type: 'Single room', maxOccupancy: 1 })
    expect(resolveRooms(2, 1, 1)).toMatchObject({ rooms: 1, maxOccupancy: 3 })
    expect(resolveRooms(4, 0, 1)).toMatchObject({ rooms: 2, type: 'Two double rooms', maxOccupancy: 2 })
    expect(resolveRooms(7, 1, 1).rooms).toBe(3)
  })

  it('generates hotel totals using nights and the safe room count', () => {
    const roomPlan = resolveRooms(4, 0, 1)
    const hotel = generateHotels({ ...defaultForm, adults: 4, requestedRooms: 1 }, guideFor('Goa'), 3, roomPlan)[0]
    expect(hotel.rooms).toBe(2)
    expect(hotel.maxOccupancy).toBe(2)
    expect(hotel.total).toBe(hotel.rate * 3 * 2)
  })

  it('builds a usable plan with a complete positive budget', () => {
    const plan = buildTrip(defaultForm)
    expect(plan.days).toBe(5)
    expect(plan.itinerary).toHaveLength(5)
    expect(plan.itinerary.every((day) => day.food.includes('vegetarian-friendly'))).toBe(true)
    expect(plan.budget.total).toBeGreaterThan(0)
    expect(plan.budget.total).toBe(computeBudget(plan.form, plan.days, plan.nights, plan.flights[1], plan.trains[1], plan.hotels[1], 'flight').total)
  })
})
