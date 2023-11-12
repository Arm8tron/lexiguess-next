import { Modal, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, TablePagination, Paper } from '@mui/material'
import React, { useState } from 'react'

const style = {
	position: 'absolute' as 'absolute',
	top: '50%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
	bgcolor: '#141414',
	border: '2px solid #000',
	width: 440,
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

interface Column {
	id: 'word' | 'wordType' | 'solvedAt';
	label: string;
	format?: (value: string) => string;
}

const columns: readonly Column[] = [
	{ id: 'word', label: 'Word' },
	{ id: 'wordType', label: 'Word Type' },
	{
		id: 'solvedAt',
		label: 'Solved At',
		format: (ms: string) => convertMillisecondsToCustomFormat(ms)
	},
]

export default function StatsOverlay({ isStatsModalVisible, toggleStatsOverlay, completedWords }: StatsOverlayProps) {
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(5);

	const rows = completedWords.map((item) => {
		const [word, wordType, solvedAt] = item.split('-');
		return { word, wordType, solvedAt };
	})

	const handleChangePage = (event: unknown, newPage: number) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
		setRowsPerPage(+event.target.value);
		setPage(0);
	};


	return (
		<Modal
			open={isStatsModalVisible}
			onClose={toggleStatsOverlay}
		>

			<Paper sx={style}>
				<div>
					<span>Total Solved: {completedWords.length}</span>
					<TableContainer sx={{ maxHeight: 440 }}>
						<Table stickyHeader aria-label="sticky table">
							<TableHead>
								<TableRow>
									{columns.map((column) => (
										<TableCell
											key={column.id}
											align={'center'}
										>
											{column.label}
										</TableCell>
									))}
								</TableRow>
							</TableHead>
							<TableBody>
								{
									rows
										.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
										.map((row, index) => {
											return (
												<TableRow tabIndex={-1} key={index}>
													{columns.map((column) => {
														const value = row[column.id];
														return (
															<TableCell key={column.id} align={'center'}>
																{column.format
																	? column.format(value)
																	: value}
															</TableCell>
														);
													})}
												</TableRow>
											);
										})
								}
							</TableBody>
						</Table>
					</TableContainer>
					<TablePagination
						rowsPerPageOptions={[5, 10, 15]}
						component="div"
						count={rows.length}
						rowsPerPage={rowsPerPage}
						page={page}
						onPageChange={handleChangePage}
						onRowsPerPageChange={handleChangeRowsPerPage}
					/>
				</div>
			</Paper>
		</Modal>
	)
}


function convertMillisecondsToCustomFormat(milliseconds: string) {

	const num = Number(milliseconds)
	let now = new Date(); // Current date and time
	let date = new Date(num);

	// Check if the date is today
	if (date.toDateString() === now.toDateString()) {
		let hours = ("0" + date.getHours()).slice(-2);
		let minutes = ("0" + date.getMinutes()).slice(-2);
		let timeString = hours + ":" + minutes;
		return timeString;
	}

	// Check if the date is yesterday
	let yesterday = new Date(now);
	yesterday.setDate(now.getDate() - 1);
	if (date.toDateString() === yesterday.toDateString()) {
		return "Yesterday";
	}

	// If not today or yesterday, return the full date
	let year = date.getFullYear();
	let month = ("0" + (date.getMonth() + 1)).slice(-2); // Months are zero-based
	let day = ("0" + date.getDate()).slice(-2);
	let dateString = year + "-" + month + "-" + day;
	return dateString;
}