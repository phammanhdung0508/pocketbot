const url = "https://pocketbot.onrender.com";

console.log("Launch!")
setInterval(async () => {
  try {
    const res = await fetch(url);
    console.log(`Ping ${url} - Status ${res.status}`);
  } catch (err: any) {
    console.error("Ping failed:", err.message);
  }
}, 5 * 60 * 1000);
