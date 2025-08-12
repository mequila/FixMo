import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ScrollView ,Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import SearchBar from "../../components/searchbar";


export default function Index() {
  const router = useRouter();
  

  return (
    <View>

      <SafeAreaView style={homeStyles.safeArea}>
        <View style={homeStyles.header}>
          <TouchableOpacity style={homeStyles.header}
          onPress={() => router.push("/(tabs)/profile")}>
              <Ionicons name="person-circle" size={70} color={"#399d9d"}/>
                <Text style={homeStyles.profileText}>Good day, User!</Text>
          </TouchableOpacity>
          

          <TouchableOpacity onPress={() => router.push ("/notification")} style={{ padding: 8 }}>
              <Ionicons name="notifications" size={30} color={"#399d9d"} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <View>
        <TouchableOpacity onPress={() => router.push("/search")}>
          <SearchBar/>
        </TouchableOpacity>
      </View>

      <View style={{ marginTop: 25, marginHorizontal: 20, marginBottom: 10 }}>
        <Text style={{ fontSize: 18, fontFamily: "", color: "black", fontWeight: "bold" }}>
          Certified Service Deal</Text>
      </View>

      <View>
        <LinearGradient
          colors={["#126363", "#8cc6c6"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[homeStyles.gradientBox, { flexDirection: "row", alignItems: "center", height: 180 }]}
          >

          <Image 
            source={require("../../assets/images/cleaning-lady.png")}
            style={{ width: 180, height: 180, position: "absolute", right: 2, top: 5}}
            resizeMode="contain"
          />

          <View style={[homeStyles.gradientBox, { flex: 1, justifyContent: "center", left: -75 }]}>
            <Text style={{ color: "white", fontSize: 35, textAlign: "center" }}>
              10%
            </Text>

            <Text style={{ color: "white", fontSize: 16, textAlign: "center" }}>
              Get discount this month {"\n"}  
              with our Skilled Hands. 
            </Text>
          </View>
        </LinearGradient>

      </View>

        <View style={{ marginTop: 25, marginHorizontal: 20, marginBottom: 10 }}>
          <Text style={{ fontSize: 18, color: "black", fontWeight: "bold" }}>
            Services
          </Text>


          <TouchableOpacity 
            onPress={() => router.push("/services")}
            style={{ position: "absolute", right: 0, top: 0 }}>

          <Text style={{ fontSize: 18, color: "#399d9d", fontWeight: "bold" }}>
            See All
          </Text>
          </TouchableOpacity>

        </View>

      <View style={{ flexDirection: "row", justifyContent: "space-between", marginHorizontal: 20, marginBottom: 20 }}>
        <TouchableOpacity> 
          <Ionicons name="construct" size={40} color={"#399d9d"}
            style={homeStyles.iconBackground} />
              <Text style={homeStyles.iconText}>
                Repairing
              </Text>
        </TouchableOpacity>

         <TouchableOpacity> 
          <Ionicons name="construct" size={40} color={"#399d9d"}
            style={homeStyles.iconBackground} />
              <Text style={homeStyles.iconText}>
                Repairing
              </Text>
        </TouchableOpacity>

         <TouchableOpacity> 
          <Ionicons name="construct" size={40} color={"#399d9d"}
            style={homeStyles.iconBackground} />
              <Text style={homeStyles.iconText}>
                Repairing
              </Text>
        </TouchableOpacity>

         <TouchableOpacity> 
          <Ionicons name="construct" size={40} color={"#399d9d"}
            style={homeStyles.iconBackground} />
              <Text style={homeStyles.iconText}>
                Repairing
              </Text>
        </TouchableOpacity>
      </View>

       <View style={{ flexDirection: "row", justifyContent: "space-between", marginHorizontal: 20, marginBottom: 20 }}>
        <TouchableOpacity> 
          <Ionicons name="construct" size={40} color={"#399d9d"}
            style={homeStyles.iconBackground} />
              <Text style={homeStyles.iconText}>
                Repairing
              </Text>
        </TouchableOpacity>

         <TouchableOpacity> 
          <Ionicons name="construct" size={40} color={"#399d9d"}
            style={homeStyles.iconBackground} />
              <Text style={homeStyles.iconText}>
                Repairing
              </Text>
        </TouchableOpacity>

         <TouchableOpacity> 
          <Ionicons name="construct" size={40} color={"#399d9d"}
            style={homeStyles.iconBackground} />
              <Text style={homeStyles.iconText}>
                Repairing
              </Text>
        </TouchableOpacity>

         <TouchableOpacity> 
          <Ionicons name="construct" size={40} color={"#399d9d"}
            style={homeStyles.iconBackground} />
              <Text style={homeStyles.iconText}>
                Repairing
              </Text>
        </TouchableOpacity>
      </View>

      <View style={{ marginTop: 20, marginHorizontal: 20, marginBottom: 10 }}>
          <Text style={{ fontSize: 18, fontFamily: "", color: "black", fontWeight: "bold" }}>
            Most Popular Services
          </Text>
      </View>

      <View >
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginHorizontal: 20, marginBottom: 20 }}>
          <TouchableOpacity>
            <Text style={homeStyles.serviceBorder}>
              All
            </Text>
          </TouchableOpacity>

                    <TouchableOpacity>
            <Text style={homeStyles.serviceBorder}>
              Repairing
            </Text>
          </TouchableOpacity>
        
          <TouchableOpacity>
            <Text style={homeStyles.serviceBorder}>
              Cleaning
            </Text>
          </TouchableOpacity>

          <TouchableOpacity>
            <Text style={homeStyles.serviceBorder}>
              Plumbing
            </Text>
          </TouchableOpacity>

          <TouchableOpacity>
            <Text style={homeStyles.serviceBorder}>
              Electrical
            </Text>
          </TouchableOpacity>

          <TouchableOpacity>
            <Text style={homeStyles.serviceBorder}>
              Painting
            </Text>
          </TouchableOpacity>

          </View>
        </ScrollView>
      </View>


    </View>
  );
}

const homeStyles = StyleSheet.create
({
  safeArea: {
    marginTop: 50,
    marginBottom: 10,
    paddingHorizontal: 16
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    
  },
  profileText: {
    fontSize: 18,
    color: "black",
  },
  gradientBox: {
    marginHorizontal: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  iconBackground: {
    backgroundColor: "#cceded",
    width:70,
    height: 70,
    borderRadius: 35,
    padding: 15,
  },
  iconText: {
    color: "gray",
    fontSize: 16,
    marginTop: 5,
    textAlign: "center"
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
  

});
