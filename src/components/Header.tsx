import { Button, Menu, MenuItem, Divider } from '@mui/material'
import Link from 'next/link'
import React, { useState } from 'react'
import { wordType } from '@/types/words'
import { Settings, Info, Whatshot, Spa } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { Database } from '@/types/supabase';


type HeaderProps = {
	wordType: wordType,
	toggleHelpOverlay: React.MouseEventHandler<HTMLButtonElement> | undefined,
	toggleSettingsOverlay: React.MouseEventHandler<HTMLButtonElement> | undefined,
	toggleAuthOverlay: React.MouseEventHandler<HTMLButtonElement> | undefined,
	toggleStatsOverlay: React.MouseEventHandler<HTMLButtonElement> | undefined,
	email: string | undefined,
	streakData: Database['public']['Tables']['daily_streak']['Row'] | null
}

export default function Header({
	wordType,
	toggleHelpOverlay,
	toggleSettingsOverlay,
	toggleAuthOverlay,
	toggleStatsOverlay,
	email,
	streakData
}: HeaderProps) {
	const today = new Date().toISOString().split('T')[0];
	const [wordTypeMenuEl, setWordTypeMenuEl] = useState<null | HTMLElement>(null);
	const [userSettingsMenuEl, setUserSettingsMenuEl] = useState<null | HTMLElement>(null);
	const isWordTypeMenuOpen = Boolean(wordTypeMenuEl);
	const isUserSettingsMenuOpen = Boolean(userSettingsMenuEl);
	const isDailyWordSolved = today == streakData?.recent_date
	const router = useRouter();


	function handleOpenWordTypeMenu(event: React.MouseEvent<HTMLButtonElement>) {
		setWordTypeMenuEl(event.currentTarget);
	}

	function handleCloseWordTypeMenu() {
		setWordTypeMenuEl(null);
	}


	function handleOpenUserSettingsMenu(event: React.MouseEvent<HTMLButtonElement>) {
		setUserSettingsMenuEl(event.currentTarget);
	}

	function handleCloseUserSettingsMenu() {
		setUserSettingsMenuEl(null);
	}

	function handleLogout() {
		fetch('/auth/signout', {
			method: 'POST'
		}).then(() => {
			router.refresh();
		})
	}


	return (
		<header className='fixed top-0 left-0 border-b border-slate-700 w-full bg-primary-bg z-10 sm:h-[60px] h-[85px]'>
			<div className='flex flex-col sm:flex-row gap-2 sm:gap-0  items-center justify-center sm:justify-between h-full w-full'>
				<div className="hidden sm:block sm:w-1/3">

				</div>
				<div className='w-full sm:w-1/3 flex flex-row gap-2 justify-center items-center'>
					<h1 className='text-lg sm:text-3xl font-extrabold select-none'>LexiGuess</h1>
					<p style={{ display: wordType == "hard" || wordType == "daily" ? "flex" : "none" }} className='border border-slate-300 rounded-lg px-2 py-1 text-[10px] h-[30px] flex justify-center items-center capitalize'>{wordType}</p>
				</div>
				<div className='sm:w-1/3 flex justify-end items-center gap-2'>
					<button onClick={toggleHelpOverlay} className='hover:bg-slate-800 rounded-lg p-2 duration-200'>
						<Info />
					</button>
					<button onClick={toggleSettingsOverlay} className='hover:bg-slate-800 rounded-lg p-2 duration-200'>
						<Settings />
					</button>
					<Button
						id="modes-button"
						aria-controls={isWordTypeMenuOpen ? 'modes-menu' : undefined}
						aria-haspopup="true"
						aria-expanded={isWordTypeMenuOpen ? 'true' : undefined}
						onClick={handleOpenWordTypeMenu}
						variant='contained'
						className='text-white bg-blue-400'
					>
						Modes
					</Button>
					<Menu
						id="modes-menu"
						anchorEl={wordTypeMenuEl}
						open={isWordTypeMenuOpen}
						onClose={handleCloseWordTypeMenu}
						MenuListProps={{
							'aria-labelledby': 'modes-button',
						}}
					>
						<MenuItem style={{ display: wordType == "daily" ? "none" : "block" }}><Link onClick={handleCloseWordTypeMenu} href={`?type=daily`} >
							Daily mode
						</Link></MenuItem>
						{wordType != "daily" && <Divider />}
						<MenuItem style={{ display: wordType == "hard" ? "none" : "block" }}><Link onClick={handleCloseWordTypeMenu} href={`?type=hard`} >
							Hard mode
						</Link></MenuItem>
						<MenuItem style={{ display: wordType == "normal" ? "none" : "block" }}><Link onClick={handleCloseWordTypeMenu} href={`?type=normal`} >
							Normal mode
						</Link></MenuItem>
					</Menu>

					<button style={{ display: email ? "flex" : "none" }} onClick={toggleStatsOverlay} className={(isDailyWordSolved ? 'bg-[#8F0200] hover:bg-[#B80300]' : 'hover:bg-slate-800') + '  rounded-lg p-2 duration-200 gap-1'}>
						{
							isDailyWordSolved ?
								<>	<span className='text-[#FF5E5B]'>{streakData?.current_streak}</span>
									<Whatshot style={{ fill: '#FF5E5B' }} /></>
								:
								<>{streakData?.current_streak}
									<Whatshot /></>
						}
					</button>
					<button
						style={{ display: email ? "flex" : "none" }}
						id="user-menu-button"
						aria-controls={isUserSettingsMenuOpen ? 'user-menu' : undefined}
						aria-haspopup="true"
						aria-expanded={isUserSettingsMenuOpen ? 'true' : undefined}
						onClick={handleOpenUserSettingsMenu}
						className='uppercase bg-slate-700 w-10 h-10 rounded-full flex justify-center items-center'>
						{email ? email[0] : ''}
					</button>
					<Button style={{ display: email ? "none" : "flex" }} onClick={toggleAuthOverlay} variant='outlined'>
						SignUp / SignIn
					</Button>
					<Menu
						id="user-menu"
						anchorEl={userSettingsMenuEl}
						open={isUserSettingsMenuOpen}
						onClose={handleCloseUserSettingsMenu}
						MenuListProps={{
							'aria-labelledby': 'user-menu-button',
						}}
					>
						<MenuItem onClick={() => { handleCloseUserSettingsMenu(); handleLogout(); }}>Logout</MenuItem>
					</Menu>
				</div>
			</div>
		</header>
	)
}