import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CustomHeader from '@/components/CustomHeader';
import { ThemedText } from '@/components/themed-text';
import { supabase } from '@/lib/supabase';

interface Profile {
    id: string;
    username: string;
    display_name: string;
}

interface FriendRequest {
    id: number;
    sender: Profile;
}

export default function AddFriendScreen() {
    const [myId, setMyId] = useState<string | null>(null);
    const [searchText, setSearchText] = useState('');
    const [foundUser, setFoundUser] = useState<Profile | null>(null);
    const [requests, setRequests] = useState<FriendRequest[]>([]);
    const [message, setMessage] = useState('');

    // Get the logged in user and their friend requests when the screen opens
    useEffect(() => {
        (async () => {
            const { data } = await supabase.auth.getUser();
            if (data.user) {
                setMyId(data.user.id);
                loadRequests(data.user.id);
            }
        })();
    }, []);

    const loadRequests = async (userId: string) => {
        const { data, error } = await supabase
            .from('friendships')
            .select('id, sender:profiles!user_id(id, username, display_name)')
            .eq('friend_id', userId)
            .eq('status', 'pending');

        if (error) {
            setMessage(error.message);
            return;
        }
        setRequests(data as any);
    };

    const handleSearchPress = async () => {
        setFoundUser(null);
        setMessage('');

        const { data, error } = await supabase
            .from('profiles')
            .select('id, username, display_name')
            .eq('username', searchText.trim().toLowerCase())
            .maybeSingle();

        if (error) {
            setMessage(error.message);
        } else if (!data) {
            setMessage('No user with that username.');
        } else if (data.id === myId) {
            setMessage("That's you!");
        } else {
            setFoundUser(data);
        }
    };

    const handleAddPress = async () => {
        if (!foundUser || !myId) return;

        const { error } = await supabase
            .from('friendships')
            .insert({ user_id: myId, friend_id: foundUser.id });

        if (error) {
            setMessage(error.message);
            return;
        }
        setMessage(`Friend request sent to ${foundUser.display_name}!`);
        setFoundUser(null);
        setSearchText('');
    };

    const handleAcceptPress = async (requestId: number) => {
        const { error } = await supabase
            .from('friendships')
            .update({ status: 'accepted' })
            .eq('id', requestId);

        if (error) {
            setMessage(error.message);
            return;
        }
        setRequests(requests.filter((r) => r.id !== requestId));
    };

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#121212" />
      <SafeAreaView style={styles.safeArea} edges={[]}>
        <ScrollView contentContainerStyle={styles.scrollContent} stickyHeaderIndices={[0]}>

          <CustomHeader title="Add Friend" subtitle="Search by username" showAddButton={false} />

          {!myId ? (
            <ThemedText style={styles.messageText}>Log in to add friends.</ThemedText>
          ) : (
            <>
              {/* Search Bar Section */}
              <View style={styles.searchRow}>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    value={searchText}
                    onChangeText={setSearchText}
                    placeholder="e.g. maya"
                    placeholderTextColor="#666666"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
                <TouchableOpacity style={styles.button} onPress={handleSearchPress} activeOpacity={0.7}>
                  <ThemedText style={styles.buttonText}>Search</ThemedText>
                </TouchableOpacity>
              </View>

              {message !== '' && <ThemedText style={styles.messageText}>{message}</ThemedText>}

              {/* Search Result */}
              {foundUser && (
                <View style={styles.userRow}>
                  <View>
                    <ThemedText style={styles.userName}>{foundUser.display_name}</ThemedText>
                    <ThemedText style={styles.usernameText}>@{foundUser.username}</ThemedText>
                  </View>
                  <TouchableOpacity style={styles.button} onPress={handleAddPress} activeOpacity={0.7}>
                    <ThemedText style={styles.buttonText}>Add</ThemedText>
                  </TouchableOpacity>
                </View>
              )}

              {/* Friend Requests Section Header */}
              <View style={styles.sectionHeaderRow}>
                <ThemedText style={styles.sectionTitle}>Friend requests</ThemedText>
                <ThemedText style={styles.countText}>{requests.length} pending</ThemedText>
              </View>

              {/* Friend Requests List */}
              {requests.length === 0 ? (
                <ThemedText style={styles.emptyText}>No pending requests.</ThemedText>
              ) : (
                requests.map((request) => (
                  <View key={request.id} style={styles.userRow}>
                    <View>
                      <ThemedText style={styles.userName}>{request.sender.display_name}</ThemedText>
                      <ThemedText style={styles.usernameText}>@{request.sender.username}</ThemedText>
                    </View>
                    <TouchableOpacity
                      style={styles.acceptButton}
                      onPress={() => handleAcceptPress(request.id)}
                      activeOpacity={0.7}
                    >
                      <ThemedText style={styles.buttonText}>Accept</ThemedText>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </>
          )}

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

  // Search Bar Styles
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    gap: 10,
  },
  inputContainer: {
    flex: 1,
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
  button: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  acceptButton: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1.5,
    borderColor: '#4ade80',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 14,
  },
  messageText: {
    color: '#aaaaaa',
    fontSize: 14,
    fontStyle: 'italic',
    marginHorizontal: 10,
    marginTop: 12,
  },

  // Section Header Styles
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 10,
    marginTop: 30,
    marginBottom: 6,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  countText: {
    color: '#666666',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  emptyText: {
    color: '#666666',
    fontFamily: 'monospace',
    marginLeft: 10,
    marginTop: 10,
  },

  // User Row Styles
  userRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 10,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  usernameText: {
    color: '#888888',
    fontSize: 14,
    fontFamily: 'monospace',
  },
});