import {
    useState,
    useEffect,
    FormEventHandler
} from "react";
import {
    Input,
    Button,
    useToast,
    FormLabel
} from "@chakra-ui/react";
import { 
    useSigner,
    useAccount,
    useContract,
    useContractRead 
} from 'wagmi';
import { Signer } from "ethers";
import { useRouter } from "next/router";
import DefaultLayout from "../layouts/DefaultLayout";
import TenderManager from "../abis/TenderManager.json";
import { TenderManagerAddress } from "../../hardhat/contractAddress";

const Register = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [username, setUsername] = useState<string>("");

    const toast = useToast();
    const router = useRouter();
    const { address, isConnected } = useAccount();
    const { data: signer } = useSigner();
    const { data, isError: err1 } = useContractRead({
        address: TenderManagerAddress,
        abi: TenderManager,
        functionName: "getUsername",
        args: [address]
    });
    const contract = useContract({
        address: TenderManagerAddress,
        abi: TenderManager
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
        } else if (data) {
            toast({
                title: "Already registered",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });
            router.push("/");
        }
    },[]);

    const handleSubmit: FormEventHandler = async (e) => {
        e.preventDefault();
        if (username.length == 0) {
            toast({
              title: "Invalid Username",
              status: "error",
              duration: 3000,
              isClosable: true,
            });
        } else {
            setLoading(true);
            try {
                const tx = await contract?.connect(signer as Signer)?.registerUser(username);
                await tx.wait();
                toast({
                    title: "Registered",
                    description: "Successfully registered user",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
                router.push("/");
            } catch (e) {
                toast({
                    title: "Error occured: Transaction failed",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
                console.log("Error: ", e);
            }
            setLoading(false);
        }
    }

    return(
        <DefaultLayout>
        <div className="min-h-[70vh] flex justify-center items-center max-w-[500px] w-full mx-auto my-[50px]">
            <form
                className="bg-white p-[50px] rounded w-full"
            >
            <h2 className="text-center font-semibold text-2xl mb-[30px]">
                New User Registration
            </h2>
            <FormLabel className="mt-[10px]" htmlFor="username">
                Username
            </FormLabel>
            <Input
                id="username"
                type="text"
                value={username}
                placeholder="Enter username"
                onChange={(e) => setUsername(e.target.value)}
                required
            />
            <br/><br/>
            <Button
                isLoading={loading}
                loadingText="Registering..."
                type="submit"
                bg="twitter.500"
                className="mt-[20px] w-full"
                onClick={handleSubmit}
            >
                Register
            </Button>
            </form>
        </div>
        </DefaultLayout>
    );
}

export default Register;