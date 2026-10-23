/* Shared shell for the approved agent screens and the client's resource modules. */
(()=>{
  const modules={quick:'快速创建智能体',sandboxes:'沙箱',skills:'通信技能',knowledge:'知识库',memory:'记忆库',identity:'智能体身份'};
  const resourceStore='oas-resource-prototype-v1';
  let resourceData;try{resourceData=JSON.parse(localStorage.getItem(resourceStore));}catch{}
  let resourceFrame,dialogFrame,dialogContext=null;
  const host=document.createElement('section');host.className='resource-host';host.hidden=true;host.setAttribute('aria-label','平台资源');document.querySelector('main').append(host);
  const dialog=document.createElement('dialog');dialog.className='resource-dialog';dialog.setAttribute('aria-label','沙箱配置');
  dialog.innerHTML='<div class="resource-dialog-bar"><strong>沙箱配置</strong><button type="button" aria-label="关闭沙箱配置">关闭 ×</button></div><div class="resource-dialog-content"></div>';
  document.body.append(dialog);dialog.querySelector('button').onclick=()=>dialog.close();
  function send(frame,type,payload={}){frame?.contentWindow?.postMessage({source:'oas-approved-shell',type,...payload},location.origin);}
  function frameFor(view){const frame=document.createElement('iframe');frame.title=modules[view]||'资源配置';frame.src=new URL('client-reference/pages.html?v=orbital-v2',document.baseURI).href+'#'+view;return frame;}
  function snapshot(){
    agents=readAgents();
    return agents.map(a=>{const c=loadAgentConfiguration(a);return {id:a.id,name:c.name,template:c.framework,environment:c.environment,description:c.description,prompt:c.systemPrompt,model:c.model,skills:c.skills.map(id=>({call:'phone',message:'sms',cloud:'cloud_disk'})[id]||id),sandbox:c.sandbox==='browser'?'sb_browser':c.sandbox,knowledgeEnabled:c.knowledgeLibrary,memoryEnabled:c.memoryLibrary,version:c.version,status:({'运行中':'running','准备中':'starting','异常':'error'})[a.status],aic:a.aic,ownerPhone:a.ownerPhone,updated:a.updatedAt};});
  }
  function sandbox(value){return (resourceData?.sandboxes||[{id:'sb_browser',name:'浏览器沙箱',type:'x86 · Linux',desc:'用于网页访问、页面交互与浏览器自动化。',authType:'API Key',codeEnvs:['Python','Browser']}]).find(x=>x.id===(value==='browser'?'sb_browser':value));}
  function sandboxSummary(record){return [record.type,record.authType,(record.codeEnvs||[]).join(' / ')].filter(Boolean).join(' · ');}
  function sandboxOptions(){
    if(!resourceData?.sandboxes)return;
    for(const id of ['config-sandbox','create-sandbox']){
      const select=document.getElementById(id),selected=select.value;
      select.replaceChildren(new Option('暂不关联',''),...resourceData.sandboxes.map(x=>new Option(x.name+' · '+x.type,x.id==='sb_browser'?'browser':x.id)));
      select.value=[...select.options].some(x=>x.value===selected)?selected:'';
    }
  }
  function fillSandboxDetails(id,value){
    const record=sandbox(value),root=document.getElementById(id);if(!root)return;
    root.hidden=!record;if(!record)return;
    root.querySelector('strong').textContent=record.name;
    const p=root.querySelectorAll('.library-copy p');p[0].textContent=record.desc||'';p[1].textContent=sandboxSummary(record);
  }
  function downloadedOptions(){
    const a=resourceData?.agents?.find(x=>x.id===activeAgentId),container=document.getElementById('market-skills');
    if(!a||!container)return;
    for(const downloaded of a.downloadedSkills||[]){
      if([...container.querySelectorAll('input')].some(input=>input.value===downloaded.id))continue;
      const record=resourceData.skills.find(x=>x.id===downloaded.id);if(!record)continue;
      const label=document.createElement('label');label.className='skill-card market-option';const input=document.createElement('input');input.type='checkbox';input.name='skills';input.value=record.id;input.setAttribute('aria-label',record.name);input.checked=appliedConfiguration.skills.includes(record.id);
      const copy=document.createElement('span');copy.className='skill-copy';const name=document.createElement('strong');name.textContent=record.name;copy.append(name);label.append(input,copy);container.append(label);
    }
    // Options belong to the selected agent, including each agent's downloaded catalog.
    for(const label of container.querySelectorAll('label')){const input=label.querySelector('input');if(!['search','document'].includes(input.value)&&!(a.downloadedSkills||[]).some(d=>d.id===input.value))label.remove();}
  }
  function unlinkRemovedSandboxes(previous,next){
    if(!previous?.sandboxes||!next?.sandboxes)return;
    const removed=new Set(previous.sandboxes.filter(x=>!next.sandboxes.some(n=>n.id===x.id)).map(x=>x.id));
    if(!removed.size)return;
    for(const agent of agents){
      const config=loadAgentConfiguration(agent),id=config.sandbox==='browser'?'sb_browser':config.sandbox;
      if(!removed.has(id))continue;
      config.sandbox='';agent.sandbox='';
      localStorage.setItem('oas-agent-'+agent.id+'-configuration',JSON.stringify(config));
      if(agent.id===activeAgentId)appliedConfiguration={...config};
    }
    persistAgents();
  }
  function refreshResources(){
    sandboxOptions();downloadedOptions();syncConfigurationSandbox();renderCreationPreview();
    if(!document.body.classList.contains('resources-view')&&!document.body.classList.contains('agents-view'))renderAppliedConfiguration(appliedConfiguration);
  }
  window.oasModules={
    handles:view=>Object.hasOwn(modules,view),sandbox,fillSandboxDetails,
    show(view){
      document.body.classList.remove('chat-view','create-view','agents-view');document.body.classList.add('resources-view');
      for(const id of ['configuration','online-debug','agents','create-agent'])document.getElementById(id).hidden=true;
      host.hidden=false;
      for(const link of document.querySelectorAll('.navigation .nav-item')){const active=link.hash==='#'+view;link.classList.toggle('active',active);link.toggleAttribute('aria-current',active);if(active)link.setAttribute('aria-current','page');}
      document.querySelector('[data-section-breadcrumb]').hidden=true;document.querySelector('[data-section-divider]').toggleAttribute('hidden',true);document.querySelector('[data-agent-breadcrumb]').hidden=true;document.querySelector('[data-agent-divider]').toggleAttribute('hidden',true);document.querySelector('.breadcrumbs [aria-current="page"]').textContent=modules[view];
      document.title=modules[view]+' · Open Agent Space';
      if(!resourceFrame){resourceFrame=frameFor(view);host.append(resourceFrame);}else{send(resourceFrame,'sync-agents',{agents:snapshot()});send(resourceFrame,'navigate',{view});}
    },
    hide(){host.hidden=true;document.body.classList.remove('resources-view');refreshResources();},
    refresh:refreshResources,refreshDownloaded:downloadedOptions
  };
  const destinations=['quick','agents','sandboxes','skills','knowledge','memory','identity'];
  document.querySelectorAll('.navigation .nav-item').forEach((link,i)=>link.href='#'+destinations[i]);
  document.querySelector('.topbar-end>a').addEventListener('click',event=>{event.preventDefault();if(host.hidden)openResourceDialog('guide');else send(resourceFrame,'guide');});
  function openResourceDialog(action,context){
    dialogContext=context||null;dialog.querySelector('strong').textContent=action==='guide'?'使用指南':'沙箱配置';
    dialogFrame=frameFor(action==='guide'?'skills':'sandboxes');
    dialogFrame.dataset.action=action;
    dialog.querySelector('.resource-dialog-content').replaceChildren(dialogFrame);dialog.showModal();
  }
  document.querySelectorAll('.sandbox-create').forEach(button=>button.addEventListener('click',()=>openResourceDialog('new-sandbox',button.closest('#create-agent')?'create':'config')));
  document.getElementById('create-view-sandbox').addEventListener('click',()=>{const value=document.getElementById('create-sandbox').value;openResourceDialog('sandbox-detail');dialogFrame.dataset.sandbox=value==='browser'?'sb_browser':value;});
  window.addEventListener('message',event=>{
    const frame=[resourceFrame,dialogFrame].find(frame=>frame?.contentWindow===event.source);
    if(event.origin!==location.origin||!frame||event.data?.source!=='oas-client-resources')return;
    const data=event.data;
    if(data.type==='ready'){send(frame,'sync-agents',{agents:snapshot()});if(frame===dialogFrame){const action=frame.dataset.action;send(frame,action==='guide'?'guide':action==='sandbox-detail'?'sandbox-detail':'new-sandbox',{id:frame.dataset.sandbox});}}
    if(data.type==='resources'){
      unlinkRemovedSandboxes(resourceData,data.data);
      resourceData=data.data;
      refreshResources();
    }
    if(data.type==='navigate'){
      if(dialog.open)dialog.close();
      location.hash='#'+data.view+(data.agentId?'?agent='+encodeURIComponent(data.agentId):'');
    }
    if(data.type==='sandbox-created'&&dialogContext){
      const select=document.getElementById(dialogContext==='create'?'create-sandbox':'config-sandbox');select.value=data.id==='sb_browser'?'browser':data.id;select.dispatchEvent(new Event('change',{bubbles:true}));dialog.close();
    }
  });
  // Refresh local options when returning from an independently opened prototype tab.
  window.addEventListener('storage',event=>{if(event.key===resourceStore){try{resourceData=JSON.parse(event.newValue);refreshResources();}catch{}}});
  refreshResources();setPageView();
})();
