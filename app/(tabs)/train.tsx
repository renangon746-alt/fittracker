import { useTheme } from '@/context/ThemeContext';
import { useTranslation } from '@/context/LanguageContext';
import { globalStyles } from '@/styles/global-styles';
import { Text, View } from 'react-native';

export default function Train() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const styles = globalStyles(colors);

  return (
    <View style={[styles.trainContainer, { backgroundColor: colors.backgroundPrimary }]}> 
      <Text style={{color: colors.textPrimary}}>{t('train_tab_placeholder')}</Text>
    </View>
  );
}
