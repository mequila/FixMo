import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";  
import { homeStyles } from "../components/homeStyles";
import ServiceIcon from "../components/index/ServiceIcon";

  
  const constructionServices = [
  { label: "Carpentry", source: require("../../assets/images/carpentry.png"), route: "/pages/carpentry" },
  { label: "Welding", source: require("../../assets/images/welding.png"), route: "/pages/welding" },
  { label: "Tile Setting", source: require("../../assets/images/tile.png"), route: "/pages/tile" },
  { label: "Masonry", source: require("../../assets/images/masonry.png"), route: "/pages/masonry" },
  { label: "Painting", source: require("../../assets/images/painting.png"), route: "/pages/painting" },
];

const electronicsServices = [
  { label: "Appliances", source: require("../../assets/images/appliances.png"), route: "/pages/appliances" },
  { label: "Aircon", source: require("../../assets/images/rac.png"), route: "/pages/aircon" },
  { label: "Computer", source: require("../../assets/images/computer.png"), route: "/pages/computer" },
];

const utilityServices = [
  { label: "Plumbing", source: require("../../assets/images/plumbing.png"), route: "/pages/plumbing" },
  { label: "Electrical", source: require("../../assets/images/electrical.png"), route: "/pages/electrical" },
];

export default function Index() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }} >
      <ScrollView 
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
        >

      <SafeAreaView style={[homeStyles.safeArea]}>

        <View style={homeStyles.header}>

          <TouchableOpacity
            onPress={() => router.push("/(tabs)/profile")}
             style={{flexDirection: "row", alignItems: "center"}}>

            <Ionicons name="person-circle" size={65} color={"#008080"}/>

            <Text style={{fontSize: 18}}>Good day, User!</Text>
              
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => router.push ("/components/notification")}>
              <Ionicons name="notifications" size={30} color={"#008080"} />
          </TouchableOpacity>

        </View>
      </SafeAreaView>

      <View>
        <TouchableOpacity onPress={() => router.push("/search")}>
           <View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#e7ecec",
                  borderWidth: 1,
                  borderColor: "#b2d7d7",
                  borderRadius: 199,
                  paddingHorizontal: 20,
                  marginHorizontal: 20,
                  paddingVertical: 15,
                  justifyContent: "space-between",
                }}
              >
                <Text style={{ color: "gray", fontSize: 16 }}>Search</Text>
                <Ionicons name="search" size={25} color={"#008080"} />
              </View>
           </View>
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

        <View style={{ marginTop: 25, marginHorizontal: 20, marginBottom: 10, flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ fontSize: 18, color: "black", fontWeight: "bold" }}>
            Construction Services
          </Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {constructionServices.map((service, index) => (
            <ServiceIcon
              key={index}
              label={service.label}
              source={service.source}
              route={service.route}
            />
          ))}
        </ScrollView>

      <View style={{ marginHorizontal: 20, marginBottom: 10 }}>
        <Text style={{ fontSize: 18, color: "black", fontWeight: "bold" }}>
          Electronics Services
        </Text>
      </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {electronicsServices.map((service, index) => (
            <ServiceIcon
              key={index}
              label={service.label}
              source={service.source}
              route={service.route}
            />
          ))}
        </ScrollView>

      <View style={{ marginHorizontal: 20, marginBottom: 10 }}>
        <Text style={{ fontSize: 18, color: "black", fontWeight: "bold" }}>
          Utility Services
        </Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {utilityServices.map((service, index) => (
          <ServiceIcon
            key={index}
            label={service.label}
            source={service.source}
            route={service.route}
          />
        ))}
      </ScrollView>

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
      
    </ScrollView>
    </View>
  );
}


