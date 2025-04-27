const exp=require('express')
const individualApp=exp.Router();
const eah=require('express-async-handler')
const Individual = require('../models/IndividualSchema')
individualApp.use(exp.json())
individualApp.get('/individual',eah(async(req,res)=>{
     const individualList = await Individual.find();
     res.send({message:"Individuals",payload:individualList})
}))

individualApp.post('/individual',eah(async(req,res)=>{
    const individual = req.body
    const dbres = await Individual.findOne({email:individual.email})
    if(dbres)
        res.status(409).send({message:"individual already existed",payload:individual})
    else{
        const individualDoc = Individual(individual)
        let r=await individualDoc.save()
        res.status(201).send({message:"Individual added" ,payload:individualDoc})
    }
}))


individualApp.put('/individual',eah(async(req,res)=>{
    const individual=req.body;
    let updatedindividual=await Individual.findOneAndUpdate({email:individual.email},{$set:{...individual}},{new:true})
    res.send({message:"updated",payload:updatedindividual})
}))

module.exports=individualApp