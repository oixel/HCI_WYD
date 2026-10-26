import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';

export default function HomeScreen() {
    const handleFriendListPress = () => {
        console.log('Friend list button pressed!');
    };


    return (
    <View style={styles.container}>
        <StatusBar style="light" backgroundColor="#121212" />
        <SafeAreaView style={styles.safeArea} edges={[]}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                
                <View style={styles.headerRow}>
                    
                    {/*Header Left Side*/}
                    <View style={styles.headerTextBlock}>
                        <ThemedText style={styles.wydLabel}>WYD?</ThemedText>
                        <ThemedText type="title" style={styles.mainTitle}>Status</ThemedText>
                    </View>

                    {/*Header Right Side*/}
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={handleFriendListPress}
                        activeOpacity={0.7}
                    >
                        <ThemedText style={styles.addIcon}>+</ThemedText>
                    
                    </TouchableOpacity>
                </View>

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
      paddingHorizontal: 40,
      paddingBottom: 20,
  },
  headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginTop: 20,
      marginBottom: 20,
  },
  headerTextBlock: {
      marginTop: 10,
      marginBottom: 20,
  },
  wydLabel: {
      fontSize: 20,
      color: '#888888',
      letterSpacing: 1,
      marginBottom: 2,
  },
  mainTitle: {
      color: '#FFFFFF',
      fontSize: 36,
      fontWeight: 'bold',
  },
  addButton: {
      marginTop: 15,
      width: 50,
      height: 50,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: '#333333',
      backgroundColor: '#1a1a1a',
      justifyContent: 'center',
      alignItems: 'center',
  },
  addIcon: {
      color: '#FFFFFF',
      fontSize: 25,
      fontWeight: '300',
  },
});
