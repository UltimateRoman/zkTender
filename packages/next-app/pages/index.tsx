import type { NextPage } from 'next';
import {
  useState,
  useEffect,
  Fragment
} from "react";
import { 
  useAccount, 
  useContractRead 
} from 'wagmi';
import Image from 'next/image';
import styles from '../styles/Home.module.css';
import DefaultLayout from "../layouts/DefaultLayout";
import TenderManager from "../abis/TenderManager.json"
import { TenderManagerAddress } from "../../hardhat/contractAddress";

const Home: NextPage = () => {
  const [hydrated, setHydrated] = useState(false);
  const [tenders, setTenders] = useState<any>([]);

  const { address, isConnected } = useAccount();
  const { data, isError } = useContractRead({
    address: TenderManagerAddress,
    abi: TenderManager,
    functionName: "getUsername",
    args: [address]
  });
  const { data: data1, isError: isError1 } = useContractRead({
    address: TenderManagerAddress,
    abi: TenderManager,
    functionName: "getAllTenders"
  });

  useEffect(() => {
    setHydrated(true);
    setTenders(data1);
  },[]);

  return (
    <DefaultLayout>
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>
          zkTender
        </h1>
        <br/>
        {
          hydrated &&
          <Fragment>
            <p className={styles.code}>
              {isConnected ? "Welcome " + (data ? data as string : "New User") : ""}
            </p>

            <p className={styles.description}>
              Available tenders
            </p>

            <div className={styles.grid}>
              {tenders.map((tender: any) => (
                <a href={`/tender/${tender?.tender}`} className={styles.card}>
                  <h2>{tender?.creator} &rarr;</h2>
                  <p>{tender?.title}</p>
                </a>
              ))}
              <a href="https://nextjs.org/docs" className={styles.card}>
                <h2>Documentation &rarr;</h2>
                <p>Find in-depth information about Next.js features and API.</p>
              </a>

              <a href="https://nextjs.org/learn" className={styles.card}>
                <h2>Learn &rarr;</h2>
                <p>Learn about Next.js in an interactive course with quizzes!</p>
              </a>

              <a
                href="https://github.com/vercel/next.js/tree/canary/examples"
                className={styles.card}
              >
                <h2>Examples &rarr;</h2>
                <p>Discover and deploy boilerplate example Next.js projects.</p>
              </a>

              <a
                href="https://vercel.com/new?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
                className={styles.card}
              >
                <h2>Deploy &rarr;</h2>
                <p>
                  Instantly deploy your Next.js site to a public URL with Vercel.
                </p>
              </a>
            </div>
          </Fragment>
        }
      </main>
    </div>
    </DefaultLayout>
  );
}

export default Home
