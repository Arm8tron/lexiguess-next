import { Box } from '@mui/material'
import Modal from '@mui/material/Modal';
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

export default function HelpOverlay({ toggleHelpOverlay, isHelpModalVisible }: { isHelpModalVisible: boolean, toggleHelpOverlay: any }) {
	return (
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
	)
}
