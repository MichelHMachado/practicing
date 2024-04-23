import axios from "axios";

const RapidAPIKey = import.meta.env.VITE_RAPID_API_KEY;

export const getRecipes = async (params: string) => {
  const options = {
    method: "GET",
    url: "https://food-recipes-with-images.p.rapidapi.com/",
    params: { q: params },
    headers: {
      "X-RapidAPI-Key": RapidAPIKey,
      "X-RapidAPI-Host": "food-recipes-with-images.p.rapidapi.com",
    },
  };
  try {
    const response = await axios.request(options);
    return response.data.d;
  } catch (error) {
    console.error(error);
  }
};
