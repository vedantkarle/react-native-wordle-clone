import * as Clipboard from "expo-clipboard";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
	Alert,
	SafeAreaView,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import Keyboard from "./src/components/Keyboard";
import { CLEAR, colors, colorsToEmoji, ENTER } from "./src/constants";

const TRIES = 6;

const copyArray = arr => {
	return [...arr.map(rows => [...rows])];
};

export default function App() {
	const word = "hello";
	const letters = word.split("");

	const [rows, setRows] = useState(
		new Array(TRIES).fill(new Array(letters.length).fill("")),
	);
	const [curRow, setCurRow] = useState(0);
	const [curCol, setCurCol] = useState(0);
	const [gameState, setGameState] = useState("playing");

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

	const shareResult = () => {
		const textMap = rows
			.map((row, i) =>
				row.map((cell, j) => colorsToEmoji[getCellBGColor(i, j)]).join(""),
			)
			.filter(row => row)
			.join("\n");

		const textToShare = `WORDLE \n${textMap}`;

		Clipboard.setString(textToShare);
		Alert.alert(
			"Copied Successfully",
			"Share your score on your social media!",
		);
	};

	const checkHameState = () => {
		if (checkIfWon()) {
			Alert.alert("Hurray!", "You Won!", [
				{
					text: "Share",
					onPress: shareResult,
				},
			]);
			setGameState("won");
		} else if (checkIfLost()) {
			Alert.alert("Meh!", "Try again tomorrow!");
			setGameState("lost");
		}
	};

	const checkIfWon = () => {
		const row = rows[curRow - 1];

		return row.every((letter, i) => letter === letters[i]);
	};

	const checkIfLost = () => {
		return curRow === rows.length;
	};

	useEffect(() => {
		if (curRow > 0) {
			checkHameState();
		}
	}, [curRow]);

	return (
		<SafeAreaView style={styles.container}>
			<StatusBar style='light' />
			<Text style={styles.title}>WORDLE</Text>

			<ScrollView style={styles.map}>
				{rows.map((r, index) => (
					<View style={styles.row} key={`row-${index}`}>
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
					</View>
				))}
			</ScrollView>

			<Keyboard
				onKeyPressed={onKeyPressed}
				greenCaps={greenCaps}
				yellowCaps={yellowCaps}
				greyCaps={greyCaps}
			/>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.black,
		alignItems: "center",
	},
	title: {
		width: "100%",
		textAlign: "center",
		color: colors.lightgrey,
		fontSize: 32,
		fontWeight: "bold",
		letterSpacing: 7,
		marginBottom: 10,
		paddingBottom: 6,
		paddingTop: Platform.OS === "android" ? 50 : 0,
		borderBottomColor: colors.darkgrey,
		borderBottomWidth: 1,
	},
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
