import { StyleSheet, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import CustomHeader from '@/components/CustomHeader';

export default function MapScreen() {
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={[]}>
        <ScrollView contentContainerStyle={styles.scrollContent} stickyHeaderIndices={[0]}>

          <CustomHeader title="Map" subtitle="Gainesville, FL" showAddButton={false} />
          
          {/* Map content will go here */}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#121212', 
  },
  safeArea: { 
    flex: 1, 
  },
  scrollContent: { 
    paddingHorizontal: 15, 
    paddingBottom: 20, 
  },
});