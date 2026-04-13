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
  Image,
  KeyboardAvoidingView,
  LayoutChangeEvent,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient,
  Path,
  Polyline,
  Stop,
  Text as SvgText,
} from 'react-native-svg';

// ─── Types ────────────────────────────────────────────────────────────────────
type Fase = 'volumen' | 'definicion' | 'mantenimiento' | null;
type Range = '90D' | '6M' | '1Y' | 'ALL';
interface PesoPoint { fecha: string; valor: number; }
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
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const H_PAD = 24;
const GAP = 16;

function getSaludo() {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 19) return 'Buenas tardes';
  return 'Buenas noches';
}
function formatFecha(iso: string) {
  const d = new Date(iso);
  return `${d.getDate()} ${MESES[d.getMonth()]}`;
}

const SHADOW = Platform.select({
  ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 4 },
  android: { elevation: 2 },
  default: {},
}) as object;

// ─── Week Selector ────────────────────────────────────────────────────────────
function WeekSelector({ colors }: { colors: any }) {
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - 3 + i);
    return d;
  });
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 4 }}>
      {days.map((d, i) => {
        const isToday = d.toDateString() === today.toDateString();
        const isPast = d < today && !isToday;
        return (
          <View key={i} style={{ alignItems: 'center' }}>
            <View style={[
              { width: 34, height: 34, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
              isToday && { backgroundColor: colors.primary },
              !isToday && isPast && { borderColor: colors.primary, borderWidth: 1.5 },
              !isToday && !isPast && { borderColor: colors.border, borderWidth: 1 },
            ]}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: isToday ? '#fff' : isPast ? colors.primary : colors.textSecondary }}>
                {d.getDate()}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

// ─── Square Card ──────────────────────────────────────────────────────────────
function SquareCard({ label, value, sub, accent, colors, size, isStreak }: {
  label: string; value: string; sub?: string;
  accent?: string; colors: any; size: number; isStreak?: boolean;
}) {
  return (
    <View style={[
      { width: size, height: size, borderRadius: 24, padding: 16, justifyContent: 'flex-end', backgroundColor: colors.backgroundPrimary },
      SHADOW,
    ]}>
      {isStreak && <Text style={{ fontSize: 24, marginBottom: 4 }}>🔥</Text>}
      <Text
        style={{ fontSize: 20, fontWeight: '700', color: accent ?? colors.textPrimary }}
        numberOfLines={1} adjustsFontSizeToFit
      >
        {value}
      </Text>
      <Text style={{ fontSize: 11, fontWeight: '500', marginTop: 2, color: colors.textSecondary }}>{label}</Text>
      {sub ? <Text style={{ fontSize: 10, marginTop: 1, color: colors.textSecondary }} numberOfLines={1}>{sub}</Text> : null}
    </View>
  );
}

// ─── Check-in Card ────────────────────────────────────────────────────────────
function CheckInCard({ foto, colors, size, onPress }: {
  foto: { url: string; fecha: string } | null;
  colors: any; size: number; onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        { width: size, height: size, borderRadius: 24, overflow: 'hidden', justifyContent: 'flex-end', backgroundColor: colors.backgroundPrimary, opacity: pressed ? 0.85 : 1 },
        SHADOW,
      ]}
    >
      {foto ? (
        <>
          <Image source={{ uri: foto.url }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
          <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.45)', padding: 8 }}>
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: '600' }}>{formatFecha(foto.fecha)}</Text>
          </View>
        </>
      ) : (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <View style={{ width: 46, height: 46, borderRadius: 24, backgroundColor: colors.primary + '22', alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="camera-outline" size={24} color={colors.primary} />
          </View>
          <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textPrimary }}>Check In</Text>
          <Text style={{ fontSize: 10, color: colors.textSecondary }}>Añadir foto</Text>
        </View>
      )}
    </Pressable>
  );
}

// ─── Weight Chart ─────────────────────────────────────────────────────────────
function WeightChart({ data, colors, onEdit, containerWidth }: {
  data: PesoPoint[]; colors: any; onEdit: () => void; containerWidth: number;
}) {
  const [range, setRange] = useState<Range>('6M');
  const [tooltip, setTooltip] = useState<{ x: number; y: number; val: number; fecha: string } | null>(null);

  // Chart dimensions based on actual container width
  const chartW = containerWidth > 0 ? containerWidth - 32 : 300; // 32 = card padding (16*2)
  const chartH = 140;
  const PAD = { top: 16, bottom: 24, left: 32, right: 12 };

  const now = new Date();
  const cutoff = new Date(now);
  if (range === '90D') cutoff.setDate(now.getDate() - 90);
  else if (range === '6M') cutoff.setMonth(now.getMonth() - 6);
  else if (range === '1Y') cutoff.setFullYear(now.getFullYear() - 1);
  else cutoff.setFullYear(2000);

  const pts = data.filter(p => new Date(p.fecha) >= cutoff);
  const pesoActual = data.length > 0 ? data[data.length - 1].valor : null;

  // Empty state
  if (pts.length < 2) {
    return (
      <View style={[{ borderRadius: 24, padding: 16, backgroundColor: colors.backgroundPrimary }, SHADOW]}>
        <WeightHeader peso={pesoActual} colors={colors} onEdit={onEdit} />
        <View style={{ alignItems: 'center', paddingVertical: 24, gap: 10 }}>
          <Ionicons name="scale-outline" size={30} color={colors.iconInactive} />
          <Text style={{ fontSize: 12, textAlign: 'center', color: colors.textSecondary }}>
            Registra tu peso para ver el progreso
          </Text>
          <Pressable onPress={onEdit} style={{ backgroundColor: colors.primary, paddingHorizontal: 18, paddingVertical: 9, borderRadius: 24 }}>
            <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>Registrar peso →</Text>
          </Pressable>
        </View>
        <RangeBar range={range} setRange={setRange} colors={colors} />
      </View>
    );
  }

  const vals = pts.map(p => p.valor);
  const minV = Math.min(...vals);
  const maxV = Math.max(...vals);
  const rangeV = maxV - minV || 1;

  const toX = (i: number) => PAD.left + (i / (pts.length - 1)) * (chartW - PAD.left - PAD.right);
  const toY = (v: number) => PAD.top + (1 - (v - minV) / rangeV) * (chartH - PAD.top - PAD.bottom);

  const polyPts = pts.map((p, i) => `${toX(i)},${toY(p.valor)}`).join(' ');
  const areaPath = [`M${toX(0)},${chartH - PAD.bottom}`, `L${toX(0)},${toY(pts[0].valor)}`,
  ...pts.map((p, i) => `L${toX(i)},${toY(p.valor)}`),
  `L${toX(pts.length - 1)},${chartH - PAD.bottom}`, 'Z'].join(' ');

  const yLabels = [minV, (minV + maxV) / 2, maxV];
  const xIdxs = [...new Set([0, Math.round((pts.length - 1) / 3), Math.round(2 * (pts.length - 1) / 3), pts.length - 1])];

  return (
    <View style={[{ borderRadius: 24, padding: 16, backgroundColor: colors.backgroundPrimary }, SHADOW]}>
      <WeightHeader peso={pesoActual} colors={colors} onEdit={onEdit} />

      <Pressable
        onPress={e => {
          const tx = e.nativeEvent.locationX;
          let ci = 0, md = Infinity;
          pts.forEach((_, i) => { const d = Math.abs(toX(i) - tx); if (d < md) { md = d; ci = i; } });
          setTooltip({ x: toX(ci), y: toY(pts[ci].valor), val: pts[ci].valor, fecha: pts[ci].fecha });
        }}
        onLongPress={() => setTooltip(null)}
      >
        <Svg width={chartW} height={chartH}>
          <Defs>
            <LinearGradient id="gr" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={colors.primary} stopOpacity="0.3" />
              <Stop offset="1" stopColor={colors.primary} stopOpacity="0" />
            </LinearGradient>
          </Defs>

          {yLabels.map((v, i) => (
            <Line key={i} x1={PAD.left} y1={toY(v)} x2={chartW - PAD.right} y2={toY(v)}
              stroke={colors.border} strokeWidth="1" strokeDasharray="3,4" />
          ))}
          {yLabels.map((v, i) => (
            <SvgText key={i} x={PAD.left - 4} y={toY(v) + 4} fontSize="8" fill={colors.textSecondary} textAnchor="end">
              {Math.round(v)}
            </SvgText>
          ))}
          {xIdxs.filter(i => i < pts.length).map(idx => (
            <SvgText key={idx} x={toX(idx)} y={chartH - 4} fontSize="8" fill={colors.textSecondary} textAnchor="middle">
              {formatFecha(pts[idx].fecha)}
            </SvgText>
          ))}

          <Path d={areaPath} fill="url(#gr)" />
          <Polyline points={polyPts} fill="none" stroke={colors.primary} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

          {tooltip && (() => {
            const bx = Math.min(Math.max(tooltip.x - 44, PAD.left), chartW - PAD.right - 88);
            const by = Math.max(tooltip.y - 46, PAD.top);
            return (
              <>
                <Line x1={tooltip.x} y1={PAD.top} x2={tooltip.x} y2={chartH - PAD.bottom}
                  stroke={colors.textSecondary} strokeWidth="1" strokeDasharray="3,3" />
                <Circle cx={tooltip.x} cy={tooltip.y} r={5} fill={colors.primary} />
                <Path d={`M${bx},${by} h88 a4,4 0 0 1 4,4 v24 a4,4 0 0 1 -4,4 h-88 a4,4 0 0 1 -4,-4 v-24 a4,4 0 0 1 4,-4 Z`}
                  fill={colors.backgroundSecondary} />
                <SvgText x={bx + 44} y={by + 15} fontSize="11" fontWeight="bold" fill={colors.textPrimary} textAnchor="middle">
                  {tooltip.val} kg
                </SvgText>
                <SvgText x={bx + 44} y={by + 28} fontSize="9" fill={colors.textSecondary} textAnchor="middle">
                  {formatFecha(tooltip.fecha)}
                </SvgText>
              </>
            );
          })()}
        </Svg>
      </Pressable>

      <RangeBar range={range} setRange={setRange} colors={colors} />
      <Text style={{ fontSize: 11, fontWeight: '500', marginTop: 8, textAlign: 'center', color: colors.primary }}>
        ¡Sigue así! La consistencia es la clave 🎯
      </Text>
    </View>
  );
}

function WeightHeader({ peso, colors, onEdit }: { peso: number | null; colors: any; onEdit: () => void }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
      <View>
        <Text style={{ fontSize: 11, marginBottom: 2, color: colors.textSecondary }}>Tu peso</Text>
        <Text style={{ fontSize: 26, fontWeight: '700', letterSpacing: -0.8, color: colors.textPrimary }}>
          {peso ?? '––'}{' '}
          <Text style={{ fontSize: 15, fontWeight: '400', color: colors.textSecondary }}>kg</Text>
        </Text>
      </View>
      <Pressable onPress={onEdit}
        style={({ pressed }) => ({ width: 38, height: 38, borderRadius: 24, backgroundColor: colors.backgroundTertiary, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.6 : 1 })}>
        <Text style={{ fontSize: 15 }}>✏️</Text>
      </Pressable>
    </View>
  );
}

function RangeBar({ range, setRange, colors }: { range: Range; setRange: (r: Range) => void; colors: any }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 4, marginTop: 10 }}>
      {(['90D', '6M', '1Y', 'ALL'] as Range[]).map(r => (
        <Pressable key={r} onPress={() => setRange(r)}
          style={[{ paddingHorizontal: 14, paddingVertical: 5, borderRadius: 24 }, r === range && { backgroundColor: colors.backgroundTertiary }]}>
          <Text style={{ fontSize: 12, fontWeight: '600', color: r === range ? colors.textPrimary : colors.textSecondary }}>{r}</Text>
        </Pressable>
      ))}
    </View>
  );
}

// ─── Add Weight Modal ─────────────────────────────────────────────────────────
function AddWeightModal({ visible, onClose, onSave, colors }: {
  visible: boolean; onClose: () => void;
  onSave: (peso: number, fase: Fase) => Promise<void>;
  colors: any;
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
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 }} onPress={onClose}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ width: '100%' }}>
          <Pressable onPress={e => e.stopPropagation()}>
            <View style={{ backgroundColor: colors.backgroundPrimary, borderRadius: 24, padding: 24, alignItems: 'center' }}>
              <View style={{ width: 36, height: 4, borderRadius: 24, backgroundColor: colors.border, marginBottom: 16 }} />
              <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 20, color: colors.textPrimary }}>Registrar peso</Text>

              <View style={{ flexDirection: 'row', alignItems: 'center', borderRadius: 24, paddingHorizontal: 20, width: '100%', marginBottom: 20, backgroundColor: colors.backgroundTertiary }}>
                <TextInput
                  style={[{ flex: 1, fontSize: 38, fontWeight: '700', textAlign: 'center', paddingVertical: 10, color: colors.textPrimary }, { outlineWidth: 0 } as any]}
                  value={pesoStr} onChangeText={setPesoStr}
                  placeholder="0.0" placeholderTextColor={colors.iconInactive}
                  keyboardType="decimal-pad" autoFocus
                />
                <Text style={{ fontSize: 18, fontWeight: '500', color: colors.textSecondary }}>kg</Text>
              </View>

              <Text style={{ fontSize: 12, fontWeight: '600', marginBottom: 10, alignSelf: 'flex-start', color: colors.textSecondary }}>Fase actual</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 24, width: '100%' }}>
                {fases.map(f => (
                  <Pressable key={f.key!} onPress={() => setFase(f.key)}
                    style={[
                      { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 24, borderWidth: 1.5, gap: 4, borderColor: colors.border, backgroundColor: colors.backgroundSecondary },
                      fase === f.key && { borderColor: colors.primary, backgroundColor: colors.primary + '22' },
                    ]}>
                    <Text style={{ fontSize: 18 }}>{f.emoji}</Text>
                    <Text style={{ fontSize: 11, fontWeight: '600', textAlign: 'center', color: fase === f.key ? colors.primary : colors.textSecondary }}>{f.label}</Text>
                  </Pressable>
                ))}
              </View>

              <Pressable onPress={handleSave} disabled={saving}
                style={({ pressed }) => ({ width: '100%', paddingVertical: 15, borderRadius: 24, alignItems: 'center', marginBottom: 10, backgroundColor: colors.primary, opacity: pressed || saving ? 0.7 : 1 })}>
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
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Measure actual container width for responsive sizing
  const [containerWidth, setContainerWidth] = useState(0);
  const cardSize = containerWidth > 0 ? (containerWidth - H_PAD * 2 - GAP) / 2 : 150;

  const [loading, setLoading] = useState(true);
  const [showAddWeight, setShowAddWeight] = useState(false);
  const [data, setData] = useState<DashboardData>({
    idUsuario: null, nombre: '', racha: 0,
    ultimoEntreno: null, mejorMarca: null,
    pesoActual: null, fase: null, pesosGrafico: [],
    entrenosSemana: 0, volumenSemana: 0, fotoProgreso: null,
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

      const startWeek = new Date();
      startWeek.setDate(startWeek.getDate() - startWeek.getDay());
      startWeek.setHours(0, 0, 0, 0);
      const { data: semana } = await supabase
        .from('entrenamiento').select('id_entrenamiento')
        .eq('id_usuario', idUsuario).gte('fecha_inicio', startWeek.toISOString()).not('fecha_fin', 'is', null);

      const { data: series } = await supabase
        .from('serie').select('peso_kg, repeticiones')
        .in('id_entrenamiento', (semana ?? []).map(e => e.id_entrenamiento));
      const volumen = (series ?? []).reduce((a, s) => a + (s.peso_kg ?? 0) * (s.repeticiones ?? 0), 0);

      let mejorMarca = null;
      if (entrenos?.[0]) {
        const { data: ms } = await supabase
          .from('serie').select('peso_kg, id_ejercicio')
          .eq('id_entrenamiento', entrenos[0].id_entrenamiento)
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
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.8 });
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

  const today = new Date();
  const todayStr = `${DIAS[today.getDay()]}, ${today.getDate()} ${MESES[today.getMonth()]}`;

  if (loading) return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.backgroundSecondary }}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      {/* onLayout on the root view captures the real available width */}
      <View style={{ flex: 1 }} onLayout={onLayout}>
        <ScrollView
          style={{ flex: 1, backgroundColor: colors.backgroundSecondary }}
          contentContainerStyle={{ paddingBottom: 36 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ paddingHorizontal: H_PAD, paddingTop: 16, paddingBottom: 16, backgroundColor: colors.backgroundSecondary }}>

            {/* Week row: día encima del círculo */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              {Array.from({ length: 7 }, (_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - 3 + i);
                const isToday = d.toDateString() === new Date().toDateString();
                const isPast = d < new Date() && !isToday;
                const dayName = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][d.getDay()];
                return (
                  <View key={i} style={{ alignItems: 'center', gap: 6 }}>
                    <Text style={{ fontSize: 11, color: isToday ? colors.textPrimary : colors.textSecondary, fontWeight: isToday ? '600' : '400' }}>
                      {dayName}
                    </Text>
                    <View style={[
                      { width: 36, height: 36, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
                      isToday && { backgroundColor: colors.textPrimary },
                      !isToday && isPast && { borderColor: colors.primary, borderWidth: 1.5 },
                      !isToday && !isPast && { backgroundColor: colors.backgroundPrimary },
                    ]}>
                      <Text style={{ fontSize: 13, fontWeight: '600', color: isToday ? colors.backgroundSecondary : isPast ? colors.primary : colors.textSecondary }}>
                        {d.getDate()}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Weight chart */}
          <View style={{ marginHorizontal: H_PAD, marginBottom: 16 }}>
            <WeightChart data={data.pesosGrafico} colors={colors} onEdit={() => setShowAddWeight(true)} containerWidth={containerWidth} />
          </View>

          {/* 2×2 grid — uses measured cardSize */}
          {cardSize > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: GAP, paddingHorizontal: H_PAD, marginBottom: 12 }}>
              <SquareCard isStreak label="Racha" value={`${data.racha} días`} accent={colors.primary} colors={colors} size={cardSize} />
              <SquareCard
                label="Último entreno"
                value={data.ultimoEntreno ? `${data.ultimoEntreno.duracion} min` : '–'}
                sub={data.ultimoEntreno?.nombre}
                colors={colors} size={cardSize}
              />
              <SquareCard
                label="Mejor marca"
                value={data.mejorMarca ? `${data.mejorMarca.peso} kg` : '–'}
                sub={data.mejorMarca?.ejercicio}
                colors={colors} size={cardSize}
              />
              <CheckInCard foto={data.fotoProgreso} colors={colors} size={cardSize} onPress={handleCheckIn} />
            </View>
          )}

          {/* Stats */}
          <View style={{ flexDirection: 'row', gap: GAP, paddingHorizontal: H_PAD, marginBottom: 12 }}>
            <View style={[{ flex: 1, borderRadius: 24, padding: 16, backgroundColor: colors.backgroundPrimary }, SHADOW]}>
              <Text style={{ fontSize: 22, fontWeight: '700', letterSpacing: -0.5, color: colors.textPrimary, marginBottom: 4 }}>{data.entrenosSemana}</Text>
              <Text style={{ fontSize: 11, color: colors.textSecondary }}>Entrenos esta semana</Text>
            </View>
            <View style={[{ flex: 1, borderRadius: 24, padding: 16, backgroundColor: colors.backgroundPrimary }, SHADOW]}>
              <Text style={{ fontSize: 22, fontWeight: '700', letterSpacing: -0.5, color: colors.textPrimary, marginBottom: 4 }}>
                {data.volumenSemana > 0 ? `${(data.volumenSemana / 1000).toFixed(1)}t` : '–'}
              </Text>
              <Text style={{ fontSize: 11, color: colors.textSecondary }}>Volumen semanal</Text>
            </View>
          </View>

          {/* Actions */}
          <View style={{ flexDirection: 'row', gap: GAP, paddingHorizontal: H_PAD }}>
            <Pressable style={({ pressed }) => [{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 14, borderRadius: 24, backgroundColor: colors.backgroundPrimary, opacity: pressed ? 0.7 : 1 }, SHADOW]}
              onPress={() => router.push('/(tabs)/train')}>
              <Ionicons name="time-outline" size={18} color={colors.textPrimary} />
              <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textPrimary }}>Historial</Text>
            </Pressable>
            <Pressable style={({ pressed }) => [{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 14, borderRadius: 24, backgroundColor: colors.backgroundPrimary, opacity: pressed ? 0.7 : 1 }, SHADOW]}
              onPress={() => router.push('/(tabs)/exercises')}>
              <Ionicons name="search-outline" size={18} color={colors.textPrimary} />
              <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textPrimary }}>Ejercicios</Text>
            </Pressable>
            <Pressable style={({ pressed }) => [{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 14, borderRadius: 24, backgroundColor: colors.primary, opacity: pressed ? 0.7 : 1 }]}
              onPress={() => router.push('/(tabs)/train')}>
              <Ionicons name="play-outline" size={18} color="#fff" />
              <Text style={{ fontSize: 12, fontWeight: '600', color: '#fff' }}>Entrenar</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>

      <AddWeightModal visible={showAddWeight} onClose={() => setShowAddWeight(false)} onSave={handleSavePeso} colors={colors} />
    </Animated.View>
  );
}