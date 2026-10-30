import * as Location from "expo-location";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Circle, Marker } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";

import CustomHeader from "@/components/CustomHeader";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

interface Zone {
  id: string;
  user_id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  status: string;
  message?: string;
}

const STATUS_OPTIONS = [
  { id: "Free", label: "Free", color: "#4ade80" },
  { id: "Busy", label: "Busy", color: "#f87171" },
  { id: "Away", label: "Away", color: "#facc15" },
  { id: "Offline", label: "Offline", color: "#9ca3af" },
];

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3;
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function MapScreen() {
  const { session, profile, refreshProfile } = useAuth();
  const myId = session?.user.id;

  const [location, setLocation] = useState<Location.LocationObject | null>(
    null,
  );
  const [zones, setZones] = useState<Zone[]>([]);
  const [loadingZones, setLoadingZones] = useState(true);

  const [activeZoneId, setActiveZoneId] = useState<string | null>(null);
  const [previousProfile, setPreviousProfile] = useState<{
    status: string;
    message: string;
  } | null>(null);

  const [isModalVisible, setModalVisible] = useState(false);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [tempName, setTempName] = useState("");
  const [tempRadius, setTempRadius] = useState("200");
  const [tempStatus, setTempStatus] = useState("Free");
  const [tempMessage, setTempMessage] = useState("");
  const [tempCoordinate, setTempCoordinate] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    if (!myId) {
      setZones([]);
      setLoadingZones(false);
      return;
    }
    const fetchZones = async () => {
      setLoadingZones(true);
      const { data, error } = await supabase
        .from("zones")
        .select("*")
        .eq("user_id", myId);
      if (error) Alert.alert("Error loading zones", error.message);
      else if (data) setZones(data as Zone[]);
      setLoadingZones(false);
    };
    fetchZones();
  }, [myId]);

  useEffect(() => {
    let locSubscription: Location.LocationSubscription | null = null;
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      locSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 10000,
          distanceInterval: 10,
        },
        (newLocation) => {
          setLocation(newLocation);
        },
      );
    })();
    return () => {
      if (locSubscription) locSubscription.remove();
    };
  }, []);

  const updateProfileStatus = async (status: string, message: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({
        availability: status,
        status_message: message,
        updated_at: new Date().toISOString(),
      })
      .eq("id", myId);

    if (!error) refreshProfile();
  };

  useEffect(() => {
    if (!location || !myId || zones.length === 0 || !profile) return;

    const currentZone = zones.find(
      (z) =>
        getDistance(
          location.coords.latitude,
          location.coords.longitude,
          z.latitude,
          z.longitude,
        ) <= z.radius,
    );

    if (currentZone && currentZone.id !== activeZoneId) {
      // 1. Entering a zone: Save current profile, then overwrite with zone data
      if (activeZoneId === null) {
        setPreviousProfile({
          status: profile.availability,
          message: profile.status_message,
        });
      }
      setActiveZoneId(currentZone.id);
      updateProfileStatus(currentZone.status, currentZone.message || "");
    } else if (!currentZone && activeZoneId !== null) {
      // 2. Leaving all zones: Revert to the saved profile
      setActiveZoneId(null);
      if (previousProfile) {
        updateProfileStatus(previousProfile.status, previousProfile.message);
        setPreviousProfile(null);
      }
    }
  }, [location, zones, activeZoneId]); // Purposefully excluding `profile` to avoid infinite update loops

  const openAddModalAtCurrent = () => {
    if (!location) return;
    setEditingZone(null);
    setTempName("");
    setTempRadius("200");
    setTempStatus("Free");
    setTempMessage("");
    setTempCoordinate({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });
    setModalVisible(true);
  };

  const handleMapLongPress = (e: any) => {
    const { coordinate } = e.nativeEvent;
    setEditingZone(null);
    setTempName("");
    setTempRadius("200");
    setTempStatus("Free");
    setTempMessage("");
    setTempCoordinate(coordinate);
    setModalVisible(true);
  };

  const openEditModal = (zone: Zone) => {
    setEditingZone(zone);
    setTempName(zone.name);
    setTempRadius(zone.radius.toString());
    setTempStatus(zone.status || "Free");
    setTempMessage(zone.message || "");
    setTempCoordinate({ latitude: zone.latitude, longitude: zone.longitude });
    setModalVisible(true);
  };

  const handleMarkerDragEnd = async (zoneId: string, e: any) => {
    const { coordinate } = e.nativeEvent;
    setZones(
      zones.map((z) =>
        z.id === zoneId
          ? {
              ...z,
              latitude: coordinate.latitude,
              longitude: coordinate.longitude,
            }
          : z,
      ),
    );
    const { error } = await supabase
      .from("zones")
      .update({
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
      })
      .eq("id", zoneId);
    if (error) Alert.alert("Error moving zone", error.message);
  };

  const saveZone = async () => {
    if (!myId) return;
    const finalRadius = parseFloat(tempRadius) || 200;
    const coord = tempCoordinate || { latitude: 29.6436, longitude: -82.3549 };

    const zoneData = {
      user_id: myId,
      name: tempName || "New Zone",
      latitude: coord.latitude,
      longitude: coord.longitude,
      radius: finalRadius,
      status: tempStatus,
      message: tempMessage,
    };

    if (editingZone) {
      const { error } = await supabase
        .from("zones")
        .update(zoneData)
        .eq("id", editingZone.id);
      if (error) Alert.alert("Error updating zone", error.message);
      else
        setZones(
          zones.map((z) =>
            z.id === editingZone.id ? { ...z, ...zoneData } : z,
          ),
        );
    } else {
      const { data, error } = await supabase
        .from("zones")
        .insert(zoneData)
        .select()
        .single();
      if (error) Alert.alert("Error creating zone", error.message);
      else if (data) setZones([...zones, data as Zone]);
    }
    setModalVisible(false);
  };

  const deleteZone = async (id: string) => {
    const { error } = await supabase.from("zones").delete().eq("id", id);
    if (error) Alert.alert("Error deleting zone", error.message);
    else setZones(zones.filter((z) => z.id !== id));
  };

  const getStatusColor = (statusId: string) => {
    const status = STATUS_OPTIONS.find((s) => s.id === statusId);
    return status ? status.color : "#ffffff";
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#121212" />
      <SafeAreaView style={styles.safeArea} edges={[]}>
        <View style={styles.headerWrapper}>
          <CustomHeader
            title="Map"
            subtitle="Gainesville, FL"
            showAddButton={false}
          />
        </View>

        <View style={styles.mapContainer}>
          {location && !loadingZones ? (
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }}
              showsUserLocation={true}
              onLongPress={handleMapLongPress}
            >
              {zones.map((zone) => {
                const baseColor = getStatusColor(zone.status);
                return (
                  <React.Fragment key={zone.id}>
                    <Circle
                      center={{
                        latitude: zone.latitude,
                        longitude: zone.longitude,
                      }}
                      radius={zone.radius}
                      fillColor={`${baseColor}33`}
                      strokeColor={`${baseColor}80`}
                    />
                    <Marker
                      coordinate={{
                        latitude: zone.latitude,
                        longitude: zone.longitude,
                      }}
                      title={zone.name}
                      description={`Status: ${zone.status}${zone.message ? ` - "${zone.message}"` : ""}`}
                      draggable
                      onDragEnd={(e) => handleMarkerDragEnd(zone.id, e)}
                    />
                  </React.Fragment>
                );
              })}
            </MapView>
          ) : (
            <ActivityIndicator
              size="large"
              color="#ffffff"
              style={styles.loader}
            />
          )}
        </View>

        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>My Zones</Text>
          <TouchableOpacity
            onPress={openAddModalAtCurrent}
            style={styles.addButton}
          >
            <Text style={styles.addButtonText}>+ Current Loc</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollContent}>
          <Text style={styles.instructionText}>
            Tip: Long-press on the map to drop a new zone pin, or drag an
            existing pin to move it.
          </Text>
          {zones.length === 0 && !loadingZones && (
            <Text style={styles.instructionText}>
              You haven't created any zones yet.
            </Text>
          )}
          {zones.map((zone) => (
            <View key={zone.id} style={styles.zoneItem}>
              <View style={styles.zoneInfo}>
                <Text style={styles.zoneName}>{zone.name}</Text>
                <View
                  style={[
                    styles.miniStatusDot,
                    { backgroundColor: getStatusColor(zone.status) },
                  ]}
                />
                <Text
                  style={[
                    styles.zoneStatusText,
                    { color: getStatusColor(zone.status) },
                  ]}
                >
                  {zone.status}
                </Text>
              </View>
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  onPress={() => openEditModal(zone)}
                  style={styles.editButton}
                >
                  <Text style={styles.buttonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => deleteZone(zone.id)}
                  style={styles.deleteButton}
                >
                  <Text style={styles.buttonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>

        <Modal visible={isModalVisible} transparent={true} animationType="fade">
          <View style={styles.modalOverlay}>
            <ScrollView contentContainerStyle={styles.modalScroll}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>
                  {editingZone ? "Edit Zone" : "New Zone"}
                </Text>

                <Text style={styles.label}>Zone Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Gym, Home"
                  placeholderTextColor="#888"
                  value={tempName}
                  onChangeText={setTempName}
                />

                <Text style={styles.label}>Radius (meters)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="200"
                  placeholderTextColor="#888"
                  keyboardType="numeric"
                  value={tempRadius}
                  onChangeText={setTempRadius}
                />

                <Text style={styles.label}>Linked Status</Text>
                <View style={styles.statusGrid}>
                  {STATUS_OPTIONS.map((item) => {
                    const isSelected = tempStatus === item.id;
                    return (
                      <TouchableOpacity
                        key={item.id}
                        style={[
                          styles.statusButton,
                          isSelected && styles.statusButtonSelected,
                        ]}
                        onPress={() => setTempStatus(item.id)}
                        activeOpacity={0.7}
                      >
                        <View
                          style={[
                            styles.statusDot,
                            { backgroundColor: item.color },
                          ]}
                        />
                        <Text
                          style={[
                            styles.statusButtonText,
                            isSelected && styles.statusTextSelected,
                          ]}
                        >
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <Text style={styles.label}>Status Message (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="What's on your mind?"
                  placeholderTextColor="#888"
                  value={tempMessage}
                  onChangeText={setTempMessage}
                />

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    style={styles.cancelButton}
                  >
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={saveZone}
                    style={styles.saveButton}
                  >
                    <Text style={styles.buttonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  safeArea: { flex: 1 },
  headerWrapper: { paddingHorizontal: 15 },
  mapContainer: {
    height: "50%",
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  map: { flex: 1 },
  loader: { flex: 1, justifyContent: "center" },

  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
  },
  listTitle: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  addButton: { padding: 8, backgroundColor: "#333", borderRadius: 5 },
  addButtonText: { color: "#fff" },
  scrollContent: { paddingHorizontal: 15, paddingBottom: 20 },
  instructionText: {
    color: "#888",
    fontSize: 12,
    marginBottom: 15,
    fontStyle: "italic",
  },

  zoneItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  zoneInfo: { flexDirection: "row", alignItems: "center" },
  zoneName: { color: "#fff", fontSize: 16, marginRight: 10 },
  miniStatusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  zoneStatusText: {
    fontSize: 10,
    fontFamily: "monospace",
    fontWeight: "bold",
    letterSpacing: 1,
  },

  actionButtons: { flexDirection: "row", gap: 10 },
  editButton: { padding: 6, backgroundColor: "#444", borderRadius: 4 },
  deleteButton: { padding: 6, backgroundColor: "#800", borderRadius: 4 },
  buttonText: { color: "#fff", fontSize: 14 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
  },
  modalScroll: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#1e1e1e",
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    color: "#fff",
    fontSize: 18,
    marginBottom: 15,
    fontWeight: "bold",
  },
  label: { color: "#aaa", fontSize: 12, marginBottom: 5, marginTop: 10 },
  input: {
    backgroundColor: "#333",
    color: "#fff",
    padding: 10,
    borderRadius: 5,
    marginBottom: 5,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 25,
  },
  cancelButton: { padding: 10, backgroundColor: "#444", borderRadius: 5 },
  saveButton: { padding: 10, backgroundColor: "#007AFF", borderRadius: 5 },

  statusGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  statusButton: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#333333",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    marginHorizontal: 2,
  },
  statusButtonSelected: { borderColor: "#FFFFFF", borderWidth: 1.5 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginBottom: 6 },
  statusButtonText: { color: "#888888", fontSize: 10, fontFamily: "monospace" },
  statusTextSelected: { color: "#FFFFFF", fontWeight: "bold" },
});
