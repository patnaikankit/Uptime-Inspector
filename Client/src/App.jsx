import React, { useState, useEffect } from "react";
import { Auth } from "./components/Auth/auth";

function App() {
  const [pageLoaded, setPageLoaded] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [websites, setWebsites] = useState([]);
  const [loadingWebsite, setLoadingWebsite] = useState(true);
  const [inputUrl, setInputUrl] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [deletingWebsite, setDeletingWebsite] = useState("");

  const isAuth = async () => {
    const rawTokens = localStorage.getItem("tokens");
    if (!rawTokens) {
      setShowAuth(true);
      setPageLoaded(true);
      return;
    }
    const tokens = JSON.parse(rawTokens);

    const accessToken = tokens.accessToken;
    const aExpiry = new Date(accessToken.expireAt);
    if (new Date() > aExpiry) {
      const response = await fetch(
        "http://localhost:3000/api/v1/user/new-token",
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            refreshToken: tokens?.refreshToken?.token,
          }),
        }
      ).catch((err) => console.error(err));

      if (!response) {
        setPageLoaded(true);
        setShowAuth(true);
        localStorage.removeItem("tokens");
        return;
      }

      const result = await response.json();

      if (!result || result.status) {
        setPageLoaded(true);
        setShowAuth(true);
        localStorage.removeItem("tokens");
        return;
      }

      const newTokens = result.data?.tokens;
      localStorage.setItem("tokens", JSON.stringify(newTokens));
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

    setLoadingWebsite(true);
    const response = await fetch("http://localhost:3000/api/v1/website", {
      headers: {
        Authorization: accessToken,
      },
    }).catch((err) => console.error(err));

    setLoadingWebsite(false);

    if (!response) {
      return;
    }

    const result = await response.json();

    setWebsites(result.data);
  };

  const addWebsite = async () => {
    if (!inputUrl) {
      return;
    }
    setLoadingWebsite(true);

    const rawToken = localStorage.getItem("tokens");
    const tokens = JSON.parse(rawToken);
    const accessToken = tokens.accessToken.token;

    const response = await fetch(
      "http://localhost:3000/api/v1/website/create-website",
      {
        method: "POST",
        headers: {
          Authorization: accessToken,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          url: inputUrl,
        }),
      }
    ).catch((err) => console.error(err));

    setLoadingWebsite(false);

    if (!response) {
      setErrorMsg("Error while creating your website!");
      return;
    }

    const result = await response.json();
    if (!result) {
      setErrorMsg(result.message);
      return;
    }

    setInputUrl("");
    fetchAllWebsites();
  };

  const deleteWebsite = async (id) => {
    if (deletingWebsite) {
      return;
    }

    const rawToken = localStorage.getItem("tokens");
    const tokens = JSON.parse(rawToken);
    const accessToken = tokens.accessToken.token;

    setDeletingWebsite(id);
    const response = await fetch(
      `http://localhost:3000/api/v1/website/delete-website/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: accessToken,
        },
      }
    ).catch((err) => console.error(err));

    setDeletingWebsite("");
    if (!response) {
      return;
    }

    fetchAllWebsites();
  };

  useEffect(() => {
    isAuth();
  }, []);

  return (
    <div>
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
                placeholder="https://google.com"
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

            {loadingWebsite ? (
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
                          {deleteWebsite === item._id
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
          <p>Loading...</p>
        </div>
      )}
    </div>
  );
}

export default App;
