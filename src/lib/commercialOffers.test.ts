import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { offerCatalog, catalogOfferItem } from './commercialOffers';
describe('Vesuviano commercial offer catalog', () => {
  const ovens=[{id:'1',model_name:'Real Bosco',fuel_type:['Legna','Gas','Elettrico','Rotante'],image_url:'',sizes:[{diameter:100,can_be_built_on_site:true,coatings:[{name:'Mosaico',prices:{listA:{base:1000,electric:2000,rotating:3000,onSite:4000},listReseller:{base:700,electric:1400,onSite:2800}}}]}]}];
  it('wood and gas share base while electric rotating and onsite keep independent values',()=>{
    assert.deepEqual(offerCatalog(ovens,[],'A').map(item=>item.price),[1000,1000,2000,3000,4000]);
  });
  it('reseller is independent and never invents a rotating price',()=>assert.deepEqual(offerCatalog(ovens,[],'Reseller').map(item=>item.price),[700,700,1400,null,2800]));
  it('burner B/C retain their own prices and fallback only when missing',()=>{
    const burners=[{id:'1',name:'Bruciatore',price:500,price_b:400,price_c:null}];
    assert.equal(offerCatalog([],burners,'B')[0].price,400);assert.equal(offerCatalog([],burners,'C')[0].price,500);assert.equal(offerCatalog([],burners,'Reseller')[0].price,null);
  });
  it('prezzi mancanti non diventano omaggi e valuta estera richiede prezzo concordato',()=>{
    const product={key:'oven:1',name:'Real Bosco',description:'',image_url:'',price:1000};
    assert.throws(()=>catalogOfferItem({...product,price:null},'EUR'));
    assert.equal(catalogOfferItem(product,'EUR').item.unit_price,1000);
    assert.equal(catalogOfferItem(product,'EUR').requiresManualPrice,false);
    assert.equal(catalogOfferItem(product,'GBP').requiresManualPrice,true);
  });
});