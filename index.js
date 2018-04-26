const express = require("express")
const config = require("./config")
const rp = require("request-promise-native")

const app = express();

app.get("/login",(req,res) => {
    console.log("User request to login")

    let accessDataTokenUrl = `https://accounts.spotify.com/authorize?client_id=${config.spotify.clientId}&response_type=code&redirect_uri=http://localhost:8080/authorized&show_dialog=true`

    res.redirect(accessDataTokenUrl)

})

app.get("/authorized",async (req,res) => {

    if(req.query.error){
        console.log("User login error : "+req.query.error)
        res.send("The app is not allowed to access your Spotify account")
        return
    }

    let authorization = new Buffer(config.spotify.clientId+":"+config.spotify.clientSecret).toString("base64")

    console.log("User login authorized")
    console.log("Authorization code : "+req.query.code)
    console.log("Authorization : "+authorization)

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

    res.send(`Welcome to the app ${user.id} !`)

})

app.use("/",express.static(__dirname+"/static"))

app.listen(8080,() => {
    console.log("Listening...")
})