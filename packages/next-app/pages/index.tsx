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
    functionName: "getAllTenders",
    watch: true
  });

  useEffect(() => {
    setHydrated(true);
    setTenders(data1);
  },[tenders?.length]);

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
            { isConnected &&
              <Fragment>
                <p className={styles.description}>
                  {tenders?.length > 0 ? "Available tenders" : "No tenders available"}
                </p>

                <div className={styles.grid}>
                  {tenders?.map((tender: any) => (
                    <a href={`/tender/${tender?.tender}`} className={styles.card}>
                      <h2>{tender?.creator} &rarr;</h2>
                      <p>{tender?.title}</p>
                    </a>
                  ))}
                </div>
              </Fragment>
            }
          </Fragment>
        }
      </main>
    </div>
    </DefaultLayout>
  );
}

export default Home
