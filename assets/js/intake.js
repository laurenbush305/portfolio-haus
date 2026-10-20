(function () {
 'use strict';
 var form = document.getElementById('intake-form');
 if (!form) return;
 var params = new URLSearchParams(window.location.search);
 var paths = ['institutions','founders','opportunity','unsure'];
 var offers = { audit:'Founder Message Audit', headline:'Name the Headline™ Sprint', receipts:'Receipts That Travel™' };
 var diagnoses = ['Missing Headline','Receipt Gap','Audience Fog','Deadline Mode','Handoff Risk','Ready to Travel'];
 if (paths.indexOf(params.get('path')) !== -1) form.elements.path.value = params.get('path');
 if (Object.prototype.hasOwnProperty.call(offers, params.get('offer'))) form.elements.offer.value = offers[params.get('offer')];
 if (diagnoses.indexOf(params.get('diagnosis')) !== -1) form.elements.diagnosis.value = params.get('diagnosis');
 var button = document.getElementById('intake-submit');
 button.disabled = false;
 if (form.dataset.handler === 'connected') return; // Native POST to the configured handler; no simulated success.
 var review = document.getElementById('inquiry-review');
 var output = document.getElementById('inquiry-text');
 var status = document.getElementById('intake-status');
 form.addEventListener('submit',function(e) {
  e.preventDefault();
  if (!form.reportValidity()) return;
  var fields = [['Name','name'],['Organization / business','organization'],['Email','email'],['Path','path'],['What I am working on','project'],['Who needs to understand it','audience'],['What feels unclear or unfinished','unclear'],['Deadline / decision date','deadline'],['Materials that exist','materials'],['Support needed','support'],['Budget range','budget'],['Offer of interest','offer'],['Diagnostic result','diagnosis']];
  var text = ['PORTFOLIO HAUS INQUIRY',''];
  fields.forEach(function(pair) {
   var control = form.elements[pair[1]];
   var value = control.tagName === 'SELECT' ? control.options[control.selectedIndex].text : control.value.trim();
   if (value) text.push(pair[0]+':',value,'');
  });
  output.value = text.join('\n');
  review.hidden = false;
  status.textContent = '';
  document.getElementById('review-heading').focus();
  var email = document.querySelector('.footer-inner a[href^="mailto:"]').getAttribute('href');
  // Keep the complete inquiry in the selectable text and download. Mailto lengths vary by client.
  document.getElementById('inquiry-email').href = email+'?subject='+encodeURIComponent('Portfolio Haus inquiry — '+form.elements.organization.value.trim())+'&body='+encodeURIComponent('Hello Lauren,\n\nI prepared an inquiry on portfolio.haus. I will paste the full inquiry here or attach the downloaded text file.');
 });
 document.getElementById('inquiry-copy').addEventListener('click', function() {
  if (navigator.clipboard && navigator.clipboard.writeText) {
   navigator.clipboard.writeText(output.value).then(function(){status.textContent='Copied. Paste it into your email and send it when you are ready.';},fallback);
  } else fallback();
  function fallback(){output.focus();output.select();status.textContent='Select and copy the inquiry above, or use Download .txt.';}
 });
 document.getElementById('inquiry-download').addEventListener('click',function() {
  var url = URL.createObjectURL(new Blob([output.value],{type:'text/plain;charset=utf-8'}));
  var a = document.createElement('a'); a.href=url; a.download='portfolio-haus-inquiry.txt'; document.body.appendChild(a);a.click();a.remove();
  setTimeout(function(){URL.revokeObjectURL(url);},1000);
  status.textContent='Downloaded. Attach the file to your email to Portfolio Haus.';
 });
})();
