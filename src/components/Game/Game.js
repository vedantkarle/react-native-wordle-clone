import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
	ActivityIndicator,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import Animated, { SlideInLeft } from "react-native-reanimated";
import { CLEAR, colors, ENTER } from "../../constants";
import { copyArray, getDayOfYear } from "../../utils";
import EndScreen from "../EndScreen/EndScreen";
import Keyboard from "../Keyboard";

const TRIES = 6;
const dayKey = `day-${getDayOfYear()}`;

export default function Game() {
	// AsyncStorage.removeItem("@game");
	let word = "hello";
	const letters = word.split("");

	const [rows, setRows] = useState(
		new Array(TRIES).fill(new Array(letters.length).fill("")),
	);
	const [curRow, setCurRow] = useState(0);
	const [curCol, setCurCol] = useState(0);
	const [gameState, setGameState] = useState("playing");
	const [loaded, setLoaded] = useState(false);

	const onKeyPressed = key => {
		if (gameState !== "playing") return;

		const updatedRows = copyArray(rows);

		if (key === CLEAR) {
			const prevCol = curCol - 1;
			if (prevCol >= 0) {
				updatedRows[curRow][prevCol] = "";
				setRows(updatedRows);
				setCurCol(prevCol);
			}
			return;
		}

		if (key === ENTER) {
			if (curCol === rows[0].length) {
				setCurRow(prev => prev + 1);
				setCurCol(0);
			}
			return;
		}

		if (curCol < rows[0].length) {
			updatedRows[curRow][curCol] = key;
			setRows(updatedRows);
			setCurCol(prev => prev + 1);
		}
	};

	const isCellActive = (row, col) => {
		return row === curRow && col === curCol;
	};

	const getCellBGColor = (row, col) => {
		const letter = rows[row][col];

		if (row >= curRow) {
			return colors.black;
		}

		if (letter === letters[col]) {
			return colors.primary;
		}
		if (letters.includes(letter)) {
			return colors.secondary;
		}
		return colors.darkgrey;
	};

	const greenCaps = rows.flatMap((row, i) =>
		row.filter((cell, j) => getCellBGColor(i, j) === colors.primary),
	);

	const yellowCaps = rows.flatMap((row, i) =>
		row.filter((cell, j) => getCellBGColor(i, j) === colors.secondary),
	);

	const greyCaps = rows.flatMap((row, i) =>
		row.filter((cell, j) => getCellBGColor(i, j) === colors.darkgrey),
	);

	const checkGameState = () => {
		if (checkIfWon() && gameState !== "won") {
			setGameState("won");
		} else if (checkIfLost() && gameState !== "lost") {
			setGameState("lost");
		}
	};

	const checkIfWon = () => {
		const row = rows[curRow - 1];

		return row.every((letter, i) => letter === letters[i]);
	};

	const checkIfLost = () => {
		return !checkIfWon() && curRow === rows.length;
	};

	const persistState = async () => {
		const dataForToday = {
			rows,
			curRow,
			curCol,
			gameState,
		};

		try {
			const existingStateString = await AsyncStorage.getItem("@game");
			const existingState = existingStateString
				? JSON.parse(existingStateString)
				: {};

			existingState[dayKey] = dataForToday;

			const dataString = JSON.stringify(existingState);

			await AsyncStorage.setItem("@game", dataString);
		} catch (error) {
			console.log(error);
		}
	};

	const readState = async () => {
		try {
			const dataString = await AsyncStorage.getItem("@game");
			const data = JSON.parse(dataString);
			const day = data[dayKey];
			setRows(day.rows);
			setCurRow(day.curRow);
			setCurCol(day.curCol);
			setGameState(day.gameState);
		} catch (error) {
			console.log(error);
		}
		setLoaded(true);
	};

	useEffect(() => {
		if (curRow > 0) {
			checkGameState();
		}
	}, [curRow]);

	useEffect(() => {
		if (loaded) {
			persistState();
		}
	}, [rows, curRow, curCol, gameState]);

	useEffect(() => {
		readState();
	}, []);

	if (!loaded) {
		return (
			<View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
				<ActivityIndicator size='large' color='#00ff00' />
			</View>
		);
	}

	if (gameState !== "playing") {
		return (
			<EndScreen
				won={gameState === "won"}
				rows={rows}
				getCellBGColor={getCellBGColor}
			/>
		);
	}

	return (
		<>
			<ScrollView style={styles.map}>
				{rows.map((r, index) => (
					<Animated.View
						entering={SlideInLeft.delay(index * 1000)}
						style={styles.row}
						key={`row-${index}`}>
						{r.map((l, i) => (
							<View
								style={[
									styles.cell,
									{
										borderColor: isCellActive(index, i)
											? colors.grey
											: colors.darkgrey,
										backgroundColor: getCellBGColor(index, i),
									},
								]}
								key={i}>
								<Text style={styles.cellText}>{l.toUpperCase()}</Text>
							</View>
						))}
					</Animated.View>
				))}
			</ScrollView>

			<Keyboard
				onKeyPressed={onKeyPressed}
				greenCaps={greenCaps}
				yellowCaps={yellowCaps}
				greyCaps={greyCaps}
			/>
		</>
	);
}

const styles = StyleSheet.create({
	map: {
		alignSelf: "stretch",
	},
	row: {
		alignSelf: "stretch",
		flexDirection: "row",
		justifyContent: "center",
	},
	cell: {
		borderWidth: 3,
		borderColor: colors.darkgrey,
		flex: 1,
		maxWidth: 70,
		aspectRatio: 1,
		margin: 3,
		justifyContent: "center",
		alignItems: "center",
	},
	cellText: {
		color: colors.lightgrey,
		fontSize: 28,
		fontWeight: "bold",
	},
});
