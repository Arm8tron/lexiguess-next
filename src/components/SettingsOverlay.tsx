import { Modal, Box, Slider } from '@mui/material'
import React from 'react'

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

type SettingsOverlayProps = {
	toggleSettingsOverlay : ((event: {}, reason: "backdropClick" | "escapeKeyDown") => void) | undefined,
	isSettingsModalVisible : boolean,
	wordLength : number | number[] | undefined,
	handleChangeWordLength : ((event: Event, value: number | number[], activeThumb: number) => void) | undefined,
	numberOfAttempts : number | number[] | undefined,
	handleChangeNumberOfAttempts : ((event: Event, value: number | number[], activeThumb: number) => void) | undefined
}

export default function SettingsOverlay({ toggleSettingsOverlay, isSettingsModalVisible, wordLength, handleChangeWordLength, handleChangeNumberOfAttempts, numberOfAttempts } : SettingsOverlayProps) {
    return (
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
    )
}
