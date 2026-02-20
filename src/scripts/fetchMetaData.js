// scripts/fetchMetaData.js
import fetch from "node-fetch";
import fs from "fs";

async function fetchFacebook() {
  const token = process.env.FB_ACCESS_TOKEN;
  const res = await fetch(
    `https://graph.facebook.com/me?fields=id,name,posts.limit(5){message,created_time}&access_token=${token}`
  );
  const data = await res.json();
  fs.writeFileSync("public/facebook.json", JSON.stringify(data, null, 2));
}

async function fetchInstagram() {
  const token = process.env.IG_ACCESS_TOKEN;
  const res = await fetch(
    `https://graph.facebook.com/me?fields=id,username,media.limit(5){caption,media_url,timestamp}&access_token=${token}`
  );
  const data = await res.json();
  fs.writeFileSync("public/instagram.json", JSON.stringify(data, null, 2));
}


async function fetchThreads() {
  const token = process.env.THREADS_ACCESS_TOKEN;
  const res = await fetch(
    `https://graph.threads.net/me?fields=id,username,threads.limit(5){text,created_time}&access_token=${token}`
  );
  const data = await res.json();
  fs.writeFileSync("public/threads.json", JSON.stringify(data, null, 2));
}

fetchFacebook();
fetchInstagram();
fetchThreads();