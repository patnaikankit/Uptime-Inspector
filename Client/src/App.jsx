import React, { useState, useEffect } from "react";
import './App.css'
import { Auth } from '../components/Auth/Auth.jsx'

function App() {
  // State Change
  // to set it true between request response intermediate time
  const [pageLoaded, setPageLoaded] = useState(false);
  // common file for the home and main page so depending whether the user is authticated or not show the login or main page
  const [showAuth, setShowAuth] = useState(true);
  // to store the websites added by the user
  const [websites, setWebsites] = useState([]);
  const [loadingWebsites, setLoadingWebsites] = useState(true);
  // to store the url passed by the user 
  const [inputUrl, setInputUrl] = useState("");
  // to disable the add button once the request has been sent so that it can be proccesed properly
  const [submitButtonDisabled, setSubmitButtonDisabled] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [deletingWebsite, setDeletingWebsite] = useState("");


  // Functions
  // this function checks whether the user is authenticated or not
  // we will also check at each stage whether the user is authenticated to perform a particular action or not 
  // authentication will be done in each subsequent function before the particular action is performed
  const website = async () => {
    const rawTokens = localStorage.getItem("tokens");
    if(!rawTokens){
      setShowAuth(true);
      setPageLoaded(true);
      return;
    }
    const tokens = JSON.parse(rawTokens);

    const accessToken = tokens.accessToken;
    const aExpiry = new Date(accessToken.expireAt);
    if(new Date() > aExpiry){
      const response = await fetch("https://uptime-inspector.onrender.com/api/v1/user/new-token", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          refreshToken: tokens?.refreshToken?.token,
        }),
      }).catch((err) => void err);

      if(!response){
        setPageLoaded(true);
        setShowAuth(true);
        localStorage.removeItem("tokens");
        return;
      }

      const data = await response.json();
        if(!data || !data.status){
          setPageLoaded(true);
          setShowAuth(true);
          localStorage.removeItem("tokens");
          return;
        }
  
        const newTokens = data.data?.tokens;
        localStorage.setItem("tokens", JSON.stringify(newTokens));
  
        setShowAuth(false);
        setLoadingWebsites(true);
        setPageLoaded(true);
      } 
      else{
        setShowAuth(false);
        setLoadingWebsites(true);
        setPageLoaded(true);
      }

      fetchAllWebsites();
    };


    // to show all stored websites
    const fetchAllWebsites = async () => {
      const rawToken = localStorage.getItem("tokens");
      const tokens = JSON.parse(rawToken);
      const accessToken = tokens?.accessToken?.token;
  
      const response = await fetch("https://uptime-inspector.onrender.com/api/v1/website", {
        headers: {
          Authorization: accessToken,
        },
      }).catch((err) => void err);
      setLoadingWebsites(false);
      if(!response){
        return;
      }
  
      const data = await response.json();
  
      setWebsites(data.data);
    };
  
    // to add a new website
    const addWebsite = async () => {
      if (!inputUrl.trim() || submitButtonDisabled){
        return;
      } 
      setErrorMsg("");
  
      const rawToken = localStorage.getItem("tokens");
      const tokens = JSON.parse(rawToken);
      const accessToken = tokens.accessToken.token;
  
      setSubmitButtonDisabled(true);
      const response = await fetch("https://uptime-inspector.onrender.com/api/v1/website/create-website", {
        method: "POST",
        headers: {
          Authorization: accessToken,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          url: inputUrl,
        }),
      }).catch((err) => void err);
      setSubmitButtonDisabled(false);
  
      if(!response){
        setErrorMsg("Error creating website");
        return;
      }
      const data = await response.json();
  
      if(!data.status){
        setErrorMsg(data.message);
        return;
      }
  
      setInputUrl("");
  
      fetchAllWebsites();
    };
  

    // to delete a existing website
    const deleteWebsite = async (id) => {
      if(deletingWebsite){
        return;
      } 
  
      const rawToken = localStorage.getItem("tokens");
      const tokens = JSON.parse(rawToken);
      const accessToken = tokens.accessToken.token;
  
      setDeletingWebsite(id);
      // we have to pass the unique id associated with each webiste to delete it
      const response = await fetch(`https://uptime-inspector.onrender.com/api/v1/website/delete-website/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: accessToken,
        },
      }).catch((err) => void err);
      setDeletingWebsite("");
  
      if(!response){
        return;
      }
  
      fetchAllWebsites();
    };


    useEffect(() => {
      website();
    }, []);


    return (
      <div className="app">
        {pageLoaded ? (
          showAuth ? (
            <Auth />
          ) : (
            <div className="inner-app">
            <div className={"app-header"}>
              <p className="heading">Add Website for monitoring</p>

              <div className="elem">
                <label>Enter Website URL</label>
                <input
                  className="input"
                  placeholder="https://www.google.com"
                  value={inputUrl}
                  onChange={(event) => setInputUrl(event.target.value)}
                />
              </div>

              {errorMsg && <p className="error">{errorMsg}</p>}

              <button onClick={addWebsite} disabled={submitButtonDisabled}>
                {submitButtonDisabled ? "Adding..." : "Add"}
              </button>
            </div>

            <div className="body">
              <p className="heading">Your Websites</p>

              {loadingWebsites ? (
                <p>LOADING...</p>
              ) : (
                <div className={"cards"}>
                  {websites.length ? (
                    websites.map((item) => (
                      <div className={"card"} key={item._id}>
                        <div className="left">
                          <p
                            className={`link ${
                              item.isActive ? "green" : "red"
                            }`}
                          >
                            {item.isActive ? "ACTIVE" : "DOWN"}
                          </p>
                          <p className="url">{item.url}</p>
                        </div>

                        <div className="right">
                          <p
                            className="link red"
                            onClick={() => deleteWebsite(item._id)}
                          >
                            {deletingWebsite === item._id
                              ? "Deleting..."
                              : "Delete"}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>No Websites added!</p>
                  )}
                </div>
              )}
            </div>
          </div>
          )
        ) : (
          <div className="loading">
            <p>LOADING...</p>
          </div>
        )}
      </div>
    );
}


export default App
