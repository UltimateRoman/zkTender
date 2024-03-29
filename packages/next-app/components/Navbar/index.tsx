import Link from "next/link";
import { useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const navLinks: { text: string; link: string }[] = [
  {
    text: "Register User",
    link: "/register",
  },
  {
    text: "Create Tender",
    link: "/create",
  },
  {
    text: "Verify Proof",
    link: "/verify",
  },
];

const Navbar = () => {
    const [navbarVisible, setNavbarVisible] = useState<boolean>(false);

    return (
        <div className="w-full max-w-[1440px] mx-auto px-[32px] md:px-[64px] xl:px-[120px] shadow">
            <header className="w-full flex items-center justify-between bg-background py-[15px]">
                <div className="flex flex-1">
                    <nav className="flex flex-1">
                        <Link href="/" key="home">
                            <h1 className="flex-1 lg:flex-auto text-xl mr-[20px] font-bold text-white whitespace-nowrap">
                                zkTender
                            </h1>
                        </Link>
                        <ul className="hidden flex-[2] lg:flex-auto md:flex w-full items-center">
                            {navLinks.map(({ link, text }) => (
                                <Link href={link} key={text + link}>
                                    <li className="cursor-pointer">
                                        <a className="px-[10px] text-white">{text}</a>
                                    </li>
                                </Link>
                            ))}
                        </ul>
                    </nav>
                </div>
                <div className="hidden flex-1 lg:flex items-center justify-end">
                    <ConnectButton />
                </div>
                <div
                    className="flex flex-col md:hidden"
                    onClick={() => setNavbarVisible((prev) => !prev)}
                >
                    <span className="h-[2px] w-[30px] bg-white my-[2px]"></span>
                    <span className="h-[2px] w-[30px] bg-white my-[2px]"></span>
                    {/* <span className="h-[2px] w-[30px] bg-white my-[2px]"></span> */}
                </div>

                <div
                    className={`bg-[#2c2f36] absolute top-0 right-0 h-full w-[300px] flex flex-col transition-all duration-300 ease-linear ${
                    navbarVisible ? "max-w-[300px] p-[20px]" : "max-w-[0px] w-0"}`}
                >
                    {navbarVisible && (
                    <>
                    <div className="flex justify-end">
                        <span
                        className="text-[36px]"
                        onClick={() => setNavbarVisible((prev) => !prev)}
                        >
                            &times;
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <ul className="flex flex-col  w-full items-start justify-start">
                        {navLinks.map(({ link, text }) => (
                            <Link href={link} key={text + link}>
                            <li className="cursor-pointer">
                                <a className="my-[10px] text-[18px]">{text}</a>
                            </li>
                            </Link>
                        ))}
                        </ul>
                    </div>
                    </>
                    )}
                </div>
            </header>
        </div>
    );
};

export default Navbar;