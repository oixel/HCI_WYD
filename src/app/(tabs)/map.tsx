import * as Location from "expo-location";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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

interface Zone {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  status: string;
}

const STATUS_OPTIONS = [
  { id: "FREE", label: "Free", color: "#4ade80" },
  { id: "BUSY", label: "Busy", color: "#f87171" },
  { id: "AWAY", label: "Away", color: "#facc15" },
  { id: "OFFLINE", label: "Offline", color: "#9ca3af" },
];

export default function MapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null,
  );

  // Pre-loaded zones with linked statuses
  const [zones, setZones] = useState<Zone[]>([
    {
      id: "1",
      name: "School",
      latitude: 29.6436,
      longitude: -82.3549,
      radius: 200,
      status: "BUSY",
    },
    {
      id: "2",
      name: "Work",
      latitude: 29.6516,
      longitude: -82.3248,
      radius: 200,
      status: "AWAY",
    },
  ]);

  // Modal & Form State
  const [isModalVisible, setModalVisible] = useState(false);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [tempName, setTempName] = useState("");
  const [tempRadius, setTempRadius] = useState("200");
  const [tempStatus, setTempStatus] = useState("FREE");
  const [tempCoordinate, setTempCoordinate] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        let currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);
      }
    })();
  }, []);

  const openAddModalAtCurrent = () => {
    if (!location) return;
    setEditingZone(null);
    setTempName("");
    setTempRadius("200");
    setTempStatus("FREE");
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
    setTempStatus("FREE");
    setTempCoordinate(coordinate);
    setModalVisible(true);
  };

  const openEditModal = (zone: Zone) => {
    setEditingZone(zone);
    setTempName(zone.name);
    setTempRadius(zone.radius.toString());
    setTempStatus(zone.status || "FREE");
    setTempCoordinate({ latitude: zone.latitude, longitude: zone.longitude });
    setModalVisible(true);
  };

  const handleMarkerDragEnd = (zoneId: string, e: any) => {
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
  };

  const saveZone = () => {
    const finalRadius = parseFloat(tempRadius) || 200;
    const coord = tempCoordinate || { latitude: 29.6436, longitude: -82.3549 };

    if (editingZone) {
      setZones(
        zones.map((z) =>
          z.id === editingZone.id
            ? {
                ...z,
                name: tempName,
                radius: finalRadius,
                status: tempStatus,
                latitude: coord.latitude,
                longitude: coord.longitude,
              }
            : z,
        ),
      );
    } else {
      setZones([
        ...zones,
        {
          id: Date.now().toString(),
          name: tempName || "New Zone",
          latitude: coord.latitude,
          longitude: coord.longitude,
          radius: finalRadius,
          status: tempStatus,
        },
      ]);
    }
    setModalVisible(false);
  };

  const deleteZone = (id: string) => {
    setZones(zones.filter((z) => z.id !== id));
  };

  const getStatusColor = (statusId: string) => {
    const status = STATUS_OPTIONS.find((s) => s.id === statusId);
    return status ? status.color : "#ffffff";
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#121212" />
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        {/* Header matched to other pages */}
        <View style={styles.headerWrapper}>
          <CustomHeader
            title="Map"
            subtitle="Gainesville, FL"
            showAddButton={false}
          />
        </View>

        {/* Map Section */}
        <View style={styles.mapContainer}>
          {location ? (
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
                      description={`Linked Status: ${zone.status}`}
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

        {/* Zones List Section */}
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

        {/* Edit / Add Modal */}
        <Modal visible={isModalVisible} transparent={true} animationType="fade">
          <View style={styles.modalOverlay}>
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

              <View style={styles.modalActions}>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={styles.cancelButton}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={saveZone} style={styles.saveButton}>
                  <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  safeArea: { flex: 1 },
  headerWrapper: { paddingHorizontal: 15 }, // Aligns header with other pages
  mapContainer: {
    height: "50%",
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  map: { flex: 1 },
  loader: { flex: 1, justifyContent: "center" },

  // List Styles
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

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
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
  label: { color: "#aaa", fontSize: 12, marginBottom: 5 },
  input: {
    backgroundColor: "#333",
    color: "#fff",
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 15,
  },
  cancelButton: { padding: 10, backgroundColor: "#444", borderRadius: 5 },
  saveButton: { padding: 10, backgroundColor: "#007AFF", borderRadius: 5 },

  // Inherited Status Button Styles
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
  statusButtonSelected: {
    borderColor: "#FFFFFF",
    borderWidth: 1.5,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 6,
  },
  statusButtonText: {
    color: "#888888",
    fontSize: 10,
    fontFamily: "monospace",
  },
  statusTextSelected: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});
