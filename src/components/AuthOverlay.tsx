'use client'

import React, { useState, useEffect } from 'react'
import { Modal, Box, TextField, Button } from '@mui/material'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { Database } from '@/types/supabase';

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
	toggleAuthOverlay: any,
	isAuthModalVisible: boolean,
	showErrorToast: (message : string) => void,
	showSuccessToast: (message : string) => void
}

export default function AuthOverlay({ isAuthModalVisible, toggleAuthOverlay, showErrorToast, showSuccessToast }: AuthOverlayProps) {
	const supabase = createClientComponentClient<Database>()
	const [loading, setLoading] = useState(true)
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [isNewUser, setNewUser] = useState<boolean>(false);
	const [showPasswordField, setPasswordField] = useState<boolean>(false);
	const router = useRouter();

	useEffect(() => {
		if(isAuthModalVisible) {
			setEmail('');
			setPassword('');
			setNewUser(false);
			setPasswordField(false);
		}
	}, [isAuthModalVisible])

	async function handleSubmitEmail() {
		try {
			setLoading(true);

			const { data, error, status } = await supabase
				.from('profiles')
				.select(`email`)
				.eq('email', email)
				.single()

			if (error && status !== 406) throw error

			if (data) setNewUser(false);
			else setNewUser(true);

			setPasswordField(true);

		} catch (error) {
			console.log(error);

		} finally {
			setLoading(false);
		}
	}

	async function handleSubmitPassword() {
		try {
			if (isNewUser) await signUp();
			else await signIn();
		} catch (error) {
			console.log(error);
			showErrorToast("Error occured. Try later")
		}
	}

	async function signIn() {
		const response =  await supabase.auth.signInWithPassword({
			email: email,
			password: password
		})

		if(response.error) {
			showErrorToast(response.error.message);
			throw response.error.message;
		}

		toggleAuthOverlay();
		router.refresh();
		return response;
	}

	async function signUp() {
		const response = await supabase.auth.signUp({
			email: email,
			password: password,
		})

		console.log(response);

		if (response.data.user == null) {
			throw "User not created"
		}

		showSuccessToast("User Created Successfully!");
		toggleAuthOverlay();
		router.refresh();
		return;
	}

	return (
		<Modal
			open={isAuthModalVisible}
			onClose={toggleAuthOverlay}
		>
			<Box sx={style}>
				<div className='flex flex-col gap-4 justify-center items-center'>
					<p>Enter your email</p>
					<TextField
						id="email"
						label="Email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						type='email'
						variant="standard"
					/>
					{
						showPasswordField ?
							<div className='flex flex-col gap-4'>
								<TextField
									id="password"
									label="Password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									type='password'
									variant="standard"
								/>
								<Button onClick={handleSubmitPassword} className='bg-blue-400 text-white'>{isNewUser ? "Sign Up" : "Sign In"}</Button>
							</div>
							:
							<Button onClick={handleSubmitEmail} className='bg-blue-400 text-white' variant='contained'>Submit Email</Button>
					}
				</div>
			</Box>
		</Modal>
	)
}