import SearchBar from "@/components/search/SearchBar";
import { FlipWords } from "@/components/ui/flip-words";
import Lottie from "lottie-react";
import houseAnimation from "../../public/lotties/building.json";
/**
 * Renders the home page.
 */
function HomePage() {
  return (
    <div className="flex justify-center overflow-x-clip">
      <div className="min-h-[75vh] max-w-[75vw] flex flex-col xl:items-center space-y-24">
        <section className="pt-20 space-y-4">
          <div className="flex flex-col xl:items-start w-full">
            <h1 className="text-7xl font-bold">
              Subletting made <br />{" "}
              <FlipWords
                words={["easy", "simple", "convenient"]}
                className="text-indigo-500 pl-0"
              />
            </h1>
            <h4 className="text-xl mt-4">
              Rent or sublet student properties without much hassle.
            </h4>
          </div>
          <div className="space-y-2 py-10 flex flex-col justify-center w-full relative">
            <div className="z-10">
              <SearchBar />
            </div>
            <Lottie
              animationData={houseAnimation}
              className="absolute right-0 top-1/4 transform -translate-y-1/2 translate-x-1/3 opacity-40 w-[100vw] z-0 2xl:h-[150vh]"
              loop={false}
            />
          </div>
        </section>
        <div className="flex flex-col md:flex-row justify-between items-start w-full mt-10 2xl:max-w-[75vw] 3xl:max-w-[50.5vw] pb-10 z-30">
          <section className="bg-white rounded-lg shadow-lg w-full md:w-[32%]">
            <div className="p-6 pb-0">
              <h2 className="text-3xl font-bold text-indigo-500">
                The new way to find <br /> student accommodations.
              </h2>
              <p className="text-xl text-gray-700 mt-4">
                Search for student accommodations or post your own listings.
              </p>
            </div>
            <img
              src="/HouseImage.png"
              alt="Card Image"
              className="w-full mt-6 rounded-b-md z-0"
            />
          </section>
          <section className="w-full md:w-[65%] h-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
              <div className="flex flex-col items-start bg-white rounded-lg shadow-lg py-4 px-6 space-y-2">
                <img
                  src="/VerifiedDorms.png"
                  alt="Verified"
                  className="w-20 h-20 mb-1"
                />
                <h3 className="text-xl font-bold">Verified (Student) Dorms</h3>
                <p className="text-gray-700">
                  We ensure that all listings on our platform are, in fact,
                  student dorms.
                </p>
              </div>
              <div className="flex flex-col items-start  bg-white rounded-lg shadow-lg py-4 px-6 space-y-2">
                <img
                  src="/BestPrice.png"
                  alt="Best Price"
                  className="w-20 h-20 mb-1"
                />
                <h3 className="text-xl font-bold">Best Price</h3>
                <p className="text-gray-700">
                  Find the best prices for student accommodations.
                </p>
              </div>
              <div className="flex flex-col items-start  bg-white rounded-lg shadow-lg py-4 px-6 space-y-2">
                <img
                  src="/LowComission.png"
                  alt="Low Commission"
                  className="w-20 h-20 mb-1"
                />
                <h3 className="text-xl font-bold">Low Fees</h3>
                <p className="text-gray-700">
                  Our low commission fee per successful booking is a worthwhile
                  investment considering the time saved using Leasy.
                </p>
              </div>
              <div className="flex flex-col items-start  bg-white rounded-lg shadow-lg py-4 px-6 space-y-2">
                <img
                  src="/OverallControl.png"
                  alt="Overall Control"
                  className="w-20 h-20 mb-1"
                />
                <h3 className="text-xl font-bold">You're in Charge</h3>
                <p className="text-gray-700">
                  Inform yourself about the potential tenants or subletters and
                  communicate with them before you proceed.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
