const exp = require('express');
const trustApp = exp.Router();
const eah = require('express-async-handler');
const Trust = require('../models/TrustSchema');
const Village = require('../models/VillageSchema');
const multer = require('multer');
const path = require('path');
const fs = require("fs");
trustApp.use(exp.json());

// Create directory if not exists
const uploadDir = path.join(__dirname, "../uploads/proofs");
fs.mkdirSync(uploadDir, { recursive: true });

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

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

  // Also update Trust schema money_trust
  const trustUpdateResult = await Trust.findOneAndUpdate(
    { "assigned_problems.problem_id": problemId },
    { $set: { "assigned_problems.$.money_trust": problem.estimatedamt } },  // 💥 using problem's estimatedamt
    { new: true }
  );

  if (problem.done_by_village === "started") {
    problem.status = 'ongoing';
    await Trust.findOneAndUpdate(
      { "assigned_problems.problem_id": problemId },
      { $set: { "assigned_problems.$.status": "ongoing" } }
    );
  }

  await village.save();

  res.send({
    message: "Trust status and money_trust updated",
    updatedTrust: trustUpdateResult,
    payload: problem
  });
}));

// ✅ Update a problem's status by trust as done
trustApp.put('/trust/:villageId/:problemId/done', upload.single('proof'), eah(async (req, res) => {
  const { villageId, problemId } = req.params;
  const filePath = req.file ? `/uploads/proofs/${req.file.filename}` : null;

  // 1. Update in Village
  const village = await Village.findById(villageId);
  if (!village) return res.status(404).send({ message: "Village not found" });

  const problem = village.problems.id(problemId);
  if (!problem) return res.status(404).send({ message: "Problem not found" });

  problem.done_by_trust = "done";
  if (filePath) {
    problem.proof_image = filePath;
  }

  await village.save();

  // 2. Update in Trust
  const trust = await Trust.findOne({
    "assigned_problems.problem_id": problemId,
    "assigned_problems.village_id": villageId
  });

  if (trust) {
    const assignedProblem = trust.assigned_problems.find(
      p => p.problem_id.toString() === problemId
    );

    if (assignedProblem) {
      if (filePath) {
        assignedProblem.proof_images = assignedProblem.proof_images || [];
        assignedProblem.proof_images.push(filePath);
      }

      if (problem.done_by_village === "done") {
        assignedProblem.status = "past";
      }

      await trust.save();
    }
  }

  res.send({ message: "Problem marked as done by trust", payload: problem });
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

  // get ongoing project
trustApp.get("/:trustName/ongoing", async (req, res) => {
  try {
    const { trustName } = req.params;
    // console.log(villageName)
    const trust = await Trust.findOne({name:trustName});

    if (!trust) {
      return res.status(404).json({ message: "trust not found" });
    }

    // Filter only upcoming problems
    const ongoingProblems = trust.assigned_problems.filter(
      (problem) => problem.status === "ongoing"
    );

    res.json(ongoingProblems);
    console.log(ongoingProblems)
  } catch (error) {
    res.status(500).json({ message: error });
  }
});

// Route to get all trusts with total money spent on assigned problems
trustApp.get('/trust/:trustName/total-spent', async (req, res) => {
  const trustName = req.params.trustName;  // Fetch trust name from request parameters
  
  try {
    // Find the trust by its name
    const trust = await Trust.findOne({ name: trustName });
    
    if (!trust) {
      return res.status(404).json({ message: `Trust with name ${trustName} not found` });
    }
    
    // Calculate total money spent from assigned problems
    const totalSpent = trust.assigned_problems.reduce((sum, problem) => {
      return sum + problem.money_trust; // Sum the money_trust values
    }, 0);
    
    // Prepare the response with the total spent
    res.status(200).json({
      message: 'success',
      trustName: trust.name,
      totalSpent: totalSpent,  // Send the total money spent for this trust
    });
  } catch (err) {
    console.error('Error fetching trust data:', err);
    res.status(500).json({
      message: 'Error fetching trust data',
    });
  }
});

trustApp.get('/trust/:username/top-villages', async (req, res) => {
  const { username } = req.params;

  try {
    const trust = await Trust.findOne({ name:username });
    if (!trust) return res.status(404).json({ error: 'Trust not found' });

    const villageMap = {};

    trust.assigned_problems.forEach(problem => {
      const villageId = problem.village_id?.toString();
      if (!villageId) return;

      villageMap[villageId] = (villageMap[villageId] || 0) + (problem.money_trust || 0);
    });

    const topVillageData = Object.entries(villageMap)
      .map(([villageId, totalMoney]) => ({ villageId, totalMoney }))
      .sort((a, b) => b.totalMoney - a.totalMoney)
      .slice(0, 3);

    const villageIds = topVillageData.map(v => v.villageId);
    const villages = await Village.find({ _id: { $in: villageIds } });

    const villageNameMap = {};
    villages.forEach(v => {
      villageNameMap[v._id.toString()] = v.name;
    });

    const result = topVillageData.map(v => ({
      villageId: v.villageId,
      villageName: villageNameMap[v.villageId] || 'Unknown',
      totalMoney: v.totalMoney,
    }));

    res.json({ topVillages: result });
  } catch (err) {
    console.error("Error in top-villages route:", err);
    res.status(500).json({ error: 'Server error' });
  }
});


trustApp.get('/trust/village/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const village = await Village.findById(id);
    if (!village) return res.status(404).json({ error: 'Village not found' });

    res.json({ villageId: village._id, villageName: village.name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// get problem title with problem id
trustApp.get('/problem-title/:problemId', async (req, res) => {
  const { problemId } = req.params;

  try {
    // Find the village document that contains this problem
    const village = await Village.findOne(
      { 'problems._id': problemId },
      { 'problems.$': 1 } // return only the matching problem in problems array
    );

    if (!village || !village.problems || village.problems.length === 0) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    const problem = village.problems[0]; // since we used $ operator, only 1 problem will be returned

    res.json({
      problemId: problem._id,
      title: problem.title,
      description: problem.description, // optional: send other fields if needed
      status: problem.status
    });
  } catch (err) {
    console.error('Error fetching problem title:', err);
    res.status(500).json({ message: 'Server error' });
  }
})

// Get all past projects for a trust
trustApp.get('/trust/:trustName/past-projects', async (req, res) => {
  const { trustName } = req.params;

  try {
    const trust = await Trust.findOne({ name: trustName });
    if (!trust) return res.status(404).json({ error: 'Trust not found' });

    const pastProblems = trust.assigned_problems.filter(
      p => p.status === 'past'
    );

    const villageIds = [...new Set(pastProblems.map(p => p.village_id.toString()))];
    const villages = await Village.find({ _id: { $in: villageIds } });

    const enriched = pastProblems.map(p => {
      const village = villages.find(v => v._id.toString() === p.village_id.toString());
      const matchedProblem = village?.problems?.id(p.problem_id);

      return {
        villageName: village?.name || 'Unknown',
        title: matchedProblem?.title || 'Unknown',
        description: matchedProblem?.description || '',
        proof_images: p.proof_images || [],
      };
    });

    res.json({ pastProjects: enriched });
  } catch (err) {
    console.error('Error fetching past projects:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


module.exports = trustApp;
