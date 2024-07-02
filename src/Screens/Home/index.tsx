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
              }
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
  
  const continueConversation = async (threadId: string | null, input: string) => {
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
            }
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

  return (
    <div className="flex items-center justify-center min-h-screen bg-white px-4">
      {hasSearched && (
        <>
          <div
            data-tooltip-target="tooltip-default"
            onClick={() => setHasSearched(false)}
            className=" absolute w-12 h-12 rounded-full bg-[#333333] top-4 left-4 flex items-center justify-center cursor-pointer"
          >
            <IoHome className="text-3xl text-white" />
          </div>
          <div
            id="tooltip-default"
            role="tooltip"
            className="absolute z-10 invisible inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip dark:bg-gray-700"
          >
            Tooltip content
            <div className="tooltip-arrow" data-popper-arrow></div>
          </div>
        </>
      )}

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
            <div className="flex justify-center space-x-2 mt-6">
              <span
                onClick={() =>
                  handleInputChange({
                    target: {
                      value: "What can you tell me about Roundup litigation?",
                    },
                  } as React.ChangeEvent<HTMLInputElement>)
                }
                className="cursor-pointer text-black px-4 py-1 text-sm w-1/2 flex justify-center items-center rounded-lg border border-solid border-[#C1C1C1] bg-[#EDEDEA]"
              >
                {truncateText(
                  "What can you tell me about Roundup litigation?",
                  40
                )}
              </span>
              <span
                onClick={() =>
                  handleInputChange({
                    target: {
                      value:
                        "In Hardeman v. Monsanto, what is the standard for determining whether a failure-to-warn claim is preempted by FIFRA?",
                    },
                  } as React.ChangeEvent<HTMLInputElement>)
                }
                className="cursor-pointer text-black px-4 py-1 text-sm w-1/2 flex justify-center items-center rounded-lg border border-solid border-[#C1C1C1] bg-[#EDEDEA]"
              >
                {truncateText(
                  "In Hardeman v. Monsanto, what is the standard for determining whether a failure-to-warn claim is preempted by FIFRA?",
                  40
                )}
              </span>
              <span
                onClick={() =>
                  handleInputChange({
                    target: {
                      value:
                        "In JOHN D. CARSON v. Monsanto, What is the key question the en banc court addressed regarding FIFRA preemption and EPA actions?",
                    },
                  } as React.ChangeEvent<HTMLInputElement>)
                }
                className="cursor-pointer text-black px-4 py-1 text-sm w-1/2 flex justify-center items-center rounded-lg border border-solid border-[#C1C1C1] bg-[#EDEDEA]"
              >
                {truncateText(
                  "In JOHN D. CARSON v. Monsanto, What is the key question the en banc court addressed regarding FIFRA preemption and EPA actions?",
                  40
                )}
              </span>
            </div>
            {loading && (
              <div className="w-full rounded-lg overflow-y-auto shadow-lg border-2 border-solid border-gray-400 py-2 mt-6 mb-6">
                <div className="px-6 py-4">
                  <div className="font-bold text-lg mb-2 text-left">
                    ANSWER:
                  </div>
                  <div className="space-y-2">
                    <div className="bg-gray-200 h-4 rounded w-full animate-pulse"></div>
                    <div className="bg-gray-200 h-4 rounded w-full animate-pulse"></div>
                    <div className="bg-gray-200 h-4 rounded w-full animate-pulse"></div>
                    <div className="bg-gray-200 h-4 rounded w-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="relative text-center mb-12">
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
