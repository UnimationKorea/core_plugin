var xt=Object.defineProperty;var De=e=>{throw TypeError(e)};var wt=(e,t,s)=>t in e?xt(e,t,{enumerable:!0,configurable:!0,writable:!0,value:s}):e[t]=s;var m=(e,t,s)=>wt(e,typeof t!="symbol"?t+"":t,s),Pe=(e,t,s)=>t.has(e)||De("Cannot "+s);var n=(e,t,s)=>(Pe(e,t,"read from private field"),s?s.call(e):t.get(e)),f=(e,t,s)=>t.has(e)?De("Cannot add the same private member more than once"):t instanceof WeakSet?t.add(e):t.set(e,s),u=(e,t,s,r)=>(Pe(e,t,"write to private field"),r?r.call(e,s):t.set(e,s),s),v=(e,t,s)=>(Pe(e,t,"access private method"),s);var $e=(e,t,s,r)=>({set _(i){u(e,t,i,s)},get _(){return n(e,t,r)}});var Fe=(e,t,s)=>(r,i)=>{let a=-1;return o(0);async function o(l){if(l<=a)throw new Error("next() called multiple times");a=l;let c,d=!1,h;if(e[l]?(h=e[l][0][0],r.req.routeIndex=l):h=l===e.length&&i||void 0,h)try{c=await h(r,()=>o(l+1))}catch(p){if(p instanceof Error&&t)r.error=p,c=await t(p,r),d=!0;else throw p}else r.finalized===!1&&s&&(c=await s(r));return c&&(r.finalized===!1||d)&&(r.res=c),r}},jt=Symbol(),Et=async(e,t=Object.create(null))=>{const{all:s=!1,dot:r=!1}=t,a=(e instanceof it?e.raw.headers:e.headers).get("Content-Type");return a!=null&&a.startsWith("multipart/form-data")||a!=null&&a.startsWith("application/x-www-form-urlencoded")?St(e,{all:s,dot:r}):{}};async function St(e,t){const s=await e.formData();return s?Rt(s,t):{}}function Rt(e,t){const s=Object.create(null);return e.forEach((r,i)=>{t.all||i.endsWith("[]")?It(s,i,r):s[i]=r}),t.dot&&Object.entries(s).forEach(([r,i])=>{r.includes(".")&&(kt(s,r,i),delete s[r])}),s}var It=(e,t,s)=>{e[t]!==void 0?Array.isArray(e[t])?e[t].push(s):e[t]=[e[t],s]:t.endsWith("[]")?e[t]=[s]:e[t]=s},kt=(e,t,s)=>{let r=e;const i=t.split(".");i.forEach((a,o)=>{o===i.length-1?r[a]=s:((!r[a]||typeof r[a]!="object"||Array.isArray(r[a])||r[a]instanceof File)&&(r[a]=Object.create(null)),r=r[a])})},Qe=e=>{const t=e.split("/");return t[0]===""&&t.shift(),t},At=e=>{const{groups:t,path:s}=Mt(e),r=Qe(s);return Ot(r,t)},Mt=e=>{const t=[];return e=e.replace(/\{[^}]+\}/g,(s,r)=>{const i=`@${r}`;return t.push([i,s]),i}),{groups:t,path:e}},Ot=(e,t)=>{for(let s=t.length-1;s>=0;s--){const[r]=t[s];for(let i=e.length-1;i>=0;i--)if(e[i].includes(r)){e[i]=e[i].replace(r,t[s][1]);break}}return e},je={},Pt=(e,t)=>{if(e==="*")return"*";const s=e.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);if(s){const r=`${e}#${t}`;return je[r]||(s[2]?je[r]=t&&t[0]!==":"&&t[0]!=="*"?[r,s[1],new RegExp(`^${s[2]}(?=/${t})`)]:[e,s[1],new RegExp(`^${s[2]}$`)]:je[r]=[e,s[1],!0]),je[r]}return null},qe=(e,t)=>{try{return t(e)}catch{return e.replace(/(?:%[0-9A-Fa-f]{2})+/g,s=>{try{return t(s)}catch{return s}})}},Lt=e=>qe(e,decodeURI),et=e=>{const t=e.url,s=t.indexOf("/",t.indexOf(":")+4);let r=s;for(;r<t.length;r++){const i=t.charCodeAt(r);if(i===37){const a=t.indexOf("?",r),o=t.slice(s,a===-1?void 0:a);return Lt(o.includes("%25")?o.replace(/%25/g,"%2525"):o)}else if(i===63)break}return t.slice(s,r)},Ct=e=>{const t=et(e);return t.length>1&&t.at(-1)==="/"?t.slice(0,-1):t},se=(e,t,...s)=>(s.length&&(t=se(t,...s)),`${(e==null?void 0:e[0])==="/"?"":"/"}${e}${t==="/"?"":`${(e==null?void 0:e.at(-1))==="/"?"":"/"}${(t==null?void 0:t[0])==="/"?t.slice(1):t}`}`),tt=e=>{if(e.charCodeAt(e.length-1)!==63||!e.includes(":"))return null;const t=e.split("/"),s=[];let r="";return t.forEach(i=>{if(i!==""&&!/\:/.test(i))r+="/"+i;else if(/\:/.test(i))if(/\?/.test(i)){s.length===0&&r===""?s.push("/"):s.push(r);const a=i.replace("?","");r+="/"+a,s.push(r)}else r+="/"+i}),s.filter((i,a,o)=>o.indexOf(i)===a)},Le=e=>/[%+]/.test(e)?(e.indexOf("+")!==-1&&(e=e.replace(/\+/g," ")),e.indexOf("%")!==-1?qe(e,rt):e):e,st=(e,t,s)=>{let r;if(!s&&t&&!/[%+]/.test(t)){let o=e.indexOf(`?${t}`,8);for(o===-1&&(o=e.indexOf(`&${t}`,8));o!==-1;){const l=e.charCodeAt(o+t.length+1);if(l===61){const c=o+t.length+2,d=e.indexOf("&",c);return Le(e.slice(c,d===-1?void 0:d))}else if(l==38||isNaN(l))return"";o=e.indexOf(`&${t}`,o+1)}if(r=/[%+]/.test(e),!r)return}const i={};r??(r=/[%+]/.test(e));let a=e.indexOf("?",8);for(;a!==-1;){const o=e.indexOf("&",a+1);let l=e.indexOf("=",a);l>o&&o!==-1&&(l=-1);let c=e.slice(a+1,l===-1?o===-1?void 0:o:l);if(r&&(c=Le(c)),a=o,c==="")continue;let d;l===-1?d="":(d=e.slice(l+1,o===-1?void 0:o),r&&(d=Le(d))),s?(i[c]&&Array.isArray(i[c])||(i[c]=[]),i[c].push(d)):i[c]??(i[c]=d)}return t?i[t]:i},Tt=st,Ht=(e,t)=>st(e,t,!0),rt=decodeURIComponent,Ne=e=>qe(e,rt),ae,k,$,at,nt,Te,N,Ge,it=(Ge=class{constructor(e,t="/",s=[[]]){f(this,$);m(this,"raw");f(this,ae);f(this,k);m(this,"routeIndex",0);m(this,"path");m(this,"bodyCache",{});f(this,N,e=>{const{bodyCache:t,raw:s}=this,r=t[e];if(r)return r;const i=Object.keys(t)[0];return i?t[i].then(a=>(i==="json"&&(a=JSON.stringify(a)),new Response(a)[e]())):t[e]=s[e]()});this.raw=e,this.path=t,u(this,k,s),u(this,ae,{})}param(e){return e?v(this,$,at).call(this,e):v(this,$,nt).call(this)}query(e){return Tt(this.url,e)}queries(e){return Ht(this.url,e)}header(e){if(e)return this.raw.headers.get(e)??void 0;const t={};return this.raw.headers.forEach((s,r)=>{t[r]=s}),t}async parseBody(e){var t;return(t=this.bodyCache).parsedBody??(t.parsedBody=await Et(this,e))}json(){return n(this,N).call(this,"text").then(e=>JSON.parse(e))}text(){return n(this,N).call(this,"text")}arrayBuffer(){return n(this,N).call(this,"arrayBuffer")}blob(){return n(this,N).call(this,"blob")}formData(){return n(this,N).call(this,"formData")}addValidatedData(e,t){n(this,ae)[e]=t}valid(e){return n(this,ae)[e]}get url(){return this.raw.url}get method(){return this.raw.method}get[jt](){return n(this,k)}get matchedRoutes(){return n(this,k)[0].map(([[,e]])=>e)}get routePath(){return n(this,k)[0].map(([[,e]])=>e)[this.routeIndex].path}},ae=new WeakMap,k=new WeakMap,$=new WeakSet,at=function(e){const t=n(this,k)[0][this.routeIndex][1][e],s=v(this,$,Te).call(this,t);return s&&/\%/.test(s)?Ne(s):s},nt=function(){const e={},t=Object.keys(n(this,k)[0][this.routeIndex][1]);for(const s of t){const r=v(this,$,Te).call(this,n(this,k)[0][this.routeIndex][1][s]);r!==void 0&&(e[s]=/\%/.test(r)?Ne(r):r)}return e},Te=function(e){return n(this,k)[1]?n(this,k)[1][e]:e},N=new WeakMap,Ge),qt={Stringify:1},ot=async(e,t,s,r,i)=>{typeof e=="object"&&!(e instanceof String)&&(e instanceof Promise||(e=e.toString()),e instanceof Promise&&(e=await e));const a=e.callbacks;return a!=null&&a.length?(i?i[0]+=e:i=[e],Promise.all(a.map(l=>l({phase:t,buffer:i,context:r}))).then(l=>Promise.all(l.filter(Boolean).map(c=>ot(c,t,!1,r,i))).then(()=>i[0]))):Promise.resolve(e)},_t="text/plain; charset=UTF-8",Ce=(e,t)=>({"Content-Type":e,...t}),ge,ve,H,ne,q,S,ye,oe,ce,J,be,xe,z,re,We,Dt=(We=class{constructor(e,t){f(this,z);f(this,ge);f(this,ve);m(this,"env",{});f(this,H);m(this,"finalized",!1);m(this,"error");f(this,ne);f(this,q);f(this,S);f(this,ye);f(this,oe);f(this,ce);f(this,J);f(this,be);f(this,xe);m(this,"render",(...e)=>(n(this,oe)??u(this,oe,t=>this.html(t)),n(this,oe).call(this,...e)));m(this,"setLayout",e=>u(this,ye,e));m(this,"getLayout",()=>n(this,ye));m(this,"setRenderer",e=>{u(this,oe,e)});m(this,"header",(e,t,s)=>{this.finalized&&u(this,S,new Response(n(this,S).body,n(this,S)));const r=n(this,S)?n(this,S).headers:n(this,J)??u(this,J,new Headers);t===void 0?r.delete(e):s!=null&&s.append?r.append(e,t):r.set(e,t)});m(this,"status",e=>{u(this,ne,e)});m(this,"set",(e,t)=>{n(this,H)??u(this,H,new Map),n(this,H).set(e,t)});m(this,"get",e=>n(this,H)?n(this,H).get(e):void 0);m(this,"newResponse",(...e)=>v(this,z,re).call(this,...e));m(this,"body",(e,t,s)=>v(this,z,re).call(this,e,t,s));m(this,"text",(e,t,s)=>!n(this,J)&&!n(this,ne)&&!t&&!s&&!this.finalized?new Response(e):v(this,z,re).call(this,e,t,Ce(_t,s)));m(this,"json",(e,t,s)=>v(this,z,re).call(this,JSON.stringify(e),t,Ce("application/json",s)));m(this,"html",(e,t,s)=>{const r=i=>v(this,z,re).call(this,i,t,Ce("text/html; charset=UTF-8",s));return typeof e=="object"?ot(e,qt.Stringify,!1,{}).then(r):r(e)});m(this,"redirect",(e,t)=>{const s=String(e);return this.header("Location",/[^\x00-\xFF]/.test(s)?encodeURI(s):s),this.newResponse(null,t??302)});m(this,"notFound",()=>(n(this,ce)??u(this,ce,()=>new Response),n(this,ce).call(this,this)));u(this,ge,e),t&&(u(this,q,t.executionCtx),this.env=t.env,u(this,ce,t.notFoundHandler),u(this,xe,t.path),u(this,be,t.matchResult))}get req(){return n(this,ve)??u(this,ve,new it(n(this,ge),n(this,xe),n(this,be))),n(this,ve)}get event(){if(n(this,q)&&"respondWith"in n(this,q))return n(this,q);throw Error("This context has no FetchEvent")}get executionCtx(){if(n(this,q))return n(this,q);throw Error("This context has no ExecutionContext")}get res(){return n(this,S)||u(this,S,new Response(null,{headers:n(this,J)??u(this,J,new Headers)}))}set res(e){if(n(this,S)&&e){e=new Response(e.body,e);for(const[t,s]of n(this,S).headers.entries())if(t!=="content-type")if(t==="set-cookie"){const r=n(this,S).headers.getSetCookie();e.headers.delete("set-cookie");for(const i of r)e.headers.append("set-cookie",i)}else e.headers.set(t,s)}u(this,S,e),this.finalized=!0}get var(){return n(this,H)?Object.fromEntries(n(this,H)):{}}},ge=new WeakMap,ve=new WeakMap,H=new WeakMap,ne=new WeakMap,q=new WeakMap,S=new WeakMap,ye=new WeakMap,oe=new WeakMap,ce=new WeakMap,J=new WeakMap,be=new WeakMap,xe=new WeakMap,z=new WeakSet,re=function(e,t,s){const r=n(this,S)?new Headers(n(this,S).headers):n(this,J)??new Headers;if(typeof t=="object"&&"headers"in t){const a=t.headers instanceof Headers?t.headers:new Headers(t.headers);for(const[o,l]of a)o.toLowerCase()==="set-cookie"?r.append(o,l):r.set(o,l)}if(s)for(const[a,o]of Object.entries(s))if(typeof o=="string")r.set(a,o);else{r.delete(a);for(const l of o)r.append(a,l)}const i=typeof t=="number"?t:(t==null?void 0:t.status)??n(this,ne);return new Response(e,{status:i,headers:r})},We),b="ALL",$t="all",Ft=["get","post","put","delete","options","patch"],ct="Can not add a route since the matcher is already built.",lt=class extends Error{},Nt="__COMPOSED_HANDLER",zt=e=>e.text("404 Not Found",404),ze=(e,t)=>{if("getResponse"in e){const s=e.getResponse();return t.newResponse(s.body,s)}return console.error(e),t.text("Internal Server Error",500)},A,x,ht,M,V,Ee,Se,Ue,dt=(Ue=class{constructor(t={}){f(this,x);m(this,"get");m(this,"post");m(this,"put");m(this,"delete");m(this,"options");m(this,"patch");m(this,"all");m(this,"on");m(this,"use");m(this,"router");m(this,"getPath");m(this,"_basePath","/");f(this,A,"/");m(this,"routes",[]);f(this,M,zt);m(this,"errorHandler",ze);m(this,"onError",t=>(this.errorHandler=t,this));m(this,"notFound",t=>(u(this,M,t),this));m(this,"fetch",(t,...s)=>v(this,x,Se).call(this,t,s[1],s[0],t.method));m(this,"request",(t,s,r,i)=>t instanceof Request?this.fetch(s?new Request(t,s):t,r,i):(t=t.toString(),this.fetch(new Request(/^https?:\/\//.test(t)?t:`http://localhost${se("/",t)}`,s),r,i)));m(this,"fire",()=>{addEventListener("fetch",t=>{t.respondWith(v(this,x,Se).call(this,t.request,t,void 0,t.request.method))})});[...Ft,$t].forEach(a=>{this[a]=(o,...l)=>(typeof o=="string"?u(this,A,o):v(this,x,V).call(this,a,n(this,A),o),l.forEach(c=>{v(this,x,V).call(this,a,n(this,A),c)}),this)}),this.on=(a,o,...l)=>{for(const c of[o].flat()){u(this,A,c);for(const d of[a].flat())l.map(h=>{v(this,x,V).call(this,d.toUpperCase(),n(this,A),h)})}return this},this.use=(a,...o)=>(typeof a=="string"?u(this,A,a):(u(this,A,"*"),o.unshift(a)),o.forEach(l=>{v(this,x,V).call(this,b,n(this,A),l)}),this);const{strict:r,...i}=t;Object.assign(this,i),this.getPath=r??!0?t.getPath??et:Ct}route(t,s){const r=this.basePath(t);return s.routes.map(i=>{var o;let a;s.errorHandler===ze?a=i.handler:(a=async(l,c)=>(await Fe([],s.errorHandler)(l,()=>i.handler(l,c))).res,a[Nt]=i.handler),v(o=r,x,V).call(o,i.method,i.path,a)}),this}basePath(t){const s=v(this,x,ht).call(this);return s._basePath=se(this._basePath,t),s}mount(t,s,r){let i,a;r&&(typeof r=="function"?a=r:(a=r.optionHandler,r.replaceRequest===!1?i=c=>c:i=r.replaceRequest));const o=a?c=>{const d=a(c);return Array.isArray(d)?d:[d]}:c=>{let d;try{d=c.executionCtx}catch{}return[c.env,d]};i||(i=(()=>{const c=se(this._basePath,t),d=c==="/"?0:c.length;return h=>{const p=new URL(h.url);return p.pathname=p.pathname.slice(d)||"/",new Request(p,h)}})());const l=async(c,d)=>{const h=await s(i(c.req.raw),...o(c));if(h)return h;await d()};return v(this,x,V).call(this,b,se(t,"*"),l),this}},A=new WeakMap,x=new WeakSet,ht=function(){const t=new dt({router:this.router,getPath:this.getPath});return t.errorHandler=this.errorHandler,u(t,M,n(this,M)),t.routes=this.routes,t},M=new WeakMap,V=function(t,s,r){t=t.toUpperCase(),s=se(this._basePath,s);const i={basePath:this._basePath,path:s,method:t,handler:r};this.router.add(t,s,[r,i]),this.routes.push(i)},Ee=function(t,s){if(t instanceof Error)return this.errorHandler(t,s);throw t},Se=function(t,s,r,i){if(i==="HEAD")return(async()=>new Response(null,await v(this,x,Se).call(this,t,s,r,"GET")))();const a=this.getPath(t,{env:r}),o=this.router.match(i,a),l=new Dt(t,{path:a,matchResult:o,env:r,executionCtx:s,notFoundHandler:n(this,M)});if(o[0].length===1){let d;try{d=o[0][0][0][0](l,async()=>{l.res=await n(this,M).call(this,l)})}catch(h){return v(this,x,Ee).call(this,h,l)}return d instanceof Promise?d.then(h=>h||(l.finalized?l.res:n(this,M).call(this,l))).catch(h=>v(this,x,Ee).call(this,h,l)):d??n(this,M).call(this,l)}const c=Fe(o[0],this.errorHandler,n(this,M));return(async()=>{try{const d=await c(l);if(!d.finalized)throw new Error("Context is not finalized. Did you forget to return a Response object or `await next()`?");return d.res}catch(d){return v(this,x,Ee).call(this,d,l)}})()},Ue),Ie="[^/]+",me=".*",fe="(?:|/.*)",ie=Symbol(),Bt=new Set(".\\+*[^]$()");function Gt(e,t){return e.length===1?t.length===1?e<t?-1:1:-1:t.length===1||e===me||e===fe?1:t===me||t===fe?-1:e===Ie?1:t===Ie?-1:e.length===t.length?e<t?-1:1:t.length-e.length}var X,Y,O,Ve,He=(Ve=class{constructor(){f(this,X);f(this,Y);f(this,O,Object.create(null))}insert(t,s,r,i,a){if(t.length===0){if(n(this,X)!==void 0)throw ie;if(a)return;u(this,X,s);return}const[o,...l]=t,c=o==="*"?l.length===0?["","",me]:["","",Ie]:o==="/*"?["","",fe]:o.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);let d;if(c){const h=c[1];let p=c[2]||Ie;if(h&&c[2]&&(p===".*"||(p=p.replace(/^\((?!\?:)(?=[^)]+\)$)/,"(?:"),/\((?!\?:)/.test(p))))throw ie;if(d=n(this,O)[p],!d){if(Object.keys(n(this,O)).some(g=>g!==me&&g!==fe))throw ie;if(a)return;d=n(this,O)[p]=new He,h!==""&&u(d,Y,i.varIndex++)}!a&&h!==""&&r.push([h,n(d,Y)])}else if(d=n(this,O)[o],!d){if(Object.keys(n(this,O)).some(h=>h.length>1&&h!==me&&h!==fe))throw ie;if(a)return;d=n(this,O)[o]=new He}d.insert(l,s,r,i,a)}buildRegExpStr(){const s=Object.keys(n(this,O)).sort(Gt).map(r=>{const i=n(this,O)[r];return(typeof n(i,Y)=="number"?`(${r})@${n(i,Y)}`:Bt.has(r)?`\\${r}`:r)+i.buildRegExpStr()});return typeof n(this,X)=="number"&&s.unshift(`#${n(this,X)}`),s.length===0?"":s.length===1?s[0]:"(?:"+s.join("|")+")"}},X=new WeakMap,Y=new WeakMap,O=new WeakMap,Ve),ke,we,Ke,Wt=(Ke=class{constructor(){f(this,ke,{varIndex:0});f(this,we,new He)}insert(e,t,s){const r=[],i=[];for(let o=0;;){let l=!1;if(e=e.replace(/\{[^}]+\}/g,c=>{const d=`@\\${o}`;return i[o]=[d,c],o++,l=!0,d}),!l)break}const a=e.match(/(?::[^\/]+)|(?:\/\*$)|./g)||[];for(let o=i.length-1;o>=0;o--){const[l]=i[o];for(let c=a.length-1;c>=0;c--)if(a[c].indexOf(l)!==-1){a[c]=a[c].replace(l,i[o][1]);break}}return n(this,we).insert(a,t,r,n(this,ke),s),r}buildRegExp(){let e=n(this,we).buildRegExpStr();if(e==="")return[/^$/,[],[]];let t=0;const s=[],r=[];return e=e.replace(/#(\d+)|@(\d+)|\.\*\$/g,(i,a,o)=>a!==void 0?(s[++t]=Number(a),"$()"):(o!==void 0&&(r[Number(o)]=++t),"")),[new RegExp(`^${e}`),s,r]}},ke=new WeakMap,we=new WeakMap,Ke),ut=[],Ut=[/^$/,[],Object.create(null)],Re=Object.create(null);function pt(e){return Re[e]??(Re[e]=new RegExp(e==="*"?"":`^${e.replace(/\/\*$|([.\\+*[^\]$()])/g,(t,s)=>s?`\\${s}`:"(?:|/.*)")}$`))}function Vt(){Re=Object.create(null)}function Kt(e){var d;const t=new Wt,s=[];if(e.length===0)return Ut;const r=e.map(h=>[!/\*|\/:/.test(h[0]),...h]).sort(([h,p],[g,j])=>h?1:g?-1:p.length-j.length),i=Object.create(null);for(let h=0,p=-1,g=r.length;h<g;h++){const[j,L,y]=r[h];j?i[L]=[y.map(([I])=>[I,Object.create(null)]),ut]:p++;let R;try{R=t.insert(L,p,j)}catch(I){throw I===ie?new lt(L):I}j||(s[p]=y.map(([I,ee])=>{const he=Object.create(null);for(ee-=1;ee>=0;ee--){const[C,Me]=R[ee];he[C]=Me}return[I,he]}))}const[a,o,l]=t.buildRegExp();for(let h=0,p=s.length;h<p;h++)for(let g=0,j=s[h].length;g<j;g++){const L=(d=s[h][g])==null?void 0:d[1];if(!L)continue;const y=Object.keys(L);for(let R=0,I=y.length;R<I;R++)L[y[R]]=l[L[y[R]]]}const c=[];for(const h in o)c[h]=s[o[h]];return[a,c,i]}function te(e,t){if(e){for(const s of Object.keys(e).sort((r,i)=>i.length-r.length))if(pt(s).test(t))return[...e[s]]}}var B,G,de,mt,ft,Je,Jt=(Je=class{constructor(){f(this,de);m(this,"name","RegExpRouter");f(this,B);f(this,G);u(this,B,{[b]:Object.create(null)}),u(this,G,{[b]:Object.create(null)})}add(e,t,s){var l;const r=n(this,B),i=n(this,G);if(!r||!i)throw new Error(ct);r[e]||[r,i].forEach(c=>{c[e]=Object.create(null),Object.keys(c[b]).forEach(d=>{c[e][d]=[...c[b][d]]})}),t==="/*"&&(t="*");const a=(t.match(/\/:/g)||[]).length;if(/\*$/.test(t)){const c=pt(t);e===b?Object.keys(r).forEach(d=>{var h;(h=r[d])[t]||(h[t]=te(r[d],t)||te(r[b],t)||[])}):(l=r[e])[t]||(l[t]=te(r[e],t)||te(r[b],t)||[]),Object.keys(r).forEach(d=>{(e===b||e===d)&&Object.keys(r[d]).forEach(h=>{c.test(h)&&r[d][h].push([s,a])})}),Object.keys(i).forEach(d=>{(e===b||e===d)&&Object.keys(i[d]).forEach(h=>c.test(h)&&i[d][h].push([s,a]))});return}const o=tt(t)||[t];for(let c=0,d=o.length;c<d;c++){const h=o[c];Object.keys(i).forEach(p=>{var g;(e===b||e===p)&&((g=i[p])[h]||(g[h]=[...te(r[p],h)||te(r[b],h)||[]]),i[p][h].push([s,a-d+c+1]))})}}match(e,t){Vt();const s=v(this,de,mt).call(this);return this.match=(r,i)=>{const a=s[r]||s[b],o=a[2][i];if(o)return o;const l=i.match(a[0]);if(!l)return[[],ut];const c=l.indexOf("",1);return[a[1][c],l]},this.match(e,t)}},B=new WeakMap,G=new WeakMap,de=new WeakSet,mt=function(){const e=Object.create(null);return Object.keys(n(this,G)).concat(Object.keys(n(this,B))).forEach(t=>{e[t]||(e[t]=v(this,de,ft).call(this,t))}),u(this,B,u(this,G,void 0)),e},ft=function(e){const t=[];let s=e===b;return[n(this,B),n(this,G)].forEach(r=>{const i=r[e]?Object.keys(r[e]).map(a=>[a,r[e][a]]):[];i.length!==0?(s||(s=!0),t.push(...i)):e!==b&&t.push(...Object.keys(r[b]).map(a=>[a,r[b][a]]))}),s?Kt(t):null},Je),W,_,Xe,Xt=(Xe=class{constructor(e){m(this,"name","SmartRouter");f(this,W,[]);f(this,_,[]);u(this,W,e.routers)}add(e,t,s){if(!n(this,_))throw new Error(ct);n(this,_).push([e,t,s])}match(e,t){if(!n(this,_))throw new Error("Fatal error");const s=n(this,W),r=n(this,_),i=s.length;let a=0,o;for(;a<i;a++){const l=s[a];try{for(let c=0,d=r.length;c<d;c++)l.add(...r[c]);o=l.match(e,t)}catch(c){if(c instanceof lt)continue;throw c}this.match=l.match.bind(l),u(this,W,[l]),u(this,_,void 0);break}if(a===i)throw new Error("Fatal error");return this.name=`SmartRouter + ${this.activeRouter.name}`,o}get activeRouter(){if(n(this,_)||n(this,W).length!==1)throw new Error("No active router has been determined yet.");return n(this,W)[0]}},W=new WeakMap,_=new WeakMap,Xe),pe=Object.create(null),U,E,Z,le,w,D,K,Ye,gt=(Ye=class{constructor(e,t,s){f(this,D);f(this,U);f(this,E);f(this,Z);f(this,le,0);f(this,w,pe);if(u(this,E,s||Object.create(null)),u(this,U,[]),e&&t){const r=Object.create(null);r[e]={handler:t,possibleKeys:[],score:0},u(this,U,[r])}u(this,Z,[])}insert(e,t,s){u(this,le,++$e(this,le)._);let r=this;const i=At(t),a=[];for(let o=0,l=i.length;o<l;o++){const c=i[o],d=i[o+1],h=Pt(c,d),p=Array.isArray(h)?h[0]:c;if(p in n(r,E)){r=n(r,E)[p],h&&a.push(h[1]);continue}n(r,E)[p]=new gt,h&&(n(r,Z).push(h),a.push(h[1])),r=n(r,E)[p]}return n(r,U).push({[e]:{handler:s,possibleKeys:a.filter((o,l,c)=>c.indexOf(o)===l),score:n(this,le)}}),r}search(e,t){var l;const s=[];u(this,w,pe);let i=[this];const a=Qe(t),o=[];for(let c=0,d=a.length;c<d;c++){const h=a[c],p=c===d-1,g=[];for(let j=0,L=i.length;j<L;j++){const y=i[j],R=n(y,E)[h];R&&(u(R,w,n(y,w)),p?(n(R,E)["*"]&&s.push(...v(this,D,K).call(this,n(R,E)["*"],e,n(y,w))),s.push(...v(this,D,K).call(this,R,e,n(y,w)))):g.push(R));for(let I=0,ee=n(y,Z).length;I<ee;I++){const he=n(y,Z)[I],C=n(y,w)===pe?{}:{...n(y,w)};if(he==="*"){const F=n(y,E)["*"];F&&(s.push(...v(this,D,K).call(this,F,e,n(y,w))),u(F,w,C),g.push(F));continue}const[Me,_e,ue]=he;if(!h&&!(ue instanceof RegExp))continue;const T=n(y,E)[Me],bt=a.slice(c).join("/");if(ue instanceof RegExp){const F=ue.exec(bt);if(F){if(C[_e]=F[0],s.push(...v(this,D,K).call(this,T,e,n(y,w),C)),Object.keys(n(T,E)).length){u(T,w,C);const Oe=((l=F[0].match(/\//))==null?void 0:l.length)??0;(o[Oe]||(o[Oe]=[])).push(T)}continue}}(ue===!0||ue.test(h))&&(C[_e]=h,p?(s.push(...v(this,D,K).call(this,T,e,C,n(y,w))),n(T,E)["*"]&&s.push(...v(this,D,K).call(this,n(T,E)["*"],e,C,n(y,w)))):(u(T,w,C),g.push(T)))}}i=g.concat(o.shift()??[])}return s.length>1&&s.sort((c,d)=>c.score-d.score),[s.map(({handler:c,params:d})=>[c,d])]}},U=new WeakMap,E=new WeakMap,Z=new WeakMap,le=new WeakMap,w=new WeakMap,D=new WeakSet,K=function(e,t,s,r){const i=[];for(let a=0,o=n(e,U).length;a<o;a++){const l=n(e,U)[a],c=l[t]||l[b],d={};if(c!==void 0&&(c.params=Object.create(null),i.push(c),s!==pe||r&&r!==pe))for(let h=0,p=c.possibleKeys.length;h<p;h++){const g=c.possibleKeys[h],j=d[c.score];c.params[g]=r!=null&&r[g]&&!j?r[g]:s[g]??(r==null?void 0:r[g]),d[c.score]=!0}}return i},Ye),Q,Ze,Yt=(Ze=class{constructor(){m(this,"name","TrieRouter");f(this,Q);u(this,Q,new gt)}add(e,t,s){const r=tt(t);if(r){for(let i=0,a=r.length;i<a;i++)n(this,Q).insert(e,r[i],s);return}n(this,Q).insert(e,t,s)}match(e,t){return n(this,Q).search(e,t)}},Q=new WeakMap,Ze),vt=class extends dt{constructor(e={}){super(e),this.router=e.router??new Xt({routers:[new Jt,new Yt]})}},Zt=e=>{const s={...{origin:"*",allowMethods:["GET","HEAD","PUT","POST","DELETE","PATCH"],allowHeaders:[],exposeHeaders:[]},...e},r=(a=>typeof a=="string"?a==="*"?()=>a:o=>a===o?o:null:typeof a=="function"?a:o=>a.includes(o)?o:null)(s.origin),i=(a=>typeof a=="function"?a:Array.isArray(a)?()=>a:()=>[])(s.allowMethods);return async function(o,l){var h;function c(p,g){o.res.headers.set(p,g)}const d=await r(o.req.header("origin")||"",o);if(d&&c("Access-Control-Allow-Origin",d),s.origin!=="*"){const p=o.req.header("Vary");p?c("Vary",p):c("Vary","Origin")}if(s.credentials&&c("Access-Control-Allow-Credentials","true"),(h=s.exposeHeaders)!=null&&h.length&&c("Access-Control-Expose-Headers",s.exposeHeaders.join(",")),o.req.method==="OPTIONS"){s.maxAge!=null&&c("Access-Control-Max-Age",s.maxAge.toString());const p=await i(o.req.header("origin")||"",o);p.length&&c("Access-Control-Allow-Methods",p.join(","));let g=s.allowHeaders;if(!(g!=null&&g.length)){const j=o.req.header("Access-Control-Request-Headers");j&&(g=j.split(/\s*,\s*/))}return g!=null&&g.length&&(c("Access-Control-Allow-Headers",g.join(",")),o.res.headers.append("Vary","Access-Control-Request-Headers")),o.res.headers.delete("Content-Length"),o.res.headers.delete("Content-Type"),new Response(null,{headers:o.res.headers,status:204,statusText:"No Content"})}await l()}};const P=new vt;P.use("/api/*",Zt());P.get("/api/templates",async e=>{const t=[{id:"video@2.0.0",name:"Video Player",category:"media",capabilities:["autoplay","controls"],paramsSchema:{type:"object",properties:{src:{type:"string",description:"Video source URL"},autoplay:{type:"boolean",default:!1}},required:["src"]}},{id:"drag-drop-choices@2.0.0",name:"Drag & Drop Multiple Choice",category:"interaction",capabilities:["drag","drop","keyboard"],paramsSchema:{type:"object",properties:{prompt:{type:"string",description:"Question prompt"},choices:{type:"array",items:{type:"string"}},answer:{type:"string",description:"Correct answer"},image:{type:"string",description:"Optional image URL"}},required:["prompt","choices","answer"]}},{id:"multiple-choice@1.0.0",name:"4지 선다형 문제",category:"assessment",capabilities:["keyboard","mouse","touch","audio"],paramsSchema:{type:"object",properties:{question:{type:"string",description:"문제 텍스트"},choices:{type:"array",description:"선택지 목록"},correctAnswer:{description:"정답 ID(들)"},timeLimit:{type:"number",description:"제한 시간 (초)"},allowMultiple:{type:"boolean",description:"다중 선택 허용"},explanation:{type:"string",description:"정답 해설"}},required:["question","choices","correctAnswer"]}},{id:"memory-game@1.0.0",name:"메모리 게임",category:"game",capabilities:["keyboard","mouse","touch"],paramsSchema:{type:"object",properties:{title:{type:"string",description:"게임 제목"},cards:{type:"array",description:"카드 목록 (짝수 개수 필요)"},gridSize:{type:"string",description:"그리드 크기"},timeLimit:{type:"number",description:"제한 시간 (초)"},allowRetries:{type:"boolean",description:"재시도 허용"}},required:["title","cards"]}},{id:"word-guess@1.0.0",name:"단어 맞추기",category:"game",capabilities:["keyboard","mouse","touch","timer"],paramsSchema:{type:"object",properties:{word:{type:"string",description:"맞춰야 할 단어 (3-15자)",minLength:3,maxLength:15},hint:{type:"string",description:"단어에 대한 힌트",maxLength:200},category:{type:"string",description:"단어 카테고리",enum:["동물","음식","직업","색깔","나라","기타"],default:"기타"},maxAttempts:{type:"number",description:"최대 시도 횟수 (3-10)",minimum:3,maximum:10,default:6},showHintAfter:{type:"number",description:"몇 번 틀린 후 힌트 표시 (1-5)",minimum:1,maximum:5,default:3},timeLimit:{type:"number",description:"제한 시간(초), 0이면 무제한",minimum:0,maximum:600,default:0},difficulty:{type:"string",description:"난이도",enum:["쉬움","보통","어려움"],default:"보통"}},required:["word","hint"]}}];return e.json({templates:t})});P.get("/api/lessons/:id",async e=>(e.req.param("id"),e.json({error:"Not implemented"},501)));P.post("/api/lessons",async e=>(await e.req.json(),e.json({error:"Not implemented"},501)));const Ae={"sample-lesson-multiple-choice.json":{lessonId:"multiple-choice-demo-001",title:"4지 선다형 문제 데모",locale:"ko",version:"1.0.0",flow:[{activityId:"korean-grammar-question",template:"multiple-choice@1.0.0",params:{question:"다음 문장에서 빈 칸에 들어갈 적절한 조사는 무엇입니까?\\n\\n'이 책___ 매우 재미있습니다.'",choices:[{id:"choice-a",text:"은"},{id:"choice-b",text:"는"},{id:"choice-c",text:"이"},{id:"choice-d",text:"가"}],correctAnswer:"choice-a",allowMultiple:!1,shuffle:!0,timeLimit:30,explanation:"'책'은 받침이 있으므로 '은'을 사용합니다. '은/는'은 주제를 나타내는 조사입니다.",showFeedback:!0,hints:["'책'에 받침이 있는지 확인해보세요.","주제를 나타내는 조사는 '은/는'입니다."]},rules:{scoreWeight:1,required:!0}},{activityId:"math-multiple-selection",template:"multiple-choice@1.0.0",params:{question:"다음 중 소수(Prime Number)에 해당하는 것을 모두 선택하세요.",choices:[{id:"choice-a",text:"2"},{id:"choice-b",text:"3"},{id:"choice-c",text:"4"},{id:"choice-d",text:"5"}],correctAnswer:["choice-a","choice-b","choice-d"],allowMultiple:!0,shuffle:!0,timeLimit:45,explanation:"소수는 1과 자기 자신으로만 나누어지는 1보다 큰 자연수입니다. 2, 3, 5가 소수입니다. 4는 2×2이므로 소수가 아닙니다.",showFeedback:!0,hints:["소수의 정의를 다시 생각해보세요.","4는 2로 나누어집니다."]},rules:{scoreWeight:2,required:!0}}],grading:{mode:"weighted-sum",passLine:.7,showScores:!0,showProgress:!0},metadata:{author:"Education Team",createdAt:"2024-01-15T10:00:00Z",tags:["multiple-choice","korean","math"],difficulty:"intermediate",estimatedTime:10}},"sample-lesson-memory-game.json":{lessonId:"memory-game-demo-001",title:"메모리 게임 데모",locale:"ko",version:"1.0.0",flow:[{activityId:"korean-family-memory",template:"memory-game@1.0.0",params:{title:"🏠 가족 관련 단어 기억하기",cards:[{id:"card-1",content:"아버지",type:"text",matchId:"father"},{id:"card-2",content:"Father",type:"text",matchId:"father"},{id:"card-3",content:"어머니",type:"text",matchId:"mother"},{id:"card-4",content:"Mother",type:"text",matchId:"mother"}],gridSize:"4x4",timeLimit:120,allowRetries:!0,shuffle:!0}}],grading:{mode:"pass-fail",passLine:.6,showScores:!0,showProgress:!0},metadata:{author:"Education Team",createdAt:"2024-01-15T10:00:00Z",tags:["memory","korean","family"],difficulty:"beginner",estimatedTime:5}},"sample-lesson-word-guess.json":{lessonId:"word-guess-demo-001",title:"단어 맞추기 게임 모음",locale:"ko",version:"1.0.0",flow:[{activityId:"word-game-animals",template:"word-guess@1.0.0",params:{word:"코끼리",hint:"아프리카에 사는 큰 귀를 가진 회색 동물",category:"동물",maxAttempts:6,showHintAfter:3,timeLimit:120,difficulty:"쉬움"},rules:{scoreWeight:1,required:!0}}],grading:{mode:"weighted-sum",passLine:.6,showScores:!0,showProgress:!0},metadata:{author:"Educational Platform Team",createdAt:"2024-09-30T12:00:00.000Z",tags:["어휘","게임","한국어"],difficulty:"mixed",estimatedTime:5}},"sample-lesson-mixed-templates.json":{lessonId:"mixed-templates-demo-001",title:"혼합 템플릿 종합 데모",locale:"ko",version:"1.0.0",flow:[{activityId:"intro-video",template:"video@2.0.0",params:{src:"https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",autoplay:!1,controls:!0},rules:{scoreWeight:1,required:!0}},{activityId:"vocabulary-memory-game",template:"memory-game@1.0.0",params:{title:"📚 영어 단어 기억 게임",cards:[{id:"card-1",content:"Apple",type:"text",matchId:"apple"},{id:"card-2",content:"🍎",type:"emoji",matchId:"apple"},{id:"card-3",content:"Book",type:"text",matchId:"book"},{id:"card-4",content:"📖",type:"emoji",matchId:"book"},{id:"card-5",content:"Car",type:"text",matchId:"car"},{id:"card-6",content:"🚗",type:"emoji",matchId:"car"},{id:"card-7",content:"House",type:"text",matchId:"house"},{id:"card-8",content:"🏠",type:"emoji",matchId:"house"}],gridSize:"4x4",timeLimit:90,allowRetries:!0,maxAttempts:3,showTimer:!0,successMessage:"🎉 영단어를 잘 기억했습니다!",failureMessage:"💪 다시 한 번 도전해보세요!",shuffle:!0},rules:{scoreWeight:2,required:!0}},{activityId:"grammar-quiz",template:"multiple-choice@1.0.0",params:{question:"다음 중 올바른 영어 문장은?",choices:[{id:"choice-a",text:"I have a apple."},{id:"choice-b",text:"I have an apple."},{id:"choice-c",text:"I have apple."},{id:"choice-d",text:"I has an apple."}],correctAnswer:"choice-b",allowMultiple:!1,shuffle:!0,timeLimit:30,explanation:"'apple'은 모음으로 시작하므로 부정관사 'an'을 사용합니다.",showFeedback:!0,hints:["부정관사 'a'와 'an'의 사용법을 생각해보세요.","'apple'의 첫 글자를 확인해보세요."]},rules:{scoreWeight:3,required:!0}},{activityId:"drag-drop-exercise",template:"drag-drop-choices@2.0.0",params:{prompt:"올바른 단어를 빈 칸에 드래그하세요: She ___ to school every day.",choices:["go","goes","going","gone"],answer:"goes",allowMultiple:!1,shuffleChoices:!0,maxAttempts:3,showFeedback:!0,hints:["주語가 3인칭 단수일 때의 동사 변화를 생각해보세요.","'She'는 3인칭 단수입니다."]},rules:{scoreWeight:2,required:!0}},{activityId:"comprehensive-quiz",template:"multiple-choice@1.0.0",params:{question:"다음 중 복수형이 올바른 것을 모두 선택하세요.",choices:[{id:"choice-a",text:"child → children"},{id:"choice-b",text:"foot → foots"},{id:"choice-c",text:"mouse → mice"},{id:"choice-d",text:"book → books"}],correctAnswer:["choice-a","choice-c","choice-d"],allowMultiple:!0,shuffle:!0,timeLimit:60,explanation:"불규칙 복수형: child→children, mouse→mice, foot→feet. 규칙 복수형: book→books.",showFeedback:!0,hints:["규칙 복수형과 불규칙 복수형을 구분해보세요.","'foot'의 복수형은 'feet'입니다."]},rules:{scoreWeight:3,required:!0}}],grading:{mode:"weighted-sum",passLine:.7,showScores:!0,showProgress:!0},metadata:{author:"Education Team",createdAt:"2024-01-15T10:00:00Z",tags:["mixed","english","vocabulary","grammar","comprehensive"],difficulty:"intermediate",estimatedTime:25}}};P.get("/sample-lesson-multiple-choice.json",async e=>e.json(Ae["sample-lesson-multiple-choice.json"]));P.get("/sample-lesson-memory-game.json",async e=>e.json(Ae["sample-lesson-memory-game.json"]));P.get("/sample-lesson-word-guess.json",async e=>e.json(Ae["sample-lesson-word-guess.json"]));P.get("/sample-lesson-mixed-templates.json",async e=>e.json(Ae["sample-lesson-mixed-templates.json"]));P.get("/test-new-templates.html",e=>e.html(`<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>새 템플릿 테스트 - Multiple Choice & Memory Game</title>
    <script src="https://cdn.tailwindcss.com"><\/script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        body {
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            color: #e6edf7;
            min-height: 100vh;
            font-family: Arial, sans-serif;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
        .lesson-container { background: #1e293b; border-radius: 12px; padding: 2rem; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); margin-bottom: 2rem; }
        .template-info { background: rgba(59, 130, 246, 0.1); border: 1px solid #3b82f6; border-radius: 8px; padding: 1rem; margin-bottom: 1.5rem; }
        .btn { padding: 0.75rem 1.5rem; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; margin: 0.5rem; }
        .btn-primary { background: #3b82f6; color: white; }
        .btn-primary:hover { background: #2563eb; }
        .btn-secondary { background: #475569; color: white; }
        .btn-secondary:hover { background: #334155; }
        .activity-container { background: #334155; border-radius: 12px; padding: 1.5rem; margin-top: 1.5rem; min-height: 400px; }
        .sample-selection { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
        .sample-card { background: #475569; border-radius: 8px; padding: 1rem; cursor: pointer; transition: all 0.15s; border: 2px solid transparent; }
        .sample-card:hover { background: #64748b; border-color: #3b82f6; }
        .sample-card.active { border-color: #22c55e; background: rgba(34, 197, 94, 0.1); }
        .sample-title { font-weight: 600; color: #e6edf7; margin-bottom: 0.5rem; }
        .sample-description { font-size: 0.875rem; color: #94a3b8; line-height: 1.4; }
        .control-panel { display: flex; flex-wrap: wrap; gap: 1rem; align-items: center; margin-bottom: 1.5rem; padding: 1rem; background: rgba(15, 23, 42, 0.5); border-radius: 8px; }
        .status-indicator { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; }
        .status-dot { width: 8px; height: 8px; border-radius: 50%; }
        .status-ready { background: #22c55e; }
        .status-active { background: #3b82f6; }
        .status-complete { background: #f59e0b; }
    </style>
</head>
<body>
    <div class="container">
        <header class="text-center mb-8">
            <h1 class="text-4xl font-bold mb-4">
                <i class="fas fa-puzzle-piece mr-3"></i>
                새 템플릿 테스트
            </h1>
            <p class="text-xl text-gray-300">Multiple Choice & Memory Game 템플릿</p>
        </header>

        <!-- Multiple Choice Template Test -->
        <div class="lesson-container">
            <div class="template-info">
                <h2 class="text-2xl font-bold mb-2">
                    <i class="fas fa-check-square mr-2"></i>
                    Multiple Choice Template (4지 선다형)
                </h2>
                <p>단일/다중 선택, 타이머, 힌트, 해설 기능을 포함한 객관식 문제 템플릿</p>
            </div>

            <div class="sample-selection" id="mc-samples">
                <div class="sample-card" data-sample="korean-grammar">
                    <div class="sample-title">한국어 문법 문제</div>
                    <div class="sample-description">조사 '은/는' 사용법을 다루는 기초 문법 문제 (30초 제한)</div>
                </div>
                <div class="sample-card" data-sample="math-multiple">
                    <div class="sample-title">수학 다중 선택</div>
                    <div class="sample-description">소수 찾기 문제 - 다중 선택 허용 (45초 제한)</div>
                </div>
                <div class="sample-card" data-sample="science-chemistry">
                    <div class="sample-title">화학 공식 문제</div>
                    <div class="sample-description">물의 화학식 관련 문제 (이미지 포함, 60초 제한)</div>
                </div>
            </div>

            <div class="control-panel">
                <div class="status-indicator">
                    <span class="status-dot status-ready" id="mc-status-dot"></span>
                    <span id="mc-status">준비됨</span>
                </div>
                <button class="btn btn-primary" onclick="startMultipleChoice()">
                    <i class="fas fa-play mr-1"></i>선택한 샘플 시작
                </button>
                <button class="btn btn-secondary" onclick="resetMultipleChoice()">
                    <i class="fas fa-redo mr-1"></i>초기화
                </button>
            </div>

            <div class="activity-container" id="mc-container">
                <div class="text-center text-gray-400">
                    <i class="fas fa-mouse-pointer text-4xl mb-4"></i>
                    <p>위에서 샘플을 선택하고 시작 버튼을 클릭하세요.</p>
                </div>
            </div>
        </div>

        <!-- Memory Game Template Test -->
        <div class="lesson-container">
            <div class="template-info">
                <h2 class="text-2xl font-bold mb-2">
                    <i class="fas fa-brain mr-2"></i>
                    Memory Game Template (메모리 게임)
                </h2>
                <p>카드 매칭 기억 게임 - 텍스트, 이미지, 이모지 카드 지원</p>
            </div>

            <div class="sample-selection" id="mg-samples">
                <div class="sample-card" data-sample="korean-family">
                    <div class="sample-title">한국어 가족 단어</div>
                    <div class="sample-description">한국어-영어 가족 단어 매칭 (4x4 그리드, 120초)</div>
                </div>
                <div class="sample-card" data-sample="math-symbols">
                    <div class="sample-title">수학 기호 매칭</div>
                    <div class="sample-description">수학 기호와 의미 매칭 (4x6 그리드, 180초)</div>
                </div>
                <div class="sample-card" data-sample="animal-emoji">
                    <div class="sample-title">동물 이모지 게임</div>
                    <div class="sample-description">동물 이모지와 이름 매칭 (4x4 그리드, 240초)</div>
                </div>
            </div>

            <div class="control-panel">
                <div class="status-indicator">
                    <span class="status-dot status-ready" id="mg-status-dot"></span>
                    <span id="mg-status">준비됨</span>
                </div>
                <button class="btn btn-primary" onclick="startMemoryGame()">
                    <i class="fas fa-play mr-1"></i>선택한 샘플 시작
                </button>
                <button class="btn btn-secondary" onclick="resetMemoryGame()">
                    <i class="fas fa-redo mr-1"></i>초기화
                </button>
            </div>

            <div class="activity-container" id="mg-container">
                <div class="text-center text-gray-400">
                    <i class="fas fa-mouse-pointer text-4xl mb-4"></i>
                    <p>위에서 샘플을 선택하고 시작 버튼을 클릭하세요.</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Load Orchestrator -->
    <script src="/static/js/orchestrator.js"><\/script>

    <script>
        // Sample data
        const mcSamples = {
            'korean-grammar': {
                question: "다음 문장에서 빈 칸에 들어갈 적절한 조사는 무엇입니까?\\n\\n'이 책___ 매우 재미있습니다.'",
                choices: [
                    { id: "choice-a", text: "은" },
                    { id: "choice-b", text: "는" },
                    { id: "choice-c", text: "이" },
                    { id: "choice-d", text: "가" }
                ],
                correctAnswer: "choice-a",
                allowMultiple: false,
                shuffle: true,
                timeLimit: 30,
                explanation: "'책'은 받침이 있으므로 '은'을 사용합니다. '은/는'은 주제를 나타내는 조사입니다.",
                showFeedback: true,
                hints: ["'책'에 받침이 있는지 확인해보세요.", "주제를 나타내는 조사는 '은/는'입니다."]
            },
            'math-multiple': {
                question: "다음 중 소수(Prime Number)에 해당하는 것을 모두 선택하세요.",
                choices: [
                    { id: "choice-a", text: "2" },
                    { id: "choice-b", text: "3" },
                    { id: "choice-c", text: "4" },
                    { id: "choice-d", text: "5" }
                ],
                correctAnswer: ["choice-a", "choice-b", "choice-d"],
                allowMultiple: true,
                shuffle: true,
                timeLimit: 45,
                explanation: "소수는 1과 자기 자신으로만 나누어지는 1보다 큰 자연수입니다. 2, 3, 5가 소수입니다. 4는 2×2이므로 소수가 아닙니다.",
                showFeedback: true,
                hints: ["소수의 정의를 다시 생각해보세요.", "4는 2로 나누어집니다."]
            },
            'science-chemistry': {
                question: "물(H₂O)에서 수소와 산소의 원자 개수 비는 몇 대 몇입니까?",
                choices: [
                    { id: "choice-a", text: "1 : 1" },
                    { id: "choice-b", text: "2 : 1" },
                    { id: "choice-c", text: "1 : 2" },
                    { id: "choice-d", text: "3 : 1" }
                ],
                correctAnswer: "choice-b",
                allowMultiple: false,
                shuffle: true,
                timeLimit: 60,
                explanation: "H₂O에서 수소(H) 원자는 2개, 산소(O) 원자는 1개이므로 비율은 2:1입니다.",
                showFeedback: true,
                hints: ["H₂O에서 아래 첨자 숫자를 확인하세요.", "H의 아래 첨자는 2, O는 1(생략됨)입니다."]
            }
        };

        const mgSamples = {
            'korean-family': {
                title: "🏠 가족 관련 단어 기억하기",
                cards: [
                    { id: "card-1", content: "아버지", type: "text", matchId: "father" },
                    { id: "card-2", content: "Father", type: "text", matchId: "father" },
                    { id: "card-3", content: "어머니", type: "text", matchId: "mother" },
                    { id: "card-4", content: "Mother", type: "text", matchId: "mother" },
                    { id: "card-5", content: "형/누나", type: "text", matchId: "sibling" },
                    { id: "card-6", content: "Brother/Sister", type: "text", matchId: "sibling" },
                    { id: "card-7", content: "할아버지", type: "text", matchId: "grandfather" },
                    { id: "card-8", content: "Grandfather", type: "text", matchId: "grandfather" }
                ],
                gridSize: "4x4",
                timeLimit: 120,
                allowRetries: true,
                maxAttempts: 5,
                showTimer: true,
                successMessage: "🎉 축하합니다! 가족 단어를 모두 매칭했습니다!",
                failureMessage: "😅 시간이 부족했네요. 다시 한 번 도전해보세요!",
                shuffle: true
            },
            'math-symbols': {
                title: "🔢 수학 기호와 의미 매칭",
                cards: [
                    { id: "card-1", content: "∑", type: "text", matchId: "summation" },
                    { id: "card-2", content: "합계 (Sum)", type: "text", matchId: "summation" },
                    { id: "card-3", content: "∫", type: "text", matchId: "integral" },
                    { id: "card-4", content: "적분 (Integral)", type: "text", matchId: "integral" },
                    { id: "card-5", content: "∞", type: "text", matchId: "infinity" },
                    { id: "card-6", content: "무한대 (Infinity)", type: "text", matchId: "infinity" },
                    { id: "card-7", content: "√", type: "text", matchId: "sqrt" },
                    { id: "card-8", content: "제곱근 (Square Root)", type: "text", matchId: "sqrt" }
                ],
                gridSize: "4x4",
                timeLimit: 180,
                allowRetries: true,
                maxAttempts: 3,
                showTimer: true,
                successMessage: "🎯 훌륭합니다! 모든 수학 기호를 올바르게 매칭했습니다!",
                failureMessage: "📚 수학 기호를 더 공부한 후 다시 도전해보세요!",
                shuffle: true
            },
            'animal-emoji': {
                title: "🦁 동물 이모지와 이름 매칭 도전!",
                cards: [
                    { id: "card-1", content: "🐘", type: "emoji", matchId: "elephant" },
                    { id: "card-2", content: "코끼리", type: "text", matchId: "elephant" },
                    { id: "card-3", content: "🦒", type: "emoji", matchId: "giraffe" },
                    { id: "card-4", content: "기린", type: "text", matchId: "giraffe" },
                    { id: "card-5", content: "🦓", type: "emoji", matchId: "zebra" },
                    { id: "card-6", content: "얼룩말", type: "text", matchId: "zebra" },
                    { id: "card-7", content: "🦏", type: "emoji", matchId: "rhino" },
                    { id: "card-8", content: "코뿔소", type: "text", matchId: "rhino" }
                ],
                gridSize: "4x4",
                timeLimit: 240,
                allowRetries: true,
                maxAttempts: 2,
                showTimer: true,
                successMessage: "🏆 놀라워요! 모든 동물을 완벽하게 매칭했습니다!",
                failureMessage: "🐾 동물들이 숨바꼭질을 잘하네요. 다시 도전해보세요!",
                shuffle: true
            }
        };

        // State management
        let currentMCSample = null;
        let currentMGSample = null;

        // Sample selection handlers
        document.getElementById('mc-samples').addEventListener('click', (e) => {
            const card = e.target.closest('.sample-card');
            if (card) {
                document.querySelectorAll('#mc-samples .sample-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                currentMCSample = card.dataset.sample;
            }
        });

        document.getElementById('mg-samples').addEventListener('click', (e) => {
            const card = e.target.closest('.sample-card');
            if (card) {
                document.querySelectorAll('#mg-samples .sample-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                currentMGSample = card.dataset.sample;
            }
        });

        // Multiple Choice functions
        async function startMultipleChoice() {
            if (!currentMCSample) {
                alert('먼저 샘플을 선택해주세요.');
                return;
            }

            updateStatus('mc', 'active', '실행 중');
            const container = document.getElementById('mc-container');
            const params = mcSamples[currentMCSample];

            try {
                const template = window.TemplateRegistry?.get('multiple-choice@1.0.0');
                if (!template) {
                    throw new Error('Multiple Choice 템플릿을 찾을 수 없습니다.');
                }

                const eventBus = {
                    handlers: new Map(),
                    emit(event) {
                        console.log('Event:', event);
                        if (event.type === 'COMPLETE') {
                            setTimeout(() => updateStatus('mc', 'complete', '완료됨'), 100);
                        }
                    },
                    on(type, handler) {}
                };

                const context = {
                    activityId: 'test-mc-' + currentMCSample,
                    eventBus: eventBus
                };

                container.innerHTML = '';
                await template.mount(container, params, context);

            } catch (error) {
                console.error('Multiple Choice 시작 오류:', error);
                container.innerHTML = '<div class="text-center text-red-400"><p>오류: ' + error.message + '</p></div>';
                updateStatus('mc', 'ready', '오류 발생');
            }
        }

        async function startMemoryGame() {
            if (!currentMGSample) {
                alert('먼저 샘플을 선택해주세요.');
                return;
            }

            updateStatus('mg', 'active', '실행 중');
            const container = document.getElementById('mg-container');
            const params = mgSamples[currentMGSample];

            try {
                const template = window.TemplateRegistry?.get('memory-game@1.0.0');
                if (!template) {
                    throw new Error('Memory Game 템플릿을 찾을 수 없습니다.');
                }

                const eventBus = {
                    handlers: new Map(),
                    emit(event) {
                        console.log('Event:', event);
                        if (event.type === 'COMPLETE') {
                            setTimeout(() => updateStatus('mg', 'complete', '완료됨'), 100);
                        }
                    },
                    on(type, handler) {}
                };

                const context = {
                    activityId: 'test-mg-' + currentMGSample,
                    eventBus: eventBus
                };

                container.innerHTML = '';
                await template.mount(container, params, context);

            } catch (error) {
                console.error('Memory Game 시작 오류:', error);
                container.innerHTML = '<div class="text-center text-red-400"><p>오류: ' + error.message + '</p></div>';
                updateStatus('mg', 'ready', '오류 발생');
            }
        }

        function resetMultipleChoice() {
            document.getElementById('mc-container').innerHTML = '<div class="text-center text-gray-400"><i class="fas fa-mouse-pointer text-4xl mb-4"></i><p>위에서 샘플을 선택하고 시작 버튼을 클릭하세요.</p></div>';
            updateStatus('mc', 'ready', '준비됨');
        }

        function resetMemoryGame() {
            document.getElementById('mg-container').innerHTML = '<div class="text-center text-gray-400"><i class="fas fa-mouse-pointer text-4xl mb-4"></i><p>위에서 샘플을 선택하고 시작 버튼을 클릭하세요.</p></div>';
            updateStatus('mg', 'ready', '준비됨');
        }

        function updateStatus(type, status, text) {
            const dot = document.getElementById(type + '-status-dot');
            const statusText = document.getElementById(type + '-status');
            
            dot.className = 'status-dot status-' + status;
            statusText.textContent = text;
        }

        // Initialize
        console.log('Template Registry:', window.TemplateRegistry);
        if (window.TemplateRegistry) {
            console.log('Available templates:', Array.from(window.TemplateRegistry.keys()));
        }
    <\/script>
</body>
</html>`));P.get("/",e=>e.html(`
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Educational Lesson Platform</title>
        <meta name="description" content="Plugin-based educational lesson platform with interactive activities">
        
        <!-- CSS -->
        <link rel="stylesheet" href="/static/css/design-system.css">
        <link rel="stylesheet" href="/static/css/components.css">
        <link rel="stylesheet" href="/static/css/builder.css">
        
        <!-- Preload critical resources -->
        <link rel="preload" href="/static/js/app.js" as="script">
        
        <!-- Theme color for mobile browsers -->
        <meta name="theme-color" content="#0b1220">
        
        <!-- Favicon -->
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📚</text></svg>">
    </head>
    <body>
        <div id="app">
            <!-- Header -->
            <header class="header">
                <div class="container">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-4">
                            <h1 class="text-2xl font-bold">📚 레슨 플랫폼</h1>
                            <span class="badge badge-primary">v2.0.0</span>
                        </div>
                        <nav class="navigation">
                            <button class="nav-link active" data-tab="player">
                                <span class="nav-icon">🎯</span>
                                <span class="nav-text">플레이어</span>
                            </button>
                            <button class="nav-link" data-tab="builder">
                                <span class="nav-icon">🛠️</span>
                                <span class="nav-text">빌더</span>
                            </button>
                            <button class="nav-link" data-tab="templates">
                                <span class="nav-icon">🧩</span>
                                <span class="nav-text">템플릿</span>
                            </button>
                        </nav>
                    </div>
                </div>
            </header>

            <!-- Main Content Area -->
            <main class="main-content">
                <!-- Lesson Player Panel -->
                <section class="content-panel active" data-panel="player">
                    <div class="container">
                        <div class="lesson-player-layout">
                            <!-- Lesson Controls Sidebar -->
                            <aside class="lesson-sidebar">
                                <div class="card">
                                    <div class="card-header">
                                        <h3 class="card-title">레슨 로더</h3>
                                    </div>
                                    
                                    <!-- Lesson Loader -->
                                    <div class="lesson-loader-section">
                                        <div class="sample-lesson-selector">
                                            <label for="sample-lesson-select" class="sample-lesson-label">
                                                📚 샘플 레슨 선택
                                            </label>
                                            <select id="sample-lesson-select" class="sample-lesson-select">
                                                <option value="">-- 레슨을 선택하세요 --</option>
                                                <option value="sample-lesson-multiple-choice.json">4지 선다형 문제 데모</option>
                                                <option value="sample-lesson-memory-game.json">메모리 게임 데모</option>
                                                <option value="sample-lesson-word-guess.json">단어 맞추기 데모</option>
                                                <option value="sample-lesson-mixed-templates.json">혼합 템플릿 데모</option>
                                            </select>
                                            <button id="load-selected-sample-btn" class="btn btn-primary w-full" disabled>
                                                📖 선택한 레슨 로드
                                            </button>
                                        </div>
                                        
                                        <div class="divider">또는</div>
                                        
                                        <div class="file-upload-area">
                                            <input type="file" id="lesson-file-input" accept=".json" class="sr-only">
                                            <div id="lesson-drop-zone" class="drop-zone">
                                                <div class="drop-zone-content">
                                                    <svg class="drop-zone-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                                                    </svg>
                                                    <p class="drop-zone-text">JSON 파일을 드래그하거나 클릭하세요</p>
                                                    <button class="btn btn-secondary btn-sm" onclick="document.getElementById('lesson-file-input').click()">
                                                        파일 선택
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <!-- Lesson Info -->
                                    <div class="lesson-info-section" style="display: none;" id="lesson-info-section">
                                        <h4>레슨 정보</h4>
                                        <div class="lesson-meta">
                                            <h5 id="lesson-title">레슨 제목</h5>
                                            <p id="lesson-subtitle" class="text-sm text-secondary">활동 정보</p>
                                        </div>
                                        <div id="lesson-progress"></div>
                                        
                                        <!-- Lesson Activities Overview -->
                                        <div class="lesson-activities-overview" id="lesson-activities-overview">
                                            <h5 class="activities-title">📋 활동 목록</h5>
                                            <div class="activities-list" id="activities-list">
                                                <!-- Activities will be populated here -->
                                            </div>
                                        </div>
                                        
                                        <!-- Lesson Actions -->
                                        <div class="lesson-actions">
                                            <button id="download-lesson-json" class="btn btn-ghost btn-sm w-full">
                                                📄 레슨 JSON 다운로드
                                            </button>
                                            <button id="show-lesson-summary" class="btn btn-ghost btn-sm w-full">
                                                📊 레슨 요약 보기
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <!-- Current Activity Info -->
                                    <div id="current-activity-info"></div>
                                </div>
                                
                                <!-- Lesson Controls -->
                                <div class="card" id="lesson-controls" style="display: none;">
                                    <div class="card-header">
                                        <h4 class="card-title">레슨 제어</h4>
                                    </div>
                                    <div class="lesson-controls-grid">
                                        <button id="btn-previous" class="btn btn-secondary">
                                            ← 이전
                                        </button>
                                        <button id="btn-next" class="btn btn-primary">
                                            다음 →
                                        </button>
                                        <button id="btn-restart" class="btn btn-ghost">
                                            🔄 재시작
                                        </button>
                                        <button id="btn-finish" class="btn btn-success">
                                            ✓ 완료
                                        </button>
                                    </div>
                                </div>
                            </aside>
                            
                            <!-- Activity Container -->
                            <div class="lesson-main">
                                <div class="activity-container-wrapper">
                                    <div id="activity-container" class="activity-template">
                                        <div class="activity-placeholder">
                                            <div class="placeholder-content">
                                                <div class="placeholder-icon">🎯</div>
                                                <h3 class="placeholder-title">레슨을 시작하세요</h3>
                                                <p class="placeholder-text">
                                                    샘플 레슨을 로드하거나 JSON 파일을 업로드하여 인터랙티브 학습을 시작하세요.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Lesson Builder Panel -->
                <section class="content-panel" data-panel="builder">
                    <div class="container">
                        <div class="builder-layout">
                            <div class="card">
                                <div class="card-header">
                                    <h3 class="card-title">🛠️ 레슨 빌더</h3>
                                    <p class="card-subtitle">드래그 앤 드롭으로 레슨을 구성하세요</p>
                                </div>
                                <div class="builder-placeholder">
                                    <div class="placeholder-content">
                                        <div class="placeholder-icon">🛠️</div>
                                        <h4 class="placeholder-title">레슨 빌더 로딩 중...</h4>
                                        <p class="placeholder-text">
                                            레슨 빌더를 초기화하고 있습니다.<br>
                                            템플릿 카탈로그에서 '사용하기' 버튼을 클릭하여 시작하세요.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Templates Catalog Panel -->
                <section class="content-panel" data-panel="templates">
                    <div class="container">
                        <div class="templates-layout">
                            <div class="card">
                                <div class="card-header">
                                    <h3 class="card-title">🧩 템플릿 카탈로그</h3>
                                    <p class="card-subtitle">사용 가능한 액티비티 템플릿을 확인하세요</p>
                                </div>
                                <div id="templates-catalog">
                                    <div class="loading-placeholder">
                                        <div class="loading-spinner"></div>
                                        <p>템플릿을 불러오는 중...</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <!-- Footer -->
            <footer class="footer">
                <div class="container">
                    <div class="flex items-center justify-between">
                        <div class="footer-text">
                            <span>© 2024 Educational Lesson Platform</span>
                            <span class="text-muted">Plugin Architecture v2.0</span>
                        </div>
                        <div class="footer-links">
                            <a href="#" class="footer-link">도움말</a>
                            <a href="#" class="footer-link">API 문서</a>
                            <a href="https://github.com/UnimationKorea/core_plugin" class="footer-link">GitHub</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
        
        <!-- Notifications Container -->
        <div id="notifications-container"></div>
        
        <!-- Scripts -->
        <script type="module" src="/static/js/app.js"><\/script>
        <script type="module" src="/static/js/builder.js"><\/script>
        
        <!-- Service Worker for offline support -->
        <script>
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
              navigator.serviceWorker.register('/static/js/sw.js')
                .then(registration => console.log('SW registered'))
                .catch(error => console.log('SW registration failed'));
            });
          }
        <\/script>
    </body>
    </html>
  `));const Be=new vt,Qt=Object.assign({"/src/index.tsx":P});let yt=!1;for(const[,e]of Object.entries(Qt))e&&(Be.route("/",e),Be.notFound(e.notFoundHandler),yt=!0);if(!yt)throw new Error("Can't import modules from ['/src/index.tsx','/app/server.ts']");export{Be as default};
