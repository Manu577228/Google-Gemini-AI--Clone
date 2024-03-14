import { createContext, useState } from "react";
import runChat from "../config/gemini";

export const Context = createContext();

const ContextProvider = (props) => {
  const [input, setInput] = useState("");
  const [recentPrompt, setRecentPrompt] = useState("");
  const [prevPrompts, setPrevPrompts] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState("");

  const delayParameter = (index, nextWord) => {
    setTimeout(function () {
      setResultData((prev) => prev + nextWord);
    }, 75 * index);
  };

  const newChat = () => {
    setLoading(false);
    setShowResult(false);
  };

  const onSent = async (prompt) => {
    setResultData("");
    setLoading(true);
    setShowResult(true);
    let response;
    if (prompt !== undefined) {
      response = await runChat(prompt);
      setRecentPrompt(prompt);
    } else {
      setPrevPrompts((prev) => [...prev, input]);
      setRecentPrompt(input);
      response = await runChat(input);
    }
    let responseArray = response.split("**");
    let formattedResponse = "";
    for (let i = 0; i < responseArray.length; i++) {
      if (i === 0 || i % 2 !== 1) {
        // Check if the word is a URL starting with "https://"
        if (responseArray[i].startsWith("https://")) {
          // Remove the colon ":" from the URL
          const url = responseArray[i].replace(":", "");
          formattedResponse += `<a href="${url}" target="_blank">${url}</a><br/>`;
        } else {
          formattedResponse += responseArray[i] + "<br/>";
        }
      } else {
        formattedResponse += "<b>" + responseArray[i] + "</b><br/>";
      }
    }
    // Remove asterisks (*) from the final response
    const cleanedResponse = formattedResponse.replace(/\*/g, "");
    const words = cleanedResponse.split(" ");
    for (let i = 0; i < words.length; i++) {
      let nextWord = words[i];
      delayParameter(i, nextWord + " ");
    }
    setLoading(false);
    setInput("");
  };

  const contextValue = {
    prevPrompts,
    setPrevPrompts,
    onSent,
    setRecentPrompt,
    recentPrompt,
    showResult,
    loading,
    resultData,
    input,
    setInput,
    newChat,
  };

  return (
    <Context.Provider value={contextValue}>{props.children}</Context.Provider>
  );
};

export default ContextProvider;
