import http, { IncomingMessage, ServerResponse } from "http"
import axios from "axios"
import path from "path"
import fs from "fs"

const port : number = 2004;

interface iMessage {
    message: string;
    success: boolean;
    data: null | string | {} | {}[]
}

const server = http.createServer((req: IncomingMessage, res: ServerResponse<IncomingMessage>) => {
    res.setHeader("Content-type", "Application/json")
    let status = 404;
    const {method, url} = req
    const response: iMessage={
        message: "no products gotten",
        success: false,
        data: null
    }
    let  Holder = "";
    req.on("data", (chunk)=>{
        Holder += chunk;
    }).on("end", async ()=> {
        if(method === "GET" && url === "/getfakeapiproducts"){
            const urL : any = url?.split("/")[1];
            const getproduct = parseInt(urL);
            const FakeApiEndPoint = await axios.get("http://fakestoreapi.com/products");
            if(FakeApiEndPoint.status){
                let fakeholder = FakeApiEndPoint.data;
                let fake = fakeholder.filter((el)=> {
                    return el.id === getproduct
                })
                status = 200;
                response.message = "products gotten",
                response.success = true,
                response.data = fakeholder,
                res.write(JSON.stringify({status, response}));
                res.end()
            }else{
                status = 404;
                response.message = "No products gotten",
                response.success = false,
                response.data = null,
                res.write(JSON.stringify({status, response}));
                res.end()
            }            
        };
        if(method === "GET"){
            const FakeApiEndPoint = await axios.get("http://fakestoreapi.com/products");
            if (FakeApiEndPoint.status){
                const productimg = FakeApiEndPoint.data;
                const image = productimg.image;
                const imagefilename = (`${productimg}.image.jpg`)
                const imageFolder = path.join(__dirname, "Images", imagefilename)
                const getimage = await axios.get(image, {
                    responseType : "stream"
                })
                getimage.data.pipe(fs.createWriteStream(imageFolder))
                status = 200;
                response.message = "Images gotten",
                response.success = true,
                response.data = productimg,
                res.write(JSON.stringify({status, response}));
                res.end()
            } else {
                status = 404;
                response.message = "No Images gotten",
                response.success = false,
                response.data = null,
                res.write(JSON.stringify({status, response}));
                res.end()
            }
        }
    })
})
server.listen(port, ()=>{
    console.log("Server is listening on port", port)
})