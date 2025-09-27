//This is a function for checking if a website is legit or not. 
import axios, { AxiosError } from "axios"

export default  async function checkURL(url: string)
{
    try{
        new URL(url)
        await axios.head(url, {timeout: 7000});
        return true
    }catch(err: any)
    {
        if(err.response)
        {
            console.log("Getting some error from the website ", err.response.status)
            return true
        }
        else if(err.request)
        {
            console.error(`Network error for ${url}: ${err.code}`);
            return false;
        }
        else
        {
            console.error(`Request setup error: ${err.message}`);
            return false;
        }
    }
}