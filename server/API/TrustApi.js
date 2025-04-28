const exp = require('express');
const trustApp = exp.Router();
const eah = require('express-async-handler');
const Trust = require('../models/TrustSchema');
const Village = require('../models/VillageSchema');

trustApp.use(exp.json());

// Get all trusts
trustApp.get('/trust', eah(async (req, res) => {
  const trustList = await Trust.find();
  res.send({ message: "trust", payload: trustList });
}));

// Get trust by name
trustApp.get('/trust/:tr', eah(async (req, res) => {
  const trust = req.params.tr;
  const trustList = await Trust.find({ name: trust });
  res.status(200).send({ message: "Trust", payload: trustList });
}));

// Register a new trust
trustApp.post('/trust', eah(async (req, res) => {
  const trust = req.body;
  const dbres = await Trust.findOne({ email: trust.email });
  if (dbres) return res.status(409).send({ message: "Trust already existed" });

  const trustDoc = new Trust(trust);
  await trustDoc.save();
  res.status(201).send({ message: "Trust added", payload: trustDoc });
}));

// Update trust info
trustApp.put('/trust', eah(async (req, res) => {
  const trust = req.body;
  const updatedTrust = await Trust.findOneAndUpdate(
    { email: trust.email },
    { $set: { ...trust } },
    { new: true }
  );
  res.send({ message: "updated", payload: updatedTrust });
}));

// ✅ Update a problem's status by trust as started
trustApp.put('/trust/:villageId/:problemId/start', eah(async (req, res) => {
    const { villageId, problemId } = req.params;
  
    const village = await Village.findById(villageId);
    if (!village) return res.status(404).send({ message: "Village not found" });
  
    const problem = village.problems.id(problemId);
    if (!problem) return res.status(404).send({ message: "Problem not found" });
  
    problem.done_by_trust = "started";
  
    // Optional: auto-move to 'past' if village also completed
    if (problem.done_by_village==="started") {
      problem.status = 'ongoing';
      const res = await Trust.findOneAndUpdate(
        { "assigned_problems.problem_id": problemId },
        { $set: { "assigned_problems.$.status": "ongoing" } }
      );
    }
    await village.save();
    res.send({ message: "Trust status updated", payload: problem });
  }));
// ✅ Update a problem's status by trust as done
  trustApp.put('/trust/done', eah(async (req, res) => {
    const { villageId, problemId } = req.body;
  
    const village = await Village.findById(villageId);
    if (!village) return res.status(404).send({ message: "Village not found" });
  
    const problem = village.problems.id(problemId);
    if (!problem) return res.status(404).send({ message: "Problem not found" });
  
    problem.done_by_trust = "done";
  
    // Optional: auto-move to 'past' if village also completed
    if (problem.done_by_village==="done") {
      problem.status = 'past';
    }
  
    await village.save();
    res.send({ message: "Trust status updated", payload: problem });
  }));

// ✅ Get problems associated with a trust (via trust name or id)
trustApp.get('/trust/:trustName/problems', eah(async (req, res) => {
  const trustName = req.params.trustName;

  const villages = await Village.find({ 'trusts.name': trustName });

  let trustProblems = [];
  villages.forEach(village => {
    village.problems.forEach(problem => {
      if (problem.trust === trustName) {
        trustProblems.push({ village: village.name, ...problem.toObject() });
      }
    });
  });

  res.send({ message: "Problems for trust", payload: trustProblems });
}));

// ✅ Get trust's problem status summary
trustApp.get('/trust/:trustName/problem-status', eah(async (req, res) => {
  const trustName = req.params.trustName;

  const villages = await Village.find({ 'trusts.name': trustName });
  let allProblems = [];

  villages.forEach(village => {
    village.problems.forEach(problem => {
      if (problem.trust === trustName) {
        allProblems.push(problem);
      }
    });
  });

  const summary = {
    pending: [],
    ongoing: [],
    solved: [],
    past: [],
    future: [],
    all: allProblems.length,
  };

  allProblems.forEach(problem => {
    if (problem.done_by_village && problem.done_by_trust) {
      problem.status = 'past';
    }

    if (problem.status === 'pending') summary.pending.push(problem);
    else if (problem.status === 'in-progress') summary.ongoing.push(problem);
    else if (problem.status === 'solved') summary.solved.push(problem);
    else if (problem.status === 'past') summary.past.push(problem);
    else if (!problem.done_by_village && !problem.done_by_trust && new Date(problem.posted_time) > new Date())
      summary.future.push(problem);
  });

  res.status(200).send({ message: "Trust problem status summary", payload: summary });
}));

// ✅ Insert assigned problem into trust
trustApp.post('/trust/assign-problem', eah(async (req, res) => {
  const { trustId, villageId, problemId } = req.body;

  if (!trustId || !villageId || !problemId) {
    return res.status(400).send({ message: "Missing parameters" });
  }

  const trust = await Trust.findById(trustId);
  if (!trust) return res.status(404).send({ message: "Trust not found" });

  const village = await Village.findById(villageId);
  if (!village) return res.status(404).send({ message: "Village not found" });

  const problem = village.problems.id(problemId);
  if (!problem) return res.status(404).send({ message: "Problem not found" });

  trust.assigned_problems.push({
    problem_id: problemId,
    village_id: villageId,
    status: "upcoming",
    posted_time: problem.posted_time,
    money_trust: problem.estimatedamt,
  });

  await trust.save();
  problem.status = "upcoming"; // Update village problem status also
  await village.save();

  res.status(200).send({ success: true, message: "Problem assigned to trust", payload: trust });
}));



// get upcoming project
trustApp.get("/:trustName/upcoming", async (req, res) => {
    try {
      const { trustName } = req.params;
      // console.log(villageName)
      const trust = await Trust.findOne({name:trustName});
  
      if (!trust) {
        return res.status(404).json({ message: "trust not found" });
      }
  
      // Filter only upcoming problems
      const upcomingProblems = trust.assigned_problems.filter(
        (problem) => problem.status === "upcoming"
      );
  
      res.json(upcomingProblems);
      console.log(upcomingProblems)
    } catch (error) {
      res.status(500).json({ message: error });
    }
  });

module.exports = trustApp;
