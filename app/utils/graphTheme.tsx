export const graphTheme = (colors: any) => ({
  backgroundColor: colors.calendar.background,
  backgroundGradientFrom: colors.calendar.containerBg,
  backgroundGradientTo: colors.calendar.background,
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  labelColor: (opacity = 1) => {
    // Convertir el color hex a rgba
    const hex = colors.textPrimary;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  },
  style: {
    borderRadius: 16
  },
  propsForDots: {
    r: '6',
    strokeWidth: '2',
    stroke: colors.primary
  }
});
