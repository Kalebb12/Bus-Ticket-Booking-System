const express = require('express')
const dotenv = require('dotenv')
const app = express()
dotenv.config()

const port = process.env.PORT || 5000

app.get('/',(req,res)=>{
    res.json('Hello World')
})


app.listen(port,()=>{
    console.log(`Server is running on port ${port}`)
})