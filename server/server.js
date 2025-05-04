const exp = require('express')
const app = exp()
const mongoose = require('mongoose')
const villageApp = require('./API/VillageApi')
const trustApp = require('./API/TrustApi')
const individualApp = require('./API/IndividualApi')
const AdminApp = require('./API/AdminApi')
const path = require('path');
const cors = require('cors')
app.use(cors())
require('dotenv').config()
const port = process.env.PORT || 8965

app.use('/uploads', exp.static(path.join(__dirname, 'uploads')));

app.use(exp.json())
mongoose.connect(process.env.DBURL)
.then(()=>{
    app.listen(port,
        console.log(`server on port ${port}`)

)})
.catch(e=>console.log("Err in db connection ",e))

app.use('/village-api',villageApp)
app.use('/trust-api',trustApp)
app.use('/individual-api',individualApp)
app.use('/admin-api',AdminApp)
app.use((err,req,res,next)=>{
    res.send({message:"Error",error:err.message})
})

module.exports=app