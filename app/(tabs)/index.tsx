import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Image, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { homeStyles } from "../components/homeStyles";
import SearchBar from "../components/searchbar";

export default function Index() {
  const router = useRouter();
  

  return (
    <View>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
        style={{marginTop: 35}}>

      <SafeAreaView style={[homeStyles.safeArea]}>

        <View style={homeStyles.header}>

          <TouchableOpacity
            onPress={() => router.push("/(tabs)/profile")}
             style={{flexDirection: "row", alignItems: "center"}}>
          
            <Ionicons name="person-circle" size={70} color={"#399d9d"}/>
                    
            <Text style={{fontSize: 18}}>Good day, User!</Text>
              
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => router.push ("/components/notification")}>
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

        <View style={{ marginTop: 25, marginHorizontal: 20, marginBottom: 10, flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ fontSize: 18, color: "black", fontWeight: "bold" }}>
            Construction Services
          </Text>
        </View>

      <View style={[homeStyles.iconGrid]}>
        <ScrollView horizontal={true} showsHorizontalScrollIndicator= {false}>
          <TouchableOpacity
            onPress={() => router.push("/carpentry")}>
              <Image
                source={require("../../assets/images/carpentry.png")}
                style={[homeStyles.iconBackground, homeStyles.icons]} />
                  <Text style={homeStyles.iconText}>
                    Carpentry
                  </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/welding")}>
              <View>
                <Image 
                  source={require("../../assets/images/welding.png")}
                  style={[homeStyles.iconBackground, homeStyles.icons]}
                  resizeMode="contain"
                />
              </View>
                <Text style={homeStyles.iconText}>
                  Welding
                </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => router.push("/electrical")}> 
            <Image 
              source={require("../../assets/images/electrical.png")}
              style={[homeStyles.iconBackground, homeStyles.icons]} />
                <Text style={homeStyles.iconText}>
                  Electrical
                </Text>
          </TouchableOpacity>

          <TouchableOpacity
          onPress={() => router.push("/masonry")}> 
            <Image 
              source={require("../../assets/images/masonry.png")}
              style={[homeStyles.iconBackground, homeStyles.icons]} />
                <Text style={homeStyles.iconText}>
                  Masonry
                </Text>
          </TouchableOpacity>

              <TouchableOpacity
          onPress={() => router.push("/masonry")}> 
            <Image 
              source={require("../../assets/images/painting.png")}
              style={[homeStyles.iconBackground, homeStyles.icons]} />
                <Text style={homeStyles.iconText}>
                  Painting
                </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <View style={{ marginHorizontal: 20, marginBottom: 10 }}>
        <Text style={{ fontSize: 18, color: "black", fontWeight: "bold" }}>
          Electronics Services
        </Text>
      </View>

      <View style={[homeStyles.iconGrid]}>
        
        <TouchableOpacity>
          <Image 
            source={require("../../assets/images/painting.png")}
            style={[homeStyles.iconBackground, homeStyles.icons]} />
              <Text style={homeStyles.iconText}>
                Painting
              </Text>
        </TouchableOpacity>

        <TouchableOpacity> 
          <Image 
            source={require("../../assets/images/rac.png")}
            style={[homeStyles.iconBackground, homeStyles.icons]} />
              <Text style={homeStyles.iconText}>
                Aircondition
              </Text>
        </TouchableOpacity>

        <TouchableOpacity>
        <Image 
          source={require("../../assets/images/computer.png")}
          style={[homeStyles.iconBackground, homeStyles.icons]} />
            <Text style={homeStyles.iconText}>
              Computer              
            </Text>
      </TouchableOpacity>
      </View>

      <View style={{ marginHorizontal: 20, marginBottom: 10 }}>
        <Text style={{ fontSize: 18, color: "black", fontWeight: "bold" }}>
          Utility Services
        </Text>
      </View>

      <View style={[homeStyles.iconGrid]}>
        
        <TouchableOpacity>
          <Image 
            source={require("../../assets/images/plumbing.png")}
            style={[homeStyles.iconBackground, homeStyles.icons]} />
              <Text style={homeStyles.iconText}>
                Plumbing
              </Text>
        </TouchableOpacity>

        <TouchableOpacity>
          <Image 
            source={require("../../assets/images/carpentry.png")}
            style={[homeStyles.iconBackground, homeStyles.icons]} />
              <Text style={homeStyles.iconText}>
                Carpentry                
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
      
    </ScrollView>
    </View>
  );
}


