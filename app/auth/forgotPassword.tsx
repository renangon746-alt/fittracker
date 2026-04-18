import { useTheme } from '@/context/ThemeContext';
import { useForgotPassword } from '@/hooks/useForgotPassword';
import { globalStyles } from "@/styles/global-styles";
import { router, useLocalSearchParams } from 'expo-router';
import { Image, Pressable, Text, TextInput, View } from "react-native";

export default function ForgotPassword() {
    const { colors } = useTheme();
    const styles = globalStyles(colors);
    const { email, setEmail, errorMsg, successMsg, handleForgotPassword } = useForgotPassword();
    const { from } = useLocalSearchParams();
    
    return (
        <View style={{
            flex: 1, backgroundColor: colors.backgroundPrimary, flexDirection: 'column',
            alignItems: 'center', paddingTop: 100
        }}>

            <Image source={require('../../assets/images/Icon__dumbell_fitTracker.png')} style={styles.principalLogoImage} />

            <Text style={styles.tittleText}>Recuperar contrasena</Text>

            <View style={{ paddingTop: 20 }}>
                <Text style={[styles.principalText, { paddingLeft: 10 }]}>E-mail</Text>
                <TextInput style={styles.inputs} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            </View>

            {errorMsg && <Text style={[styles.secondaryText, { color: 'red', paddingTop: 10 }]}>{errorMsg}</Text>}
            {successMsg && <Text style={[styles.secondaryText, { color: 'green', paddingTop: 10 }]}>{successMsg}</Text>}

            <View style={{ padding: 10 }}>
                <Pressable style={styles.principalButton} onPress={handleForgotPassword}>
                    <Text style={styles.principalText}>
                        Enviar e-mail
                    </Text>
                </Pressable>
            </View>

            <Pressable onPress={() => from === 'settings' ? router.back() : router.replace('../../auth/login')}>
                <Text style={styles.underlineText}>
                    Volver
                </Text>
            </Pressable>
        </View>
    );
}
