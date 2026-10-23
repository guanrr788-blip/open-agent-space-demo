/* Integration boundary: resource pages from the client, agent screens from our approved prototype. */
const moduleViews=new Set(['quick','sandboxes','skills','knowledge','memory','identity']);
const bridgeSend=(type,payload={})=>parent.postMessage({source:'oas-client-resources',type,...payload},location.origin);
const baseResourceSave=save;
save=function(){baseResourceSave();bridgeSend('resources',{data:DB});};
const baseResourceRender=render;
render=function(){baseResourceRender();document.body.dataset.page=S.page;};
function showModule(page){
  if(!moduleViews.has(page))return;
  closeLayer();closeMenu();S.page=page;S.agentId=null;S.editor=null;S.wizard=null;S.resourceQuery='';S.listPages={};
  render();scrollTo(0,0);
}
navigate=function(page){if(moduleViews.has(page)){bridgeSend('navigate',{view:page});showModule(page);}else bridgeSend('navigate',{view:'agents'});};
openAgent=function(id,tab='config'){closeLayer();bridgeSend('navigate',{view:tab==='debug'?'online-debug':'configuration',agentId:id});};
openKnowledgeAgent=function(id){openAgent(id);};openMemoryAgent=function(id){openAgent(id);};
backToAgents=function(){bridgeSend('navigate',{view:'agents'});};
openWizard=function(){closeLayer();bridgeSend('navigate',{view:'create-agent'});};
showCreationPortal=function(){navigate('quick');};
renderCreationPortal=function(){
  const backdrop='<svg class="personal-portal-waves" viewBox="0 0 1600 900" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="portal-wave" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#ffffff" stop-opacity=".88"/><stop offset=".58" stop-color="#d6eaff" stop-opacity=".18"/><stop offset="1" stop-color="#ffffff" stop-opacity=".86"/></linearGradient><linearGradient id="portal-wave-blue" x1="0" y1="1" x2="1" y2="0"><stop stop-color="#b4d9ff" stop-opacity=".45"/><stop offset="1" stop-color="#ffffff" stop-opacity=".5"/></linearGradient></defs><path d="M-120 230C220 30 240 640 730 600S1350 200 1700 90L1700 230C1270 340 1220 790 730 710S220 120-120 340Z" fill="url(#portal-wave)"/><path d="M-100 310C240 105 370 760 850 740S1330 400 1700 460L1700 600C1330 380 1290 900 790 840S230 310-100 460Z" fill="url(#portal-wave-blue)"/><path d="M-120 230C220 30 240 640 730 600S1350 200 1700 90M-100 310C240 105 370 760 850 740S1330 400 1700 460M-90 780C370 670 790 840 1130 570S1470 80 1680 10" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="2"/></svg>';
  $('main').innerHTML='<section class="personal-portal" aria-labelledby="personal-portal-heading">'+backdrop+'<span class="portal-sphere portal-sphere-left" aria-hidden="true"></span><span class="portal-sphere portal-sphere-right" aria-hidden="true"></span><div class="personal-portal-inner"><header class="personal-portal-heading"><div class="personal-portal-eyebrow"><span></span>OPEN AGENT SPACE<span></span></div><h1 id="personal-portal-heading">让想法，开始行动</h1><p>从个人灵感到企业业务，开启智能体创造之旅</p></header><div class="personal-portal-choices"><article class="personal-choice"><div class="portal-choice-icon">'+I('user')+'</div><h2>个人智能体</h2><p>打造你的专属智能助手</p><button class="portal-choice-button" onclick="openWizard()">创建个人智能体'+I('arrow-right')+'</button></article><article class="personal-choice enterprise-choice"><div class="portal-choice-icon"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M4 21V5l10-4v20M14 6l6 4v11M2 21h20M7 7h3M7 11h3M7 15h3M17 12v2M17 17v1"/></svg></div><h2>企业智能体</h2><p>让智能融入企业业务</p><button class="portal-choice-button" disabled aria-describedby="enterprise-coming-soon">创建企业智能体'+I('arrow-right')+'</button><span class="enterprise-coming-soon" id="enterprise-coming-soon">敬请期待</span></article></div></div></section>';
};
renderCommunicationSkills=function(){
  $('main').innerHTML='<header class="communication-page-head"><div><h1>通信技能</h1><p>连接通话、消息、云盘与邮箱，为智能体拓展通信能力。</p></div><div class="communication-controls"><div class="search">'+I('search')+'<input class="input" aria-label="搜索全部技能" placeholder="搜索技能名称、ID 或描述" value="'+E(S.resourceQuery)+'" oninput="S.resourceQuery=this.value;renderSkillSections()"></div>'+skillPageTabsHTML()+'</div></header><section id="communication-section" class="skills-page-section"><span id="comm-count" hidden></span><div id="communication-items" class="communication-grid"></div></section><section id="market-section" class="skills-page-section"><span id="market-count" hidden></span><div class="market-provider-tabs" role="tablist" aria-label="技能市场来源"></div><div id="market-skill-items" class="market-skill-grid"></div></section>';
  renderSkillSections();
};
const commPresentation={phone:{desc:'处理来电与外呼，自动整理通话纪要。',tags:['代接','代打','速记']},sms:{desc:'集中接收消息，辅助回复与定时发送。',tags:['代收','代回','代发']},cloud_disk:{desc:'存放智能体生成的报告与文件，随时检索使用。',tags:['文件管理','快速查找','产物存放']},mail:{desc:'连接139邮箱，完成邮件阅读、撰写与整理。',tags:['邮件阅读','代写邮件','发送整理']}};
renderSkillSections=function(){
  if(!$('communication-items'))return;
  const communication=DB.skills.filter(x=>x.source==='通信技能'&&skillMatches(x));
  const market=DB.skills.filter(x=>x.source==='技能市场'&&skillMatches(x));
  $('comm-count').textContent=communication.length;$('market-count').textContent=market.length;
  $('communication-items').innerHTML=communication.length?communication.map(sk=>{const spec=communicationSpecs[sk.id],p=commPresentation[sk.id];return '<article class="communication-card" data-skill="'+sk.id+'"><div class="communication-card-head"><span class="communication-icon">'+I(sk.id==='cloud_disk'?'cloud':spec.icon)+'</span><div><h3>'+E(sk.name)+'</h3><small>v1.0.0 · 平台预置</small></div></div><p class="communication-card-desc">'+E(p.desc)+'</p><div class="communication-feature-tags">'+p.tags.map(t=>'<span>'+E(t)+'</span>').join('')+'</div><div class="communication-card-foot">'+button('查看能力',"resourceDetail('"+sk.id+"','skills')",'small','arrow-right')+'</div>'+communicationArtwork(sk.id)+'</article>';}).join(''):skillEmptyHTML('没有匹配的通信技能');
  renderMarketSkills(market);applySkillPageTab();
};
function synchronizeApprovedAgents(records){
  const prior=new Map(DB.agents.map(a=>[a.id,a]));
  DB.agents=records.map(a=>({...prior.get(a.id),...a,authorized:prior.get(a.id)?.authorized||[],downloadedSkills:prior.get(a.id)?.downloadedSkills||[],events:[],sessions:[],tools:['bash','read','write','edit','browser'],mcps:[],spec:'4 vCPU / 8 GiB',archived:false}));
  DB.identities=DB.agents.map(a=>{
    let identity=DB.identities.find(x=>x.agentId===a.id);
    if(!identity){identity={id:'identity_'+a.id,agentId:a.id,type:'智能体身份',status:'可用',scopes:['智能体运行','基础工具']};}
    identity.name=a.name+'的身份';identity.aic=a.aic;identity.ownerPhone=a.ownerPhone||'13800006621';enrichIdentity(identity);a.identityId=identity.id;return identity;
  });
  save();if(moduleViews.has(S.page))render();
}
window.addEventListener('message',event=>{
  if(event.origin!==location.origin||event.source!==parent||event.data?.source!=='oas-approved-shell')return;
  const data=event.data;
  if(data.type==='sync-agents')synchronizeApprovedAgents(data.agents);
  if(data.type==='navigate')showModule(data.view);
  if(data.type==='guide')showGuide();
  if(data.type==='new-sandbox'){showModule('sandboxes');openResourceForm('sandboxes');}
  if(data.type==='sandbox-detail'){showModule('sandboxes');resourceDetail(data.id,'sandboxes');}
});
const clientSaveResourceForm=saveResourceForm;
saveResourceForm=function(){const before=resourceForm?.kind==='sandboxes'?new Set(DB.sandboxes.map(x=>x.id)):null;clientSaveResourceForm();if(before){const created=DB.sandboxes.find(x=>!before.has(x.id));if(created)bridgeSend('sandbox-created',{id:created.id});}};
showModule(moduleViews.has(location.hash.slice(1))?location.hash.slice(1):'skills');
bridgeSend('ready');bridgeSend('resources',{data:DB});
