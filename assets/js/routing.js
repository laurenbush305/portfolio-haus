(function () {
 'use strict';
 var start = document.body.dataset.contactUrl;
 var founders = document.body.dataset.foundersUrl;
 window.PortfolioHausRoute = function(path,diagnosis) {
  var query = '?path='+encodeURIComponent(path)+'&diagnosis='+encodeURIComponent(diagnosis);
  if(diagnosis==='Deadline Mode' || path==='opportunity') return {offer:'Opportunity inquiry',offerdesc:'Share the live proposal, funding opportunity, required materials, and deadline. Scope and availability are confirmed after review.',cta:'Start an opportunity inquiry',url:start+'?path=opportunity&diagnosis='+encodeURIComponent(diagnosis)};
  if(path==='founders') {
   if(diagnosis==='Receipt Gap') return {offer:'Receipts That Travel™',offerdesc:'Turn existing work, results, and expertise into reusable credibility assets. New to Portfolio Haus? The Founder Message Audit establishes the starting point.',cta:'Explore Receipts That Travel™',url:founders+'#receipts'};
   return {offer:'Founder Message Audit',offerdesc:'The first paid doorway for founder messaging. Diagnose what is unclear, then consider Name the Headline™ Sprint when the core claim and hierarchy need tightening.',cta:'Start with the Founder Message Audit',url:start+query+'&offer=audit'};
  }
  if(path==='institutions') return {offer:'Institutional / Doctrine Build™ inquiry',offerdesc:diagnosis==='Receipt Gap'?'Scope institutional proof and evidence support: connect the claims, sources, and materials your decision audience needs.':'Use Diagnose, Design, Deliver to clarify the message, align the audience, and produce usable materials with a clear handoff.',cta:'Start an institutional inquiry',url:start+query};
  return {offer:'A scoped conversation',offerdesc:'Share the work, the audience, and what needs to hold. Portfolio Haus will help identify a useful starting point.',cta:'Start an inquiry',url:start+query};
 };
})();
