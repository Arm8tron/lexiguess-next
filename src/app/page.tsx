"use client"

import React, { useEffect, useState, useRef } from 'react';
import { generate } from 'random-words';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Slider from '@mui/material/Slider'
import InputBox from '../components/InputBox';
import Keyboard from '../components/Keyboard';

/*	
	Feedback
	0 - Not present
	1 - present but not correct location
	2 - present and correct location
*/

const alphabeticRegex: RegExp = /^[A-Za-z]+$/;
const numberOfAttempts: number = 5;

type CompletedUserWordType = {
    letter: string,
    feedback: number
}

export default function Home() {
	const regenBtnRef = useRef<HTMLButtonElement | null>(null);

	const [wordLength, setWordLength] = useState<number>(5);
	const [generatedWord, setGeneratedWord] = useState<string>('');
	const [activeUserWord, setActiveUserWord] = useState<string>('');
	const [completedUserWords, setCompletedUserWords] = useState<CompletedUserWordType[][]>([]);
	const [activeRow, setActiveRow] = useState<number>(0);
	const [showAnswer, setShowAnswer] = useState<boolean>(false);

	useEffect(() => {
		generateNewWord();
		try {
			// fetch('http://localhost:3000/daily-word')
			// .then(res => res.json())
			// .then(response => {
			// 	if(response.success) {
			// 		const dailyWord = response.dailyWord;
			// 		setGeneratedWord(dailyWord);
			// 		setWordLength(dailyWord.length);
			// 	}
			// })
		} catch(e) {
			showErrorToast("Failed to fetch daily word");
		}
	}, [wordLength]);

	useEffect(() => {
		window.onkeydown = (event) => {
			const key = event.key.toLowerCase();
			handleKey(key);
		};
	}, [activeUserWord]);

	function generateNewWord() {
		//location.reload();
		console.log("Generating new word");
		const newWord: any = generate({ minLength: wordLength, maxLength: wordLength });
		setGeneratedWord(newWord);
		setActiveUserWord('');
		setCompletedUserWords([]);
		setActiveRow(0);
		setShowAnswer(false);
		regenBtnRef.current?.blur();
	}

	function handleKey(key : string) {
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



	return (
		<div className='w-full h-full flex items-center justify-center flex-col gap-y-6'>
			<header className='fixed top-0 left-0 border-b border-slate-700 w-full flex items-center justify-center bg-primary-bg z-10 h-[60px]'>
				<h1 className=' text-[32px] font-extrabold select-none'>LexiGuess</h1>
			</header>
			<main className='mt-20 flex flex-col items-center justify-center gap-y-6'>
				<div className='w-[80vw] sm:w-[20vw] flex flex-col items-center justify-center'>
					<p>Word length</p>
					<Slider
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
				<button ref={regenBtnRef} onClick={generateNewWord} className=' px-4 py-2 bg-slate-800 hover:opacity-80 rounded-lg'>
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

		</div>
	)
}
