import * as Clipboard from "expo-clipboard";
import React, { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, colorsToEmoji } from "../../constants";

const Number = ({ number, label }) => {
	return (
		<View style={{ alignItems: "center", margin: 10 }}>
			<Text
				style={{ color: colors.lightgrey, fontSize: 30, fontWeight: "bold" }}>
				{number}
			</Text>
			<Text style={{ color: colors.lightgrey, fontSize: 16 }}>{label}</Text>
		</View>
	);
};

const GuessDistributionLine = ({ position, amount, percentage }) => {
	return (
		<View style={{ flexDirection: "row", alignItems: "center", width: "100%" }}>
			<Text style={{ color: colors.lightgrey }}>{position}</Text>
			<View
				style={{
					alignSelf: "stretch",
					width: "10%",
					backgroundColor: colors.grey,
					margin: 5,
					padding: 5,
					width: `${percentage}`,
				}}>
				<Text style={{ color: colors.lightgrey }}>{amount}</Text>
			</View>
		</View>
	);
};

const GuessDistribution = () => {
	return (
		<View style={{ width: "100%", padding: 20 }}>
			<GuessDistributionLine position='0' amount={2} percentage='50%' />
		</View>
	);
};

const EndScreen = ({ won = false, rows, getCellBGColor }) => {
	const [secondTillTomorrow, setSecondsTillTomorrow] = useState(0);

	const formatSeconds = () => {
		const hours = Math.floor(secondTillTomorrow / 60 / 60);
		const minutes = Math.floor((secondTillTomorrow / 60) % 60);
		const seconds = Math.floor(secondTillTomorrow % 60);

		let displayHours = hours < 10 ? `0${hours}` : hours;
		let displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
		let displaySeconds = seconds < 10 ? `0${seconds}` : seconds;

		return `${displayHours}:${displayMinutes}:${displaySeconds}`;
	};

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

	useEffect(() => {
		const updateTime = () => {
			const now = new Date();
			const tomorrow = new Date(
				now.getFullYear(),
				now.getMonth(),
				now.getDate() + 1,
			);

			setSecondsTillTomorrow((tomorrow - now) / 1000);
		};

		const interval = setInterval(updateTime, 1000);

		return () => clearInterval(interval);
	}, []);

	return (
		<View style={{ width: "100%", alignItems: "center" }}>
			<Text style={styles.title}>
				{won ? "Congrats" : "Meh, Try Again Tomorrow"}
			</Text>
			<Text style={styles.subtitle}>Statistics</Text>
			<View style={{ flexDirection: "row", marginBottom: 20 }}>
				<Number number={3} label='Played' />
				<Number number={3} label='Win %' />
				<Number number={3} label='Cur Streak' />
				<Number number={3} label='Max Streak' />
			</View>
			<Text style={styles.subtitle}>Guess Distribution</Text>
			<GuessDistribution />
			<View style={{ flexDirection: "row", padding: 10 }}>
				<View style={{ alignItems: "center", flex: 1 }}>
					<Text style={{ color: colors.lightgrey }}>Next Wordle</Text>
					<Text
						style={{
							color: colors.lightgrey,
							fontSize: 20,
							fontWeight: "bold",
						}}>
						{formatSeconds()}
					</Text>
				</View>
				<Pressable
					onPress={shareResult}
					style={{
						flex: 1,
						backgroundColor: colors.primary,
						borderRadius: 25,
						alignItems: "center",
						justifyContent: "center",
					}}>
					<Text style={{ color: colors.lightgrey, fontWeight: "bold" }}>
						Share
					</Text>
				</Pressable>
			</View>
		</View>
	);
};

export default EndScreen;

const styles = StyleSheet.create({
	title: {
		fontSize: 30,
		color: "white",
		textAlign: "center",
		marginVertical: 20,
	},
	subtitle: {
		fontSize: 20,
		color: colors.lightgrey,
		textAlign: "center",
		marginVertical: 15,
		fontWeight: "bold",
		textTransform: "uppercase",
	},
});
