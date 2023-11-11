import React from 'react';
import { CompletedUserWordType } from '@/types/words';

const keyboardLayout = [
	['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
	['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
	['z', 'x', 'c', 'v', 'b', 'n', 'm'],
];

type KeyboardProps = {
    onKeyClick: Function,
    completedUserWords: CompletedUserWordType[][]
}

export default function Keyboard({ onKeyClick, completedUserWords } : KeyboardProps) {
    
    function feedback(key : string) {
        const foundElementList = completedUserWords.find(el => el.find(e => e.letter == key));
        const element = foundElementList?.find(el => el.letter == key);
        if(element) {
            return element.feedback;
        } else return -1;
    }

	return (
		<div className="flex flex-col gap-y-2 justify-center items-center">
			{keyboardLayout.map((row, rowIndex) => (
				<div className="flex flex-row gap-x-1 items-center" key={rowIndex}>
					{row.map((key, keyIndex) => (
						<button
							key={keyIndex}
							className={`${feedback(key) == 0 ? "bg-custom-red" : feedback(key) == -1 ? "bg-slate-800" : "bg-custom-yellow"}  rounded-xl p-3 focus:border-slate-600 focus:border uppercase`}
							onClick={() => onKeyClick(key)}
						>
							{key}
						</button>
					))}
				</div>
			))}
		</div>
	)
}
