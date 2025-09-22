import { StyleSheet } from "react-native";

export const homeStyles = StyleSheet.create({
  safeArea: {
    marginBottom: 20,
    backgroundColor: "#e7ecec",
    borderBottomColor: "#4c8080",
  },
  header: {
    paddingTop: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 20,
  },
  gradientBox: {
    marginHorizontal: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  iconGrid: {
    // service icons container
    flexDirection: "column",
    alignContent: "center",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  iconBackground: {
    // service icon background
    backgroundColor: "#cceded",
    justifyContent: "center",
    alignItems: "center",
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  icons: {
    // service icon
    width: 70,
    height: 70,
    tintColor: "#399d9d",
  },
  iconText: {
    // service icon text
    color: "gray",
    fontSize: 16,
    marginTop: 5,
    textAlign: "center",
    marginHorizontal: 16,
    flexDirection: "row",
  },
  serviceBorder: {
    borderWidth: 1,
    borderColor: "#399d9d",
    borderRadius: 20,
    paddingLeft: 20,
    paddingRight: 20,
    padding: 10,
  },
  calendar: {
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    marginTop: 30,
  },
  calendarWrap: {
    width: 350,
    height: 370,
    borderRadius: 15,
    elevation: 5,
  },
  bookings: {
    backgroundColor: "#e7ecec",
    borderRadius: 15,
    padding: 25,
    marginVertical: 10,
    marginHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  profile: {
    marginTop: 10,
    marginHorizontal: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  border: {
    backgroundColor: "#cceded",
    marginVertical: 5,
    marginHorizontal: 20,
    borderRadius: 15,
    padding: 10,
    alignContent: "center",
    flexDirection: "column",
  },
  borderTitle: {
    paddingTop: 10,
    paddingBottom: 5,
    fontSize: 20,
    fontWeight: "500",
    marginHorizontal: 18,
  },
  borderDesc: {
    fontSize: 13,
    color: "gray",
    lineHeight: 16,
    marginHorizontal: 18,
    marginBottom: 10,
  },
  marginEmergencyFix: { // Emergency Fix outside button
    alignContent: "center",
    justifyContent: "space-around",
    flexDirection: "row",
    marginHorizontal: 50,
    marginBottom: 8,
    marginTop: 8,
},
  emergencyFix: { // Emergency Fix button
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#399d9d",
    borderRadius: 15,
    paddingVertical: 20,
    paddingHorizontal: 25,
  },
    emergencyFixText: {
    fontSize: 20,
    fontWeight: "600",
    color: "white",
    marginLeft: 8,
  },
   findProvidersbtn:{
    fontSize: 16,
    fontWeight: "600",
    backgroundColor: "#008080",
    borderRadius: 8,
    color: "white",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
    providerText: { // type of service provider text
    color: "#008080",
    fontWeight: "bold",
    fontSize: 20,
  },
  providerTextContainer: {
    padding: 16,
    backgroundColor: "#fff",
  },
});

export default homeStyles;
