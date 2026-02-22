import { fireEvent, render } from "@testing-library/react-native";
import { router } from "expo-router";
import MuscleCard from "../../components/MuscleCard";
import { ThemeProvider } from "../../context/ThemeContext";

jest.mock("expo-router", () => ({
  router: { push: jest.fn() },
}));

describe("Ejercicio 2 - MuscleCard", () => {
  const renderWithTheme = (component: React.ReactElement) =>
    render(<ThemeProvider>{component}</ThemeProvider>);

  test("Renderiza correctamente y responde al press (caja blanca)", () => {
    const mockExercise = {
      id: 1,
      image: 1, 
      exerciseName: "Bench Press",
      principalMuscleName: "Chest",
    };

    const { getByText, getByRole } = renderWithTheme(
      <MuscleCard {...mockExercise} />
    );

    // Verifica que los textos se renderizan
    expect(getByText("Bench Press")).toBeTruthy();
    expect(getByText("Chest")).toBeTruthy();

    // Simula press y verifica que router.push se llama
    const pressable = getByRole("button");
    fireEvent.press(pressable);
    expect(router.push).toHaveBeenCalledWith({
      pathname: "/exercise/[id]",
      params: { id: "1" },
    });
  });
});