import { render } from "@testing-library/react-native";
import { generateExercises } from "../../assets/data/volumeExercises";
import MuscleList from "../../components/MuscleList";
import { ThemeProvider } from "../../context/ThemeContext";

describe("Ejercicio 4 - Test de Volumen", () => {

  const testVolume = (amount: number) => {
    const data = generateExercises(amount);

    const start = performance.now();

    render(
      <ThemeProvider>
        <MuscleList exercises={data} />
      </ThemeProvider>
    );

    const end = performance.now();

    const time = end - start;

    console.log(`Carga ${amount} ítems: ${time.toFixed(2)} ms`);

    return time;
  };

  it("Carga 25 elementos", () => {
    testVolume(25);
  });

  it("Carga 500 elementos", () => {
    testVolume(500);
  });

  it("Carga 1000 elementos", () => {
    testVolume(1000);
  });

  it("Carga 3000 elementos", () => {
    testVolume(3000);
  });

});