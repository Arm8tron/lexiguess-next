import React, { useState, useEffect } from 'react'

type completedUserWord = {
    letter: string,
    feedback: number
}

type InputBoxProps = {
    completedUserWords: completedUserWord[][],
    row: number,
    column: number,
    activeRow: number,
    activeUserWord: string
}

export default function InputBox(props: InputBoxProps) {
    const [letter, setLetter] = useState('');
    const [feedback, setFeedback] = useState(0);

    useEffect(() => {
        if (props.completedUserWords[props.row]) {
            const word : any = props.completedUserWords[props.row];
            setLetter(word[props.column]?.letter);
            setFeedback(word[props.column]?.feedback);
        } else {
            setFeedback(0);
            if (props.row == props.activeRow) {
                const word = props.activeUserWord;
                setLetter(word[props.column]);
            } else {
                setLetter('');
            }
        }
    }, [props])

    return (
        <div
            className={
                (feedback > 0 ? " " : letter ? "border-slate-500 border-2" : "border-slate-800 border-2") + " " +
                (feedback == 2 ? "bg-custom-green" : feedback == 1 ? "bg-custom-yellow" : "bg-primary-bg") +
                ' font-bold rounded-lg h-[50px] w-[50px]  text-[22px] text-center select-none uppercase flex items-center justify-center'}
        >
            {letter}
        </div>
    )
}
