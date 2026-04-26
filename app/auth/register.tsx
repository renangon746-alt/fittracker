import { useTheme } from '@/context/ThemeContext';
import { useRegister } from '@/hooks/useRegister';
import { globalStyles } from "@/styles/global-styles";
import { router } from 'expo-router';
import { Image, Pressable, Text, TextInput, View } from "react-native";

export default function Register() {
    const { colors } = useTheme();
    const styles = globalStyles(colors);
    const { nombre, setNombre, email, setEmail, password, setPassword, imageUri, pickImage, errorMsg, handleRegister } = useRegister();

    return (
        <View style={{
            flex: 1, backgroundColor: colors.backgroundPrimary, flexDirection: 'column',
            alignItems: 'center', paddingTop: 100
        }}>

            <Image source={require('../../assets/images/Icon__dumbell_fitTracker.png')} style={styles.principalLogoImage} />

            <Text style={styles.tittleText}>Crear Cuenta</Text>

            <Pressable onPress={pickImage} style={{ paddingTop: 24 }}>
                <Image
                    source={imageUri ? { uri: imageUri } : require('../../assets/images/defaultAvatar.png')}
                    style={styles.profileImage}
                />
            </Pressable>

            {errorMsg && <Text style={[styles.secondaryText, { color: 'red' }]}>{errorMsg}</Text>}

            <View style={{ paddingTop: 20 }}>
                <Text style={[styles.principalText, { paddingLeft: 10 }]}>Nombre</Text>
                <TextInput style={styles.inputs} value={nombre} onChangeText={setNombre} />

                <Text style={[styles.principalText, { paddingLeft: 10 }]}>E-mail</Text>
                <TextInput style={styles.inputs} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

                <Text style={[styles.principalText, { paddingLeft: 10 }]}>Contrasena</Text>
                <TextInput style={styles.inputs} value={password} onChangeText={setPassword} secureTextEntry />
            </View>

            <View style={{ padding: 10 }}>
                <Pressable style={styles.principalButton} onPress={handleRegister}>
                    <Text style={styles.principalText}>
                        Registrarse
                    </Text>
                </Pressable>
            </View>

            <Pressable onPress={() => router.push('/auth/login')}>
                <Text style={[styles.underlineText]}>Ya tengo cuenta</Text>
            </Pressable>

        </View>
    );
}
