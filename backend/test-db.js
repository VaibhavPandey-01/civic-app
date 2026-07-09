const mongoose = require('mongoose');
const dns = require('dns');

dns.setServers(['8.8.8.8', '1.1.1.1']);

const uri = "mongodb+srv://ocean_user:Admin%40123@cluster0.vfxvkls.mongodb.net/?appName=Cluster0";

async function run() {
  try {
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(uri);
    console.log("Connected successfully!");

    const db = mongoose.connection.useDb('test').db;
    const reportsCollection = db.collection('reports');

    const reports = await reportsCollection.find().sort({ createdAt: -1 }).limit(3).toArray();
    
    console.log("\nLatest 3 Reports in Database:");
    reports.forEach((r, idx) => {
      console.log(`\nReport #${idx + 1}:`);
      console.log(`- ID: ${r._id}`);
      console.log(`- Category: ${r.category}`);
      console.log(`- Description: ${r.description}`);
      console.log(`- Status: ${r.status}`);
      console.log(`- AI Detection:`, r.aiDetection);
      console.log(`- AI Validation:`, r.aiValidation);
    });
    
    process.exit(0);
  } catch (error) {
    console.error("Failed to fetch reports:", error);
    process.exit(1);
  }
}

run();
