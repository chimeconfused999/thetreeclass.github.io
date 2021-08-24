function EditA(id){
  db.doc(id).get().then((doc) => {  var d=doc.data();
    $('#'+'TAAID').val(JSON.stringify(d));
 })
 alert(id);
}
class getdb {
  constructor(id) {  db.doc(id).get().then((doc) => {  this.data =doc.data(); })  };
}
function ToggleText(O) {   var c = $(O).text(), oid = $(O).attr('mainid');   $('#'+oid).html(c); }
function ToggleBold(O) {   var c = $(O).attr('class');    $('.'+c).css("font-weight","Normal");   $(O).css("font-weight","Bold"); }
function ToggleColor(O) {  var d=$(O).data(), c = $(O).attr('class'); $('.'+c).css("background-color", ""); $(O).css("background-color", d.color?d.color:'yellow'); }
class Assessment {
    constructor(O) { 
      for(var k of Object.keys(O)) {this[k] = O[k];} 
      if(!O.hasOwnProperty('col')) this['col'] = 'Q'; 
      if(!O.hasOwnProperty('id')) this['id'] = 'test1'; 
      if(!O.hasOwnProperty('oid')) this['oid'] = 'ContentRight';
      this['uqid']=uniqid();  
      //console.log(this);
    }; 
    
    Grade(O) { var s='', id1=O.id1+'/user/submitted', id2=O.id2+'/user/submitted'; 
      db.doc(id1).get().then(doc1=>{ 
        var d1=doc1.data(); 
        db.doc(id2).get().then(doc2=>{var d2=doc2.data();
          s += this.CalculateScore(id2, d1, d2); 
          //console.log(id2, d1,d2.input);
          $('#'+O.oid).html(s);
        })
      })
    }
    CalculateScore(id, d1,d2) { var s='', Tscore=0, iq=0, isScored=d2.score?1:0, uqid=uniqid(); d2.score=[]; 
      s += `<tr><th width=30%>Instructor</td><th width=30%>${email}</td><th>Score</td></tr>`; 
      for(var k in d1.input) { var v1=d1.input[k].toLowerCase(), v2=d2.input[k].toLowerCase(); 
        var score=(v1==v2)?100:0; d2.score.push(score); 
        var scoreS = (role=='instructor')?`<input value=${score} />`:score; 
        s += `<tr><td>${v1}</td><td>${v2}</td><td>${scoreS}</td></tr>`; 
        Tscore += score; iq++; 
      }
      Tscore = Tscore/(iq>0?iq:1); 
      s += `<tr><td>Total (%) </td><td></td><td>${Tscore}</td></tr>`; 
      if(!isScored) db.doc(id).update({score:d2.score});
      var ss = `<table id=${uqid} width=100% border=1>`+s+'</table>';   
      $(`#${uqid} :text`).on('input', function(){  db.doc(id).update({score:getAllInputValues(`#${uqid} input`)});    });
       
       if(debug) console.log(ss);

      return ss; 
    }
    EditRaw(O){ 
      var id = O.id?O.id:this.id, oid=O.oid?O.oid:this.oid, oid2=O.oid2?O.oid2:'Middle2', col=O.col?O.col:'/COURSES/Math-9th/Q';
      var s='', sq='Q2A <br/>', s2='', uqid=uniqid(); 
      
      var semail=(role=='instructor' || role=='student')?email:role; 
      var sid=`/users/${semail}/${id}`; sid = `${sid.replace(/\/\//g, '\/')}`;

      var ioID = (role=='instructor')?`${id}/user/submitted`:`${sid}/user/submitted`; ioID = `${ioID.replace(/\/\//g, '\/')}`;
      if(debug) s += sid; 
      db.doc(id).get().then((doc) => {  var d=doc.data(), iq=0; 
        //for (var qid of d.Q) { iq++; s += `<button data-id=${qid} data-oid=QuickQ onclick="LoadOneQ($(this).data());">${iq}</button>`; }
        var Qs=d.Q?d.Q:[], Qstr=JSON.stringify(Qs); 
        if(d.Q) s += '<span id=QinAssessment>'+this.Array2Qstr(d.Q, {oid:oid2, class:'LoadOne'})+'</span>'; 
        s +='<textarea rows=10 style="width: 100%; max-width: 100%; display:none;" id=ARaw>'+JSON.stringify(d, null, 2)+'</textarea>';
        if(Qs.length) s += `<button class=LoadOne onclick='LoadQ({id:${Qstr}, oid:"${oid2}"}); ToggleColor(\$(this)); '>All</button>`; 

        if(role=='instructor') {

          s += '<button data-id='+id+' data-inid=ARaw onclick="new Assessment({}).SaveRaw($(this).data());">Save</button>';
          s += '<p/><button onclick=" $('+"'#ARaw'"+').toggle();">Raw</button>'

          //s += '<button  data-aidta=ARaw onclick="new Assessment({}).HighLightQ($(this).data());">Selected</button>';
          //s += '<button  data-msg="Q:" data-oid=ListAQ data-id='+id+' onclick="new Assessment({}).LoadOne($(this).data());">Load</button>';
          s += `<p/><button  data-oid=${oid2} data-aidta=ARaw onclick="var d=$(this).data(); d.col=$('#ListQcol').val(); new Assessment({}).ListQ(d); ">ListQ</button>`;
          s += `<button  data-oid=${oid2} data-aidta=ARaw onclick="var d=$(this).data(); d.col=$('#ListQcol').val(); new ListQ(d).NewQ(); ">NewQ</button>`;

          s += `<input id=ListQcol value='${colhome}/Q'/>`; 
          s += `<input id=WhereKey size=3 value='group'/> = <input id=WhereValue size=3 value=''/>`; 


        }

        s += '<br/>';
        s += '<div  id=ListAQ></div>'; 
        s += '<div  id=QuickQ></div><hr/>';
        s += '<div  id=ListQ></div>'; 
   
        var postgrade = (d.a.postgrade)?0:1, color=''; 
        if(d.a.postgrade) { color='lightgreen';
          s += `<button data-id1=${id} data-id2=${sid} data-oid=Middle12 onclick="A.Grade(\$(this).data()); $('#Middle12').toggle(); ">Graded</button>`; 
        }
        if(role=='instructor') s += ` | Grade:<button style='background-color:${color}' onclick="db.doc('${id}').update({'a.postgrade':${postgrade}}); ">Post</button>`; 

        var k='Desc'; s2 += DisplayByKey(id, k, d[k], k+uqid, {tb:'ckfull'}); 

        $('#'+oid).html(s);         $('#'+oid2).html(s2); 
        MathJax.Hub.Queue(["Typeset",MathJax.Hub, oid2 ]);
        $(`#${oid2} :text`).on('input', function(){  db.doc(ioID).set({input:getAllInputValues(`#${oid2} input`)});    });
        setTimeout(function() {
          db.doc(ioID).get().then(function(doc) {  
            if(!doc.exists) return;
            LoadAllInputValues(`#${oid2} input`, doc.data().input);  
          })
        }, 100);
        if(debug) console.log('A.js:EditRaw()',O, oid2); 
     })
      
    }
    SaveRaw(O){  //console.log(O);
      var d = JSON.parse( $('#'+O.inid).val()); 
      d.modifier={'at':firebase.firestore.Timestamp.now().toMillis(), 'by':firebase.auth().currentUser.email};
      db.doc(O.id).set(d); 
    }

    Q2TA(O) { var taid=O.aidta; 
      var d=JSON.parse($('#'+taid).val()), index = d.Q.indexOf(O.qid);
      index === -1 ?  d.Q.push(O.qid) : d.Q.splice(index, 1);;
      $('#'+taid).val(JSON.stringify(d, null, 2));
      $('#QinAssessment').html(this.Array2Qstr(d.Q));

      //console.log(d); 
    }
    ListQ(O) { var col=O.col;  //console.log(O); return;
      var WhereKey = $('#WhereKey').val(), WhereValue = $('#WhereValue').val();
      if(WhereValue=='') {
        db.collection(col).get().then((qS) => {  this.ListQFromData(qS,O); }); 
      } else {
        db.collection(col).where('a.'+WhereKey,'==',WhereValue).get().then((qS) => { this.ListQFromData(qS,O);       });
      }
      if(debug) console.log('A.js:ListQ', O)
      return true;
    }
    ListQFromData(qS, O) { var col=O.col; 
      var s=O.msg?O.msg:'', iq=0;
      qS.forEach((doc) => { iq++; var qid = col+'/'+doc.id; 
        var d = ` data-qid=${qid} data-aidta=${O.aidta} data-col=${col} `;
        s +='<button class=QList '+ d + ' onclick=" \
         var Anew=new Assessment({}); Anew.Q2TA($(this).data()); Anew.HighLightQ($(this).data()); ToggleBold($(this)); \
         ">'+iq+'</button>';
      });
      $('#'+O.oid).html(s);
      this.HighLightQ({aidta:O.aidta});
    }
    ListQ2(O) { var col=O.col;  //console.log(O); return;
      db.collection(col).get().then((qS) => { var s=O.msg?O.msg:'', iq=0;
        qS.forEach((doc) => { iq++; var qid = col+'/'+doc.id; 
          s +=`<button class=QList data-qid=${qid} data-aidta=${O.aidta} data-col=${col} onclick=" 
           var Anew=new Assessment({}); 
           Anew.Q2TA($(this).data()); 
           Anew.HighLightQ($(this).data()); 
           ToggleBold($(this)); 
           ">${iq}</button>`;
        });
        $('#'+O.oid).html(s);
        this.HighLightQ({aidta:O.aidta});
      });
      if(debug) console.log('A.js:ListQ', O)
      return true;
    }

    HighLightQ(O) {      var Q=O.Q?O.Q:JSON.parse($('#'+O.aidta).val())['Q'];
      $(".QList").css("background-color", "");
      for (var qid of Q) {  $("[data-qid='"+qid+"']").css("background-color", "yellow"); } 
    }
    List(O){  var col = O.col?O.col:this.col, oid=O.oid; 
        db.collection(col).get().then((qS) => { 
            var s = '', iq=0; 
                 qS.forEach((doc) => {  iq++; var aid=col+'/'+doc.id; var n=iq;
                   //var n=(doc.data().a.name)? doc.data().a.name:iq;
                   var d = ' data-id='+aid+' data-oid='+O.oid;
                   s +='<button class=AList '+ d + ' onclick=" \
                   new Assessment({}).EditRaw($(this).data()); ToggleBold($(this)); ToggleColor($(this)); \
                   ">'+iq+'</button>';
                   //console.log(doc.data().a.name?1:2);
                 });

                 s += '<div  id=TAAID></div>'; 


                 $('#'+oid).html(s);
                 console.log(s); 
          });
    }
    Setup(O){  var col = O.col?O.col:this.col, oid=O.oid, uqid=uniqid(); 
      db.collection(col).get().then((qS) => { 
          var s = '', iq=0; 
               qS.forEach((doc) => {  iq++; var aid=col+'/'+doc.id, n=doc.data().a.name?doc.data().a.name:iq; 
                 s +=`<button data-id=${aid} data-oid=QList${uqid} data-col='${col}' data-oid2=QDisplay${uqid} class=AList 
                 onclick="
                   new Assessment({}).EditRaw(\$(this).data()); //new Assessment({}).LoadOne(\$(this).data()); 
                   ToggleBold(\$(this)); 
                   ToggleColor(\$(this)); 
                 "  
                 ondblclick=" var e=\$(this), editable = e.attr('contenteditable'); 
                   if(editable=='true') {
                      e.attr('contenteditable','false'); var name=e.html();
                      db.doc('${aid}').update({'a.name':name}); 

                  } else  e.attr('contenteditable','true');
                  "
                 >${n}</button><br/>`;
               });
              
               if(role=='instructor') {
                s +=`<p/><button data-col=${col} data-oid=Middle2 onclick=" A.New({col:'${col}'}); A.Setup(\$(this).data()); ">Add New</button>`;
               }

               var ss=`
               <table border="1" width=100%  CourseID=${col}>
               <tr >
               <td width=10% id=AList${uqid} valign=top> ${s}</td> 
               <td id=QDisplay${uqid} valign=top> </td> 
               <td width=10% id=QList${uqid} valign=top></td> 
               </tr>
               </table>
               `; 

               $('#'+oid).html(ss);
        });
        if(debug) console.log('A.js: Setup', O);
  }  
   ListOne(O){  var id=O.id?O.id:this.id, oid=O.oid?O.oid:this.oid; 
    db.doc(id).get().then((doc) => {  
       var s='<button onclick="EditQ('+"'"+doc.id+"'"+');">'+doc.id+'</button>';
       $('#'+oid).html(s);
    })
    if(debug) console.log('A.js ListOne', O);
   }

   LoadOne(O){  
     var cid=O.cid?O.cid:'/COURSES/Math-9th/Q'; 
     db.doc(O.id).get().then((doc) => {  var d=doc.data(), Desc=d.Desc?d.Desc:'', uqid=uniqid();
     var s='', s2='', iq=0, Qs=doc.data().Q, oid=O.oid2?O.oid2:'Middle12', Qstr=JSON.stringify(Qs), id=O.id;
     var k='Desc'; s2 += DisplayByKey(O.id, k, d[k], k+uqid, {tb:'ckbasic'}); 

     for (var qid of Qs) { 
      s2 += `<span id=${oid}-${iq}></span>`;  
      iq++; 
      s += `<button class=LoadOne data-id=${qid} data-oid=${oid} onclick="LoadOneQ($(this).data()); ToggleBold(\$(this)); ToggleColor(\$(this)); ">${iq}</button>`; 
     }
     if(Qs.length) s += `<button class=LoadOne onclick='LoadQ({id:${Qstr}, oid:"${oid}"}); ToggleColor(\$(this)); '>All</button>`; 
     if(role=='instructor') {
       s +=`<br/><button onclick=" EditRawByID('${id}', '${oid}');  ">Edit</button>`;
       s += `<p/><button  onclick="var col=\$('#ListQcol').val(); A.ListQ2({col:col, oid:'${oid}'}); ">AddQ</button>`;
       s += `<input id=ListQcol value='${cid}'/>`; 
    }


      $('#'+O.oid).html(s);  //     $('#'+O.oid).html(this.Array2Qstr(doc.data().Q)); 
      $('#'+oid).html(s2); 
      MathJax.Hub.Queue(["Typeset",MathJax.Hub, oid ]);

     })   
    
    if(debug) console.log('LoadOne', O); 
   }

   Array2Qstr(Q, O) { if(arguments.length<2) var O={}; 
    var s='', iq=0, oid=O.oid?O.oid:'Middle12', c=O.class?O.class:'LoadOne';
    for (var qid of Q) { iq++; 
      s += `<button class=${c} data-id=${qid} data-oid=${oid} onclick="LoadOneQ($(this).data()); ToggleBold(\$(this)); ToggleColor(\$(this));">${iq}</button>`; 
    }
    return s; 
   }

   ListDropdown(O){  var col = O.col?O.col:this.col, oid=O.oid, mainid=O.mainid, name=O.name?O.name:"A"; 
    db.collection(col).get().then((qS) => { 
        var s='',iq=0; 
         qS.forEach((doc) => {  iq++; var aid=col+'/'+doc.id; var n=iq;
            s +=`<a href="#" mainid=${mainid} class=AList onclick="A.LoadOne({id:'${aid}', oid:'Top21'}); ToggleBold($(this)); ToggleColor($(this)); ToggleText($(this)); ">${iq}</a>`;
          });
          var ss = O.v==2? `<div class="column"><div class="row">${s}</div></div>`:s; 
          s= `<div class="dropdown"><button id=${mainid} class="dropbtn">${name}</button><div class="dropdown-content"> ${ss} </div></div>`; 
          $('#'+oid).html(s);
          if(debug) console.log(s);
      });
 
}

    
   New(O){ var col=O.col?O.col:this.col; 
     var qid='%s%s'.format(firebase.firestore.Timestamp.now().toMillis(),getRandomNumber(100000,999999));
     console.log(qid);
     db.collection(col).doc(qid).set(
       {
        'Q':[],
        'Desc':'Desc',
         'a':{'name':'New'}, 
         'creater':{
             'at':firebase.firestore.Timestamp.now().toMillis(), 
             'by':firebase.auth().currentUser.email
            },
            'modifier':{
                'at':firebase.firestore.Timestamp.now().toMillis(), 
                'by':firebase.auth().currentUser.email
               }
        }
       ); 
       if(debug) console.log(`New Assessment '${col}/${qid}' created!`);
    }
  }
