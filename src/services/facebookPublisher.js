// Purpose: Publish generated posts to a Facebook Page using Meta Graph API.

import dotenv from "dotenv";

dotenv.config();

const PAGE_ID = process.env.FACEBOOK_PAGE_ID;
const ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;


/**
 * Normalize and validate hashtags input.
 */
function normalizeHashtags(rawHashtags) {

  if (!rawHashtags) return [];


  let parts = [];


  if (Array.isArray(rawHashtags)) {

    parts = rawHashtags
      .map((h)=>String(h).trim())
      .filter(Boolean);

  } 
  else if (typeof rawHashtags === "string") {

    parts = rawHashtags
      .split(/[,\s|]+/)
      .map((p)=>p.trim())
      .filter(Boolean);

  }
  else {

    throw new Error("hashtags must be an array or string");

  }


  return parts.map(tag=>{

    const clean = tag
      .replace(/^#+/,"")
      .replace(/\s+/g,"");


    return clean ? `#${clean}` : "";

  }).filter(Boolean);

}



/**
 * Build Facebook message.
 */
function buildFacebookMessage(caption, hashtagsArr){

  const captionText = caption
      ? String(caption).trim()
      : "";


  const tagsText = hashtagsArr.length
      ? `\n\n${hashtagsArr.join(" ")}`
      : "";


  return `${captionText}${tagsText}`.trim();

}



/**
 * Publish post to Facebook Page.
 */
export async function publishPost(post){


  if(!post || typeof post !== "object"){

    throw new Error(
      "Invalid post object"
    );

  }



  const {
    title,
    caption,
    hashtags
  } = post;



  if(!title || !caption){

    throw new Error(
      "Title and caption are required"
    );

  }



  if(!PAGE_ID || !ACCESS_TOKEN){

    throw new Error(
      "Missing FACEBOOK_PAGE_ID or FACEBOOK_ACCESS_TOKEN in .env"
    );

  }



  try{


    const tagsArray = normalizeHashtags(hashtags);



    const message = buildFacebookMessage(
      caption,
      tagsArray
    );



    const response = await fetch(

      `https://graph.facebook.com/v23.0/${PAGE_ID}/feed`,

      {

        method:"POST",

        headers:{

          "Content-Type":"application/json"

        },

        body:JSON.stringify({

          message,

          access_token: ACCESS_TOKEN

        })

      }

    );



    const data = await response.json();



    if(!response.ok){

      throw new Error(
        JSON.stringify(data)
      );

    }



    return {

      success:true,

      message:"Facebook post published successfully.",

      facebookPostId:data.id,

      facebookPayload:{

        title:title.trim(),

        message

      }

    };



  }

  catch(error){


    return {

      success:false,

      message:error.message

    };


  }


}