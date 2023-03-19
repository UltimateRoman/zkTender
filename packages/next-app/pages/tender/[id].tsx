import { 
    useState,
    useEffect 
} from "react";
import { 
    ethers, 
    Contract, 
    Signer
} from 'ethers';
import { 
    useSigner, 
    useAccount,
    useContract,
    useContractRead,
    useContractReads
} from 'wagmi';
import {
    Box,
    Text,
    Card,
    Stack,
    Input,
    Button,
    Heading,
    CardBody,
    CardHeader,
    StackDivider,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
    useToast,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import * as TenderABI from "../../abis/Tender.json";
import TenderManager from "../../abis/TenderManager.json";
import { buildPoseidonOpt as buildPoseidon } from 'circomlibjs';
import { getAddressSum, generateProof } from "../../utils/utils";
import { TenderManagerAddress } from "../../../hardhat/contractAddress";
import DefaultLayout from "../../layouts/DefaultLayout";

const Tender = () => {
    const toast = useToast();
    const router = useRouter();
    const url = String(router.query.id);

    const [showChild, setShowChild] = useState(false);

    const [loading, setLoading] = useState<boolean>(false);
    const [contract, setContract] = useState<Contract>();
    const [bidValue, setBidValue] = useState<string>("");

    const { data: signer } = useSigner();
    const { address, isConnected } = useAccount();
    const tenderManagerContract = {
        address: TenderManagerAddress,
        abi: TenderManager,
    };
    const tenderContract = {
        address: url,
        abi: TenderABI["default"],
    };
    const { data, isError, isLoading } = useContractReads({
        contracts: [
            {
                ...tenderManagerContract,
                functionName: "getUsername",
                args: [address]
            },
            {
                ...tenderContract,
                functionName: "tenderInfo"
            },
            {
                ...tenderContract,
                functionName: "currentStage"
            },
            {
                ...tenderContract,
                functionName: "getAllBidders"
            },
            {
                ...tenderContract,
                functionName: "getAllSealedBids"
            },
            {
                ...tenderContract,
                functionName: "bidRevealCompleted"
            },
            {
                ...tenderContract,
                functionName: "bidderUsernames"
            },
            {
                ...tenderContract,
                functionName: "numberOfPenalizedBidders"
            },
            {
                ...tenderContract,
                functionName: "winningBid"
            }
        ],
    });

    useEffect(() => {
        if (!isConnected) {
            toast({
                title: "Wallet not connected",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });
            router.push("/");
        } else if (url as string !== "undefined") {
            if (!ethers.utils.isAddress(url)) {
                toast({
                    title: "Invalid tender",
                    status: "warning",
                    duration: 3000,
                    isClosable: true,
                });
                router.push("/");
            } else {
                const contract = new ethers.Contract(url, TenderABI["default"], signer as Signer);
                setContract(contract);
                setShowChild(true);
            }
        } else if ((data as any)[0] === undefined) {
            toast({
                title: "User not registered",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });
            router.push("/");
        }
    },[url]);

    const placeBid = async () => {
        setLoading(true);
        try {
            const poseidon = await buildPoseidon();
            const sealedBid = (ethers.BigNumber.from(
                poseidon.F.toString(poseidon([parseInt(bidValue), getAddressSum(address as string)]))
            )).toHexString();
            const tx = await contract?.placeBid(sealedBid, {value: ethers.utils.parseEther("0.05")});
            await tx.wait();
            toast({
                title: "Bid submitted",
                description: "Successfully placed your bid for the tender",
                status: "success",
                duration: 4000,
                isClosable: true
            });
        } catch (error) {
            toast({
                title: "Error: Transaction failed",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            console.log("error", error);
        }
        setLoading(false);
    };

    const revealBid = async () => {
        setLoading(true);
        try {
            const tx = await contract?.revealBid(parseInt(bidValue));
            await tx.wait();
            toast({
                title: "Bid reveal submitted",
                description: "Successfully submitted your bid value for verification",
                status: "success",
                duration: 4000,
                isClosable: true
            });
        } catch (error) {
            toast({
                title: "Error: Transaction failed",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            console.log("error", error);
        }
        setLoading(false);
    };

    const verifyBids = async () => {
        setLoading(true);
        try {
            const bidValues = await contract?.getBidValues();
            const bidders = (data as any)[3];
            const sealedBids = (data as any)[4];
            let bids = [];
            for (let i=0; i < bidValues.length; ++i) {
                const bid = [bidValues[i].toString(), getAddressSum(bidders[i]).toString()]
                bids.push(bid);
            }
            const inputs = {
                sealedBids,
                bids
            };
            const [proof, publicSignals, calldata] = await generateProof(inputs);
            console.log(proof, publicSignals, calldata);
            let penalizedBidders: string[] = [];
            for (let i=2; i < 2 + bidders.length; ++i) {
                if (publicSignals[i] != "1") {
                    penalizedBidders.push(bidders[i-2])
                }
            }
            const tx = await contract?.verifyBids(penalizedBidders);
            await tx.wait();
            toast({
                title: "Bids verified",
                description: "Successfully verified the submitted bids",
                status: "success",
                duration: 4000,
                isClosable: true
            });
        } catch (error) {
            toast({
                title: "Error: Verification failed",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            console.log("error", error);
        }
        setLoading(false);
    };

    const refundDeposits = async () => {
        setLoading(true);
        try {
            const tx = await contract?.connect(signer as Signer)?.refundDeposits();
            await tx.wait();
            toast({
                title: "Refund completed",
                description: "Successfully completed refund of deposits",
                status: "success",
                duration: 4000,
                isClosable: true
            });
        } catch (error) {
            toast({
                title: "Error: Transaction failed",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            console.log("error", error);
        }
        setLoading(false);
    };

    if (!showChild) {
        return null;
    }
    if (typeof window === 'undefined') {
        return <></>;
    } else return(
        <DefaultLayout>
            {isConnected &&
            <div className="flex flex-col justify-center">
                <div className="flex flex-direction justify-center">
                    <h1 className="text-4xl font-semibold leading-[90px]">
                        <span className="font-black text-[#e7ff6d]">{(data as any)[1]?.title}</span>
                    </h1>   
                </div>
                <div className="flex-initial">
                    <Card>
                        <CardHeader>
                            <Heading size='md'>Tender Information</Heading>
                        </CardHeader>

                        <CardBody>
                            <Stack divider={<StackDivider />} spacing='4'>
                            <Box>
                                <Heading size='xs' textTransform='uppercase'>
                                    Description
                                </Heading>
                                <Text pt='2' fontSize='sm'>
                                    {(data as any)[1]?.description}
                                </Text>
                            </Box>
                            <Box>
                                <Heading size='xs' textTransform='uppercase'>
                                    Rules and Details
                                </Heading>
                                <a href={(data as any)[1]?.document} target='_blank'>
                                    <Text pt='2' fontSize='sm'>
                                        View Document
                                    </Text>
                                </a>
                            </Box>
                            <Box>
                                <Heading size='xs' textTransform='uppercase'>
                                    Current Status
                                </Heading>
                                {
                                    (data as any)[2] == 0 &&
                                    <Text pt='2' fontSize='sm'>
                                        Bidding in progress
                                    </Text>
                                }
                                {
                                    (data as any)[2] == 1 &&
                                    <Text pt='2' fontSize='sm'>
                                        Bidding completed, bid reveal in progress
                                    </Text>
                                }
                                {
                                    (data as any)[2] == 2 &&
                                    <Text pt='2' fontSize='sm'>
                                        Completed and winner selected
                                    </Text>
                                }
                                {
                                    (data as any)[2] == 3 &&
                                    <Text pt='2' fontSize='sm'>
                                        Cancelled
                                    </Text>
                                }
                            </Box>
                            <Box>
                                <Heading size='xs' textTransform='uppercase'>
                                Deadline for bidding
                                </Heading>
                                <Text pt='2' fontSize='sm'>
                                {(new Date(parseInt((data as any)[1]?.biddingDeadline?.toString()))).toDateString()}
                                </Text>
                            </Box>
                            <Box>
                                <Heading size='xs' textTransform='uppercase'>
                                    Number of Bids Received
                                </Heading>
                                <Text pt='2' fontSize='sm'>
                                    {(data as any)[3]?.length}
                                </Text>
                            </Box>
                            </Stack>
                        </CardBody>
                    </Card>
                </div>
                {
                    (data as any)[2] == 0 &&
                    <div className="items-center mt-10 pb-10 pt-10 z-40 justify-center max-w-lg rounded-md flex-none">
                        <Card>
                        <CardHeader>
                            <Heading size='md'>Place your bid for the tender</Heading>
                        </CardHeader>
                        <CardBody>
                            <NumberInput 
                                defaultValue={5001} 
                                min={5000} 
                                clampValueOnBlur={false} 
                                value={bidValue} 
                                onChange={(e) => setBidValue(e)}
                            >
                                <NumberInputField />
                                <NumberInputStepper>    
                                    <NumberIncrementStepper />
                                    <NumberDecrementStepper />
                                </NumberInputStepper>
                            </NumberInput>
                            <Button
                                isLoading={loading}
                                loadingText="Loading..."
                                type="submit"
                                colorScheme="teal"
                                className="mt-[20px] w-100"
                                onClick={placeBid}
                            >
                                Submit
                            </Button>
                        </CardBody>
                        </Card>
                    </div>
                }
                {
                    (data as any)[2] == 1 &&
                    <div className="items-center mt-10 pb-10 pt-10 z-40 justify-center max-w-lg rounded-md flex-none">
                        <Card>
                        <CardHeader>
                            <Heading size='md'>Reveal your bid value</Heading>
                        </CardHeader>
                        <CardBody>
                            <NumberInput 
                                defaultValue={5001} 
                                min={5000} 
                                clampValueOnBlur={false} 
                                value={bidValue} 
                                onChange={(e) => setBidValue(e)}
                            >
                                <NumberInputField />
                                <NumberInputStepper>    
                                    <NumberIncrementStepper />
                                    <NumberDecrementStepper />
                                </NumberInputStepper>
                            </NumberInput>
                            <Button
                                isLoading={loading}
                                loadingText="Loading..."
                                type="submit"
                                colorScheme="teal"
                                className="mt-[20px] w-100"
                                onClick={revealBid}
                            >
                                Submit
                            </Button>
                        </CardBody>
                        </Card>
                    </div>
                }
            </div>
            }
        </DefaultLayout>
    );
}

export default Tender;