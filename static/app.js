(() => {

    let socket = io()
    let user = null
    let authWindow = null

    function openAuthWindow(){

        let authUrl = `https://accounts.spotify.com/authorize?client_id=727b893b0d904dba940113e1d2f89a43&response_type=code&redirect_uri=http://localhost:8080/authorized&show_dialog=true&state=${socket.id}`
        authWindow = window.open(authUrl,"Login to Spotify","dependent=yes,chrome=yes,centerscreen=yes")

    }

    function renderConnection(){
        document.getElementById("login-modal").classList.add("hidden")
        document.getElementById("logged-modal").classList.remove("hidden")
        document.getElementById("user-name").innerHTML = user.display_name ? user.display_name : user.id
        document.getElementById("user-object").innerHTML = JSON.stringify(user, null, 2)
    }

    socket.on("connect",() => {
        console.log("Socket connected",socket.id)
        document.getElementById("login-button").addEventListener("click",() => openAuthWindow())
    })

    socket.on("loggedin",(connectedUser) => {
        user = connectedUser
        console.log("Successfully logged in")
        authWindow.close()
        renderConnection()
    })

})()