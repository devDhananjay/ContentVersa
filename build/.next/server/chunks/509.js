"use strict";exports.id=509,exports.ids=[509],exports.modules={16248:(a,b,c)=>{c.d(b,{ZM:()=>e,tQ:()=>f});var d=c(52731);async function e(a){if(!(process.env.SMTP_HOST?.trim()&&process.env.SMTP_USER?.trim()&&process.env.SMTP_PASSWORD?.trim()))return!1;let b=process.env.EMAIL_FROM?.trim()||process.env.SMTP_USER.trim(),c={from:`ContentVerse <${b}>`,to:a.to,subject:a.subject,html:a.html,text:a.text||a.html.replace(/<br\s*\/?>/gi,"\n").replace(/<\/p>/gi,"\n\n").replace(/<[^>]+>/g,"").replace(/\n{3,}/g,"\n\n").trim(),replyTo:a.replyTo};for(let b of function(){let a=Number(process.env.SMTP_PORT||"465");return[...new Set([a,465===a?587:465].filter(a=>a>0))]}()){let e=function(a){let b=process.env.SMTP_HOST.trim(),c={host:b,port:a,secure:465===a,requireTLS:587===a,auth:{user:process.env.SMTP_USER.trim(),pass:process.env.SMTP_PASSWORD.trim()},connectionTimeout:2e4,greetingTimeout:2e4,socketTimeout:3e4,tls:{minVersion:"TLSv1.2",servername:b}};return d.createTransport(c)}(b);try{return await e.sendMail(c),!0}catch(c){console.error(`[email] send failed on port ${b}`,a.to,c)}finally{e.close()}}return!1}async function f(a,b){let c=[...new Set(a.map(a=>a.trim().toLowerCase()).filter(Boolean))],d=0;for(let a of c)await e(b(a))&&d++;return d}},24057:(a,b,c)=>{c.d(b,{$y:()=>o,Or:()=>h,VU:()=>p,ej:()=>k,k5:()=>i,mh:()=>q,ml:()=>g,ug:()=>n,xx:()=>j,yS:()=>m});var d=c(59406);function e(a,b){let c=(0,d.X)();return`<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:system-ui,-apple-system,sans-serif;color:#e4e4e7;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;padding:32px 20px;">
    <tr><td style="padding-bottom:24px;">
      <a href="${c}" style="font-size:20px;font-weight:800;color:#fff;text-decoration:none;">ContentVerse</a>
      <span style="color:#a855f7;font-size:13px;display:block;margin-top:4px;">Read. Create. Grow.</span>
    </td></tr>
    <tr><td style="background:#18181b;border:1px solid #27272a;border-radius:16px;padding:28px 24px;">
      ${a}
    </td></tr>
    <tr><td style="padding-top:20px;font-size:12px;color:#71717a;line-height:1.6;text-align:center;">
      ${b||""}
      <p style="margin:8px 0 0;"><a href="${c}" style="color:#a855f7;">contentverse.co.in</a></p>
    </td></tr>
  </table>
</body></html>`}function f(a,b){return`<p style="margin:24px 0 0;text-align:center;">
    <a href="${a}" style="display:inline-block;background:linear-gradient(135deg,#3b82f6,#a855f7);color:#fff;text-decoration:none;font-weight:600;padding:12px 28px;border-radius:10px;">${b}</a>
  </p>`}function g(a){let b=(0,d.X)();return{subject:"Welcome to ContentVerse — you're subscribed",html:e(`<h1 style="margin:0 0 12px;font-size:22px;color:#fff;">Welcome to The Verse</h1>
    <p style="margin:0 0 16px;line-height:1.65;color:#d4d4d8;">You're subscribed to the ContentVerse newsletter. Every Friday we'll send top reads, creator spotlights, and what's trending.</p>
    <p style="margin:0;line-height:1.65;color:#a1a1aa;font-size:14px;">Meanwhile, explore the latest stories on the site.</p>
    ${f(b+"/blogs","Browse articles")}`,`<p><a href="${a}" style="color:#71717a;">Unsubscribe</a></p>`)}}function h(a){let b=(0,d.X)(),c=a.articles.map(a=>{var c;return`<li style="margin-bottom:16px;">
          <span style="display:block;font-size:11px;color:#a855f7;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px;">${"followed"===(c=a.reason)?"From a category you follow":"unread"===c?"Unread pick for you":"Trending this week"}</span>
          <a href="${b}/blog/${a.slug}" style="color:#fff;font-weight:600;text-decoration:none;font-size:16px;">${r(a.title)}</a>
          ${a.excerpt?`<p style="margin:6px 0 0;color:#a1a1aa;font-size:14px;line-height:1.5;">${r(a.excerpt.slice(0,120))}${a.excerpt.length>120?"…":""}</p>`:""}
        </li>`}).join("");return{subject:"Your weekly ContentVerse digest",html:e(`<h1 style="margin:0 0 8px;font-size:22px;color:#fff;">Your weekly digest</h1>
    <p style="margin:0 0 20px;color:#a1a1aa;font-size:14px;">Trending + unread from categories you follow</p>
    <ul style="margin:0;padding:0;list-style:none;">${c}</ul>
    ${f(b+"/blogs","See all articles")}`,`<p><a href="${a.unsubscribeUrl}" style="color:#71717a;">Unsubscribe</a></p>`)}}function i(a){let b=(0,d.X)(),c=a.name?`Hey ${r(a.name.split(" ")[0])}`:"Hey creator",g=a.topComment?`<div style="margin-top:20px;padding:16px;background:#09090b;border-radius:12px;border:1px solid #27272a;">
        <p style="margin:0 0 6px;font-size:11px;color:#a855f7;text-transform:uppercase;letter-spacing:0.06em;">Top comment this week</p>
        <p style="margin:0 0 8px;color:#e4e4e7;font-size:15px;line-height:1.5;">“${r(a.topComment.content.slice(0,180))}${a.topComment.content.length>180?"…":""}”</p>
        <a href="${b}/blog/${a.topComment.blogSlug}" style="color:#a1a1aa;font-size:13px;text-decoration:none;">on ${r(a.topComment.blogTitle)}</a>
      </div>`:`<p style="margin:16px 0 0;color:#71717a;font-size:13px;">No new comments this week — share your latest post to spark a conversation.</p>`;return{subject:"Your ContentVerse creator report",html:e(`<h1 style="margin:0 0 8px;font-size:22px;color:#fff;">${c}, your week in numbers</h1>
    <p style="margin:0 0 20px;color:#a1a1aa;font-size:14px;">Creator digest \xb7 last 7 days</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 8px;">
      <tr>
        <td style="width:50%;padding:12px;background:#09090b;border-radius:12px 0 0 12px;border:1px solid #27272a;border-right:none;">
          <p style="margin:0;font-size:11px;color:#71717a;text-transform:uppercase;">Reads</p>
          <p style="margin:4px 0 0;font-size:28px;font-weight:800;color:#fff;">${a.views.toLocaleString("en-IN")}</p>
        </td>
        <td style="width:50%;padding:12px;background:#09090b;border-radius:0 12px 12px 0;border:1px solid #27272a;">
          <p style="margin:0;font-size:11px;color:#71717a;text-transform:uppercase;">New followers</p>
          <p style="margin:4px 0 0;font-size:28px;font-weight:800;color:#fff;">${a.newFollowers.toLocaleString("en-IN")}</p>
        </td>
      </tr>
    </table>
    ${g}
    ${f(b+"/dashboard","Open dashboard")}`)}}function j(a){let b=(0,d.X)(),c=a.movies.map(a=>`<li style="margin-bottom:14px;">
          <a href="${b}${a.href}" style="color:#fff;font-weight:600;text-decoration:none;font-size:16px;">${r(a.title)}</a>
          ${a.releaseDate?`<span style="display:block;font-size:12px;color:#a1a1aa;margin-top:4px;">Release: ${r(a.releaseDate)}</span>`:""}
        </li>`).join("");return{subject:"CineVerse — this week on OTT & theatres",html:e(`<h1 style="margin:0 0 8px;font-size:22px;color:#fff;">🎬 CineVerse \xb7 OTT picks</h1>
    <p style="margin:0 0 20px;color:#a1a1aa;font-size:14px;">Trending & upcoming in India this week</p>
    <ul style="margin:0;padding:0;list-style:none;">${c}</ul>
    ${f(b+"/cineverse","Open CineVerse")}`,`<p><a href="${a.unsubscribeUrl}" style="color:#71717a;">Unsubscribe</a></p>`)}}function k(a){let b=(0,d.X)(),c=e(`<h1 style="margin:0 0 12px;font-size:22px;color:#fff;">🔥 Trending today</h1>
    <p style="margin:0 0 8px;font-size:18px;font-weight:600;color:#fff;">${r(a.title)}</p>
    ${a.excerpt?`<p style="margin:0 0 16px;color:#a1a1aa;line-height:1.6;">${r(a.excerpt.slice(0,200))}</p>`:""}
    ${f(`${b}/blog/${a.slug}`,"Read article")}`,`<p><a href="${a.unsubscribeUrl}" style="color:#71717a;">Unsubscribe</a></p>`);return{subject:`Trending: ${a.title.slice(0,60)}`,html:c}}function l(a,b,c){if(!b.length)return'<p style="margin:0;color:#71717a;font-size:14px;">No data available right now.</p>';let d="gain"===c?"#4ade80":"#f87171";return`<ul style="margin:0;padding:0;list-style:none;">
    ${b.map(b=>{let c=`${a}/finance/stock/${encodeURIComponent(b.symbol)}`,e=b.price.toLocaleString("en-IN",{maximumFractionDigits:2});return`<li style="margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid #27272a;">
          <a href="${c}" style="color:#fff;font-weight:600;text-decoration:none;font-size:15px;">${r(b.symbol)}</a>
          <span style="display:block;margin-top:4px;color:#a1a1aa;font-size:13px;">${r(b.name)}</span>
          <span style="display:block;margin-top:6px;font-size:14px;">
            <span style="color:#d4d4d8;">₹${e}</span>
            <span style="color:${d};font-weight:600;margin-left:8px;">${function(a){let b=a>=0?"+":"";return`${b}${a.toFixed(2)}%`}(b.changePercent)}</span>
          </span>
        </li>`}).join("")}
  </ul>`}function m(a){let b=(0,d.X)(),c="open"===a.phase?"Market open — your watchlist":"Market close — your watchlist",g="open"===a.phase?"Your watchlist: market open update":"Your watchlist: market close update",h=a.items.map(a=>{let c=a.link?.startsWith("http")?a.link:a.link?`${b}${a.link}`:`${b}/finance`;return`<li style="margin-bottom:16px;padding-bottom:16px;border-bottom:1px solid #27272a;">
          <a href="${c}" style="color:#fff;font-weight:600;text-decoration:none;font-size:16px;">${r(a.title)}</a>
          <p style="margin:6px 0 0;color:#a1a1aa;font-size:14px;line-height:1.5;">${r(a.message)}</p>
        </li>`}).join(""),i=a.topGainers?.length||a.topLosers?.length?`<div style="margin-top:28px;padding-top:24px;border-top:1px solid #27272a;">
          <h2 style="margin:0 0 6px;font-size:18px;color:#fff;">Nifty 50 movers</h2>
          <p style="margin:0 0 18px;color:#a1a1aa;font-size:13px;">Top gainers and losers today</p>
          <div style="margin-bottom:24px;">
            <h3 style="margin:0 0 12px;font-size:14px;color:#4ade80;text-transform:uppercase;letter-spacing:0.06em;">Top 5 gainers</h3>
            ${l(b,a.topGainers??[],"gain")}
          </div>
          <div>
            <h3 style="margin:0 0 12px;font-size:14px;color:#f87171;text-transform:uppercase;letter-spacing:0.06em;">Top 5 losers</h3>
            ${l(b,a.topLosers??[],"loss")}
          </div>
        </div>`:"";return{subject:g,html:e(`<h1 style="margin:0 0 8px;font-size:22px;color:#fff;">${c}</h1>
    <p style="margin:0 0 20px;color:#a1a1aa;font-size:14px;">${a.items.length} stock${1===a.items.length?"":"s"} on your watchlist</p>
    <ul style="margin:0;padding:0;list-style:none;">${h}</ul>
    ${i}
    ${f(`${b}/finance`,"View watchlist")}`,a.unsubscribeUrl?`<p><a href="${a.unsubscribeUrl}" style="color:#71717a;">Unsubscribe from emails</a></p>`:"")}}function n(a){let b=(0,d.X)(),c=(a.name||"").trim().split(/\s+/)[0]||"there";return{subject:"Welcome to ContentVerse — you’re in ✨",html:e(`<h1 style="margin:0 0 12px;font-size:22px;color:#fff;">Welcome to ContentVerse, ${r(c)} 👋</h1>
    <p style="margin:0 0 16px;line-height:1.65;color:#d4d4d8;">You’re in. ContentVerse is where Indian creators read, publish, and grow — blogs, movies, money tools, and more in one place.</p>
    <p style="margin:0 0 8px;font-weight:600;color:#fff;">Start in 60 seconds</p>
    <ul style="margin:0 0 20px;padding-left:18px;color:#a1a1aa;line-height:1.7;font-size:14px;">
      <li><a href="${b}/blogs" style="color:#c4b5fd;">Read what’s trending</a> — fresh stories every day</li>
      <li><a href="${b}/dashboard/create" style="color:#c4b5fd;">Write your first draft</a> — publish when you’re ready</li>
      <li><a href="${b}/cineverse" style="color:#c4b5fd;">Open CineVerse</a> — OTT &amp; movie picks</li>
      <li><a href="${b}/moneyverse" style="color:#c4b5fd;">Try MoneyVerse</a> — track expenses &amp; screenshot scan</li>
    </ul>
    ${f(`${b}/dashboard`,"Go to your dashboard")}
    <p style="margin:20px 0 0;font-size:13px;color:#71717a;line-height:1.6;">Tip: enable browser / app alerts in Dashboard → Notifications so you never miss replies and tips.</p>`,a.unsubscribeUrl?`<p><a href="${a.unsubscribeUrl}" style="color:#71717a;">Unsubscribe</a></p>`:"")}}function o(a){let b=(0,d.X)(),c=(a.name||"").trim().split(/\s+/)[0]||"there",g="write"===a.focus?{title:`${c}, your first post is waiting`,body:"Creators who publish in their first week grow the fastest. Draft something short today — even 300 words counts.",cta:"Start writing",href:`${b}/dashboard/create`}:"notify"===a.focus?{title:"Turn on alerts so you don’t miss replies",body:"Tips, comments, and trending picks land in your notification centre — enable push so nothing slips by.",cta:"Open notifications",href:`${b}/dashboard/notifications`}:{title:"Come back — here’s what’s live",body:"Fresh blogs, CineVerse picks, and MoneyVerse tools are waiting. Pick one hub and explore for 5 minutes.",cta:"Explore ContentVerse",href:`${b}/blogs`},h=e(`<h1 style="margin:0 0 12px;font-size:22px;color:#fff;">${r(g.title)}</h1>
    <p style="margin:0 0 16px;line-height:1.65;color:#d4d4d8;">${r(g.body)}</p>
    ${f(g.href,g.cta)}
    <p style="margin:16px 0 0;text-align:center;font-size:13px;">
      <a href="${b}/cineverse" style="color:#a855f7;margin:0 8px;">CineVerse</a>
      <a href="${b}/moneyverse" style="color:#a855f7;margin:0 8px;">MoneyVerse</a>
      <a href="${b}/goldverse" style="color:#a855f7;margin:0 8px;">GoldVerse</a>
    </p>`,a.unsubscribeUrl?`<p><a href="${a.unsubscribeUrl}" style="color:#71717a;">Unsubscribe</a></p>`:"");return{subject:g.title.slice(0,70),html:h}}function p(a){let b=(0,d.X)(),c=`${b}/admin/blogs/${a.blogId}`,g=a.authorEmail?`${r(a.authorName)} (${r(a.authorEmail)})`:r(a.authorName),h=e(`<h1 style="margin:0 0 12px;font-size:22px;color:#fff;">New blog awaiting approval</h1>
    <p style="margin:0 0 16px;line-height:1.65;color:#d4d4d8;">A creator submitted a post for review on ContentVerse.</p>
    <p style="margin:0 0 8px;font-size:18px;font-weight:600;color:#fff;">${r(a.title)}</p>
    <p style="margin:0 0 6px;color:#a1a1aa;font-size:14px;">By ${g}</p>
    ${a.categoryName?`<p style="margin:0 0 12px;color:#a855f7;font-size:13px;">Category: ${r(a.categoryName)}</p>`:""}
    ${a.excerpt?`<p style="margin:0 0 16px;color:#a1a1aa;line-height:1.6;font-size:14px;">${r(a.excerpt.slice(0,200))}${a.excerpt.length>200?"…":""}</p>`:""}
    ${f(c,"Review in admin")}
    <p style="margin:16px 0 0;text-align:center;">
      <a href="${b}/admin/moderation" style="color:#a855f7;font-size:13px;">Open moderation queue</a>
    </p>`);return{subject:`Review needed: ${a.title.slice(0,60)}`,html:h}}function q(a){let b=(0,d.X)(),c=a.link?.startsWith("http")?a.link:a.link?`${b}${a.link}`:b,g=e(`<h1 style="margin:0 0 12px;font-size:20px;color:#fff;">${r(a.title)}</h1>
    <p style="margin:0;line-height:1.65;color:#d4d4d8;">${r(a.message)}</p>
    ${a.link?f(c,"Open in ContentVerse"):""}`,a.unsubscribeUrl?`<p><a href="${a.unsubscribeUrl}" style="color:#71717a;">Unsubscribe from emails</a></p>`:"");return{subject:a.title,html:g}}function r(a){return a.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}},60509:(a,b,c)=>{c.d(b,{ZG:()=>i,ew:()=>h});var d=c(70373),e=c(16248),f=c(24057),g=c(59406);function h(a){return`${(0,g.X)()}/api/newsletter/unsubscribe?id=${a}`}async function i(a,b){let c=a.trim().toLowerCase();if(!(0,d.isDatabaseConfigured)())return{ok:!1,error:"Database not configured"};let g=await d.prisma.newsletterSubscriber.findUnique({where:{email:c}});if(g){await d.prisma.newsletterSubscriber.update({where:{id:g.id},data:{weeklyDigest:!0,...b?.ottDigest?{ottDigest:!0}:{}}});let{subject:a,html:i}=(0,f.ml)(h(g.id)),j=await (0,e.ZM)({to:c,subject:a,html:i});return{ok:!0,alreadySubscribed:!0,id:g.id,emailed:j}}let i=await d.prisma.newsletterSubscriber.create({data:{email:c,verified:!0,weeklyDigest:!0,ottDigest:b?.ottDigest??!1}}),{subject:j,html:k}=(0,f.ml)(h(i.id)),l=await (0,e.ZM)({to:c,subject:j,html:k});return{ok:!0,alreadySubscribed:!1,id:i.id,emailed:l}}}};