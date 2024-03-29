import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Clipboard from "expo-clipboard";
import React, { useEffect, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	Pressable,
	StyleSheet,
	Text,
	View,
} from "react-native";
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
					minWidth: 20,
				}}>
				<Text style={{ color: colors.lightgrey }}>{amount}</Text>
			</View>
		</View>
	);
};

const GuessDistribution = ({ distribution }) => {
	if (!distribution) return null;

	const sum = distribution.reduce((total, dist) => dist + total, 0);

	return (
		<View style={{ width: "100%", padding: 20 }}>
			{distribution.map((d, i) => {
				return (
					<GuessDistributionLine
						key={i}
						position={i + 1}
						amount={d}
						percentage={`${(100 * d) / sum}%`}
					/>
				);
			})}
		</View>
	);
};

const EndScreen = ({ won = false, rows, getCellBGColor }) => {
	const [secondTillTomorrow, setSecondsTillTomorrow] = useState(0);
	const [played, setPlayed] = useState(0);
	const [winRate, setWinRate] = useState(0);
	const [curStreak, setCurStreak] = useState(0);
	const [maxStreak, setMaxStreak] = useState(0);
	const [distribution, setDistribution] = useState(null);
	const [loaded, setLoaded] = useState(false);

	useEffect(() => {
		readState();
	}, []);

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

	const readState = async () => {
		let data;
		try {
			const dataString = await AsyncStorage.getItem("@game");
			data = JSON.parse(dataString);
		} catch (error) {
			console.log(error);
		}
		const keys = Object.keys(data);
		const values = Object.values(data);

		setPlayed(keys.length);

		const numberOfWins = values.filter(game => game.gameState === "won").length;

		setWinRate(Math.floor((numberOfWins / keys.length) * 100));

		let _curStreak = 0;
		let maxStreak = 0;
		let prevDay = 0;
		keys.forEach(key => {
			const day = parseInt(key.split("-")[1]);
			if (data[key].gameState === "won" && _curStreak === 0) {
				_curStreak += 1;
			} else if (data[key].gameState === "won" && prevDay + 1 === day) {
				_curStreak += 1;
			} else {
				if (_curStreak > maxStreak) {
					maxStreak = _curStreak;
				}
				_curStreak = data[key].gameState === "won" ? 1 : 0;
			}
			prevDay = day;
		});

		setCurStreak(_curStreak);
		setMaxStreak(maxStreak);

		//guess distribution

		const dist = [0, 0, 0, 0, 0, 0];

		values.forEach(game => {
			if (game.gameState === "won") {
				const tries = game.rows.filter(row => row[0]).length;
				dist[tries] = dist[tries] + 1;
			}
		});
		setDistribution(dist);
		setLoaded(true);
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

	if (!loaded) {
		return (
			<View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
				<ActivityIndicator size='large' color='#00ff00' />
			</View>
		);
	}

	return (
		<View style={{ width: "100%", alignItems: "center" }}>
			<Text style={styles.title}>
				{won ? "Congrats" : "Meh, Try Again Tomorrow"}
			</Text>
			<Text style={styles.subtitle}>Statistics</Text>

			<View style={{ flexDirection: "row", marginBottom: 20 }}>
				<Number number={played} label='Played' />
				<Number number={winRate} label='Win %' />
				<Number number={curStreak} label='Cur Streak' />
				<Number number={maxStreak} label='Max Streak' />
			</View>

			<Text style={styles.subtitle}>Guess Distribution</Text>
			<GuessDistribution distribution={distribution} />
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
