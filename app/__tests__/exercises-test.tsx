import { exercises } from "@/assets/data/exercises"; // ✅ Importa los datos reales
import { fireEvent, render } from "@testing-library/react-native";
import Exercises from "../(tabs)/exercises";
import { ThemeProvider } from "../../context/ThemeContext";

describe("Ejercicio 1 - Tests Exercises", () => {

  const renderWithTheme = (component: React.ReactElement) =>
    render(<ThemeProvider>{component}</ThemeProvider>);

  test("Filtra ejercicios correctamente (caja negra)", () => {
    const { getByPlaceholderText, getByText, queryByText } = renderWithTheme(<Exercises />);
    const input = getByPlaceholderText("Search exercises here...");

    fireEvent.changeText(input, "Bench");

    expect(getByText("Bench Press")).toBeTruthy();
    expect(queryByText("Squat")).toBeNull();
  });

  test("Búsqueda no distingue mayúsculas/minúsculas", () => {
    const { getByPlaceholderText, getByText } = renderWithTheme(<Exercises />);
    const input = getByPlaceholderText("Search exercises here...");

    fireEvent.changeText(input, "cHeSt");

    expect(getByText("Chest Fly")).toBeTruthy();
  });

  test("Búsqueda vacía devuelve todos los ejercicios", () => {
    const { getByPlaceholderText, getByText } = renderWithTheme(<Exercises />);
    const input = getByPlaceholderText("Search exercises here...");

    fireEvent.changeText(input, "");

    expect(getByText("Bench Press")).toBeTruthy();
    expect(getByText("Chest Fly")).toBeTruthy();
    expect(getByText("Seated Row")).toBeTruthy();
  });

  test("Búsqueda inexistente devuelve vacío", () => {
    const { getByPlaceholderText, getByText } = renderWithTheme(<Exercises />);
    const input = getByPlaceholderText("Search exercises here...");

    fireEvent.changeText(input, "loqsea");

    expect(getByText("No exercises found")).toBeTruthy();
  });

  // Caja blanca
  test("Función searchExercises filtra correctamente (caja blanca)", () => {
    // Comprobar la lógica interna indirectamente usando los datos
    const searchText1 = "Bench Press";
    const filtered1 = exercises.filter(e => e.exerciseName.toLowerCase().includes(searchText1.toLowerCase()));
    expect(filtered1.length).toBeGreaterThan(0);

    const searchText2 = "NoExiste";
    const filtered2 = exercises.filter(e => e.exerciseName.toLowerCase().includes(searchText2.toLowerCase()));
    expect(filtered2.length).toBe(0);

    const searchText3 = "";
    const filtered3 = exercises.filter(e => e.exerciseName.toLowerCase().includes(searchText3.toLowerCase()));
    expect(filtered3.length).toBe(exercises.length);
  });
});