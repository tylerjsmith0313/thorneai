module.exports=[72070,e=>{"use strict";var t=e.i(5246),a=e.i(9381),n=e.i(53516),s=e.i(88513),i=e.i(6151),o=e.i(50059),r=e.i(66602),l=e.i(52444),c=e.i(14694),u=e.i(49691),d=e.i(7726),p=e.i(34583),m=e.i(41813),h=e.i(36356),g=e.i(65931),f=e.i(93695);e.i(94173);var y=e.i(51092),w=e.i(72668),b=e.i(89660);let _=`You are AgyntSynq, an elite AI sales intelligence agent. You are the user's personal AI assistant for sales, marketing, customer service, and lead generation.

## Core Identity
- Name: AgyntSynq (but users can customize your name in settings)
- Role: Sales Intelligence Agent, Lead Generation Expert, Customer Success Partner
- Personality: Professional yet personable, confident but not arrogant, always solution-oriented
- Communication Style: Direct, clear, action-focused with strategic insights

## Your Capabilities
1. **Sales Intelligence**: Analyze contacts, identify opportunities, suggest optimal outreach strategies
2. **Lead Generation**: Help qualify leads, prioritize prospects, craft compelling messages
3. **Customer Service**: Guide users on handling objections, nurturing relationships, retention strategies
4. **Marketing Support**: Draft emails, social posts, and marketing copy that converts
5. **Appointment Setting**: Aggressively but professionally close on scheduling meetings
6. **Deal Closing**: Provide tactics for overcoming objections and closing deals

## Sales Philosophy (Flourish Academy Principles)
- Always lead with value, not features
- Build genuine relationships before pushing for the sale
- Use the "Feel, Felt, Found" method for handling objections
- The best close is when the customer sells themselves
- Follow up relentlessly but with purpose - each touch should add value
- Personalization wins - generic outreach is ignored
- Speed to lead matters - respond within 5 minutes when possible
- ABC: Always Be Consulting (not just closing)

## Closing Techniques
1. **Assumptive Close**: Proceed as if they've already decided
2. **Urgency Close**: Create genuine time-sensitivity without being pushy
3. **Value Stack Close**: Remind them of all the value they're getting
4. **Question Close**: "What would need to happen for us to move forward today?"
5. **Calendar Close**: "I have Thursday at 2pm or Friday at 10am - which works better?"

## Appointment Setting Scripts
- "Based on what you've shared, I think a quick 15-minute call would be incredibly valuable. I can show you exactly how we've helped similar companies achieve [specific result]. Does Tuesday or Wednesday work better for you?"
- "I don't want to waste your time with back-and-forth emails. Let's hop on a quick call - I promise if I can't add value in the first 5 minutes, we'll end the call. Fair?"
- "The best way I can help is to understand your specific situation. Can we schedule 20 minutes this week? I'll come prepared with 2-3 specific recommendations for your business."

## Email Templates Knowledge
- Cold outreach: Short, personalized, single CTA
- Follow-ups: Reference previous conversation, add new value
- Re-engagement: Acknowledge time gap, provide fresh insight
- Meeting confirmation: Clear logistics, agenda preview
- Post-meeting: Recap key points, clear next steps

## When Analyzing Contacts
- Review their engagement score, last contact date, and status
- Consider their industry, interests, and communication preferences
- Suggest personalized outreach based on their demeanor
- Identify opportunities based on their profile and history
- Recommend optimal timing based on their communication pace

## Response Format
- Be concise but comprehensive
- Use bullet points for actionable items
- Provide specific, implementable suggestions
- Include example scripts when relevant
- Always end with a clear next step or recommendation

## Platform Awareness
You have access to the user's:
- Contact database and CRM
- Calendar and scheduled events
- Email history and communications
- Research and intelligence data
- Opportunities and deal pipeline
- User's business goals and preferences (from settings)

Always leverage this context to provide personalized, relevant advice.`;var v=e.i(27034);async function C(e){let t=await (0,b.createClient)(),{data:a}=await t.from("user_settings").select("ai_name, ai_description, ai_instructions, business_description, ai_goals, business_goals, personal_goals").eq("user_id",e).single();if(!a)return"";let n="";return a.ai_name&&"AgyntSynq"!==a.ai_name&&(n+=`

## User Customization
The user has renamed you to "${a.ai_name}". Use this name when referring to yourself.`),a.ai_description&&(n+=`

## Custom AI Description
${a.ai_description}`),a.ai_instructions&&(n+=`

## User's Custom Instructions
${a.ai_instructions}`),a.business_description&&(n+=`

## User's Business
${a.business_description}`),(a.ai_goals||a.business_goals||a.personal_goals)&&(n+=`

## Goals`,a.ai_goals&&(n+=`
### AI Usage Goals
${a.ai_goals}`),a.business_goals&&(n+=`
### Business Goals
${a.business_goals}`),a.personal_goals&&(n+=`
### Personal Development Goals
${a.personal_goals}`)),n}(0,e.i(61647).ensureServerEntryExports)([C]),(0,v.registerServerReference)(C,"40ae116ae492b9e0a70cd1bbdddf231b9e5d035bf3",null);var R=e.i(11678),S=e.i(78091);async function A(e){try{let{messages:t,contactContext:a}=await e.json(),n=await (0,b.createClient)(),{data:{user:s}}=await n.auth.getUser();if(!s)return new Response("Unauthorized",{status:401});let i=await C(s.id),o=_+i;a&&(o+=`

## Current Contact Context
You are currently focused on this contact:
- Name: ${a.firstName} ${a.lastName}
- Company: ${a.company}
- Industry: ${a.industry||"Unknown"}
- Interests: ${a.interests?.join(", ")||"Not specified"}
- Demeanor: ${a.demeanor||"Not assessed"}
- Engagement Score: ${a.engagementScore||"Not calculated"}

Tailor your responses to be specific to this contact. When suggesting outreach or strategies, personalize them based on their profile.`);let r=await (s.id,{searchContacts:(0,R.tool)({description:"Search the user's contacts by name, company, email, or other criteria",inputSchema:S.z.object({query:S.z.string().describe("Search query - can be name, company, email, or keywords"),status:S.z.enum(["all","new","contacted","qualified","proposal","won","lost"]).nullable().describe("Filter by contact status"),limit:S.z.number().default(10).describe("Maximum number of results to return")}),execute:async({query:e,status:t,limit:a})=>{let n=(await (0,b.createClient)()).from("contacts").select("id, first_name, last_name, email, company, job_title, status, engagement_score, last_contact_date, industry, interests, demeanor").or(`first_name.ilike.%${e}%,last_name.ilike.%${e}%,email.ilike.%${e}%,company.ilike.%${e}%`).limit(a);t&&"all"!==t&&(n=n.eq("status",t));let{data:s,error:i}=await n;return i?{error:i.message,contacts:[]}:{contacts:s||[],count:s?.length||0}}}),getContactDetails:(0,R.tool)({description:"Get detailed information about a specific contact including their full profile, engagement history, and opportunities",inputSchema:S.z.object({contactId:S.z.string().describe("The UUID of the contact to retrieve")}),execute:async({contactId:e})=>{let t=await (0,b.createClient)(),[a,n,s]=await Promise.all([t.from("contacts").select("*").eq("id",e).single(),t.from("opportunities").select("*").eq("contact_id",e),t.from("contact_research").select("*").eq("contact_id",e).order("created_at",{ascending:!1}).limit(5)]);return{contact:a.data,opportunities:n.data||[],research:s.data||[],error:a.error?.message}}}),getUpcomingEvents:(0,R.tool)({description:"Get the user's upcoming calendar events and scheduled meetings",inputSchema:S.z.object({days:S.z.number().default(7).describe("Number of days ahead to look")}),execute:async({days:e})=>{let t=await (0,b.createClient)(),a=new Date,n=new Date;n.setDate(n.getDate()+e);let{data:s,error:i}=await t.from("calendar_events").select("id, title, event_type, start_time, end_time, status, contact_id").gte("start_time",a.toISOString()).lte("start_time",n.toISOString()).order("start_time",{ascending:!0});return i?{error:i.message,events:[]}:{events:s||[],count:s?.length||0}}}),getOpportunities:(0,R.tool)({description:"Get the user's sales opportunities and deal pipeline",inputSchema:S.z.object({stage:S.z.enum(["all","discovery","qualification","proposal","negotiation","closed_won","closed_lost"]).nullable().describe("Filter by pipeline stage"),heatStatus:S.z.enum(["all","hot","warm","cold"]).nullable().describe("Filter by deal heat status")}),execute:async({stage:e,heatStatus:t})=>{let a=(await (0,b.createClient)()).from("opportunities").select("id, title, value, stage, probability, heat_status, expected_close_date, contact_id").order("value",{ascending:!1});e&&"all"!==e&&(a=a.eq("stage",e)),t&&"all"!==t&&(a=a.eq("heat_status",t));let{data:n,error:s}=await a;if(s)return{error:s.message,opportunities:[]};let i=n?.reduce((e,t)=>e+(t.value||0),0)||0;return{opportunities:n||[],totalValue:i,count:n?.length||0}}}),searchKnowledgeBase:(0,R.tool)({description:"Search the knowledge base including Flourish Academy content, uploaded documents, and training materials",inputSchema:S.z.object({query:S.z.string().describe("Search query for finding relevant knowledge"),category:S.z.enum(["all","sales","marketing","customer_service","lead_generation","closing","objection_handling","email_templates"]).nullable().describe("Filter by knowledge category")}),execute:async({query:e,category:t})=>{let a=await (0,b.createClient)(),n=a.from("academy_content").select("id, title, category, content, key_points, scripts").or(`title.ilike.%${e}%,content.ilike.%${e}%`).limit(5);t&&"all"!==t&&(n=n.eq("category",t));let s=a.from("document_chunks").select("id, content, document_id, knowledge_documents(title, document_type)").ilike("content",`%${e}%`).limit(5),[i,o]=await Promise.all([n,s]);return{academyContent:i.data||[],userDocuments:o.data||[],totalResults:(i.data?.length||0)+(o.data?.length||0)}}}),getUserSettings:(0,R.tool)({description:"Get the user's settings including their business description, goals, and AI preferences",inputSchema:S.z.object({}),execute:async()=>{let e=await (0,b.createClient)(),{data:{user:t}}=await e.auth.getUser();if(!t)return{error:"Not authenticated"};let{data:a,error:n}=await e.from("user_settings").select("ai_name, ai_description, ai_instructions, business_description, ai_goals, business_goals, personal_goals").eq("user_id",t.id).single();return n?{error:n.message,settings:null}:{settings:a}}}),draftEmail:(0,R.tool)({description:"Draft a personalized email for a contact based on their profile and the specified purpose",inputSchema:S.z.object({contactId:S.z.string().describe("The contact to draft the email for"),purpose:S.z.enum(["cold_outreach","follow_up","meeting_request","proposal","thank_you","re_engagement"]).describe("The purpose of the email"),tone:S.z.enum(["professional","casual","urgent","friendly"]).default("professional").describe("The tone of the email"),keyPoints:S.z.array(S.z.string()).nullable().describe("Key points to include in the email")}),execute:async({contactId:e,purpose:t,tone:a,keyPoints:n})=>{let s=await (0,b.createClient)(),{data:i}=await s.from("contacts").select("first_name, last_name, company, job_title, industry, interests, demeanor").eq("id",e).single();return i?{contact:i,purpose:t,tone:a,keyPoints:n||[],instructions:`Draft a ${a} ${t.replace("_"," ")} email for ${i.first_name} ${i.last_name} at ${i.company}. Consider their industry (${i.industry}), interests (${i.interests?.join(", ")}), and demeanor (${i.demeanor}).`}:{error:"Contact not found"}}}),scheduleFollowUp:(0,R.tool)({description:"Create a follow-up task or calendar event for a contact",inputSchema:S.z.object({contactId:S.z.string().describe("The contact to follow up with"),type:S.z.enum(["call","email","meeting","task"]).describe("Type of follow-up"),scheduledFor:S.z.string().describe("When to follow up (ISO date string)"),notes:S.z.string().nullable().describe("Notes about what to discuss or do")}),execute:async({contactId:e,type:t,scheduledFor:a,notes:n})=>{let s=await (0,b.createClient)(),{data:{user:i}}=await s.auth.getUser();if(!i)return{error:"Not authenticated"};let{data:o}=await s.from("contacts").select("first_name, last_name").eq("id",e).single(),r="meeting"===t?"meeting":"call"===t?"call":"task",{data:l,error:c}=await s.from("calendar_events").insert({user_id:i.id,contact_id:e,title:`${t.charAt(0).toUpperCase()+t.slice(1)} with ${o?.first_name} ${o?.last_name}`,event_type:r,start_time:a,duration_minutes:"meeting"===t?30:"call"===t?15:5,status:"scheduled",notes:n}).select().single();return c?{error:c.message}:{success:!0,event:l,message:`Follow-up ${t} scheduled for ${new Date(a).toLocaleDateString()}`}}}),getDashboardMetrics:(0,R.tool)({description:"Get key dashboard metrics including contact stats, opportunity pipeline value, and activity summary",inputSchema:S.z.object({}),execute:async()=>{let e=await (0,b.createClient)(),[t,a,n]=await Promise.all([e.from("contacts").select("status",{count:"exact"}),e.from("opportunities").select("value, stage"),e.from("calendar_events").select("status").gte("start_time",new Date().toISOString())]),s=t.count||0,i=a.data||[],o=i.reduce((e,t)=>e+(t.value||0),0),r=i.filter(e=>!["closed_won","closed_lost"].includes(e.stage)).length,l=n.data?.length||0;return{totalContacts:s,pipelineValue:o,activeDeals:r,upcomingEvents:l,summary:`You have ${s} contacts, ${r} active deals worth $${o.toLocaleString()}, and ${l} upcoming events.`}}})}),l=await (0,w.convertToModelMessages)(t);return(0,w.streamText)({model:"openai/gpt-4o",system:o,messages:l,tools:r,maxSteps:5}).toUIMessageStreamResponse()}catch(e){return console.error("[v0] AI Chat Error:",e),new Response(JSON.stringify({error:"Failed to process chat request"}),{status:500,headers:{"Content-Type":"application/json"}})}}e.s(["POST",()=>A],46004);var x=e.i(46004);let k=new t.AppRouteRouteModule({definition:{kind:a.RouteKind.APP_ROUTE,page:"/api/ai/chat/route",pathname:"/api/ai/chat",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/app/api/ai/chat/route.ts",nextConfigOutput:"",userland:x}),{workAsyncStorage:E,workUnitAsyncStorage:$,serverHooks:I}=k;function T(){return(0,n.patchFetch)({workAsyncStorage:E,workUnitAsyncStorage:$})}async function P(e,t,n){k.isDev&&(0,s.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let w="/api/ai/chat/route";w=w.replace(/\/index$/,"")||"/";let b=await k.prepare(e,t,{srcPage:w,multiZoneDraftMode:!1});if(!b)return t.statusCode=400,t.end("Bad Request"),null==n.waitUntil||n.waitUntil.call(n,Promise.resolve()),null;let{buildId:_,params:v,nextConfig:C,parsedUrl:R,isDraftMode:S,prerenderManifest:A,routerServerContext:x,isOnDemandRevalidate:E,revalidateOnlyGenerated:$,resolvedPathname:I,clientReferenceManifest:T,serverActionsManifest:P}=b,q=(0,r.normalizeAppPath)(w),z=!!(A.dynamicRoutes[q]||A.routes[I]),U=async()=>((null==x?void 0:x.render404)?await x.render404(e,t,R,!1):t.end("This page could not be found"),null);if(z&&!S){let e=!!A.routes[I],t=A.dynamicRoutes[q];if(t&&!1===t.fallback&&!e){if(C.experimental.adapterPath)return await U();throw new f.NoFallbackError}}let N=null;!z||k.isDev||S||(N="/index"===(N=I)?"/":N);let D=!0===k.isDev||!z,O=z&&!D;P&&T&&(0,o.setManifestsSingleton)({page:w,clientReferenceManifest:T,serverActionsManifest:P});let j=e.method||"GET",F=(0,i.getTracer)(),M=F.getActiveScopeSpan(),H={params:v,prerenderManifest:A,renderOpts:{experimental:{authInterrupts:!!C.experimental.authInterrupts},cacheComponents:!!C.cacheComponents,supportsDynamicResponse:D,incrementalCache:(0,s.getRequestMeta)(e,"incrementalCache"),cacheLifeProfiles:C.cacheLife,waitUntil:n.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,a,n,s)=>k.onRequestError(e,t,n,s,x)},sharedContext:{buildId:_}},G=new l.NodeNextRequest(e),B=new l.NodeNextResponse(t),K=c.NextRequestAdapter.fromNodeNextRequest(G,(0,c.signalFromNodeResponse)(t));try{let o=async e=>k.handle(K,H).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let a=F.getRootSpanAttributes();if(!a)return;if(a.get("next.span_type")!==u.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${a.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let n=a.get("next.route");if(n){let t=`${j} ${n}`;e.setAttributes({"next.route":n,"http.route":n,"next.span_name":t}),e.updateName(t)}else e.updateName(`${j} ${w}`)}),r=!!(0,s.getRequestMeta)(e,"minimalMode"),l=async s=>{var i,l;let c=async({previousCacheEntry:a})=>{try{if(!r&&E&&$&&!a)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let i=await o(s);e.fetchMetrics=H.renderOpts.fetchMetrics;let l=H.renderOpts.pendingWaitUntil;l&&n.waitUntil&&(n.waitUntil(l),l=void 0);let c=H.renderOpts.collectedTags;if(!z)return await (0,p.sendResponse)(G,B,i,H.renderOpts.pendingWaitUntil),null;{let e=await i.blob(),t=(0,m.toNodeOutgoingHttpHeaders)(i.headers);c&&(t[g.NEXT_CACHE_TAGS_HEADER]=c),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let a=void 0!==H.renderOpts.collectedRevalidate&&!(H.renderOpts.collectedRevalidate>=g.INFINITE_CACHE)&&H.renderOpts.collectedRevalidate,n=void 0===H.renderOpts.collectedExpire||H.renderOpts.collectedExpire>=g.INFINITE_CACHE?void 0:H.renderOpts.collectedExpire;return{value:{kind:y.CachedRouteKind.APP_ROUTE,status:i.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:a,expire:n}}}}catch(t){throw(null==a?void 0:a.isStale)&&await k.onRequestError(e,t,{routerKind:"App Router",routePath:w,routeType:"route",revalidateReason:(0,d.getRevalidateReason)({isStaticGeneration:O,isOnDemandRevalidate:E})},!1,x),t}},u=await k.handleResponse({req:e,nextConfig:C,cacheKey:N,routeKind:a.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:A,isRoutePPREnabled:!1,isOnDemandRevalidate:E,revalidateOnlyGenerated:$,responseGenerator:c,waitUntil:n.waitUntil,isMinimalMode:r});if(!z)return null;if((null==u||null==(i=u.value)?void 0:i.kind)!==y.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==u||null==(l=u.value)?void 0:l.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});r||t.setHeader("x-nextjs-cache",E?"REVALIDATED":u.isMiss?"MISS":u.isStale?"STALE":"HIT"),S&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let f=(0,m.fromNodeOutgoingHttpHeaders)(u.value.headers);return r&&z||f.delete(g.NEXT_CACHE_TAGS_HEADER),!u.cacheControl||t.getHeader("Cache-Control")||f.get("Cache-Control")||f.set("Cache-Control",(0,h.getCacheControlHeader)(u.cacheControl)),await (0,p.sendResponse)(G,B,new Response(u.value.body,{headers:f,status:u.value.status||200})),null};M?await l(M):await F.withPropagatedContext(e.headers,()=>F.trace(u.BaseServerSpan.handleRequest,{spanName:`${j} ${w}`,kind:i.SpanKind.SERVER,attributes:{"http.method":j,"http.target":e.url}},l))}catch(t){if(t instanceof f.NoFallbackError||await k.onRequestError(e,t,{routerKind:"App Router",routePath:q,routeType:"route",revalidateReason:(0,d.getRevalidateReason)({isStaticGeneration:O,isOnDemandRevalidate:E})},!1,x),z)throw t;return await (0,p.sendResponse)(G,B,new Response(null,{status:500})),null}}e.s(["handler",()=>P,"patchFetch",()=>T,"routeModule",()=>k,"serverHooks",()=>I,"workAsyncStorage",()=>E,"workUnitAsyncStorage",()=>$],72070)}];

//# sourceMappingURL=064f5_next_dist_esm_build_templates_app-route_9433e08a.js.map