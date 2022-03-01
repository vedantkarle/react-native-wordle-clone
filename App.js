import { StatusBar } from "expo-status-bar";
import { SafeAreaView, StyleSheet, Text } from "react-native";
import Game from "./src/components/Game/Game";
import { colors } from "./src/constants";

export default function App() {
	return (
		<SafeAreaView style={styles.container}>
			<StatusBar style='light' />
			<Text style={styles.title}>WORDLE</Text>
			<Game />
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
});
