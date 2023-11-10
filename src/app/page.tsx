"use client"

import React, { useEffect, useState, useRef } from 'react';
import { generate } from 'random-words';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Slider from '@mui/material/Slider'
import InputBox from '../components/InputBox';
import Keyboard from '../components/Keyboard';
import SettingsIcon from '@mui/icons-material/Settings';
import InfoIcon from '@mui/icons-material/Info';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import { generateHardWord } from '../../hard-word-gen';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import { createTheme, ThemeProvider } from '@mui/material/styles';

/*	
	Feedback
	0 - Not present
	1 - present but not correct location
	2 - present and correct location
*/

const alphabeticRegex: RegExp = /^[A-Za-z]+$/;

export type CompletedUserWordType = {
	letter: string,
	feedback: 0 | 1 | 2
}

type wordType = "normal" | "daily" | "hard";

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
	alignItems: "center",
	'&:focus': {
		outline: 'none',
	},

};

const darkTheme = createTheme({
	palette: {
	  mode: 'dark',
	},
  });

export default function Home() {
	const regenBtnRef = useRef<HTMLAnchorElement | null>(null);

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
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const isWordTypeMenuOpen = Boolean(anchorEl);

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
	}, [wordType, times]);

	useEffect(() => {
		if (wordType == "normal") {
			getNormalWord();
		}
	}, [wordLength]);

	useEffect(() => {
		window.onkeydown = (event) => {
			const key = event.key.toLowerCase();
			handleKey(key);
		};
	}, [activeUserWord]);

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

	function handleOpenWordTypeMenu(event: React.MouseEvent<HTMLButtonElement>) {
		setAnchorEl(event.currentTarget);
	}

	function handleCloseWordTypeMenu() {
		setAnchorEl(null);
	}

	return (
		<div className='w-full h-full flex items-center justify-center flex-col gap-y-6'>
			<header className='fixed top-0 left-0 border-b border-slate-700 w-full px-5 bg-primary-bg z-10 h-[75px] sm:h-[60px]'>
				<div className='flex items-center justify-between h-full flex-wrap w-full'>
					<div className='w-1/3 flex justify-start items-center'>
						<Button
							id="modes-button"
							aria-controls={isWordTypeMenuOpen ? 'modes-menu' : undefined}
							aria-haspopup="true"
							aria-expanded={isWordTypeMenuOpen ? 'true' : undefined}
							onClick={handleOpenWordTypeMenu}
							className='text-white hover:bg-slate-800 rounded-lg p-2'
						>
							Modes
						</Button>
						<ThemeProvider theme={darkTheme}>
						<Menu
							id="modes-menu"
							anchorEl={anchorEl}
							open={isWordTypeMenuOpen}
							onClose={handleCloseWordTypeMenu}
							MenuListProps={{
								'aria-labelledby': 'modes-button',
							}}
						>
							<MenuItem style={{ display: wordType == "daily" ? "none" : "block" }}><Link onClick={handleCloseWordTypeMenu} href={`?type=daily`} >
								Daily mode
							</Link></MenuItem>
							{ wordType != "daily" && <Divider/> }
							<MenuItem style={{ display: wordType == "hard" ? "none" : "block" }}><Link onClick={handleCloseWordTypeMenu} href={`?type=hard`} >
								Hard mode
							</Link></MenuItem>
							<MenuItem style={{ display: wordType == "normal" ? "none" : "block" }}><Link onClick={handleCloseWordTypeMenu} href={`?type=normal`} >
								Normal mode
							</Link></MenuItem>
						</Menu>
						</ThemeProvider>
					</div>
					<div className='w-1/3 flex flex-row gap-2 justify-center items-center relative'>
						<h1 className='text-lg sm:text-3xl font-extrabold select-none'>LexiGuess</h1>
						<p style={{ display: wordType == "hard" || wordType == "daily" ? "flex" : "none" }} className='border border-slate-300 rounded-lg px-2 py-1 text-[10px] h-[30px] flex justify-center items-center capitalize'>{wordType}</p>
					</div>
					<div className='w-1/3 flex justify-end items-center'>
						<button onClick={toggleHelpOverlay} className='hover:bg-slate-800 rounded-lg p-2 duration-200'>
							<InfoIcon />
						</button>
						<button onClick={toggleSettingsOverlay} className='hover:bg-slate-800 rounded-lg p-2 duration-200'>
							<SettingsIcon />
						</button>
					</div>
				</div>
			</header>
			<main className='mt-20 flex flex-col items-center justify-center gap-y-6'>
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
					<button onClick={() => handleKey("enter")} className=' w-24 h-10 bg-slate-800 hover:opacity-80 rounded-lg'>
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
			<Modal
				onClose={toggleHelpOverlay}
				open={isHelpModalVisible}
			>
				<Box sx={style}>
					<h1 className='font-bold text-2xl'>
						How to play
					</h1>
					<span className='text-sm text-center mt-5'>Attempt to identify the word within the number of tries you select.</span>
					<span className='text-sm text-center'>The color of the tiles will change based on how close you are to the target word</span>
					<div className='mt-5'>
						<h3 className='font-medium text-xl'>Examples</h3>
						<div className='my-4'>
							<div className='flex flex-row gap-x-4 mb-2'>
								<div className=' bg-custom-green font-bold rounded-lg w-12 h-12  text-[22px] text-center select-none uppercase flex items-center justify-center'>
									A
								</div>
								<div className='border-slate-800 border-2 font-bold rounded-lg w-12 h-12  text-[22px] text-center select-none uppercase flex items-center justify-center'>
									L
								</div>
								<div className='border-slate-800 border-2 font-bold rounded-lg w-12 h-12  text-[22px] text-center select-none uppercase flex items-center justify-center'>
									I
								</div>
								<div className='border-slate-800 border-2 font-bold rounded-lg w-12 h-12  text-[22px] text-center select-none uppercase flex items-center justify-center'>
									V
								</div>
								<div className='border-slate-800 border-2 font-bold rounded-lg w-12 h-12  text-[22px] text-center select-none uppercase flex items-center justify-center'>
									E
								</div>
							</div>
							<span className='text-center'>A is in the word and in the correct spot</span>
						</div>
						<div className='my-4'>
							<div className='flex flex-row gap-x-4 mb-2'>
								<div className=' border-slate-800 border-2 font-bold rounded-lg w-12 h-12  text-[22px] text-center select-none uppercase flex items-center justify-center'>
									S
								</div>
								<div className='border-slate-800 border-2 font-bold rounded-lg w-12 h-12  text-[22px] text-center select-none uppercase flex items-center justify-center'>
									T
								</div>
								<div className='border-slate-800 border-2 font-bold rounded-lg w-12 h-12  text-[22px] text-center select-none uppercase flex items-center justify-center'>
									A
								</div>
								<div className='bg-custom-yellow font-bold rounded-lg w-12 h-12  text-[22px] text-center select-none uppercase flex items-center justify-center'>
									T
								</div>
								<div className='border-slate-800 border-2 font-bold rounded-lg w-12 h-12  text-[22px] text-center select-none uppercase flex items-center justify-center'>
									E
								</div>
							</div>
							<span className='text-center'>T is in the word but in the wrong spot</span>
						</div>
						<div className='my-4 w-full'>
							<div className='flex flex-row gap-x-4 mb-2'>
								<div className=' border-slate-800 border-2 font-bold rounded-lg w-12 h-12  text-[22px] text-center select-none uppercase flex items-center justify-center'>
									V
								</div>
								<div className='border-slate-800 border-2 font-bold rounded-lg w-12 h-12  text-[22px] text-center select-none uppercase flex items-center justify-center'>
									A
								</div>
								<div className='border-slate-800 border-2 font-bold rounded-lg w-12 h-12  text-[22px] text-center select-none uppercase flex items-center justify-center'>
									G
								</div>
								<div className='border-slate-800 border-2 font-bold rounded-lg w-12 h-12  text-[22px] text-center select-none uppercase flex items-center justify-center'>
									U
								</div>
								<div className='border-slate-800 border-2 font-bold rounded-lg w-12 h-12  text-[22px] text-center select-none uppercase flex items-center justify-center'>
									E
								</div>
							</div>
							<span className='text-center'>None of the letters are in the word</span>
						</div>
					</div>

				</Box>
			</Modal>
		</div>
	)
}
