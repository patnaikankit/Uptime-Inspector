import React, { useEffect, useState } from "react";

import Auth from "./components/Auth/Auth";
import Website from "./components/Website/website";

import "./App.css";

function App() {
  const [pageLoaded, setPageLoaded] = useState(false);
  const [showAuth, setShowAuth] = useState(true);
  const [websites, setWebsites] = useState([]);
  const [loadingWebsites, setLoadingWebsites] = useState(true);
  const [inputUrl, setInputUrl] = useState("");
  const [submitButtonDisabled, setSubmitButtonDisabled] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [deletingWebsite, setDeletingWebsite] = useState("");

  const init = async () => {
    const rawTokens = localStorage.getItem("tokens");
    if (!rawTokens) {
      setShowAuth(true);
      setPageLoaded(true);
      return;
    }
    const tokens = JSON.parse(rawTokens);
    // console.log(tokens);

    const accessToken = tokens.accessToken;
    const aExpiry = new Date(accessToken.expireAt);
    if (new Date() > aExpiry) {
      console.log("HEHE");
      const res = await fetch("http://localhost:3000/api/v1/user/new-token", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          refreshToken: tokens?.refreshToken?.token,
        }),
      }).catch((err) => void err);

      if (!res) {
        setPageLoaded(true);
        setShowAuth(true);
        localStorage.removeItem("tokens");
        return;
      }

      const data = await res.json();
      if (!data || !data.status) {
        setPageLoaded(true);
        setShowAuth(true);
        localStorage.removeItem("tokens");
        return;
      }

      const newTokens = data.data?.tokens;
      console.log(data);
      localStorage.setItem("tokens", JSON.stringify(newTokens));

      setPageLoaded(true);
      setShowAuth(false);
    } else {
      setPageLoaded(true);
      setShowAuth(false);
    }

    fetchAllWebsites();
  };

  const fetchAllWebsites = async () => {
    const rawToken = localStorage.getItem("tokens");
    const tokens = JSON.parse(rawToken);
    const accessToken = tokens.accessToken.token;

    const res = await fetch("http://localhost:3000/api/v1/website", {
      headers: {
        Authorization: accessToken,
      },
    }).catch((err) => void err);
    setLoadingWebsites(false);
    if (!res) {
      return;
    }

    const data = await res.json();

    setWebsites(data.data);
  };

  const addWebsite = async () => {
    if (!inputUrl.trim() || submitButtonDisabled) return;
    setErrorMsg("");

    const rawToken = localStorage.getItem("tokens");
    const tokens = JSON.parse(rawToken);
    const accessToken = tokens.accessToken.token;

    setSubmitButtonDisabled(true);
    const res = await fetch("http://localhost:3000/api/v1/website/create-website", {
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

    if (!res) {
      setErrorMsg("Error creating website");
      return;
    }
    const data = await res.json();

    if (!data.status) {
      setErrorMsg(data.message);
      return;
    }

    setInputUrl("")

    fetchAllWebsites();
  };

  const deleteWebsite = async (id) => {
    if (deletingWebsite) return;

    const rawToken = localStorage.getItem("tokens");
    const tokens = JSON.parse(rawToken);
    const accessToken = tokens.accessToken.token;

    setDeletingWebsite(id);
    const res = await fetch(`http://localhost:3000/api/v1/website/delete-website/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: accessToken,
      },
    }).catch((err) => void err);
    setDeletingWebsite("");

    if (!res) return;

    fetchAllWebsites();
  };

  useEffect(() => {
    init();
  }, []);

  return (
    <div className="app">
      {pageLoaded ? (
        showAuth ? (
          <Auth />
        ) : (
          <Website />
        )
      ) : (
        <div className="loading">
          <p>LOADING...</p>
        </div>
      )}
    </div>
  );
}

export default App;
