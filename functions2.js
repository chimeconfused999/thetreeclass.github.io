


function exportF(elem, tid,f) {
  var table = document.getElementById(tid);
  var html = table.outerHTML;
  var url = 'data:application/vnd.ms-excel,' + escape(html); // Set your html table into url 
  elem.setAttribute("href", url);
  elem.setAttribute("download", f); 
  return false;
}

function LoadIframe(src,oid) {
          $('#'+oid).html(`<iframe height=400 width=100% src=${src}></iframe>`); 
}
class Excel { 
  constructor(O) { var O=(arguments.length)?O:{};
    this.f='/public/Table.xls', this.isheet=0, this.oid='AllQS';
    if(arguments.length) { for(var k of Object.keys(O)) this[k] = O[k]; } 
    db.doc(this.f).get().then(doc=>{ if(!doc.exists) db.doc(this.f).set({}); })
  }; 
  
  
  View(O) { var O=(arguments.length)?O:{};
    var sh = '', f=(O.f)?O.f:this.f, isheet= (O.isheet)?O.isheet:this.isheet; 
    if(priv.admin) sh += ` 
    <button onclick="EditRawByID('${f}','xlsM0'); ">Raw</button>
    <button onclick="EditAByKeyRaw('${f}','xlsM0','roster'); ">Roster</button>
    <button onclick="EditJSONByKeyRaw('${f}','xlsM0','a'); ">Properties</button>
    `; 

    $('#'+this.oid).html(`<div id=xlsTop>${sh}</div><div id=xlsM0></div><div id=xlsM>M</div>`); 
    
    db.doc(f).onSnapshot(function(doc) { var s='', sm='', sb=''; 
      if(!doc.exists) db.doc(f).set({});
      var d = doc.data(),  nsheet=0; 
      if(priv.admin) isheet = d.a && d.a.SheetLastVisted?d.a.SheetLastVisted:isheet; 
      if(!priv.admin) d.roster = [email];
      if(!d.sheet) d.sheet = {0:{a:{},d:{0:{}}}};
     for (var i in d.sheet) { var v=d.sheet[i], as=v.a?v.a:{}; nsheet++; 
        sb += `<span selected=${(i==isheet)?1:0} 
               ondblclick="if(priv.admin) dblclickEdit('${f}','sheet.${i}.a.n', $(this) );" 
               onclick="if(!EditFlag) {xls.View({isheet:'${i}'}); if(priv.admin) db.doc('${f}').update({'a.SheetLastVisted':'${i}'}); }"
               >${as.n?as.n:i}</span> |`; 
     }
      if(priv.admin)  sb += ` <button onclick="db.doc('${f}').update({'sheet.${nsheet}': {a:{}, d:{} }  }); ">+</button>`;
      sb += ` <button> <a id="downloadLink" onclick="exportF(this, 'RosterTable', 'export.xls' )">Save XLS</a></button> `;
      
      //------------
      var nj= d.sheet[isheet].header ? Object.keys(d.sheet[isheet].header).length : 0;
      var ni=d.sheet[isheet].d?Object.keys(d.sheet[isheet].d).length : 0; 
      if(debug) console.log(ni, nj);
      var instB = `<input type=checkbox onclick=" if($(this).prop('checked')) $('.Instructor').attr('hide',0); else $('.Instructor').attr('hide',1); ">Inst</input>`;
      var stdB= `<input type=checkbox onclick=" if($(this).prop('checked')) $('.Student').attr('hide',0); else $('.Student').attr('hide',1); " checked>Student</input>`;
      var v=d.sheet[isheet].header, smt=`<th>${instB} | ${stdB}</th>`;
      for(var j in d.sheet[isheet].header) {   var ah = v[j].a?v[j].a:{}; 
          var prop = (priv.admin)? `<button onclick=" EditJSONByKeyRaw('${f}','MainTableTop','sheet.${isheet}.header.${j}.a'); ">&equiv;</button>`:'';
          var LoadIframe = ah.iframe?`<span onclick="LoadIframe('${ah.iframe}','MainTableTop'); ">Load</span>`:'';
          smt += `<th>
            <span ondblclick="if(priv.admin) dblclickEdit('${f}','sheet.${isheet}.header.${j}.v', $(this) );  ">${v[j].v?v[j].v:0}</span>
            ${LoadIframe} 
            ${prop}<span style='display:none;' id=msgth${j}></span>
            </th>`; 
      }
      if(priv.admin) smt += `<td><button onclick="db.doc('${f}').update({'sheet.${isheet}.header.${nj}': 0 }); ">+</button></td>`;
      sm += '<tr>'+smt+'</tr>';

      // Main table --------------[
      if(d.a && d.a.DataSource=="AutoRoster") {
        // Auto-populate with Roster
        for(var i=0; i<d.roster.length; i++) { var ueid=d.roster[i], smt=`<td>${ueid}</td>`, si=0, sf=f+'/users/'+d.roster[i]; 
          for(var j in d.sheet[isheet].header) { var ah = d.sheet[isheet].header[j].a? d.sheet[isheet].header[j].a:{};
            var edit = (ah.edit)?ah.edit:0; // aEditor=(ah.editor)?ah.editor[0]:'inline';
            if(priv.admin) { var tmp = `<span class=Instructor id='sheet_${isheet}_d_${i}_${j}' ondblclick="dblclickEdit('${sf}','sheet.${isheet}.d.${si}.${j}', $(this) );  ">0</span>`;
            } else { var tmp = `<span hide=1 class=Instructor id='sheet_${isheet}_d_${i}_${j}'>0</span>`; }
            smt += `<td> 
               <span  edit=${edit} class=Student id='sheet_${isheet}_dS_${i}_${j}' ondblclick="if(${edit}) dblclickEdit('${sf}','sheet.${isheet}.dS.${si}.${j}', $(this) );  ">0</span> ${tmp} 
            </td>`; 
          }
          sm += '<tr>'+smt+'</tr>';
        }
      } else {
        for(var i in d.sheet[isheet].d) { var v=d.sheet[isheet].d[i], smt=''; 
          for(var j in d.sheet[isheet].header) {  
            smt += `<td ondblclick="dblclickEdit('${f}','sheet.${isheet}.d.${i}.${j}', $(this) );  ">${v[j]?v[j]:0}</td>`; 
          }
          sm += '<tr>'+smt+'</tr>';
        }

      }
      // Main table end --------------]

      if(priv.admin) sm += ` <tr/><td><button onclick="db.doc('${f}').update({'sheet.${isheet}.d.${ni}': {} }); ">+</button></td></tr>`;
      var smAll='<table id=RosterTable width=100% border=1>'+sm+'</table>';
      //--------------
      s += `
        <table border=1 width=100% height=100%>
             <tr width=100%><td><span id=MainTableTop><span></td></tr>
             <tr><td width=100%> ${smAll}</td></tr>
             <tr><td style="position:absolute; bottom:0px;" title='${debug?f:""}'>${sb}</td></tr>
        </table>

      `;
      
      $('#xlsM').html(s); 

     if(d.a && d.a.DataSource=="AutoRoster") {
       for(var i=0; i<d.roster.length; i++) { var sf=f+'/users/'+d.roster[i]; xls.Update(sf,`sheet.${isheet}`,i); }
     }
    })

  }
  Update(f,k, i) { var kk=k.replace(/\./g,'_'); // Populate all the table data (in placeholder) by looping over every users
       db.doc(f).onSnapshot(function(doc) { if(!doc.exists) db.doc(f).set({}); 
         var v=doc.get(`${k}`)?doc.get(`${k}`):{};  if(debug) console.log(v) ;
         for(var j in v.d?v.d[0]:{}) {  $(`#${kk}_d_${i}_${j}`).html(v.d[0][j]); }
         for(var j in v.dS?v.dS[0]:{}) {  $(`#${kk}_dS_${i}_${j}`).html(v.dS[0][j]); }
        })
  }
  AddCol(d, sheet) { var n = Object.keys(d[sheet]).length; 
    d[sheet][n] = 'new coln'; 
  }
  Raw() {

  }
  JSON2HTMLTable(d) {
    for(var i in d) { var v=d[i]; 

    }
  }
  View2(O) {  var id=O.id, col=O.col, uqid=uniqid(), s=''; 
    var queryid = O.queryid?O.queryid:'#'+O.oid; 
    db.collection(O.col).get().then((qS) => {  var iq=0;  
      qS.forEach((doc) => {  iq++; var id=col+'/'+doc.id, d=doc.data(), a=d.a?d.a:{}, oid=uqid+doc.id, n=a.name?a.name:id;   
        s += `<br/> ${iq} ${n}  
          <button onclick="EditRawByID('${id}','${oid}'); \$('#${oid}').toggle();">Raw</button>
          <div style='display:none;' id=${oid}></div>`; 
      })   
      if(debug) console.log(s);
      $(queryid).html(s);     
    }); 
  }
}




function trippleBar(o='') {return `<span style='font-size:16px; padding: 2px 2px;'>&equiv;</span>`; }

function SelectAUser(id,users, eid=null) { var s=''; 
  for(var i in users) { var user = users[i]; 
     s += `<br/><span class=SelectUsers onclick=" ToggleColor($(this)); 
       //LoadInfoDocs('${id}', '${user}'); 
       db.doc('${id}').get().then(function(doc) { 
         db.doc('${id}/users/${user}').get().then(function(docs) {
           var d=doc.data(), dS=docs.data(); 
           QYT_S(d, dS, {user:'${user}', id:'${id}'}); 
          })
       });
      ">`+user+'</span>'; 
  }
  return s;
}
function LoadInfoDocs(dbid, eid=null) {
  if(debug) console.log(dbid, eid);
 db.doc('/users/'+email).set({LastVisited:{'2':{id:dbid} } }, {merge:true} ); 
 db.doc(dbid).onSnapshot(function(doc) { 
   var d=doc.data()?doc.data():{}; d.dbid=dbid;
   var sdbid= eid? dbid+'/users/'+eid: dbid+'/users/'+email; 
  if(!doc.exists) db.doc(dbid).set({creator:{email:email}}); 

  if( !($('#TARaw').css('display') == 'none') )   {$('#TA').val(JSON.stringify(d, null, 1));  }
  if(priv.admin) { 
    QYT(d); $('#TopMenu').html(adminB()); 
    $('#AdminSelectUsers').html(DropDown(SelectAUser(dbid,d.assigned?d.assigned.email:{}, eid),'Users',  {dpdown:'dblclick'} )); 
  }
  //db.doc(sdbid).onSnapshot(function(docs) { var dS=docs.data()?docs.data():{}; dS.dbid=sdbid;
   // if(!docs.exists) db.doc(sdbid).set({}); 
   // QYT_S(d, dS); 
  //} )
  db.doc(sdbid).get().then(function(docs) { 
    if(docs.data()) { var dS=docs.data();} else {db.doc(sdbid).set({}, {merge:true}); var dS={}; }
    dS.dbid=sdbid;
    QYT_S(d, dS); 
  } )
 });
}
var adminChecked='', EditFlag=0; 
function adminB(){ var debugChecked=debug?'checked':'', EditFlagChecked=EditFlag?'checked':''; 
  
  return `
  | <span id=AdminSelectUsers>Users</span>

    | <input type=checkbox admin=0 onclick=" 
      if($(this).prop('checked')) { adminChecked='checked';
        admin=1; $(this).attr('admin',1); $('.admin').show(); $('.student').hide(); 
      } else {admin=0; $(this).attr('admin',0); $('.admin').hide(); $('.student').show(); adminChecked='';}     
    " ${adminChecked} />Admin
    | <input type=checkbox onclick=" if($(this).prop('checked')) debug=1; else debug=0;" ${debugChecked} />Debug
    | <input type=checkbox onclick=" if($(this).prop('checked')) EditFlag=1; else EditFlag=0;" ${EditFlagChecked} />Edit


  `; 
}
function ListI(O) { var time=firebase.firestore.Timestamp.now().toMillis(), uqid=uniqid2(), name=O.name?O.name:'Activities'; 
  var name=O.name?O.name:'name', group=O.group?O.group:'group', id=O.id?O.id:'/I/'+email; 
  db.doc(id).onSnapshot(function(doc) { var s='', d=doc.data()?doc.data():{};
      for(var i in d) { var n=d[i].name?d[i].name:i; 
          if(LastVisitedID==`/I/${i}`) var hc='yellow'; else var hc=''; 
          if(priv.admin) s += `<button class=${uqid}I style='background-color:${hc};' onclick=" ToggleColor($(this)); LoadInfoDocs('/I/${i}');" ondblclick=" dblclickEdit('${id}','${i}.name', $(this)); " >${n}</button>`;        
          else s += `<button class=${uqid}I onclick=" ToggleColor($(this)); LoadInfoDocs('/I/${i}');"  >${n}</button><br/>`;        
      }
      if(O.new) s += `<button onclick="db.doc('${id}').set({[firebase.firestore.Timestamp.now().toMillis()]:{}}, {merge:true}); ">New</button>`; 

      $('#'+O.oid).html( DropDown(s,name)); 
  })
}
function dblclickEdit(id,k, e) { if(debug) console.log(id,k);
        if(e.attr('contenteditable')) {  e.attr('contenteditable', false);          
          db.doc(id).update({[k]: e.text() }); //.catch((e) => { console.error(e); db.doc(id).set({}); }); 
        } else e.attr('contenteditable', true); 
}
function EditAByKeyRaw(f,oid, k) {
  var sb = `<br/><button onclick=" db.doc('${f}').update({'${k}': removewhitespace($('#EditARaw').val()).split(';')  }); ">Save</button>`;
  $('#'+oid).html('<textarea cols=100 rows=10 id=EditARaw></textarea>'+sb); 
  db.doc(f).get().then(doc=>{ var A = doc.get(k)?doc.get(k):[]; $('#EditARaw').val( A.join('; ')); });
}

function EditJSONByKeyRaw(f,oid, k) {
  var sb = `<br/><button onclick=" db.doc('${f}').update({'${k}': JSON.parse($('#EditJSONRaw').val())  }); ">Save</button>`;
  $('#'+oid).html('<textarea cols=100 rows=10 id=EditJSONRaw></textarea>'+sb+`<div id=${oid}-attr></div>`); 
  db.doc(f).get().then(doc=>{ 
    $('#EditJSONRaw').val( JSON.stringify(doc.get(k)?doc.get(k):{}) );  
    AttrEditor(f,doc.get(k),k,`${oid}-attr`);
  });
}

function AttrEditor(f, a, k, oid) { var s='', ah=a?a:{}; 
   var i='edit', v= ah[i]?ah[i]:0; s += `<input type=checkbox onclick="db.doc('${f}').update({'${k}.${i}': $(this).prop('checked')?1:0}); "  ${v?'checked':''}>${i}</input>`;
  $('#'+oid).html(s);
  if(debug) console.log(s,a,k);
}
function LoadOneQ(O) {   var id=O.id, idS=id+'/users/'+email, k=O.k, oid=O.oid, uqid=uniqid2(); 
  db.doc(id).get().then(doc=>{ var Q=doc.get(`Q.${k}`); 
    db.doc(idS).get().then(docs=>{ 
     if(!docs.exists) {db.doc(idS).set({}); QS={}; } 
     if(docs.get(`Q.${k}`)) var QS=docs.get(`Q.${k}`); else var QS={}; 

    var t1=Q.t1?Q.t1:0, t2=Q.t2?Q.t2:0, Desc=Q.Desc?Q.Desc:'Desc';
    var aaS=QS.a?QS.a:{}, aa=Q.a?Q.a:{};
    var play=''; 
    var submitted= (aaS.submitted )?'disabled=disabled':'', disQ=(aaS.submitted )?'inline':'none';
    var choices = Q_Choices_S({id:dbid, i:k, Q:Q}, {Q:QS}); 
    var desc = IO_Desc(dbid, `Q.${k}.Desc`, Q.Desc?Q.Desc:'Desc', {editable:0}); 
    
    if(Q.Choices && Object.keys(Q.Choices).length>0) play=`
       <button style='padding: 10px;' onclick="
       var p = $('#player').data(); p.showid = '${uqid}Q'; 
        onPlayerReady({videoId:'${videoId}', t1:${t1}, t2:${t2}  });
        " ${submitted}>Play</button> 
    `; else disQ='inline';
    

    $('#'+oid).html(`
        <span id=${uqid}Q style='display:${disQ};'> ${desc} ${choices}</span> ${play}
      `); 
  }) 
  })
}
function db2con(id) { db.doc(id).get().then(doc=>{console.log(doc.data());})}
function togglePM(s,pm='+') { var uqid=uniqid2(), dis=(pm=='+')?'none':'inline';
  return `
   <button class=toggleB onclick="$('#${uqid}T').toggle(); if($(this).text()=='+') $(this).text('-'); else $(this).text('+'); ">${pm}</button>
   <span id=${uqid}T style='display:${dis};'>${s}</span>
  `;
}
function QYT_S(O, OS, Op={}) { var user = Op.user?Op.user:email, id=Op.id?Op.id:'/I/A_YT'; 
  var  dbid=O.dbid?O.dbid:id, dbids=dbid+'/users/'+user
  var iq=0, a=O.a?O.a:{}, aS=OS.a?OS.a:{}, uqid=uniqid(), oid='AllQS', iq=0; 
  $('#'+oid).html(''), $('#nAllQS').html(''), disAQ='none';
  if(a.display =="AllQ") { disAQ='inline'; }
  var Desc0 = O.Desc?O.Desc:''; 

  $('#'+oid).append(togglePM(Desc0, a.toggle?a.toggle:'-')); 
 
  //var TotalScore= (aS.TotalScore || aS.TotalScore===0) ? ` (Score=${aS.TotalScore}/${aS.TMaxScore}=${aS.TotalScoreP}%)`:''; 
  var TotalScore= ''; 

  for (var i in O.Q) { var Q=O.Q[i], Desc=Q.Desc?Q.Desc:'Desc'; iq++; 

    if(URLVars.iq) { $('#nAllQS').hide(); $('.mainbar').hide(); if(!(i===URLVars.iq)) continue; } // Only one Q display mode

    if(a.Launch===i && !priv.admin) {$('.Screen5').show(); LoadOneQ({id:dbid, k:i, oid:'Screen5M'});    } 
    if(a.Launch===-1) $('.Screen5').hide();

    var QS = (OS.Q && OS.Q[i])?OS.Q[i]:{}, aaS=QS.a?QS.a:{}, aa=Q.a?Q.a:{}, name=aa.name?aa.name:i;
    var  MaxScore=aa.MaxScore?aa.MaxScore:10;
    var t1=aa.t1?aa.t1:0, t2=aa.t2?aa.t2:0;
    if(aa.hide) continue;
    var play=''; 
    var submitted= (aaS.submitted )?'disabled=disabled':'', disQ=(aaS.submitted )?'inline':'none';
    var choices = aa.Choices? Q_Choices_S({id:dbid, i:i, Q:Q}, {Q:QS}) : ''; 
    var desc = IO_Desc(dbid, `Q.${i}.Desc`, Q.Desc?Q.Desc:'Desc', {editable:0});

    var copySketch = `<button onclick=" var d2=sketchpads['StudentDesc${i}'].toObject(); 
      d2.element='#sketchpadStudentDesc${i}S'; sketchpads['StudentDesc${i}S']=new Sketchpad(d2); 
      ">Copy</button>
    `;

    if(aa.Sketchpad) desc += Sketchpad_Placeholder({uqid:`StudentDesc${i}`, editable:0});
    if(aa.Sketchpad) desc += Sketchpad_Placeholder({uqid:`StudentDesc${i}S`, editable:1, user:user, msg:`My(${copySketch}): `});

    
    var videoId = aa.videoId?aa.videoId:'cpaigEYuNEw'; 

    if(Q.Choices && Object.keys(Q.Choices).length>0) play=`
       <button class=Ch${i} style='padding: 10px;' onclick="
       var p = $('#player').data(); p.showid = '${uqid}${i}Q'; $(this).prop('disabled',true);
        onPlayerReady({videoId:'${videoId}', t1:${t1}, t2:${t2}  });
        " >Play</button> 
    `; else disQ='inline';
    
    if(a.display !="AllQ") $('#nAllQS').append(`<button class=${uqid} style='padding: 10px;' onclick=" 
        var e=$('#disp${i}');  $('.dispAllQ').hide(); e.show(); ToggleColor($(this));
        //if(e.css('display')=='none') {  $(this).css('background-color','yellow');  e.show();
       // } else { $(this).css('background-color','');  e.hide(); }
    ">A${name}</button>`);  
 
    if( (aaS.score || aaS.score===0) && aaS.submitted) score='Score='+QS.a.score+'/'+MaxScore; else score=''; 
    if(aa.grading == 'self' && aaS.submitted) {
      var gradb = `Self grade <input type=text size=1 value=${aaS.score?aaS.score:0} onchange="db.doc('${dbids}').update({['Q.${i}.a.score']: $(this).val() }); " />/${MaxScore}`;   
    } else if(aa.grading == 'manual' && priv.admin) {
      var gradb = `Manual grade <input type=text size=1 value=${aaS.score?aaS.score:0} onchange="db.doc('${dbids}').update({['Q.${i}.a.score']: $(this).val() }); " />/${MaxScore}`;   
    } else var gradb = ''; 

    if(!aa.Youtube) {play=''; disQ='inline'; }

    var Soln = (aa.showsoln) ? ('<p/><u>Soln:</u>'+(Q.Soln?Q.Soln:'Soln')): ''; 
    $('#'+oid).append(` 
    <div class=dispAllQ id=disp${i} style='display:${disAQ};'> 
       <div align=left  id=${uqid}${i}  class=QDisplay> <div class=mainbar>(<b>A${i}</b>) ${score}, ${gradb}</div>
           <span id=${uqid}${i}Q style='display:${disQ};'> ${desc} ${choices} ${Soln}</span>  ${play}  
       </div>  
    </div>
  `); 


    if(aa.Sketchpad) IO_drawingsList({id:dbid, List:`Desc${i}`, uqid:`StudentDesc${i}`, editable:0}); 
    if(aa.Sketchpad) IO_drawingsList({id:`${dbid}/users/${user}`, List:`Desc${i}`, uqid:`StudentDesc${i}S`, editable:1}); 

    
    MathJax.Hub.Queue(["Typeset",MathJax.Hub, `${uqid}${i}Q` ]);

  }
  $('#nAllQS').append(TotalScore); 
  
}

function IO_checkboxes(id,A,k){ var uqid=uniqid(), s=''; 
  for (i in A) { var checked=(A[i])?A[i]:''; 
    s += `<input class=${uqid} type=checkbox onclick="db.doc('${id}').update({'${k}.a.checked': $(this).prop('checked') });" ${checked} />`;
  }
  return  s; 
}

function IO_DescCKEditor(id, key, v, uqid, O) { var s='', ss='', tb=O.tb?O.tb:'ckfull'; 
   s += `
    <div id=Desc${uqid} class=QEdit contenteditable="false" ondblclick=" 
      var opened = CKEDITOR.instances['Desc${uqid}']?1:0;   
      db.doc('${id}').get().then(doc=>{ 
        if(!opened) CKEDITOR.replace('Desc${uqid}', { toolbar:${tb}} ).setData( doc.get('${key}'));
      });
      $('#Desc${uqid}').attr('contenteditable','true'); $('#DescB${uqid}').show();
    " >`+v+`</div>
    `;
    
  s += `<button id=DescB${uqid} style='display:none;' onclick=" 
    var data = CKEDITOR.instances['Desc${uqid}'].getData(); $('#TADesc${uqid}').val(data);
    db.doc('${id}').update({'${key}':data}); 
    CKEDITOR.instances['Desc${uqid}'].destroy();
    $('#Desc${uqid}').attr('contenteditable','false'); $('#DescB${uqid}').hide();
  ">Done</button>`;
   return s; 
}
function db_delPKey(id,k,delk, flag='') { var key=`${k}.${delk}`, iq=0; // Delete: id=id, parent key=k, key=delk, flag=flag
  db.doc(id).update({[key]: firebase.firestore.FieldValue.delete() });
  if(flag=='renumber') db.doc(id).get().then(doc=>{ iq=0, q=doc.get(k), qRenum={}; for(i in q) {qRenum[iq]=q[i]; iq++;} db.doc(id).update({[k]:qRenum});   })
}
function db_delKey(id,k, flag='') {  db.doc(id).update({[k]: firebase.firestore.FieldValue.delete() }); }
function db_duplicatePKey(id,k,i, flag='') { var key=`${k}.${i}`, iq=0; 
  db.doc(id).get().then(doc=>{ var n=Object.keys(doc.data().Q).length; 
    db.doc(id).update({[`${k}.${n}`]:doc.get(`${k}.${i}`)}); 
  })
}
function AssignActivity(O) {var id=O.id, fn=O.fn, name=O.name, s='', uqid=uniqid2(); 
  var emails = (O.assigned.email?O.assigned.email:[]).join(';');
  s = `
  Roster: 
  <br/>EA2
   <button onclick="db.doc('/COURSES/EA2/Fall2022/Roster').get().then(doc=>{ $('#${uqid}TA').val(doc.data().raw); });">Load</button>
   <button onclick="db.doc('/COURSES/EA2/Fall2022/Roster').set({raw:$('#${uqid}TA').val()});">Save</button>

  <br/> Advanced Math 
   <button onclick="db.doc('/COURSES/AdvMath/Fall2022/Roster').get().then(doc=>{ $('#${uqid}TA').val(doc.data().raw); });">Load</button>
   <button onclick="db.doc('/COURSES/AdvMath/Fall2022/Roster').set({raw:$('#${uqid}TA').val()});">Save</button>
  
  <br/> CEMaterials
  <br/><textarea rows=5 style='width: 100%; max-width: 100%;' id=${uqid}TA>${emails}</textarea>
  <br/><button onclick="
    var emails = removewhitespace($('#${uqid}TA').val()).split(';'); 
    for(var i in emails) {
      console.log('adding', i, emails[i]);
      db.doc('${id}').update({['assigned.email']:firebase.firestore.FieldValue.arrayUnion(emails[i])});
      db.doc('/users/'+emails[i]+'/I/Activities').set({'${fn}': {name:'${name}'} }, {merge:true});
    }
  ">Add</button>
  <button onclick="
    var emails = removewhitespace($('#${uqid}TA').val()).split(';'); 
    for(var i in emails) {
      db.doc('${id}').update({['assigned.email']:firebase.firestore.FieldValue.arrayRemove(emails[i])});
      db_delKey('/users/'+emails[i]+'/I/Activities', '${fn}'); 
    }
  ">Remove</button>

  `;
  return DropDown(s,'Assign',  {dpdown:'dblclick'});

}
function removewhitespace(s) {return s.replace(/\r?\n|\r/g, '').replace(/ /g,''); }

function MonitorGrade(O) { var iq=O.iq; 
  console.log('AssignGrade(O):', O); 

 //db.doc(O.id+'/users/OverallScore').get().then(doc=>{ 
 db.doc(O.id+'/users/OverallScore').onSnapshot(function(doc) {
  var dataTable=[ ['Name', 'Number']       ];

   var d=doc.get(`Q.${iq}`), n=0, ns=0, avg=0, avgs=0, TscoreS=0, Tscore=0, ic=0, iw=0, ics=0, iws=0, nch={}; ; 
  for(var k in d) { var v = d[k], MaxScore=v.MaxScore, score=v.score;
    n++; avg += score; Tscore += MaxScore; 
    if(score>0) ic++; else iw++; 
    if(v.submitted) {
      ns++; avgs += score; TscoreS += MaxScore;
      if(score>0) ics++; else iws++;
    } 
    if(v.Choices) { 
      for(var j in v.Choices) { if(!nch[j]) nch[j] =0; 
        if(v.Choices[j]) nch[j] += 1; 
      }
    } 
  }
  dataTable.push(['Total',n]); 
  //dataTable.push(['Correct',ic]); 
  //dataTable.push(['Wrong',iw]); 
  dataTable.push(['Submitted',ns]); 
  dataTable.push(['Correct',ics]); 
  dataTable.push(['Wrong',iws]); 
  for(var j in nch) dataTable.push([`Ch${j}`,nch[j]]);

  avg = Math.round(avg/n); avgs = Math.round(avgs/ns); 
  $('#'+O.oid).html(`
    All (Avg = ${avg}, n=${n}, correct=${ic}, wrong=${iw})
    <br/>Submitted (Avg = ${avgs}, n=${ns}, correct=${ics}, wrong=${iws})
    <div id='chart_div${iq}'></div>
  `);
  google.charts.setOnLoadCallback(drawChart(`chart_div${iq}`, dataTable));

 })
}

google.charts.load('current', {packages: ['corechart', 'bar']});

function drawChart(divid, dataTable) {
  var data = google.visualization.arrayToDataTable(dataTable);

      var options = {
        focusTarget: 'category',
        hAxis: { 
          viewWindow: {  min: [7, 30, 0],max: [17, 30, 0]},
          textStyle: { fontSize: 14,color: '#053061', bold: true,italic: false},
          titleTextStyle: {fontSize: 18,color: '#053061',bold: true, italic: false }
        },
        vAxis: {  textStyle: {fontSize: 18,color: '#67001f',bold: false,italic: false},
          titleTextStyle: {fontSize: 18,color: '#67001f',bold: true,italic: false }
        }
      };

      var chart = new google.visualization.ColumnChart(document.getElementById(`${divid}`));
      chart.draw(data, options);
}
var csv={}; 
function getScoreCheckbox(Ch,ChS) { 
  var icMax=0, iright=0, iwrong=0; // if(a.Type=='checkbox')
    for(var k in Ch) { var ai = Ch[k].a?Ch[k].a:{}, aiS = (ChS && ChS[k])?ChS[k].a:{}; 
      if(ai.checked) icMax++; 
      if(ai.checked && aiS.checked) iright++; 
      if(!ai.checked && aiS.checked) iwrong++; 
    }
  if(iwrong>iright) score=0; else score = (iright-iwrong)/icMax; 
  return score;
}

function AssignGrade(O) { if(debug) console.log('AssignGrade(O):', O); 
 db.doc(O.id+'/users/OverallScore').get().then(doc=>{ if(!doc.exists) db.doc(O.id+'/users/OverallScore').set({},{merge:true}); })
 db.doc(O.id).get().then(doc=>{ var d=doc.data(), users=d.assigned.email; 
   for(var i in users) {  if(debug) { if(!(users[i]=='vkumar@utep.edu')) continue; }
     GradeOne(O.id, d, users[i], i);    
    }
 })
}

function GradeOne(id, d, user, iuser) { var idS=id+'/users/'+user, QQ=d.Q; 
    db.doc(idS).get().then(doc=>{ if(doc.data()) {var dS=doc.data(); } else { db.doc(idS).set({},{merge:true}); dS={}; }
      var  QQS=dS.Q?dS.Q:{}, TScore=0, TMaxScore=0; 
       for (var iq in QQ) { var Q=QQ[iq], QS=QQS[iq]?QQS[iq]:{}, a=Q.a, aS=QS.a?QS.a:{}, score=aS.hasOwnProperty('score')?1*aS.score:0, MaxScore=a.MaxScore?a.MaxScore:10; 
        TMaxScore += 1*MaxScore; 
        if(QS.a && a.grading=='auto') {  score = 0; 
          if(a.Type=='radio') { if(a.checked===aS.checked) score=1*MaxScore; 
          } else  { score = Math.round(getScoreCheckbox(Q.Choices, QS.Choices)*MaxScore);  }
          db.doc(idS).update({[`Q.${iq}.a.score`]:score})
          if(debug) console.log('E.js:GradeOne()', iuser, user, score); 
        }
        var u = dot2esc(user); 
        var v = {score:score, submitted:(aS.submitted?1:0), MaxScore:MaxScore, PScore:Math.round(100*score/MaxScore)}; 
        var uu = {}, sdata={}; uu[u]=v; sdata[iq]=uu; 
        //var g={[user]:{[iq]:{score:score} }  }; //`{'${user}':{'${iq}':{score:${score}} } }`; 
        if(debug) console.log({[`email.${u}.${iq}`]: {score:score, submitted:(aS.submitted?1:0)} }  );
        db.doc(id+'/users/OverallScore').update({[`email.${u}.${iq}`]: v } );
        //db.doc(id+'/users/OverallScore').update({ [`Q.${iq}.${u}`]: v }, {merge:true} )

        db.doc(id+'/users/OverallScore').set({ Q:sdata }, {merge:true} )
        TScore += score; 
       }
       
       //db.doc(idS).update({[`a.TotalScore`]:Math.round(100*TScore/TMaxScore) })
       db.doc(idS).set({a:{TotalScore:TScore,TMaxScore:TMaxScore, TotalScoreP: Math.round(100*TScore/TMaxScore) }},{merge:true});  
       //console.log(idS,{a:{TotalScore:TScore,TMaxScore:TMaxScore, TotalScoreP: Math.round(100*TScore/TMaxScore) }});
       //db.doc(id+'/users/OverallScore').update({[`email.${u}.TotalScore`]: Math.round(100*TScore/TMaxScore) } )

       //db.doc(id+'/users/OverallScore').update({[`Q.TotalScore.${u}`]: Math.round(100*TScore/TMaxScore) } )

    });

}

function QYT(O) { 
  var  dbid=O.dbid?O.dbid:'/I/A_YT', oid='AllQ', iq=0; $('#'+oid).html(''), a0=O.a?O.a:{}, uqid=uniqid2();
  var displayAllQ = (a0.display=='AllQ')?'checked':'', fn=dbid.split(/[\\\/]/).pop(), name=a0.name?a0.name:fn; 
  var Top = `
   <span ondblclick=" dblclickEdit('${dbid}','a.name', $(this) );  ">${name}</span> | ${fn}
   | AllQ <input type=checkbox name=grading${i} onclick=" db.doc('${dbid}').update({'a.display': $(this).prop('checked')?'AllQ':0 }); " ${displayAllQ}/>  
   `;
   Top += AssignActivity({id:dbid, fn:fn,name:name, assigned:O.assigned?O.assigned:[]}); 
   Top += `<button onclick="AssignGrade({id:'${dbid}'});">Grade</button>`;
   Top += `<button onclick=" var t=$('.DescToggle${uqid} .toggleB').text(); db.doc('${dbid}').update({['a.toggle']:t});">&#x261c;</button>`;

   var DescTop = IO_DescCKEditor(dbid, `Desc`, O.Desc?O.Desc:'Desc', `${uqid}Desc0`,{}); 
   Top += `<span class=DescToggle${uqid}>`+togglePM('<br/>'+DescTop,a0.toggle?a0.toggle:'-') + '</span>'; 
  $('#'+oid).append(Top); 

  for (var i in O.Q) { var Q=O.Q[i],  Desc=Q.Desc?Q.Desc:'Desc', MChoice='', MMChoice='', TA='', userinput='', YT='';
    var a=Q.a?Q.a:{}; 
    var videoId=a.videoId?a.videoId:'cpaigEYuNEw', t1=a.t1?a.t1:0, t2=a.t2?a.t2:0; 
    if(a.Type=="radio")  MChoice="checked"; else if (a.Type=="textarea") TA='checked'; else if (a.Type=="input") userinput='checked'; else MMChoice="checked";
    var CEInput=(a.ChoiceEditor=='input')?'checked':'', CETA=(a.ChoiceEditor=='textarea')?'checked':'', CECK=(a.ChoiceEditor=='CKEditor')?'checked':'', CESim=(a.ChoiceEditor=='simple')?'checked':''; 
    var nTrial = a.nTrial?a.nTrial:0;
    var showans = a.showans?'checked':'', showsoln = a.showsoln?'checked':'', retry = a.retry?'checked':'', inactive = a.inactive?'checked':''; 
    var manualgrade = (a.grading=='manual')?'checked':'', autograde = (a.grading=='auto')?'checked':'', selfgrade = (a.grading=='self')?'checked':''; 
    var Youtube = a.Youtube?'checked':'', hide = a.hide?'checked':''; 
    var Sketchpad = a.Sketchpad?'checked':''; 
    var Launched = (a0.Launch===i)?'checked':''; 

    if(a.DescEditor=='CKEditor') var desc = IO_DescCKEditor(dbid, `Q.${i}.Desc`, Desc, `${uqid}${i}`,{}); 
    else if(a.DescEditor=='textarea')  var desc = IO_TA({id:dbid, k:`Q.${i}.Desc`, v:Desc });
    else var desc = IO_Desc(dbid, `Q.${i}.Desc`, Desc, {eid:`Desc${i}`, editable:1}); 

    //var choices = Q_Choices({id:dbid, i:i, Q:Q}); 

    var del = ` <button onclick="db_delPKey('${dbid}', 'Q', '${i}', 'renumber'); ">&cross;</button>`; 
    var duplicate = ` <button onclick="db_duplicatePKey('${dbid}', 'Q', '${i}'); ">Duplicate</button>`; 
    var Launch = ` <input type=checkbox onclick="db.doc('${dbid}').update({'a.Launch': $(this).prop('checked')?'${i}':-1 }); "  ${Launched}>Launch</input>`; 

//      nTrial:<input size=1 onchange=" db.doc('${dbid}').update({'Q.${i}.a.nTrial': $(this).val() }); " value=${nTrial} />
    var ChoicesOptions = `
        User IO: 
          <input type=radio name=Choices${i}  onclick=" db.doc('${dbid}').update({'Q.${i}.a.Type': 'radio' }); " ${MChoice} />radio
        | <input type=radio name=Choices${i}  onclick=" db.doc('${dbid}').update({'Q.${i}.a.Type': 'checkbox' }); " ${MMChoice} />checkbox
        | <input type=radio name=Choices${i}  onclick=" db.doc('${dbid}').update({'Q.${i}.a.Type': 'textarea' }); " ${TA} />TA
        | <input type=radio name=Choices${i}  onclick=" db.doc('${dbid}').update({'Q.${i}.a.Type': 'input' }); " ${userinput} />Input
        <p/>Editor:
        | <input type=checkbox onclick=" db.doc('${dbid}').update({'Q.${i}.a.ChoiceEditor': $(this).prop('checked')?'input':0 }); " ${CEInput} />Input
        | <input type=checkbox onclick=" db.doc('${dbid}').update({'Q.${i}.a.ChoiceEditor': $(this).prop('checked')?'textarea':0 }); " ${CETA} />TA
        | <input type=checkbox onclick=" db.doc('${dbid}').update({'Q.${i}.a.ChoiceEditor': $(this).prop('checked')?'CKEditor':0 }); " ${CECK} />CKEditor
        <input type=checkbox onclick=" db.doc('${dbid}').update({'Q.${i}.a.ChoiceEditor': $(this).prop('checked')?'simple':0 }); " ${CESim} />Simple

      `;

    var CKEditor=(a.DescEditor=='CKEditor')?'checked':'', DescEditorTA=(a.DescEditor=='Textarea')?'checked':'', DescEditor=(a.DescEditor=='Simple')?'checked':''; 
    var DescOptions = `
        Editor:  <input type=radio name=DescEditor${i}  onclick=" db.doc('${dbid}').update({'Q.${i}.a.DescEditor': 'CKEditor' }); " ${CKEditor} />CKEditor
        | <input type=radio name=DescEditor${i}  onclick=" db.doc('${dbid}').update({'Q.${i}.a.DescEditor': 'textarea' }); " ${DescEditorTA} />TA
        | <input type=radio name=DescEditor${i}  onclick=" db.doc('${dbid}').update({'Q.${i}.a.DescEditor': 'simple' }); " ${DescEditor} />Simple
        <br/> <input type=checkbox name=DescEditor${i}  onclick=" db.doc('${dbid}').update({'Q.${i}.a.Sketchpad': $(this).prop('checked') }); " ${Sketchpad} />Drawing
      `;

  var Display = `
        Youtube <input type=checkbox onclick=" db.doc('${dbid}').update({'Q.${i}.a.Youtube': $(this).prop('checked') }); " ${Youtube}/>
        | Hide <input type=checkbox onclick=" db.doc('${dbid}').update({'Q.${i}.a.hide': $(this).prop('checked')?1:0 }); " ${hide}/>
        | Retry:<input type=checkbox onclick=" db.doc('${dbid}').update({'Q.${i}.a.retry': $(this).prop('checked') }); " ${retry}/>
        | Inactive :<input type=checkbox onclick=" db.doc('${dbid}').update({'Q.${i}.a.inactive': $(this).prop('checked') }); " ${inactive}/>
       <br/> Show (Ans <input type=checkbox onclick=" db.doc('${dbid}').update({'Q.${i}.a.showans': $(this).prop('checked') }); " ${showans}/>
       |Soln <input type=checkbox onclick=" db.doc('${dbid}').update({'Q.${i}.a.showsoln': $(this).prop('checked') }); " ${showsoln}/>
       )
       <br/> Choices <input type=checkbox onclick="db.doc('${dbid}').update({'Q.${i}.a.Choices': $(this).prop('checked') }); " ${a.Choices?'checked':''}/>
        | Soln <input type=checkbox onclick="db.doc('${dbid}').update({'Q.${i}.a.Soln': $(this).prop('checked') }); " ${a.Soln?'checked':''}/>

    `;

    var MaxScore = a.MaxScore?a.MaxScore:10;
    var Grade = ` <br/> Grade: 
        Manual <input type=radio name=grading${i} onclick=" db.doc('${dbid}').update({'Q.${i}.a.grading': $(this).prop('checked')?'manual':0 }); " ${manualgrade}/>
        | Auto <input type=radio name=grading${i} onclick=" db.doc('${dbid}').update({'Q.${i}.a.grading': $(this).prop('checked')?'auto':0 }); " ${autograde}/>
        | Self <input type=radio name=grading${i} onclick=" db.doc('${dbid}').update({'Q.${i}.a.grading': $(this).prop('checked')?'self':0 }); " ${selfgrade}/>
        <br/> Max score <input type=text onchange=" db.doc('${dbid}').update({'Q.${i}.a.MaxScore': $(this).val()}); " value=${MaxScore} />
     `;
     if(a.Youtube) {
       var YT = `
       VideoId: <input size=5 onchange=" db.doc('${dbid}').update({'Q.${i}.a.videoId': $(this).val() }); " value=${videoId} />
       t1: <input size=1 onchange=" db.doc('${dbid}').update({'Q.${i}.a.t1': $(this).val() }); " value=${t1} />
       t2: <input size=1 onchange=" db.doc('${dbid}').update({'Q.${i}.a.t2': $(this).val() }); " value=${t2} />
       <button onclick=" onPlayerReady({videoId:'${videoId}', t1:${t1}, t2:${t2}  });    $('#Assessment').html( $('#Desc${i}').html() );  ">Play</button>
       `;
     }

     var qattr = DropDown(Display+Grade,trippleBar()) + YT +  del + duplicate + Launch; 
     qattr += `<button onclick="MonitorGrade({id:'${dbid}', iq:'${i}', oid:'Grade${i}'});">Monitor</button>`;
     var qdes = DropDown(DescOptions,'Desc') + desc; 
     if(a.Choices) var qchoice = DropDown(ChoicesOptions,'Choices') + Q_Choices({id:dbid, i:i, Q:Q}); else var qchoice = ''; 

    if(a.Sketchpad) qdes += Sketchpad_Placeholder({uqid:`Desc${i}`, editable:1}); // Place holder for Sketpad
    
    var Grade = `<div id=Grade${i}></div>`; 
    var toggleCh= `<button onclick=" var t=$('.QT${i}${uqid} .toggleB').text(); db.doc('${dbid}').update({['Q.${i}.a.toggle']:t});">&#128204;</button>`;

    if(a.Soln) { var Soln = '<p/><b><u>Soln</u></b>'+IO_DescCKEditor(dbid, `Q.${i}.Soln`, Q.Soln?Q.Soln:'Soln', `${uqid}${i}Soln`,{});  } else var Soln=''; 

    var sDescCh = toggleCh + `<span class=QT${i}${uqid}>`+togglePM('<br/>'+ qdes + qchoice + Soln, a.toggle?a.toggle:'-')+'</span>'; 



    $('#'+oid).append(`<hr/>A${i})<span class=QDisplay1>${qattr} ${sDescCh} </span> ${Grade}  `); 

    if(a.Sketchpad) IO_drawingsList({id:dbid, List:`Desc${i}`, uqid:`Desc${i}`}); 


    iq++; 
  }

  



  MathJax.Hub.Queue(["Typeset",MathJax.Hub, 'Desc${uqid}' ]);

  $('#'+oid).append(`
      <hr/><button onclick="db.doc('${dbid}').update({'Q.${iq}':{} }); ">Add NewQ</button>
      <button onclick="$('#TARaw').toggle(); ">Raw</button>    
  `); 
}

var sketchpads={}, image=new Image();

function dbimg2canvas(id,cid) { 
  db.doc(id).get().then(docimg=>{ 
    if(docimg.exists) {
      image.src =docimg.data().png; image.width=640; image.height=480;
      img2canvas(image,cid); 
      //png2canvas(docimg.data().png, cid); 
    }
      
       });
}
function png2canvas(image,cid, s=null) { 
    setTimeout(function() {
        var canvas = document.getElementById(cid); 
        var ctx=canvas.getContext('2d'); 
        ctx.drawImage(image,0,0,canvas.width,canvas.height);
        if(s) s.redraw( s.strokes); 
      }, 100);

}
var intervalID={}, strCheck={};
function IO_SketchpadMenu(O) {     
  var dbid=O.id, ids=O.ids, uqid=O.uqid, d=O.d, ids=d.ids?d.ids:[]; 
  var ListID=dbid+'/drawing/'+(O.ListFile?O.ListFile:'List'); 
  var s='', iq=0, newid = firebase.firestore.Timestamp.now().toMillis(); 
  var w=d.w?d.w:800, h=d.h?d.h:600; 
  for (var i in ids) { var id=dbid+'/drawing/'+ids[i]; iq++; 
   s +=`<button class=B${uqid} onclick=" 
     $('#C${uqid}').show(); $('#Options${uqid}').show(); ToggleColor($(this));
     var data =$('#sketchpad${uqid}').data(); data.dbid = '${id}'; 
     db.doc('${id}.png').get().then(docimg=>{  var bgimg=false; 

       if(docimg.exists) { bgimg=true; image.src =docimg.data().png;      }

       db.doc('${id}').onSnapshot(function(doc) { //onSnapshot(function(doc) { //get().then(doc=>{
        var source = doc.metadata.hasPendingWrites ? 'Local' : 'Server';
        if(doc.data()) {
          if(source=='Server') {var d=doc.data(); d.element='#sketchpad${uqid}'; 
            sketchpads['${uqid}']=new Sketchpad(d); 
            if(bgimg) { png2canvas(image, 'sketchpad${uqid}',  sketchpads['${uqid}'] );   }
          }
        }
        else sketchpads['${uqid}']= new Sketchpad({element: '#sketchpad${uqid}', width: ${w},   height: ${h}, });
        //var CLIPBOARD = new CLIPBOARD_CLASS('sketchpad${uqid}', true);
      
       }); 
     })
    ">${iq}</button>
    `;
    
  }
  var addB = `
   <button onclick="db.doc('${ListID}').set({ids:{'${iq}':'${newid}'}, w:400, h:400}, {merge:true});">Small (400x400)</button>
   <button onclick="db.doc('${ListID}').set({ids:{'${iq}':'${newid}'}, w:800, h:600}, {merge:true});">Normal (800x600)</button>
   <button onclick="db.doc('${ListID}').set({ids:{'${iq}':'${newid}'}, w:1400, h:600}, {merge:true});">Large (1400x600)</button>
   <button onclick="db.doc('${ListID}').set({ids:{'${iq}':'${newid}'}, w:1200, h:600}, {merge:true});">Laptop (1150x600)</button>
`; 
  //if(O.editable) s += DropDown(addB,'+',{dpdown:'dblclick'}); 

  var SaveO = `
  <button onclick="db.doc($('#sketchpad${uqid}').data().dbid).set(sketchpads['${uqid}'].toObject());">Save</button>
  <button onclick="db.doc($('#sketchpad${uqid}').data().dbid).set(sketchpads['${uqid}'].toObject());">AutoSave</button>
  `;
  //var Save = DropDown(SaveO,'Save');
  var Save  = `<button id=Save${uqid} onclick=" var e = $('#sketchpad${uqid}'), dbid=e.data().dbid, dbidImg = dbid+'.png'; 
     db.doc(dbid).set(sketchpads['${uqid}'].toObject());
     if( $('#SaveInput${uqid}').prop('checked')) db.doc(dbidImg).set({png: document.getElementById('sketchpad${uqid}').toDataURL('image/png') });
     if(debug) console.log(dbid);
  ">Save</button>
   (<input id=SaveInput${uqid} type=checkbox />img

    | <input id=AutoSaveInput${uqid} type=checkbox onclick="
    var e = $('#sketchpad${uqid}'), dbid=e.data().dbid, dbidImg = dbid+'.png'; 
     if($(this).prop('checked')) {
       $('#Save${uqid}').prop('disabled', true); 
        intervalID['${uqid}'] = setInterval(function() { 
          if(!(strCheck['${uqid}'] === sketchpads['${uqid}'].toJSON()) ) { 
            strCheck['${uqid}'] = sketchpads['${uqid}'].toJSON(); 
            db.doc(dbid).set(sketchpads['${uqid}'].toObject()); 
            console.log('Saved ${uqid}');
          }
       },       1000);
      } else { $('#Save${uqid}').prop('disabled', false); 
        clearInterval(intervalID['${uqid}']);
      }
     

     
    " 
    disabled />Auto)

  `;


  var color = `
    <span style="background-color:#000000;"><input name=cp${uqid} type=radio  onclick="sketchpads['${uqid}'].color= '#000000'; sketchpads['${uqid}'].penSize= $('#pensize${uqid}').val(); "  /></span>
    <span style="background-color:#ff0000;"><input name=cp${uqid} type=radio  onclick="sketchpads['${uqid}'].color= '#ff0000'; sketchpads['${uqid}'].penSize= $('#pensize${uqid}').val(); "  /></span>
    <span style="background-color:#00ff00;"><input name=cp${uqid} type=radio  onclick="sketchpads['${uqid}'].color= '#00ff00'; sketchpads['${uqid}'].penSize= $('#pensize${uqid}').val(); "  /></span>
    <span style="background-color:#0000ff;"><input name=cp${uqid} type=radio  onclick="sketchpads['${uqid}'].color= '#0000ff'; sketchpads['${uqid}'].penSize= $('#pensize${uqid}').val(); "  /></span>
    <span style="background-color:#ffffff;"><input name=cp${uqid} type=radio  onclick="sketchpads['${uqid}'].color= '#ffffff'; sketchpads['${uqid}'].penSize=30;"  /></span>
  `;

  if(O.editable) var Duplicate = `
   <button onclick="
     db.doc('${dbid}/drawing/${newid}').set(sketchpads['${uqid}'].toObject()).then(()=>{
      db.doc('${ListID}').update({['ids.${iq}']:'${newid}'});
     });
    ">Duplicate</button>
    `;
  if(O.editable) var more = `
   <button onclick=" sketchpads['${uqid}'].redo(); ">&circlearrowright;</button>
   <button onclick=" sketchpads['${uqid}'].undo(); ">&circlearrowleft;</button>
   <!-- <button onclick=" sketchpads['${uqid}'].clear(); ">Clear ${uqid}</button> -->
   <button onclick=" 
     var sk=sketchpads['${uqid}'].toObject();  
     sketchpads['${uqid}']=new Sketchpad({element: '#sketchpad${uqid}', width: sk.width,   height: sk.height,});
    ">Clear</button>
   <input type=color onchange="  sketchpads['${uqid}'].color = $(this).val(); " />
   <input type=range id=pensize${uqid} value=2 min=1 max=20 onchange="  sketchpads['${uqid}'].penSize = $(this).val(); ">
`;
  if(O.editable) s +=  Duplicate  + DropDown(addB+more,'+',{dpdown:'dblclick'}) + color + Save; 

  return s;
}

function IO_drawingsList(O) {  var id=O.id, oid='menu'+O.uqid, List=O.List; 
  var ListFile=O.id+'/drawing/'+List; if(debug)  console.log(id,ListFile);
  
  db.doc(ListFile).onSnapshot(function(doc) {//db.doc(ListFile).get().then(doc=>{ 
    var d={}; if(doc.data()) d=doc.data(); else db.doc(ListFile).set({}); 
    $('#'+oid).html(IO_SketchpadMenu({id:O.id, ListFile:List, uqid:O.uqid, d:d, editable:(O.editable != null)?O.editable:1})); 
 })
}

function Sketchpad_Placeholder(O) { 
  var uqid=O.uqid, menu=O.menu?O.menu:'', editable=O.editable?O.editable:0, msg=O.msg?O.msg:'Sketches: '; 
  var Upload = editable?`<button onclick="CameraUpload({cid:'sketchpad${uqid}'});">&#128247; </button> `:'';
if(editable) {var cursor='allowed', pointerevents="auto";} else {var cursor='not-allowed', pointerevents="none"; }
  return   ` 
  <table border=0><tr><td align=left>${msg} <span id=menu${uqid}>${menu}</span>${Upload}</td></tr><tr>
    <td>
      <div id=C${uqid} class=SketchpadContainer style='cursor:${cursor}; pointer-events:${pointerevents}; display:none; width: 700,  height: 600'> 
       <canvas class="sketchpad" id="sketchpad${uqid}"></canvas>
      </div>
    </td>
  </tr></table>`;
}

// Converts image to canvas; returns new canvas element
function CameraUpload(O) { 
var s='', cid=O.cid?O.cid:'canvasC', vid=O.vid?O.vid:'video', w=O.w?O.w:640, h=O.h?O.h:480,facing=O.facing?O.facing:'environment'; 
$('.Screen5').show();
  s += `
  <center>
<video style='display:none;' id="video" width="${w}" height="${h}" autoplay></video>
<br/><button onclick="Video2Canvas({cid:'${cid}',vid:'video',facing:'${facing}'}); $('.Screen5').hide(); ">Capture</button>
<button data-facing=${facing} onclick=" 
 var d=$(this).data(); d.facing = (d.facing=='user')?'environment':'user'; $(this).text(d.facing);
 stopVideo('${vid}'); OpenCamera({cid:'${cid}',facing:d.facing});  ">${facing}</button>
 </center>
`; 

 $('#Screen5M').html(s);
 OpenCamera({cid:cid});
}
function OpenCamera(O) { var s='', cid=O.cid?O.cid:'canvasC', vid=O.vid?O.vid:'video'; 
  var video = document.getElementById(vid); 
  var facing = O.facing?O.facing:'environment';
  $('#'+cid).hide(); $('#'+vid).show(); 
  var constraints = { advanced: [{ facingMode: facing }] };
  if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: constraints }).then(function(stream) {
        video.srcObject = stream;
        video.play();
    });
  }
}


function stopVideo(vid) { var video = document.getElementById(vid); 
  video.srcObject.getVideoTracks().forEach(track => track.stop());
}
function Video2Canvas(O) { var cid=O.cid?O.cid:'canvasC', vid=O.vid?O.vid:'video'; 
  $('#'+cid).show(); $('#'+vid).hide(); 
  var canvas = document.getElementById(cid), context = canvas.getContext('2d'), video = document.getElementById(vid);
	context.drawImage(video, 0, 0, canvas.width, canvas.height);
  video.srcObject.getVideoTracks().forEach(track => track.stop());

}
function img2canvas(image, eid='canvas') {
	var canvas = document.getElementById(eid); //document.createElement("canvas");
	canvas.width = image.width; canvas.height = image.height;
	canvas.getContext("2d").drawImage(image, 0, 0, canvas.width,  canvas.height);
	return canvas;
}
function canvas2img(canvas) {	var image = new Image(); 	image.src = canvas.toDataURL("image/png"); 	return image; }
//--------------



function DropDown(s,k,O={}) { var uqid=uniqid2(), dpdown=(O.dpdown)?O.dpdown:'dpdown'; 
  return ` <div class="${dpdown}"><span onclick=" $('#${uqid}').toggle();">${k}</span><div id=${uqid} class="dpdown-content"> ${s} </div></div>`; 
}

function IO_Desc(id,k,v, O={}) { var eid=O.eid?O.eid:uniqid(); 
  if(O.editable) var s= `<span id=${eid} ondblclick=" var e=$(this); 
        if(e.attr('contenteditable')) {  e.attr('contenteditable', false);          
          db.doc('${id}').update({'${k}': $(this).html() }); 
        } else e.attr('contenteditable', true); 
       ">${v}</span>
       `;
  else var s= `<span id=${eid}>${v}</span>`;
  return s;
}



function Q_Choices(O) { var iq=0, i=O.i, id=O.id, oid=`Choices${i}`, a0=O.Q.a?O.Q.a:{}, uqid=uniqid(); 
   var type=a0.Type?a0.Type:'checkbox';
   var s='';
       for (var ii in O.Q.Choices) { var C=O.Q.Choices[ii], desc=C.Desc?C.Desc:'Change me', a=C.a?C.a:{}; 
         var del= `<button onclick=" db_delPKey('${id}', 'Q.${i}.Choices', '${ii}', 'renumber'); 
         ">&cross;</button>`; 
         s += '<br/>'+del;
         var sS='', sI=''; 
         if(type=='textarea') { sS += IO_TA({id:id, k:`Q.${i}.Choices.${ii}.v`, v:(C.v?C.v:'') });
         } else if(type=='input') {sS += IO_Input({id:id,k:`Q.${i}.Choices.${ii}.v`,v:(C.v?C.v:'') });
         } else {
          if(type=='radio') sS += IO_radio({id:id,k0:`Q.${i}`,k:`Q.${i}.Choices.${ii}`,v:desc, name:`AdminSelectChoices${i}`, ii:ii, checked:(a0.checked===ii)?'checked':''});
          else sS += IO_checkbox({id:id,k:`Q.${i}.Choices.${ii}`,v:desc, checked:a.checked?'checked':''}); 
         }  
         if(a0.ChoiceEditor=='input') sI += IO_Input({id:id,k:`Q.${i}.Choices.${ii}.Desc`,v:desc});
         else if(a0.ChoiceEditor=='textarea') sI += IO_TA({id:id,k:`Q.${i}.Choices.${ii}.Desc`,v:desc});
         else if(a0.ChoiceEditor=='CKEditor') sI += IO_DescCKEditor(id, `Q.${i}.Choices.${ii}.Desc`, desc, `${uqid}${ii}`,{}); 
         else  sI += IO_Desc(id,`Q.${i}.Choices.${ii}.Desc`,desc, {editable:1}); 
         
         if(type=='textarea' || type=='input') s += sI + sS; else s += sS + sI;
         iq++; 
       }
      s +=`<br/><button onclick="db.doc('${id}').update({'Q.${i}.Choices.${iq}':{} }); ">+</button> `;
  return s; 
}
function Q_Choices_S(O, OS) {  var user=email, u=dot2esc(user); 
   var iq=0, i=O.i, id0=O.id, id=O.id+'/users/'+user, oid=`Choices${i}`; 
   var aa=O.Q.a?O.Q.a:{}, aaS=OS.Q.a?OS.Q.a:{}, type=(O.Q.a && O.Q.a.Type)?O.Q.a.Type:'checkbox';
   var nTrial = (O.Q.a && O.Q.a.nTrial)?O.Q.a.nTrial:1;
   var submitted= (aaS.submitted || aa.inactive )?'disabled=disabled':'';
   var retry = (aaS.submitted && aa.retry)?`<button  id=Retry${i} style='padding: 10px;' onclick=" 
     db.doc('${id}').update({'Q.${i}.a.submitted': 0 }); 
     $('.Ch${i}S').prop('disabled', false); $('.Ch${i}').prop('disabled', false); $(this).prop('disabled', true);
     ">Retry</button>`:'';
   var showans = submitted && aa.showans?aa.showans:0; 
   var s='';
       for (var ii in O.Q.Choices) { 
         var C=O.Q.Choices[ii], desc=C.Desc?C.Desc:'', a=C.a?C.a:{}; 
         var CS=(OS.Q && OS.Q.Choices && OS.Q.Choices[ii])?OS.Q.Choices[ii]:{}, descS=CS.Desc?CS.Desc:'your input', aS=CS.a?CS.a:{}; 
         if(type=='radio') { var checked=(aaS.checked==ii)?'checked':'', color=(aa.checked==ii && showans)?'lightgreen':''; }
         else var checked=aS.checked?'checked':''; 
         s += '<br/>';
         if(type=='textarea') {
           s += desc+IO_TA({id:id, k:`Q.${i}.Choices.${ii}.v`, class:`Ch${i}`, v:CS.v?CS.v:'', disabled:submitted});
           if(showans) s += `<textarea rows=6 style='width: 100%; max-width: 100%; background-color: lightgreen;' disabled>`+(C.v?C.v:'')+'</textarea>';
         } else if(type=='input') {
           s += desc+IO_Input({id:id, k:`Q.${i}.Choices.${ii}.v`, class:`Ch${i}`, v:CS.v?CS.v:'', disabled:submitted});
           if(showans) s += `<input style='background-color: lightgreen;' value="`+(C.v?C.v:'')+'" disabled />';
         } else {
          if(type=='radio') {
            s +=  ` <input  class=Ch${i}S name=usersSelectChoices${i} value=${ii} type=radio onclick=" 
                db.doc('${id}').update({'Q.${i}.a.checked': $(this).val() });  
                db.doc('${id0}/users/OverallScore').update({['Q.${i}.${u}.Choices']: getCheckedValues('Ch${i}S') } );
            " ${submitted} ${checked} /> `; 
            //s += IO_radio({id:id,k0:`Q.${i}`,k:`Q.${i}.Choices.${ii}`,v:desc, class:`Ch${i}`, name:`usersSelectChoices${i}`, ii:ii, checked:checked, disabled:submitted, color:color});
          } else { color=(submitted && a.checked && showans)?'lightgreen':'';
            //s += IO_checkbox({id:id,k:`Q.${i}.Choices.${ii}`,v:desc, checked:checked, class:`Ch${i}`, disabled:submitted}); 
            s +=  `<input class='Ch${i}S' type=checkbox onclick="
               db.doc('${id}').update({'Q.${i}.Choices.${ii}.a.checked': $(this).prop('checked') });
               db.doc('${id0}/users/OverallScore').update({['Q.${i}.${u}.Choices']: getCheckedValues('Ch${i}S') } );
               if(debug) console.log('${id0}/users/OverallScore', 'Q.${i}.${u}.Choices', 'Ch${i}S');\")
              " ${submitted} ${checked} />` ; 

          }
          s += `<span style='background-color: ${color};'>`+IO_Desc(id,`Q.${i}.Choices.${ii}.Desc`,desc)+'</span>'; 
         }  
         iq++; 
       }
       if(O.Q.Choices && Object.keys(O.Q.Choices).length>0) {
         s += `<br/><button  class=Ch${i} style='padding: 10px;' onclick=" 
            $('.Ch${i}S').prop('disabled', true);  $('#Retry${i}').prop('disabled', false); $(this).prop('disabled', true);
            db.doc('${id}').update({'Q.${i}.a.submitted': 1 });
            db.doc('${id0}/users/OverallScore').update({['Q.${i}.${u}.submitted']: 1 } );
          " ${submitted}>Submit</button>`+retry; 
       }
  return s; 

}

function getCheckedValues(cid){ var ch={}; $('.'+cid).each(function(e){ch[e]=$(this).prop('checked'); }); return ch; }
function IO_radio(O){ var c=O.class?O.class:'sdisabled', id=O.id, k=O.k, checked=O.checked, name=O.name, k0=O.k0, desc=O.v, ii=O.ii, disabled=O.disabled?O.disabled:'', color=O.color?O.color:'', uqid=uniqid(); 
  return  ` <input  class=${c} name=${name} value=${ii} type=radio onclick=" db.doc('${id}').update({'${k0}.a.checked': $(this).val() });  " ${disabled} ${checked} /> `; 
}
function IO_checkbox(O){ var c=O.class?O.class:'sdisabled', id=O.id, k=O.k, checked=O.checked, desc=O.v, disabled=O.disabled?O.disabled:'', color=O.color?O.color:'', uqid=uniqid(); 
  return  `<input class=${c} type=checkbox onclick="db.doc('${id}').update({'${k}.a.checked': $(this).prop('checked') });" ${disabled} ${checked} />` ; 
}
function IO_TA(O){ var c=O.class?O.class:'sdisabled', id=O.id, k=O.k, v=O.v, disabled=O.disabled?O.disabled:'', uqid=uniqid(); 
  return `<textarea class=${c} style="width: 100%; max-width: 100%;" rows=6 onchange="$('#msg${uqid}').html('Saved'); db.doc('${id}').update({'${k}': $(this).val() });  " ${disabled}>${v}</textarea><div id=msg${uqid}></div>`; 
}
function IO_Input(O){ var c=O.class?O.class:'sdisabled', id=O.id, k=O.k, v=O.v, disabled=O.disabled?O.disabled:'', uqid=uniqid(); 
  return `<input class=${c}  onchange="db.doc('${id}').update({'${k}': $(this).val() }); " value="${v}" ${disabled}></input>`; 
}




var tag = document.createElement('script');
tag.src = "https://www.youtube.com/player_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var videoId = 'M7lc1UVf-VE';
var startSeconds = 36, dt=10;
var endSeconds = startSeconds+dt;


var player;

var playerConfig = {
  height: '360',
  width: '640',
  //videoId: videoId,
  playerVars: {
    autoplay: 0, // Auto-play the video on load
    controls: 1, // Show pause/play buttons in player
    showinfo: 1, // Hide the video title
    modestbranding: 1, // Hide the Youtube Logo
    fs: 0, // Hide the full screen button
    cc_load_policy: 0, // Hide closed captions
    iv_load_policy: 3, // Hide the Video Annotations
    //start: startSeconds,     end: endSeconds,
    autohide: 0, // Hide video controls when playing
  },
  events: {     'onStateChange': onStateChange //,     'onReady': onPlayerReady
  }
};


var i=0, done=false; 
function onYouTubePlayerAPIReady() {  player = new YT.Player('player', playerConfig);}
function onPlayerReady(O) {player.loadVideoById({videoId: O.videoId, startSeconds: O.t1, endSeconds: O.t2});}
function onStateChange(state) {
  if(state.data===0) {$('#player').hide(); var d=$('#player').data(); $('#'+d.showid).show(); } else 
  { $('#player').show();   }
}