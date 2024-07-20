index.tsx:
import React, { useState, useEffect } from "react";
import { FaArrowRight } from "react-icons/fa6";
import axios from "axios";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { IoHome } from "react-icons/io5";

interface Conversation {
  prompt: string;
  response: string;
  isLoading: boolean;
}

const Home: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [threadId, setThreadId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentResponse, setCurrentResponse] = useState<string | null>(null);
  const [typedResponse, setTypedResponse] = useState<string>("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };

  const handleSearch = async () => {
    console.log("Submitting: ", searchTerm);
    setLoading(true);
    setHasSearched(true);
    if (!threadId) {
      try {
        const response = await axios.post(
          "https://ti.aitaskmasters.net/api/new-thread",
          {},
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const newThreadId = response.data.threadId;
        setThreadId(newThreadId);
        console.log("New Thread ID: ", newThreadId);
        await continueConversation(newThreadId, searchTerm);
      } catch (error) {
        console.error("Error creating thread: ", error);
      } finally {
        setLoading(false);
      }
    } else {
      await continueConversation(threadId, searchTerm);
    }
    setSearchTerm("");
    setHasSearched(true);
  };

  const continueConversation = async (
    threadId: string | null,
    input: string
  ) => {
    setConversations((prevConversations) => [
      ...prevConversations,
      { prompt: input, response: "", isLoading: true },
    ]);
    setSearchTerm("");
    try {
      const response = await axios.post(
        "https://ti.aitaskmasters.net/api/response",
        { threadId, input },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Prompt: ", input);
      console.log("Response: ", response.data);
      const responseData = response.data.response.value;

      setConversations((prevConversations) => {
        return prevConversations.map((conversation) =>
          conversation.prompt === input
            ? { ...conversation, response: responseData, isLoading: false }
            : conversation
        );
      });
      setCurrentResponse(responseData);
      setTypedResponse("");
    } catch (error) {
      console.error("Error continuing conversation: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentResponse) {
      let index = 0;
      const interval = setInterval(() => {
        if (index < currentResponse.length) {
          setTypedResponse((prev) => prev + currentResponse[index]);
          index += 1;
        } else {
          clearInterval(interval);
          setTypedResponse(currentResponse);
        }
      }, 10);
      return () => clearInterval(interval);
    }
  }, [currentResponse]);

  const handleHomeClick = () => {
    window.location.reload();
    setHasSearched(false);
  }


  return (
    <div className="flex items-center justify-center min-h-screen bg-white px-4">

      <div className="w-full max-w-2xl">
        {!hasSearched ? (
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-black mb-5 bg-custom-gradient">
              Search smarter & faster
            </h1>
            <div className="flex justify-center items-center">
              <input
                type="text"
                value={searchTerm}
                placeholder="Ask anything"
                onChange={handleInputChange}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full py-3 pl-4 pr-20 text-lg text-gray-700 bg-white border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700 shadow-[2px_2px_38px_0px_rgba(0,0,0,0.25),0px_-2px_4px_0px_rgba(0,0,0,0.25)_inset,1px_2px_4px_0px_rgba(0,0,0,0.25)_inset]"
              />
              <button
                onClick={handleSearch}
                className="flex justify-center items-center w-15 h-15 ml-[-47px] bg-[#333333] text-white text-lg font-bold p-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <FaArrowRight />
              </button>
              <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 z-1000">
                Consider checking important information. AI can make mistakes.
              </div>
            </div>

            {/* <div className="flex flex-wrap p-4 ">
              <div className="w-1/2 p-2">
                <div
                  onClick={() =>
                    handleInputChange({
                      target: {
                        value:
                          "What are the key features of the Trade Ideas platform?",
                      },
                    } as React.ChangeEvent<HTMLInputElement>)
                  }
                  className="bg-white rounded-lg shadow-md hover:bg-gray-100 hover:scale-105 transform transition duration-300 ease-in-out h-18 flex cursor-pointer"
                >
                  <div className="w-1/5 flex items-center justify-center p-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      id="message"
                      className="w-8 h-8 text-gray-500"
                    >
                      <g>
                        <g>
                          <rect width="24" height="24" opacity="0"></rect>
                          <path d="M19.07 4.93a10 10 0 0 0-16.28 11 1.06 1.06 0 0 1 .09.64L2 20.8a1 1 0 0 0 .27.91A1 1 0 0 0 3 22h.2l4.28-.86a1.26 1.26 0 0 1 .64.09 10 10 0 0 0 11-16.28zM8 13a1 1 0 1 1 1-1 1 1 0 0 1-1 1zm4 0a1 1 0 1 1 1-1 1 1 0 0 1-1 1zm4 0a1 1 0 1 1 1-1 1 1 0 0 1-1 1z"></path>
                        </g>
                      </g>
                    </svg>
                  </div>
                  <div className="w-4/5 flex items-center text-left p-4 text-gray-800">
                    What are the key features of the Trade Ideas platform?
                  </div>
                </div>
              </div>

              <div className="w-1/2 p-2">
                <div
                  onClick={() =>
                    handleInputChange({
                      target: {
                        value: "How does the Oddsmaker backtesting tool work?",
                      },
                    } as React.ChangeEvent<HTMLInputElement>)
                  }
                  className="bg-white rounded-lg shadow-md hover:bg-gray-100 hover:scale-105 transform transition duration-300 ease-in-out h-18 flex cursor-pointer"
                >
                  <div className="w-1/5 flex items-center justify-center p-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      id="message"
                      className="w-8 h-8 text-gray-500"
                    >
                      <g>
                        <g>
                          <rect width="24" height="24" opacity="0"></rect>
                          <path d="M19.07 4.93a10 10 0 0 0-16.28 11 1.06 1.06 0 0 1 .09.64L2 20.8a1 1 0 0 0 .27.91A1 1 0 0 0 3 22h.2l4.28-.86a1.26 1.26 0 0 1 .64.09 10 10 0 0 0 11-16.28zM8 13a1 1 0 1 1 1-1 1 1 0 0 1-1 1zm4 0a1 1 0 1 1 1-1 1 1 0 0 1-1 1zm4 0a1 1 0 1 1 1-1 1 1 0 0 1-1 1z"></path>
                        </g>
                      </g>
                    </svg>
                  </div>
                  <div className="w-4/5 flex items-center text-left p-4 text-gray-800">
                    How does the Oddsmaker backtesting tool work?
                  </div>
                </div>
              </div>

              <div className="w-1/2 p-2">
                <div
                  onClick={() =>
                    handleInputChange({
                      target: {
                        value:
                          'How does the AI system "Holly" work to provide trade signals?',
                      },
                    } as React.ChangeEvent<HTMLInputElement>)
                  }
                  className="bg-white rounded-lg shadow-md hover:bg-gray-100 hover:scale-105 transform transition duration-300 ease-in-out h-18 flex cursor-pointer"
                >
                  <div className="w-1/5 flex items-center justify-center p-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      id="message"
                      className="w-8 h-8 text-gray-500"
                    >
                      <g>
                        <g>
                          <rect width="24" height="24" opacity="0"></rect>
                          <path d="M19.07 4.93a10 10 0 0 0-16.28 11 1.06 1.06 0 0 1 .09.64L2 20.8a1 1 0 0 0 .27.91A1 1 0 0 0 3 22h.2l4.28-.86a1.26 1.26 0 0 1 .64.09 10 10 0 0 0 11-16.28zM8 13a1 1 0 1 1 1-1 1 1 0 0 1-1 1zm4 0a1 1 0 1 1 1-1 1 1 0 0 1-1 1zm4 0a1 1 0 1 1 1-1 1 1 0 0 1-1 1z"></path>
                        </g>
                      </g>
                    </svg>
                  </div>
                  <div className="w-4/5 flex items-center text-left p-4 text-gray-800">
                    How does the AI system "Holly" work to provide trade
                    signals?
                  </div>
                </div>
              </div>

              <div className="w-1/2 p-2">
                <div
                  onClick={() =>
                    handleInputChange({
                      target: {
                        value:
                          "Can you explain the different pricing plans and what's included in each?",
                      },
                    } as React.ChangeEvent<HTMLInputElement>)
                  }
                  className="bg-white rounded-lg shadow-md hover:bg-gray-100 hover:scale-105 transform transition duration-300 ease-in-out h-18 flex cursor-pointer"
                >
                  <div className="w-1/5 flex items-center justify-center p-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      id="message"
                      className="w-8 h-8 text-gray-500"
                    >
                      <g>
                        <g>
                          <rect width="24" height="24" opacity="0"></rect>
                          <path d="M19.07 4.93a10 10 0 0 0-16.28 11 1.06 1.06 0 0 1 .09.64L2 20.8a1 1 0 0 0 .27.91A1 1 0 0 0 3 22h.2l4.28-.86a1.26 1.26 0 0 1 .64.09 10 10 0 0 0 11-16.28zM8 13a1 1 0 1 1 1-1 1 1 0 0 1-1 1zm4 0a1 1 0 1 1 1-1 1 1 0 0 1-1 1zm4 0a1 1 0 1 1 1-1 1 1 0 0 1-1 1z"></path>
                        </g>
                      </g>
                    </svg>
                  </div>
                  <div className="w-4/5 flex items-center p-4 text-left text-gray-800">
                    Can you explain the different pricing plans and what's
                    included in each?
                  </div>
                </div>
              </div>

              <div className="w-1/2 p-2">
                <div
                  onClick={() =>
                    handleInputChange({
                      target: {
                        value:
                          "What kind of charting and technical analysis tools does Trade Ideas offer?",
                      },
                    } as React.ChangeEvent<HTMLInputElement>)
                  }
                  className="bg-white rounded-lg shadow-md hover:bg-gray-100 hover:scale-105 transform transition duration-300 ease-in-out h-18 flex cursor-pointer"
                >
                  <div className="w-1/5 flex items-center justify-center p-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      id="message"
                      className="w-8 h-8 text-gray-500"
                    >
                      <g>
                        <g>
                          <rect width="24" height="24" opacity="0"></rect>
                          <path d="M19.07 4.93a10 10 0 0 0-16.28 11 1.06 1.06 0 0 1 .09.64L2 20.8a1 1 0 0 0 .27.91A1 1 0 0 0 3 22h.2l4.28-.86a1.26 1.26 0 0 1 .64.09 10 10 0 0 0 11-16.28zM8 13a1 1 0 1 1 1-1 1 1 0 0 1-1 1zm4 0a1 1 0 1 1 1-1 1 1 0 0 1-1 1zm4 0a1 1 0 1 1 1-1 1 1 0 0 1-1 1z"></path>
                        </g>
                      </g>
                    </svg>
                  </div>
                  <div className="w-4/5 flex items-center p-4 text-left text-gray-800">
                    What kind of charting and technical analysis tools does
                    Trade Ideas offer?
                  </div>
                </div>
              </div>

              <div className="w-1/2 p-2">
                <div
                  onClick={() =>
                    handleInputChange({
                      target: {
                        value:
                          "Does Trade Ideas integrate with my existing brokerag account?",
                      },
                    } as React.ChangeEvent<HTMLInputElement>)
                  }
                  className="bg-white rounded-lg shadow-md hover:bg-gray-100 hover:scale-105 transform transition duration-300 ease-in-out h-18 flex cursor-pointer"
                >
                  <div className="w-1/5 flex items-center justify-center p-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      id="message"
                      className="w-8 h-8 text-gray-500"
                    >
                      <g>
                        <g>
                          <rect width="24" height="24" opacity="0"></rect>
                          <path d="M19.07 4.93a10 10 0 0 0-16.28 11 1.06 1.06 0 0 1 .09.64L2 20.8a1 1 0 0 0 .27.91A1 1 0 0 0 3 22h.2l4.28-.86a1.26 1.26 0 0 1 .64.09 10 10 0 0 0 11-16.28zM8 13a1 1 0 1 1 1-1 1 1 0 0 1-1 1zm4 0a1 1 0 1 1 1-1 1 1 0 0 1-1 1zm4 0a1 1 0 1 1 1-1 1 1 0 0 1-1 1z"></path>
                        </g>
                      </g>
                    </svg>
                  </div>
                  <div className="w-4/5 flex items-center p-4 text-left text-gray-800">
                    Does Trade Ideas integrate with my existing brokerage
                    account?
                  </div>
                </div>
              </div>

              <div className="w-1/2 p-2">
                <div
                  onClick={() =>
                    handleInputChange({
                      target: {
                        value:
                          " How can I better utilize the real-time market scanning capabilities?",
                      },
                    } as React.ChangeEvent<HTMLInputElement>)
                  }
                  className="bg-white rounded-lg shadow-md hover:bg-gray-100 hover:scale-105 transform transition duration-300 ease-in-out h-18 flex cursor-pointer"
                >
                  <div className="w-1/5 flex items-center justify-center p-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      id="message"
                      className="w-8 h-8 text-gray-500"
                    >
                      <g>
                        <g>
                          <rect width="24" height="24" opacity="0"></rect>
                          <path d="M19.07 4.93a10 10 0 0 0-16.28 11 1.06 1.06 0 0 1 .09.64L2 20.8a1 1 0 0 0 .27.91A1 1 0 0 0 3 22h.2l4.28-.86a1.26 1.26 0 0 1 .64.09 10 10 0 0 0 11-16.28zM8 13a1 1 0 1 1 1-1 1 1 0 0 1-1 1zm4 0a1 1 0 1 1 1-1 1 1 0 0 1-1 1zm4 0a1 1 0 1 1 1-1 1 1 0 0 1-1 1z"></path>
                        </g>
                      </g>
                    </svg>
                  </div>
                  <div className="w-4/5 flex items-center text-left p-4 text-gray-800">
                    How can I better utilize the real-time market scanning
                    capabilities?
                  </div>
                </div>
              </div>

              <div className="w-1/2 p-2">
                <div
                  onClick={() =>
                    handleInputChange({
                      target: {
                        value:
                          "Are there any new updates or features added to Holly's AI strategies?",
                      },
                    } as React.ChangeEvent<HTMLInputElement>)
                  }
                  className="bg-white rounded-lg shadow-md hover:bg-gray-100 hover:scale-105 transform transition duration-300 ease-in-out h-18 flex cursor-pointer"
                >
                  <div className="w-1/5 flex items-center justify-center p-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      id="message"
                      className="w-8 h-8 text-gray-500"
                    >
                      <g>
                        <g>
                          <rect width="24" height="24" opacity="0"></rect>
                          <path d="M19.07 4.93a10 10 0 0 0-16.28 11 1.06 1.06 0 0 1 .09.64L2 20.8a1 1 0 0 0 .27.91A1 1 0 0 0 3 22h.2l4.28-.86a1.26 1.26 0 0 1 .64.09 10 10 0 0 0 11-16.28zM8 13a1 1 0 1 1 1-1 1 1 0 0 1-1 1zm4 0a1 1 0 1 1 1-1 1 1 0 0 1-1 1zm4 0a1 1 0 1 1 1-1 1 1 0 0 1-1 1z"></path>
                        </g>
                      </g>
                    </svg>
                  </div>
                  <div className="w-4/5 flex items-center text-left p-4 text-gray-800">
                    Are there any new updates or features added to Holly's AI
                    strategies?
                  </div>
                </div>
              </div>

              <div className="w-1/2 p-2">
                <div
                  onClick={() =>
                    handleInputChange({
                      target: {
                        value:
                          "I'm having an issue with one of the key features. Can you assist with troubleshooting?",
                      },
                    } as React.ChangeEvent<HTMLInputElement>)
                  }
                  className="bg-white rounded-lg shadow-md hover:bg-gray-100 hover:scale-105 transform transition duration-300 ease-in-out h-18 flex cursor-pointer"
                >
                  <div className="w-1/5 flex items-center justify-center p-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      id="message"
                      className="w-8 h-8 text-gray-500"
                    >
                      <g>
                        <g>
                          <rect width="24" height="24" opacity="0"></rect>
                          <path d="M19.07 4.93a10 10 0 0 0-16.28 11 1.06 1.06 0 0 1 .09.64L2 20.8a1 1 0 0 0 .27.91A1 1 0 0 0 3 22h.2l4.28-.86a1.26 1.26 0 0 1 .64.09 10 10 0 0 0 11-16.28zM8 13a1 1 0 1 1 1-1 1 1 0 0 1-1 1zm4 0a1 1 0 1 1 1-1 1 1 0 0 1-1 1zm4 0a1 1 0 1 1 1-1 1 1 0 0 1-1 1z"></path>
                        </g>
                      </g>
                    </svg>
                  </div>
                  <div className="w-4/5 flex items-center text-left p-4 text-gray-800">
                    I'm having an issue with one of the key features. Can you
                    assist with troubleshooting?
                  </div>
                </div>
              </div>

              <div className="w-1/2 p-2">
                <div
                  onClick={() =>
                    handleInputChange({
                      target: {
                        value:
                          "What educational resources are available for advanced charting techniques?",
                      },
                    } as React.ChangeEvent<HTMLInputElement>)
                  }
                  className="bg-white rounded-lg shadow-md hover:bg-gray-100 hover:scale-105 transform transition duration-300 ease-in-out h-18 flex cursor-pointer"
                >
                  <div className="w-1/5 flex items-center justify-center p-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      id="message"
                      className="w-8 h-8 text-gray-500"
                    >
                      <g>
                        <g>
                          <rect width="24" height="24" opacity="0"></rect>
                          <path d="M19.07 4.93a10 10 0 0 0-16.28 11 1.06 1.06 0 0 1 .09.64L2 20.8a1 1 0 0 0 .27.91A1 1 0 0 0 3 22h.2l4.28-.86a1.26 1.26 0 0 1 .64.09 10 10 0 0 0 11-16.28zM8 13a1 1 0 1 1 1-1 1 1 0 0 1-1 1zm4 0a1 1 0 1 1 1-1 1 1 0 0 1-1 1zm4 0a1 1 0 1 1 1-1 1 1 0 0 1-1 1z"></path>
                        </g>
                      </g>
                    </svg>
                  </div>
                  <div className="w-4/5 flex items-center text-left p-4 text-gray-800">
                    What educational resources are available for advanced
                    charting techniques?
                  </div>
                </div>
              </div>
            </div> */}
          </div>
        ) : (
          <div className="relative text-center mb-12">
            <div className="sticky top-0 z-10 bg-white shadow text-center flex justify-center">
              <div className="p-4 text-3xl font-bold text-center">
                <IoHome
                  className="text-3xl text-center cursor-pointer"
                  onClick={handleHomeClick}
                />
              </div>
            </div>
            {conversations.map((conversation, index) => (
              <div
                key={index}
                className="flex justify-center items-center flex-col gap-5 mt-4 mb-0"
              >
                <div className="w-full flex flex-row gap-2">
                  <div className="font-bold text-lg mb-2 text-left">
                    QUESTION:
                  </div>
                  <p className="text-gray-700 text-base text-left leading-loose">
                    {conversation.prompt}
                  </p>
                </div>
                <div className="w-full rounded-lg overflow-y-auto shadow-lg border-2 border-solid border-gray-400 py-2 mt-0 mb-6">
                  <div className="px-6 py-4">
                    <div className="font-bold text-lg mb-2 text-left">
                      ANSWER:
                    </div>
                    {!conversation.isLoading ? (
                      index === conversations.length - 1 && currentResponse ? (
                        <div className="text-gray-700 text-base text-left">
                          <Markdown remarkPlugins={[remarkGfm]}>
                            {typedResponse}
                          </Markdown>
                        </div>
                      ) : (
                        <p className="text-gray-700 text-base text-left">
                          <Markdown remarkPlugins={[remarkGfm]}>
                            {conversation.response}
                          </Markdown>
                        </p>
                      )
                    ) : (
                      <div className="space-y-2">
                        <div className="bg-gray-200 h-4 rounded w-full animate-pulse"></div>
                        <div className="bg-gray-200 h-4 rounded w-full animate-pulse"></div>
                        <div className="bg-gray-200 h-4 rounded w-full animate-pulse"></div>
                        <div className="bg-gray-200 h-4 rounded w-full animate-pulse"></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div className="relative w-full mt-6">
              <input
                type="text"
                value={searchTerm}
                placeholder="Ask anything"
                onChange={handleInputChange}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full py-3 pl-4 pr-20 text-lg text-gray-700 bg-white border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700 shadow-[2px_2px_38px_0px_rgba(0,0,0,0.25),0px_-2px_4px_0px_rgba(0,0,0,0.25)_inset,1px_2px_4px_0px_rgba(0,0,0,0.25)_inset]"
              />
              <button
                onClick={handleSearch}
                className="absolute top-13 right-0.5 mt-[-47px] mr-1 flex justify-center items-center w-15 h-15 bg-[#333333] text-white text-lg font-bold p-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <FaArrowRight />
              </button>
              <div className="absolute bottom-[-40px] left-1/2 transform -translate-x-1/2 text-xs text-gray-500 ">
                Consider checking important information. AI can make mistakes.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
