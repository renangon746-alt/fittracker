import { useTheme } from '@/context/ThemeContext';
import { useTranslation } from '@/context/LanguageContext';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  KeyboardAvoidingView,
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

const { width: SCREEN_WIDTH } = Dimensions.get('window');
// Two cards per row with padding and gap
const CARD_GAP = 10;
const H_PAD    = 16;
const SQUARE   = (SCREEN_WIDTH - H_PAD * 2 - CARD_GAP) / 2;

// ─── Types ───────────────────────────────────────────────────────────────────
type Fase  = 'volumen' | 'definicion' | 'mantenimiento' | null;
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
function getSaludo(t: (key: string) => string) {
  const h = new Date().getHours();
  if (h < 12) return t('greeting_morning');
  if (h < 19) return t('greeting_afternoon');
  return t('greeting_evening');
}
function formatFecha(iso: string, language: string) {
  const d = new Date(iso);
  return new Intl.DateTimeFormat(language, {
    day: 'numeric',
    month: 'short',
  }).format(d);
}

// ─── Week Selector ────────────────────────────────────────────────────────────
function WeekSelector({ colors }: { colors: any }) {
  const today = new Date();
  const days  = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - 3 + i);
    return d;
  });
  return (
    <View style={wStyles.row}>
      {days.map((d, i) => {
        const isToday = d.toDateString() === today.toDateString();
        const isPast  = d < today && !isToday;
        return (
          <View key={i} style={wStyles.col}>
            <View style={[
              wStyles.circle,
              isToday && { backgroundColor: colors.primary },
              !isToday && isPast  && { borderColor: colors.primary, borderWidth: 1.5 },
              !isToday && !isPast && { borderColor: colors.border,  borderWidth: 1 },
            ]}>
              <Text style={[wStyles.num, { color: isToday ? '#fff' : isPast ? colors.primary : colors.textSecondary }]}>
                {d.getDate()}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}
const wStyles = StyleSheet.create({
  row:    { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 4 },
  col:    { alignItems: 'center' },
  circle: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  num:    { fontSize: 13, fontWeight: '600' },
});

// ─── Square Card ──────────────────────────────────────────────────────────────
function SquareCard({ label, value, sub, accent, colors, isStreak }: {
  label: string; value: string; sub?: string;
  accent?: string; colors: any; isStreak?: boolean;
}) {
  return (
    <View style={[cStyles.card, { backgroundColor: colors.backgroundPrimary, width: SQUARE, height: SQUARE }]}>
      {isStreak && <Text style={cStyles.fire}>🔥</Text>}
      <Text style={[cStyles.value, { color: accent ?? colors.textPrimary }]} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text style={[cStyles.label, { color: colors.textSecondary }]}>{label}</Text>
      {sub ? <Text style={[cStyles.sub, { color: colors.textSecondary }]} numberOfLines={1}>{sub}</Text> : null}
    </View>
  );
}
const cStyles = StyleSheet.create({
  card:  { borderRadius: 16, padding: 14, justifyContent: 'flex-end' },
  fire:  { fontSize: 24, marginBottom: 4 },
  value: { fontSize: 20, fontWeight: '700', letterSpacing: -0.4 },
  label: { fontSize: 11, fontWeight: '500', marginTop: 2 },
  sub:   { fontSize: 10, marginTop: 1 },
});

// ─── Check-in Card ────────────────────────────────────────────────────────────
function CheckInCard({ foto, colors, onPress }: {
  foto: { url: string; fecha: string } | null;
  colors: any;
  onPress: () => void;
}) {
  const { t, i18n } = useTranslation();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        ciStyles.card,
        { backgroundColor: colors.backgroundPrimary, width: SQUARE, height: SQUARE, opacity: pressed ? 0.85 : 1 },
      ]}
    >
      {foto ? (
        <>
          <Image source={{ uri: foto.url }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
          <View style={ciStyles.overlay}>
            <Text style={ciStyles.date}>{formatFecha(foto.fecha, i18n.language)}</Text>
          </View>
        </>
      ) : (
        <View style={ciStyles.empty}>
          <View style={[ciStyles.iconWrap, { backgroundColor: colors.primary + '22' }]}>
            <Ionicons name="camera-outline" size={24} color={colors.primary} />
          </View>
          <Text style={[ciStyles.label, { color: colors.textPrimary }]}>{t('check_in')}</Text>
          <Text style={[ciStyles.sub, { color: colors.textSecondary }]}>{t('add_photo')}</Text>
        </View>
      )}
    </Pressable>
  );
}
const ciStyles = StyleSheet.create({
  card:    { borderRadius: 16, overflow: 'hidden', justifyContent: 'flex-end' },
  overlay: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.45)', padding: 8 },
  date:    { color: '#fff', fontSize: 11, fontWeight: '600' },
  empty:   { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6 },
  iconWrap:{ width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  label:   { fontSize: 13, fontWeight: '600' },
  sub:     { fontSize: 10 },
});

// ─── Weight Chart (Cal AI style, primary color) ───────────────────────────────
function WeightChart({ data, colors, onEdit }: {
  data: PesoPoint[]; colors: any; onEdit: () => void;
}) {
  const { t, i18n } = useTranslation();
  const [range,   setRange]   = useState<Range>('6M');
  const [tooltip, setTooltip] = useState<{ x: number; y: number; val: number; fecha: string } | null>(null);

  const chartW = SCREEN_WIDTH - H_PAD * 2 - 32; // card padding x2
  const chartH = 140;
  const PAD    = { top: 16, bottom: 24, left: 32, right: 12 };

  const now    = new Date();
  const cutoff = new Date(now);
  if      (range === '90D') cutoff.setDate(now.getDate() - 90);
  else if (range === '6M')  cutoff.setMonth(now.getMonth() - 6);
  else if (range === '1Y')  cutoff.setFullYear(now.getFullYear() - 1);
  else                      cutoff.setFullYear(2000);

  const pts = data.filter(p => new Date(p.fecha) >= cutoff);

  const pesoActual = data.length > 0 ? data[data.length - 1].valor : null;

  if (pts.length < 2) {
    return (
      <View style={[wc.card, { backgroundColor: colors.backgroundPrimary }]}>
        <WeightHeader peso={pesoActual} colors={colors} onEdit={onEdit} />
        <View style={wc.empty}>
          <Ionicons name="scale-outline" size={30} color={colors.iconInactive} />
          <Text style={[wc.emptyTxt, { color: colors.textSecondary }]}>{t('weight_progress_hint')}</Text>
          <Pressable onPress={onEdit} style={[wc.logBtn, { backgroundColor: colors.primary }]}> 
            <Text style={wc.logBtnTxt}>{t('register_weight_button')}</Text>
          </Pressable>
        </View>
        <RangeBar range={range} setRange={setRange} colors={colors} />
      </View>
    );
  }

  const vals   = pts.map(p => p.valor);
  const minV   = Math.min(...vals);
  const maxV   = Math.max(...vals);
  const rangeV = maxV - minV || 1;

  const toX = (i: number) => PAD.left + (i / (pts.length - 1)) * (chartW - PAD.left - PAD.right);
  const toY = (v: number) => PAD.top  + (1 - (v - minV) / rangeV) * (chartH - PAD.top - PAD.bottom);

  const polyPts = pts.map((p, i) => `${toX(i)},${toY(p.valor)}`).join(' ');
  const areaPath = [
    `M${toX(0)},${chartH - PAD.bottom}`,
    `L${toX(0)},${toY(pts[0].valor)}`,
    ...pts.map((p, i) => `L${toX(i)},${toY(p.valor)}`),
    `L${toX(pts.length - 1)},${chartH - PAD.bottom}`,
    'Z',
  ].join(' ');

  const yLabels = [minV, (minV + maxV) / 2, maxV];
  const xIdxs   = [...new Set([0, ...Array.from({ length: 3 }, (_, i) => Math.round((i + 1) * (pts.length - 1) / 4)), pts.length - 1])];

  return (
    <View style={[wc.card, { backgroundColor: colors.backgroundPrimary }]}>
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

          {/* Grid */}
          {yLabels.map((v, i) => (
            <Line key={i} x1={PAD.left} y1={toY(v)} x2={chartW - PAD.right} y2={toY(v)}
              stroke={colors.border} strokeWidth="1" strokeDasharray="3,4" />
          ))}

          {/* Y labels */}
          {yLabels.map((v, i) => (
            <SvgText key={i} x={PAD.left - 4} y={toY(v) + 4}
              fontSize="8" fill={colors.textSecondary} textAnchor="end">
              {Math.round(v)}
            </SvgText>
          ))}

          {/* X labels */}
          {xIdxs.map(idx => (
            <SvgText key={idx} x={toX(idx)} y={chartH - 4}
              fontSize="8" fill={colors.textSecondary} textAnchor="middle">
              {formatFecha(pts[idx].fecha, i18n.language)}
            </SvgText>
          ))}

          {/* Area */}
          <Path d={areaPath} fill="url(#gr)" />

          {/* Line */}
          <Polyline points={polyPts} fill="none"
            stroke={colors.primary} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

          {/* Tooltip */}
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
                <SvgText x={bx + 44} y={by + 15} fontSize="11" fontWeight="bold"
                  fill={colors.textPrimary} textAnchor="middle">
                  {tooltip.val} {t('kg')}
                </SvgText>
                <SvgText x={bx + 44} y={by + 28} fontSize="9"
                  fill={colors.textSecondary} textAnchor="middle">
                  {formatFecha(tooltip.fecha, i18n.language)}
                </SvgText>
              </>
            );
          })()}
        </Svg>
      </Pressable>

      <RangeBar range={range} setRange={setRange} colors={colors} />
      <Text style={[wc.motiv, { color: colors.primary }]}> 
        {t('motivation_text')}
      </Text>
    </View>
  );
}

function WeightHeader({ peso, colors, onEdit }: { peso: number | null; colors: any; onEdit: () => void }) {
  const { t } = useTranslation();
  return (
    <View style={wc.header}>
      <View>
        <Text style={[wc.wLabel, { color: colors.textSecondary }]}>{t('your_weight')}</Text>
        <Text style={[wc.wVal, { color: colors.textPrimary }]}> 
          {peso ?? '––'}{' '}
          <Text style={[wc.wUnit, { color: colors.textSecondary }]}>{t('kg')}</Text>
        </Text>
      </View>
      <Pressable onPress={onEdit}
        style={({ pressed }) => [wc.editBtn, { backgroundColor: colors.backgroundTertiary, opacity: pressed ? 0.6 : 1 }]}>
        <Text style={{ fontSize: 15 }}>✏️</Text>
      </Pressable>
    </View>
  );
}

function RangeBar({ range, setRange, colors }: { range: Range; setRange: (r: Range) => void; colors: any }) {
  return (
    <View style={wc.rangeRow}>
      {(['90D','6M','1Y','ALL'] as Range[]).map(r => (
        <Pressable key={r} onPress={() => setRange(r)}
          style={[wc.rangeBtn, r === range && { backgroundColor: colors.backgroundTertiary }]}>
          <Text style={[wc.rangeTxt, { color: r === range ? colors.textPrimary : colors.textSecondary }]}>{r}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const wc = StyleSheet.create({
  card:     { borderRadius: 16, padding: 16 },
  header:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  wLabel:   { fontSize: 11, marginBottom: 2 },
  wVal:     { fontSize: 26, fontWeight: '700', letterSpacing: -0.8 },
  wUnit:    { fontSize: 15, fontWeight: '400' },
  editBtn:  { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  empty:    { alignItems: 'center', paddingVertical: 24, gap: 8 },
  emptyTxt: { fontSize: 12, textAlign: 'center' },
  logBtn:   { paddingHorizontal: 18, paddingVertical: 9, borderRadius: 20, marginTop: 2 },
  logBtnTxt:{ color: '#fff', fontSize: 13, fontWeight: '600' },
  rangeRow: { flexDirection: 'row', justifyContent: 'center', gap: 4, marginTop: 10 },
  rangeBtn: { paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20 },
  rangeTxt: { fontSize: 12, fontWeight: '600' },
  motiv:    { fontSize: 11, fontWeight: '500', marginTop: 8, textAlign: 'center' },
});

// ─── Add Weight Modal ─────────────────────────────────────────────────────────
function AddWeightModal({ visible, onClose, onSave, colors }: {
  visible: boolean; onClose: () => void;
  onSave: (peso: number, fase: Fase) => Promise<void>;
  colors: any;
}) {
  const { t } = useTranslation();
  const [pesoStr, setPesoStr] = useState('');
  const [fase,    setFase]    = useState<Fase>(null);
  const [saving,  setSaving]  = useState(false);

  const fases: { key: Fase; label: string; emoji: string }[] = [
    { key: 'volumen',        label: t('bulk'),        emoji: '💪' },
    { key: 'definicion',     label: t('definition'),  emoji: '🔥' },
    { key: 'mantenimiento',  label: t('maintenance'), emoji: '⚖️' },
  ];

  async function handleSave() {
    const val = parseFloat(pesoStr.replace(',', '.'));
    if (!val || val < 20 || val > 400) { Alert.alert(t('error'), t('invalid_weight')); return; }
    setSaving(true);
    await onSave(val, fase);
    setSaving(false);
    setPesoStr(''); setFase(null); onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={m.overlay} onPress={onClose}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <Pressable onPress={e => e.stopPropagation()}>
            <View style={[m.card, { backgroundColor: colors.backgroundPrimary }]}>
              <View style={[m.handle, { backgroundColor: colors.border }]} />
              <Text style={[m.title, { color: colors.textPrimary }]}>{t('register_weight')}</Text>

              <View style={[m.inputWrap, { backgroundColor: colors.backgroundTertiary }]}>
                <TextInput
                  style={[m.input, { color: colors.textPrimary }] as any}
                  value={pesoStr} onChangeText={setPesoStr}
                  placeholder="0.0" placeholderTextColor={colors.iconInactive}
                  keyboardType="decimal-pad" autoFocus
                />
                <Text style={[m.unit, { color: colors.textSecondary }]}>{t('kg')}</Text>
              </View>

              <Text style={[m.faseTitle, { color: colors.textSecondary }]}>{t('current_phase')}</Text>
              <View style={m.faseRow}>
                {fases.map(f => (
                  <Pressable key={f.key!} onPress={() => setFase(f.key)}
                    style={[m.chip,
                      { borderColor: colors.border, backgroundColor: colors.backgroundSecondary },
                      fase === f.key && { borderColor: colors.primary, backgroundColor: colors.primary + '22' },
                    ]}>
                    <Text style={m.chipEmoji}>{f.emoji}</Text>
                    <Text style={[m.chipLabel, { color: fase === f.key ? colors.primary : colors.textSecondary }]}>
                      {f.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Pressable onPress={handleSave} disabled={saving}
                style={({ pressed }) => [m.save, { backgroundColor: colors.primary, opacity: pressed || saving ? 0.7 : 1 }]}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={m.saveTxt}>{t('save')}</Text>}
              </Pressable>
              <Pressable onPress={onClose} style={m.cancel}>
                <Text style={[m.cancelTxt, { color: colors.textSecondary }]}>{t('cancel')}</Text>
              </Pressable>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}
const m = StyleSheet.create({
  overlay:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  card:      { width: '100%', borderRadius: 24, padding: 24, alignItems: 'center' },
  handle:    { width: 36, height: 4, borderRadius: 2, marginBottom: 16 },
  title:     { fontSize: 18, fontWeight: '700', marginBottom: 20 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, paddingHorizontal: 20, width: '100%', marginBottom: 20 },
  input:     { flex: 1, fontSize: 38, fontWeight: '700', textAlign: 'center', paddingVertical: 10, outlineWidth: 0 },
  unit:      { fontSize: 18, fontWeight: '500' },
  faseTitle: { fontSize: 12, fontWeight: '600', marginBottom: 10, alignSelf: 'flex-start' },
  faseRow:   { flexDirection: 'row', gap: 8, marginBottom: 24, width: '100%' },
  chip:      { flex: 1, flexDirection: 'column', alignItems: 'center', paddingVertical: 10, borderRadius: 14, borderWidth: 1.5, gap: 4 },
  chipEmoji: { fontSize: 18 },
  chipLabel: { fontSize: 11, fontWeight: '600', textAlign: 'center' },
  save:      { width: '100%', paddingVertical: 15, borderRadius: 14, alignItems: 'center', marginBottom: 10 },
  saveTxt:   { color: '#fff', fontSize: 16, fontWeight: '700' },
  cancel:    { paddingVertical: 8 },
  cancelTxt: { fontSize: 14 },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router     = useRouter();
  const fadeAnim   = useRef(new Animated.Value(0)).current;

  const [loading,        setLoading]        = useState(true);
  const [showAddWeight,  setShowAddWeight]  = useState(false);
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
        ultimoEntreno = { nombre: rutina?.nombre ?? t('workouts'), duracion: entrenos[0].duracion_min ?? 0 };
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
        pesoActual:    pesos?.length ? pesos[pesos.length - 1].peso_kg : null,
        fase:          pesos?.length ? pesos[pesos.length - 1].fase as Fase : null,
        pesosGrafico:  (pesos ?? []).map(p => ({ fecha: p.fecha, valor: p.peso_kg })),
        entrenosSemana: semana?.length ?? 0,
        volumenSemana:  Math.round(volumen),
        fotoProgreso:   fotos?.[0] ?? null,
      });
    } catch (e) { console.error('Dashboard:', e); }
    finally { setLoading(false); }
  }

  async function handleSavePeso(peso: number, fase: Fase) {
    if (!data.idUsuario) return;
    await supabase.from('peso').insert({
      id_usuario: data.idUsuario,
      peso_kg: peso,
      fecha: new Date().toISOString().split('T')[0],
      fase,
    });
    const { data: pesos } = await supabase
      .from('peso').select('peso_kg, fecha, fase')
      .eq('id_usuario', data.idUsuario).order('fecha', { ascending: true });
    setData(prev => ({
      ...prev,
      pesoActual:   pesos?.length ? pesos[pesos.length - 1].peso_kg : prev.pesoActual,
      fase:         pesos?.length ? pesos[pesos.length - 1].fase as Fase : prev.fase,
      pesosGrafico: (pesos ?? []).map(p => ({ fecha: p.fecha, valor: p.peso_kg })),
    }));
  }

  async function handleCheckIn() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { Alert.alert(t('permission_needed'), t('gallery_permission')); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [1, 1], quality: 0.8,
    });
    if (result.canceled || !data.idUsuario) return;
    const uri = result.assets[0].uri;
    try {
      const fileName = `checkin_${data.idUsuario}_${Date.now()}.jpg`;
      const resp     = await fetch(uri);
      const blob     = await resp.blob();
      const { error: upErr } = await supabase.storage.from('avatars').upload(fileName, blob, { upsert: true, contentType: 'image/jpeg' });
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
      const { error: insErr } = await supabase.from('foto_progreso').insert({
        id_usuario: data.idUsuario,
        url: urlData.publicUrl,
        fecha: new Date().toISOString().split('T')[0],
      });
      if (insErr) throw insErr;
      setData(prev => ({ ...prev, fotoProgreso: { url: urlData.publicUrl, fecha: new Date().toISOString().split('T')[0] } }));
    } catch { Alert.alert(t('error'), t('could_not_save_photo')); }
  }

  if (loading) return (
    <View style={[s.centered, { backgroundColor: colors.backgroundSecondary }]}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );

  const shadow = Platform.select({
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 4 },
    android: { elevation: 2 },
    default: {},
  });

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.backgroundSecondary }}
        contentContainerStyle={s.container}
        showsVerticalScrollIndicator={false}
      >

        {/* Week */}
        <View style={[s.weekCard, shadow]}>
          <WeekSelector colors={colors} />
        </View>

        {/* Welcome */}
        <View style={s.welcome}>
          <View>
            <Text style={[s.greeting, { color: colors.textSecondary }]}>{getSaludo(t)}</Text>
            <Text style={[s.userName, { color: colors.textPrimary }]}>{data.nombre || t('athlete')} 👋</Text>
          </View>
          <View style={[s.rachaBadge, { backgroundColor: colors.primary }]}>
            <Text style={s.rachaFire}>🔥</Text>
            <Text style={s.rachaNum}>{data.racha}</Text>
          </View>
        </View>

        {/* 2x2 Square grid */}
        <View style={s.grid}>
          <SquareCard
            isStreak label={t('streak')} value={`${data.racha} ${t('days')}`}
            accent={colors.primary} colors={colors}
          />
          <SquareCard
            label={t('last_workout')}
            value={data.ultimoEntreno ? `${data.ultimoEntreno.duracion} ${t('min')}` : '–'}
            sub={data.ultimoEntreno?.nombre}
            colors={colors}
          />
          <SquareCard
            label={t('best_mark')}
            value={data.mejorMarca ? `${data.mejorMarca.peso} ${t('kg')}` : '–'}
            sub={data.mejorMarca?.ejercicio}
            colors={colors}
          />
          <CheckInCard foto={data.fotoProgreso} colors={colors} onPress={handleCheckIn} />
        </View>

        {/* Weight graph */}
        <View style={[s.section, shadow]}>
          <WeightChart data={data.pesosGrafico} colors={colors} onEdit={() => setShowAddWeight(true)} />
        </View>

        {/* Stats row */}
        <View style={s.statsRow}>
          <View style={[s.statCard, { backgroundColor: colors.backgroundPrimary }, shadow]}>
            <Text style={[s.statVal, { color: colors.textPrimary }]}>{data.entrenosSemana}</Text>
            <Text style={[s.statLbl, { color: colors.textSecondary }]}>{t('workouts_this_week')}</Text>
          </View>
          <View style={[s.statCard, { backgroundColor: colors.backgroundPrimary }, shadow]}>
            <Text style={[s.statVal, { color: colors.textPrimary }]}>
              {data.volumenSemana > 0 ? `${(data.volumenSemana / 1000).toFixed(1)}t` : '–'}
            </Text>
            <Text style={[s.statLbl, { color: colors.textSecondary }]}>{t('weekly_volume')}</Text>
          </View>
        </View>

        {/* Quick actions */}
        <View style={s.actions}>
          <Pressable style={({ pressed }) => [s.actionBtn, { backgroundColor: colors.backgroundPrimary, opacity: pressed ? 0.7 : 1 }, shadow]}
            onPress={() => router.push('/(tabs)/train')}>
            <Ionicons name="time-outline" size={18} color={colors.textPrimary} />
            <Text style={[s.actionTxt, { color: colors.textPrimary }]}>{t('history')}</Text>
          </Pressable>
          <Pressable style={({ pressed }) => [s.actionBtn, { backgroundColor: colors.backgroundPrimary, opacity: pressed ? 0.7 : 1 }, shadow]}
            onPress={() => router.push('/(tabs)/exercises')}>
            <Ionicons name="search-outline" size={18} color={colors.textPrimary} />
            <Text style={[s.actionTxt, { color: colors.textPrimary }]}>{t('exercises')}</Text>
          </Pressable>
          <Pressable style={({ pressed }) => [s.actionBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.7 : 1 }]}
            onPress={() => router.push('/(tabs)/train')}>
            <Ionicons name="play-outline" size={18} color="#fff" />
            <Text style={[s.actionTxt, { color: '#fff' }]}>{t('train')}</Text>
          </Pressable>
        </View>
      </ScrollView>

      <AddWeightModal
        visible={showAddWeight}
        onClose={() => setShowAddWeight(false)}
        onSave={handleSavePeso}
        colors={colors}
      />
    </Animated.View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  centered:   { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container:  { paddingBottom: 36 },
  welcome:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: H_PAD, paddingBottom: 10 },
  greeting:   { fontSize: 12, marginBottom: 1 },
  userName:   { fontSize: 20, fontWeight: '700', letterSpacing: -0.4 },
  date:       { fontSize: 11, marginTop: 1 },
  rachaBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  rachaFire:  { fontSize: 13 },
  rachaNum:   { color: '#fff', fontWeight: '700', fontSize: 14 },
  weekCard:   { marginHorizontal: H_PAD, borderRadius: 14, paddingVertical: 8, paddingHorizontal: 4, marginBottom: 12 },
  grid:       { flexDirection: 'row', flexWrap: 'wrap', gap: CARD_GAP, paddingHorizontal: H_PAD, marginBottom: 12 },
  section:    { marginHorizontal: H_PAD, borderRadius: 16, marginBottom: 12, overflow: 'hidden' },
  statsRow:   { flexDirection: 'row', gap: CARD_GAP, paddingHorizontal: H_PAD, marginBottom: 12 },
  statCard:   { flex: 1, borderRadius: 16, padding: 16 },
  statVal:    { fontSize: 22, fontWeight: '700', letterSpacing: -0.5, marginBottom: 4 },
  statLbl:    { fontSize: 11 },
  actions:    { flexDirection: 'row', gap: CARD_GAP, paddingHorizontal: H_PAD },
  actionBtn:  { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 14, borderRadius: 14 },
  actionTxt:  { fontSize: 12, fontWeight: '600' },
});
