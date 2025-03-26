import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Alert, Dimensions } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { mockRequests } from '@/utils/mock';
import { RequestStatus, RequestData } from '@/utils/types';
import { Link, useLocalSearchParams } from 'expo-router';
import * as Location from 'expo-location';

const { width, height } = Dimensions.get('window');

// Default region is NYC, but will be updated with actual location
const INITIAL_REGION = {
  latitude: 40.75,
  longitude: -73.97,
  latitudeDelta: 0,
  longitudeDelta: 0,
};

export default function MapScreen() {
  const { selectedRequestId } = useLocalSearchParams<{ selectedRequestId: string }>();
  const [requests, setRequests] = useState<RequestData[]>(mockRequests);
  const [selectedRequest, setSelectedRequest] = useState<RequestData | null>(null);
  const markerScale = useRef(new Animated.Value(1)).current;
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const mapRef = useRef<MapView | null>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Request and track location
  useEffect(() => {
    (async () => {
      try {
        // Request permissions
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          Alert.alert(
            'Location Permission Required',
            'Please enable location services to use this feature.',
            [{ text: 'OK' }]
          );
          return;
        }

        // Get initial location
        let location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setCurrentLocation(location);

        // Center map on current location
        if (mapRef.current && location) {
          mapRef.current.animateToRegion({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          });
        }

        // Start location updates
        await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 5000,
            distanceInterval: 10,
          },
          (newLocation) => {
            setCurrentLocation(newLocation);
          }
        );
      } catch (error) {
        setErrorMsg('Error getting location');
        console.error('Location error:', error);
      }
    })();
  }, []);

  // Handle selected request from navigation
  useEffect(() => {
    if (selectedRequestId) {
      const request = requests.find(r => r.id === selectedRequestId);
      if (request) {
        setSelectedRequest(request);
        // Center map on the selected request
        if (mapRef.current) {
          mapRef.current.animateToRegion({
            latitude: request.location.pickup.latitude,
            longitude: request.location.pickup.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          });
        }
      }
    }
  }, [selectedRequestId, requests]);

  // Animation for selected marker
  useEffect(() => {
    if (selectedRequest) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(markerScale, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(markerScale, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Animate request info card
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      markerScale.setValue(1);
      // Reset animations
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [selectedRequest]);

  const filteredRequests = requests.filter(
    request => request.status !== RequestStatus.COMPLETED
  );

  const getMarkerColor = (status: RequestStatus) => {
    switch (status) {
      case RequestStatus.UNCONFIRMED:
        return 'green';
      case RequestStatus.CONFIRMED:
        return '#1a237e';
      default:
        return 'gray';
    }
  };

  return (
    <>
      <View style={styles.container}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={INITIAL_REGION}
          showsUserLocation={true}
          showsMyLocationButton={true}
          followsUserLocation={true}
          customMapStyle={[
            {
              "elementType": "geometry",
              "stylers": [{ "color": "#f5f5f5" }]
            },
            {
              "elementType": "labels.text.stroke",
              "stylers": [{ "color": "#f5f5f5" }]
            },
            {
              "elementType": "labels.text.fill",
              "stylers": [{ "color": "#616161" }]
            },
            {
              "featureType": "administrative.locality",
              "elementType": "labels.text.fill",
              "stylers": [{ "color": "#757575" }]
            },
            {
              "featureType": "poi",
              "elementType": "labels.text.fill",
              "stylers": [{ "color": "#757575" }]
            },
            {
              "featureType": "poi.park",
              "elementType": "geometry",
              "stylers": [{ "color": "#e5e5e5" }]
            },
            {
              "featureType": "poi.park",
              "elementType": "labels.text.fill",
              "stylers": [{ "color": "#9e9e9e" }]
            },
            {
              "featureType": "road",
              "elementType": "geometry",
              "stylers": [{ "color": "#ffffff" }]
            },
            {
              "featureType": "road.arterial",
              "elementType": "labels.text.fill",
              "stylers": [{ "color": "#757575" }]
            },
            {
              "featureType": "road.highway",
              "elementType": "geometry",
              "stylers": [{ "color": "#dadada" }]
            },
            {
              "featureType": "road.highway",
              "elementType": "labels.text.fill",
              "stylers": [{ "color": "#616161" }]
            },
            {
              "featureType": "road.local",
              "elementType": "labels.text.fill",
              "stylers": [{ "color": "#9e9e9e" }]
            },
            {
              "featureType": "transit.line",
              "elementType": "geometry",
              "stylers": [{ "color": "#e5e5e5" }]
            },
            {
              "featureType": "transit.station",
              "elementType": "geometry",
              "stylers": [{ "color": "#eeeeee" }]
            },
            {
              "featureType": "water",
              "elementType": "geometry",
              "stylers": [{ "color": "#c9c9c9" }]
            },
            {
              "featureType": "water",
              "elementType": "labels.text.fill",
              "stylers": [{ "color": "#9e9e9e" }]
            }
          ]}
        >
          {/* Current location marker with accuracy circle */}
          {currentLocation && (
            <Marker
              coordinate={{
                latitude: currentLocation.coords.latitude,
                longitude: currentLocation.coords.longitude,
              }}
            >
              <View style={styles.currentLocationMarker}>
                <View style={styles.currentLocationDot} />
                <View style={[
                  styles.accuracyCircle,
                  {
                    width: currentLocation.coords.accuracy || 20,
                    height: currentLocation.coords.accuracy || 20,
                    borderRadius: (currentLocation.coords.accuracy || 20) / 2,
                  }
                ]} />
              </View>
            </Marker>
          )}

          {/* Request markers */}
          {filteredRequests.map((request) => (
            <React.Fragment key={request.id}>
              <Marker
                coordinate={request.location.pickup}
                onPress={() => setSelectedRequest(request)}
              >
                <Animated.View
                  style={[
                    styles.markerContainer,
                    {
                      transform: [
                        {
                          scale:
                            selectedRequest?.id === request.id
                              ? markerScale
                              : 1,
                        },
                      ],
                    },
                  ]}
                >
                  <View style={[styles.markerBackground, { backgroundColor: getMarkerColor(request.status) }]}>
                    <Ionicons
                      name="location"
                      size={24}
                      color="white"
                    />
                  </View>
                </Animated.View>
              </Marker>

              {selectedRequest?.id === request.id && (
                <Marker coordinate={request.location.dropoff}>
                  <Animated.View
                    style={[
                      styles.markerContainer,
                      {
                        transform: [{ scale: markerScale }],
                      },
                    ]}
                  >
                    <View style={styles.markerBackground}>
                      <Ionicons
                        name="location"
                        size={24}
                        color="white"
                      />
                    </View>
                  </Animated.View>
                </Marker>
              )}
            </React.Fragment>
          ))}
        </MapView>

        {errorMsg && (
          <Animated.View
            style={[
              styles.errorContainer,
              {
                opacity: fadeAnim,
                transform: [{
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0],
                  })
                }]
              }
            ]}
          >
            <Text style={styles.errorText}>{errorMsg}</Text>
          </Animated.View>
        )}

        {selectedRequest && (
          <Animated.View
            style={[
              styles.requestInfo,
              {
                opacity: fadeAnim,
                transform: [{
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [height, 0],
                  })
                }]
              }
            ]}
          >
            <Text style={styles.guestName}>{selectedRequest.guestName}</Text>
            <View style={styles.addressContainer}>
              <Ionicons name="location" size={16} color="#666" />
              <Text style={styles.address}>{selectedRequest.pickupAddress}</Text>
            </View>
            <View style={styles.addressContainer}>
              <Ionicons name="location" size={16} color="#666" />
              <Text style={styles.address}>{selectedRequest.dropoffAddress}</Text>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Ionicons name="time" size={16} color="#666" />
                <Text style={styles.infoText}>
                  {selectedRequest.requestTime.toLocaleTimeString()}
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="call" size={16} color="#666" />
                <Text style={styles.infoText}>{selectedRequest.phoneNumber}</Text>
              </View>
            </View>
          </Animated.View>
        )}
      </View>
      <View style={styles.tabBar}>
        <Link href="/" asChild>
          <Pressable style={styles.tab}>
            <Text style={styles.tabText}>List</Text>
          </Pressable>
        </Link>
        <View style={[styles.tab, styles.activeTab]}>
          <Text style={styles.activeTabText}>Map</Text>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  currentLocationMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentLocationDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4285F4',
    borderWidth: 3,
    borderColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  accuracyCircle: {
    position: 'absolute',
    backgroundColor: 'rgba(66, 133, 244, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(66, 133, 244, 0.3)',
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerBackground: {
    backgroundColor: '#ff6d00',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  requestInfo: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    right: 16,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  errorContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    backgroundColor: '#ffebee',
    borderRadius: 12,
    padding: 12,
    elevation: 3,
  },
  errorText: {
    color: '#c62828',
    textAlign: 'center',
    fontWeight: '500',
  },
  guestName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1a237e',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  address: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',   
    borderRadius: 8,
    margin: 4,
  },
  activeTab: {
    backgroundColor: '#4CAF50',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
});
