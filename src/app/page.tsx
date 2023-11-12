import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/types/supabase'
import Home from './home'

export default async function Page() {
	const supabase = createServerComponentClient<Database>({ cookies })

	async function getDailyStreak(userId : string) {
		const { data, error } = await supabase
		  .from('daily_streak')
		  .select('*')
		  .eq('user_id', userId)
		  .single();
	  
		if (error) {
		  console.error('Error fetching daily streak:', error.message);
		  return null;
		}
	  
		return data;
	  }

	try {

		const {
			data: { session },
		} = await supabase.auth.getSession()

		if (session?.user.id) {
			const { data, error } = await supabase.from('profiles').select('completed_words').eq('id', session?.user.id);
			if (data == null || error) throw ''

			if(!data[0].completed_words) throw ''

			const streakData = await getDailyStreak(session.user.id);

			return <Home session={session} completedWords={data[0].completed_words} streakData={streakData}/>
		} else {
			throw ''
		}
	} catch (error) {
		return <Home session={null} completedWords={[]} streakData={null}/>
	}
}