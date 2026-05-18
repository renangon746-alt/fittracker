import { useTranslation } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { supabase } from "@/lib/supabase";
import { globalStyles } from "@/styles/global-styles";
import { profileStyles } from "@/styles/profile-styles";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ResetPassword() {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const global_styles = globalStyles(colors);
    const profile_styles = profileStyles(colors);

    const [password, setPassword] = useState("");
    const [repeatPassword, setRepeatPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    useEffect(() => {
        const handleDeepLink = async (url: string) => {
            // Supabase envía tokens después de '#' o '?'
            const queryString = url.includes('#') ? url.split('#')[1] : url.split('?')[1];
            
            if (queryString) {
                const params = Object.fromEntries(new URLSearchParams(queryString));
                const access_token = params.access_token;
                const refresh_token = params.refresh_token;

                if (access_token && refresh_token) {
                    const { error } = await supabase.auth.setSession({
                        access_token,
                        refresh_token,
                    });

                    if (error) {
                        console.error("Error al establecer sesión:", error.message);
                        setErrorMsg("Enlace inválido o expirado.");
                    } else {
                        console.log("Sesión de recuperación establecida");
                    }
                }
            }
        };

        // Escuchar si la app ya estaba abierta
        const subscription = Linking.addEventListener("url", ({ url }) => {
            handleDeepLink(url);
        });

        // Revisar si la app se abrió mediante el link
        Linking.getInitialURL().then((url) => {
            if (url) handleDeepLink(url);
        });

        return () => subscription.remove();
    }, []);

    async function handleResetPassword() {
        setErrorMsg(null);
        setSuccessMsg(null);

        // Verificar si realmente hay una sesión activa ahora mismo
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
            setErrorMsg("No hay una sesión activa. Usa el enlace de tu correo nuevamente.");
            return;
        }

        if (!password || !repeatPassword) {
            setErrorMsg("Completa todos los campos");
            return;
        }

        if (password !== repeatPassword) {
            setErrorMsg("Las contraseñas no coinciden");
            return;
        }

        const { error } = await supabase.auth.updateUser({
            password: password,
        });

        if (error) {
            setErrorMsg(error.message);
            return;
        }

        setSuccessMsg("Contraseña actualizada correctamente");
        
        setTimeout(() => {
            router.replace("/auth/login");
        }, 2000);
    }

    return (
        <SafeAreaView style={global_styles.defaultContainer}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <ScrollView contentContainerStyle={global_styles.defaultScroll}>
                    <View style={profile_styles.auth_container}>
                        <Image
                            source={require("../../assets/images/Icon__dumbell_fitTracker.png")}
                            style={global_styles.principalLogoImage}
                        />
                        <Text style={global_styles.tittleText}>Restablecer Contraseña</Text>

                        <View style={{ paddingTop: 20 }}>
                            <Text style={[global_styles.principalText, { paddingLeft: 10 }]}>Nueva contraseña</Text>
                            <TextInput
                                style={global_styles.inputs}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                        </View>

                        <View style={{ paddingTop: 20 }}>
                            <Text style={[global_styles.principalText, { paddingLeft: 10 }]}>Repetir contraseña</Text>
                            <TextInput
                                style={global_styles.inputs}
                                value={repeatPassword}
                                onChangeText={setRepeatPassword}
                                secureTextEntry
                            />
                        </View>

                        {errorMsg && <Text style={[global_styles.secondaryText, { color: 'red', textAlign: 'center', marginTop: 10 }]}>{errorMsg}</Text>}
                        {successMsg && <Text style={[global_styles.secondaryText, { color: 'green', textAlign: 'center', marginTop: 10 }]}>{successMsg}</Text>}

                        <View style={profile_styles.buttonContainer}>
                            <Pressable style={global_styles.principalButton} onPress={handleResetPassword}>
                                <Text style={global_styles.principalText}>Confirmar</Text>
                            </Pressable>
                        </View>

                        <Pressable onPress={() => router.replace("/auth/login")}>
                            <Text style={global_styles.underlineText}>{t("back")}</Text>
                        </Pressable>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}