import { FieldPath, FieldSnapshot } from "../formFields/types";
import { Server } from "../utils/crossContextCommunication";
import { deleteAnswer, getAnswer, saveAnswer } from "../utils/storage";


// Regiser server and methods accessible to injected script.
const server = new Server(process.env.CONTENT_SCRIPT_URL)
server.register('saveAnswer', async (fieldSnapshot: FieldSnapshot) => {
  return await saveAnswer(fieldSnapshot)
})

server.register("getAnswer", async (fieldPath: FieldPath) => {
  const answer =  await getAnswer(fieldPath);
  return answer
})

server.register("deleteAnswer", async (fieldPath: FieldPath) => {
  return await deleteAnswer(fieldPath)
})


// inject script
function injectScript(filePath: string) {
  const script = document.createElement('script')
  script.src = chrome.runtime.getURL(filePath)
  script.type = 'module'
  script.onload = function () {
    script.remove()
  }
  ;(document.head || document.documentElement).appendChild(script)
}

injectScript('inject.js')
