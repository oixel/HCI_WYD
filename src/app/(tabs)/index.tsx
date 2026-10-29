import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CustomHeader from '@/components/CustomHeader';
import { ThemedText } from '@/components/themed-text';

export default function HomeScreen() {
    const handleFriendListPress = () => {
        router.push('/add-friend');
    };

    // Temporary mock database array (dynamic and reactive)
    const [users] = useState([
        { id: '1', name: 'Maya', initials: 'MA', status: 'FREE', message: 'bored, anyone want boba?', statusColor: '#4ade80' },
        { id: '2', name: 'Jordan', initials: 'JD', status: 'BUSY', message: 'studying for chem', statusColor: '#f87171' },
        { id: '3', name: 'Ava', initials: 'AV', status: 'FREE', message: 'leg day lol', statusColor: '#4ade80' },
        { id: '4', name: 'Leo', initials: 'LE', status: 'AWAY', message: 'shift til 9', statusColor: '#facc15' },
        { id: '5', name: 'Sam', initials: 'SM', status: 'BUSY', message: 'in class', statusColor: '#f87171' },
        { id: '6', name: 'Riley', initials: 'RI', status: 'OFFLINE', message: 'sleeping zzz', statusColor: '#9ca3af' },
    ]);

    return (
    <View style={styles.container}>
        <StatusBar style="light" backgroundColor="#121212" />
        <SafeAreaView style={styles.safeArea} edges={[]}>
            <ScrollView contentContainerStyle={styles.scrollContent} stickyHeaderIndices={[0]}>
                
                <CustomHeader title="Status" subtitle={`${users.length} people`} onAddPress={handleFriendListPress} />

                {/* 2-Column User Grid */}
                <View style={styles.gridContainer}>
                    {users.map((user, index) => {
                        const isLeftColumn = index % 2 === 0;
                        const isLastRow = index >= users.length - (users.length % 2 === 0 ? 2 : 1);

                        return (
                            <View
                                key={user.id}
                                style={[
                                    styles.userCard,
                                    isLeftColumn && styles.cardLeftBorder,
                                    !isLastRow && styles.cardBottomBorder,
                                ]}
                            >
                                {/* User Initials Avatar Circle */}
                                <View style={[styles.avatarCircle, { borderColor: user.statusColor }]}>
                                    <ThemedText style={styles.avatarText}>{user.initials}</ThemedText>
                                </View>

                                {/* User Info */}
                                <ThemedText style={styles.userName}>{user.name}</ThemedText>
                                <ThemedText style={[styles.userStatus, { color: user.statusColor }]}>
                                    {user.status}
                                </ThemedText>
                                <ThemedText style={styles.userMessage}>"{user.message}"</ThemedText>
                            </View>
                        );
                    })}
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
      paddingHorizontal: 15,
      paddingBottom: 20,
  },
  // Grid and User Card Styles
  gridContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: 10,
  },
  userCard: {
      width: '50%',
      paddingVertical: 20,
      paddingHorizontal: 16,
  },
  cardLeftBorder: {
      borderRightWidth: 1,
      borderRightColor: '#333333',
      borderStyle: 'solid',
  },
  cardBottomBorder: {
      borderBottomWidth: 1,
      borderBottomColor: '#333333',
      borderStyle: 'solid',
  },
  avatarCircle: {
      width: 50,
      height: 50,
      borderRadius: 25,
      borderWidth: 1.5,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
  },
  avatarText: {
      fontFamily: 'monospace',
      fontWeight: 'bold',
      color: '#ffffff',
      fontSize: 16,
  },
  userName: {
      color: '#ffffff',
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 2,
  },
  userStatus: {
      fontFamily: 'monospace',
      fontSize: 12,
      fontWeight: 'bold',
      marginBottom: 6,
      marginLeft: 1,
      letterSpacing: 1,
  },
  userMessage: {
      color: '#aaaaaa',
      fontSize: 14,
      fontStyle: 'italic',
  },
});
