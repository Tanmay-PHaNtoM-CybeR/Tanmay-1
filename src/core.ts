export type TransportMode = 'flight' | 'train'
export type HotelCategory = 'Budget' | 'Comfort' | 'Premium' | 'Any'
export type TripPreference = 'Culture' | 'Beach' | 'Nature' | 'Food' | 'Adventure' | 'Relaxed'

export interface TripForm {
  from: string
  to: string
  departure: string
  returnDate: string
  adults: number
  children: number
  childAges: string
  requestedRooms: number
  budget: number
  departureTime: string
  arrivalTime: string
  preference: TripPreference
  hotelCategory: HotelCategory
  mealPreference: string
}

export interface Guide {
  city: string
  country: string
  tagline: string
  color: string
  attractions: string[]
  foods: string[]
  transit: string
  safety: string
  dailyCost: number
  hotelArea: string
}

export interface Flight {
  id: string
  airline: string
  number: string
  departure: string
  arrival: string
  duration: string
  minutes: number
  stops: number
  baggage: string
  fare: number
  note: string
}

export interface Train {
  id: string
  name: string
  number: string
  fromStation: string
  toStation: string
  departure: string
  arrival: string
  duration: string
  minutes: number
  classes: { label: string; fare: number }[]
  fare: number
}

export interface RoomPlan {
  rooms: number
  type: string
  maxOccupancy: number
  note: string
}

export interface Hotel {
  id: string
  name: string
  area: string
  category: Exclude<HotelCategory, 'Any'>
  rating: number
  roomType: string
  maxOccupancy: number
  rate: number
  total: number
  rooms: number
  facilities: string[]
  attractionDistance: string
  checkIn: string
  checkOut: string
}

export interface ItineraryDay {
  day: number
  date: string
  morning: string
  afternoon: string
  evening: string
  food: string
  transport: string
  estimated: number
}

export interface BudgetPlan {
  transport: number
  hotel: number
  food: number
  local: number
  activities: number
  shopping: number
  emergency: number
  total: number
  perPerson: number
  remaining: number
}

export interface TripPlan {
  id: string
  form: TripForm
  guide: Guide
  days: number
  nights: number
  roomPlan: RoomPlan
  flights: Flight[]
  trains: Train[]
  hotels: Hotel[]
  itinerary: ItineraryDay[]
  selectedFlight: string
  selectedTrain: string
  selectedHotel: string
  transportMode: TransportMode
  budget: BudgetPlan
  createdAt: string
}

export interface SavedTrip extends TripPlan { savedAt: string }
export interface Expense { id: string; item: string; amount: number; category: string; date: string }

export const money = (value: number) => new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 0,
}).format(Math.max(0, Math.round(value)))

export const defaultForm: TripForm = {
  from: 'Mumbai', to: 'Goa', departure: '2026-11-15', returnDate: '2026-11-19',
  adults: 2, children: 0, childAges: '', requestedRooms: 1, budget: 45000,
  departureTime: 'Any time', arrivalTime: 'Any time', preference: 'Beach',
  hotelCategory: 'Comfort', mealPreference: 'Vegetarian & local',
}

const guides: Record<string, Guide> = {
  goa: { city: 'Goa', country: 'India', tagline: 'Sunlit beaches, heritage lanes, and coastal flavours.', color: 'linear-gradient(135deg, #0c6980, #43b9a9 55%, #ffd275)', attractions: ['Fort Aguada at first light', 'Old Goa basilicas', 'Mandrem Beach', 'Fontainhas Latin Quarter', 'Chapora Fort sunset', 'Anjuna night market'], foods: ['Goan fish curry', 'cafreal', 'bebinca', 'pão with local chai'], transit: 'Pre-booked cab for airport days; scooter or app cab for local hops.', safety: 'Use licensed beach shacks and avoid swimming after dark.', dailyCost: 2100, hotelArea: 'Candolim' },
  jaipur: { city: 'Jaipur', country: 'India', tagline: 'Pink City palaces, artisan markets, and desert warmth.', color: 'linear-gradient(135deg, #7b2e2e, #d86d47 55%, #ffc977)', attractions: ['Amber Fort', 'City Palace', 'Hawa Mahal', 'Jantar Mantar', 'Johari Bazaar', 'Nahargarh Fort sunset'], foods: ['dal baati churma', 'pyaaz kachori', 'lassi', 'Rajasthani thali'], transit: 'Metro for longer corridors, e-rickshaw or app cab inside the old city.', safety: 'Agree on fares before taking informal rickshaws.', dailyCost: 1850, hotelArea: 'Bani Park' },
  kerala: { city: 'Kerala', country: 'India', tagline: 'Backwaters, spice hills, and slow, verdant days.', color: 'linear-gradient(135deg, #0d5a4b, #58a96c 56%, #e5c672)', attractions: ['Fort Kochi promenade', 'Mattancherry Palace', 'Alleppey backwaters', 'Tea gardens', 'Kathakali performance', 'Marine Drive sunset'], foods: ['appam and stew', 'sadya', 'karimeen pollichathu', 'filter coffee'], transit: 'Use pre-booked intercity cabs; ferries are scenic for select Kochi routes.', safety: 'Keep rain protection ready and follow boat operator safety advice.', dailyCost: 2200, hotelArea: 'Fort Kochi' },
  manali: { city: 'Manali', country: 'India', tagline: 'Mountain air, cedar forests, and Himalayan adventure.', color: 'linear-gradient(135deg, #203d5a, #719ba0 55%, #dce9dd)', attractions: ['Hadimba Temple', 'Old Manali walk', 'Solang Valley', 'Vashisht hot springs', 'Mall Road', 'Jogini waterfall'], foods: ['siddu', 'trout', 'thukpa', 'Himachali dham'], transit: 'Use local taxi unions for valley routes; walk Old Manali where possible.', safety: 'Mountain weather changes fast—carry layers and check road conditions.', dailyCost: 2300, hotelArea: 'Old Manali' },
  delhi: { city: 'Delhi', country: 'India', tagline: 'Layered history, electric bazaars, and a world of food.', color: 'linear-gradient(135deg, #263f6c, #d8a64e 55%, #f7dfae)', attractions: ['Humayun’s Tomb', 'India Gate', 'Qutub Minar', 'Lodhi Garden', 'Chandni Chowk', 'National Museum'], foods: ['chaat', 'butter chicken', 'parathas', 'kulfi'], transit: 'Delhi Metro is efficient for major corridors; use verified app cabs at night.', safety: 'Keep valuables close in crowded markets and use official metro gates.', dailyCost: 2050, hotelArea: 'Aerocity' },
  mumbai: { city: 'Mumbai', country: 'India', tagline: 'Sea-facing promenades, cinema energy, and legendary snacks.', color: 'linear-gradient(135deg, #173d63, #3f9bba 52%, #e5b85d)', attractions: ['Gateway of India', 'Colaba Causeway', 'Marine Drive', 'Chhatrapati Shivaji Maharaj Terminus', 'Bandra-Worli Sea Link', 'Elephanta Caves'], foods: ['vada pav', 'bhelpuri', 'Bombay duck', 'Irani café bun maska'], transit: 'Mumbai Metro and local trains are useful; use app cabs outside peak heat.', safety: 'Avoid crowded train doors and keep time buffer for road traffic.', dailyCost: 2400, hotelArea: 'Colaba' },
}

export function guideFor(destination: string): Guide {
  const key = destination.trim().toLowerCase()
  return guides[key] ?? {
    city: destination.trim() || 'Your destination', country: 'India', tagline: 'A personalised city break built around your travel rhythm.', color: 'linear-gradient(135deg, #153b62, #0ea5a4 55%, #f8c66a)', attractions: ['Historic old town', 'Local museum', 'Signature viewpoint', 'Neighbourhood market', 'Waterfront or city park', 'Evening cultural walk'], foods: ['local breakfast', 'regional thali', 'street-food favourite', 'traditional dessert'], transit: 'Use verified app cabs or official public transport for everyday travel.', safety: 'Check local advisories and retain a copy of your accommodation details.', dailyCost: 2000, hotelArea: 'Central district',
  }
}

export function dateDiff(start: string, end: string): number {
  const a = new Date(`${start}T12:00:00`)
  const b = new Date(`${end}T12:00:00`)
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return 1
  return Math.max(1, Math.round((b.getTime() - a.getTime()) / 86_400_000) + 1)
}

export function resolveRooms(adults: number, children: number, requested: number): RoomPlan {
  const people = adults + children
  let minimum: number
  let type: string
  let maxOccupancy: number
  if (adults === 1 && children === 0) { minimum = 1; type = 'Single room'; maxOccupancy = 1 }
  else if (adults === 2 && children === 0) { minimum = 1; type = 'Double room'; maxOccupancy = 2 }
  else if (adults === 2 && children === 1) { minimum = 1; type = 'Family room / double with extra bed'; maxOccupancy = 3 }
  else if (adults === 4 && children === 0) { minimum = 2; type = 'Two double rooms'; maxOccupancy = 2 }
  else {
    minimum = Math.max(1, Math.ceil(people / 3))
    type = people >= 6 ? 'Group rooms / family suites' : 'Family room(s)'
    maxOccupancy = 3
  }
  const rooms = Math.max(minimum, requested || 1)
  const note = rooms > minimum
    ? `${rooms} rooms selected. Minimum safe room count is ${minimum}.`
    : `Fits ${adults} adult${adults === 1 ? '' : 's'}${children ? ` and ${children} child${children === 1 ? '' : 'ren'}` : ''} without exceeding room occupancy.`
  return { rooms, type, maxOccupancy, note }
}

export function generateFlights(form: TripForm): Flight[] {
  const routeBoost = form.from.toLowerCase() === form.to.toLowerCase() ? 0 : Math.max(0, form.to.length * 70 - form.from.length * 15)
  const base = 4200 + routeBoost
  return [
    { id: 'f-early', airline: 'AirVista', number: 'AV 218', departure: '06:20', arrival: '08:10', duration: '1h 50m', minutes: 110, stops: 0, baggage: '15 kg cabin + 20 kg check-in', fare: base + 550, note: 'Sample round-trip estimate per traveller' },
    { id: 'f-value', airline: 'IndigoBlue', number: 'IB 607', departure: '10:45', arrival: '13:20', duration: '2h 35m', minutes: 155, stops: 1, baggage: '7 kg cabin; check-in bag varies', fare: base - 350, note: 'Sample round-trip estimate per traveller' },
    { id: 'f-evening', airline: 'SkyConnect', number: 'SC 482', departure: '17:30', arrival: '19:10', duration: '1h 40m', minutes: 100, stops: 0, baggage: '15 kg cabin + 20 kg check-in', fare: base + 900, note: 'Sample round-trip estimate per traveller' },
  ]
}

export function generateTrains(form: TripForm): Train[] {
  const base = 1350 + Math.max(0, form.to.length * 45)
  return [
    { id: 't-day', name: 'Coastal Express', number: '12418', fromStation: `${form.from} Central`, toStation: `${form.to} Junction`, departure: '07:10', arrival: '15:25', duration: '8h 15m', minutes: 495, classes: [{ label: 'Chair Car', fare: base }, { label: '3AC', fare: base + 650 }, { label: '2AC', fare: base + 1200 }], fare: base + 650 },
    { id: 't-night', name: 'Heritage Mail', number: '16204', fromStation: `${form.from} Central`, toStation: `${form.to} Junction`, departure: '21:45', arrival: '08:35', duration: '10h 50m', minutes: 650, classes: [{ label: 'Sleeper', fare: base - 450 }, { label: '3AC', fare: base + 300 }, { label: '2AC', fare: base + 900 }, { label: '1AC', fare: base + 1750 }], fare: base + 300 },
    { id: 't-fast', name: 'Intercity Rapid', number: '22162', fromStation: `${form.from} Central`, toStation: `${form.to} Junction`, departure: '12:15', arrival: '19:15', duration: '7h 00m', minutes: 420, classes: [{ label: 'Chair Car', fare: base + 250 }, { label: '3AC', fare: base + 850 }], fare: base + 850 },
  ]
}

export function generateHotels(form: TripForm, guide: Guide, nights: number, plan: RoomPlan): Hotel[] {
  const multiplier = nights * plan.rooms
  const source: Array<Omit<Hotel, 'total' | 'rooms' | 'roomType' | 'maxOccupancy'>> = [
    { id: 'h-value', name: 'Harbour Nest Inn', area: guide.hotelArea, category: 'Budget', rating: 4.1, rate: 2200, facilities: ['Wi-Fi', 'Breakfast available', 'Air conditioning'], attractionDistance: '1.8 km from key sights', checkIn: '14:00', checkOut: '11:00' },
    { id: 'h-comfort', name: 'The Wayfarer House', area: guide.hotelArea, category: 'Comfort', rating: 4.4, rate: 3900, facilities: ['Wi-Fi', 'Breakfast included', 'Pool / lounge', '24-hour desk'], attractionDistance: '0.8 km from key sights', checkIn: '14:00', checkOut: '11:00' },
    { id: 'h-premium', name: 'Aster Grand Retreat', area: `${guide.hotelArea} waterfront`, category: 'Premium', rating: 4.7, rate: 6900, facilities: ['Wi-Fi', 'Breakfast included', 'Pool', 'Fitness centre', 'Concierge'], attractionDistance: '0.4 km from key sights', checkIn: '15:00', checkOut: '12:00' },
  ]
  return source.map((hotel) => ({ ...hotel, rooms: plan.rooms, roomType: plan.type, maxOccupancy: plan.maxOccupancy, total: hotel.rate * multiplier }))
}

export function generateItinerary(form: TripForm, guide: Guide, days: number): ItineraryDay[] {
  const departure = new Date(`${form.departure}T12:00:00`)
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(departure)
    date.setDate(departure.getDate() + index)
    const start = guide.attractions[(index * 2) % guide.attractions.length]
    const later = guide.attractions[(index * 2 + 1) % guide.attractions.length]
    const arrival = index === 0 ? 'Arrive, leave bags with your hotel, and settle in gently.' : `Explore ${start} while it is quieter.`
    const leaving = index === days - 1 ? 'Check out, collect luggage, and leave a comfortable transfer buffer.' : `Discover ${later} with a relaxed local lunch.`
    return {
      day: index + 1,
      date: date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }),
      morning: arrival,
      afternoon: leaving,
      evening: index === days - 1 ? 'Travel home or enjoy one final café stop.' : `Unwind with ${guide.attractions[(index + 4) % guide.attractions.length]} and a sunset walk.`,
      food: foodSuggestion(form.mealPreference, guide, index),
      transport: guide.transit,
      estimated: guide.dailyCost * (form.adults + form.children),
    }
  })
}

function foodSuggestion(mealPreference: string, guide: Guide, index: number): string {
  if (mealPreference === 'Vegetarian & local') return `Try a vegetarian-friendly local meal and ask for the house speciality without meat or fish.`
  if (mealPreference === 'Vegan-friendly') return `Choose a vegan-friendly local meal; confirm dairy, ghee, and sauces with the kitchen.`
  if (mealPreference === 'Non-vegetarian & local') return `Try ${guide.foods[index % guide.foods.length]} and ask for a trusted local recommendation.`
  return `Try ${guide.foods[index % guide.foods.length]} or a busy local restaurant’s speciality.`
}

export function computeBudget(form: TripForm, days: number, nights: number, flight: Flight, train: Train, hotel: Hotel, mode: TransportMode): BudgetPlan {
  const people = form.adults + form.children
  const transport = (mode === 'flight' ? flight.fare : train.fare) * people
  const food = (form.mealPreference === 'No preference' ? 800 : 700) * people * days
  const local = 350 * people * days
  const activities = 550 * people * Math.max(1, days - 1)
  const shopping = Math.min(Math.max(1000, form.budget * 0.08), 7500)
  const partial = transport + hotel.total + food + local + activities + shopping
  const emergency = Math.round(partial * 0.08)
  const total = partial + emergency
  return { transport, hotel: hotel.total, food, local, activities, shopping, emergency, total, perPerson: total / people, remaining: form.budget - total }
}

export function buildTrip(form: TripForm): TripPlan {
  const guide = guideFor(form.to)
  const days = dateDiff(form.departure, form.returnDate)
  const nights = Math.max(1, days - 1)
  const roomPlan = resolveRooms(form.adults, form.children, form.requestedRooms)
  const flights = generateFlights(form)
  const trains = generateTrains(form)
  const hotels = generateHotels(form, guide, nights, roomPlan)
  const itinerary = generateItinerary(form, guide, days)
  const selectedFlight = flights[1].id
  const selectedTrain = trains[1].id
  const selectedHotel = hotels.find((hotel) => hotel.category === (form.hotelCategory === 'Any' ? 'Comfort' : form.hotelCategory))?.id ?? hotels[1].id
  const budget = computeBudget(form, days, nights, flights[1], trains[1], hotels.find((hotel) => hotel.id === selectedHotel) ?? hotels[1], 'flight')
  return { id: crypto.randomUUID(), form, guide, days, nights, roomPlan, flights, trains, hotels, itinerary, selectedFlight, selectedTrain, selectedHotel, transportMode: 'flight', budget, createdAt: new Date().toISOString() }
}

export function refreshBudget(plan: TripPlan): TripPlan {
  const flight = plan.flights.find((item) => item.id === plan.selectedFlight) ?? plan.flights[0]
  const train = plan.trains.find((item) => item.id === plan.selectedTrain) ?? plan.trains[0]
  const hotel = plan.hotels.find((item) => item.id === plan.selectedHotel) ?? plan.hotels[0]
  return { ...plan, budget: computeBudget(plan.form, plan.days, plan.nights, flight, train, hotel, plan.transportMode) }
}

export function liveLinks(form: TripForm) {
  const route = encodeURIComponent(`${form.from} to ${form.to}`)
  const maps = encodeURIComponent(form.to)
  return {
    flights: `https://www.google.com/travel/flights?q=${route}`,
    hotels: `https://www.google.com/travel/hotels?q=${maps}`,
    trains: `https://www.google.com/search?q=${encodeURIComponent(`${form.from} ${form.to} train schedule`)}`,
    maps: `https://www.google.com/maps/search/?api=1&query=${maps}`,
  }
}

export const packingItems = [
  'Government ID / passport and copies', 'Tickets and accommodation details', 'Phone, cable, and power bank', 'Payment card and a little cash', 'Daily medicines and basic first-aid kit', 'Refillable water bottle', 'Weather-appropriate layers', 'Comfortable walking shoes', 'Sunscreen and sunglasses', 'Reusable day bag',
]

export function assistantReply(question: string, guide?: Guide): string {
  const text = question.toLowerCase()
  const city = guide?.city ?? 'your destination'
  if (/pack|luggage|bring/.test(text)) return `For ${city}, begin with ID, payment card, phone charger, daily medicines, a reusable water bottle, comfortable shoes, and weather layers. Use the Packing list tab to tick items off.`
  if (/safe|safety|emergency|police/.test(text)) return `${guide?.safety ?? 'Use official transport, share your plan with someone you trust, and keep emergency contacts available offline.'} In an emergency in India, call 112; for medical emergencies, call 108 where available.`
  if (/food|eat|restaurant|vegetarian|meal/.test(text)) return `A good food strategy in ${city}: eat at busy, clean places, drink sealed or filtered water, and try ${guide?.foods.slice(0, 3).join(', ') ?? 'a trusted local speciality'}. Tell kitchens about allergies clearly.`
  if (/transport|taxi|metro|train|airport/.test(text)) return guide?.transit ?? 'Use verified app cabs, official counters, or public transport with a time buffer. Save your hotel address offline.'
  if (/budget|cost|cheap|save/.test(text)) return `Your plan is an estimate, not a booking quote. Biggest savings usually come from the selected transport, hotel category, and paid activities. Compare live options through the external links before you pay.`
  if (/weather|rain|temperature/.test(text)) return 'This offline edition does not claim live weather. Check an up-to-date weather source before departure; pack layers and rain protection if conditions are uncertain.'
  if (/hello|hi|help/.test(text)) return `Hello! I’m TripGenius’s local guide. Ask about packing, food, safety, local transport, sightseeing, or how to manage your ${city} budget.`
  return `I can help you plan ${city} without a live AI service. Ask me about packing, food, local transport, safety, sightseeing, or your travel budget.`
}
