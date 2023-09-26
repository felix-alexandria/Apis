import axios from "axios";
import http, { IncomingMessage, ServerResponse } from "http";
import { stringify } from "querystring";
import path from "path"
import fs from "fs"

const Port: number = 2003;

interface iMessage {
    message: string;
    success: boolean;
    data: null | {} | {}[]
}

const Server = http.createServer((req: IncomingMessage, res: ServerResponse<IncomingMessage>)=>{
    res.setHeader("Content-type", "Application/json");
    let {method, url} = req;
    let status = 404;

    const response: iMessage={
        message: "failed",
        success: false,
        data: null
    };
    if(method === "POST" && url==="/getgithubuserdetails"){
        let requestbody ="";
        req.on("data", (chunk)=>{
            requestbody += chunk;
        });
        req.on("end", async ()=>{
            let requestData = JSON.parse(requestbody)
            const {username} = requestData;
            if (!username || !requestData){
                status = 400;
                response.message="No request made",
                response.success= false,
                response.data = null,
                res.write(JSON.stringify({status, response}));
                res.end()
            }
            const githubendpoint = await axios.get(`https://api.github.com/users/${username}`)
            if (githubendpoint.status){
                const userdetails = githubendpoint.data;
                const useravatar = userdetails.avatar_url;
                const avatarfilename = `${username}.avatar.jpg`
                const avatarfolder = path.join(__dirname, "GitHub_Avatar", avatarfilename);
                const getavatarurl = await axios.get(useravatar, {
                    responseType: "stream"
                });
                getavatarurl.data.pipe(fs.createWriteStream(avatarfolder));
                status = 200;
                (response.message = `${userdetails.name?userdetails.name: username} Github details gotten`);
                (response.success = true);
                (response.data = userdetails);
                res.write(JSON.stringify({status, response}));
                res.end()
            }
        })
    }else{
        response.message="Check your routes",
        response.success= false,
        response.data = null,
        res.write(JSON.stringify({status, response}));
        res.end();

    }
});
Server.listen(Port, ()=>{
    console.log("Server is running and listening to port", Port)
})