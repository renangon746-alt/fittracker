import Cal from "@/components/global/Cal";
import Graph from "@/components/global/Graph";
import StreakBadge from "@/components/global/StreakBadge";
import { useTranslation } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { useUser } from "@/context/UserContext";
import { useFollowers } from "@/hooks/social/useFollowers";
import { useIncomingFollowRequests } from "@/hooks/social/useFollowRequests";
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
  const { t } = useTranslation();
  const global_styles = globalStyles(colors);
  const profile_styles = profileStyles(colors);
  const [imgError, setImgError] = useState(false);

  const { userProfile, avatarUrl, loading, errorMsg } = useUser();
  const { followers, following } = useFollowers(userProfile?.id_usuario ?? null);
  const { requests, acceptRequest, rejectRequest } = useIncomingFollowRequests();

  if (loading) {
    return (
      <SafeAreaView style={profile_styles.loadProfileContainer}>
        <ActivityIndicator size="large" color={colors.textPrimary} />
        <Text style={[global_styles.secondaryText, { marginTop: 10 }]}>{t('loading_profile')}</Text>
      </SafeAreaView>
    );
  }

  if (!userProfile) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.backgroundPrimary, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={[global_styles.principalText, { color: 'red', marginBottom: 10 }]}>{t('profile_load_error')}</Text>
        <Text style={[global_styles.secondaryText, { textAlign: 'center' }]}>{errorMsg}</Text>
        <Pressable style={[global_styles.principalButton, { marginTop: 20 }]} onPress={() => router.back()}>
          <Text style={global_styles.principalText}>{t('back')}</Text>
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
            <View style={{ flexDirection: 'column' }}>
              <Text style={[global_styles.tittleText, { fontSize: screenWidth < 350 ? 18 : 24 }]} numberOfLines={1}>
                {userProfile.nombre}
              </Text>
              {userProfile.nickname ? (
                <Text style={[global_styles.secondaryText, { fontSize: screenWidth < 350 ? 12 : 14, marginTop: 2 }]}>
                  @{userProfile.nickname}
                </Text>
              ) : null}
            </View>
            <StreakBadge count={userProfile.racha_actual || 0} />
          </View>

          {/* Profile statistics */}
          <View style={profile_styles.p_profileStatsContainer}>
            <View style={profile_styles.p_stat}>
              <Text style={[global_styles.principalText, { fontSize: screenWidth < 350 ? 12 : 14 }]}>{t('trainings')}</Text>
              <Text style={[global_styles.principalText, { fontSize: screenWidth < 350 ? 16 : 18 }]}>0</Text>
            </View>
            <Pressable
              style={profile_styles.p_stat}
              onPress={() => userProfile && router.push({ pathname: '/profile/followers', params: { id: String(userProfile.id_usuario) } })}
            >
              <Text style={[global_styles.principalText, { fontSize: screenWidth < 350 ? 12 : 14 }]}>{t('followers')}</Text>
              <Text style={[global_styles.principalText, { fontSize: screenWidth < 350 ? 16 : 18 }]}>{followers}</Text>
            </Pressable>
            <Pressable
              style={profile_styles.p_stat}
              onPress={() => userProfile && router.push({ pathname: '/profile/following', params: { id: String(userProfile.id_usuario) } })}
            >
              <Text style={[global_styles.principalText, { fontSize: screenWidth < 350 ? 12 : 14 }]}>{t('following')}</Text>
              <Text style={[global_styles.principalText, { fontSize: screenWidth < 350 ? 16 : 18 }]}>{following}</Text>
            </Pressable>
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

        {/* Follow requests */}
        {requests.length > 0 && (
          <View style={{ marginTop: 20, paddingHorizontal: 20 }}>
            <Text style={[global_styles.tittleText, { fontSize: 18, marginBottom: 12 }]}>
              {t('follow_requests')}
            </Text>
            {requests.map((req) => (
              <View
                key={req.id_solicitud}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: colors.backgroundPrimary,
                  borderRadius: 12,
                  padding: 12,
                  marginBottom: 8,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[global_styles.principalText, { fontWeight: '700' }]}>
                    {req.solicitante?.nombre ?? 'Usuario'}
                  </Text>
                  <Text style={[global_styles.secondaryText, { fontSize: 12 }]}>
                    {req.solicitante?.nickname ? `@${req.solicitante.nickname}` : `user${req.id_solicitante}`}
                  </Text>
                </View>
                <Pressable
                  onPress={() => acceptRequest(req.id_solicitud)}
                  style={{
                    backgroundColor: colors.primary,
                    borderRadius: 8,
                    paddingHorizontal: 14,
                    paddingVertical: 6,
                    marginRight: 8,
                  }}
                >
                  <Text style={[global_styles.principalText, { color: '#fff', fontSize: 13 }]}>{t('accept')}</Text>
                </Pressable>
                <Pressable
                  onPress={() => rejectRequest(req.id_solicitud)}
                  style={{
                    backgroundColor: colors.backgroundTertiary,
                    borderRadius: 8,
                    paddingHorizontal: 14,
                    paddingVertical: 6,
                  }}
                >
                  <Text style={[global_styles.principalText, { fontSize: 13 }]}>{t('reject')}</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}

        {/* Charts section */}
        <View style={profile_styles.p_charts}>
          <Graph />
          <Cal />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
