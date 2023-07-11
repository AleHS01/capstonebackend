const express = require('express')
const cors = require('cors')
const app = express()
const PORT = 8080
app.use(cors())

app.get('/', (req, res)=>{
    res.send("server up and running :)")
})

const runServer = () => {
    app.listen(PORT, ()=>{
        console.log("Live on port 8080.")
    })
}

runServer()
module.exports = app