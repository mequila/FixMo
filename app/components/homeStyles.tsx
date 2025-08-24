import { StyleSheet } from "react-native";

export const homeStyles = StyleSheet.create
({
  safeArea:{
    marginBottom: 20,
    backgroundColor: "#e7ecec",
    borderBottomColor: "#4c8080"
  },
  header:{
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 20
  },
  gradientBox: {
    marginHorizontal: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  iconGrid:{ 
    flexDirection: "row", 
    justifyContent: "flex-start", 
    marginHorizontal: 20, 
    marginBottom: 20 
  },
  iconBackground: {
    backgroundColor: "#cceded",
    width:70,
    height: 70,
    borderRadius: 35,
    padding: 15,
    paddingTop: 15,
    marginRight: 12
  },
  icons:{
    width: 70, 
    height: 70,
    tintColor:"#399d9d"
  },
  iconText: {
    color: "gray",
    fontSize: 16,
    marginTop: 5,
    textAlign: "center",
    flexDirection: "row", 
  },
  serviceBorder: {
    borderWidth: 1,
    borderColor: "#399d9d",
    borderRadius: 20,
    paddingLeft: 20,
    paddingRight: 20,
    padding: 10,
    marginRight: 5,
    marginLeft: 5,
  },
  calendar: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    marginTop: 30
  },
  calendarWrap:{
    width: 350,
    height: 370,
    borderRadius: 15,
    elevation: 5,
  },
  bookings:{
    backgroundColor: "#e7ecec",
    borderRadius: 15,
    padding: 25,
    marginVertical: 10,
    marginHorizontal: 20,
    flexDirection: "row",
    alignItems: "center"
  }, 
  profile: {
    marginTop: 10,
    marginHorizontal: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
}
});
  
export default homeStyles