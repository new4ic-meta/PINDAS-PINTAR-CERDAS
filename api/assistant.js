// Optional serverless endpoint (Vercel-style). Set AI_API_KEY as a server environment variable.
// Never place provider keys in app.js, HTML, or a public repository.
export default async function handler(req,res){
  if(req.method!=="POST") return res.status(405).json({error:"Method not allowed"});
  const key=process.env.AI_API_KEY;
  if(!key) return res.status(503).json({error:"AI_API_KEY belum dikonfigurasi"});
  try{
    const {prompt,module="assistant"}=req.body||{};
    if(typeof prompt!=="string"||!prompt.trim()||prompt.length>6000) return res.status(400).json({error:"Permintaan tidak sah"});
    const upstream=await fetch(process.env.AI_API_URL||"https://api.openai.com/v1/chat/completions",{
      method:"POST",headers:{"Content-Type":"application/json","Authorization":`Bearer ${key}`},
      body:JSON.stringify({model:process.env.AI_MODEL||"gpt-4o-mini",messages:[{role:"system",content:`You are AFIDAN, a helpful and careful assistant. Module: ${module}. Respond in the user's language. Be clear and do not invent facts.`},{role:"user",content:prompt}],temperature:0.6})
    });
    const data=await upstream.json();
    if(!upstream.ok) return res.status(502).json({error:"Penyedia AI tidak dapat memproses permintaan"});
    return res.status(200).json({answer:data.choices?.[0]?.message?.content||"Tiada jawapan diterima."});
  }catch(e){return res.status(500).json({error:"Ralat pelayan"});}
}
