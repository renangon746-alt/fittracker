import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
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

export type PesoPoint = { fecha: string; valor: number };
type Range = '90D' | '6M' | '1Y' | 'ALL';

const H_PAD = 24;
const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const SHADOW = Platform.select({
  ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 4 },
  android: { elevation: 2 },
  default: {},
}) as object;

function formatFecha(iso: string) {
  const d = new Date(iso);
  return `${d.getDate()} ${MESES[d.getMonth()]}`;
}

type Props = {
  data: PesoPoint[];
  onEdit: () => void;
  containerWidth: number;
  cardSize: number;
};

export default function WeightChart({ data, onEdit, containerWidth, cardSize }: Props) {
  const { colors } = useTheme();
  const [range, setRange] = useState<Range>('6M');
  const [tooltip, setTooltip] = useState<{ x: number; y: number; val: number; fecha: string } | null>(null);

  const chartW = containerWidth > 0 ? containerWidth - H_PAD * 2 - 32 : 280;
  const chartH = Math.max(60, cardSize - 80);
  const PAD = { top: 8, bottom: 16, left: 26, right: 6 };

  const now = new Date();
  const cutoff = new Date(now);
  if (range === '90D') cutoff.setDate(now.getDate() - 90);
  else if (range === '6M') cutoff.setMonth(now.getMonth() - 6);
  else if (range === '1Y') cutoff.setFullYear(now.getFullYear() - 1);
  else cutoff.setFullYear(2000);

  const pts = data.filter(p => new Date(p.fecha) >= cutoff);
  const pesoActual = data.length > 0 ? data[data.length - 1].valor : null;

  const emptyContent = (
    <View style={{ alignItems: 'center', paddingVertical: 16, gap: 8 }}>
      <Ionicons name="scale-outline" size={28} color={colors.iconInactive} />
      <Text style={{ fontSize: 12, textAlign: 'center', color: colors.textSecondary }}>
        Registra tu peso para ver el progreso
      </Text>
      <Pressable
        onPress={onEdit}
        style={{ backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 24 }}
      >
        <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>Registrar peso →</Text>
      </Pressable>
    </View>
  );

  let chartContent = emptyContent;

  if (pts.length >= 2) {
    const vals = pts.map(p => p.valor);
    const minV = Math.min(...vals);
    const maxV = Math.max(...vals);
    const rangeV = maxV - minV || 1;
    const toX = (i: number) => PAD.left + (i / (pts.length - 1)) * (chartW - PAD.left - PAD.right);
    const toY = (v: number) => PAD.top + (1 - (v - minV) / rangeV) * (chartH - PAD.top - PAD.bottom);
    const polyPts = pts.map((p, i) => `${toX(i)},${toY(p.valor)}`).join(' ');
    const areaPath = [
      `M${toX(0)},${chartH - PAD.bottom}`,
      `L${toX(0)},${toY(pts[0].valor)}`,
      ...pts.map((p, i) => `L${toX(i)},${toY(p.valor)}`),
      `L${toX(pts.length - 1)},${chartH - PAD.bottom}`, 'Z',
    ].join(' ');
    const yLabels = [minV, (minV + maxV) / 2, maxV];
    const xIdxs = [...new Set([0, Math.round((pts.length - 1) / 3), Math.round(2 * (pts.length - 1) / 3), pts.length - 1])];

    chartContent = (
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
            <SvgText key={idx} x={toX(idx)} y={chartH - 2} fontSize="8" fill={colors.textSecondary} textAnchor="middle">
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
                <Circle cx={tooltip.x} cy={tooltip.y} r={4} fill={colors.primary} />
                <Path d={`M${bx},${by} h88 a4,4 0 0 1 4,4 v22 a4,4 0 0 1 -4,4 h-88 a4,4 0 0 1 -4,-4 v-22 a4,4 0 0 1 4,-4 Z`}
                  fill={colors.backgroundSecondary} />
                <SvgText x={bx + 44} y={by + 14} fontSize="11" fontWeight="bold" fill={colors.textPrimary} textAnchor="middle">
                  {tooltip.val} kg
                </SvgText>
                <SvgText x={bx + 44} y={by + 26} fontSize="9" fill={colors.textSecondary} textAnchor="middle">
                  {formatFecha(tooltip.fecha)}
                </SvgText>
              </>
            );
          })()}
        </Svg>
      </Pressable>
    );
  }

  return (
    <View style={[{ borderRadius: 24, padding: 14, backgroundColor: colors.backgroundPrimary }, SHADOW]}>
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <View>
          <Text style={{ fontSize: 11, color: colors.textSecondary, marginBottom: 1 }}>Tu peso</Text>
          <Text style={{ fontSize: 24, fontWeight: '700', letterSpacing: -0.8, color: colors.textPrimary }}>
            {pesoActual ?? '––'}{' '}
            <Text style={{ fontSize: 14, fontWeight: '400', color: colors.textSecondary }}>kg</Text>
          </Text>
        </View>
        <Pressable
          onPress={onEdit}
          style={({ pressed }) => ({
            width: 34, height: 34, borderRadius: 17,
            backgroundColor: colors.backgroundSecondary,
            alignItems: 'center', justifyContent: 'center',
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <Ionicons name="pencil" size={16} color={colors.primary} />
        </Pressable>
      </View>

      {chartContent}

      {pts.length >= 2 && (
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 32, marginTop: 14 }}>
          {(['90D', '6M', '1Y', 'ALL'] as Range[]).map(r => (
            <Pressable
              key={r}
              onPress={() => { setRange(r); setTooltip(null); }}
              style={[
                { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
                r === range && { backgroundColor: colors.backgroundSecondary },
              ]}
            >
              <Text style={{ fontSize: 11, fontWeight: '600', color: r === range ? colors.textPrimary : colors.textSecondary }}>
                {r}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      

    </View>
  );
}
