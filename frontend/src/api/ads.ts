import { Advertisement } from "@/model/ads";
import { baseUrl } from "./base";
import { useQuery } from "@tanstack/react-query";

export const useGetAds = () => {
  const fetchAdvertisements = async () => {
    return fetch(`${baseUrl}/api/advertisements/mock`, {
      method: "GET",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => data.advertisements as Advertisement[])
      .catch((err) => console.log(err));
  };

  const { data, error, isLoading } = useQuery({
    queryKey: ["getAds"],
    queryFn: () => fetchAdvertisements(),
  });

  return { data, error, isLoading };
};
