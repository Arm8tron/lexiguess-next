import React from 'react';

const keyboardLayout = [
	['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
	['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
	['z', 'x', 'c', 'v', 'b', 'n', 'm'],
];

type KeyboardProps = {
    onKeyClick: Function
}

export default function Keyboard({ onKeyClick } : KeyboardProps) {
	return (
		<div className="flex flex-col gap-y-2 justify-center items-center">
			{keyboardLayout.map((row, rowIndex) => (
				<div className="flex flex-row gap-x-1 items-center" key={rowIndex}>
					{row.map((key, keyIndex) => (
						<button
							key={keyIndex}
							className=" bg-slate-800 rounded-xl p-3 focus:border-slate-600 focus:border uppercase"
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
