'use client'

import { useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Home() {
  useEffect(() => {
    const testConnection = async () => {
      const { data, error } = await supabase
        .from('test')
        .select('*')

      console.log('data:', data)
      console.log('error:', error)
    }

    testConnection()
  }, [])

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold">
        Supabase Connected
      </h1>
      <p>打开浏览器 Console 看结果</p>
    </div>
  )
}