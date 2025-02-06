const connectDB = require("./index");
const Rides = require("./models/rideModel");
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    await connectDB(); // ✅ Manually connect to MongoDB (IMPORTANT for Vercel cron jobs)

    const currentTime = new Date();

    const result = await Rides.updateMany(
      { schedule : { $lt: currentTime }, status: "active" },
      { status: "completed" }
    );

    console.log(`✅ Updated ${result.modifiedCount} expired buses.`);
    return res.json({
      message: "Expired rides updated",
      updated: result.modifiedCount,
    });
  } catch (error) {
    console.error("❌ Error updating rides:", error);
    return res.status(500).json({ error: "Failed to update expired rides" });
  }
}
