import { serve } from "./deps.js";
import { configure, renderFile } from "./deps.js";
import { sql } from "./database/database.js";
import * as chatService from "./services/chatService.js";

configure({
  views: `${Deno.cwd()}/views/`,
});

const responseDetails = {
  headers: { "Content-Type": "text/html;charset=UTF-8" },
};

const redirectTo = (path) => {
  return new Response(`Redirecting to ${path}.`, {
    status: 303,
    headers: {
      "Location": path,
    },
  });
};

const addMessage = async (request) => {
  const formData = await request.formData();
  const sender = formData.get("sender");
  const message = formData.get("message");
  await chatService.create(sender, message);
  return redirectTo("/");
};

const listMessages = async (request) => {
  const data = {
    messages: await chatService.getFive(),
  };
  return new Response(await renderFile("index.eta", data), responseDetails);
};

const handleRequest = async (request) => {
  const url = new URL(request.url);
  if (request.method === "GET" && url.pathname === ("/")) {
    return await listMessages(request);
  }
  else {
    return await addMessage(request);
  }
};

serve(handleRequest, { port: 7777 });