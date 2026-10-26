import { StyleSheet, View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';

import CustomHeader from '@/components/CustomHeader';
import { ThemedText } from '@/components/themed-text';

export default function ProfileScreen() {
    const [statusMessage, setStatusMessage] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('FREE');

    const handleChangePhotoPress = () => {
        console.log('Change photo pressed!');
    };

    const statuses = [
      { id: 'FREE', label: 'Free', color: '#4ade80' },
      { id: 'BUSY', label: 'Busy', color: '#f87171' },
      { id: 'AWAY', label: 'Away', color: '#facc15' },
      { id: 'OFFLINE', label: 'Offline', color: '#9ca3af' },
    ];

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={[]}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <CustomHeader title="Profile" subtitle="Your Public Status" showAddButton={false} />
          
          {/* User Profile Info Section */}
          <View style={styles.profileSection}>
            {/* Circle Avatar with Initials */}
            <View style={styles.avatarCircle}>
              <ThemedText style={styles.avatarText}>VH</ThemedText>
            </View>

            {/* User Name & Change Photo Link */}
            <View style={styles.profileDetails}>
              <ThemedText style={styles.userName}>Vincent</ThemedText>
              <TouchableOpacity 
                onPress={handleChangePhotoPress} 
                activeOpacity={0.7}
              >
                <ThemedText style={styles.changePhotoText}>Change photo</ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          {/* Dotted Line Separator Below Profile Section */}
          <View style={styles.dottedLineContainer}>
            {Array.from({ length: 60 }).map((_, i) => (
              <View key={i} style={styles.dot} />
            ))}
          </View>

          {/* My Status Section Header */}
          <View style={styles.sectionHeaderRow}>
            <ThemedText style={styles.sectionTitle}>My status</ThemedText>
            <ThemedText style={styles.visibilityText}>Visible to friends</ThemedText>
          </View>

          {/* Status Selector Buttons Grid */}
          <View style={styles.statusGrid}>
            {statuses.map((item) => {
              const isSelected = selectedStatus === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.statusButton,
                    isSelected && styles.statusButtonSelected,
                  ]}
                  onPress={() => setSelectedStatus(item.id)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.statusDot, { backgroundColor: item.color }]} />
                  <ThemedText style={[styles.statusButtonText, isSelected && styles.statusTextSelected]}>
                    {item.label}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </View>

          <ThemedText style={styles.messageTitle}>Your Message To Friends</ThemedText>
          {/* Custom Message Input Section */}
          <View style={styles.messageInputContainer}>
            <TextInput
              style={styles.textInput}
              value={statusMessage}
              onChangeText={setStatusMessage}
              placeholder="What's on your mind?"
              placeholderTextColor="#666666"
            />
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

  // Profile Section Layout
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#4ade80',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  avatarText: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontSize: 24,
  },
  profileDetails: {
    justifyContent: 'center',
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 6,
    lineHeight: 38,
    includeFontPadding: false,
  },
  changePhotoText: {
    fontFamily: 'monospace',
    color: '#888888',
    fontSize: 14,
    textDecorationLine: 'underline',
  },

  // Dotted line below profile section
  dottedLineContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
    overflow: 'hidden',
    height: 2,
  },
  dot: {
    width: 2,
    height: 2,
    backgroundColor: '#aaaaaa',
    marginHorizontal: 1,
  },

  // Section Headers
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 10,
    marginTop: 10,
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  visibilityText: {
    color: '#666666',
    fontSize: 12,
    fontFamily: 'monospace',
  },

  // Status Selector Buttons
  statusGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  statusButton: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statusButtonSelected: {
    borderColor: '#FFFFFF',
    borderWidth: 1.5,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 6,
  },
  statusButtonText: {
    color: '#888888',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  statusTextSelected: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  // Custom Message Box Styles
  messageTitle: {
      marginLeft: 10,
      fontSize: 20,
      fontFamily: 'monospace',
      fontWeight: 'bold',
  },
  messageInputContainer: {
    marginHorizontal: 10,
    marginTop: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#444444',
    borderStyle: 'dashed', 
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  textInput: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'monospace',
  },
});