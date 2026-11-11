/* EG — process engineering visualisations. Contextual PFD-style concept drawings. */
(()=>{
  'use strict';
  const root=document.getElementById('system-visual');
  if(!root)return;
  const en=document.documentElement.lang==='en';
  const C={bg:'#0b1a20',metal:'#bac9c8',soft:'#6b8791',white:'#e8eeea',hot:'#e59a70',water:'#80c0c9',steam:'#dec19b'};
  const ui=en?{
    title:'PROCESS FLOW / CONCEPT',legend:'SCHEMATIC ONLY · NOT FOR CONSTRUCTION',
    steam:['COMBUSTION','STEAM BOILER','HEAT RECOVERY','FUEL','PROCESS STEAM','FLUE GAS','FEEDWATER','STEAM + THERMAL CIRCUIT'],
    biomass:['FUEL HOPPER','MOVING GRATE','FLUE GAS TREATMENT','BIOMASS','FURNACE','CYCLONE','CLEAN GAS','ASH','FUEL + FLUE GAS CIRCUIT'],
    recovery:['HOT FLUE GAS','HEAT EXCHANGER','COOLED GAS','COLD WATER','HOT WATER','HEAT RECOVERY CIRCUIT']
  }:{
    title:'SCHEMA DI PROCESSO / CONCEPT',legend:'SCHEMA DI PRINCIPIO · NON ESECUTIVO',
    steam:['COMBUSTIONE','GENERATORE VAPORE','RECUPERO TERMICO','COMBUSTIBILE','VAPORE AL PROCESSO','FUMI','ACQUA ALIMENTO','CIRCUITO VAPORE + FUMI'],
    biomass:['TRAMOGGIA','GRIGLIA MOBILE','TRATTAMENTO FUMI','BIOMASSA','FORNO','CICLONE','FUMI TRATTATI','CENERI','CIRCUITO BIOMASSA + FUMI'],
    recovery:['FUMI CALDI','SCAMBIATORE','FUMI RAFFREDDATI','ACQUA FREDDA','ACQUA CALDA','CIRCUITO RECUPERO TERMICO']
  };
  function text(x,y,t,size=13,fill=C.white,anchor='start',weight=600){
    return '<text x="'+x+'" y="'+y+'" fill="'+fill+'" font-family="Manrope,Arial,sans-serif" font-size="'+size+'" font-weight="'+weight+'" text-anchor="'+anchor+'" letter-spacing=".9">'+t.replace(/&/g,'&amp;')+'</text>';
  }
  function line(d,color=C.soft,width=2,extra=''){
    return '<path d="'+d+'" fill="none" stroke="'+color+'" stroke-width="'+width+'" stroke-linecap="round" stroke-linejoin="round" '+extra+'/>';
  }
  function pipe(d,color,width=7,flow=true){
    return '<g>'+line(d,C.soft,width+5,'opacity=".28"')+line(d,color,width)+
      (flow?line(d,'#f4f8f2',2,'class="eg-pfd-flow" opacity=".78"'):'')+'</g>';
  }
  function valve(x,y,color=C.water){
    return '<g transform="translate('+x+' '+y+')" stroke="'+color+'" fill="'+C.bg+'" stroke-width="2">'+
      '<path d="M-12 -9L0 0L-12 9z M12 -9L0 0L12 9z"/><path d="M0-12V-23"/><circle cx="0" cy="-25" r="4"/></g>';
  }
  function gauge(x,y){
    return '<g><path d="M'+x+' '+(y+22)+'v-16" fill="none" stroke="'+C.metal+'" stroke-width="3"/>'+
      '<circle cx="'+x+'" cy="'+y+'" r="15" fill="'+C.bg+'" stroke="'+C.metal+'" stroke-width="2"/>'+
      line('M'+x+' '+y+'l7 -7',C.hot,2.1)+'<circle cx="'+x+'" cy="'+y+'" r="2" fill="'+C.hot+'"/></g>';
  }
  function frame(code,title){
    let s='<svg viewBox="0 0 850 380" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="'+title+'">';
    s+='<defs><pattern id="eggrid" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M28 0H0V28" fill="none" stroke="#7897a0" stroke-width=".55" opacity=".17"/></pattern>'+
      '<linearGradient id="egmetal" x1="0" x2="1"><stop stop-color="#1c323b"/><stop offset=".22" stop-color="#526c74"/><stop offset=".51" stop-color="#293f48"/><stop offset=".82" stop-color="#4b626b"/><stop offset="1" stop-color="#172c34"/></linearGradient></defs>';
    s+='<rect width="850" height="380" fill="'+C.bg+'"/><rect width="850" height="380" fill="url(#eggrid)"/>';
    s+='<path d="M18 54H832M18 324H832" stroke="#57717b" opacity=".5"/>';
    s+=text(23,34,ui.title,11,'#93b3b9')+text(828,34,'EG / '+code,11,C.hot,'end');
    s+=text(23,348,ui.legend,10,'#85a4ac')+text(827,348,'THERMAL ENGINEERING / '+code,10,'#85a4ac','end');
    s+='<g stroke="#8da6af" stroke-width="1" opacity=".68"><path d="M17 60h22M17 60v22M832 60h-22M832 60v22M17 319h22M17 319v-22M832 319h-22M832 319v-22"/></g>';
    return s;
  }
  function steam(){
    const a=ui.steam;let s=frame('01 / STEAM',a[7]);
    // Fire-tube vessel / real boiler representation, strictly illustrative
    s+='<rect x="210" y="133" width="300" height="126" rx="61" fill="url(#egmetal)" stroke="'+C.metal+'" stroke-width="2.3"/>';
    s+='<ellipse cx="224" cy="196" rx="34" ry="60" fill="#1a3038" stroke="'+C.metal+'" stroke-width="2.5"/>';
    s+='<ellipse cx="224" cy="196" rx="24" ry="48" fill="#0f232b" stroke="'+C.soft+'" stroke-width="1.6"/>';
    s+='<g stroke="#bfd0cd" stroke-width="1.2" opacity=".55"><path d="M283 150H468M283 242H468M297 164H457M297 229H457"/></g>';
    s+='<g fill="#aabdc0"><circle cx="224" cy="140" r="3"/><circle cx="224" cy="252" r="3"/><circle cx="194" cy="197" r="3"/><circle cx="254" cy="197" r="3"/></g>';
    s+='<path d="M282 258l-14 24h53l-14-24M434 258l-14 24h53l-14-24" fill="#253b43" stroke="'+C.soft+'" stroke-width="2"/>';
    // Burner
    s+='<rect x="78" y="167" width="105" height="56" rx="5" fill="#30434a" stroke="'+C.metal+'" stroke-width="2.2"/>';
    s+='<rect x="105" y="174" width="50" height="40" rx="3" fill="#435962" stroke="'+C.soft+'"/>';
    s+='<circle cx="124" cy="194" r="12" fill="#142b31" stroke="'+C.metal+'" stroke-width="2"/>';
    s+='<path d="M183 178h25v36h-25" fill="#a76044" stroke="'+C.hot+'" stroke-width="2"/>';
    s+=pipe('M45 194H78',C.hot,5,true);
    // Steam outlet
    s+=pipe('M356 133V83H784',C.steam,6,true)+valve(681,83,C.steam)+gauge(404,110);
    // Gas / economizer
    s+=pipe('M510 195H580',C.hot,6,true);
    s+='<rect x="580" y="126" width="114" height="135" rx="3" fill="#203641" stroke="'+C.metal+'" stroke-width="2.2"/>';
    for(let i=0;i<7;i++)s+=line('M597 '+(146+i*16)+'H677',i%2?C.soft:C.hot,3);
    s+=line('M617 141V245M657 141V245',C.metal,1.7);
    s+=pipe('M694 195H786',C.hot,6,true);
    // Feedwater + pump
    s+=pipe('M787 292H640V261',C.water,6,true)+valve(736,292,C.water);
    s+=line('M640 261V236',C.water,6)+pipe('M610 126V106H480V133',C.water,5,false);
    s+=text(48,177,a[3],11,C.hot)+text(337,66,a[4],11,C.steam)+text(745,182,a[5],11,C.hot);
    s+=text(716,311,a[6],11,C.water,'middle');
    s+=text(131,292,a[0],12,C.white,'middle')+text(356,305,a[1],12,C.white,'middle')+text(635,305,a[2],12,C.white,'middle');
    return s+'</svg>';
  }
  function biomass(){
    const a=ui.biomass;let s=frame('02 / BIOMASS',a[8]);
    // Fuel hopper and feeder
    s+='<path d="M75 102H222L195 168H106Z" fill="url(#egmetal)" stroke="'+C.metal+'" stroke-width="2.3"/>';
    s+=line('M106 117H193M115 131H185M128 146H174',C.soft,1.6);
    s+='<path d="M137 168V205H212" fill="none" stroke="'+C.metal+'" stroke-width="20"/>';
    s+=line('M139 185V205H212',C.hot,3);
    // Combustion chamber and traveling grate
    s+='<rect x="224" y="122" width="282" height="147" rx="4" fill="#193039" stroke="'+C.metal+'" stroke-width="2.5"/>';
    s+='<path d="M242 147H489M242 246H489" stroke="'+C.soft+'" stroke-width="2"/>';
    s+='<path d="M250 227h232" stroke="'+C.metal+'" stroke-width="6"/>';
    for(let i=0;i<11;i++)s+='<path d="M'+(255+i*20)+' 223l8-9 9 9" fill="none" stroke="'+C.hot+'" stroke-width="2"/>';
    s+='<path d="M272 213q25-50 40-21 19-70 45-17 22-43 44-3 19-27 39 16 15-27 33 25" fill="none" stroke="'+C.hot+'" stroke-width="3.2" opacity=".9"/>';
    s+=pipe('M506 168H577',C.hot,7,true);
    // Cyclone and discharge hopper
    s+='<path d="M579 114H679V212L631 280L579 212Z" fill="#1d333c" stroke="'+C.metal+'" stroke-width="2.4"/>';
    s+='<path d="M591 148Q629 128 658 160T636 204" fill="none" stroke="'+C.hot+'" stroke-width="3" stroke-dasharray="6 9" class="eg-pfd-flow"/>';
    s+=pipe('M678 145H768V96',C.hot,6,true);
    s+='<rect x="761" y="79" width="14" height="39" fill="#314a54" stroke="'+C.metal+'" stroke-width="1.4"/>';
    // Ash line
    s+=pipe('M350 269V297H476',C.soft,4,false)+line('M472 290l12 7-12 7',C.soft,2);
    s+=line('M626 280V301',C.soft,3);
    s+=text(78,88,a[3],11,C.hot)+text(364,108,a[4],11,C.white,'middle')+text(629,101,a[5],11,C.white,'middle')+text(762,67,a[6],11,C.hot,'middle');
    s+=text(489,312,a[7],11,C.soft,'end');
    s+=text(145,311,a[0],12,C.white,'middle')+text(365,311,a[1],12,C.white,'middle')+text(628,311,a[2],12,C.white,'middle');
    return s+'</svg>';
  }
  function recovery(){
    const a=ui.recovery;let s=frame('03 / RECOVERY',a[5]);
    // Gas inlet/outlet and four-pass exchanger enclosure
    s+=pipe('M52 189H255',C.hot,11,true);
    s+='<rect x="254" y="111" width="334" height="162" rx="5" fill="#1b323d" stroke="'+C.metal+'" stroke-width="2.5"/>';
    s+='<rect x="268" y="127" width="306" height="130" fill="#10262f" stroke="'+C.soft+'" stroke-width="1.6"/>';
    for(let i=0;i<11;i++)s+=line('M'+(285+i*26)+' 140V244',C.metal,2.1,'opacity=".65"');
    for(let i=0;i<5;i++)s+=line('M279 '+(151+i*22)+'H565',C.hot,1.1,'opacity=".47"');
    s+=pipe('M588 189H797',C.hot,10,true);
    // Cold to hot counterflow service circuit
    s+=pipe('M340 304V270H345V245',C.water,7,true)+valve(340,289,C.water);
    s+=pipe('M510 245V88H687',C.water,7,true)+valve(624,88,C.water);
    s+='<g stroke="'+C.water+'" stroke-width="2.5" fill="none"><path d="M345 245q16-38 38 0t38 0t38 0t51 0"/></g>';
    s+=gauge(541,67);
    s+=text(72,158,a[0],12,C.hot)+text(683,159,a[2],12,C.hot);
    s+=text(419,101,a[1],12,C.white,'middle');
    s+=text(340,324,a[3],11,C.water,'middle')+text(698,82,a[4],11,C.water);
    s+='<g fill="'+C.soft+'" font-family="monospace" font-size="10" letter-spacing="1.1"><text x="279" y="290">COUNTERFLOW / CONCEPT</text></g>';
    return s+'</svg>';
  }
  const diagrams={steam,biomass,recovery};
  let last='';
  function render(key){
    if(!Object.prototype.hasOwnProperty.call(diagrams,key)||last===key)return;
    last=key;
    root.innerHTML='<div class="diagram-frame">'+diagrams[key]()+'</div>';
  }
  function active(){return document.querySelector('[data-system][aria-selected="true"]')?.getAttribute('data-system')||'steam';}
  render(active());
  const tabs=[...document.querySelectorAll('[data-system]')];
  tabs.forEach(el=>{
    el.addEventListener('click',()=>render(active()));
    el.addEventListener('keydown',event=>{
      if(event.key==='ArrowRight'||event.key==='ArrowLeft')queueMicrotask(()=>render(active()));
    });
  });
  const watcher=new MutationObserver(()=>render(active()));
  tabs.forEach(tab=>watcher.observe(tab,{attributes:true,attributeFilter:['aria-selected']}));
})();
