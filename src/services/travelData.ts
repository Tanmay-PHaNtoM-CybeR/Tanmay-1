/**
 * Future live-data integrations belong behind this small provider boundary.
 * The current provider is deliberately offline and returns only transparent
 * illustrative planning data, so no account, API key, or payment is required.
 */
import { buildTrip, type TripForm, type TripPlan } from '../core'

export interface TravelDataProvider {
  createPlan(form: TripForm): Promise<TripPlan>
  sourceLabel: string
  isLive: boolean
}

export class OfflineIllustrativeProvider implements TravelDataProvider {
  readonly sourceLabel = 'Offline illustrative planning data'
  readonly isLive = false

  async createPlan(form: TripForm): Promise<TripPlan> {
    return buildTrip(form)
  }
}

/*
  A future authorised provider can implement TravelDataProvider and set isLive
  to true only after it receives an actual response from its connected supplier.
  UI copy must then show the provider, retrieval time, currency, and terms.
*/
