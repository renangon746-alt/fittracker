import Cal from "@/components/global/Cal";
import Graph from "@/components/global/Graph";
import StreakBadge from "@/components/global/StreakBadge";
import { useTranslation } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { supabase } from "@/lib/supabase";
import { globalStyles } from "@/styles/global-styles";
import { profileStyles } from "@/styles/profile-styles";
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
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

interface UserProfile {
  id_usuario: number;
  nombre: string;
  email: string;
  auth_uuid?: string;
  racha_actual?: number;
  bio?: string;
  enlace?: string;
}

export default function ProfileDescription() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const global_styles = globalStyles(colors);
  const profile_styles = profileStyles(colors);
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [imgError, setImgError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    async function loadUserProfile() {
      try {
        const selectedUserId = Number(id);

        if (!id || Number.isNaN(selectedUserId)) {
          setErrorMsg(t('invalid_user_id'));
          return;
        }

        // Fetch profile including auth_uuid — no admin call needed
        const { data: profile, error } = await supabase
          .from('usuario')
          .select('id_usuario, nombre, email, auth_uuid, racha_actual, bio, enlace')
          .eq('id_usuario', selectedUserId)
          .single();

        if (error) {
          setErrorMsg(`${t('error_loading_profile')}: ${error.message}`);
        } else if (profile) {
          setUserProfile(profile);

          // Build avatar URL directly from auth_uuid stored in the table
          if (profile.auth_uuid) {
            const { data } = supabase.storage
              .from('avatars')
              .getPublicUrl(`${profile.auth_uuid}/avatar.jpg`);

            setAvatarUrl(`${data.publicUrl}?t=${Date.now()}`);
          }
        } else {
          setErrorMsg(t('no_profile_for_user'));
        }
      } catch (error) {
        setErrorMsg(`${t('unexpected_error')}: ${String(error)}`);
      } finally {
        setLoading(false);
      }
    }

    loadUserProfile();
  }, [id, t]);

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
            <Text style={[global_styles.tittleText, { fontSize: screenWidth < 350 ? 18 : 24 }]} numberOfLines={1}>
              {userProfile.nombre}
            </Text>
            <StreakBadge count={userProfile.racha_actual || 0} />
          </View>

          {/* Profile statistics */}
          <View style={profile_styles.p_profileStatsContainer}>
            <View style={profile_styles.p_stat}>
              <Text style={[global_styles.principalText, { fontSize: screenWidth < 350 ? 12 : 14 }]}>{t('trainings')}</Text>
              <Text style={[global_styles.principalText, { fontSize: screenWidth < 350 ? 16 : 18 }]}>103</Text>
            </View>
            <View style={profile_styles.p_stat}>
              <Text style={[global_styles.principalText, { fontSize: screenWidth < 350 ? 12 : 14 }]}>{t('followers')}</Text>
              <Text style={[global_styles.principalText, { fontSize: screenWidth < 350 ? 16 : 18 }]}>100</Text>
            </View>
            <View style={profile_styles.p_stat}>
              <Text style={[global_styles.principalText, { fontSize: screenWidth < 350 ? 12 : 14 }]}>{t('following')}</Text>
              <Text style={[global_styles.principalText, { fontSize: screenWidth < 350 ? 16 : 18 }]}>2</Text>
            </View>
          </View>

          {/* Bio + link + Follow button */}
          <View style={profile_styles.pd_bioFollowButton}>
            <View style={{ flex: 1 }}>
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

            <Pressable style={[global_styles.principalButton, { width: 100, height: 35 }]}> 
              <Text style={global_styles.principalText}>{t('follow')}</Text>
            </Pressable>
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
