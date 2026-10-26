import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';

export default function MapScreen() {
  return (
    <View style={styles.container}>
      <ThemedText type="title" style={{ color: '#fff' }}>Map Screen</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', justifyContent: 'center', alignItems: 'center' },
});