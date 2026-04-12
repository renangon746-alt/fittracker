import { graphTheme } from '@/app/utils/graphTheme';
import { useTheme } from '@/context/ThemeContext';
import { globalStyles } from '@/styles/global-styles';
import { Dimensions, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

export default function Graph() {
  const screenWidth = Dimensions.get('window').width;
  const { colors } = useTheme();
  const styles = globalStyles(colors);

  const data = {
    labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    datasets: [
      {
        data: [20, 45, 28, 80, 99, 43, 50],
        color: (opacity = 1) => {
          // Convertir el color primario a rgba
          const hex = colors.primary;
          const r = parseInt(hex.slice(1, 3), 16);
          const g = parseInt(hex.slice(3, 5), 16);
          const b = parseInt(hex.slice(5, 7), 16);
          return `rgba(${r}, ${g}, ${b}, ${opacity})`;
        },
        strokeWidth: 2
      }
    ],
    legend: ['Peso (kg)']
  };

  return (
    <View>
      <LineChart 
        data={data} 
        width={screenWidth - 40} 
        height={220} 
        chartConfig={graphTheme(colors)}
        bezier
        style={styles.graphContainer}
      />
    </View>
  );
}