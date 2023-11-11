import { Button, Menu, MenuItem, Divider } from '@mui/material'
import Link from 'next/link'
import React from 'react'
import { wordType  } from '@/types/words'
import SettingsIcon from '@mui/icons-material/Settings';
import InfoIcon from '@mui/icons-material/Info';


type HeaderProps = {
	isWordTypeMenuOpen : boolean,
	handleOpenWordTypeMenu : React.MouseEventHandler<HTMLButtonElement> | undefined,
	anchorEl : null | HTMLElement,
	handleCloseWordTypeMenu : React.MouseEventHandler<HTMLElement>,
	wordType : wordType,
	toggleHelpOverlay : React.MouseEventHandler<HTMLButtonElement> | undefined,
	toggleSettingsOverlay : React.MouseEventHandler<HTMLButtonElement> | undefined,
	toggleAuthOverlay : React.MouseEventHandler<HTMLButtonElement> | undefined,
}

export default function Header({ isWordTypeMenuOpen, handleOpenWordTypeMenu, anchorEl, handleCloseWordTypeMenu, wordType, toggleHelpOverlay, toggleSettingsOverlay, toggleAuthOverlay } : HeaderProps) {
	return (
		<header className='fixed top-0 left-0 border-b border-slate-700 w-full px-5 bg-primary-bg z-10 h-[75px] sm:h-[60px]'>
				<div className='flex items-center justify-between h-full flex-wrap w-full'>
					<div className='w-1/3 flex justify-start items-center'>
						<Button
							id="modes-button"
							aria-controls={isWordTypeMenuOpen ? 'modes-menu' : undefined}
							aria-haspopup="true"
							aria-expanded={isWordTypeMenuOpen ? 'true' : undefined}
							onClick={handleOpenWordTypeMenu}
							variant='contained'
							style={{ color: "white" }}
						>
							Modes
						</Button>
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
						{/* <Button onClick={toggleAuthOverlay} variant='outlined'>
							SignUp / SignIn
						</Button> */}
					</div>
				</div>
			</header>
	)
}
