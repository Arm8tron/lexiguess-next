"use client"

import React, { useEffect, useState, useRef } from 'react';
import { generate } from 'random-words';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Slider from '@mui/material/Slider'
import InputBox from '../components/InputBox';
import Keyboard from '../components/Keyboard';
import SettingsIcon from '@mui/icons-material/Settings';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
/*	
	Feedback
	0 - Not present
	1 - present but not correct location
	2 - present and correct location
*/

/*
	Type
	0 - Normal
	1 - Daily 

*/

const alphabeticRegex: RegExp = /^[A-Za-z]+$/;

type CompletedUserWordType = {
	letter: string,
	feedback: number
}

const style = {
	position: 'absolute' as 'absolute',
	top: '50%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
	width: 400,
	bgcolor: '#141414',
	border: '2px solid #000',
	boxShadow: 24,
	p: 4,
	borderRadius: 10,
	display: "flex",
	flexDirection: "column",
	justifyContent: "center",
	alignItems: "center"
};

export default function Home() {
	const regenBtnRef = useRef<HTMLButtonElement | null>(null);

	const [wordType, setWordType] = useState<number>(0);
	const [wordLength, setWordLength] = useState<number>(5);
	const [numberOfAttempts, setNumberOfAttempts] = useState<number>(6);
	const [generatedWord, setGeneratedWord] = useState<string>('');
	const [activeUserWord, setActiveUserWord] = useState<string>('');
	const [completedUserWords, setCompletedUserWords] = useState<CompletedUserWordType[][]>([]);
	const [activeRow, setActiveRow] = useState<number>(0);
	const [showAnswer, setShowAnswer] = useState<boolean>(false);
	const [isSettingsModalVisible, setSettingsModalVisibility] = useState<boolean>(false);

	useEffect(() => {
		if (wordType) {
			getDailyWord();
		} else {
			generateNewWord();
		}
	}, [wordLength]);

	useEffect(() => {
		window.onkeydown = (event) => {
			const key = event.key.toLowerCase();
			handleKey(key);
		};
	}, [activeUserWord]);

	function getDailyWord() {
		try {
			fetch(`/api/daily-word`)
				.then(res => res.json())
				.then(response => {
					if (response.word) {
						console.log("got daily word");
						setGeneratedWord(response.word);
						setWordLength(response.word.length);
						setNumberOfAttempts(6);
						setActiveUserWord('');
						setCompletedUserWords([]);
						setActiveRow(0);
						setShowAnswer(false);
                        setWordType(1);
					} else {
						throw "Word not found";
					}
				}).catch(err => {
					throw err;
				})
		} catch (error: any) {
			showErrorToast(error.toString());
		}
	}

	function generateNewWord() {
		console.log("Generating new word");
		const newWord: any = generate({ minLength: wordLength, maxLength: wordLength });
		setGeneratedWord(newWord);
		setWordLength(newWord.length);
		setActiveUserWord('');
		setCompletedUserWords([]);
		setActiveRow(0);
		setShowAnswer(false);
		setWordType(0);
		regenBtnRef.current?.blur();
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
		setWordLength(event.target.value);
	}

	function handleChangeNumberOfAttempts(event: any) {
		setNumberOfAttempts(event.target.value);
	}

	function toggleSettingsOverlay() {
		setSettingsModalVisibility(prevState => !prevState);
	}


	return (
		<div className='w-full h-full flex items-center justify-center flex-col gap-y-6'>
			<header className='fixed top-0 left-0 border-b border-slate-700 w-full px-5 bg-primary-bg z-10 h-[75px] sm:h-[60px]'>
				<div className='flex items-center justify-center sm:justify-between h-1/3 sm:h-full'>
					<div className='w-1/3 sm:flex justify-start items-center hidden'>
						<button onClick={getDailyWord} className='hover:bg-slate-800 rounded-lg p-2 duration-200'>
							Try daily word
						</button>
					</div>
					<div className='flex flex-row gap-2 w-1/3 justify-center items-center'>
						<h1 className='text-[32px] font-extrabold select-none'>LexiGuess</h1>
						<p style={{ display: wordType == 1 ? "flex" : "none" }} className='border border-slate-300 rounded-lg px-2 py-1 text-[10px] h-[30px] flex justify-center items-center'>Daily</p>
					</div>
					<div className='w-1/3 hidden sm:flex justify-end items-center'>
						<button style={{ display: wordType != 1 ? "flex" : "none" }} onClick={toggleSettingsOverlay} className='hover:bg-slate-800 rounded-lg p-2 duration-200'>
							<SettingsIcon />
						</button>
					</div>
				</div>
				<div className='flex sm:hidden items-center justify-around h-1/3 my-4'>
					<div className='w-1/3 flex justify-start items-center'>
						<button onClick={() => setWordType(1)} className='hover:bg-slate-800 rounded-lg p-2 duration-200'>
							Try daily word
						</button>
					</div>
					<div className='w-1/3 flex justify-end items-center'>
						<button style={{ display: wordType != 1 ? "flex" : "none" }} onClick={toggleSettingsOverlay} className='hover:bg-slate-800 rounded-lg p-2 duration-200'>
							<SettingsIcon />
						</button>
					</div>
				</div>
			</header>
			<main className='mt-20 flex flex-col items-center justify-center gap-y-6'>
				{Array.from({ length: numberOfAttempts }, (_, index) => index).map((row, rowIndex) => (
					<div id={`Row ${row}`} className='flex flex-row gap-x-4' key={`row-${rowIndex}`}>
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
				<button ref={regenBtnRef} style={{ display: wordType != 1 ? "flex" : "none" }} onClick={generateNewWord} className=' px-4 py-2 bg-slate-800 hover:opacity-80 rounded-lg'>
					Regenerate
				</button>
				<div className='flex flex-row gap-x-4'>
					<button onClick={() => handleKey("enter")} className=' w-24 h-10 bg-slate-800 hover:opacity-80 rounded-lg'>
						Enter
					</button>
					<button onClick={() => handleKey("backspace")} className=' w-24 h-10 bg-slate-800 hover:opacity-80 rounded-lg'>
						Backspace
					</button>
				</div>
				<Keyboard onKeyClick={handleKey} />
				<ToastContainer
					position='bottom-left'
				/>
			</main>
			<Modal
				onClose={toggleSettingsOverlay}
				open={isSettingsModalVisible}>
				<Box sx={style}>
					<div className='flex flex-col w-full justify-center items-center gap-1'>
						<p>Word length</p>
						<Slider
							value={wordLength}
							aria-label="Word length"
							defaultValue={5}
							valueLabelDisplay="auto"
							step={1}
							marks
							min={4}
							max={10}
							color='primary'
							onChange={handleChangeWordLength}
						/>
					</div>
					<div className='flex flex-col w-full justify-center items-center gap-1 mt-20'>
						<p>Number of attempts</p>
						<Slider
							value={numberOfAttempts}
							aria-label="Number of attempts"
							defaultValue={6}
							valueLabelDisplay="auto"
							step={1}
							marks
							min={4}
							max={10}
							color='primary'
							onChange={handleChangeNumberOfAttempts}
						/>
					</div>
				</Box>
			</Modal>
		</div>
	)
}
