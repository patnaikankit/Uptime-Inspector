import React, { useEffect, useState } from 'react'
import { Auth } from '../Auth/auth'
import "./website.css"

export default function Website() {
    // state change
    const [pageLoaded, setPageLoaded] = useState(false)
    const [showAuth, setShowAuth] = useState(false)
    

    const isAuth = async () => {
        const rawTokens = localStorage.getItem("tokens")
        if(!tokens){
            setShowAuth(true)
            setPageLoaded(true)
            return ;
        }
        const tokens = JSON.parse(rawTokens)

        const accessToken = tokens.accessToken
        const aExpiry = new Date(accessToken.expireAt)
        if(new Date > aExpiry){
            const response = await fetch("http://localhost:3000/api/v1/user/new-token", {
                method: "POST",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({
                    refreshToken: tokens?.refreshToken?.token,
                })
            }).catch((err) => void err)

            if(!response){
                setPageLoaded(true)
                setShowAuth(true)
                localStorage.removeItem("tokens")
                return ;
            }

            const result = await response.json()

            if(!result || result.status){
                setPageLoaded(true)
                setShowAuth(true)
                localStorage.removeItem("tokens")
                return ;
            }

            const tokens = result.data?.tokens
            localStorage.setItem("tokens", JSON.stringify(tokens))
            console.log(result);
        }
        else{
            setPageLoaded(true)
            setShowAuth(false)
        }
    }

    useEffect(() => {
        isAuth()
    }, [])

  return (
    <div>
        {
            pageLoaded ? (
                showAuth ? (
                    <Auth />
                ) : (
                    <div className='app'></div>
                )
            ) : (
                <div className='loading'>
                    <p>Loading...</p>
                </div>
            )
        }
    </div>
  )
}
