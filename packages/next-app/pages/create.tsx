import {
    useState,
    ChangeEvent,
    FormEventHandler
} from "react";
import {
    Input,
    Button,
    useToast,
    Textarea,
    FormLabel
} from "@chakra-ui/react";
import { 
    useSigner,
    useContract
} from 'wagmi';
import { Web3Storage } from 'web3.storage';
import DatePicker from 'react-datepicker'; 
import DefaultLayout from "../layouts/DefaultLayout";
import TenderManager from "../abis/TenderManager.json";
import { TenderManagerAddress } from "../../hardhat/contractAddress";

const Create = () => {
    const toast = useToast();
    const [loading, setLoading] = useState<boolean>(false);
    const [title, setTitle] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [documentURL, setDocumentURL] = useState<string>("");
    const [biddingDeadline, setBiddingDeadline] = useState<Date>(new Date());

    const { data: signer, isError, isLoading } = useSigner();
    const contract = useContract({
        address: TenderManagerAddress,
        abi: TenderManager,
        signerOrProvider: signer,
    });

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        setLoading(true);
        const files: FileList | null = e.target.files;
        const client = new Web3Storage({ token: process.env.WEB3STORAGE_TOKEN || "" });
        const cid = await client.put(files as any);
        toast({
            title: "Uploaded file",
            description: "Successfully uploaded file to IPFS",
            status: "success",
            duration: 3000,
            isClosable: true,
        });
        setDocumentURL(`https://${cid}.ipfs.dweb.link/`);
        setLoading(false);
    }

    const handleSubmit: FormEventHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const tenderInfo = {
                biddingDeadline: Date.parse(biddingDeadline?.toDateString()) as number,
                title,
                description,
                documentURL
            };
            console.log(contract)
            const tx = await contract?.createNewTender(tenderInfo);
            await tx.wait();
            toast({
                title: "Created Tender",
                description: "Successfully created new tender",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            setLoading(false);
        } catch (e) {
            toast({
                title: "Error: Please try again",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            console.log("Error: ", e);
            setLoading(false);
        }
    }

    return(
        <DefaultLayout>
        <div className="min-h-[70vh] flex justify-center items-center max-w-[600px] w-full mx-auto my-[50px]">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-[50px] rounded w-full"
            >
            <h2 className="text-center font-semibold text-2xl mb-[30px]">
                Create New Tender
            </h2>
            <FormLabel className="mt-[10px]" htmlFor="title">
                Title
            </FormLabel>
            <Input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a title"
                required
            />
            <FormLabel className="mt-[10px]" htmlFor="description">
                Description
            </FormLabel>
            <Textarea
                id="description"
                rows={5}
                resize="none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter the tender description"
                required
            />
            <br/>
            <FormLabel className="mt-[20px]" htmlFor="fileupload">
                Supporting documents
            </FormLabel>
            <input 
                className="form-control
                    block
                    w-full
                    px-3
                    py-1.5
                    text-base
                    font-normal
                    text-gray-700
                    bg-white bg-clip-padding
                    border border-solid border-gray-300
                    rounded
                    transition
                    ease-in-out
                    m-0
                    focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none" 
                type="file" 
                id="fileupload"
                onChange={handleFileChange} 
                required
            />
            <FormLabel className="mt-[30px]" htmlFor="deadline">
                Deadline for bidding
            </FormLabel>
            <DatePicker 
                selected={biddingDeadline}
                onChange={(v:Date) => {setBiddingDeadline(v)}} 
                required 
            />
            <br/>
            <Button
                isLoading={loading}
                loadingText="Loading..."
                type="submit"
                colorScheme="teal"
                className="mt-[20px] flex w-full"
            >
                Float Tender
            </Button>
            </form>
        </div>
        </DefaultLayout>
    );
}

export default Create;