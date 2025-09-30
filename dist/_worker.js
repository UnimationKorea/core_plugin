var bt=Object.defineProperty;var Ie=e=>{throw TypeError(e)};var wt=(e,t,s)=>t in e?bt(e,t,{enumerable:!0,configurable:!0,writable:!0,value:s}):e[t]=s;var p=(e,t,s)=>wt(e,typeof t!="symbol"?t+"":t,s),He=(e,t,s)=>t.has(e)||Ie("Cannot "+s);var a=(e,t,s)=>(He(e,t,"read from private field"),s?s.call(e):t.get(e)),v=(e,t,s)=>t.has(e)?Ie("Cannot add the same private member more than once"):t instanceof WeakSet?t.add(e):t.set(e,s),u=(e,t,s,r)=>(He(e,t,"write to private field"),r?r.call(e,s):t.set(e,s),s),y=(e,t,s)=>(He(e,t,"access private method"),s);var _e=(e,t,s,r)=>({set _(n){u(e,t,n,s)},get _(){return a(e,t,r)}});var Me=(e,t,s)=>(r,n)=>{let i=-1;return o(0);async function o(l){if(l<=i)throw new Error("next() called multiple times");i=l;let c,h=!1,d;if(e[l]?(d=e[l][0][0],r.req.routeIndex=l):d=l===e.length&&n||void 0,d)try{c=await d(r,()=>o(l+1))}catch(f){if(f instanceof Error&&t)r.error=f,c=await t(f,r),h=!0;else throw f}else r.finalized===!1&&s&&(c=await s(r));return c&&(r.finalized===!1||h)&&(r.res=c),r}},xt=Symbol(),Rt=async(e,t=Object.create(null))=>{const{all:s=!1,dot:r=!1}=t,i=(e instanceof rt?e.raw.headers:e.headers).get("Content-Type");return i!=null&&i.startsWith("multipart/form-data")||i!=null&&i.startsWith("application/x-www-form-urlencoded")?Et(e,{all:s,dot:r}):{}};async function Et(e,t){const s=await e.formData();return s?jt(s,t):{}}function jt(e,t){const s=Object.create(null);return e.forEach((r,n)=>{t.all||n.endsWith("[]")?Ot(s,n,r):s[n]=r}),t.dot&&Object.entries(s).forEach(([r,n])=>{r.includes(".")&&(Pt(s,r,n),delete s[r])}),s}var Ot=(e,t,s)=>{e[t]!==void 0?Array.isArray(e[t])?e[t].push(s):e[t]=[e[t],s]:t.endsWith("[]")?e[t]=[s]:e[t]=s},Pt=(e,t,s)=>{let r=e;const n=t.split(".");n.forEach((i,o)=>{o===n.length-1?r[i]=s:((!r[i]||typeof r[i]!="object"||Array.isArray(r[i])||r[i]instanceof File)&&(r[i]=Object.create(null)),r=r[i])})},Ye=e=>{const t=e.split("/");return t[0]===""&&t.shift(),t},At=e=>{const{groups:t,path:s}=Ct(e),r=Ye(s);return St(r,t)},Ct=e=>{const t=[];return e=e.replace(/\{[^}]+\}/g,(s,r)=>{const n=`@${r}`;return t.push([n,s]),n}),{groups:t,path:e}},St=(e,t)=>{for(let s=t.length-1;s>=0;s--){const[r]=t[s];for(let n=e.length-1;n>=0;n--)if(e[n].includes(r)){e[n]=e[n].replace(r,t[s][1]);break}}return e},Re={},Ht=(e,t)=>{if(e==="*")return"*";const s=e.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);if(s){const r=`${e}#${t}`;return Re[r]||(s[2]?Re[r]=t&&t[0]!==":"&&t[0]!=="*"?[r,s[1],new RegExp(`^${s[2]}(?=/${t})`)]:[e,s[1],new RegExp(`^${s[2]}$`)]:Re[r]=[e,s[1],!0]),Re[r]}return null},Te=(e,t)=>{try{return t(e)}catch{return e.replace(/(?:%[0-9A-Fa-f]{2})+/g,s=>{try{return t(s)}catch{return s}})}},kt=e=>Te(e,decodeURI),Ze=e=>{const t=e.url,s=t.indexOf("/",t.indexOf(":")+4);let r=s;for(;r<t.length;r++){const n=t.charCodeAt(r);if(n===37){const i=t.indexOf("?",r),o=t.slice(s,i===-1?void 0:i);return kt(o.includes("%25")?o.replace(/%25/g,"%2525"):o)}else if(n===63)break}return t.slice(s,r)},Lt=e=>{const t=Ze(e);return t.length>1&&t.at(-1)==="/"?t.slice(0,-1):t},te=(e,t,...s)=>(s.length&&(t=te(t,...s)),`${(e==null?void 0:e[0])==="/"?"":"/"}${e}${t==="/"?"":`${(e==null?void 0:e.at(-1))==="/"?"":"/"}${(t==null?void 0:t[0])==="/"?t.slice(1):t}`}`),et=e=>{if(e.charCodeAt(e.length-1)!==63||!e.includes(":"))return null;const t=e.split("/"),s=[];let r="";return t.forEach(n=>{if(n!==""&&!/\:/.test(n))r+="/"+n;else if(/\:/.test(n))if(/\?/.test(n)){s.length===0&&r===""?s.push("/"):s.push(r);const i=n.replace("?","");r+="/"+i,s.push(r)}else r+="/"+n}),s.filter((n,i,o)=>o.indexOf(n)===i)},ke=e=>/[%+]/.test(e)?(e.indexOf("+")!==-1&&(e=e.replace(/\+/g," ")),e.indexOf("%")!==-1?Te(e,st):e):e,tt=(e,t,s)=>{let r;if(!s&&t&&!/[%+]/.test(t)){let o=e.indexOf(`?${t}`,8);for(o===-1&&(o=e.indexOf(`&${t}`,8));o!==-1;){const l=e.charCodeAt(o+t.length+1);if(l===61){const c=o+t.length+2,h=e.indexOf("&",c);return ke(e.slice(c,h===-1?void 0:h))}else if(l==38||isNaN(l))return"";o=e.indexOf(`&${t}`,o+1)}if(r=/[%+]/.test(e),!r)return}const n={};r??(r=/[%+]/.test(e));let i=e.indexOf("?",8);for(;i!==-1;){const o=e.indexOf("&",i+1);let l=e.indexOf("=",i);l>o&&o!==-1&&(l=-1);let c=e.slice(i+1,l===-1?o===-1?void 0:o:l);if(r&&(c=ke(c)),i=o,c==="")continue;let h;l===-1?h="":(h=e.slice(l+1,o===-1?void 0:o),r&&(h=ke(h))),s?(n[c]&&Array.isArray(n[c])||(n[c]=[]),n[c].push(h)):n[c]??(n[c]=h)}return t?n[t]:n},$t=tt,Dt=(e,t)=>tt(e,t,!0),st=decodeURIComponent,Fe=e=>Te(e,st),ne,A,_,nt,it,$e,F,We,rt=(We=class{constructor(e,t="/",s=[[]]){v(this,_);p(this,"raw");v(this,ne);v(this,A);p(this,"routeIndex",0);p(this,"path");p(this,"bodyCache",{});v(this,F,e=>{const{bodyCache:t,raw:s}=this,r=t[e];if(r)return r;const n=Object.keys(t)[0];return n?t[n].then(i=>(n==="json"&&(i=JSON.stringify(i)),new Response(i)[e]())):t[e]=s[e]()});this.raw=e,this.path=t,u(this,A,s),u(this,ne,{})}param(e){return e?y(this,_,nt).call(this,e):y(this,_,it).call(this)}query(e){return $t(this.url,e)}queries(e){return Dt(this.url,e)}header(e){if(e)return this.raw.headers.get(e)??void 0;const t={};return this.raw.headers.forEach((s,r)=>{t[r]=s}),t}async parseBody(e){var t;return(t=this.bodyCache).parsedBody??(t.parsedBody=await Rt(this,e))}json(){return a(this,F).call(this,"text").then(e=>JSON.parse(e))}text(){return a(this,F).call(this,"text")}arrayBuffer(){return a(this,F).call(this,"arrayBuffer")}blob(){return a(this,F).call(this,"blob")}formData(){return a(this,F).call(this,"formData")}addValidatedData(e,t){a(this,ne)[e]=t}valid(e){return a(this,ne)[e]}get url(){return this.raw.url}get method(){return this.raw.method}get[xt](){return a(this,A)}get matchedRoutes(){return a(this,A)[0].map(([[,e]])=>e)}get routePath(){return a(this,A)[0].map(([[,e]])=>e)[this.routeIndex].path}},ne=new WeakMap,A=new WeakMap,_=new WeakSet,nt=function(e){const t=a(this,A)[0][this.routeIndex][1][e],s=y(this,_,$e).call(this,t);return s&&/\%/.test(s)?Fe(s):s},it=function(){const e={},t=Object.keys(a(this,A)[0][this.routeIndex][1]);for(const s of t){const r=y(this,_,$e).call(this,a(this,A)[0][this.routeIndex][1][s]);r!==void 0&&(e[s]=/\%/.test(r)?Fe(r):r)}return e},$e=function(e){return a(this,A)[1]?a(this,A)[1][e]:e},F=new WeakMap,We),Tt={Stringify:1},at=async(e,t,s,r,n)=>{typeof e=="object"&&!(e instanceof String)&&(e instanceof Promise||(e=e.toString()),e instanceof Promise&&(e=await e));const i=e.callbacks;return i!=null&&i.length?(n?n[0]+=e:n=[e],Promise.all(i.map(l=>l({phase:t,buffer:n,context:r}))).then(l=>Promise.all(l.filter(Boolean).map(c=>at(c,t,!1,r,n))).then(()=>n[0]))):Promise.resolve(e)},Nt="text/plain; charset=UTF-8",Le=(e,t)=>({"Content-Type":e,...t}),ge,ye,D,ie,T,j,me,ae,oe,G,be,we,q,se,ze,It=(ze=class{constructor(e,t){v(this,q);v(this,ge);v(this,ye);p(this,"env",{});v(this,D);p(this,"finalized",!1);p(this,"error");v(this,ie);v(this,T);v(this,j);v(this,me);v(this,ae);v(this,oe);v(this,G);v(this,be);v(this,we);p(this,"render",(...e)=>(a(this,ae)??u(this,ae,t=>this.html(t)),a(this,ae).call(this,...e)));p(this,"setLayout",e=>u(this,me,e));p(this,"getLayout",()=>a(this,me));p(this,"setRenderer",e=>{u(this,ae,e)});p(this,"header",(e,t,s)=>{this.finalized&&u(this,j,new Response(a(this,j).body,a(this,j)));const r=a(this,j)?a(this,j).headers:a(this,G)??u(this,G,new Headers);t===void 0?r.delete(e):s!=null&&s.append?r.append(e,t):r.set(e,t)});p(this,"status",e=>{u(this,ie,e)});p(this,"set",(e,t)=>{a(this,D)??u(this,D,new Map),a(this,D).set(e,t)});p(this,"get",e=>a(this,D)?a(this,D).get(e):void 0);p(this,"newResponse",(...e)=>y(this,q,se).call(this,...e));p(this,"body",(e,t,s)=>y(this,q,se).call(this,e,t,s));p(this,"text",(e,t,s)=>!a(this,G)&&!a(this,ie)&&!t&&!s&&!this.finalized?new Response(e):y(this,q,se).call(this,e,t,Le(Nt,s)));p(this,"json",(e,t,s)=>y(this,q,se).call(this,JSON.stringify(e),t,Le("application/json",s)));p(this,"html",(e,t,s)=>{const r=n=>y(this,q,se).call(this,n,t,Le("text/html; charset=UTF-8",s));return typeof e=="object"?at(e,Tt.Stringify,!1,{}).then(r):r(e)});p(this,"redirect",(e,t)=>{const s=String(e);return this.header("Location",/[^\x00-\xFF]/.test(s)?encodeURI(s):s),this.newResponse(null,t??302)});p(this,"notFound",()=>(a(this,oe)??u(this,oe,()=>new Response),a(this,oe).call(this,this)));u(this,ge,e),t&&(u(this,T,t.executionCtx),this.env=t.env,u(this,oe,t.notFoundHandler),u(this,we,t.path),u(this,be,t.matchResult))}get req(){return a(this,ye)??u(this,ye,new rt(a(this,ge),a(this,we),a(this,be))),a(this,ye)}get event(){if(a(this,T)&&"respondWith"in a(this,T))return a(this,T);throw Error("This context has no FetchEvent")}get executionCtx(){if(a(this,T))return a(this,T);throw Error("This context has no ExecutionContext")}get res(){return a(this,j)||u(this,j,new Response(null,{headers:a(this,G)??u(this,G,new Headers)}))}set res(e){if(a(this,j)&&e){e=new Response(e.body,e);for(const[t,s]of a(this,j).headers.entries())if(t!=="content-type")if(t==="set-cookie"){const r=a(this,j).headers.getSetCookie();e.headers.delete("set-cookie");for(const n of r)e.headers.append("set-cookie",n)}else e.headers.set(t,s)}u(this,j,e),this.finalized=!0}get var(){return a(this,D)?Object.fromEntries(a(this,D)):{}}},ge=new WeakMap,ye=new WeakMap,D=new WeakMap,ie=new WeakMap,T=new WeakMap,j=new WeakMap,me=new WeakMap,ae=new WeakMap,oe=new WeakMap,G=new WeakMap,be=new WeakMap,we=new WeakMap,q=new WeakSet,se=function(e,t,s){const r=a(this,j)?new Headers(a(this,j).headers):a(this,G)??new Headers;if(typeof t=="object"&&"headers"in t){const i=t.headers instanceof Headers?t.headers:new Headers(t.headers);for(const[o,l]of i)o.toLowerCase()==="set-cookie"?r.append(o,l):r.set(o,l)}if(s)for(const[i,o]of Object.entries(s))if(typeof o=="string")r.set(i,o);else{r.delete(i);for(const l of o)r.append(i,l)}const n=typeof t=="number"?t:(t==null?void 0:t.status)??a(this,ie);return new Response(e,{status:n,headers:r})},ze),b="ALL",_t="all",Mt=["get","post","put","delete","options","patch"],ot="Can not add a route since the matcher is already built.",ct=class extends Error{},Ft="__COMPOSED_HANDLER",qt=e=>e.text("404 Not Found",404),qe=(e,t)=>{if("getResponse"in e){const s=e.getResponse();return t.newResponse(s.body,s)}return console.error(e),t.text("Internal Server Error",500)},C,w,ht,S,V,Ee,je,Be,lt=(Be=class{constructor(t={}){v(this,w);p(this,"get");p(this,"post");p(this,"put");p(this,"delete");p(this,"options");p(this,"patch");p(this,"all");p(this,"on");p(this,"use");p(this,"router");p(this,"getPath");p(this,"_basePath","/");v(this,C,"/");p(this,"routes",[]);v(this,S,qt);p(this,"errorHandler",qe);p(this,"onError",t=>(this.errorHandler=t,this));p(this,"notFound",t=>(u(this,S,t),this));p(this,"fetch",(t,...s)=>y(this,w,je).call(this,t,s[1],s[0],t.method));p(this,"request",(t,s,r,n)=>t instanceof Request?this.fetch(s?new Request(t,s):t,r,n):(t=t.toString(),this.fetch(new Request(/^https?:\/\//.test(t)?t:`http://localhost${te("/",t)}`,s),r,n)));p(this,"fire",()=>{addEventListener("fetch",t=>{t.respondWith(y(this,w,je).call(this,t.request,t,void 0,t.request.method))})});[...Mt,_t].forEach(i=>{this[i]=(o,...l)=>(typeof o=="string"?u(this,C,o):y(this,w,V).call(this,i,a(this,C),o),l.forEach(c=>{y(this,w,V).call(this,i,a(this,C),c)}),this)}),this.on=(i,o,...l)=>{for(const c of[o].flat()){u(this,C,c);for(const h of[i].flat())l.map(d=>{y(this,w,V).call(this,h.toUpperCase(),a(this,C),d)})}return this},this.use=(i,...o)=>(typeof i=="string"?u(this,C,i):(u(this,C,"*"),o.unshift(i)),o.forEach(l=>{y(this,w,V).call(this,b,a(this,C),l)}),this);const{strict:r,...n}=t;Object.assign(this,n),this.getPath=r??!0?t.getPath??Ze:Lt}route(t,s){const r=this.basePath(t);return s.routes.map(n=>{var o;let i;s.errorHandler===qe?i=n.handler:(i=async(l,c)=>(await Me([],s.errorHandler)(l,()=>n.handler(l,c))).res,i[Ft]=n.handler),y(o=r,w,V).call(o,n.method,n.path,i)}),this}basePath(t){const s=y(this,w,ht).call(this);return s._basePath=te(this._basePath,t),s}mount(t,s,r){let n,i;r&&(typeof r=="function"?i=r:(i=r.optionHandler,r.replaceRequest===!1?n=c=>c:n=r.replaceRequest));const o=i?c=>{const h=i(c);return Array.isArray(h)?h:[h]}:c=>{let h;try{h=c.executionCtx}catch{}return[c.env,h]};n||(n=(()=>{const c=te(this._basePath,t),h=c==="/"?0:c.length;return d=>{const f=new URL(d.url);return f.pathname=f.pathname.slice(h)||"/",new Request(f,d)}})());const l=async(c,h)=>{const d=await s(n(c.req.raw),...o(c));if(d)return d;await h()};return y(this,w,V).call(this,b,te(t,"*"),l),this}},C=new WeakMap,w=new WeakSet,ht=function(){const t=new lt({router:this.router,getPath:this.getPath});return t.errorHandler=this.errorHandler,u(t,S,a(this,S)),t.routes=this.routes,t},S=new WeakMap,V=function(t,s,r){t=t.toUpperCase(),s=te(this._basePath,s);const n={basePath:this._basePath,path:s,method:t,handler:r};this.router.add(t,s,[r,n]),this.routes.push(n)},Ee=function(t,s){if(t instanceof Error)return this.errorHandler(t,s);throw t},je=function(t,s,r,n){if(n==="HEAD")return(async()=>new Response(null,await y(this,w,je).call(this,t,s,r,"GET")))();const i=this.getPath(t,{env:r}),o=this.router.match(n,i),l=new It(t,{path:i,matchResult:o,env:r,executionCtx:s,notFoundHandler:a(this,S)});if(o[0].length===1){let h;try{h=o[0][0][0][0](l,async()=>{l.res=await a(this,S).call(this,l)})}catch(d){return y(this,w,Ee).call(this,d,l)}return h instanceof Promise?h.then(d=>d||(l.finalized?l.res:a(this,S).call(this,l))).catch(d=>y(this,w,Ee).call(this,d,l)):h??a(this,S).call(this,l)}const c=Me(o[0],this.errorHandler,a(this,S));return(async()=>{try{const h=await c(l);if(!h.finalized)throw new Error("Context is not finalized. Did you forget to return a Response object or `await next()`?");return h.res}catch(h){return y(this,w,Ee).call(this,h,l)}})()},Be),Pe="[^/]+",pe=".*",ve="(?:|/.*)",re=Symbol(),Ut=new Set(".\\+*[^]$()");function Wt(e,t){return e.length===1?t.length===1?e<t?-1:1:-1:t.length===1||e===pe||e===ve?1:t===pe||t===ve?-1:e===Pe?1:t===Pe?-1:e.length===t.length?e<t?-1:1:t.length-e.length}var J,X,H,Ve,De=(Ve=class{constructor(){v(this,J);v(this,X);v(this,H,Object.create(null))}insert(t,s,r,n,i){if(t.length===0){if(a(this,J)!==void 0)throw re;if(i)return;u(this,J,s);return}const[o,...l]=t,c=o==="*"?l.length===0?["","",pe]:["","",Pe]:o==="/*"?["","",ve]:o.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);let h;if(c){const d=c[1];let f=c[2]||Pe;if(d&&c[2]&&(f===".*"||(f=f.replace(/^\((?!\?:)(?=[^)]+\)$)/,"(?:"),/\((?!\?:)/.test(f))))throw re;if(h=a(this,H)[f],!h){if(Object.keys(a(this,H)).some(g=>g!==pe&&g!==ve))throw re;if(i)return;h=a(this,H)[f]=new De,d!==""&&u(h,X,n.varIndex++)}!i&&d!==""&&r.push([d,a(h,X)])}else if(h=a(this,H)[o],!h){if(Object.keys(a(this,H)).some(d=>d.length>1&&d!==pe&&d!==ve))throw re;if(i)return;h=a(this,H)[o]=new De}h.insert(l,s,r,n,i)}buildRegExpStr(){const s=Object.keys(a(this,H)).sort(Wt).map(r=>{const n=a(this,H)[r];return(typeof a(n,X)=="number"?`(${r})@${a(n,X)}`:Ut.has(r)?`\\${r}`:r)+n.buildRegExpStr()});return typeof a(this,J)=="number"&&s.unshift(`#${a(this,J)}`),s.length===0?"":s.length===1?s[0]:"(?:"+s.join("|")+")"}},J=new WeakMap,X=new WeakMap,H=new WeakMap,Ve),Ae,xe,Ke,zt=(Ke=class{constructor(){v(this,Ae,{varIndex:0});v(this,xe,new De)}insert(e,t,s){const r=[],n=[];for(let o=0;;){let l=!1;if(e=e.replace(/\{[^}]+\}/g,c=>{const h=`@\\${o}`;return n[o]=[h,c],o++,l=!0,h}),!l)break}const i=e.match(/(?::[^\/]+)|(?:\/\*$)|./g)||[];for(let o=n.length-1;o>=0;o--){const[l]=n[o];for(let c=i.length-1;c>=0;c--)if(i[c].indexOf(l)!==-1){i[c]=i[c].replace(l,n[o][1]);break}}return a(this,xe).insert(i,t,r,a(this,Ae),s),r}buildRegExp(){let e=a(this,xe).buildRegExpStr();if(e==="")return[/^$/,[],[]];let t=0;const s=[],r=[];return e=e.replace(/#(\d+)|@(\d+)|\.\*\$/g,(n,i,o)=>i!==void 0?(s[++t]=Number(i),"$()"):(o!==void 0&&(r[Number(o)]=++t),"")),[new RegExp(`^${e}`),s,r]}},Ae=new WeakMap,xe=new WeakMap,Ke),dt=[],Bt=[/^$/,[],Object.create(null)],Oe=Object.create(null);function ut(e){return Oe[e]??(Oe[e]=new RegExp(e==="*"?"":`^${e.replace(/\/\*$|([.\\+*[^\]$()])/g,(t,s)=>s?`\\${s}`:"(?:|/.*)")}$`))}function Vt(){Oe=Object.create(null)}function Kt(e){var h;const t=new zt,s=[];if(e.length===0)return Bt;const r=e.map(d=>[!/\*|\/:/.test(d[0]),...d]).sort(([d,f],[g,R])=>d?1:g?-1:f.length-R.length),n=Object.create(null);for(let d=0,f=-1,g=r.length;d<g;d++){const[R,k,m]=r[d];R?n[k]=[m.map(([P])=>[P,Object.create(null)]),dt]:f++;let O;try{O=t.insert(k,f,R)}catch(P){throw P===re?new ct(k):P}R||(s[f]=m.map(([P,Z])=>{const de=Object.create(null);for(Z-=1;Z>=0;Z--){const[L,Ce]=O[Z];de[L]=Ce}return[P,de]}))}const[i,o,l]=t.buildRegExp();for(let d=0,f=s.length;d<f;d++)for(let g=0,R=s[d].length;g<R;g++){const k=(h=s[d][g])==null?void 0:h[1];if(!k)continue;const m=Object.keys(k);for(let O=0,P=m.length;O<P;O++)k[m[O]]=l[k[m[O]]]}const c=[];for(const d in o)c[d]=s[o[d]];return[i,c,n]}function ee(e,t){if(e){for(const s of Object.keys(e).sort((r,n)=>n.length-r.length))if(ut(s).test(t))return[...e[s]]}}var U,W,le,ft,pt,Ge,Gt=(Ge=class{constructor(){v(this,le);p(this,"name","RegExpRouter");v(this,U);v(this,W);u(this,U,{[b]:Object.create(null)}),u(this,W,{[b]:Object.create(null)})}add(e,t,s){var l;const r=a(this,U),n=a(this,W);if(!r||!n)throw new Error(ot);r[e]||[r,n].forEach(c=>{c[e]=Object.create(null),Object.keys(c[b]).forEach(h=>{c[e][h]=[...c[b][h]]})}),t==="/*"&&(t="*");const i=(t.match(/\/:/g)||[]).length;if(/\*$/.test(t)){const c=ut(t);e===b?Object.keys(r).forEach(h=>{var d;(d=r[h])[t]||(d[t]=ee(r[h],t)||ee(r[b],t)||[])}):(l=r[e])[t]||(l[t]=ee(r[e],t)||ee(r[b],t)||[]),Object.keys(r).forEach(h=>{(e===b||e===h)&&Object.keys(r[h]).forEach(d=>{c.test(d)&&r[h][d].push([s,i])})}),Object.keys(n).forEach(h=>{(e===b||e===h)&&Object.keys(n[h]).forEach(d=>c.test(d)&&n[h][d].push([s,i]))});return}const o=et(t)||[t];for(let c=0,h=o.length;c<h;c++){const d=o[c];Object.keys(n).forEach(f=>{var g;(e===b||e===f)&&((g=n[f])[d]||(g[d]=[...ee(r[f],d)||ee(r[b],d)||[]]),n[f][d].push([s,i-h+c+1]))})}}match(e,t){Vt();const s=y(this,le,ft).call(this);return this.match=(r,n)=>{const i=s[r]||s[b],o=i[2][n];if(o)return o;const l=n.match(i[0]);if(!l)return[[],dt];const c=l.indexOf("",1);return[i[1][c],l]},this.match(e,t)}},U=new WeakMap,W=new WeakMap,le=new WeakSet,ft=function(){const e=Object.create(null);return Object.keys(a(this,W)).concat(Object.keys(a(this,U))).forEach(t=>{e[t]||(e[t]=y(this,le,pt).call(this,t))}),u(this,U,u(this,W,void 0)),e},pt=function(e){const t=[];let s=e===b;return[a(this,U),a(this,W)].forEach(r=>{const n=r[e]?Object.keys(r[e]).map(i=>[i,r[e][i]]):[];n.length!==0?(s||(s=!0),t.push(...n)):e!==b&&t.push(...Object.keys(r[b]).map(i=>[i,r[b][i]]))}),s?Kt(t):null},Ge),z,N,Je,Jt=(Je=class{constructor(e){p(this,"name","SmartRouter");v(this,z,[]);v(this,N,[]);u(this,z,e.routers)}add(e,t,s){if(!a(this,N))throw new Error(ot);a(this,N).push([e,t,s])}match(e,t){if(!a(this,N))throw new Error("Fatal error");const s=a(this,z),r=a(this,N),n=s.length;let i=0,o;for(;i<n;i++){const l=s[i];try{for(let c=0,h=r.length;c<h;c++)l.add(...r[c]);o=l.match(e,t)}catch(c){if(c instanceof ct)continue;throw c}this.match=l.match.bind(l),u(this,z,[l]),u(this,N,void 0);break}if(i===n)throw new Error("Fatal error");return this.name=`SmartRouter + ${this.activeRouter.name}`,o}get activeRouter(){if(a(this,N)||a(this,z).length!==1)throw new Error("No active router has been determined yet.");return a(this,z)[0]}},z=new WeakMap,N=new WeakMap,Je),fe=Object.create(null),B,E,Q,ce,x,I,K,Xe,vt=(Xe=class{constructor(e,t,s){v(this,I);v(this,B);v(this,E);v(this,Q);v(this,ce,0);v(this,x,fe);if(u(this,E,s||Object.create(null)),u(this,B,[]),e&&t){const r=Object.create(null);r[e]={handler:t,possibleKeys:[],score:0},u(this,B,[r])}u(this,Q,[])}insert(e,t,s){u(this,ce,++_e(this,ce)._);let r=this;const n=At(t),i=[];for(let o=0,l=n.length;o<l;o++){const c=n[o],h=n[o+1],d=Ht(c,h),f=Array.isArray(d)?d[0]:c;if(f in a(r,E)){r=a(r,E)[f],d&&i.push(d[1]);continue}a(r,E)[f]=new vt,d&&(a(r,Q).push(d),i.push(d[1])),r=a(r,E)[f]}return a(r,B).push({[e]:{handler:s,possibleKeys:i.filter((o,l,c)=>c.indexOf(o)===l),score:a(this,ce)}}),r}search(e,t){var l;const s=[];u(this,x,fe);let n=[this];const i=Ye(t),o=[];for(let c=0,h=i.length;c<h;c++){const d=i[c],f=c===h-1,g=[];for(let R=0,k=n.length;R<k;R++){const m=n[R],O=a(m,E)[d];O&&(u(O,x,a(m,x)),f?(a(O,E)["*"]&&s.push(...y(this,I,K).call(this,a(O,E)["*"],e,a(m,x))),s.push(...y(this,I,K).call(this,O,e,a(m,x)))):g.push(O));for(let P=0,Z=a(m,Q).length;P<Z;P++){const de=a(m,Q)[P],L=a(m,x)===fe?{}:{...a(m,x)};if(de==="*"){const M=a(m,E)["*"];M&&(s.push(...y(this,I,K).call(this,M,e,a(m,x))),u(M,x,L),g.push(M));continue}const[Ce,Ne,ue]=de;if(!d&&!(ue instanceof RegExp))continue;const $=a(m,E)[Ce],mt=i.slice(c).join("/");if(ue instanceof RegExp){const M=ue.exec(mt);if(M){if(L[Ne]=M[0],s.push(...y(this,I,K).call(this,$,e,a(m,x),L)),Object.keys(a($,E)).length){u($,x,L);const Se=((l=M[0].match(/\//))==null?void 0:l.length)??0;(o[Se]||(o[Se]=[])).push($)}continue}}(ue===!0||ue.test(d))&&(L[Ne]=d,f?(s.push(...y(this,I,K).call(this,$,e,L,a(m,x))),a($,E)["*"]&&s.push(...y(this,I,K).call(this,a($,E)["*"],e,L,a(m,x)))):(u($,x,L),g.push($)))}}n=g.concat(o.shift()??[])}return s.length>1&&s.sort((c,h)=>c.score-h.score),[s.map(({handler:c,params:h})=>[c,h])]}},B=new WeakMap,E=new WeakMap,Q=new WeakMap,ce=new WeakMap,x=new WeakMap,I=new WeakSet,K=function(e,t,s,r){const n=[];for(let i=0,o=a(e,B).length;i<o;i++){const l=a(e,B)[i],c=l[t]||l[b],h={};if(c!==void 0&&(c.params=Object.create(null),n.push(c),s!==fe||r&&r!==fe))for(let d=0,f=c.possibleKeys.length;d<f;d++){const g=c.possibleKeys[d],R=h[c.score];c.params[g]=r!=null&&r[g]&&!R?r[g]:s[g]??(r==null?void 0:r[g]),h[c.score]=!0}}return n},Xe),Y,Qe,Xt=(Qe=class{constructor(){p(this,"name","TrieRouter");v(this,Y);u(this,Y,new vt)}add(e,t,s){const r=et(t);if(r){for(let n=0,i=r.length;n<i;n++)a(this,Y).insert(e,r[n],s);return}a(this,Y).insert(e,t,s)}match(e,t){return a(this,Y).search(e,t)}},Y=new WeakMap,Qe),gt=class extends lt{constructor(e={}){super(e),this.router=e.router??new Jt({routers:[new Gt,new Xt]})}},Qt=e=>{const s={...{origin:"*",allowMethods:["GET","HEAD","PUT","POST","DELETE","PATCH"],allowHeaders:[],exposeHeaders:[]},...e},r=(i=>typeof i=="string"?i==="*"?()=>i:o=>i===o?o:null:typeof i=="function"?i:o=>i.includes(o)?o:null)(s.origin),n=(i=>typeof i=="function"?i:Array.isArray(i)?()=>i:()=>[])(s.allowMethods);return async function(o,l){var d;function c(f,g){o.res.headers.set(f,g)}const h=await r(o.req.header("origin")||"",o);if(h&&c("Access-Control-Allow-Origin",h),s.origin!=="*"){const f=o.req.header("Vary");f?c("Vary",f):c("Vary","Origin")}if(s.credentials&&c("Access-Control-Allow-Credentials","true"),(d=s.exposeHeaders)!=null&&d.length&&c("Access-Control-Expose-Headers",s.exposeHeaders.join(",")),o.req.method==="OPTIONS"){s.maxAge!=null&&c("Access-Control-Max-Age",s.maxAge.toString());const f=await n(o.req.header("origin")||"",o);f.length&&c("Access-Control-Allow-Methods",f.join(","));let g=s.allowHeaders;if(!(g!=null&&g.length)){const R=o.req.header("Access-Control-Request-Headers");R&&(g=R.split(/\s*,\s*/))}return g!=null&&g.length&&(c("Access-Control-Allow-Headers",g.join(",")),o.res.headers.append("Vary","Access-Control-Request-Headers")),o.res.headers.delete("Content-Length"),o.res.headers.delete("Content-Type"),new Response(null,{headers:o.res.headers,status:204,statusText:"No Content"})}await l()}};const he=new gt;he.use("/api/*",Qt());he.get("/api/templates",async e=>{const t=[{id:"video@1.0.0",name:"Video Player",category:"media",capabilities:["autoplay","controls"],paramsSchema:{type:"object",properties:{src:{type:"string",description:"Video source URL"},autoplay:{type:"boolean",default:!1}},required:["src"]}},{id:"drag-drop-choices@1.2.0",name:"Drag & Drop Multiple Choice",category:"interaction",capabilities:["drag","drop","keyboard"],paramsSchema:{type:"object",properties:{prompt:{type:"string",description:"Question prompt"},choices:{type:"array",items:{type:"string"}},answer:{type:"string",description:"Correct answer"},image:{type:"string",description:"Optional image URL"}},required:["prompt","choices","answer"]}}];return e.json({templates:t})});he.get("/api/lessons/:id",async e=>(e.req.param("id"),e.json({error:"Not implemented"},501)));he.post("/api/lessons",async e=>(await e.req.json(),e.json({error:"Not implemented"},501)));he.get("/",e=>e.html(`
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
                                        <button id="load-sample-btn" class="btn btn-primary w-full">
                                            📖 샘플 레슨 로드
                                        </button>
                                        
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
                                        <div class="placeholder-icon">🚧</div>
                                        <h4 class="placeholder-title">개발 중</h4>
                                        <p class="placeholder-text">
                                            레슨 빌더는 현재 개발 중입니다.<br>
                                            곧 직관적인 드래그 앤 드롭 인터페이스를 제공할 예정입니다.
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
  `));const Ue=new gt,Yt=Object.assign({"/src/index.tsx":he});let yt=!1;for(const[,e]of Object.entries(Yt))e&&(Ue.route("/",e),Ue.notFound(e.notFoundHandler),yt=!0);if(!yt)throw new Error("Can't import modules from ['/src/index.tsx','/app/server.ts']");export{Ue as default};
