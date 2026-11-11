(()=>{
  'use strict';
  const $=(q,root=document)=>root.querySelector(q);
  const $$=(q,root=document)=>Array.from(root.querySelectorAll(q));
  const lang=document.documentElement.lang==='en'?'en':'it';
  const navToggle=$('[data-nav-toggle]'),nav=$('[data-nav]');
  if(navToggle&&nav){navToggle.addEventListener('click',()=>{const expanded=navToggle.getAttribute('aria-expanded')==='true';navToggle.setAttribute('aria-expanded',String(!expanded));nav.classList.toggle('is-open',!expanded);});$$('a',nav).forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('is-open');navToggle.setAttribute('aria-expanded','false')}));document.addEventListener('keydown',e=>{if(e.key==='Escape'){nav.classList.remove('is-open');navToggle?.setAttribute('aria-expanded','false');}})}
  const fmt=new Intl.NumberFormat(lang==='it'?'it-IT':'en-US',{maximumFractionDigits:0});
  const money=new Intl.NumberFormat(lang==='it'?'it-IT':'en-US',{style:'currency',currency:'EUR',maximumFractionDigits:0});
  const inputs=['steam','hours','price','efficiency','target'].map(id=>$('#calc-'+id));
  const gasUnit=$('#calc-unit'),gasLHV=$('#calc-lhv'),gasNote=$('#gas-market-note'),gasInput=$('#calc-price');
  const ARERA_URL='https://www.arera.it/area-operatori/prezzi-e-tariffe/valore-cmemm-vulnerabili';
  let pcsGJPerSmc=0.03852,gasUserEdited=false;
  const pcsKWh=()=>pcsGJPerSmc*1000/3.6;
  const factor=()=>pcsGJPerSmc/3.6;
  function localized(value,decimals){return Number(value).toLocaleString(lang==='it'?'it-IT':'en-US',{minimumFractionDigits:decimals,maximumFractionDigits:decimals})}
  function updateCalc(){
    if(inputs.some(x=>!x))return;
    const [steam,hours,price,efficiency,target]=inputs.map(x=>Number(x.value));
    const lhv=Number(gasLHV?.value),smc=gasUnit?.value==='smc';
    const valid=Number.isFinite(steam)&&steam>0&&steam<=100000&&hours>0&&hours<=8760
      &&Number.isFinite(price)&&price>=0&&price<=(smc?10:1000)
      &&Number.isFinite(lhv)&&lhv>=8&&lhv<=11&&efficiency>=40&&efficiency<100&&target>40&&target<=99;
    // ARERA quotes gas on the GCV/PCS basis. Standard boiler efficiencies are LHV/PCI.
    // Convert the selected price into €/MWh_LHV for consistent thermal calculations.
    const euroPerMWhPCS=smc?price/factor():price;
    const euroPerMWhPCI=euroPerMWhPCS*pcsKWh()/lhv;
    const usefulHeatMWh=steam*hours*2.4/3600;
    const savedMWh=valid&&target>efficiency?usefulHeatMWh*(100/efficiency-100/target):0;
    const savedEuro=savedMWh*euroPerMWhPCI;
    const currentFuel=valid?usefulHeatMWh*100/efficiency:0;
    $('#calc-euro').textContent=valid?money.format(savedEuro):'—';
    $('#calc-energy').textContent=valid?fmt.format(savedMWh)+' MWh':'—';
    $('#calc-pct').textContent=valid&&currentFuel?localized(savedMWh/currentFuel*100,1)+'%':'—';
    const meter=$('#calc-meter');if(meter)meter.style.width=(valid&&currentFuel?Math.min(100,Math.max(0,savedMWh/currentFuel*100*4)):0)+'%';
    const warn=$('#calc-warning');if(warn)warn.textContent=!valid?(lang==='it'?'Controlla i valori inseriti e il PCI del gas (8–11 kWh/Smc).':'Check the input values and gas LHV (8–11 kWh/Smc).')
      :target<=efficiency?(lang==='it'?'Il rendimento obiettivo deve superare quello attuale.':'Target efficiency must exceed current efficiency.'):'';
  }
  if(inputs.every(Boolean)){
    inputs.forEach(input=>input.addEventListener('input',()=>{if(input===gasInput)gasUserEdited=true;updateCalc()}));
    gasLHV?.addEventListener('input',updateCalc);
    gasUnit?.addEventListener('change',()=>{
      if(!gasInput)return;
      const nowSmc=gasUnit.value==='smc';
      const current=Number(gasInput.value);
      gasInput.value=String(Number((nowSmc?current*factor():current/factor()).toFixed(nowSmc?5:3)));
      gasInput.max=nowSmc?'10':'1000';
      gasInput.step=nowSmc?'0.00001':'0.01';
      gasUserEdited=true;updateCalc();
    });
    updateCalc();
    // The source is a documented monthly PSV-based benchmark, not an intraday quotation.
    fetch('/gas-price.php',{cache:'no-store'}).then(res=>{if(!res.ok)throw Error('gas benchmark unavailable');return res.json()}).then(data=>{
      const value=Number(data.eur_mwh),sourceFactor=Number(data.pcs_gj_per_smc)/3.6;
      if(!Number.isFinite(value)||value<0||value>500||!/^20\d{2}-(0[1-9]|1[0-2])$/.test(data.reference_month)||Math.abs(sourceFactor-0.0107)>0.001)throw Error('invalid benchmark');
      pcsGJPerSmc=Number(data.pcs_gj_per_smc);
      if(!gasUserEdited&&gasInput){
        gasInput.value=String(Number((gasUnit?.value==='smc'?value*factor():value).toFixed(gasUnit?.value==='smc'?6:4)));
      }
      if(gasNote){
        const [year,month]=data.reference_month.split('-').map(Number);
        const monthLabel=new Intl.DateTimeFormat(lang==='it'?'it-IT':'en-GB',{month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(Date.UTC(year,month-1,1)));
        const intro=lang==='it'?'Riferimento ARERA CMEM,m (media mensile PSV), ':'ARERA CMEM,m benchmark (monthly PSV average), ';
        const detail=lang==='it'?'. Solo materia prima, non prezzo industriale tutto compreso né quotazione in tempo reale. ':'. Commodity only, not a complete industrial tariff or a live intraday quote. ';
        const link=document.createElement('a');link.href=ARERA_URL;link.textContent=lang==='it'?'Fonte ARERA':'ARERA source';link.target='_blank';link.rel='noopener noreferrer';
        gasNote.replaceChildren(document.createTextNode(intro+monthLabel+' · '+localized(value,2)+' €/MWh PCS · '+localized(value*factor(),4)+' €/Smc'+detail),link);
      }
      updateCalc();
    }).catch(()=>{/* Keep the transparent, dated fallback benchmark visible. */});
  }
  const items={
    steam:{it:{title:'Generazione vapore',description:'Caldaie a tubi da fumo, combustione, accessori di centrale e integrazione del processo. La scelta corretta parte dal profilo di carico, non dal solo dato di targa.',tags:['Bilanci energetici','PED / ASME','Specifiche tecniche'],labels:['BRUCIATORE','GENERATORE DI VAPORE','ECONOMIZZATORE']},en:{title:'Steam generation',description:'Fire-tube boilers, combustion, plant auxiliaries and process integration. Sound decisions begin with the load profile, not the nameplate alone.',tags:['Energy balances','PED / ASME','Technical specifications'],labels:['BURNER','STEAM BOILER','ECONOMIZER']}} ,
    biomass:{it:{title:'Biomassa e combustibili alternativi',description:'Dalla qualità del combustibile alla griglia mobile, al sistema fumi e alle logiche di controllo: una visione di impianto, non di singola macchina.',tags:['Analisi combustibile','Combustione','Trattamento fumi'],labels:['COMBUSTIBILE','FORNO / GRIGLIA','SISTEMA FUMI']},en:{title:'Biomass & alternative fuels',description:'From fuel quality to moving-grate combustion, flue-gas treatment and automation: a plant-wide view rather than isolated equipment.',tags:['Fuel analysis','Combustion','Flue-gas treatment'],labels:['FUEL','FURNACE / GRATE','FLUE GAS']}} ,
    recovery:{it:{title:'Recupero di calore',description:'Economizzatori e scambiatori progettati attorno ai dati reali del processo, con attenzione a sporcamento, corrosione, condensa e manutenzione.',tags:['Bilancio termico','Materiali','Payback'],labels:['GAS CALDI','SCAMBIATORE','CALORE UTILE']},en:{title:'Heat recovery',description:'Economizers and heat exchangers sized around real process data, with fouling, corrosion, condensation and maintenance taken into account.',tags:['Heat balance','Materials','Payback'],labels:['HOT GAS','HEAT EXCHANGER','USEFUL HEAT']}}
  };
  function schematicDetails(key){
    const ink='#bad0d2',steel='#7c9ca4',warm='#e99975';
    if(key==='steam')return '<g fill="none" stroke-linecap="round" stroke-linejoin="round">'
      +'<g stroke="'+steel+'" opacity=".72" stroke-width="2.2"><path d="M237 112h147M237 132h147M237 153h147M237 175h147M237 198h147"/><path d="M445 116v102M461 121v93"/></g>'
      +'<g stroke="'+ink+'" stroke-width="2"><path d="M260 93v-22h70"/><circle cx="333" cy="71" r="14" fill="#253f48"/><path d="M332 70l8-8"/></g>'
      +'<g stroke="'+warm+'" stroke-width="2"><path d="M258 93v-8M279 93v-8M300 93v-8M322 93v-8M344 93v-8"/></g>'
      +'<g fill="#263f4a" stroke="'+ink+'" stroke-width="1.4"><circle cx="155" cy="157" r="9"/><circle cx="181" cy="157" r="9"/><circle cx="172" cy="186" r="5"/></g>'
      +'<g stroke="'+ink+'" stroke-width="1.2"><path d="M501 99h82M501 216h82M534 99v117M559 99v117"/></g></g>';
    if(key==='biomass')return '<g fill="none" stroke-linecap="round" stroke-linejoin="round">'
      +'<path d="M115 112h71M118 128h66M121 145h61" stroke="'+steel+'" stroke-width="1.7"/>'
      +'<g stroke="'+warm+'" stroke-width="2"><path d="M180 200l12 9 12-9 12 9 12-9 12 9 12-9"/><path d="M296 224h141" stroke-dasharray="9 7"/></g>'
      +'<g stroke="'+ink+'" stroke-width="2"><path d="M300 233h125m-125 0l14-10m19 10l14-10m19 10l14-10m19 10l14-10M366 98v-28h44M455 214v34h-27"/></g>'
      +'<rect x="422" y="248" width="54" height="23" rx="2" fill="#263f48" stroke="'+steel+'" stroke-width="1.4"/>'
      +'<g stroke="'+warm+'" stroke-width="2.3"><path d="M540 128h52M540 171h52M540 215h52"/></g></g>';
    return '<g fill="none" stroke-linecap="round" stroke-linejoin="round">'
      +'<g stroke="'+ink+'" opacity=".55" stroke-width="1.6"><path d="M249 73h202M249 230h202M255 84h190M255 219h190"/></g>'
      +'<g stroke="'+steel+'" opacity=".8" stroke-width="1.5"><path d="M286 67v168M333 67v168M380 67v168M427 67v168"/></g>'
      +'<g stroke="'+warm+'" stroke-width="2.6"><path d="M204 145h23M470 105h42M470 195h42"/></g>'
      +'<g fill="#263f48" stroke="'+ink+'" stroke-width="1.5"><circle cx="603" cy="75" r="9"/><circle cx="603" cy="225" r="9"/></g></g>';
  }
  function diagram(key,labels){
    const basic=`<defs><linearGradient id="metal" x1="0" x2="1"><stop stop-color="#192f39"/><stop offset=".52" stop-color="#415c66"/><stop offset="1" stop-color="#1a303a"/></linearGradient><pattern id="dots" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r=".9" fill="#657e85" opacity=".3"/></pattern></defs><rect x="0" y="0" width="680" height="310" fill="url(#dots)" opacity=".28"/>`;
    const axis=`<g font-family="monospace" font-size="10" fill="#91abb3" letter-spacing="1.2"><text x="10" y="20">EG/THERMAL // ${key.toUpperCase()}</text><text x="10" y="296">CONCEPT / NOT TO SCALE</text></g>`;
    let center='';
    if(key==='steam'){center=`<rect x="165" y="93" width="276" height="130" rx="63" fill="url(#metal)" stroke="#a7c2c8" stroke-width="2"/><ellipse cx="177" cy="158" rx="43" ry="65" fill="#213942" stroke="#b3c4c6" stroke-width="2"/><rect x="82" y="137" width="70" height="45" rx="5" fill="#b95b3b" stroke="#ec926f" stroke-width="2"/><path d="M441 160h52v-72h95v140H493v-68" stroke="#99b4bb" stroke-width="13" fill="none"/><rect x="508" y="108" width="65" height="100" fill="#233e46" stroke="#9fc0c7" stroke-width="2"/><path d="M521 125h40M521 143h40M521 161h40M521 179h40" stroke="#eb9472" stroke-width="2"/><path d="M150 157h40M590 154h55" class="console-line" stroke-width="4"/>`}
    if(key==='biomass'){center=`<path d="M101 70h100l-10 85h-80z" fill="url(#metal)" stroke="#aac3c6" stroke-width="2"/><path d="M151 156v48h110" stroke="#a1b6be" stroke-width="14" fill="none"/><path d="M270 98h185v129H270z" fill="#203740" stroke="#afc9ca" stroke-width="2"/><path d="M292 214l30-47 28 32 33-50 36 60" stroke="#ec8559" stroke-width="8" fill="none"/><path d="M455 146h65v-75h92v157h-92v-82" stroke="#819aa3" stroke-width="14" fill="none"/><path d="M539 104h52M539 132h52M539 160h52M539 188h52" stroke="#f49a72" stroke-width="3"/><path d="M195 180h72M610 146h40" class="console-line" stroke-width="4"/>`}
    if(key==='recovery'){center=`<path d="M39 146H176" stroke="#9eb5bf" stroke-width="35"/><path d="M176 146h63" class="console-line" stroke-width="6"/><rect x="238" y="64" width="225" height="173" rx="10" fill="url(#metal)" stroke="#b6ced0" stroke-width="3"/><path d="M267 95l158 116M267 126l121 85M305 88l128 104M258 180l49 36M267 211l158-116M267 180l121-85M304 211l128-104" stroke="#e9855d" stroke-width="4"/><path d="M463 105h137m-137 90h137" fill="none" stroke="#93b8bf" stroke-width="14"/><path d="M594 105v-30h46m-46 120v30h46" stroke="#93b8bf" stroke-width="7" fill="none"/><path d="M467 105h95" class="console-line" stroke-width="3"/>`}
    return `<div class="diagram-frame"><svg viewBox="0 0 680 310" role="img" aria-label="${labels.join(', ')}" xmlns="http://www.w3.org/2000/svg">${basic}${axis}${center}${schematicDetails(key)}<g font-family="monospace" font-size="11" font-weight="700" fill="#d0e1df"><text x="70" y="265">01  ${labels[0]}</text><text x="268" y="265">02  ${labels[1]}</text><text x="504" y="265">03  ${labels[2]}</text></g></svg><div class="diagram-stage-labels">${labels.map((label,i)=>'<span><strong>0'+(i+1)+'</strong> '+label+'</span>').join('')}</div></div>`
  }
  function selectSystem(key){const data=items[key]?.[lang];if(!data)return;$$('[data-system]').forEach(button=>{const active=button.dataset.system===key;button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;});$('#system-title').textContent=data.title;$('#system-description').textContent=data.description;$('#system-visual').innerHTML=diagram(key,data.labels);const tagEl=$('#system-tags');tagEl.replaceChildren();data.tags.forEach(str=>{const span=document.createElement('span');span.textContent=str;tagEl.append(span)});$('#system-id').textContent=`0${Object.keys(items).indexOf(key)+1} / 03`}
  const tabs=$$('[data-system]');if(tabs.length){tabs.forEach((t,i)=>{t.addEventListener('click',()=>selectSystem(t.dataset.system));t.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();const next=(i+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;tabs[next].focus();selectSystem(tabs[next].dataset.system)})});selectSystem('steam')}
  const params=new URLSearchParams(location.search);const formMsg=$('#form-message');if(formMsg){const sent=params.get('sent');if(sent==='1'){formMsg.textContent=lang==='it'?'Richiesta inviata. Grazie, ti risponderò via email.':'Request sent. Thank you — I will reply by email.';}else if(params.get('error')){formMsg.textContent=lang==='it'?'Invio non riuscito. Controlla i campi o riprova più tardi.':'Delivery failed. Please check the fields or try again later.'}}
  const subjectField=$('#project-type');$$('[data-request-scope]').forEach(link=>link.addEventListener('click',()=>{if(subjectField)subjectField.value=link.dataset.requestScope||''}));
})();
