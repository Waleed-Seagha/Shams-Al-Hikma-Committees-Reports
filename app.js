(function(){
const C=window.SITE_CONFIG,$=id=>document.getElementById(id);
const demo=!C.WEB_APP_URL,cache={};
$("siteTitle").textContent=C.TITLE;document.title=C.TITLE;
const esc=s=>String(s).replace(/[&<>]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[m]));
const dark=h=>{if(!h)return false;const n=parseInt(h.slice(1),16);return ((n>>16)*.3+((n>>8)&255)*.59+(n&255)*.11)<110};

async function listSheets(){
  if(demo){const d=window.DEMO_DATA;d.forEach(s=>cache[s.title]=s);return d.map(s=>s.title)}
  const r=await fetch(C.WEB_APP_URL+"?action=list");
  if(!r.ok)throw new Error("تعذّر الاتصال بالشيت. تأكد من رابط النشر في config.js.");
  return await r.json();
}
async function loadSheet(title){
  if(cache[title])return cache[title];
  const r=await fetch(C.WEB_APP_URL+"?sheet="+encodeURIComponent(title));
  if(!r.ok)throw new Error("تعذّر تحميل الورقة: "+title);
  const s=await r.json();if(s.error)throw new Error("الورقة غير موجودة: "+title);
  return cache[title]=s;
}
// تقسيم الورقة إلى صفحات: كل لجنة في صفحة A4
function blocks(s){
  const st=[];
  s.cells.forEach((row,i)=>{for(let j=0;j<2;j++){const c=row[j]||{};if(c.v&&c.b&&/^(الخطة\s*)?(للجنة|لجنة)\s*:/.test(c.v)){st.push(i);break}}});
  if(!st.length)return[[0,s.cells.length-1]];
  st[0]=0;return st.map((a,k)=>[a,k+1<st.length?st[k+1]-1:s.cells.length-1]);
}
function render(s){
  const tot=s.cols.reduce((a,b)=>a+b,0),out=[];
  blocks(s).forEach(([a,b])=>{
    const skip={},span={};
    s.merges.forEach(([r1,c1,r2,c2])=>{if(r1<a||r1>b)return;r2=Math.min(r2,b);
      span[r1+","+c1]=[r2-r1+1,c2-c1+1];
      for(let r=r1;r<=r2;r++)for(let c=c1;c<=c2;c++)if(r!==r1||c!==c1)skip[r+","+c]=1});
    let h='<section class="page"><table><colgroup>'+s.cols.map(w=>'<col style="width:'+(w/tot*100).toFixed(2)+'%">').join("")+'</colgroup>';
    for(let r=a;r<=b;r++){
      h+='<tr style="height:'+s.rows[r]+'px">';
      for(let c=0;c<6;c++){
        const k=r+","+c;if(skip[k])continue;
        const x=s.cells[r][c]||{},sp=span[k]||[1,1],st=[];
        if(x.bg)st.push("background:"+x.bg);
        const col=x.c||(dark(x.bg)?"#fff":"");if(col)st.push("color:"+col);
        if(x.b)st.push("font-weight:700");
        if(x.sz)st.push("font-size:"+Math.round(x.sz*1.33)+"px");
        st.push("text-align:"+({left:"left",center:"center",right:"right"}[x.h]||"right"));
        h+='<td'+(sp[0]>1?' rowspan='+sp[0]:'')+(sp[1]>1?' colspan='+sp[1]:'')+(x.v||x.bg?'':' class="e"')+' style="'+st.join(";")+'">'+(x.v?esc(x.v):"")+'</td>';
      }
      h+="</tr>";
    }
    out.push(h+"</table></section>");
  });
  return out.join("");
}
async function show(title){
  document.querySelectorAll(".tab").forEach(b=>b.setAttribute("aria-selected",b.dataset.t===title));
  $("pages").innerHTML="";$("status").hidden=false;$("status").textContent="جارٍ التحميل…";
  try{const s=await loadSheet(title);$("pages").innerHTML=render(s);$("status").hidden=true;location.hash=encodeURIComponent(title)}
  catch(e){$("status").textContent=e.message}
}
(async function(){
  try{
    let names=(await listSheets()).filter(n=>demo||!C.HIDE_SHEETS.includes(n));
    names.sort((a,b)=>(b===C.PLAN_SHEET)-(a===C.PLAN_SHEET));
    if(demo){$("notice").hidden=false;$("notice").textContent="نسخة تجريبية: تُعرض بيانات الملف المرفوع. لربط الموقع بغوغل شيت مباشرة اتبع ملف README.";}
    $("tabs").innerHTML=names.map(n=>'<button class="tab" type="button" data-t="'+esc(n)+'">'+esc(n)+'</button>').join("");
    $("tabs").onclick=e=>{if(e.target.dataset.t)show(e.target.dataset.t)};
    const h=decodeURIComponent(location.hash.slice(1));
    show(names.includes(h)?h:names[0]);
  }catch(e){$("status").textContent=e.message}
})();
$("printBtn").onclick=()=>window.print();
})();
