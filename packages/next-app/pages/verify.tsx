import {
    useState,
    useEffect,
    FormEventHandler
} from "react";
import {
    Input,
    Button,
    useToast,
    FormLabel,
    Textarea
} from "@chakra-ui/react";
import { 
    useAccount,
    useSigner,
    useContract
} from 'wagmi';
import { useRouter } from "next/router";
import DefaultLayout from "../layouts/DefaultLayout";
import Verifier from "../abis/Verifier.json";
import { VerifierAddress } from "../../hardhat/contractAddress";

const Verify = () => {
    const toast = useToast();
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(false);
    const [proofInput, setProofInput] = useState<string>("");

    const { isConnected } = useAccount();
    const { data: signer } = useSigner();
    const contract = useContract({
        address: VerifierAddress,
        abi: Verifier,
        signerOrProvider: signer
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
        }
    },[]);

    const handleSubmit: FormEventHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const proof = JSON.parse("[" + proofInput + "]");
            const isValid = await contract?.verifyProof(proof[0], proof[1], proof[2], proof[3]);
            console.log(isValid)
            if (isValid) {
                toast({
                    title: "Valid proof",
                    description: "Successfully verified proof of fair tendering process",
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                }); 
            } else {
                toast({
                    title: "Invalid proof",
                    description: "Verification failed",
                    status: "error",
                    duration: 4000,
                    isClosable: true,
                });
            }         
        } catch (e) {
            toast({
                title: "Invalid proof",
                description: "Verification failed",
                status: "error",
                duration: 4000,
                isClosable: true,
            });
            console.log("Error: ", e);
        }
        setLoading(false);
    }

    return(
        <DefaultLayout>
        <div className="min-h-[70vh] flex justify-center items-center max-w-[700px] w-full mx-auto my-[50px]">
            <form
                className="bg-white p-[50px] rounded w-full"
            >
            <h2 className="text-center font-semibold text-2xl mb-[40px]">
                Proof Verification
            </h2>
            <FormLabel className="mt-[10px]" htmlFor="proof">
                Proof
            </FormLabel>
            <Textarea
                id="proof"
                rows={8}
                resize="none"
                value={proofInput}
                onChange={(e) => setProofInput(e.target.value)}
                placeholder="Enter the ZK proof"
                required
            />
            <br/><br/>
            <Button
                isLoading={loading}
                loadingText="Verifying..."
                type="submit"
                bg="twitter.600"
                className="mt-[20px] w-full"
                onClick={handleSubmit}
            >
                Verify
            </Button>
            </form>
        </div>
        </DefaultLayout>
    );
}

export default Verify;