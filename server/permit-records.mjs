export const permitFeed='https://services.arcgis.com/v400IkDOw1ad7Yad/ArcGIS/rest/services/Building_Permits_Issued_Past_180_Days/FeatureServer/0';
export function normalizePermit(a,now=Date.now()){
 if(a.publisher!=='City of Raleigh'||!a.permitnum||!a.issueddate||a.issueddate>now||now-a.issueddate>180*86400000)return null;
 const text=[a.permittype,a.description,a.proposedworkdescription].join(' ').replace(/\b(?:no|without|not adding)\s+(?:additional\s+|new\s+)?(?:HVAC(?: equipment)?|electrical(?: work)?|plumbing(?: work)?|roofing)\b/gi,'');
 // Mechanical includes non-HVAC work, so require explicit heating/cooling evidence.
 const services=[];
 if(/\b(?:hvac|air condition(?:ing|er)?|heat pump|furnace|chiller|boiler|air handler|heating|ductwork)\b/i.test(text))services.push('HVAC');
 if(/\b(?:electrical|electric|circuits?|panel|rewir|lighting)\b/i.test(text))services.push('Electrical');
 if(/\b(?:roof|roofing|reroof|re-roof)\b/i.test(text))services.push('Roofing');
 if(/\b(?:plumbing|water heater|backflow|sewer)\b/i.test(text))services.push('Plumbing');
 if(/\b(?:landscap(?:ing|e)|irrigation|grounds|planting|sod|tree removal)\b/i.test(text))services.push('Landscaping');
 if(!services.length)services.push('General construction');
 return {id:String(a.permitnum),city:'Raleigh',services,issuedAt:new Date(a.issueddate).toISOString().slice(0,10),description:String(a.description||a.proposedworkdescription||'').slice(0,1000),address:String(a.originaladdress1||''),workClass:String(a.workclass||''),propertyClass:String(a.permitclassmapped||''),status:String(a.statuscurrentmapped||a.statuscurrent||''),valuation:Number(a.estprojectcost)>0?Number(a.estprojectcost):null,sourceUrl:permitFeed+'/query?'+new URLSearchParams({f:'pjson',where:`OBJECTID=${Number(a.OBJECTID)}`,outFields:'permitnum,issueddate,description,estprojectcost,statuscurrentmapped,originaladdress1',returnGeometry:'false'}),fetchedAt:new Date(now).toISOString()};
}
