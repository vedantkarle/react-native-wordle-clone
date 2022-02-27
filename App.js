import { StatusBar } from "expo-status-bar";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import Keyboard from "./src/components/Keyboard";
import { colors } from "./src/constants";

const TRIES = 6;

export default function App() {
	const word = "hello";
	const letters = word.split("");

	const rows = new Array(TRIES).fill(new Array(letters.length).fill("a"));

	return (
		<SafeAreaView style={styles.container}>
			<StatusBar style='light' />
			<Text style={styles.title}>WORDLE</Text>

			<ScrollView style={styles.map}>
				{rows.map((r, index) => (
					<View style={styles.row}>
						{r.map((l, i) => (
							<View style={styles.cell} key={i}>
								<Text style={styles.cellText}>{l.toUpperCase()}</Text>
							</View>
						))}
					</View>
				))}
			</ScrollView>

			<Keyboard />
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
		height: 100,
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
