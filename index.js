let http = require("http")
let path = require("path")
let fs = require("fs")
let url = require("url")

let dataPath = path.join(__dirname, "data")   

let server = http.createServer((req, res)=> {
    res.setHeader("Access-Control-Allow-Origin", "*")
    switch(req.url){
        case "/jokes":
           if (req.method == "GET")  getJokes(req, res)
            if(req.method == "POST") addJoke(req, res)
            break;
        default:
            if (req.url.startsWith("/like") && req.method == "GET"){
                let params = url.parse(req.url, true).query
                let id = params.id
                like(id)
                
                res.end()
                return
            }
            if (req.url.startsWith("/dislike") && req.method == "GET"){
                let params = url.parse(req.url, true).query
                let id = params.id
                dislike(id)
                
                res.end()
                return
            }
            notFound(req, res)
    }
})

server.listen(3000, ()=> console.log("server started on http://localhost:3000"))

function notFound(req, res){
    res.statusCode = 404
    res.end()
}

function getJokes(req, res){
    let jokesFiles = fs.readdirSync(dataPath)
    let jokes = []
    for(let i = 0; i < jokesFiles.length; i++){
        let pathToFile = path.join(dataPath, jokesFiles[i])
        let binary = fs.readFileSync(pathToFile)
        let str = Buffer.from(binary).toString()
        let obj = JSON.parse(str)
        obj.id = i
        jokes.push(obj)
    }
    res.writeHead(200, {"content-Type": "application/json"})
    res.end(JSON.stringify(jokes))
}


function addJoke(req, res){
    let data = ""
    req.on("data", chunk => data += chunk)
    req.on("end", ()=> {
        data = JSON.parse(data)
        data.likes = 0
        data.dislikes = 0
        let dir = fs.readdirSync(dataPath)
        let fileName = dir.length + ".json"
        fs.writeFileSync(
            path.join(dataPath, fileName),
            JSON.stringify(data)
        )
        console.log(data)
        res.end()
    })
}

function like(id){
    if(fs.existsSync(path.join(dataPath, id + ".json"))){
        let p = path.join(dataPath, id + ".json")
        let data = fs.readFileSync(p)
        let joke = Buffer.from(data).toString()
        let obj = JSON.parse(joke)
        obj.likes = obj.likes + 1
        fs.writeFileSync(p, JSON.stringify(obj))
    }else{
        return null
    }

}
function dislike(id){
    if(fs.existsSync(path.join(dataPath, id + ".json"))){
        let p = path.join(dataPath, id + ".json")
        let data = fs.readFileSync(p)
        let joke = Buffer.from(data).toString()
        let obj = JSON.parse(joke)
        obj.dislikes = obj.dislikes + 1
        fs.writeFileSync(p, JSON.stringify(obj))
    }else{
        return null
    }

}