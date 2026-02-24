// This script registers an admin user for initial login.
import db from "./dynamoDB.js";
import UserAuth from "./userAuth.js";

const userAuth = new UserAuth(db.docClient);

async function seedAdmin() {
  const username = "admin";
  const password = "changeme";
  console.log("Attempting to create admin user...");
  try {
    await userAuth.registerUser(username, password);
    console.log("Admin user created: username=admin, password=changeme");
  } catch (e) {
    console.error("Failed to create admin user:", e);
  }
}

seedAdmin().then(() => console.log("Seeding complete.")).catch(e => console.error("Seeding error:", e));
