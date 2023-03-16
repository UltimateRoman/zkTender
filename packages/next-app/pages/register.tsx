import {
    useState,
    FormEventHandler
} from "react";
import {
    Input,
    Button,
    useToast,
    FormLabel
} from "@chakra-ui/react";
import { 
    useContractWrite,
    usePrepareContractWrite 
} from 'wagmi';
import DefaultLayout from "../layouts/DefaultLayout";
import TenderManager from "../abis/TenderManager.json";
import { TenderManagerAddress } from "../../hardhat/contractAddress";

const Register = () => {
    const toast = useToast();
    const [username, setUsername] = useState<string>("");

    const { config } = usePrepareContractWrite({
        address: TenderManagerAddress,
        abi: TenderManager,
        functionName: 'registerUser',
        args: [username]
    });
    const { isLoading, isSuccess, write, isError } = useContractWrite(config);

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
            try {
                write?.()
                if (isSuccess) {
                    toast({
                        title: "Registered User",
                        description: "Successfully registered new user",
                        status: "success",
                        duration: 3000,
                        isClosable: true,
                    });
                } 
            } catch (e) {
                if (isError) {
                    toast({
                        title: "Error: Already registered",
                        status: "error",
                        duration: 3000,
                        isClosable: true,
                    });
                }
                console.log("Error: ", isError);
            }
        }
    }

    return(
        <DefaultLayout>
        <div className="min-h-[70vh] flex justify-center items-center max-w-[500px] w-full mx-auto my-[50px]">
            <form
                onSubmit={handleSubmit}
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
                isLoading={isLoading}
                loadingText="Registering..."
                type="submit"
                bg="twitter.500"
                className="mt-[20px] w-full"
            >
                Register
            </Button>
            </form>
        </div>
        </DefaultLayout>
    );
}

export default Register;