export enum RequestStatus {
  UNCONFIRMED = 'UNCONFIRMED',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
}

export interface Location {
  latitude: number;
  longitude: number;
}

export interface RequestData {
  id: string;
  guestName: string;
  pickupAddress: string;
  dropoffAddress: string;
  requestTime: Date;
  phoneNumber: string;
  status: RequestStatus;
  location: {
    pickup: Location;
    dropoff: Location;
  };
} 