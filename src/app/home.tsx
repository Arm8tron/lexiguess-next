"use client"

import React, { useEffect, useState, useRef } from 'react';
import { generate } from 'random-words';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import InputBox from '@/components/InputBox';
import Keyboard from '@/components/Keyboard';
import { generateHardWord } from '@/hard-word-gen';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import HelpOverlay from '@/components/HelpOverlay';
import SettingsOverlay from '@/components/SettingsOverlay';
import Header from '@/components/Header';
import AuthOverlay from '@/components/AuthOverlay';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Session } from '@supabase/auth-helpers-nextjs'
import { wordType, CompletedUserWordType } from '@/types/words'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/supabase';
import StatsOverlay from '@/components/StatsOverlay';

/*	
	Feedback
	0 - Not present
	1 - present but not correct location
	2 - present and correct location
*/

const alphabeticRegex: RegExp = /^[A-Za-z]+$/;

const darkTheme = createTheme({
	palette: {
		mode: 'dark',
	},
});

export default function Home({
	session, completedWords, streakData }:
	{
		session: Session | null,
		completedWords: string[],
		streakData: Database['public']['Tables']['daily_streak']['Row'] | null
	}) {
	const regenBtnRef = useRef<HTMLAnchorElement | null>(null);
	const dummyRef = useRef<any>(null);
	const supabase = createClientComponentClient<Database>()

	const searchParams = useSearchParams();
	const wordType: wordType = searchParams.get('type') == "hard" ? "hard" : searchParams.get("type") == "daily" ? "daily" : "normal";
	const times = searchParams.get('times') ?? "0";

	const [wordLength, setWordLength] = useState<number>(5);
	const [numberOfAttempts, setNumberOfAttempts] = useState<number>(6);
	const [generatedWord, setGeneratedWord] = useState<string>('');
	const [activeUserWord, setActiveUserWord] = useState<string>('');
	const [completedUserWords, setCompletedUserWords] = useState<CompletedUserWordType[][]>([]);
	const [activeRow, setActiveRow] = useState<number>(0);
	const [showAnswer, setShowAnswer] = useState<boolean>(false);
	const [wordMeaning, setWordMeaning] = useState<string>('');
	const [isSettingsModalVisible, setSettingsModalVisibility] = useState<boolean>(false);
	const [isHelpModalVisible, setHelpModalVisibility] = useState<boolean>(false);
	const [isAuthModalVisible, setAuthModalVisibility] = useState<boolean>(false);
	const [isStatsModalVisible, setStatsModalVisibility] = useState<boolean>(false);

	useEffect(() => {
		const isHelpModalShown = localStorage.getItem('help-modal');
		if (!isHelpModalShown) {
			toggleHelpOverlay();
		}
	}, []);

	useEffect(() => {
		if (wordType == "daily") {
			getDailyWord();
		} else if (wordType == "hard") {
			getHardWord();
		} else {
			getNormalWord();
		}
	}, [wordType, times, wordLength]);

	useEffect(() => {
		window.onkeydown = (event) => {
			dummyRef.current?.focus();
			if (isAuthModalVisible) return;
			const key = event.key.toLowerCase();
			handleKey(key);
		};
	}, [activeUserWord, isAuthModalVisible]);

	async function getDailyWord() {
		const date = new Date();
		const customSeed = `${date.getDate()}-${date.getMonth()}-${date.getFullYear()}`
		const word: string = generate({ minLength: 5, maxLength: 5, seed: customSeed, exactly: 1 })[0];
		setGeneratedWord(word);
		setWordLength(word.length);
		setNumberOfAttempts(6);
		setActiveUserWord('');
		setCompletedUserWords([]);
		setActiveRow(0);
		setShowAnswer(false);
	}

	function getNormalWord() {
		console.log("Generating normal word");
		const newWord: any = generate({ minLength: wordLength, maxLength: wordLength });
		setGeneratedWord(newWord);
		setWordLength(newWord.length);
		setActiveUserWord('');
		setCompletedUserWords([]);
		setActiveRow(0);
		setShowAnswer(false);
		regenBtnRef.current?.blur();
	}

	function getHardWord() {
		console.log("Generating hard word");
		const newWord: string = generateHardWord();
		setGeneratedWord(newWord);
		setWordLength(newWord.length);
		setActiveUserWord('');
		setCompletedUserWords([]);
		setActiveRow(0);
		setShowAnswer(false);
		setSettingsModalVisibility(false);
		getWordMeaning(newWord);
	}

	function getWordMeaning(newWord: string) {
		try {
			fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${newWord}`)
				.then(res => res.json())
				.then(response => {
					const meaning = response[0].meanings[0].definitions[0].definition;
					setWordMeaning(meaning);
				})
		} catch (error) {
			console.log(error);
		}
	}

	function handleKey(key: string) {
		if (alphabeticRegex.test(key) && key.length == 1 && activeUserWord.length < wordLength) {
			setActiveUserWord(prevWord => prevWord += key);
		} else if (key == "backspace") {
			setActiveUserWord(prevWord => prevWord.slice(0, -1));
		} else if (key == "enter") {
			validateUserWord();
		}
	}


	async function validateUserWord() {
		if (!activeUserWord || activeUserWord.length < wordLength) return;

		let resultArray: CompletedUserWordType[] = [];
		let correctCount: number = 0;
		let wrongCount: number = 0;

		console.log(`Validating ${activeUserWord}`);
		//const isValid = await isValidEnglishWord(activeUserWord);


		if (false) { //FIXME: check
			showErrorToast("Word doesn't exist");
			setActiveRow(prevRow => prevRow + 1);
			for (let char of activeUserWord) {
				resultArray.push({ letter: char, feedback: 0 });
			}
			if (activeRow == numberOfAttempts - 1) {
				showErrorToast("No more attempts left");
				setShowAnswer(true);
			}
			setCompletedUserWords(prevState => [...prevState, resultArray]);
			setActiveUserWord("");
			return;
		}

		for (let i = 0; i < wordLength; i++) {
			if (generatedWord.includes(activeUserWord[i])) {
				if (activeUserWord[i] == generatedWord[i]) {
					resultArray.push({ letter: activeUserWord[i], feedback: 2 });
					correctCount++;
				} else {
					resultArray.push({ letter: activeUserWord[i], feedback: 1 });
				}
			} else {
				wrongCount++;
				resultArray.push({ letter: activeUserWord[i], feedback: 0 });
			}
		}

		if (wrongCount == wordLength) {
			showErrorToast("No matching characters");
		}

		if (correctCount == wordLength) {
			showSuccessToast("You got it right!");
			updateDb();
			incrementDailyStreak();

		} else {
			if (activeRow == numberOfAttempts - 1) {
				showErrorToast("No more attempts left");
				setShowAnswer(true);
			} else {
				setActiveRow(prevRow => prevRow + 1);
			}
		}

		setCompletedUserWords(prevState => [...prevState, resultArray]);
		setActiveUserWord("");
	}

	async function isValidEnglishWord(word: string) {
		return fetch(`https://api.datamuse.com/words?sp=${word}&max=1`)
			.then(res => res.json())
			.then(response => {
				if (response.length > 0 && response[0].word == word) {
					if (word == "aeiou") {
						return false;
					} else {
						return true;
					}
				} else {
					return false;
				}
			}).catch(err => {
				console.log(err);
				return false;
			})
	}

	function showSuccessToast(message: string) {
		toast.success(message);
	}

	function showErrorToast(message: string) {
		toast.error(message);
	}

	function handleChangeWordLength(event: any) {
		if (wordType != "daily" && wordType != "hard") {
			setWordLength(event.target.value);
		}
	}

	function handleChangeNumberOfAttempts(event: any) {
		setNumberOfAttempts(event.target.value);
	}

	function toggleSettingsOverlay() {
		setSettingsModalVisibility(prevState => !prevState);
	}


	function toggleHelpOverlay() {
		setHelpModalVisibility(prevState => !prevState);
		localStorage.setItem('help-modal', JSON.stringify(true));
	}

	function toggleAuthOverlay() {
		setAuthModalVisibility(prevState => !prevState);
	}

	function toggleStatsOverlay() {
		setStatsModalVisibility(prevState => !prevState);
	}

	async function updateDb() {
		const onlyWords = completedWords.map(item => item.split('-')[0]);
		if (!session || onlyWords.includes(activeUserWord)) return;


		const { error } = await supabase.from('profiles').update({
			completed_words: [...completedWords, `${activeUserWord}-${wordType}-${Date.now()}`]
		}).eq('id', session?.user.id)

		if (error) console.log(error);

		return;
	}

	async function incrementDailyStreak() {
		const today = new Date();

		if (!session || !streakData || wordType != "daily" || !streakData.start_date) return;

		if(streakData.recent_date != null && streakData.recent_date == today.toISOString().split('T')[0]) {
			showErrorToast("You already solved daily word");
			return;
		}

		const newStreakData : typeof streakData = streakData;

		if(streakData.recent_date == null) {
			newStreakData.recent_date = today.toISOString().split('T')[0];
			newStreakData.start_date = today.toISOString().split('T')[0];
			newStreakData.current_streak = 1;
			newStreakData.longest_streak = 1;
		} else {
			const recentDate = new Date(streakData.recent_date);
			const timeDiff = Math.abs(today.valueOf() - recentDate.valueOf());
			const dayDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
			if(dayDiff > 1) {
				newStreakData.recent_date = today.toISOString().split('T')[0];
				newStreakData.start_date = today.toISOString().split('T')[0];
				newStreakData.current_streak = 1;
				newStreakData.longest_streak = 1;
			} else {
				newStreakData.recent_date = today.toISOString().split('T')[0];
				newStreakData.current_streak = streakData.current_streak ? streakData.current_streak + 1 : 1;
				newStreakData.longest_streak = Math.max(newStreakData.current_streak, newStreakData.longest_streak ?? 0);
			}

		}

		const { error } = await supabase
			.from('daily_streak')
			.update(newStreakData)
			.eq('user_id', session?.user.id)

		if(error) console.error(error);

		return;
	}


	return (
		<ThemeProvider theme={darkTheme}>
			<div className='w-full h-full flex items-center justify-center flex-col gap-y-6'>
				<Header
					wordType={wordType}
					toggleHelpOverlay={toggleHelpOverlay}
					toggleSettingsOverlay={toggleSettingsOverlay}
					toggleAuthOverlay={toggleAuthOverlay}
					toggleStatsOverlay={toggleStatsOverlay}
					email={session?.user.email}
					streakData={streakData}
				/>
				<main className='mt-28 flex flex-col items-center justify-center gap-y-6'>
					{Array.from({ length: numberOfAttempts }, (_, index) => index).map((row, rowIndex) => (
						<div id={`row-${row}`} className='flex flex-row gap-x-4' key={`row-${rowIndex}`}>
							{Array.from({ length: wordLength }, (_, index) => index).map((column, columnIndex) => (
								<InputBox
									key={`input-${rowIndex}-${columnIndex}`}
									row={row}
									column={column}
									completedUserWords={completedUserWords}
									activeUserWord={activeUserWord}
									activeRow={activeRow}
								/>
							))}
						</div>
					))}
					{
						showAnswer && <p className=' text-[18px] font-medium'>Correct word is <strong>{generatedWord}</strong></p>
					}
					{
						showAnswer && wordMeaning.length > 0 && (
							<div className='flex flex-col gap-1 w-full sm:w-1/2'>
								<p className='text-[12px] text-center'>Meaning : {wordMeaning}</p>
								<p className='text-[14px] text-center'>Learn more about the word <a href={`https://www.dictionary.com/browse/${generatedWord}`} target='_blank' className='font-bold text-blue-400 underline'>here</a></p>
							</div>
						)
					}
					<Link ref={regenBtnRef} href={`?type=${wordType == 'daily' || wordType != "hard" ? 'normal' : wordType}&times=${Number.isNaN((parseInt(times) + 1)) ? 1 : (parseInt(times) + 1)}`} className=' px-4 py-2 bg-slate-800 hover:opacity-80 rounded-lg'>
						Regenerate
					</Link>
					<div className='flex flex-row gap-x-4'>
						<button ref={dummyRef} onClick={() => handleKey("enter")} className=' w-24 h-10 bg-slate-800 hover:opacity-80 rounded-lg'>
							Enter
						</button>
						<button onClick={() => handleKey("backspace")} className=' w-24 h-10 bg-slate-800 hover:opacity-80 rounded-lg'>
							Backspace
						</button>
					</div>
					<Keyboard completedUserWords={completedUserWords} onKeyClick={handleKey} />
					<ToastContainer
						position='bottom-left'
					/>
				</main>
				<SettingsOverlay
					toggleSettingsOverlay={toggleSettingsOverlay}
					isSettingsModalVisible={isSettingsModalVisible}
					wordLength={wordLength}
					handleChangeWordLength={handleChangeWordLength}
					numberOfAttempts={numberOfAttempts}
					handleChangeNumberOfAttempts={handleChangeNumberOfAttempts}
				/>
				<HelpOverlay toggleHelpOverlay={toggleHelpOverlay} isHelpModalVisible={isHelpModalVisible} />
				<AuthOverlay toggleAuthOverlay={toggleAuthOverlay} isAuthModalVisible={isAuthModalVisible} showSuccessToast={showSuccessToast} showErrorToast={showErrorToast} />
				<StatsOverlay toggleStatsOverlay={toggleStatsOverlay} isStatsModalVisible={isStatsModalVisible} completedWords={completedWords} />
			</div>
		</ThemeProvider>
	)
}
