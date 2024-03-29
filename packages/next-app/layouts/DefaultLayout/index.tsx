import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";

const DefaultLayout = ({ children }: any) => {
  return (
    <div className="flex flex-col bg-background text-text w-full">
      <Navbar />
      <div className="w-full max-w-[1440px] mx-auto px-[32px] md:px-[64px] lg:px-[120px]">
        {children}
      </div>
      <Footer />
    </div>
  );
};

export default DefaultLayout;