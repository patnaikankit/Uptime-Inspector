import React, { useState, useEffect } from "react";
import './Auth.css'

export function Auth(){

    // State change
    // to switch between signup and login page
    const [signupActive, setSignupActive] = useState()
    const [values, setValues] = useState({
        name: "",
        email: "",
        pass: "",
      });
    const [errorMsg, setErrorMsg] = useState("");
    // to disable the login/signup button once the request has been sent so that it can be proccesed properly
    const [submitButtonDisabled, setSubmitButtonDisabled] = useState(false);


    // Functions
    // to validate the email format
    const validateEmail = (email) => {
        return String(email)
          .toLowerCase()
          .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          );
      };


    // signup frontend logic  
    const handleSignup = async () => {
        if(submitButtonDisabled){
            return;
        }

        if(!values.name.trim() || !values.email.trim() || !values.pass.trim()){
            setErrorMsg("All Fields are Required!")
            return;
        }

        if(!validateEmail(values.email)){
            setErrorMsg("Invalid Email!");
            return; 
        }

        if(values.pass.length < 6){
            setErrorMsg("Password must be at least 6 characters!");
            return;
        }

        setErrorMsg("")

        // if all the above checks are passed then disable the button and wait for the response
        setSubmitButtonDisabled(true)
        const response = await fetch("https://uptime-inspector.onrender.com/api/v1/user/signup", {
            method: "POST",
            headers: {
              "content-type": "application/json",
            },
            body: JSON.stringify({
              name: values.name.trim(),
              email: values.email,
              password: values.pass,
            }),
          })
          .catch((err) => {
            setErrorMsg("Error while creating the user -> ", err.message);
          });
        setSubmitButtonDisabled(false)

        if(!response){
            setErrorMsg("Error creating a user!")
            return;
        }

        const data = await response.json();

        if(!data.status){
            setErrorMsg(data.message)
        }

        const tokens = data.data.tokens;

        // Store access token in localStorage
        localStorage.setItem("tokens", JSON.stringify(tokens));

        // You can also store the token in a state if needed
        // setAccessToken(tokens.accessToken);

        // Reload the window (you might want to replace this with a more elegant state update)
        window.location.reload()
    }


    const handleLogin = async () => {
        if(submitButtonDisabled){
            return;
        }

        if(!values.email.trim() || !values.pass.trim()){
            setErrorMsg("All Fields are Required!")
            return;
        }

        if(!validateEmail(values.email)){
            setErrorMsg("Invalid Email!");
            return; 
        }

        if(values.pass.length < 6){
            setErrorMsg("Password must be at least 6 characters!");
            return;
        }

        setErrorMsg("")

        // if all the above checks are passed then disable the button and wait for the response
        setSubmitButtonDisabled(true)
        const response = await fetch("https://uptime-inspector.onrender.com/api/v1/user/login", {
            method: "POST",
            headers: {
              "content-type": "application/json",
            },
            body: JSON.stringify({
              email: values.email,
              password: values.pass,
            }),
          })
          .catch((err) => {
            setErrorMsg("Error while Login -> ", err.message);
          });
        setSubmitButtonDisabled(false)

        if(!response){
            setErrorMsg("Error in Login!")
            return;
        }

        const data = await response.json();

        if(!data.status){
            setErrorMsg(data.message)
        }

        const tokens = data.data.tokens;

        // Store access token in localStorage
        localStorage.setItem("tokens", JSON.stringify(tokens));

        // You can also store the token in a state if needed
        // setAccessToken(tokens.accessToken);

        // Reload the window (you might want to replace this with a more elegant state update)
        window.location.reload()
    }

    useEffect(() => {
        setValues({
          name: "",
          email: "",
          pass: "",
        });
      }, [signupActive]);


    const signup = (
        <div className="box signup">
            <p className={"heading"}>Sign Up</p>

            <div className={"elem"}>
                <label>Name</label>
                    <input
                    className="input"
                    placeholder="Enter name"
                    onChange={(event) =>
                        setValues((prev) => ({ ...prev, name: event.target.value }))
                    }
                    />
            </div>

            <div className={"elem"}>
                <label>Email</label>
                    <input
                    className="input"
                    placeholder="Enter email"
                    onChange={(event) =>
                        setValues((prev) => ({ ...prev, email: event.target.value }))
                    }
                    />
            </div>

            <div className={"elem"}>
                <label>Password</label>
                <input
                className="input"
                type="password"
                placeholder="Enter password"
                onChange={(event) =>
                    setValues((prev) => ({ ...prev, pass: event.target.value }))
                }
                />
            </div>

            {errorMsg && <p className="error">{errorMsg}</p>}
            
            <button onClick={handleSignup} disabled={submitButtonDisabled}>{submitButtonDisabled ? "Signing up..." : "Signup"}</button>

            <p className="bottom-text">
                Already a user ?{" "}<span onClick={() => setSignupActive(false)}>Login here</span>
            </p>
        </div>
    )

    const login = (
        <div className="box signup">
            <p className={"heading"}>Login</p>

            <div className={"elem"}>
                <label>Email</label>
                    <input
                    className="input"
                    placeholder="Enter email"
                    onChange={(event) =>
                        setValues((prev) => ({ ...prev, email: event.target.value }))
                    }
                    />
            </div>

            <div className={"elem"}>
                <label>Password</label>
                <input
                className="input"
                type="password"
                placeholder="Enter password"
                onChange={(event) =>
                    setValues((prev) => ({ ...prev, pass: event.target.value }))
                }
                />
            </div>

            {errorMsg && <p className="error">{errorMsg}</p>}

            <button onClick={handleLogin} disabled={submitButtonDisabled}>
                {submitButtonDisabled ? "Logging in..." : "Login"}
            </button>

            <p className="bottom-text">
                New user ?{" "}
                <span onClick={() => setSignupActive(true)}>Signup here</span>
            </p>
        </div>
    )

    return(
        <div className="container">{signupActive ? signup : login}</div>
    );
}