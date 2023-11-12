import { Box, Modal } from '@mui/material'
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

type StatsOverlayProps = {
	isStatsModalVisible: boolean,
	toggleStatsOverlay: any,
	completedWords: string[]
}

export default function StatsOverlay({ isStatsModalVisible, toggleStatsOverlay, completedWords }: StatsOverlayProps) {
	return (
		<Modal
			open={isStatsModalVisible}
			onClose={toggleStatsOverlay}
		>

			<Box sx={style}>
				<div className='max-h-[60%] overflow-y-auto'>
					<span>Total Solved: {completedWords.length}</span>
					{
						completedWords.map((data, index) => (
							<div key={index} className='flex flex-row gap-2'>
								<span>{data.split('-')[0]}</span>
								<span>{convertMillisecondsToCustomFormat(Number(data.split('-')[1]))}</span>
							</div>
						))
					}
				</div>
			</Box>
		</Modal>
	)
}


function convertMillisecondsToCustomFormat(milliseconds: number) {
	var now = new Date(); // Current date and time
	var date = new Date(milliseconds);

	// Check if the date is today
	if (date.toDateString() === now.toDateString()) {
		var hours = ("0" + date.getHours()).slice(-2);
		var minutes = ("0" + date.getMinutes()).slice(-2);
		var timeString = hours + ":" + minutes;
		return timeString;
	}

	// Check if the date is yesterday
	var yesterday = new Date(now);
	yesterday.setDate(now.getDate() - 1);
	if (date.toDateString() === yesterday.toDateString()) {
		return "Yesterday";
	}

	// If not today or yesterday, return the full date
	var year = date.getFullYear();
	var month = ("0" + (date.getMonth() + 1)).slice(-2); // Months are zero-based
	var day = ("0" + date.getDate()).slice(-2);
	var dateString = year + "-" + month + "-" + day;
	return dateString;
}