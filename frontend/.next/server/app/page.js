(()=>{var e={};e.id=974,e.ids=[974],e.modules={10846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},19121:e=>{"use strict";e.exports=require("next/dist/server/app-render/action-async-storage.external.js")},3295:e=>{"use strict";e.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},29294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},63033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},12412:e=>{"use strict";e.exports=require("assert")},55511:e=>{"use strict";e.exports=require("crypto")},94735:e=>{"use strict";e.exports=require("events")},29021:e=>{"use strict";e.exports=require("fs")},81630:e=>{"use strict";e.exports=require("http")},73496:e=>{"use strict";e.exports=require("http2")},55591:e=>{"use strict";e.exports=require("https")},91645:e=>{"use strict";e.exports=require("net")},33873:e=>{"use strict";e.exports=require("path")},27910:e=>{"use strict";e.exports=require("stream")},34631:e=>{"use strict";e.exports=require("tls")},83997:e=>{"use strict";e.exports=require("tty")},79551:e=>{"use strict";e.exports=require("url")},28354:e=>{"use strict";e.exports=require("util")},74075:e=>{"use strict";e.exports=require("zlib")},57729:()=>{},61804:(e,a,n)=>{"use strict";n.r(a),n.d(a,{GlobalError:()=>s.a,__next_app__:()=>c,pages:()=>p,routeModule:()=>u,tree:()=>d});var i=n(70260),t=n(28203),r=n(25155),s=n.n(r),o=n(67292),l={};for(let e in o)0>["default","tree","pages","GlobalError","__next_app__","routeModule"].indexOf(e)&&(l[e]=()=>o[e]);n.d(a,l);let d=["",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(n.bind(n,61377)),"D:\\PLN PROJECT\\LOGSHEETWEBPLNNUSADAYA\\frontend\\src\\app\\page.tsx"],metadata:{icon:[async e=>(await Promise.resolve().then(n.bind(n,70440))).default(e)],apple:[],openGraph:[],twitter:[],manifest:void 0}}]},{layout:[()=>Promise.resolve().then(n.bind(n,71354)),"D:\\PLN PROJECT\\LOGSHEETWEBPLNNUSADAYA\\frontend\\src\\app\\layout.tsx"],"not-found":[()=>Promise.resolve().then(n.t.bind(n,19937,23)),"next/dist/client/components/not-found-error"],forbidden:[()=>Promise.resolve().then(n.t.bind(n,69116,23)),"next/dist/client/components/forbidden-error"],unauthorized:[()=>Promise.resolve().then(n.t.bind(n,41485,23)),"next/dist/client/components/unauthorized-error"],metadata:{icon:[async e=>(await Promise.resolve().then(n.bind(n,70440))).default(e)],apple:[],openGraph:[],twitter:[],manifest:void 0}}],p=["D:\\PLN PROJECT\\LOGSHEETWEBPLNNUSADAYA\\frontend\\src\\app\\page.tsx"],c={require:n,loadChunk:()=>Promise.resolve()},u=new i.AppPageRouteModule({definition:{kind:t.RouteKind.APP_PAGE,page:"/page",pathname:"/",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:d}})},73088:(e,a,n)=>{Promise.resolve().then(n.t.bind(n,13219,23)),Promise.resolve().then(n.t.bind(n,34863,23)),Promise.resolve().then(n.t.bind(n,25155,23)),Promise.resolve().then(n.t.bind(n,40802,23)),Promise.resolve().then(n.t.bind(n,9350,23)),Promise.resolve().then(n.t.bind(n,48530,23)),Promise.resolve().then(n.t.bind(n,88921,23))},2464:(e,a,n)=>{Promise.resolve().then(n.t.bind(n,66959,23)),Promise.resolve().then(n.t.bind(n,33875,23)),Promise.resolve().then(n.t.bind(n,88903,23)),Promise.resolve().then(n.t.bind(n,57174,23)),Promise.resolve().then(n.t.bind(n,84178,23)),Promise.resolve().then(n.t.bind(n,87190,23)),Promise.resolve().then(n.t.bind(n,61365,23))},4483:(e,a,n)=>{Promise.resolve().then(n.bind(n,59157))},70139:(e,a,n)=>{Promise.resolve().then(n.bind(n,80145))},6429:(e,a,n)=>{Promise.resolve().then(n.bind(n,61377))},41341:(e,a,n)=>{Promise.resolve().then(n.bind(n,28427))},5694:()=>{},42008:(e,a,n)=>{"use strict";n(5694);var i=n(58009),t=function(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}(i),r="undefined"!=typeof process&&process.env&&!0,s=function(e){return"[object String]"===Object.prototype.toString.call(e)},o=function(){function e(e){var a=void 0===e?{}:e,n=a.name,i=void 0===n?"stylesheet":n,t=a.optimizeForSpeed,o=void 0===t?r:t;l(s(i),"`name` must be a string"),this._name=i,this._deletedRulePlaceholder="#"+i+"-deleted-rule____{}",l("boolean"==typeof o,"`optimizeForSpeed` must be a boolean"),this._optimizeForSpeed=o,this._serverSheet=void 0,this._tags=[],this._injected=!1,this._rulesCount=0,this._nonce=null}var a=e.prototype;return a.setOptimizeForSpeed=function(e){l("boolean"==typeof e,"`setOptimizeForSpeed` accepts a boolean"),l(0===this._rulesCount,"optimizeForSpeed cannot be when rules have already been inserted"),this.flush(),this._optimizeForSpeed=e,this.inject()},a.isOptimizeForSpeed=function(){return this._optimizeForSpeed},a.inject=function(){var e=this;l(!this._injected,"sheet already injected"),this._injected=!0,this._serverSheet={cssRules:[],insertRule:function(a,n){return"number"==typeof n?e._serverSheet.cssRules[n]={cssText:a}:e._serverSheet.cssRules.push({cssText:a}),n},deleteRule:function(a){e._serverSheet.cssRules[a]=null}}},a.getSheetForTag=function(e){if(e.sheet)return e.sheet;for(var a=0;a<document.styleSheets.length;a++)if(document.styleSheets[a].ownerNode===e)return document.styleSheets[a]},a.getSheet=function(){return this.getSheetForTag(this._tags[this._tags.length-1])},a.insertRule=function(e,a){return l(s(e),"`insertRule` accepts only strings"),"number"!=typeof a&&(a=this._serverSheet.cssRules.length),this._serverSheet.insertRule(e,a),this._rulesCount++},a.replaceRule=function(e,a){this._optimizeForSpeed;var n=this._serverSheet;if(a.trim()||(a=this._deletedRulePlaceholder),!n.cssRules[e])return e;n.deleteRule(e);try{n.insertRule(a,e)}catch(i){r||console.warn("StyleSheet: illegal rule: \n\n"+a+"\n\nSee https://stackoverflow.com/q/20007992 for more info"),n.insertRule(this._deletedRulePlaceholder,e)}return e},a.deleteRule=function(e){this._serverSheet.deleteRule(e)},a.flush=function(){this._injected=!1,this._rulesCount=0,this._serverSheet.cssRules=[]},a.cssRules=function(){return this._serverSheet.cssRules},a.makeStyleTag=function(e,a,n){a&&l(s(a),"makeStyleTag accepts only strings as second parameter");var i=document.createElement("style");this._nonce&&i.setAttribute("nonce",this._nonce),i.type="text/css",i.setAttribute("data-"+e,""),a&&i.appendChild(document.createTextNode(a));var t=document.head||document.getElementsByTagName("head")[0];return n?t.insertBefore(i,n):t.appendChild(i),i},function(e,a){for(var n=0;n<a.length;n++){var i=a[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(e,i.key,i)}}(e.prototype,[{key:"length",get:function(){return this._rulesCount}}]),e}();function l(e,a){if(!e)throw Error("StyleSheet: "+a+".")}var d=function(e){for(var a=5381,n=e.length;n;)a=33*a^e.charCodeAt(--n);return a>>>0},p={};function c(e,a){if(!a)return"jsx-"+e;var n=String(a),i=e+n;return p[i]||(p[i]="jsx-"+d(e+"-"+n)),p[i]}function u(e,a){var n=e+(a=a.replace(/\/style/gi,"\\/style"));return p[n]||(p[n]=a.replace(/__jsx-style-dynamic-selector/g,e)),p[n]}var g=i.createContext(null);g.displayName="StyleSheetContext",t.default.useInsertionEffect||t.default.useLayoutEffect;var h=void 0;function m(e){var a=h||i.useContext(g);return a&&a.add(e),null}m.dynamic=function(e){return e.map(function(e){return c(e[0],e[1])}).join(" ")},a.style=m},63:(e,a,n)=>{"use strict";e.exports=n(42008).style},28427:(e,a,n)=>{"use strict";n.r(a),n.d(a,{default:()=>p});var i=n(45512),t=n(58009),r=n(28531),s=n.n(r),o=n(63),l=n.n(o);function d({onGetStarted:e}){return(0,i.jsxs)("section",{id:"home",className:"jsx-e4325403efd2980 hero relative w-full overflow-hidden min-h-[90vh] md:min-h-[85vh] lg:min-h-screen flex items-center bg-white",children:[(0,i.jsxs)("video",{autoPlay:!0,muted:!0,loop:!0,playsInline:!0,preload:"auto",style:{transform:"translate3d(0, 0, 0)",WebkitTransform:"translate3d(0, 0, 0)",backfaceVisibility:"hidden",WebkitBackfaceVisibility:"hidden"},className:"jsx-e4325403efd2980 hero-bg-video absolute inset-0 h-full w-full object-cover z-0",children:[(0,i.jsx)("source",{src:"/videos/hero-corp.mp4",type:"video/mp4",className:"jsx-e4325403efd2980"}),(0,i.jsx)("source",{src:"/images/hero-corp.mp4",type:"video/mp4",className:"jsx-e4325403efd2980"}),(0,i.jsx)("source",{src:"/images/GIF1.mp4",type:"video/mp4",className:"jsx-e4325403efd2980"})]}),(0,i.jsx)("div",{style:{background:"linear-gradient(to top, rgba(255, 255, 255, 1.0) 0%, rgba(255, 255, 255, 0.78) 18%, rgba(255, 255, 255, 0.35) 42%, rgba(255, 255, 255, 0.10) 65%, rgba(255, 255, 255, 0.0) 85%, rgba(255, 255, 255, 0.0) 100%)",backdropFilter:"none",WebkitBackdropFilter:"none"},className:"jsx-e4325403efd2980 hero-overlay absolute inset-0 z-[1] pointer-events-none"}),(0,i.jsx)("div",{className:"jsx-e4325403efd2980 hero-container relative z-10 mx-auto flex w-full max-w-[1280px] items-center px-6 sm:px-8 lg:px-12 pt-[90px] pb-14 min-h-[90vh] md:min-h-[85vh] lg:min-h-screen",children:(0,i.jsxs)("div",{className:"jsx-e4325403efd2980 hero-content w-full max-w-[720px] lg:max-w-[55%] text-left",children:[(0,i.jsxs)("h1",{style:{textShadow:"0 1px 12px rgba(255, 255, 255, 0.85), 0 0 2px rgba(255, 255, 255, 0.9)"},className:"jsx-e4325403efd2980 hero-title text-[#17182D] text-[36px] sm:text-[46px] lg:text-[54px] xl:text-[60px] font-extrabold leading-[1.12] tracking-[-0.02em] mb-6 animate-hero-title",children:["PT Pelayanan Listrik",(0,i.jsx)("br",{className:"jsx-e4325403efd2980"}),"Nasional Nusa Daya"]}),(0,i.jsxs)("p",{style:{textShadow:"0 1px 8px rgba(255, 255, 255, 0.85)"},className:"jsx-e4325403efd2980 hero-subtitle text-[#1e293b] text-[16px] sm:text-[17px] lg:text-[18px] leading-[1.72] mb-9 font-medium animate-hero-desc",children:["Perusahaan Pengelola Aset Ketenagalistrikan",(0,i.jsx)("br",{className:"jsx-e4325403efd2980 hidden sm:inline"}),"Terkemuka di Wilayah Tengah dan Timur Indonesia dan",(0,i.jsx)("br",{className:"jsx-e4325403efd2980 hidden sm:inline"}),"tumbuh berkelanjutan"]}),(0,i.jsxs)("div",{className:"jsx-e4325403efd2980 hero-actions flex flex-col sm:flex-row items-stretch sm:items-center gap-4 animate-hero-actions",children:[(0,i.jsx)("a",{href:"#about",onClick:a=>{e&&(a.preventDefault(),e())},id:"getStartedBtn",className:"jsx-e4325403efd2980 btn-hero-outline inline-flex items-center justify-center px-9 py-3.5 rounded-full border-2 border-[#1a9de1] text-[#1a9de1] bg-white/85 hover:bg-[#1a9de1] hover:text-white font-semibold text-[15px] tracking-wide transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-[#1a9de1]/25 hover:-translate-y-0.5 cursor-pointer text-center",children:"Get Started"}),(0,i.jsxs)(s(),{href:"/dashboard",className:"btn-hero-portal inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#1a9de1] to-[#005daa] hover:from-[#1588c4] hover:to-[#004a88] text-white font-semibold text-[15px] tracking-wide transition-all duration-300 shadow-lg shadow-[#1a9de1]/25 hover:shadow-xl hover:shadow-[#1a9de1]/40 hover:-translate-y-0.5 text-center",children:[(0,i.jsxs)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2.2",className:"jsx-e4325403efd2980 w-4 h-4",children:[(0,i.jsx)("path",{d:"M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4",className:"jsx-e4325403efd2980"}),(0,i.jsx)("polyline",{points:"10 17 15 12 10 7",className:"jsx-e4325403efd2980"}),(0,i.jsx)("line",{x1:"15",y1:"12",x2:"3",y2:"12",className:"jsx-e4325403efd2980"})]}),"Portal Logsheet"]})]})]})}),(0,i.jsx)(l(),{id:"e4325403efd2980",children:"@-webkit-keyframes heroFadeUp{from{opacity:0;-webkit-transform:translatey(22px);transform:translatey(22px)}to{opacity:1;-webkit-transform:translatey(0);transform:translatey(0)}}@-moz-keyframes heroFadeUp{from{opacity:0;-moz-transform:translatey(22px);transform:translatey(22px)}to{opacity:1;-moz-transform:translatey(0);transform:translatey(0)}}@-o-keyframes heroFadeUp{from{opacity:0;-o-transform:translatey(22px);transform:translatey(22px)}to{opacity:1;-o-transform:translatey(0);transform:translatey(0)}}@keyframes heroFadeUp{from{opacity:0;-webkit-transform:translatey(22px);-moz-transform:translatey(22px);-o-transform:translatey(22px);transform:translatey(22px)}to{opacity:1;-webkit-transform:translatey(0);-moz-transform:translatey(0);-o-transform:translatey(0);transform:translatey(0)}}.animate-hero-title.jsx-e4325403efd2980{-webkit-animation:heroFadeUp.75s cubic-bezier(.16,1,.3,1)forwards;-moz-animation:heroFadeUp.75s cubic-bezier(.16,1,.3,1)forwards;-o-animation:heroFadeUp.75s cubic-bezier(.16,1,.3,1)forwards;animation:heroFadeUp.75s cubic-bezier(.16,1,.3,1)forwards}.animate-hero-desc.jsx-e4325403efd2980{-webkit-animation:heroFadeUp.85s cubic-bezier(.16,1,.3,1).15s both;-moz-animation:heroFadeUp.85s cubic-bezier(.16,1,.3,1).15s both;-o-animation:heroFadeUp.85s cubic-bezier(.16,1,.3,1).15s both;animation:heroFadeUp.85s cubic-bezier(.16,1,.3,1).15s both}.hero-bg-video.jsx-e4325403efd2980{-moz-transform:translate3d(0,0,0);transform:translate3d(0,0,0);-webkit-transform:translate3d(0,0,0);-moz-backface-visibility:hidden;backface-visibility:hidden;-webkit-backface-visibility:hidden;image-rendering:auto}.animate-hero-actions.jsx-e4325403efd2980{-webkit-animation:heroFadeUp.95s cubic-bezier(.16,1,.3,1).3s both;-moz-animation:heroFadeUp.95s cubic-bezier(.16,1,.3,1).3s both;-o-animation:heroFadeUp.95s cubic-bezier(.16,1,.3,1).3s both;animation:heroFadeUp.95s cubic-bezier(.16,1,.3,1).3s both}"})]})}function p(){let[e,a]=(0,t.useState)(!1),[n,r]=(0,t.useState)(!1),[o,l]=(0,t.useState)("home"),[p,c]=(0,t.useState)(!1),[u,g]=(0,t.useState)("all"),[h,m]=(0,t.useState)(!1),[x,f]=(0,t.useState)({name:"",email:"",subject:"",message:""}),[b,k]=(0,t.useState)(0),[y,v]=(0,t.useState)(0),[j,w]=(0,t.useState)(null),[P,N]=(0,t.useState)(null),[S,T]=(0,t.useState)([{id:190,img:"/images/news-190.jpg",category:"KORPORAT",date:"04 Jun 2026",author:"Humas PLN Nusa Daya",title:"Amandemen Kontrak Transmisi dan Distribusi Wilayah Maluku",excerpt:"Pada 4 Juni 2026, PLN Nusa Daya bersama PLN UIW Maluku dan Maluku Utara menandatangani amandemen kontrak strategis guna memperkuat keandalan pasokan energi dan optimasi mutu layanan pelanggan di Maluku.",content:"Pada 4 Juni 2026, PT PLN Nusa Daya bersama PLN UIW Maluku dan Maluku Utara resmi melaksanakan penandatanganan amandemen kontrak strategis operasional jaringan transmisi dan distribusi tenaga listrik.\n\nLangkah ini merupakan bagian dari peta jalan transformasi keandalan sistem interkoneksi di wilayah Maluku, memastikan kontinuitas pasokan listrik 24 jam tanpa padam bagi sektor industri, pariwisata, dan pemukiman warga.",href:"https://plnnusadaya.co.id/190/new"},{id:189,img:"/images/news-189.jpg",category:"CSR & KEBERLANJUTAN",date:"02 Jun 2026",author:"CSR PLN Nusa Daya",title:"Qurban Berkelanjutan PLN Nusa Daya Berbagi Keberkahan",excerpt:"Program “Qurban Berkelanjutan” menjadi wujud kepedulian sosial PLN Nusa Daya dalam berbagi berkah dan menyejahterakan masyarakat di sekitar ring-1 pembangkit listrik wilayah kerja Kalimantan & Indonesia Timur.",content:"Melalui inisiatif 'Qurban Berkelanjutan', PT PLN Nusa Daya mendistribusikan ratusan paket hewan qurban ke berbagai desa binaan di sekitar instalasi pembangkit.\n\nProgram ini mengintegrasikan kepedulian sosial dengan pemberdayaan peternak lokal serta pemanfaatan kemasan ramah lingkungan nir-plastik sebagai komitmen ESG perusahaan.",href:"https://plnnusadaya.co.id/189/new"},{id:188,img:"/images/news-188.jpg",category:"OPERASIONAL",date:"28 Mei 2026",author:"Divisi Operasi KIT",title:"Siaga Idul Adha: PLN Nusa Daya Pastikan Keandalan Pembangkit",excerpt:"Siaga Penuh untuk Terangnya Hari Raya Idul Adha 1447 H. Tim teknis PLN Nusa Daya menyiagakan 25.000+ personil dan posko siaga 24 jam untuk menjamin kontinuitas pasokan listrik tanpa padam selama perayaan.",content:"Menyambut perayaan Idul Adha 1447 H, PT PLN Nusa Daya menetapkan masa siaga kelistrikan dengan posko kontrol 24 jam di 9 Unit Pelaksana.\n\nSeluruh armada Pelayanan Teknik (Yantek) dan teknisi pembangkit dilengkapi peralatan diagnostik digital WACB untuk mitigasi dini anomali sistem secara real-time.",href:"https://plnnusadaya.co.id/188/new"},{id:187,img:"/images/news-187.jpg",category:"PENGHARGAAN",date:"20 Mei 2026",author:"Sekretariat Perusahaan",title:"Top CSR Awards 2026: Dedikasi Terbaik Energi Berkelanjutan",excerpt:"PT PLN Nusa Daya meraih dua penghargaan bergengsi dalam Top CSR Awards 2026 atas komitmen kuat dalam elektrifikasi hijau, pemberdayaan UMKM lokal, dan tata kelola lingkungan terpadu.",content:"Apresiasi Top CSR Awards 2026 menegaskan keberhasilan PLN Nusa Daya dalam menyelaraskan pertumbuhan bisnis ketenagalistrikan dengan prinsip keberlanjutan global.\n\nDewan juri mengapresiasi inovasi program elektrifikasi pedesaan terpencil berbasis energi bersih dan konservasi keanekaragaman hayati sekitar PLTD.",href:"https://plnnusadaya.co.id/187/new"},{id:186,img:"/images/news-186.jpg",category:"SUMBER DAYA MANUSIA",date:"15 Mei 2026",author:"Divisi SDM & Budaya",title:"Hari Kebangkitan Nasional ke-118: Bangkit Menuju Kemandirian Energi",excerpt:"Upacara Hari Kebangkitan Nasional ke-118 diikuti seluruh insan PT PLN Nusa Daya dengan semangat transformasi digital dan penguatan tata nilai AKHLAK dalam mengawal ketahanan energi nasional.",content:"Memperingati Hari Kebangkitan Nasional, segenap jajaran PT PLN Nusa Daya meneguhkan komitmen sebagai pelopor keandalan energi di Kalimantan dan Kawasan Timur Indonesia.\n\nPengembangan talenta muda, sertifikasi kompetensi ketenagalistrikan berstandar internasional, dan adopsi digital logsheet menjadi pilar utama kebangkitan korporasi.",href:"https://plnnusadaya.co.id/186/new"}]),[L,A]=(0,t.useState)(!1),[C,I]=(0,t.useState)({projects:0,workers:0,units:0,years:0}),D=(0,t.useRef)(null),M=Math.max(0,S.length-3);function R(e){let a=document.getElementById(e);a&&(window.scrollTo({top:a.offsetTop-76,behavior:"smooth"}),r(!1))}let z={"Visi Misi":{title:"Visi & Misi PT PLN Nusa Daya",category:"Identitas Korporasi",badge:"Visi Misi 2026-2030",content:["VISI: Menjadi Perusahaan Pengelola Aset Ketenagalistrikan Terkemuka di Wilayah Tengah dan Timur Indonesia yang Tumbuh Berkelanjutan.","MISI 1: Menjalankan bisnis pengelolaan aset pembangkitan, transmisi, dan distribusi tenaga listrik yang andal, efisien, dan berorientasi pada kepuasan pelanggan.","MISI 2: Mengoptimalkan pemanfaatan teknologi digital terpadu dalam operasional ketenagalistrikan melalui platform WACB dan Smart Grid System.","MISI 3: Menerapkan standar Keselamatan, Kesehatan Kerja dan Lindungan Lingkungan (K3L) bertaraf internasional menuju Zero Accident.","MISI 4: Meningkatkan kompetensi dan kesejahteraan Human Capital yang unggul berlandaskan core values AKHLAK BUMN."]},"Tata Nilai":{title:"Tata Nilai Budaya AKHLAK",category:"Budaya Korporasi",badge:"Core Values BUMN",content:["AMANAH: Memegang teguh kepercayaan yang diberikan dengan penuh integritas, kejujuran, dan tanggung jawab profesional.","KOMPETEN: Terus belajar, beradaptasi dengan teknologi baru, dan mengembangkan kapabilitas untuk memberikan kinerja terbaik.","HARMONIS: Saling peduli dan menghargai keberagaman, menciptakan lingkungan kerja yang kondusif, aman, dan kolaboratif.","LOYAL: Berdedikasi dan mengutamakan kepentingan Bangsa, Negara, dan Korporasi di atas kepentingan pribadi atau golongan.","ADAPTIF: Terus berinovasi, proaktif, dan antusias dalam menggerakkan ataupun menghadapi perubahan industri kelistrikan masa depan.","KOLABORATIF: Membangun kerja sama yang sinergis antar unit, mitra strategis, dan pemangku kepentingan demi ketahanan energi nasional."]},"Profil Komisaris":{title:"Dewan Komisaris PT PLN Nusa Daya",category:"Kepemimpinan & Pengawasan",badge:"Dewan Komisaris",content:["Dewan Komisaris bertugas mengawasi kebijakan direksi dalam menjalankan perseroan serta memberikan nasihat berkala kepada Direksi guna memastikan tercapainya target korporasi secara berkesinambungan.","Komisaris Utama mengoordinasikan pengawasan berkala bersama Komite Audit, Komite Risiko, dan Pemegang Saham (PT PLN Persero) dengan prinsip independensi dan tata kelola berintegritas tinggi."]},"Anak Perusahaan":{title:"Portofolio & Afiliasi PLN Group",category:"Sinergi Korporasi",badge:"PLN Group",content:["Sebagai salah satu lini terdepan PT PLN (Persero), PT PLN Nusa Daya bersinergi dengan seluruh entitas subholding dan afiliasi PLN Group di seluruh Indonesia.","Fokus sinergi mencakup transfer teknologi pembangkitan ramah lingkungan, penyediaan suku cadang mesin, rekayasa teknik transmisi, dan integrasi rantai pasok bahan bakar energi primer."]},"Wilayah Kerja":{title:"Wilayah Kerja Operasional PT PLN Nusa Daya",category:"Jangkauan Operasi",badge:"9 Unit Pelaksana",content:["Wilayah operasional PT PLN Nusa Daya membentang di Kawasan Tengah dan Timur Indonesia, mencakup Kalimantan, Sulawesi, Maluku, Maluku Utara, Papua, Papua Barat, dan Nusa Tenggara.","Dengan 9 Kantor Unit Pelaksana (UP) dan lebih dari 335 titik instalasi pembangkit serta gardu induk, kami menjaga keandalan listrik bagi jutaan masyarakat dan pusat industri regional."]},"Company Profile":{title:"Company Profile PT PLN Nusa Daya",category:"Profil Perusahaan",badge:"Sejarah & Kapabilitas",content:["PT Pelayanan Listrik Nasional Nusa Daya (PLN Nusa Daya / PLN ND) dibentuk berdasarkan Keputusan Direksi PT PLN (Persero) pada tahun 2003 di Pulau Tarakan, Kalimantan Utara.","Seiring transformasi strategis tahun 2016, kantor pusat berkedudukan di Kota Balikpapan, Kalimantan Timur, memegang mandat utama operasi & pemeliharaan aset ketenagalistrikan terkemuka.","Didukung lebih dari 25.000 tenaga kerja tersertifikasi dan portofolio pengelolaan pembangkit hingga transmisi tegangan tinggi."]},"Board Manual":{title:"Board Manual PT PLN Nusa Daya",category:"Tata Kelola",badge:"Dokumen Resmi GCG",content:["Board Manual merupakan pedoman tata kerja Direksi dan Dewan Komisaris yang mengatur hubungan kerja, pembagian tugas, fungsi koordinasi, dan wewenang pengambilan keputusan.","Disusun berdasarkan prinsip transparansi, kepatuhan regulasi Kementerian BUMN, dan Anggaran Dasar Perusahaan yang sah."]},"Code of Conduct":{title:"Code of Conduct (Pedoman Perilaku)",category:"Integritas & Etika",badge:"Etika Bisnis",content:["Pedoman Perilaku (Code of Conduct) memuat norma integritas, larangan benturan kepentingan (conflict of interest), pencegahan gratifikasi dan penyuapan, serta kewajiban menjaga kerahasiaan aset informasi.","Wajib dipatuhi oleh seluruh jajaran Direksi, Dewan Komisaris, dan seluruh insan PT PLN Nusa Daya."]},"Pedoman GCG":{title:"Pedoman Good Corporate Governance (GCG)",category:"Tata Kelola Perusahaan",badge:"Prinsip TARIF",content:["Menerapkan prinsip Transparansi, Akuntabilitas, Responsibilitas, Independensi, dan Fairness (Kewajaran) dalam seluruh siklus bisnis.","Asesmen GCG berkala dilakukan secara independen dengan pencapaian skor 'Sangat Baik' secara konsisten."]},"Annual Report":{title:"Laporan Tahunan (Annual Report)",category:"Transparansi Finansial",badge:"Annual Report 2025/2026",content:["Laporan Tahunan menyajikan kilas kinerja komprehensif PT PLN Nusa Daya, audit laporan keuangan independen dengan opini Wajar Tanpa Pengecualian (WTP), dan tinjauan pencapaian target operasional.","Dokumen ini mencerminkan komitmen keterbukaan informasi publik kepada pemegang saham dan masyarakat luas."]},"Sustainability Report":{title:"Laporan Keberlanjutan (Sustainability Report)",category:"ESG & Keberlanjutan",badge:"GRI Standards",content:["Mengacu pada standar Global Reporting Initiative (GRI), memaparkan kinerja Lingkungan, Sosial, dan Tata Kelola (ESG).","Termasuk roadmap dekarbonisasi, efisiensi bahan bakar pembangkit, penanganan limbah B3, program elektrifikasi hijau, dan pemberdayaan komunitas masyarakat lokal."]},"Risk Management":{title:"Enterprise Risk Management (ERM)",category:"Mitigasi Risiko",badge:"ISO 31000",content:["Penerapan kerangka kerja manajemen risiko berbasis ISO 31000 mencakup identifikasi, evaluasi, mitigasi, dan pemantauan risiko strategis, operasional, dan kepatuhan.","Memastikan keandalan pasokan listrik terlindungi dari gangguan cuaca ekstrem, fluktuasi pasokan bahan bakar, dan risiko teknis pembangkit."]},"Whistle Blowing System":{title:"Whistle Blowing System (WBS)",category:"Integritas & Kepatuhan",badge:"Saluran Pelaporan Rahasia",content:["Whistle Blowing System merupakan mekanisme pelaporan pelanggaran etika, indikasi korupsi, penipuan, atau pelanggaran hukum yang terjamin kerahasiaan dan perlindungan bagi pelapor.","Saluran resmi WBS tersedia melalui portal daring, email khusus kepatuhan: wbs@plnnusadaya.co.id, dan nomor pengaduan terenkripsi."]},Drups:{title:"Layanan DRUPS (Diesel Rotary UPS)",category:"Layanan Khusus",badge:"Zero-Interruption Power",content:["Diesel Rotary Uninterruptible Power Supply (DRUPS) menyediakan perlindungan pasokan daya listrik tanpa kedip (seamless transfer) untuk fasilitas dengan toleransi kegagalan nol.","Sangat ideal bagi pusat data (data center), rumah sakit rujukan, industri semikonduktor, kilang migas, dan bandar udara internasional."]},ListriQu:{title:"Layanan ListriQu",category:"Layanan Konsumen",badge:"Solusi Instalasi Listrik",content:["ListriQu adalah aplikasi dan layanan profesional untuk inspeksi, perbaikan, instalasi, dan sertifikasi kelistrikan rumah tangga maupun komersial.","Didukung oleh teknisi berlisensi resmi dengan transparansi harga dan garansi pengerjaan berstandar keselamatan PLN."]},"Laporan Triwulan I":{title:"Laporan Kinerja Manajemen Triwulan I",category:"Laporan Manajemen",badge:"Q1 2026",content:["Realisasi produksi tenaga listrik mencapai 104,2% dari RKAP triwulanan.","Availability Factor (EAF) pembangkit terjaga di angka 92,8% dengan SFC (Specific Fuel Consumption) BBM yang efisien di seluruh regional kerja."]},"Semester I":{title:"Laporan Kinerja Tengah Tahun (Semester I)",category:"Laporan Manajemen",badge:"Semester 1 2026",content:["Pencapaian target pemeliharaan preventif (Preventive Maintenance) tepat waktu sebesar 98,5%.","Kesiapan cadangan daya menyambut pertengahan tahun dan mitigasi gangguan transmisi dengan respon cepat di bawah standar SLA."]},"Triwulan III":{title:"Laporan Kinerja Manajemen Triwulan III",category:"Laporan Manajemen",badge:"Q3 2026",content:["Penguatan keandalan sistem interkoneksi dan evaluasi performa mesin sewa serta IPP.","Penerapan digitalisasi logsheet WACB dan presensi biometrik lapangan untuk 25.000+ personil teknis."]},"Semester II":{title:"Laporan Kinerja Penutupan Tahun (Semester II)",category:"Laporan Manajemen",badge:"Semester 2 2026",content:["Penutupan buku tahunan dengan pertumbuhan laba usaha positif dan pencapaian target Zero Fatal Accident di seluruh unit.","Kesiapan siaga energi Natal & Tahun Baru dengan status siaga penuh (Full Alert) 24/7."]},"Info Pengadaan":{title:"Informasi Pengadaan Barang & Jasa Resmi",category:"Pengadaan",badge:"E-Procurement PLN",content:["Pengumuman tender, prakualifikasi penyedia, dan seleksi pengadaan barang/jasa PT PLN Nusa Daya diselenggarakan secara transparan melalui portal E-Procurement PLN Group.","Menjunjung tinggi prinsip adil, akuntabel, bebas suap, dan mengutamakan Tingkat Komponen Dalam Negeri (TKDN)."]},"Pedoman Pengadaan":{title:"Pedoman Pengadaan Barang dan Jasa",category:"Regulasi Pengadaan",badge:"Peraturan Direksi",content:["Pedoman Pengadaan mengatur tata cara pemilihan mitra kerja, evaluasi teknis, negosiasi harga, dan monitoring kontrak berbasis integritas.","Mewajibkan kepatuhan terhadap Pakta Integritas dan Standar Manajemen Anti Penyuapan (SMAP) ISO 37001."]},"Privacy Policy":{title:"Kebijakan Privasi (Privacy Policy)",category:"Legal & Kepatuhan",badge:"UU No. 27/2022 PDP",content:["PT PLN Nusa Daya berkomitmen penuh melindungi hak privasi dan kerahasiaan data pribadi pengguna situs web dan portal logsheet.","Data pengguna hanya diproses untuk kepentingan operasional resmi, autentikasi keamanan, dan pelaporan internal tanpa dibagikan kepada pihak ketiga tanpa persetujuan."]}};function B(e,a){if("home"===a||"#home"===a){R("home");return}if("about"===a||"#about"===a){R("about");return}if("services"===a||"#services"===a){R("services");return}if("news"===a||"#news"===a){R("news");return}if("direksi"===a||"#direksi"===a){R("direksi");return}if("contact"===a||"#contact"===a){R("contact");return}if("/berita"===a){window.location.href="/berita";return}if(z[e]){w(z[e]),r(!1);return}a&&a.startsWith("http")&&window.open(a,"_blank","noreferrer")}let K=[{num:"01",badge:"⚡ O&M Pembangkit",link:"https://plnnusadaya.co.id/amc-pembangkit",icon:(0,i.jsxs)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.8",className:"w-6 h-6",children:[(0,i.jsx)("rect",{x:"2",y:"7",width:"20",height:"14",rx:"2",ry:"2"}),(0,i.jsx)("path",{d:"M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"})]}),title:"Asset Management Contract (AMC) Pembangkit",desc:"Pengoperasian dan pemeliharaan mesin pembangkit listrik secara andal, optimalisasi pemakaian BBM, penanganan gangguan cepat, dan pengelolaan limbah K3L berstandar tinggi.",features:["Operasi & Pemeliharaan Rutin","Efisiensi & Rekonsiliasi BBM","Pengelolaan Limbah & K3L"]},{num:"02",badge:"\uD83C\uDF10 Grid Transmisi",link:"https://plnnusadaya.co.id/amc-transmisi",icon:(0,i.jsxs)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.8",className:"w-6 h-6",children:[(0,i.jsx)("circle",{cx:"12",cy:"12",r:"3"}),(0,i.jsx)("path",{d:"M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"})]}),title:"Asset Management Contract (AMC) Transmisi",desc:"Jasa Operasi dan Pemeliharaan gardu induk menyangkut pencatatan, kontrol dan penyetelan kondisi operasi peralatan, patroli jalur transmisi, dan mitigasi darurat gangguan.",features:["Operasi Gardu Induk (GI)","Patroli Jalur Transmisi","Tindakan Tanggap Darurat 24 Jam"]},{num:"03",badge:"\uD83D\uDD0C Jaringan Distribusi",link:"https://plnnusadaya.co.id/amc-distribusi",icon:(0,i.jsx)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.8",className:"w-6 h-6",children:(0,i.jsx)("path",{d:"M13 2L3 14h9l-1 8 10-12h-9l1-8z"})}),title:"Asset Management Contract (AMC) Distribusi",desc:"Pengoperasian, pemeliharaan, serta inspeksi jaringan distribusi tegangan menengah & rendah, perbaikan jaringan cepat, dan perbaikan KwH meter di seluruh wilayah kerja.",features:["Inspeksi JTM & JTR Berkala","Perbaikan & Tera KwH Meter","Keandalan Jaringan Distribusi"]},{num:"04",badge:"\uD83C\uDFED Power Supply IPP",link:"https://plnnusadaya.co.id/drups",icon:(0,i.jsxs)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.8",className:"w-6 h-6",children:[(0,i.jsx)("path",{d:"M18.36 6.64a9 9 0 1 1-12.73 0"}),(0,i.jsx)("line",{x1:"12",y1:"2",x2:"12",y2:"12"})]}),title:"Penyedia Pembangkit Listrik (<100 MW)",desc:"Penyediaan energi listrik mandiri dan andal dengan skema IPP berkapasitas hingga 100 MW untuk mendukung ketahanan energi dan industri di wilayah Timur Indonesia.",features:["Kapasitas Pembangkit s.d 100 MW","Skema IPP Cepat & Efisien","Fokus Kawasan Timur Indonesia"]},{num:"05",badge:"\uD83D\uDC65 Customer Care",link:"https://plnnusadaya.co.id/listriqu",icon:(0,i.jsxs)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.8",className:"w-6 h-6",children:[(0,i.jsx)("path",{d:"M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"}),(0,i.jsx)("circle",{cx:"9",cy:"7",r:"4"}),(0,i.jsx)("path",{d:"M23 21v-2a4 4 0 0 0-3-3.87"}),(0,i.jsx)("path",{d:"M16 3.13a4 4 0 0 1 0 7.75"})]}),title:"Pelayanan Pelanggan & Yantek",desc:"Layanan pelanggan profesional dan responsif 24/7 melalui armada Pelayanan Teknik (Yantek) serta manajemen penagihan (Billman) yang berorientasi kepuasan konsumen.",features:["Pelayanan Teknik (YANTEK)","Billing Management (BILLMAN)","Respon Cepat Siaga 24 Jam"]},{num:"06",badge:"\uD83C\uDF31 Beyond kWh",link:"https://plnnusadaya.co.id/beyond-kwh",icon:(0,i.jsx)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.8",className:"w-6 h-6",children:(0,i.jsx)("polygon",{points:"12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"})}),title:"Inovasi Beyond kWh",desc:"Layanan inovatif melampaui kebutuhan energi dasar, menghadirkan energi baru terbarukan, solusi dekarbonisasi, serta digitalisasi aset ketenagalistrikan masa depan.",features:["Green & Renewable Energy","Digital Asset Management","Efisiensi & Dekarbonisasi"]}],E=[{cat:"pembangkit",img:"/images/portfolio-10.jpg",label:"O&M Pembangkit Listrik"},{cat:"pembangkit",img:"/images/portfolio-9.jpg",label:"Pembangkit Listrik Modern"},{cat:"distribusi",img:"/images/portfolio-8.jpg",label:"O&M Distribusi & Yantek"},{cat:"transmisi",img:"/images/portfolio-7.jpg",label:"O&M Gardu Induk Transmisi"},{cat:"distribusi",img:"/images/portfolio-6.jpg",label:"Inspeksi Jaringan Listrik"},{cat:"pembangkit",img:"/images/portfolio-5.jpg",label:"PLTU Sistem Kelistrikan"}],W="all"===u?E:E.filter(e=>e.cat===u);return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)("style",{children:`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --primary: #1a9de1;
          --primary-dk: #1178b5;
          --primary-lt: #e8f6fd;
          --dark: #1a1a2e;
          --text: #334155;
          --text-light: #64748b;
          --bg: #ffffff;
          --nav-h: 76px;
        }
        body { font-family: 'Inter', system-ui, sans-serif; color: var(--text); background: #ffffff; }

        /* Navbar — Seamless Blend with Hero Header */
        .navbar-corp {
          position: fixed; top: 0; left: 0; right: 0; z-index: 1000; height: var(--nav-h);
          background: linear-gradient(to bottom, rgba(255, 255, 255, 0.65) 0%, rgba(255, 255, 255, 0.15) 70%, transparent 100%);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.25); transition: all .35s ease;
          box-shadow: none;
        }
        .navbar-corp.scrolled {
          background: rgba(255, 255, 255, 0.98);
          border-bottom: 1px solid rgba(226, 232, 240, 0.85);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }
        .nav-container-corp {
          max-width: 1400px; margin: 0 auto; height: 100%; padding: 0 28px;
          display: flex; align-items: center; justify-content: space-between; gap: 20px;
        }
        .logo-danantara-corp { height: 42px; width: auto; object-fit: contain; }
        .nav-link-corp {
          display: flex; align-items: center; gap: 4px; padding: 10px 12px;
          font-size: 14px; font-weight: 500; color: #334155; border-radius: 6px;
          transition: color .2s; white-space: nowrap; cursor: pointer;
        }
        .nav-link-corp:hover { color: var(--primary); }
        .nav-item-corp.active .nav-link-corp {
          color: var(--primary); font-weight: 600; position: relative;
        }
        .nav-item-corp.active .nav-link-corp::after {
          content: ''; position: absolute; bottom: 0; left: 12px; right: 12px;
          height: 2.5px; background: var(--primary); border-radius: 2px;
        }
        .dropdown-corp {
          display: none; position: absolute; top: calc(100% + 2px); left: 0;
          min-width: 230px; background: white; border-radius: 12px;
          box-shadow: 0 12px 35px rgba(0,0,0,.12); border: 1px solid #e2e8f0;
          padding: 8px; z-index: 200;
        }
        .nav-item-corp:hover .dropdown-corp { display: block; }
        .dropdown-corp li a, .dropdown-corp li span {
          display: block; padding: 9px 14px; font-size: 13px; color: #334155;
          border-radius: 8px; transition: all .2s; cursor: pointer;
        }
        .dropdown-corp li a:hover, .dropdown-corp li span:hover { background: var(--primary-lt); color: var(--primary); }

        .logo-akujago-corp { height: 38px; width: auto; object-fit: contain; }
        .logo-pln-corp { height: 42px; width: auto; object-fit: contain; }

        /* Hero */
        .hero, .hero-corp {
          position: relative;
          width: 100%;
          min-height: calc(100vh - var(--nav-h));
          display: flex;
          align-items: center;
          background: #ffffff;
          padding: calc(var(--nav-h) + 40px) 0 60px;
          overflow: hidden;
        }

        /* Full Background Video — 1080p Crisp Acceleration */
        .hero-bg-video {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          z-index: 1;
          transform: translate3d(0, 0, 0);
          -webkit-transform: translate3d(0, 0, 0);
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }

        /* Vertical Gradient Overlay: Bawah 100% ke Atas 0% Jernih */
        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            rgba(255, 255, 255, 1.0) 0%,
            rgba(255, 255, 255, 0.78) 18%,
            rgba(255, 255, 255, 0.35) 42%,
            rgba(255, 255, 255, 0.10) 65%,
            rgba(255, 255, 255, 0.0) 85%,
            rgba(255, 255, 255, 0.0) 100%
          ) !important;
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
          z-index: 2;
          pointer-events: none;
        }

        /* Foreground Container */
        .hero-container {
          position: relative;
          z-index: 3;
          max-width: 1340px;
          width: 100%;
          margin: 0 auto;
          padding: 0 32px;
          display: flex;
          align-items: center;
        }

        .hero-content {
          max-width: 720px;
        }

        .hero-title {
          font-size: clamp(34px, 4.4vw, 56px);
          font-weight: 800;
          line-height: 1.18;
          color: #0f172a;
          margin-bottom: 22px;
          letter-spacing: -0.5px;
          text-shadow: 0 1px 12px rgba(255, 255, 255, 0.95), 0 0 2px rgba(255, 255, 255, 0.9);
        }

        .hero-subtitle {
          font-size: 18px;
          color: #1e293b;
          line-height: 1.7;
          margin-bottom: 36px;
          font-weight: 600;
          text-shadow: 0 1px 8px rgba(255, 255, 255, 0.95);
        }

        .hero-actions {
          display: flex;
          align-items: center;
          gap: 18px;
          flex-wrap: wrap;
        }

        .btn-hero-outline {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 13px 38px;
          border: 2px solid var(--primary);
          border-radius: 9999px;
          font-weight: 700;
          font-size: 15px;
          color: var(--primary);
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(4px);
          text-decoration: none;
          cursor: pointer;
          transition: all .25s ease;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05);
        }
        .btn-hero-outline:hover {
          background: var(--primary);
          color: #ffffff;
          box-shadow: 0 6px 20px rgba(26, 157, 225, 0.4);
          transform: translateY(-2px);
        }

        .btn-hero-portal {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 13px 30px;
          background: linear-gradient(135deg, #1a9de1, #1178b5);
          color: #ffffff;
          border-radius: 9999px;
          font-weight: 700;
          font-size: 15px;
          text-decoration: none;
          box-shadow: 0 6px 20px rgba(26, 157, 225, 0.35);
          transition: all .25s ease;
        }
        .btn-hero-portal:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 26px rgba(26, 157, 225, 0.5);
        }

        /* Trademark Section Title */
        .section-header-corp { text-align: center; margin-bottom: 50px; }
        .section-title-wrapper-corp { display: inline-flex; align-items: center; gap: 16px; }
        .section-line-corp { display: block; width: 38px; height: 2px; background: #1a9de1; border-radius: 2px; }
        .section-title-corp { font-size: 26px; font-weight: 800; color: #1a1a2e; letter-spacing: 1.5px; text-transform: uppercase; }

        /* About */
        .about-section-corp { padding: 70px 0 80px; background: #ffffff; }
        .about-container-corp {
          max-width: 1280px; margin: 0 auto; padding: 0 32px;
          display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: start;
        }
        .about-text-corp { font-size: 15px; color: #475569; line-height: 1.8; text-align: justify; }

        /* Stats */
        .stats-section-corp { padding: 60px 0 80px; background: #ffffff; }
        .stats-container-corp {
          max-width: 1280px; margin: 0 auto; padding: 0 32px;
          display: grid; grid-template-columns: 1fr 1.2fr; align-items: center; gap: 60px;
        }
        .stats-grid-corp { display: grid; grid-template-columns: repeat(2, 1fr); gap: 40px 32px; }
        .stat-item-corp { display: flex; align-items: center; gap: 18px; }
        .stat-icon-corp {
          width: 54px; height: 54px; border-radius: 12px; background: #e8f6fd;
          color: var(--primary); display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .stat-number-corp { font-size: 34px; font-weight: 800; color: #1a1a2e; line-height: 1.1; }
        .stat-label-corp { font-size: 14px; color: #64748b; margin-top: 4px; font-weight: 500; }

        /* Services (Clean, Minimalist & Professional Corporate Showcase) */
        .services-section-corp {
          padding: 80px 0 90px;
          background: #ffffff;
          position: relative;
        }
        .section-subtitle-corp {
          font-size: 15px;
          color: #64748b;
          margin-top: 10px;
          font-weight: 400;
          text-align: center;
          max-width: 680px;
          margin-left: auto;
          margin-right: auto;
          line-height: 1.6;
        }

        .service-card-corp {
          position: relative;
          background: #ffffff;
          border-radius: 14px;
          padding: 28px 22px 24px;
          text-align: left;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
          border: 1px solid #e2e8f0;
          transition: all .25s ease;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          flex: 0 0 285px;
          min-width: 285px;
          z-index: 1;
        }
        .service-card-corp:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
          border-color: #cbd5e1;
        }

        .service-card-header-corp {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }
        .service-badge-corp {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          font-weight: 600;
          color: #475569;
          background: #f1f5f9;
          padding: 3px 9px;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
        }
        .service-num-corp {
          font-size: 16px;
          font-weight: 700;
          color: #94a3b8;
          font-family: 'Inter', system-ui, sans-serif;
        }

        .service-icon-box-corp {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: #f0f7fc;
          color: #1a9de1;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
          transition: all .25s ease;
        }
        .service-card-corp:hover .service-icon-box-corp {
          background: #1a9de1;
          color: #ffffff;
        }

        .service-title-corp {
          font-size: 16px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 10px;
          line-height: 1.4;
          min-height: 44px;
        }
        .service-desc-corp {
          font-size: 13px;
          color: #64748b;
          line-height: 1.6;
          margin-bottom: 16px;
          flex-grow: 1;
        }

        .service-features-corp {
          list-style: none;
          padding: 0;
          margin: 0 0 18px 0;
          display: flex;
          flex-direction: column;
          gap: 7px;
          border-top: 1px solid #f1f5f9;
          padding-top: 14px;
        }
        .service-feature-item-corp {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: #334155;
          font-weight: 500;
        }
        .service-check-icon-corp {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #e0f2fe;
          color: #0284c7;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .service-action-link-corp {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12.5px;
          font-weight: 600;
          color: #1a9de1;
          text-decoration: none;
          margin-top: auto;
          transition: gap .25s ease;
          cursor: pointer;
        }
        .service-card-corp:hover .service-action-link-corp {
          gap: 10px;
          color: #0d84c1;
        }

        .carousel-btn-corp {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 46px;
          height: 46px;
          border-radius: 50%;
          background: #ffffff;
          color: #1a9de1;
          border: 1px solid #e2e8f0;
          font-size: 24px;
          line-height: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 20;
          box-shadow: 0 4px 16px rgba(15, 23, 42, 0.1);
          transition: all .25s ease;
        }
        .carousel-btn-corp:hover {
          background: #1a9de1;
          color: #ffffff;
          border-color: #1a9de1;
          transform: translateY(-50%) scale(1.1);
          box-shadow: 0 8px 24px rgba(26, 157, 225, 0.35);
        }
        .carousel-prev-corp { left: -14px; }
        .carousel-next-corp { right: -14px; }

        /* News — Expanded Readable Cards with Meta & Badges */
        .news-section-corp { padding: 80px 0 90px; background: #ffffff; }
        .news-card-corp {
          background: #ffffff; border-radius: 16px; overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;
          transition: all .35s ease; display: flex; flex-direction: column;
          flex: 0 0 calc(33.333% - 18px); min-width: 360px;
        }
        .news-card-corp:hover { transform: translateY(-6px); box-shadow: 0 16px 36px rgba(0,0,0,0.1); border-color: #cbd5e1; }
        .news-img-wrapper-corp { position: relative; width: 100%; aspect-ratio: 16/10; overflow: hidden; background: #f8fafc; }
        .news-img-wrapper-corp img { width: 100%; height: 100%; object-fit: cover; transition: transform .5s ease; }
        .news-card-corp:hover .news-img-wrapper-corp img { transform: scale(1.05); }
        .news-content-corp { padding: 22px 20px; display: flex; flex-direction: column; flex-grow: 1; }
        .news-badge-corp {
          display: inline-flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 700;
          color: #0284c7; background: #e0f2fe; padding: 4px 10px; border-radius: 6px;
          text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; align-self: flex-start;
        }
        .news-meta-corp { display: flex; align-items: center; gap: 14px; font-size: 12px; color: #94a3b8; margin-bottom: 10px; }
        .news-title-corp {
          font-size: 17px; font-weight: 700; color: #0f172a; line-height: 1.4; margin-bottom: 10px;
          transition: color .2s;
        }
        .news-card-corp:hover .news-title-corp { color: var(--primary); }
        .news-excerpt-corp {
          font-size: 13.5px; color: #475569; line-height: 1.65; margin-bottom: 18px; flex-grow: 1;
        }
        .news-read-btn-corp {
          display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 700;
          color: #1a9de1; text-decoration: none; cursor: pointer; transition: gap .2s ease;
          border: none; background: transparent; padding: 0;
        }
        .news-read-btn-corp:hover { gap: 10px; color: #0d84c1; }

        /* Portfolio — Pure White Background (No Gray) */
        .portfolio-section-corp { padding: 80px 0; background: #ffffff; }
        .filter-btn-corp {
          background: transparent; border: none; font-size: 13px; font-weight: 700;
          color: #475569; padding: 8px 18px; border-radius: 6px; cursor: pointer;
          letter-spacing: .5px; transition: all .2s ease;
        }
        .filter-btn-corp:hover { color: #1a9de1; }
        .filter-btn-corp.active { background: #1a9de1; color: #ffffff; }
        .portfolio-grid-corp {
          max-width: 1280px; margin: 0 auto; padding: 0 32px;
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;
        }
        .portfolio-item-corp {
          position: relative; border-radius: 14px; overflow: hidden; aspect-ratio: 16/11;
          background: #ffffff; border: 1px solid #f1f5f9;
          box-shadow: 0 4px 18px rgba(0,0,0,0.06); cursor: pointer;
        }
        .portfolio-item-corp img { width: 100%; height: 100%; object-fit: cover; transition: transform .5s ease; }
        .portfolio-item-corp:hover img { transform: scale(1.08); }
        .portfolio-overlay-corp {
          position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%);
          display: flex; align-items: flex-end; padding: 20px; opacity: 0; transition: opacity .3s ease;
        }
        .portfolio-item-corp:hover .portfolio-overlay-corp { opacity: 1; }

        /* Scroll Reveal Animation */
        .scroll-reveal {
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1), transform 0.65s cubic-bezier(0.16, 1, 0.3, 1);
          will-change: opacity, transform;
        }
        .scroll-reveal.revealed {
          opacity: 1;
          transform: translateY(0);
        }

        /* Direksi */
        .direksi-section-corp { padding: 80px 0 90px; background: #ffffff; }
        .direksi-grid-corp {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px;
          max-width: 1180px; margin: 0 auto; padding: 0 32px;
        }
        .direksi-card-corp {
          background: #ffffff; border-radius: 14px; overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #f1f5f9;
          transition: all .35s ease; display: flex; flex-direction: column;
        }
        .direksi-card-corp:hover { transform: translateY(-8px); box-shadow: 0 16px 40px rgba(0,0,0,0.12); }
        .direksi-photo-wrapper-corp { position: relative; width: 100%; aspect-ratio: 4/5; background: #f8fafc; overflow: hidden; }
        .direksi-photo-corp { width: 100%; height: 100%; object-fit: cover; object-position: top center; transition: transform .5s ease; }
        .direksi-card-corp:hover .direksi-photo-corp { transform: scale(1.04); }

        /* Contact */
        .contact-section-corp { padding: 80px 0 40px; background: #ffffff; }
        .contact-container-corp {
          max-width: 1280px; margin: 0 auto; padding: 0 32px;
          display: grid; grid-template-columns: 1.1fr 1fr 1.3fr; gap: 40px; align-items: start;
        }
        .social-link-corp {
          width: 38px; height: 38px; border-radius: 50%; border: 1px solid #1a9de1;
          color: #1a9de1; display: flex; align-items: center; justify-content: center;
          transition: all .25s ease;
        }
        .social-link-corp:hover { background: #1a9de1; color: #ffffff; transform: translateY(-2px); }

        /* Carousel controls */
        .carousel-btn-corp {
          position: absolute; top: 50%; transform: translateY(-50%);
          width: 44px; height: 44px; border-radius: 50%; background: #1a9de1;
          color: white; border: none; font-size: 24px; line-height: 1;
          display: flex; align-items: center; justify-content: center; cursor: pointer;
          z-index: 20; box-shadow: 0 4px 14px rgba(26,157,225,0.4); transition: all .25s ease;
        }
        .carousel-btn-corp:hover { background: #1178b5; transform: translateY(-50%) scale(1.08); }
        .carousel-prev-corp { left: -10px; }
        .carousel-next-corp { right: -10px; }

        @media (max-width: 1024px) {
          .hero-container, .hero-container-corp { grid-template-columns: 1fr; text-align: center; }
          .hero-content { margin: 0 auto; }
          .hero-actions { justify-content: center; }
          .about-container-corp { grid-template-columns: 1fr; }
          .stats-container-corp { grid-template-columns: 1fr; }
          .service-card-corp { flex: 0 0 calc(50% - 12px); }
          .news-card-corp { flex: 0 0 calc(50% - 12px); }
          .portfolio-grid-corp { grid-template-columns: repeat(2, 1fr); }
          .direksi-grid-corp { grid-template-columns: repeat(2, 1fr); }
          .contact-container-corp { grid-template-columns: 1fr; }
        }
        @media (max-width: 768px) {
          .nav-menu-corp { display: none; }
          .service-card-corp { flex: 0 0 100%; }
          .news-card-corp { flex: 0 0 100%; }
          .portfolio-grid-corp { grid-template-columns: 1fr; }
          .direksi-grid-corp { grid-template-columns: 1fr; }
          .stats-grid-corp { grid-template-columns: 1fr; }
        }
      `}),(0,i.jsx)("header",{className:`navbar-corp${e?" scrolled":""}`,id:"navbar",children:(0,i.jsxs)("div",{className:"nav-container-corp",children:[(0,i.jsx)("div",{className:"nav-brand",children:(0,i.jsx)(s(),{href:"#home",children:(0,i.jsx)("img",{src:"/images/danantara.png",onError:e=>{e.currentTarget.src="/images/DANANTARA1.png"},alt:"Danantara Indonesia",className:"logo-danantara-corp"})})}),(0,i.jsx)("nav",{className:"nav-menu-corp",children:(0,i.jsx)("ul",{style:{display:"flex",alignItems:"center",gap:6,listStyle:"none"},children:[{label:"Home",href:"home",children:[]},{label:"Profil",href:"#",children:[{label:"Tentang Kami",href:"about"},{label:"Visi Misi",href:"https://plnnusadaya.co.id/visi-misi"},{label:"Tata Nilai",href:"https://plnnusadaya.co.id/tata-nilai"},{label:"Profil Direksi",href:"direksi"},{label:"Profil Komisaris",href:"https://plnnusadaya.co.id/profil-komisaris"},{label:"Anak Perusahaan",href:"https://plnnusadaya.co.id/anak-perusahaan"},{label:"Wilayah Kerja",href:"https://plnnusadaya.co.id/wilayah-kerja"},{label:"Company Profile",href:"https://plnnusadaya.co.id/company-profile"},{label:"Kontak Kami",href:"contact"}]},{label:"Tata Kelola",href:"#",children:[{label:"Board Manual",href:"https://plnnusadaya.co.id/board-manual"},{label:"Code of Conduct",href:"https://plnnusadaya.co.id/code-of-conduct"},{label:"Pedoman GCG",href:"https://plnnusadaya.co.id/gcg"},{label:"Annual Report",href:"https://plnnusadaya.co.id/annual-report"},{label:"Sustainability Report",href:"https://plnnusadaya.co.id/sustainability-report"},{label:"Risk Management",href:"https://plnnusadaya.co.id/risk-management"},{label:"Whistle Blowing System",href:"https://plnnusadaya.co.id/wbs"}]},{label:"Layanan",href:"#",children:[{label:"Asset Management Contract",href:"services"},{label:"Drups",href:"https://plnnusadaya.co.id/drups"},{label:"ListriQu",href:"https://plnnusadaya.co.id/listriqu"}]},{label:"Laporan Manajemen",href:"#",children:[{label:"Laporan Triwulan I",href:"#"},{label:"Semester I",href:"#"},{label:"Triwulan III",href:"#"},{label:"Semester II",href:"#"}]},{label:"Pengadaan",href:"#",children:[{label:"Info Pengadaan",href:"https://plnnusadaya.co.id/info-pengadaan"},{label:"Pedoman Pengadaan",href:"https://plnnusadaya.co.id/pedoman-pengadaan"}]},{label:"Media",href:"#",children:[{label:"Berita PLN Nusa Daya",href:"news"},{label:"Portal Artikel & Blog",href:"/berita"}]},{label:"Privacy Policy",href:"https://plnnusadaya.co.id/privacy-policy",children:[]}].map(e=>(0,i.jsxs)("li",{className:`nav-item-corp relative${o===e.href?" active":""}`,children:[e.children.length>0?(0,i.jsxs)("span",{className:"nav-link-corp",children:[e.label," ",(0,i.jsx)("span",{style:{fontSize:11,opacity:.7},children:"▾"})]}):(0,i.jsx)("span",{onClick:()=>B(e.label,e.href),className:"nav-link-corp",children:e.label}),e.children.length>0&&(0,i.jsx)("ul",{className:"dropdown-corp",style:{listStyle:"none"},children:e.children.map(e=>(0,i.jsx)("li",{children:(0,i.jsx)("span",{onClick:()=>B(e.label,e.href),style:{display:"block",padding:"8px 14px",fontSize:13,color:"#334155",borderRadius:6,cursor:"pointer"},children:e.label})},e.label))})]},e.label))})}),(0,i.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:16},children:[(0,i.jsx)("a",{href:"https://plnnusadaya.co.id/aku-jago",target:"_blank",rel:"noreferrer",title:"Aku Jago",children:(0,i.jsx)("img",{src:"/images/aku-jago.png",alt:"Aku Jago",className:"logo-akujago-corp"})}),(0,i.jsx)("img",{src:"/images/logo/LOGO-PLN.png",onError:e=>{e.currentTarget.src="/images/plnt.png"},alt:"PLN Nusa Daya",className:"logo-pln-corp"})]})]})}),(0,i.jsx)(d,{onGetStarted:()=>R("about")}),(0,i.jsxs)("section",{className:"about-section-corp",id:"about",children:[(0,i.jsx)("div",{className:"section-header-corp",children:(0,i.jsxs)("div",{className:"section-title-wrapper-corp",children:[(0,i.jsx)("span",{className:"section-line-corp"}),(0,i.jsx)("h2",{className:"section-title-corp",children:"ABOUT US"}),(0,i.jsx)("span",{className:"section-line-corp"})]})}),(0,i.jsxs)("div",{className:"about-container-corp",children:[(0,i.jsx)("div",{className:"about-text-corp",children:(0,i.jsx)("p",{children:"PT Pelayanan Listrik Nasional Nusa Daya (PT PLN Nusa Daya) atau disingkat PLN ND adalah salah satu Anak Perusahaan PT PLN (Persero) yang berkedudukan di Pulau Tarakan Provinsi Kalimantan Utara, dibentuk berdasarkan Surat Keputusan Direksi PT PLN (Persero) No. 258-1/010/DIR/2003 tanggal 17 Oktober 2003 dan disahkan berdasarkan Akta Notaris H Haryanto SH, MBA No. 18 tanggal 15 Desember 2003. PT PLN Nusa Daya telah menjalankan bisnis penyediaan dan penjualan tenaga listrik yang terintegrasi mulai dari tahun 2003 sampai dengan tahun 2016 dengan menerapkan tarif regional yang berbeda dari tarif dasar listrik (TDL) Nasional di Pulau Tarakan."})}),(0,i.jsxs)("div",{className:"about-text-corp",children:[(0,i.jsx)("p",{children:"Mengantisipasi dinamika bisnis PT PLN Nusa Daya, maka berdasarkan Keputusan RUPS Sirkuler No. 109/DIR/2016 pada tanggal 30 November 2016 dan berdasarkan keputusan RUPS tersebut yang dikukuhkan dalam Anggaran Dasar PT PLN Nusa Daya Perubahan No. 5 tanggal 7 Desember 2016, pemegang saham menugaskan PT PLN Nusa Daya untuk melaksanakan pengelolaan Jasa Operasi & Pemeliharaan Pembangkit (KIT), Jasa Operasi & Pemeliharaan Transmisi, Jasa Operasi & Pemeliharaan Distribusi (YANTEK) serta Pelayanan Pelanggan (BILLMAN) di Wilayah Indonesia Timur yang mencakup Kalimantan, Sulawesi, Nusa Tenggara, Maluku dan Papua, dengan Kedudukan Kantor pusat PT PLN Nusa Daya di Kota Balikpapan Kalimantan Timur."}),(0,i.jsx)("a",{href:"https://plnnusadaya.co.id/#about",target:"_blank",rel:"noreferrer",style:{display:"inline-flex",alignItems:"center",marginTop:24,padding:"10px 32px",border:"1.5px solid var(--primary)",borderRadius:9999,fontWeight:600,fontSize:14,color:"var(--primary)",textDecoration:"none"},children:"Learn More"})]})]})]}),(0,i.jsx)("section",{className:"stats-section-corp",id:"stats",ref:D,children:(0,i.jsxs)("div",{className:"stats-container-corp",children:[(0,i.jsx)("div",{children:(0,i.jsx)("img",{src:"/images/hero-img3.png",alt:"PLN Nusa Daya Power Assets",style:{width:"100%",maxWidth:460,height:"auto",display:"block",margin:"0 auto",filter:"drop-shadow(0 14px 28px rgba(0,0,0,0.06))"}})}),(0,i.jsxs)("div",{className:"stats-grid-corp",children:[(0,i.jsxs)("div",{className:"stat-item-corp",children:[(0,i.jsx)("div",{className:"stat-icon-corp",children:(0,i.jsx)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",style:{width:28,height:28},children:(0,i.jsx)("path",{d:"M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"})})}),(0,i.jsxs)("div",{children:[(0,i.jsx)("div",{className:"stat-number-corp",children:C.projects.toLocaleString("id-ID")}),(0,i.jsx)("div",{className:"stat-label-corp",children:"Total Proyek"})]})]}),(0,i.jsxs)("div",{className:"stat-item-corp",children:[(0,i.jsx)("div",{className:"stat-icon-corp",children:(0,i.jsxs)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",style:{width:28,height:28},children:[(0,i.jsx)("path",{d:"M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"}),(0,i.jsx)("circle",{cx:"9",cy:"7",r:"4"}),(0,i.jsx)("path",{d:"M23 21v-2a4 4 0 0 0-3-3.87"}),(0,i.jsx)("path",{d:"M16 3.13a4 4 0 0 1 0 7.75"})]})}),(0,i.jsxs)("div",{children:[(0,i.jsx)("div",{className:"stat-number-corp",children:C.workers.toLocaleString("id-ID")}),(0,i.jsx)("div",{className:"stat-label-corp",children:"Tenaga Kerja"})]})]}),(0,i.jsxs)("div",{className:"stat-item-corp",children:[(0,i.jsx)("div",{className:"stat-icon-corp",children:(0,i.jsx)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",style:{width:28,height:28},children:(0,i.jsx)("path",{d:"M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5m-4 0h4"})})}),(0,i.jsxs)("div",{children:[(0,i.jsx)("div",{className:"stat-number-corp",children:C.units.toLocaleString("id-ID")}),(0,i.jsx)("div",{className:"stat-label-corp",children:"Kantor Unit Pelaksana"})]})]}),(0,i.jsxs)("div",{className:"stat-item-corp",children:[(0,i.jsx)("div",{className:"stat-icon-corp",children:(0,i.jsxs)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",style:{width:28,height:28},children:[(0,i.jsx)("circle",{cx:"12",cy:"8",r:"6"}),(0,i.jsx)("path",{d:"M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"})]})}),(0,i.jsxs)("div",{children:[(0,i.jsx)("div",{className:"stat-number-corp",children:C.years.toLocaleString("id-ID")}),(0,i.jsx)("div",{className:"stat-label-corp",children:"Years of Experience"})]})]})]})]})}),(0,i.jsxs)("section",{className:"services-section-corp",id:"services",children:[(0,i.jsxs)("div",{className:"section-header-corp",children:[(0,i.jsxs)("div",{className:"section-title-wrapper-corp",children:[(0,i.jsx)("span",{className:"section-line-corp"}),(0,i.jsx)("h2",{className:"section-title-corp",children:"SERVICES"}),(0,i.jsx)("span",{className:"section-line-corp"})]}),(0,i.jsx)("p",{className:"section-subtitle-corp",children:"Solusi Komprehensif Operasi, Pemeliharaan Aset, dan Inovasi Ketenagalistrikan Terintegrasi"})]}),(0,i.jsxs)("div",{style:{maxWidth:1340,margin:"0 auto",padding:"0 20px",position:"relative"},children:[(0,i.jsx)("button",{className:"carousel-btn-corp carousel-prev-corp",onClick:()=>k(e=>Math.max(0,e-1)),"aria-label":"Previous",children:"‹"}),(0,i.jsx)("div",{style:{width:"100%",overflow:"hidden",padding:"16px 0"},children:(0,i.jsx)("div",{style:{display:"flex",gap:26,transition:"transform .45s cubic-bezier(.4,0,.2,1)",transform:`translateX(-${311*b}px)`},children:K.map((e,a)=>(0,i.jsxs)("div",{className:"service-card-corp scroll-reveal",children:[(0,i.jsxs)("div",{className:"service-card-header-corp",children:[(0,i.jsx)("span",{className:"service-badge-corp",children:e.badge}),(0,i.jsx)("span",{className:"service-num-corp",children:e.num})]}),(0,i.jsx)("div",{className:"service-icon-box-corp",children:e.icon}),(0,i.jsx)("h3",{className:"service-title-corp",children:e.title}),(0,i.jsx)("p",{className:"service-desc-corp",children:e.desc}),(0,i.jsx)("ul",{className:"service-features-corp",children:e.features.map((e,a)=>(0,i.jsxs)("li",{className:"service-feature-item-corp",children:[(0,i.jsx)("span",{className:"service-check-icon-corp",children:(0,i.jsx)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",children:(0,i.jsx)("polyline",{points:"20 6 9 17 4 12"})})}),e]},a))}),(0,i.jsxs)("a",{href:e.link,target:"_blank",rel:"noreferrer",className:"service-action-link-corp",children:["Pelajari Layanan ",(0,i.jsx)("span",{children:"→"})]})]},a))})}),(0,i.jsx)("button",{className:"carousel-btn-corp carousel-next-corp",onClick:()=>k(e=>e>=2?0:e+1),"aria-label":"Next",children:"›"})]}),(0,i.jsx)("div",{style:{display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginTop:28},children:Array.from({length:3}).map((e,a)=>(0,i.jsx)("span",{onClick:()=>k(a),style:{width:b===a?28:10,height:10,borderRadius:9999,background:b===a?"#1a9de1":"#cbd5e1",cursor:"pointer",transition:"all .3s ease"}},a))})]}),(0,i.jsxs)("section",{className:"news-section-corp",id:"news",children:[(0,i.jsxs)("div",{className:"section-header-corp",style:{display:"flex",flexDirection:"column",alignItems:"center",gap:14},children:[(0,i.jsxs)("div",{className:"section-title-wrapper-corp",children:[(0,i.jsx)("span",{className:"section-line-corp"}),(0,i.jsx)("h2",{className:"section-title-corp",children:"LATEST NEWS"}),(0,i.jsx)("span",{className:"section-line-corp"})]}),(0,i.jsx)("p",{className:"section-subtitle-corp",style:{margin:0},children:"Kabar Terkini, Agenda Korporasi, dan Informasi Strategis Ketenagalistrikan PT PLN Nusa Daya"}),(0,i.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap",justifyContent:"center",marginTop:4},children:[(0,i.jsxs)(s(),{href:"/admin/articles",style:{display:"inline-flex",alignItems:"center",gap:7,padding:"8px 20px",borderRadius:9999,fontSize:13,fontWeight:600,background:"#e8f6fd",color:"#1a9de1",border:"1.5px solid #bae6fd",textDecoration:"none",transition:"all .2s ease"},children:[(0,i.jsx)("span",{children:"✏️"})," Tulis / Kelola Berita (Admin)"]}),(0,i.jsx)(s(),{href:"/berita",style:{display:"inline-flex",alignItems:"center",gap:7,padding:"8px 20px",borderRadius:9999,fontSize:13,fontWeight:600,background:"#f8fafc",color:"#475569",border:"1.5px solid #e2e8f0",textDecoration:"none",transition:"all .2s ease"},children:"Lihat Semua Berita →"})]})]}),(0,i.jsxs)("div",{style:{maxWidth:1340,margin:"0 auto",padding:"0 20px",position:"relative"},children:[(0,i.jsx)("button",{className:"carousel-btn-corp carousel-prev-corp",onClick:()=>v(e=>Math.max(0,e-1)),"aria-label":"Previous",children:"‹"}),(0,i.jsx)("div",{style:{width:"100%",overflow:"hidden",padding:"16px 0"},children:(0,i.jsx)("div",{style:{display:"flex",gap:24,transition:"transform .45s cubic-bezier(.4,0,.2,1)",transform:`translateX(-${384*y}px)`},children:S.map((e,a)=>(0,i.jsxs)("div",{className:"news-card-corp scroll-reveal",children:[(0,i.jsx)("div",{className:"news-img-wrapper-corp",children:(0,i.jsx)("img",{src:e.img,alt:e.title,onError:e=>{e.currentTarget.onerror=null,e.currentTarget.src="/images/news-190.jpg"}})}),(0,i.jsxs)("div",{className:"news-content-corp",children:[(0,i.jsx)("span",{className:"news-badge-corp",children:e.category||"BERITA"}),(0,i.jsxs)("div",{className:"news-meta-corp",children:[(0,i.jsxs)("span",{style:{display:"flex",alignItems:"center",gap:5},children:[(0,i.jsxs)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",style:{width:13,height:13},children:[(0,i.jsx)("rect",{x:"3",y:"4",width:"18",height:"18",rx:"2",ry:"2"}),(0,i.jsx)("line",{x1:"16",y1:"2",x2:"16",y2:"6"}),(0,i.jsx)("line",{x1:"8",y1:"2",x2:"8",y2:"6"}),(0,i.jsx)("line",{x1:"3",y1:"10",x2:"21",y2:"10"})]}),e.date]}),(0,i.jsx)("span",{children:"•"}),(0,i.jsxs)("span",{style:{display:"flex",alignItems:"center",gap:5},children:[(0,i.jsxs)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",style:{width:13,height:13},children:[(0,i.jsx)("path",{d:"M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"}),(0,i.jsx)("circle",{cx:"12",cy:"7",r:"4"})]}),e.author]})]}),(0,i.jsx)("h3",{className:"news-title-corp",onClick:()=>N(e),style:{cursor:"pointer"},children:e.title}),(0,i.jsx)("p",{className:"news-excerpt-corp",children:e.excerpt}),(0,i.jsxs)("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:"auto",paddingTop:14,borderTop:"1px solid #f1f5f9"},children:[(0,i.jsxs)("button",{onClick:()=>N(e),className:"news-read-btn-corp",children:["Baca Selengkapnya ",(0,i.jsx)("span",{children:"→"})]}),e.href&&e.href.startsWith("http")&&(0,i.jsx)("a",{href:e.href,target:"_blank",rel:"noreferrer",style:{fontSize:12,color:"#94a3b8",textDecoration:"none"},title:"Buka sumber resmi PLN Nusa Daya",children:"\uD83C\uDF10 Sumber"})]})]})]},e.id||a))})}),(0,i.jsx)("button",{className:"carousel-btn-corp carousel-next-corp",onClick:()=>v(e=>e>=M?0:e+1),"aria-label":"Next",children:"›"})]})]}),(0,i.jsxs)("section",{className:"portfolio-section-corp",id:"portfolio",children:[(0,i.jsx)("div",{className:"section-header-corp",children:(0,i.jsxs)("div",{className:"section-title-wrapper-corp",children:[(0,i.jsx)("span",{className:"section-line-corp"}),(0,i.jsx)("h2",{className:"section-title-corp",children:"PORTOFOLIO"}),(0,i.jsx)("span",{className:"section-line-corp"})]})}),(0,i.jsx)("div",{style:{display:"flex",alignItems:"center",justifyContent:"center",gap:12,flexWrap:"wrap",marginBottom:40},children:[{id:"all",label:"ALL"},{id:"pembangkit",label:"PEMBANGKIT"},{id:"transmisi",label:"TRANSMISI"},{id:"distribusi",label:"DISTRIBUSI"},{id:"pelayanan",label:"PELAYANAN PELANGGAN"},{id:"beyond",label:"BEYOND KWH"}].map(e=>(0,i.jsx)("button",{onClick:()=>g(e.id),className:`filter-btn-corp${u===e.id?" active":""}`,children:e.label},e.id))}),(0,i.jsx)("div",{className:"portfolio-grid-corp",children:W.map((e,a)=>(0,i.jsxs)("div",{className:"portfolio-item-corp scroll-reveal",children:[(0,i.jsx)("img",{src:e.img,alt:e.label}),(0,i.jsx)("div",{className:"portfolio-overlay-corp",children:(0,i.jsx)("span",{style:{color:"white",fontSize:14,fontWeight:600},children:e.label})})]},a))})]}),(0,i.jsxs)("section",{className:"direksi-section-corp",id:"direksi",children:[(0,i.jsx)("div",{className:"section-header-corp",children:(0,i.jsxs)("div",{className:"section-title-wrapper-corp",children:[(0,i.jsx)("span",{className:"section-line-corp"}),(0,i.jsx)("h2",{className:"section-title-corp",children:"PROFIL DIREKSI"}),(0,i.jsx)("span",{className:"section-line-corp"})]})}),(0,i.jsx)("div",{className:"direksi-grid-corp",children:[{name:"Agung Nugraha",title:"DIREKTUR UTAMA",img:"/images/agung-nugraha.jpg"},{name:"Herry Ristiawan",title:"DIREKTUR KEUANGAN, MANAJEMEN RISIKO, DAN HUMAN CAPITAL",img:"/images/herry-ristiawan.png"},{name:"Chaidar Syaifullah",title:"DIREKTUR OPERASI DAN PENGEMBANGAN USAHA",img:"/images/chaidar-syaifullah.png"}].map(e=>(0,i.jsxs)("div",{className:"direksi-card-corp scroll-reveal",children:[(0,i.jsx)("div",{className:"direksi-photo-wrapper-corp",children:(0,i.jsx)("img",{src:e.img,alt:e.name,className:"direksi-photo-corp",onError:e=>{e.currentTarget.onerror=null,e.currentTarget.src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='500' viewBox='0 0 400 500'%3E%3Crect width='400' height='500' fill='%23f1f5f9'/%3E%3Ccircle cx='200' cy='180' r='70' fill='%23cbd5e1'/%3E%3Cpath d='M100 420 C100 310, 300 310, 300 420 Z' fill='%23cbd5e1'/%3E%3C/svg%3E"}})}),(0,i.jsxs)("div",{style:{padding:"22px 18px 24px",textAlign:"center",background:"#ffffff",flexGrow:1,display:"flex",flexDirection:"column",justifyContent:"center"},children:[(0,i.jsx)("h3",{style:{fontSize:18,fontWeight:800,color:"#1a1a2e",marginBottom:6},children:e.name}),(0,i.jsx)("p",{style:{fontSize:11.5,fontWeight:600,color:"#64748b",letterSpacing:.5,lineHeight:1.5,textTransform:"uppercase"},children:e.title})]})]},e.name))})]}),(0,i.jsxs)("section",{className:"contact-section-corp",id:"contact",children:[(0,i.jsx)("div",{className:"section-header-corp",children:(0,i.jsxs)("div",{className:"section-title-wrapper-corp",children:[(0,i.jsx)("span",{className:"section-line-corp"}),(0,i.jsx)("h2",{className:"section-title-corp",children:"CONTACT US"}),(0,i.jsx)("span",{className:"section-line-corp"})]})}),(0,i.jsxs)("div",{className:"contact-container-corp",children:[(0,i.jsxs)("div",{children:[(0,i.jsxs)("h3",{style:{fontSize:22,fontWeight:800,color:"#1a1a2e",lineHeight:1.3,marginBottom:14},children:["PT Pelayanan Listrik",(0,i.jsx)("br",{}),"Nasional Nusa Daya"]}),(0,i.jsx)("p",{style:{fontSize:14,color:"#64748b",lineHeight:1.7,marginBottom:24},children:"Perusahaan Pengelola Aset Ketenagalistrikan Terkemuka di Wilayah Tengah dan Timur Indonesia dan tumbuh berkelanjutan"}),(0,i.jsx)("div",{style:{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"},children:[{label:"Instagram",svg:(0,i.jsx)("svg",{viewBox:"0 0 24 24",fill:"currentColor",style:{width:17,height:17},children:(0,i.jsx)("path",{d:"M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"})})},{label:"X",svg:(0,i.jsx)("svg",{viewBox:"0 0 24 24",fill:"currentColor",style:{width:17,height:17},children:(0,i.jsx)("path",{d:"M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"})})},{label:"Facebook",svg:(0,i.jsx)("svg",{viewBox:"0 0 24 24",fill:"currentColor",style:{width:17,height:17},children:(0,i.jsx)("path",{d:"M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"})})},{label:"TikTok",svg:(0,i.jsx)("svg",{viewBox:"0 0 24 24",fill:"currentColor",style:{width:17,height:17},children:(0,i.jsx)("path",{d:"M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.01a8.16 8.16 0 004.77 1.52V7.08a4.85 4.85 0 01-1-.39z"})})},{label:"YouTube",svg:(0,i.jsx)("svg",{viewBox:"0 0 24 24",fill:"currentColor",style:{width:17,height:17},children:(0,i.jsx)("path",{d:"M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"})})},{label:"LinkedIn",svg:(0,i.jsx)("svg",{viewBox:"0 0 24 24",fill:"currentColor",style:{width:17,height:17},children:(0,i.jsx)("path",{d:"M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"})})}].map(e=>(0,i.jsx)("a",{href:"#",className:"social-link-corp","aria-label":e.label,children:e.svg},e.label))})]}),(0,i.jsxs)("div",{children:[(0,i.jsxs)("div",{style:{display:"flex",alignItems:"flex-start",gap:14,marginBottom:20,fontSize:14,color:"#334155",lineHeight:1.6},children:[(0,i.jsx)("div",{style:{width:38,height:38,borderRadius:"50%",background:"#e8f6fd",color:"#1a9de1",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0},children:(0,i.jsxs)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",style:{width:18,height:18},children:[(0,i.jsx)("path",{d:"M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"}),(0,i.jsx)("circle",{cx:"12",cy:"10",r:"3"})]})}),(0,i.jsxs)("div",{children:[(0,i.jsx)("p",{children:"Jln. Letjen ZA Maulani RT 41 No 78"}),(0,i.jsx)("p",{children:"Damai Bahagia, Kec.Balikpapan Selatan"}),(0,i.jsx)("p",{children:"Balikpapan - Kalimantan Timur"})]})]}),(0,i.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:14,marginBottom:20,fontSize:14,color:"#334155"},children:[(0,i.jsx)("div",{style:{width:38,height:38,borderRadius:"50%",background:"#e8f6fd",color:"#1a9de1",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0},children:(0,i.jsxs)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",style:{width:18,height:18},children:[(0,i.jsx)("path",{d:"M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"}),(0,i.jsx)("polyline",{points:"22,6 12,13 2,6"})]})}),(0,i.jsx)("p",{children:"plnnd@plnnusadaya.co.id"})]}),(0,i.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:14,fontSize:14,color:"#334155"},children:[(0,i.jsx)("div",{style:{width:38,height:38,borderRadius:"50%",background:"#e8f6fd",color:"#1a9de1",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0},children:(0,i.jsx)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",style:{width:18,height:18},children:(0,i.jsx)("path",{d:"M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.81a19.79 19.79 0 01-3.07-8.63A2 2 0 012 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14h-3.08z"})})}),(0,i.jsx)("p",{children:"Telp (0542) 8975052"})]})]}),(0,i.jsx)("div",{children:h?(0,i.jsxs)("div",{style:{background:"#ecfdf5",border:"1px solid #6ee7b7",borderRadius:12,padding:24,textAlign:"center",color:"#065f46"},children:[(0,i.jsx)("div",{style:{fontSize:32,marginBottom:8},children:"✓"}),(0,i.jsx)("p",{style:{fontWeight:600},children:"Pesan Anda telah terkirim!"}),(0,i.jsx)("p",{style:{fontSize:13,marginTop:4},children:"Tim PLN Nusa Daya akan segera menghubungi Anda."})]}):(0,i.jsxs)("form",{onSubmit:function(e){e.preventDefault(),setTimeout(()=>m(!0),800)},style:{display:"flex",flexDirection:"column",gap:16},children:[(0,i.jsx)("input",{type:"text",placeholder:"Your Name",required:!0,value:x.name,onChange:e=>f({...x,name:e.target.value}),style:{width:"100%",padding:"12px 16px",border:"1px solid #cbd5e1",borderRadius:8,fontSize:14}}),(0,i.jsx)("input",{type:"email",placeholder:"Your Email",required:!0,value:x.email,onChange:e=>f({...x,email:e.target.value}),style:{width:"100%",padding:"12px 16px",border:"1px solid #cbd5e1",borderRadius:8,fontSize:14}}),(0,i.jsx)("input",{type:"text",placeholder:"Subject",required:!0,value:x.subject,onChange:e=>f({...x,subject:e.target.value}),style:{width:"100%",padding:"12px 16px",border:"1px solid #cbd5e1",borderRadius:8,fontSize:14}}),(0,i.jsx)("textarea",{placeholder:"Message",rows:4,required:!0,value:x.message,onChange:e=>f({...x,message:e.target.value}),style:{width:"100%",padding:"12px 16px",border:"1px solid #cbd5e1",borderRadius:8,fontSize:14}}),(0,i.jsx)("button",{type:"submit",style:{alignSelf:"flex-start",padding:"12px 36px",background:"#1a9de1",color:"white",border:"none",borderRadius:9999,fontSize:14,fontWeight:600,cursor:"pointer"},children:"Send Message"})]})})]}),(0,i.jsx)("div",{style:{borderTop:"1px solid #f1f5f9",marginTop:60,paddingTop:28,textAlign:"center",fontSize:13.5,color:"#64748b"},children:(0,i.jsxs)("p",{children:["\xa9 Copyright 2026 ",(0,i.jsx)("strong",{children:"PT Pelayanan Listrik Nasional Nusa Daya"}),". All Rights Reserved"]})})]}),(0,i.jsx)("button",{style:{position:"fixed",bottom:28,right:28,width:44,height:44,borderRadius:8,background:"#1a9de1",color:"white",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 14px rgba(26,157,225,0.4)",opacity:p?1:0,pointerEvents:p?"auto":"none",transition:"all .3s ease",zIndex:99},onClick:()=>window.scrollTo({top:0,behavior:"smooth"}),"aria-label":"Scroll to top",children:(0,i.jsx)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2.5",style:{width:20,height:20},children:(0,i.jsx)("polyline",{points:"18 15 12 9 6 15"})})}),j&&(0,i.jsx)("div",{style:{position:"fixed",inset:0,zIndex:9999,background:"rgba(15, 23, 42, 0.65)",backdropFilter:"blur(6px)",display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"},onClick:()=>w(null),children:(0,i.jsxs)("div",{style:{background:"#ffffff",borderRadius:"18px",maxWidth:"720px",width:"100%",maxHeight:"85vh",overflowY:"auto",boxShadow:"0 25px 60px rgba(0, 0, 0, 0.25)",border:"1px solid #e2e8f0",padding:"36px 32px 32px",position:"relative"},onClick:e=>e.stopPropagation(),children:[(0,i.jsx)("button",{onClick:()=>w(null),style:{position:"absolute",top:20,right:20,width:36,height:36,borderRadius:"50%",background:"#f1f5f9",border:"none",color:"#64748b",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"all .2s"},"aria-label":"Tutup",children:"✕"}),(0,i.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:10,marginBottom:12},children:[(0,i.jsx)("span",{style:{background:"#e0f2fe",color:"#0284c7",fontSize:"11.5px",fontWeight:700,padding:"4px 10px",borderRadius:"6px",textTransform:"uppercase",letterSpacing:"0.5px"},children:j.category}),(0,i.jsx)("span",{style:{background:"#f1f5f9",color:"#475569",fontSize:"11.5px",fontWeight:600,padding:"4px 10px",borderRadius:"6px"},children:j.badge})]}),(0,i.jsx)("h2",{style:{fontSize:"24px",fontWeight:800,color:"#0f172a",lineHeight:1.3,marginBottom:20,borderBottom:"2px solid #f1f5f9",paddingBottom:"14px"},children:j.title}),(0,i.jsx)("div",{style:{display:"flex",flexDirection:"column",gap:"16px",marginBottom:"28px"},children:j.content.map((e,a)=>(0,i.jsx)("div",{style:{display:"flex",alignItems:"flex-start",gap:"12px",background:"#f8fafc",padding:"16px 18px",borderRadius:"10px",borderLeft:"4px solid #1a9de1"},children:(0,i.jsx)("p",{style:{fontSize:"14.5px",color:"#334155",lineHeight:1.7,margin:0},children:e})},a))}),(0,i.jsxs)("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",paddingTop:"16px",borderTop:"1px solid #f1f5f9"},children:[(0,i.jsx)("div",{style:{display:"flex",alignItems:"center",gap:8,fontSize:"12.5px",color:"#64748b"},children:(0,i.jsx)("span",{children:"\uD83D\uDD12 Dokumen Resmi Korporat PT PLN Nusa Daya"})}),(0,i.jsx)("button",{onClick:()=>w(null),style:{padding:"10px 24px",borderRadius:"9999px",background:"#1a9de1",color:"#ffffff",border:"none",fontWeight:600,fontSize:"13.5px",cursor:"pointer"},children:"Tutup Dokumen"})]})]})}),P&&(0,i.jsx)("div",{style:{position:"fixed",inset:0,zIndex:9999,background:"rgba(15, 23, 42, 0.65)",backdropFilter:"blur(6px)",display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"},onClick:()=>N(null),children:(0,i.jsxs)("div",{style:{background:"#ffffff",borderRadius:"18px",maxWidth:"760px",width:"100%",maxHeight:"90vh",overflowY:"auto",boxShadow:"0 25px 60px rgba(0, 0, 0, 0.25)",border:"1px solid #e2e8f0",padding:"0 0 32px 0",position:"relative"},onClick:e=>e.stopPropagation(),children:[(0,i.jsxs)("div",{style:{position:"relative",width:"100%",height:"280px",overflow:"hidden",borderTopLeftRadius:"18px",borderTopRightRadius:"18px",background:"#f1f5f9"},children:[(0,i.jsx)("img",{src:P.img,alt:P.title,style:{width:"100%",height:"100%",objectFit:"cover"},onError:e=>{e.currentTarget.onerror=null,e.currentTarget.src="/images/news-190.jpg"}}),(0,i.jsx)("button",{onClick:()=>N(null),style:{position:"absolute",top:16,right:16,width:38,height:38,borderRadius:"50%",background:"rgba(0, 0, 0, 0.6)",border:"none",color:"#ffffff",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",backdropFilter:"blur(4px)"},"aria-label":"Tutup",children:"✕"})]}),(0,i.jsxs)("div",{style:{padding:"28px 32px 0"},children:[(0,i.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:12,marginBottom:12,flexWrap:"wrap"},children:[(0,i.jsx)("span",{style:{background:"#e0f2fe",color:"#0284c7",fontSize:"11px",fontWeight:700,padding:"4px 10px",borderRadius:"6px",textTransform:"uppercase",letterSpacing:"0.5px"},children:P.category||"BERITA"}),(0,i.jsxs)("span",{style:{fontSize:"12.5px",color:"#64748b"},children:["\uD83D\uDCC5 ",P.date]}),(0,i.jsxs)("span",{style:{fontSize:"12.5px",color:"#64748b"},children:["✍️ ",P.author||"Redaksi PLN Nusa Daya"]})]}),(0,i.jsx)("h2",{style:{fontSize:"24px",fontWeight:800,color:"#0f172a",lineHeight:1.35,marginBottom:18},children:P.title}),(0,i.jsx)("div",{style:{fontSize:"15px",color:"#334155",lineHeight:1.8,whiteSpace:"pre-line",marginBottom:28,borderTop:"1px solid #f1f5f9",paddingTop:18},children:P.content||P.excerpt}),(0,i.jsxs)("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",paddingTop:16,borderTop:"1px solid #f1f5f9"},children:[P.href&&P.href.startsWith("http")?(0,i.jsx)("a",{href:P.href,target:"_blank",rel:"noreferrer",style:{fontSize:"13px",color:"#1a9de1",fontWeight:600,textDecoration:"none"},children:"Buka Halaman Resmi plnnusadaya.co.id ↗"}):(0,i.jsx)("span",{style:{fontSize:"12.5px",color:"#94a3b8"},children:"Publikasi Resmi PLN Nusa Daya"}),(0,i.jsx)("button",{onClick:()=>N(null),style:{padding:"9px 22px",borderRadius:"9999px",background:"#1a9de1",color:"#ffffff",border:"none",fontWeight:600,fontSize:"13px",cursor:"pointer"},children:"Tutup Bacaan"})]})]})]})})]})}n(69586)},80145:(e,a,n)=>{"use strict";n.d(a,{Providers:()=>s});var i=n(45512);n(58009);var t=n(86332),r=n(35997);function s({children:e}){return(0,i.jsx)(t.N,{children:(0,i.jsx)(r.G,{children:e})})}},35997:(e,a,n)=>{"use strict";n.d(a,{G:()=>l,c:()=>o});var i=n(45512),t=n(79334),r=n(58009);let s=(0,r.createContext)(void 0),o=()=>{let e=(0,r.useContext)(s);if(!e)throw Error("useSidebar must be used within a SidebarProvider");return e},l=({children:e})=>{let[a,n]=(0,r.useState)(!0),[o,l]=(0,r.useState)(!1),[d,p]=(0,r.useState)(!1),c=(0,t.usePathname)();return(0,r.useEffect)(()=>{},[]),(0,r.useEffect)(()=>{l(!1)},[c]),(0,i.jsx)(s.Provider,{value:{isExpanded:a,isMobileOpen:o,isHovered:d,toggleSidebar:()=>{n(e=>!e)},toggleMobileSidebar:()=>{l(e=>!e)},setIsHovered:p},children:e})}},86332:(e,a,n)=>{"use strict";n.d(a,{D:()=>o,N:()=>s});var i=n(45512),t=n(58009);let r=(0,t.createContext)(void 0),s=({children:e})=>{let[a,n]=(0,t.useState)("light"),[s,o]=(0,t.useState)(!1);(0,t.useEffect)(()=>{let e="dark"===localStorage.getItem("pln_theme")?"dark":"light";n(e),"dark"===e?document.documentElement.classList.add("dark"):document.documentElement.classList.remove("dark"),o(!0)},[]);let l=e=>{n(e),localStorage.setItem("pln_theme",e),"dark"===e?document.documentElement.classList.add("dark"):document.documentElement.classList.remove("dark")};return(0,i.jsx)(r.Provider,{value:{theme:a,toggleTheme:()=>{l("light"===a?"dark":"light")},setTheme:l},children:e})},o=()=>{let e=(0,t.useContext)(r);if(!e)throw Error("useTheme must be used within a ThemeProvider");return e}},69586:(e,a,n)=>{"use strict";n.d(a,{u:()=>r});var i=n(22204);let t=process.env.NEXT_PUBLIC_API_URL||"http://localhost:8080/api",r=i.A.create({baseURL:t,headers:{"Content-Type":"application/json"},timeout:2e4});r.interceptors.request.use(e=>e),r.interceptors.response.use(e=>e,e=>(e.response?.status,Promise.reject(e)))},71354:(e,a,n)=>{"use strict";n.r(a),n.d(a,{default:()=>s,metadata:()=>r});var i=n(62740);n(61135);var t=n(59157);let r={title:"PLN Nusa Daya - WACB PLTD Logsheet & HAR Portal",description:"Aplikasi Web Enterprise Pelaporan Operasional PLTD & Pemeliharaan Mesin Kalimantan 3",icons:{icon:"/images/logo/LOGO-PLN.png",shortcut:"/images/logo/LOGO-PLN.png",apple:"/images/logo/LOGO-PLN.png"}};function s({children:e}){return(0,i.jsxs)("html",{lang:"id",suppressHydrationWarning:!0,children:[(0,i.jsx)("head",{children:(0,i.jsx)("script",{dangerouslySetInnerHTML:{__html:`
              try {
                if (localStorage.getItem('pln_theme') === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}

              // Auto-recover from chunk load errors when bundles are updated
              window.addEventListener('error', function(e) {
                var msg = (e && e.message) || '';
                if (msg.indexOf('Loading chunk') !== -1 || msg.indexOf('ChunkLoadError') !== -1) {
                  var lastKey = 'pln_last_chunk_reload';
                  var last = parseInt(sessionStorage.getItem(lastKey) || '0', 10);
                  if (Date.now() - last > 3000) {
                    sessionStorage.setItem(lastKey, String(Date.now()));
                    window.location.reload();
                  }
                }
              });
            `}})}),(0,i.jsx)("body",{className:"bg-gray-50 text-gray-900 antialiased min-h-screen dark:bg-gray-950 dark:text-gray-100 transition-colors duration-200",children:(0,i.jsx)(t.Providers,{children:e})})]})}},61377:(e,a,n)=>{"use strict";n.r(a),n.d(a,{default:()=>i});let i=(0,n(46760).registerClientReference)(function(){throw Error("Attempted to call the default export of \"D:\\\\PLN PROJECT\\\\LOGSHEETWEBPLNNUSADAYA\\\\frontend\\\\src\\\\app\\\\page.tsx\" from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"D:\\PLN PROJECT\\LOGSHEETWEBPLNNUSADAYA\\frontend\\src\\app\\page.tsx","default")},59157:(e,a,n)=>{"use strict";n.d(a,{Providers:()=>i});let i=(0,n(46760).registerClientReference)(function(){throw Error("Attempted to call Providers() from the server but Providers is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.")},"D:\\PLN PROJECT\\LOGSHEETWEBPLNNUSADAYA\\frontend\\src\\components\\common\\Providers.tsx","Providers")},70440:(e,a,n)=>{"use strict";n.r(a),n.d(a,{default:()=>t});var i=n(88077);let t=async e=>[{type:"image/x-icon",sizes:"16x16",url:(0,i.fillMetadataSegment)(".",await e.params,"favicon.ico")+""}]},61135:()=>{}};var a=require("../webpack-runtime.js");a.C(e);var n=e=>a(a.s=e),i=a.X(0,[638,916,77,478],()=>n(61804));module.exports=i})();