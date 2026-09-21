import { getDistance } from '../utils/geospatial.js'

/**
 * AI Route Optimization Service
 * Supports multiple algorithms for African logistics optimization
 */

export const optimizeRoute = async (deliveries, algorithm = 'nearest-neighbor', startPoint = [3.3792, 6.5244]) => {
  const waypoints = deliveries.map(d => ({
    id: d.id.toString(),
    address: d.destinationAddress || d.destination?.address || d.destination,
    coordinates: d.destinationLat ? [d.destinationLng, d.destinationLat] : (d.destination?.coordinates || [3.3792, 6.5244]),
    priority: d.priority || 'normal',
    weight: d.packageWeight || d.package?.weight || 1
  }))

  let optimizedWaypoints = []
  let totalDistance = 0

  switch (algorithm) {
    case 'nearest-neighbor':
      optimizedWaypoints = nearestNeighbor(waypoints, startPoint)
      break
    case 'priority':
      optimizedWaypoints = priorityBased(waypoints, startPoint)
      break
    case 'genetic':
      optimizedWaypoints = geneticAlgorithm(waypoints, startPoint)
      break
    case 'capacity':
      optimizedWaypoints = capacityOptimized(waypoints, startPoint)
      break
    default:
      optimizedWaypoints = nearestNeighbor(waypoints, startPoint)
  }

  // Calculate total distance
  let current = startPoint
  for (const wp of optimizedWaypoints) {
    totalDistance += getDistance(current, wp.coordinates)
    current = wp.coordinates
  }
  totalDistance += getDistance(current, startPoint) // Return to depot

  const estimatedTime = Math.round(totalDistance * 5) // ~5 min per km in urban Africa
  const fuelSavings = Math.round((1 - (totalDistance / (waypoints.length * 8))) * 100) // Estimated savings

  return {
    waypoints: optimizedWaypoints,
    totalDistance: Math.round(totalDistance * 100) / 100,
    estimatedTime,
    fuelSavings: Math.max(0, fuelSavings),
    algorithm
  }
}

// Nearest Neighbor Algorithm - O(n²)
function nearestNeighbor(waypoints, start) {
  const unvisited = [...waypoints]
  const route = []
  let current = start

  while (unvisited.length > 0) {
    let nearest = null
    let minDist = Infinity
    let nearestIndex = -1

    for (let i = 0; i < unvisited.length; i++) {
      const dist = getDistance(current, unvisited[i].coordinates)
      if (dist < minDist) {
        minDist = dist
        nearest = unvisited[i]
        nearestIndex = i
      }
    }

    route.push(nearest)
    current = nearest.coordinates
    unvisited.splice(nearestIndex, 1)
  }

  return route
}

// Priority-based sorting
function priorityBased(waypoints, start) {
  const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 }

  // Group by priority then optimize each group
  const grouped = waypoints.reduce((acc, wp) => {
    const p = wp.priority || 'normal'
    if (!acc[p]) acc[p] = []
    acc[p].push(wp)
    return acc
  }, {})

  const route = []
  let current = start

  Object.keys(grouped)
    .sort((a, b) => priorityOrder[a] - priorityOrder[b])
    .forEach(priority => {
      const optimized = nearestNeighbor(grouped[priority], current)
      route.push(...optimized)
      if (optimized.length > 0) current = optimized[optimized.length - 1].coordinates
    })

  return route
}

// Genetic Algorithm for complex optimizations
function geneticAlgorithm(waypoints, start, generations = 50, populationSize = 30) {
  if (waypoints.length <= 3) return nearestNeighbor(waypoints, start)

  // Initialize population
  let population = Array.from({ length: populationSize }, () => {
    const shuffled = [...waypoints].sort(() => Math.random() - 0.5)
    return { route: shuffled, fitness: calculateFitness(shuffled, start) }
  })

  // Evolve
  for (let gen = 0; gen < generations; gen++) {
    population.sort((a, b) => a.fitness - b.fitness)

    const newPopulation = [population[0]] // Keep best

    while (newPopulation.length < populationSize) {
      const parent1 = tournamentSelect(population)
      const parent2 = tournamentSelect(population)
      const child = crossover(parent1, parent2)
      mutate(child)
      newPopulation.push({ route: child, fitness: calculateFitness(child, start) })
    }

    population = newPopulation
  }

  population.sort((a, b) => a.fitness - b.fitness)
  return population[0].route
}

function tournamentSelect(population, tournamentSize = 5) {
  let best = population[Math.floor(Math.random() * population.length)]
  for (let i = 1; i < tournamentSize; i++) {
    const contender = population[Math.floor(Math.random() * population.length)]
    if (contender.fitness < best.fitness) best = contender
  }
  return best.route
}

function crossover(parent1, parent2) {
  const size = parent1.length
  const start = Math.floor(Math.random() * size)
  const end = Math.floor(Math.random() * (size - start)) + start

  const child = new Array(size).fill(null)
  const segment = parent1.slice(start, end)

  for (let i = 0; i < segment.length; i++) child[start + i] = segment[i]

  let index = 0
  for (const gene of parent2) {
    if (!child.includes(gene)) {
      while (child[index] !== null) index++
      child[index] = gene
    }
  }

  return child
}

function mutate(route, mutationRate = 0.1) {
  if (Math.random() < mutationRate) {
    const i = Math.floor(Math.random() * route.length)
    const j = Math.floor(Math.random() * route.length)
    ;[route[i], route[j]] = [route[j], route[i]]
  }
}

function calculateFitness(route, start) {
  let dist = 0
  let current = start
  for (const wp of route) {
    dist += getDistance(current, wp.coordinates)
    current = wp.coordinates
  }
  dist += getDistance(current, start)
  return dist
}

// Capacity optimization (vehicle load balancing)
function capacityOptimized(waypoints, start, maxCapacity = 50) {
  // Sort by weight (heaviest first for vehicle stability)
  const sorted = [...waypoints].sort((a, b) => (b.weight || 0) - (a.weight || 0))

  const routes = []
  let currentRoute = []
  let currentWeight = 0

  for (const wp of sorted) {
    if (currentWeight + (wp.weight || 0) > maxCapacity) {
      if (currentRoute.length > 0) routes.push(currentRoute)
      currentRoute = [wp]
      currentWeight = wp.weight || 0
    } else {
      currentRoute.push(wp)
      currentWeight += wp.weight || 0
    }
  }

  if (currentRoute.length > 0) routes.push(currentRoute)

  // For single route, just return optimized
  return nearestNeighbor(routes[0] || waypoints, start)
}
