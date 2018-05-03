const express = require("express")
const config = require("./config")
const rp = require("request-promise-native")
const SocketIo = require("socket.io")

const app = express();
const http = require("http").createServer(app)
const io = SocketIo(http)

app.get("/authorized",async (req,res) => {

    if(req.query.error){
        console.log("User login error : "+req.query.error)
        res.send("The app is not allowed to access your Spotify account")
        return
    }

    console.log("User login authorized")
    console.log("Authorization code : "+req.query.code)

        let token = await rp.post({
            url: "https://accounts.spotify.com/api/token", form: {
                grant_type: "authorization_code",
                code: req.query.code,
                redirect_uri: "http://localhost:8080/authorized",
                client_id: config.spotify.clientId,
                client_secret: config.spotify.clientSecret
            }, json: true
        })

    let accessToken = token.access_token
    console.log("Got access token : "+accessToken)

    let user = await rp({url: "https://api.spotify.com/v1/me", headers: {
        "Authorization":"Bearer "+accessToken
    }, json: true})

    console.log("Successful login of "+user.id)

    res.send(`Sucessful login`)

    io.to(req.query.state).emit("loggedin",user)

})

app.use("/",express.static(__dirname+"/static"))

io.on("connection", (socket) => {
    console.log("Socket connected")
})

http.listen(8080,() => {
    console.log("Listening...")
})