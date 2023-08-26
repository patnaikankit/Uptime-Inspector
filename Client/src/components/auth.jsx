import React, { useState } from "react";

import "./auth.css"

export const Auth = () => {
    const [signupActive, setSignupActive] = useState()
    const [data, setData] = useState({
        name: "",
        email: "",
        password: ""
    })
    const [errorMsg, setErrorMsg] = useState("")
    const [buttonDisable, setButtonDisable] = useState(false)


    const validateEmail = (email) => {
        return String(email)
          .toLowerCase()
          .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          );
      };



    const handleSignup = async () => {
        if(buttonDisable){
            return ;
        }


        if(!data.name.trim() || !data.email.trim() || !data.password){
            setErrorMsg("All Fields are Required!")
            return ;
        }

        if(!validateEmail(data.email)){
            setErrorMsg("Invalid Email Format!")
            return ;
        }

        if(data.password.length < 6){
            setErrorMsg("Password must of atleast 6 characters")
            return ;
        }
        setErrorMsg("")

        setButtonDisable(true)
        const response = await fetch("http://localhost:3000/api/v1/user/signup", {
            method: "POST",
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify({
                name: data.name.trim(),
                email: data.email,
                password: data.password
            })
        }).catch((err) => {
            setErrorMsg("Error while creating the user -> ", err.message)
        })

        setButtonDisable(false)

        if(!response){
            setErrorMsg("Error while creating the user!")
        }

        const result = await response.json()

        if(!data.status){
            setErrorMsg(data.message)
            return ;
        }

        console.log(result);
    }


    const handleLogin = async () => {

    }

    const signup = (
        <div className="box signup">
            <p className={"heading"}>SignUp</p>

        <div className={"val"}>
        <label>Name</label>
        <input
          className="input"
          placeholder="Enter Name"
          onChange={(event) =>
            setData((prev) => ({ ...prev, name: event.target.value }))
          }
        />
      </div>

        <div className={"val"}>
        <label>Email</label>
        <input
          className="input"
          placeholder="Enter Email"
          onChange={(event) =>
            setData((prev) => ({ ...prev, email: event.target.value }))
          }
        />
      </div>

        <div className={"val"}>
        <label>Password</label>
        <input
          className="input"
          type="password"
          placeholder="Enter Password"
          onChange={(event) =>
            setData((prev) => ({ ...prev, password: event.target.value }))
          }
        />
      </div>

      {errorMsg && <p className="error">{errorMsg}</p>}

      <button onClick={handleSignup} disabled={buttonDisable}>
        {buttonDisable ? "Signing up..." : "SignUp"}
      </button>

      <p className="bottom-text">
        Already an user? {" "}
        <span onClick={() => setSignupActive(false)}>Login</span>
      </p>
    </div>
    )

    const login = (
        <div className="box signup">
            <p className={"heading"}>Login</p>

        <div className={"val"}>
        <label>Email</label>
        <input
          className="input"
          placeholder="Enter Email"
          onChange={(event) =>
            setData((prev) => ({ ...prev, email: event.target.value }))
          }
        />
      </div>

        <div className={"val"}>
        <label>Password</label>
        <input
          className="input"
          type="password"
          placeholder="Enter Password"
          onChange={(event) =>
            setData((prev) => ({ ...prev, password: event.target.value }))
          }
        />
      </div>

      <button>Login</button>

      <p className="bottom-text">
        New User? {" "}
        <span onClick={() => setSignupActive(true)}>SignUp</span>
      </p>
    </div>
    )

    return (
        <div className="container">{signupActive ? signup : login}</div>
    );
}