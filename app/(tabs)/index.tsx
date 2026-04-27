import CheckInCard from '@/components/dashboard/CheckInCard';
import SquareCard from '@/components/dashboard/SquareCard';
import StreakBadge from '@/components/dashboard/StreakBadge';
import WeekSelector from '@/components/dashboard/WeekSelector';
import WeightChart, { PesoPoint } from '@/components/dashboard/WeightChart';
import { typography } from '@/constants/typography';
import { useTheme } from '@/context/ThemeContext';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  KeyboardAvoidingView,
  LayoutChangeEvent,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ─── Types ────────────────────────────────────────────────────────────────────
type Fase = 'volumen' | 'definicion' | 'mantenimiento' | null;
interface DashboardData {
  idUsuario: number | null;
  nombre: string;
  racha: number;
  ultimoEntreno: { nombre: string; duracion: number } | null;
  mejorMarca: { ejercicio: string; peso: number } | null;
  pesoActual: number | null;
  fase: Fase;
  pesosGrafico: PesoPoint[];
  entrenosSemana: number;
  volumenSemana: number;
  fotoProgreso: { url: string; fecha: string } | null;
  fechasEntrenadas: string[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const H_PAD = 24;
const GAP = 10;

function getSaludo() {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const SHADOW = Platform.select({
  ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 4 },
  android: { elevation: 2 },
  default: {},
}) as object;

// ─── Add Weight Modal ─────────────────────────────────────────────────────────
function AddWeightModal({ visible, onClose, onSave, colors }: {
  visible: boolean; onClose: () => void;
  onSave: (peso: number, fase: Fase) => Promise<void>;
  colors: ReturnType<typeof useTheme>['colors'];
}) {
  const [pesoStr, setPesoStr] = useState('');
  const [fase, setFase] = useState<Fase>(null);
  const [saving, setSaving] = useState(false);

  const fases: { key: Fase; label: string; emoji: string }[] = [
    { key: 'volumen', label: 'Volumen', emoji: '💪' },
    { key: 'definicion', label: 'Definición', emoji: '🔥' },
    { key: 'mantenimiento', label: 'Mantenim.', emoji: '⚖️' },
  ];

  async function handleSave() {
    const val = parseFloat(pesoStr.replace(',', '.'));
    if (!val || val < 20 || val > 400) { Alert.alert('Error', 'Peso no válido (20–400 kg)'); return; }
    setSaving(true);
    await onSave(val, fase);
    setSaving(false);
    setPesoStr(''); setFase(null); onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }} onPress={onClose}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <Pressable onPress={e => e.stopPropagation()}>
            <View style={{ backgroundColor: colors.backgroundPrimary, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, alignItems: 'center' }}>
              <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: colors.border, marginBottom: 20 }} />
              <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 24, color: colors.textPrimary }}>Registrar peso</Text>

              <View style={{ flexDirection: 'row', alignItems: 'center', borderRadius: 16, paddingHorizontal: 20, width: '100%', marginBottom: 24, backgroundColor: colors.backgroundTertiary }}>
                <TextInput
                  style={[{ flex: 1, fontSize: 40, fontWeight: '700', textAlign: 'center', paddingVertical: 12, color: colors.textPrimary }, { outlineWidth: 0 } as any]}
                  value={pesoStr} onChangeText={setPesoStr}
                  placeholder="0.0" placeholderTextColor={colors.iconInactive}
                  keyboardType="decimal-pad" autoFocus
                />
                <Text style={{ fontSize: 18, color: colors.textSecondary }}>kg</Text>
              </View>

              <Text style={{ fontSize: 12, fontWeight: '600', marginBottom: 12, alignSelf: 'flex-start', color: colors.textSecondary }}>Fase actual</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 28, width: '100%' }}>
                {fases.map(f => (
                  <Pressable key={f.key!} onPress={() => setFase(f.key)}
                    style={[
                      { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 16, borderWidth: 1.5, gap: 4, borderColor: colors.border, backgroundColor: colors.backgroundSecondary },
                      fase === f.key && { borderColor: colors.primary, backgroundColor: colors.primary + '22' },
                    ]}>
                    <Text style={{ fontSize: 18 }}>{f.emoji}</Text>
                    <Text style={{ fontSize: 11, fontWeight: '600', textAlign: 'center', color: fase === f.key ? colors.primary : colors.textSecondary }}>{f.label}</Text>
                  </Pressable>
                ))}
              </View>

              <Pressable onPress={handleSave} disabled={saving}
                style={({ pressed }) => ({ width: '100%', paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginBottom: 12, backgroundColor: colors.primary, opacity: pressed || saving ? 0.7 : 1 })}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>Guardar</Text>}
              </Pressable>
              <Pressable onPress={onClose} style={{ paddingVertical: 8 }}>
                <Text style={{ fontSize: 14, color: colors.textSecondary }}>Cancelar</Text>
              </Pressable>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [containerWidth, setContainerWidth] = useState(0);
  const cardSize = containerWidth > 0 ? (containerWidth - H_PAD * 2 - GAP) / 2 : 150;

  const [loading, setLoading] = useState(true);
  const [showAddWeight, setShowAddWeight] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [data, setData] = useState<DashboardData>({
    idUsuario: null, nombre: '', racha: 0,
    ultimoEntreno: null, mejorMarca: null,
    pesoActual: null, fase: null, pesosGrafico: [],
    entrenosSemana: 0, volumenSemana: 0,
    fotoProgreso: null, fechasEntrenadas: [],
  });

  useEffect(() => { loadDashboard(); }, []);
  useEffect(() => {
    if (!loading) Animated.timing(fadeAnim, { toValue: 1, duration: 450, useNativeDriver: true }).start();
  }, [loading]);

  function onLayout(e: LayoutChangeEvent) {
    const w = e.nativeEvent.layout.width;
    if (w > 0) setContainerWidth(w);
  }

  async function getIdUsuario(email: string): Promise<number | null> {
    const { data: u } = await supabase.from('usuario').select('id_usuario').eq('email', email).single();
    return u?.id_usuario ?? null;
  }

  async function loadDashboard() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const idUsuario = await getIdUsuario(user.email!);
      if (!idUsuario) { setLoading(false); return; }

      const { data: usuario } = await supabase
        .from('usuario').select('nombre, racha_actual').eq('id_usuario', idUsuario).single();

      const { data: entrenos } = await supabase
        .from('entrenamiento').select('id_entrenamiento, duracion_min, id_rutina')
        .eq('id_usuario', idUsuario).not('fecha_fin', 'is', null)
        .order('fecha_inicio', { ascending: false }).limit(1);

      let ultimoEntreno = null;
      if (entrenos?.[0]) {
        const { data: rutina } = await supabase.from('rutina').select('nombre').eq('id_rutina', entrenos[0].id_rutina).single();
        ultimoEntreno = { nombre: rutina?.nombre ?? 'Entreno', duracion: entrenos[0].duracion_min ?? 0 };
      }

      const today = new Date();
      const dayOfWeek = today.getDay();
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const startWeek = new Date(today);
      startWeek.setDate(today.getDate() + mondayOffset);
      startWeek.setHours(0, 0, 0, 0);

      const { data: semana } = await supabase
        .from('entrenamiento').select('id_entrenamiento, fecha_inicio')
        .eq('id_usuario', idUsuario).gte('fecha_inicio', startWeek.toISOString()).not('fecha_fin', 'is', null);

      const calendarStart = new Date(startWeek);
      calendarStart.setDate(startWeek.getDate() - 42);
      const { data: allEntrenos } = await supabase
        .from('entrenamiento').select('fecha_inicio')
        .eq('id_usuario', idUsuario).gte('fecha_inicio', calendarStart.toISOString()).not('fecha_fin', 'is', null);

      const fechasEntrenadas = [...new Set(
        (allEntrenos ?? []).map(e => toDateStr(new Date(e.fecha_inicio)))
      )];

      const { data: series } = await supabase
        .from('serie').select('peso_kg, repeticiones')
        .in('id_entrenamiento', (semana ?? []).map(e => e.id_entrenamiento));
      const volumen = (series ?? []).reduce((a, s) => a + (s.peso_kg ?? 0) * (s.repeticiones ?? 0), 0);

      let mejorMarca = null;
      const { data: todosEntrenos } = await supabase
        .from('entrenamiento').select('id_entrenamiento')
        .eq('id_usuario', idUsuario).not('fecha_fin', 'is', null);
      const allEntrenoIds = (todosEntrenos ?? []).map(e => e.id_entrenamiento);
      if (allEntrenoIds.length > 0) {
        const { data: ms } = await supabase
          .from('serie').select('peso_kg, id_ejercicio')
          .in('id_entrenamiento', allEntrenoIds)
          .order('peso_kg', { ascending: false }).limit(1);
        if (ms?.[0]?.peso_kg) {
          const { data: ej } = await supabase.from('ejercicio').select('nombre').eq('id_ejercicio', ms[0].id_ejercicio).single();
          mejorMarca = { ejercicio: ej?.nombre ?? '–', peso: ms[0].peso_kg };
        }
      }

      const { data: pesos } = await supabase
        .from('peso').select('peso_kg, fecha, fase')
        .eq('id_usuario', idUsuario).order('fecha', { ascending: true });

      const { data: fotos } = await supabase
        .from('foto_progreso').select('url, fecha')
        .eq('id_usuario', idUsuario).order('fecha', { ascending: false }).limit(1);

      setData({
        idUsuario, nombre: usuario?.nombre ?? '', racha: usuario?.racha_actual ?? 0,
        ultimoEntreno, mejorMarca,
        pesoActual: pesos?.length ? pesos[pesos.length - 1].peso_kg : null,
        fase: pesos?.length ? pesos[pesos.length - 1].fase as Fase : null,
        pesosGrafico: (pesos ?? []).map(p => ({ fecha: p.fecha, valor: p.peso_kg })),
        entrenosSemana: semana?.length ?? 0,
        volumenSemana: Math.round(volumen),
        fotoProgreso: fotos?.[0] ?? null,
        fechasEntrenadas,
      });
    } catch (e) { console.error('Dashboard:', e); }
    finally { setLoading(false); }
  }

  async function handleSavePeso(peso: number, fase: Fase) {
    if (!data.idUsuario) return;
    await supabase.from('peso').insert({ id_usuario: data.idUsuario, peso_kg: peso, fecha: new Date().toISOString().split('T')[0], fase });
    const { data: pesos } = await supabase.from('peso').select('peso_kg, fecha, fase').eq('id_usuario', data.idUsuario).order('fecha', { ascending: true });
    setData(prev => ({
      ...prev,
      pesoActual: pesos?.length ? pesos[pesos.length - 1].peso_kg : prev.pesoActual,
      fase: pesos?.length ? pesos[pesos.length - 1].fase as Fase : prev.fase,
      pesosGrafico: (pesos ?? []).map(p => ({ fecha: p.fecha, valor: p.peso_kg })),
    }));
  }

  async function handleCheckIn() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { Alert.alert('Permiso necesario', 'Necesitamos acceso a tu galería.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'] as any, allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (result.canceled || !data.idUsuario) return;
    const uri = result.assets[0].uri;
    try {
      const fileName = `checkin_${data.idUsuario}_${Date.now()}.jpg`;
      const resp = await fetch(uri);
      const blob = await resp.blob();
      const { error: upErr } = await supabase.storage.from('avatars').upload(fileName, blob, { upsert: true, contentType: 'image/jpeg' });
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
      await supabase.from('foto_progreso').insert({ id_usuario: data.idUsuario, url: urlData.publicUrl, fecha: new Date().toISOString().split('T')[0] });
      setData(prev => ({ ...prev, fotoProgreso: { url: urlData.publicUrl, fecha: new Date().toISOString().split('T')[0] } }));
    } catch { Alert.alert('Error', 'No se pudo guardar la foto.'); }
  }

  if (loading) return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.backgroundSecondary }}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      <View style={{ flex: 1 }} onLayout={onLayout}>
        <ScrollView
          style={{ flex: 1, backgroundColor: colors.backgroundSecondary }}
          contentContainerStyle={{ paddingBottom: 36 }}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Topbar ── */}
          <View style={{ paddingTop: insets.top + 12, paddingBottom: 16 }}>
            <View style={{ paddingHorizontal: H_PAD, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <View>
                <Text style={[typography.title1, { color: colors.textPrimary }]}>
                  Home
                </Text>
                <Text style={[typography.footnote, { color: colors.textSecondary }]}>
                  {getSaludo()}, {data.nombre || 'Atleta'}
                </Text>
              </View>
              <StreakBadge racha={data.racha} />
            </View>
            <WeekSelector fechasEntrenadas={data.fechasEntrenadas} />
          </View>

          {/* ── Weight card ── */}
          <View style={{ marginHorizontal: H_PAD, marginBottom: GAP }}>
            <Pressable
              onPress={() => setShowInfo(true)}
              hitSlop={10}
              style={{ alignSelf: 'flex-start', marginBottom: 16 }}
            >
              <Ionicons name="information-circle-outline" size={24} color={colors.iconInactive} />
            </Pressable>
            <WeightChart
              data={data.pesosGrafico}
              onEdit={() => setShowAddWeight(true)}
              containerWidth={containerWidth}
              cardSize={cardSize}
            />
          </View>

          {/* ── 2×2 grid ── */}
          {cardSize > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: GAP, paddingHorizontal: H_PAD, marginBottom: GAP }}>
              <SquareCard isStreak label="Racha" value={`${data.racha} días`} accent={colors.primary} size={cardSize} />
              <SquareCard
                label="Último entreno"
                value={data.ultimoEntreno ? `${data.ultimoEntreno.duracion} min` : '–'}
                sub={data.ultimoEntreno?.nombre}
                size={cardSize}
              />
              <SquareCard
                label="Mejor marca"
                value={data.mejorMarca ? `${data.mejorMarca.peso} kg` : '–'}
                sub={data.mejorMarca?.ejercicio}
                size={cardSize}
              />
              <CheckInCard foto={data.fotoProgreso} size={cardSize} onPress={handleCheckIn} />
            </View>
          )}

          {/* ── Stats ── */}
          <View style={{ flexDirection: 'row', gap: GAP, paddingHorizontal: H_PAD, marginBottom: GAP }}>
            <View style={[{ flex: 1, borderRadius: 24, padding: 16, backgroundColor: colors.backgroundPrimary }, SHADOW]}>
              <Text style={{ fontSize: 22, fontWeight: '700', letterSpacing: -0.5, color: colors.textPrimary, marginBottom: 4 }}>{data.entrenosSemana}</Text>
              <Text style={[typography.caption1, { color: colors.textSecondary }]}>Entrenos esta semana</Text>
            </View>
            <View style={[{ flex: 1, borderRadius: 24, padding: 16, backgroundColor: colors.backgroundPrimary }, SHADOW]}>
              <Text style={{ fontSize: 22, fontWeight: '700', letterSpacing: -0.5, color: colors.textPrimary, marginBottom: 4 }}>
                {data.volumenSemana > 0 ? `${(data.volumenSemana / 1000).toFixed(1)}t` : '–'}
              </Text>
              <Text style={[typography.caption1, { color: colors.textSecondary }]}>Volumen semanal</Text>
            </View>
          </View>

          {/* ── Actions ── */}
          <View style={{ flexDirection: 'row', gap: GAP, paddingHorizontal: H_PAD }}>
            <Pressable
              style={({ pressed }) => [{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 14, borderRadius: 24, backgroundColor: colors.backgroundPrimary, opacity: pressed ? 0.7 : 1 }, SHADOW]}
              onPress={() => router.push('/(tabs)/train')}
            >
              <Ionicons name="time-outline" size={18} color={colors.textPrimary} />
              <Text style={[typography.caption1Bold, { color: colors.textPrimary }]}>Historial</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 14, borderRadius: 24, backgroundColor: colors.backgroundPrimary, opacity: pressed ? 0.7 : 1 }, SHADOW]}
              onPress={() => router.push('/(tabs)/exercises')}
            >
              <Ionicons name="search-outline" size={18} color={colors.textPrimary} />
              <Text style={[typography.caption1Bold, { color: colors.textPrimary }]}>Ejercicios</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 14, borderRadius: 24, backgroundColor: colors.primary, opacity: pressed ? 0.7 : 1 }]}
              onPress={() => router.push('/(tabs)/train')}
            >
              <Ionicons name="play-outline" size={18} color="#fff" />
              <Text style={{ fontSize: 12, fontWeight: '600', color: '#fff' }}>Entrenar</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>

      <AddWeightModal visible={showAddWeight} onClose={() => setShowAddWeight(false)} onSave={handleSavePeso} colors={colors} />

      {/* ── Info Modal ── */}
      <Modal visible={showInfo} transparent animationType="fade" onRequestClose={() => setShowInfo(false)}>
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' }}
          onPress={() => setShowInfo(false)}
        >
          <Pressable onPress={e => e.stopPropagation()}>
            <View style={{ backgroundColor: colors.backgroundPrimary, borderRadius: 24, padding: 24, marginHorizontal: 32, gap: 14, maxWidth: 340 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="information-circle" size={22} color={colors.primary} />
                <Text style={[typography.headline, { color: colors.textPrimary }]}>Acerca de esta pantalla</Text>
              </View>
              <Text style={[typography.subhead, { color: colors.textSecondary, lineHeight: 22 }]}>
                En esta pantalla puedes observar tus métricas más importantes: progreso de peso, racha de entrenamientos, mejor marca personal y fotos de seguimiento.
                {'\n\n'}
                Usa el gráfico para visualizar tu evolución y filtra por periodo para ver tendencias a lo largo del tiempo.
              </Text>
              <Pressable
                onPress={() => setShowInfo(false)}
                style={({ pressed }) => ({ alignSelf: 'flex-end', paddingVertical: 10, paddingHorizontal: 20, backgroundColor: colors.primary, borderRadius: 20, opacity: pressed ? 0.8 : 1 })}
              >
                <Text style={[typography.footnoteBold, { color: '#fff' }]}>Entendido</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </Animated.View>
  );
}
