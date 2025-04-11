import { TbLayoutSidebarRightExpand } from "react-icons/tb";
import { useEffect, useRef, useState } from "react";
import { IoArrowDownOutline } from "react-icons/io5";
import { FaRegTrashCan } from "react-icons/fa6";
import { useChatMutation } from "@/useChatQuery";

type GlobalChats = {
  [key: number]: ActiveChatData;
};

type ActiveChatData = {
  isUser: boolean;
  message: string;
  isLoading?: boolean;
}[];

export default function App() {
  const [globalChats, setGlobalChats] = useState<GlobalChats>({});
  const [activeChatData, setActiveChatData] = useState<ActiveChatData>([]);
  const [activeChat, setActiveChat] = useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [chatHeight, setChatHeight] = useState(0);
  const [isResponseLoading, setIsResponseLoading] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeChatSettings, setActiveChatSettings] = useState<number | null>(
    null,
  );
  const chatRef = useRef<HTMLDivElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);
  const chatSettingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isResponseLoading) {
      setActiveChatData((prevState) => {
        return [...prevState.slice(0, -2), prevState.at(-1) ?? []].flat();
      });
      return;
    }

    const interval = setInterval(() => {
      setActiveChatData((prevState) => {
        const lastMsg = prevState.at(-1);
        if (!lastMsg) return prevState;

        if (lastMsg?.isLoading) {
          return [
            ...prevState.slice(0, -1),
            {
              ...lastMsg,
              message:
                lastMsg.message.length !== 3 ? lastMsg.message + "." : ".",
            },
          ];
        }

        const updatedMsg = {
          isUser: false,
          message: ".",
          isLoading: true,
        };

        return [...prevState, updatedMsg];
      });
    }, 300);

    return () => clearInterval(interval);
  }, [isResponseLoading]);

  useEffect(() => {
    if (chatRef.current) {
      setChatHeight(chatRef.current.getBoundingClientRect().height);
    }
  }, [chatRef]);

  useEffect(() => {
    if (!activeChat) return;

    setActiveChatData(globalChats[activeChat]);
  }, [activeChat]);

  useEffect(() => {
    setActiveChatData([]);
    setGlobalChats(JSON.parse(localStorage.getItem("globalChats") ?? "{}"));

    const handleClickOutside = (e: MouseEvent) => {
      if (
        chatSettingsRef.current &&
        !chatSettingsRef.current.contains(e.target as Node)
      ) {
        setActiveChatSettings(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (activeChatData.length === 0) return;
    if (isScrolled) return;

    handleScrollToBottom();
  }, [activeChatData]);

  const onPressEnterChat = async (text: string) => {
    setActiveChatData((prevState) => [
      ...prevState,
      { isUser: true, message: text },
    ]);
    setIsResponseLoading(true);

    const response = await useChatMutation(text);
    console.log(response);
    // let response = "Бубубу";
    // await new Promise((res) => {
    //   setTimeout(() => {
    //     res();
    //   }, 1000);
    // });

    setIsResponseLoading(false);

    if (activeChat || activeChat === 0) {
      handleUpdateGlobalChats("update", text, response);
    } else {
      handleUpdateGlobalChats("create", text, response);
    }

    setActiveChatData((prevState) => {
      return [...prevState, { isUser: false, message: response }];
    });
  };

  const handleScrollToBottom = (behavior: "instant" | "smooth" = "smooth") => {
    isScrollingRef.current = true;
    chatScrollRef.current?.scrollTo({
      top: chatScrollRef.current.scrollHeight,
      behavior,
    });

    setTimeout(() => {
      isScrollingRef.current = false;
    }, 500);
    setIsScrolled(false);
  };

  const handleUpdateGlobalChats = (
    action: "create" | "update" | "delete",
    text?: string,
    response?: string,
    index?: number,
  ) => {
    switch (action) {
      case "create": {
        const newChats = {
          ...globalChats,
          [Object.keys(globalChats).length]: [
            ...activeChatData,
            { isUser: true, message: text ?? "" },
            { isUser: false, message: response ?? "" },
          ],
        };
        localStorage.setItem("globalChats", JSON.stringify(newChats));
        setGlobalChats(newChats);
        setActiveChat(Object.keys(newChats).length - 1);
        break;
      }
      case "update": {
        const targetChatIndex = globalChats;
        targetChatIndex[activeChat ?? 0] = [
          ...activeChatData,
          { isUser: true, message: text ?? "" },
          { isUser: false, message: response ?? "" },
        ];

        localStorage.setItem("globalChats", JSON.stringify(targetChatIndex));
        break;
      }
      case "delete": {
        const keysArr = Object.keys(globalChats);
        const targetChatIndex = Object.values(globalChats).filter(
          (_, i) => +keysArr[i] !== (index ?? 0),
        );

        localStorage.setItem(
          "globalChats",
          JSON.stringify({ ...targetChatIndex }),
        );

        setGlobalChats({ ...targetChatIndex });
        console.log(activeChat, index);
        if (activeChat === index) {
          setActiveChatData([]);
          setActiveChat(null);
        }
        break;
      }
    }
  };
  return (
    <div className="w-dvw h-dvh bg-neutral-800 flex items-baseline relative overflow-hidden">
      <div
        className={`flex flex-col w-96 h-full text-nowrap items-baseline bg-neutral-900 absolute p-4 duration-300 z-[1000]
                        ${isSidebarOpen ? "translate-x-0" : "-translate-x-96"}`}
      >
        <TbLayoutSidebarRightExpand
          onClick={() => {
            setIsSidebarOpen(!isSidebarOpen);
          }}
          className="w-10 h-10 text-neutral-300 mb-4"
        />

        <div className="flex items-center w-full h-fit mb-4 p-4 rounded-2xl hover:bg-neutral-600/30 duration-100 cursor-pointer">
          <img
            //@ts-ignore
            src={`${import.meta.env.BASE_URL}chatgpt.png`}
            className="w-10 h-10 border border-neutral-600 rounded-full p-1"
          />
          <p
            onClick={() => {
              setActiveChat(null);
              setActiveChatData([]);
            }}
            className="w-full h-fit text-neutral-300 text-lg ml-4"
          >
            ChatGPT
          </p>
        </div>
        {Object.values(globalChats).map((chat, i) => (
          <div className="w-full h-fit flex flex-col relative">
            <div
              onClick={() => {
                setActiveChat(i);
              }}
              key={i}
              className={`w-full h-12 text-neutral-300 rounded-2xl px-6 text-lg flex justify-between items-center hover:bg-neutral-600/30 duration-100 group/activeChat cursor-pointer relative z-10
                                ${activeChat === i ? "bg-neutral-500/30" : "bg-transparent"} ${activeChatSettings ? "pointer-events-none" : ""}`}
            >
              <p className="truncate">{chat[0].message}</p>
              <div
                className={`group-hover/activeChat:opacity-100 opacity-0 duration-300 flex gap-1 group/chatSettings p-4 relative z-0
                                ${activeChatSettings === i ? "opacity-100" : "opacity-0"}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveChatSettings(i);
                }}
              >
                <span className="block w-1 h-1 rounded-full bg-neutral-400 group-hover/chatSettings:bg-neutral-300 duration-300 z-0" />
                <span className="block w-1 h-1 rounded-full bg-neutral-400 group-hover/chatSettings:bg-neutral-300 duration-300 z-0" />
                <span className="block w-1 h-1 rounded-full bg-neutral-400 group-hover/chatSettings:bg-neutral-300 duration-300 z-0" />
              </div>
            </div>
            <div
              ref={chatSettingsRef}
              onClick={(e) => {
                e.stopPropagation();
                setActiveChatSettings(null);
                handleUpdateGlobalChats("delete", "", "", i);
              }}
              className={`absolute z-10 top-full -right-32 cursor-pointer w-48 h-12 flex items-center px-2 pointer-events-auto rounded-lg bg-neutral-700 group border border-transparent hover:border-red-600 text-white duration-100
                                    ${activeChatSettings === i ? "opacity-100" : "opacity-0"}`}
            >
              <FaRegTrashCan className="w-6 h-6 text-neutral-400 mr-2 group-hover:text-red-600 duration-100" />
              <p className="text-neutral-400 group-hover:text-red-600 duration-100">
                Видалити чат
              </p>
            </div>
          </div>
        ))}
      </div>
      <div
        className={`text-white duration-300 h-full flex flex-col pb-8 pr-4 relative
                    ${isSidebarOpen ? "w-[calc(100%-23rem)] left-96" : "left-0 w-full"}`}
      >
        <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-600">
          <div className="flex items-center">
            {!isSidebarOpen && (
              <TbLayoutSidebarRightExpand
                onClick={() => {
                  setIsSidebarOpen(!isSidebarOpen);
                }}
                className="w-10 h-10 text-neutral-300 mr-8 rotate-180"
              />
            )}

            <img
              //@ts-ignore
              src={`${import.meta.env.BASE_URL}logo.svg`}
              className="h-10 w-10 mr-4 select-none"
            />
            <p className="text-2xl">Aish</p>
          </div>
          <div>
            <button className="px-4 py-0.5 cursor-pointer border-2 border-white rounded-full hover:border-neutral-300 hover:text-neutral-300 duration-300">
              Ввійти
            </button>
          </div>
        </div>
        <div
          ref={chatRef}
          className="overflow-auto px-16 pr-0 pb-0 pt-4 flex flex-col justify-end w-full h-full relative"
        >
          <div
            className="relative overflow-y-auto overflow-x-hidden custom-scrollbar pr-16"
            style={{ height: `${chatHeight}px` }}
            ref={chatScrollRef}
            onScroll={(e) => {
              if (isScrollingRef.current) return;

              const target = e.target as HTMLElement;
              const maxScrollTop =
                target.scrollHeight - target.clientHeight - 192;
              if (maxScrollTop > target.scrollTop) {
                setIsScrolled(true);
              } else {
                setIsScrolled(false);
              }
            }}
          >
            {activeChat === null && !isResponseLoading ? (
              <div className="absolute w-fit h-fit top-1/2 left-1/3 text-4xl text-white">
                Чим я можу допомогти?
              </div>
            ) : (
              <>
                {activeChatData?.map((message, i) => (
                  <div
                    key={i}
                    className={`text-xl w-full mb-16 ${
                      message.isUser ? "flex justify-end" : ""
                    }`}
                  >
                    <p
                      className={`${
                        message.isUser
                          ? "bg-neutral-500/30 px-8 py-2 rounded-4xl max-w-7/12 w-fit break-words"
                          : "bg-transparent"
                      }`}
                    >
                      {message.message
                        .split(/(\d+\.\s|\*\*.*?\*\*)/g)
                        .map((part, index) => {
                          if (!part) return null;

                          return /^\d+\.\s$/.test(part) ? (
                            <>
                              <br />
                              <br />
                              <b key={`${part}_${index}`}>{part}</b>
                            </>
                          ) : part.startsWith("") && part.endsWith("") ? (
                            <b key={`${index}_${part}`}>{part.slice(2, -2)}</b>
                          ) : (
                            part
                          );
                        })}
                    </p>
                  </div>
                ))}
              </>
            )}
          </div>
          <div className="w-full h-fit flex relative">
            {isScrolled && (
              <div
                className="absolute -top-24 left-[calc(50%-3rem)] w-12 h-12 cursor-pointer bg-neutral-800 border-neutral-600 border-2 rounded-full transform -translate-x-1/2 translate-y-1/2"
                onClick={() => {
                  handleScrollToBottom();
                }}
              >
                <IoArrowDownOutline className="w-full h-full p-2" />
              </div>
            )}
            <textarea
              rows={1}
              placeholder="Напиши мені"
              className="w-[calc(100%-8rem)] mb-4 px-8 py-4 h-16 overflow-hidden custom-scrollbar resize-none max-h-48 border border-neutral-600 bg-neutral-700 rounded-3xl focus-visible:outline-neutral-500 outline outline-transparent"
              onInput={(e: React.FormEvent<HTMLTextAreaElement>) => {
                const target = e.currentTarget;
                target.style.height = "auto";
                const newHeight = Math.min(target.scrollHeight, 192);
                target.style.height = `${newHeight}px`;
                target.style.overflowY = newHeight < 192 ? "hidden" : "auto";
              }}
              onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                const target = e.currentTarget;

                if (e.key === "Enter" && target.value.trim().length > 0) {
                  e.preventDefault();
                  onPressEnterChat(target.value);

                  target.value = "";
                  target.style.height = "auto";
                  const newHeight = Math.min(target.scrollHeight, 192);
                  target.style.height = `${newHeight}px`;
                  target.style.overflowY = "hidden";
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
