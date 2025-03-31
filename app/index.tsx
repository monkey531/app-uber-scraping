import { View } from 'react-native'
import { Redirect } from 'expo-router';
import { Image } from 'expo-image';

const PlaceholderImage = require('@/assets/images/splash.png');

export default function Index() {
  return (
    <>
      <View>
        <Image source={PlaceholderImage} />
      </View>
      <Redirect href="/list" />
    </>
  );
} 