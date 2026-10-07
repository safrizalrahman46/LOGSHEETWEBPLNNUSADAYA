package services

import "math"

type GeofenceService struct{}

func NewGeofenceService() *GeofenceService {
	return &GeofenceService{}
}

// CalculateDistance calculates distance in meters using Haversine formula
func (s *GeofenceService) CalculateDistance(lat1, lng1, lat2, lng2 float64) float64 {
	const earthRadius = 6371000.0 // Earth radius in meters

	dLat := (lat2 - lat1) * (math.Pi / 180.0)
	dLng := (lng2 - lng1) * (math.Pi / 180.0)

	rLat1 := lat1 * (math.Pi / 180.0)
	rLat2 := lat2 * (math.Pi / 180.0)

	a := math.Sin(dLat/2)*math.Sin(dLat/2) +
		math.Cos(rLat1)*math.Cos(rLat2)*math.Sin(dLng/2)*math.Sin(dLng/2)

	c := 2 * math.Atan2(math.Sqrt(a), math.Sqrt(1-a))

	return earthRadius * c
}
