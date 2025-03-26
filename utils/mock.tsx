import { RequestStatus } from './types';

export interface RequestData {
  id: string;
  guestName: string;
  pickupAddress: string;
  dropoffAddress: string;
  requestTime: Date;
  phoneNumber: string;
  status: RequestStatus;
  location: {
    pickup: {
      latitude: number;
      longitude: number;
    };
    dropoff: {
      latitude: number;
      longitude: number;
    };
  };
}

// New York City coordinates boundaries
const NYC_BOUNDS = {
  latitude: {
    min: 40.7,
    max: 40.8,
  },
  longitude: {
    min: -74.02,
    max: -73.92,
  }
};

const getRandomCoordinate = (min: number, max: number) => {
  return min + Math.random() * (max - min);
};

const getRandomLocation = () => {
  return {
    latitude: getRandomCoordinate(NYC_BOUNDS.latitude.min, NYC_BOUNDS.latitude.max),
    longitude: getRandomCoordinate(NYC_BOUNDS.longitude.min, NYC_BOUNDS.longitude.max),
  };
};

export const generateMockRequests = (count: number): RequestData[] => {
  const requests: RequestData[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const pickupLocation = getRandomLocation();
    const dropoffLocation = getRandomLocation();
    const status = Math.random() < 0.4 
      ? RequestStatus.UNCONFIRMED 
      : Math.random() < 0.7 
        ? RequestStatus.CONFIRMED 
        : RequestStatus.COMPLETED;

    requests.push({
      id: `request-${i}`,
      guestName: `Guest ${i + 1}`,
      pickupAddress: `${pickupLocation.latitude.toFixed(4)}, ${pickupLocation.longitude.toFixed(4)}`,
      dropoffAddress: `${dropoffLocation.latitude.toFixed(4)}, ${dropoffLocation.longitude.toFixed(4)}`,
      requestTime: new Date(now.getTime() - Math.random() * 24 * 60 * 60 * 1000),
      phoneNumber: `+1${Math.floor(Math.random() * 1000000000).toString().padStart(10, '0')}`,
      status,
      location: {
        pickup: pickupLocation,
        dropoff: dropoffLocation,
      },
    });
  }

  return requests.sort((a, b) => b.requestTime.getTime() - a.requestTime.getTime());
};

export const mockRequests = generateMockRequests(20); 