import { publishPost } from "../src/services/facebookPublisher.js";


const result = await publishPost({

    title:"AI Test Post",

    caption:
    "Hello from AI Facebook Content Factory 🚀",

    hashtags:
    "#AI #Automation #AmericanSeniors"

});


console.log(result);