import React, { useState } from 'react'
import { Modal, Box, TextField, Tab, Tabs, Button } from '@mui/material'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

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

type AuthOverlayProps = {
	toggleAuthOverlay: React.MouseEventHandler<HTMLButtonElement> | undefined,
	isAuthModalVisible: boolean
}

function a11yProps(index: number) {
	return {
		id: `auth-${index}`,
		'aria-controls': `authpanel-${index}`,
	};
}

export default function AuthOverlay({ isAuthModalVisible, toggleAuthOverlay }: AuthOverlayProps) {
	const [value, setValue] = useState(0);

	function handleChangeTab(event: React.SyntheticEvent, newValue: number) {
		setValue(newValue);
	}

	return (
		<Modal
			open={isAuthModalVisible}
			onClose={toggleAuthOverlay}
		>
			<Box sx={style}>
				<Tabs value={value} onChange={handleChangeTab} aria-label="basic tabs example">
					<Tab label="Sign In" {...a11yProps(0)} />
					<Tab label="Sign Up" {...a11yProps(1)} />
				</Tabs>
				<SignIn value={value} index={0} />
				<SignUp value={value} index={1} />
			</Box>
		</Modal>
	)
}



function SignIn({ value, index }: { value: number, index: number }) {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const router = useRouter()
	const supabase = createClientComponentClient()

	async function handleSignIn() {
		const res = await supabase.auth.signInWithPassword({
			email,
			password,
		})

		console.log(res);
		//router.refresh()
	}

	return (
		<div role="tabpanel"
			hidden={value !== index}
			id={`authpanel-${index}`}
			aria-labelledby={`auth-${index}`}>
			<div className='flex flex-col gap-4'>
				<TextField
					id="signin-email"
					label="Email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					type='email'
					variant="standard"
				/>
				<TextField
					id="signin-password"
					label="Password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					type='password'
					variant="standard"
				/>
				<Button onClick={handleSignIn} variant='outlined'>Sign In</Button>
			</div>
		</div>
	)
}



function SignUp({ value, index }: { value: number, index: number }) {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const router = useRouter()
	const supabase = createClientComponentClient()

	async function handleSignUp() {
		await supabase.auth.signUp({
			email,
			password,
			options: {
				emailRedirectTo: `${location.origin}/auth/callback`,
			},
		})
		router.refresh()
	}


	return (
		<div role="tabpanel"
			hidden={value !== index}
			id={`authpanel-${index}`}
			aria-labelledby={`auth-${index}`}>
			<Box sx={{ p: 3 }}>
				<TextField
					id="signup-email"
					label="Email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					type='email'
					variant="standard"
				/>
				<TextField
					id="signup-password"
					label="Password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					type='password'
					variant="standard"
				/>
				<TextField
					id="confirm-password"
					label="Confirm Password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					type='password'
					variant="standard"
				/>
			</Box>
		</div>
	)
}