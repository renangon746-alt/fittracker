import Cal from "@/components/global/Cal";
import Graph from "@/components/global/Graph";
import StreakBadge from "@/components/global/StreakBadge";
import { useTheme } from "@/context/ThemeContext";
import { useUser } from "@/context/UserContext";
import { globalStyles } from "@/styles/global-styles";
import { profileStyles } from "@/styles/profile-styles";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";

const defaultAvatar = require('../../assets/images/defaultAvatar.png');
const screenWidth = Dimensions.get('window').width;

export default function OwnProfile() {
  const { colors } = useTheme();
  const global_styles = globalStyles(colors);
  const profile_styles = profileStyles(colors);
  const [imgError, setImgError] = useState(false);

  const { userProfile, avatarUrl, loading, errorMsg } = useUser();

  if (loading) {
    return (
      <SafeAreaView style={profile_styles.loadProfileContainer}>
        <ActivityIndicator size="large" color={colors.textPrimary} />
        <Text style={[global_styles.secondaryText, profile_styles.loadProfileLabel]}>Cargando perfil...</Text>
      </SafeAreaView>
    );
  }

  if (!userProfile) {
    return (
      <SafeAreaView style={profile_styles.loadProfileErrorContainer}>
        <Text style={[global_styles.principalText, profile_styles.loadProfileErrorLabel]}>No se pudo cargar el perfil</Text>
        <Text style={[global_styles.secondaryText, profile_styles.loadProfileErrorMessage]}>{errorMsg}</Text>
        <Pressable style={[global_styles.principalButton, profile_styles.loadProfileErrorReturn]} onPress={() => router.back()}>
          <Text style={global_styles.principalText}>Volver</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={global_styles.defaultContainer}>
      <ScrollView contentContainerStyle={global_styles.defaultScroll}>

        {/* Back button */}
        <View style={global_styles.backArrowContainer}>
          <Pressable onPress={() => router.back()} style={global_styles.backArrowPressable}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </Pressable>
        </View>

        {/* Profile header */}
        <View style={profile_styles.p_headerContainer}>

          {/* Avatar and username row */}
          <View style={profile_styles.p_avatarUsernameContainer}>
            <Image
              source={imgError || !avatarUrl ? defaultAvatar : { uri: avatarUrl }}
              onError={() => setImgError(true)}
              style={global_styles.profileImage}
            />
            <Text style={[global_styles.tittleText, { fontSize: screenWidth < 350 ? 18 : 24 }]} numberOfLines={1}>
              {userProfile.nombre}
            </Text>
            <StreakBadge count={userProfile.racha_actual || 0} />
          </View>

          {/* Profile statistics */}
          <View style={profile_styles.p_profileStatsContainer}>
            <View style={profile_styles.p_stat}>
              <Text style={[global_styles.principalText, { fontSize: screenWidth < 350 ? 12 : 14 }]}>Trainings</Text>
              <Text style={[global_styles.principalText, { fontSize: screenWidth < 350 ? 16 : 18 }]}>103</Text>
            </View>
            <View style={profile_styles.p_stat}>
              <Text style={[global_styles.principalText, { fontSize: screenWidth < 350 ? 12 : 14 }]}>Followers</Text>
              <Text style={[global_styles.principalText, { fontSize: screenWidth < 350 ? 16 : 18 }]}>100</Text>
            </View>
            <View style={profile_styles.p_stat}>
              <Text style={[global_styles.principalText, { fontSize: screenWidth < 350 ? 12 : 14 }]}>Following</Text>
              <Text style={[global_styles.principalText, { fontSize: screenWidth < 350 ? 16 : 18 }]}>2</Text>
            </View>
          </View>

          {/* Bio + link */}
          <View style={profile_styles.op_bio}>
            {userProfile.bio ? (
                <Text style={[global_styles.secondaryText, profile_styles.p_bio, {fontSize: screenWidth < 350 ? 12 : 14 }]}>
                {userProfile.bio}
              </Text>
            ) : null}
            {userProfile.enlace ? (
                <Text style={[global_styles.secondaryText, profile_styles.p_link,{fontSize: screenWidth < 350 ? 12 : 14, marginTop: userProfile.bio ? 4 : 0 }]}>
                {userProfile.enlace}
              </Text>
            ) : null}
          </View>

        </View>

        {/* Charts section */}
        <View style={profile_styles.p_charts}>
          <Graph />
          <Cal />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
