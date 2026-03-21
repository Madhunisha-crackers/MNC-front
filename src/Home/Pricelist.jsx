import {useEffect,useRef,useState,useCallback,useMemo} from 'react'
import * as THREE from 'three'
import {API_BASE_URL} from '../../Config'

const C={wall:0xfff8f0,shelf:0xd4a76a,shelfDark:0xa0784a,sign:0xcc2200,counter:0x2d5a2d,cartMetal:0x888888,black:0x111111}

const mat=(c,r=0.85,m=0)=>new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m})
const nMat=(c,i=2)=>new THREE.MeshStandardMaterial({color:c,emissive:c,emissiveIntensity:i,roughness:1})

function bx(w,h,d,m){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.castShadow=true;o.receiveShadow=true;return o}
function cy(r,h,m,s=16){const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,s),m);o.castShadow=true;return o}

function labelTex(lines,W=256,H=128,bg='#cc2200'){
  const cv=document.createElement('canvas');cv.width=W;cv.height=H
  const ctx=cv.getContext('2d')
  ctx.fillStyle=bg;ctx.fillRect(0,0,W,H)
  let y=18
  for(const l of lines){
    ctx.font=`${l.bold?'bold ':''}${l.size||22}px "Arial Black",Arial,sans-serif`
    ctx.fillStyle=l.color||'#fff';ctx.textAlign='center'
    ctx.fillText(l.text,W/2,y);y+=(l.size||22)*1.38+(l.gap||0)
  }
  return new THREE.CanvasTexture(cv)
}

function planeMesh(tex,w,h){
  return new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tex,transparent:true,depthWrite:false,side:THREE.DoubleSide}))
}

function buildFloor(scene,W,D){
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(W,D),mat(0xf0e0c8,0.85))
  floor.rotation.x=-Math.PI/2;floor.position.set(0,0,-D/2);floor.receiveShadow=true;scene.add(floor)
  for(let i=0;i<=Math.ceil(W);i+=2){const l=bx(0.03,0.01,D,mat(0xccbbaa,0.9));l.position.set(-W/2+i,-0.005,-D/2);scene.add(l)}
  for(let j=0;j<=Math.ceil(D);j+=2){const l=bx(W,0.01,0.03,mat(0xccbbaa,0.9));l.position.set(0,-0.005,-j);scene.add(l)}
}

function buildWalls(scene,W,D){
  [[W,6,0.2,0,3,-D],[0.2,6,D+1,-W/2,3,-D/2],[0.2,6,D+1,W/2,3,-D/2],[W,0.15,D+1,0,6,-D/2]]
    .forEach(([w,h,d,x,y,z])=>{const m=bx(w,h,d,mat(C.wall,0.9));m.position.set(x,y,z);scene.add(m)})
  const sb=bx(7,2.2,0.15,mat(C.sign));sb.position.set(0,5,-D+0.06);scene.add(sb)
  const st=planeMesh(labelTex([{text:'MADHU NISHA CRACKERS',bold:true,size:32,color:'#ffff00'},{text:'Premium Firecrackers Store',size:18,color:'#ffddaa'}],640,160,'#cc2200'),6.6,1.9)
  st.position.set(0,5,-D+0.18);scene.add(st)
  ;[[-3.6,5,-D+0.22],[3.6,5,-D+0.22]].forEach(([x,y,z])=>{const p=bx(0.1,2.3,0.1,nMat(0xff6600));p.position.set(x,y,z);scene.add(p)})
  for(let lx=-W/2+3;lx<W/2;lx+=5){
    const s=bx(0.18,0.06,D*0.55,nMat(0xfffff0,1.6));s.position.set(lx,5.9,-D/2);scene.add(s)
    const l=new THREE.PointLight(0xfffce8,1.2,14);l.position.set(lx,5.5,-D/2);scene.add(l)
  }
}

function buildEntrance(scene,W){
  const am=mat(0xddbb88,0.8)
  ;[[-W/2+0.15,2.25,0.1],[W/2-0.15,2.25,0.1]].forEach(([x,y,z])=>{const p=bx(0.3,4.5,0.3,am);p.position.set(x,y,z);scene.add(p)})
  const beam=bx(W,0.35,0.35,am);beam.position.set(0,4.7,0.1);scene.add(beam)
  const ws=planeMesh(labelTex([{text:'WELCOME',bold:true,size:32,color:'#ffff00'},{text:'Aim crosshair at product → tap ADD',size:13,color:'#88ffaa'},{text:'Walk to Billing Counter to checkout',size:12,color:'#ffddaa'}],400,128,'#1a3a1a'),3.8,1.2)
  ws.position.set(0,5.1,0.22);scene.add(ws)
}

function buildDecorations(scene,W){
  const cols=[0xff0000,0xffaa00,0xffff00,0x00ff00,0x0044ff,0xff00ff]
  for(let i=0;i<8;i++){const f=bx(0.22,0.16,0.02,mat(cols[i%6]));f.position.set(-W/2+1+i*2.2,5.5,-1.5);scene.add(f)}
  const em=bx(W*0.4,0.02,1.4,mat(0x882200,0.95));em.position.set(0,-0.01,-0.7);scene.add(em)
}

// Returns array of product meshes built inside this shelf
function buildShelf(scene,x,z,ry,label,products){
  const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=ry
  const SW=3.2,SH=3.4,SD=0.52
  const ROWS=3,COLS=4
  const back=bx(SW,SH,0.06,mat(C.shelfDark));back.position.set(0,SH/2,-SD/2+0.03);g.add(back)
  ;[-SW/2,SW/2].forEach(sx=>{const side=bx(0.06,SH,SD,mat(C.shelfDark));side.position.set(sx,SH/2,0);g.add(side)})
  const topCap=bx(SW+0.12,0.08,SD+0.1,mat(C.shelf));topCap.position.set(0,SH+0.04,0);g.add(topCap)
  const rowSpacing=SH/ROWS
  for(let s=0;s<=ROWS;s++){const sh=bx(SW,0.06,SD,mat(C.shelf));sh.position.set(0,s*rowSpacing+0.06,0);g.add(sh)}
  if(label){
    const lb=bx(2.4,0.52,0.14,mat(C.sign));lb.position.set(0,SH+0.38,0);g.add(lb)
    const lp=planeMesh(labelTex([{text:label,bold:true,size:22}],256,64,'#cc2200'),2.2,0.48)
    lp.position.set(0,SH+0.38,0.08);g.add(lp)
  }
  const pz=SD/2-0.04
  const boxColors=[0xff5544,0xff8800,0xffcc00,0x44cc44,0x4499ff,0xcc44ff,0xff44aa,0x44ffdd,0xff6633,0x66ff44]
  const meshes=[]
  products.slice(0,ROWS*COLS).forEach((prod,idx)=>{
    if(!prod)return
    const row=Math.floor(idx/COLS),col=idx%COLS
    const px=-SW/2+col*(SW/COLS)+SW/(COLS*2)
    const plankY=row*rowSpacing+0.06+0.03
    const py=plankY+0.30
    const pBox=bx(0.34,0.50,0.18,mat(boxColors[idx%boxColors.length],0.72))
    pBox.position.set(px,py,pz);pBox.userData={isProduct:true,product:prod};g.add(pBox)
    meshes.push(pBox)
    if(prod._imgTex){
      const ip=planeMesh(prod._imgTex,0.32,0.46)
      ip.position.set(px,py,pz+0.10);ip.userData={isProduct:true,product:prod};g.add(ip)
      meshes.push(ip)
    }
    const pt=planeMesh(labelTex([{text:(prod.productname||'').slice(0,14),size:12,color:'#fff',bold:true},{text:`₹${Math.round(prod.price*(1-(prod.discount||0)/100))}`,size:15,color:'#ffff44'}],128,52,'#111111'),0.34,0.14)
    pt.position.set(px,plankY-0.03,pz+0.10);g.add(pt)
  })
  scene.add(g)
  // update world matrices so raycasting works immediately
  g.updateMatrixWorld(true)
  return meshes
}

function buildBillingCounter(scene,x,z){
  const g=new THREE.Group();g.position.set(x,0,z)
  const body=bx(4,1.05,1.2,mat(C.counter,0.8));body.position.set(0,0.525,0);g.add(body)
  const top=bx(4.1,0.08,1.3,new THREE.MeshStandardMaterial({color:0x1a5a1a,roughness:0.7,metalness:0.2}));top.position.set(0,1.09,0);g.add(top)
  const glass=bx(3.8,0.6,0.06,new THREE.MeshStandardMaterial({color:0xaaddaa,roughness:0,metalness:0.1,transparent:true,opacity:0.35}));glass.position.set(0,1.42,0.62);g.add(glass)
  const mon=bx(1,0.65,0.07,mat(0x111111));mon.position.set(-0.8,1.68,-0.3);g.add(mon)
  const torso=bx(0.36,0.52,0.22,mat(0x2244aa));torso.position.set(0.8,1.56,0);g.add(torso)
  const head=new THREE.Mesh(new THREE.SphereGeometry(0.17,12,12),mat(0xf5c5a0));head.position.set(0.8,2.0,0);g.add(head)
  const ns=bx(2.5,0.45,0.1,nMat(0x00cc44,1.5));ns.position.set(0,2.9,0);g.add(ns)
  const nl=planeMesh(labelTex([{text:'💳 BILLING',bold:true,size:26,color:'#00ff88'}],256,64,'#00aa33'),2.2,0.4)
  nl.position.set(0,2.9,0.06);g.add(nl)
  const bp=planeMesh(labelTex([{text:'BILLING COUNTER',bold:true,size:22},{text:'Walk here to checkout',size:14,color:'#aaffaa'}],320,96,'#1a3a1a'),3,0.9)
  bp.position.set(0,2.2,-0.62);g.add(bp)
  scene.add(g)
}

function buildCartMesh(){
  const g=new THREE.Group(),wm=mat(C.cartMetal,0.3,0.8)
  for(let i=0;i<4;i++){const b=bx(i%2===0?0.7:0.5,0.04,0.04,wm);b.position.set(i%2===0?0:(i<2?-0.32:0.32),0.35+(i>1?0.28:0),i%2===0?(i<2?-0.22:0.22):0);g.add(b)}
  const bot=bx(0.66,0.03,0.46,mat(0xaaaaaa,0.5,0.3));bot.position.y=0.22;g.add(bot)
  ;[-0.32,0.32].forEach(x=>[-0.22,0.22].forEach(z=>{const p=bx(0.03,0.3,0.03,wm);p.position.set(x,0.37,z);g.add(p)}))
  ;[-0.28,0.28].forEach(x=>[-0.18,0.18].forEach(z=>{const w=cy(0.05,0.04,mat(C.black,0.5),8);w.rotation.x=Math.PI/2;w.position.set(x,0.05,z);g.add(w)}))
  const h=bx(0.66,0.04,0.04,wm);h.position.set(0,0.68,0.22);g.add(h)
  g.scale.set(0.6,0.6,0.6);return g
}

const isMob=()=>typeof window!=='undefined'&&('ontouchstart'in window||navigator.maxTouchPoints>0||window.innerWidth<=900)

export default function Pricelist({onClose}){
  const canvasRef=useRef()
  const st=useRef({keys:{},euler:new THREE.Euler(0,0,0,'YXZ'),camera:null,productMeshes:[],cartMesh:null,nearBilling:false,aimedProduct:null,moveJoy:{active:false,x:0,y:0},moveTouchId:null,moveTouchStart:{x:0,y:0},lookTouches:{}})
  const [products,setProducts]=useState([])
  const [loading,setLoading]=useState(true)
  const [loadMsg,setLoadMsg]=useState('Connecting…')
  const [cart,setCart]=useState({})
  const [nearBilling,setNearBilling]=useState(false)
  const [aimedProduct,setAimedProduct]=useState(null)
  const [viewProduct,setViewProduct]=useState(null)
  const [viewImgIdx,setViewImgIdx]=useState(0)
  const [hint,setHint]=useState('')
  const [crosshairHit,setCrosshairHit]=useState(false)
  const [joyVis,setJoyVis]=useState({active:false,baseX:0,baseY:0,dx:0,dy:0})
  const [showAi,setShowAi]=useState(false)
  const [aiStep,setAiStep]=useState(0)
  const [aiBudget,setAiBudget]=useState('')
  const [aiPrefs,setAiPrefs]=useState({kids:false,sound:false,night:false,kidsnight:false})
  const [suggestedCart,setSuggestedCart]=useState({})
  const [showCheckout,setShowCheckout]=useState(false)
  const [bookingLoading,setBookingLoading]=useState(false)
  const [cartDropOpen,setCartDropOpen]=useState(false)
  const [cartSideOpen,setCartSideOpen]=useState(false)
  const [states,setStates]=useState([])
  const [districts,setDistricts]=useState([])
  const [promocodes,setPromocodes]=useState([])
  const [promoSel,setPromoSel]=useState('')
  const [promoCustom,setPromoCustom]=useState('')
  const [appliedPromo,setAppliedPromo]=useState(null)
  const [promoErr,setPromoErr]=useState('')
  const [errMsg,setErrMsg]=useState('')
  const [isMobile,setIsMobile]=useState(false)
  const [customerDetails,setCustomerDetails]=useState({customer_name:'',address:'',district:'',state:'',mobile_number:'',email:'',customer_type:'User'})

  useEffect(()=>{setIsMobile(isMob())},[])

  const fmt=n=>Number.isInteger(+n)?(+n).toString():(+n).toFixed(2)
  const fmtPct=v=>Math.round(parseFloat(v)).toString()

  const totals=useMemo(()=>{
    let net=0,pd=0,ad=0,prd=0
    Object.values(cart).forEach(({product:p,qty})=>{
      const orig=+p.price,disc=orig*(p.discount||0)/100,after=orig-disc
      net+=orig*qty;pd+=disc*qty;ad+=after*qty
      if(appliedPromo&&(!appliedPromo.product_type||p.product_type===appliedPromo.product_type))
        prd+=(after*qty*appliedPromo.discount)/100
    })
    const total=ad-prd,fee=total*0.01
    return{net:fmt(net),save:fmt(pd+prd),product_discount:fmt(pd),promo_discount:fmt(prd),processing_fee:fmt(fee),total:fmt(total+fee),rawAfterDiscount:ad}
  },[cart,appliedPromo])

  const cartCount=Object.values(cart).reduce((s,{qty})=>s+qty,0)
  const cartRaw=Object.values(cart).reduce((s,{product:p,qty})=>s+p.price*(1-(p.discount||0)/100)*qty,0)

  const suggestedTotal=useMemo(()=>{
    let t=0;Object.entries(suggestedCart).forEach(([serial,qty])=>{const p=products.find(x=>x.serial_number===serial);if(p)t+=p.price*(1-(p.discount||0)/100)*qty});return fmt(t)
  },[suggestedCart,products])

  const showHintMsg=useCallback(msg=>{setHint(msg);setTimeout(()=>setHint(''),2200)},[])

  const addToCartDirect=useCallback(prod=>{
    if(!prod)return
    setCart(prev=>{const ex=prev[prod.serial_number];return{...prev,[prod.serial_number]:ex?{...ex,qty:ex.qty+1}:{product:prod,qty:1}}})
    showHintMsg('Added to cart!')
  },[showHintMsg])

  const removeFromCart=useCallback(serial=>{
    setCart(prev=>{const u={...prev};if(u[serial]?.qty>1)u[serial]={...u[serial],qty:u[serial].qty-1};else delete u[serial];return u})
  },[])

  useEffect(()=>{
    const load=async()=>{
      try{
        setLoadMsg('Fetching products…')
        const[pRes,sRes,prRes]=await Promise.all([fetch(`${API_BASE_URL}/api/products`),fetch(`${API_BASE_URL}/api/locations/states`),fetch(`${API_BASE_URL}/api/promocodes`)])
        const[pData,sData,prData]=await Promise.all([pRes.json(),sRes.json(),prRes.json()])
        setStates(Array.isArray(sData)?sData:[]);setPromocodes(Array.isArray(prData)?prData:[])
        const seen=new Set()
        const raw=(pData.data||pData||[]).filter(p=>p.status==='on'&&!seen.has(p.serial_number)&&seen.add(p.serial_number)).map(p=>({...p,images:p.image?(typeof p.image==='string'?JSON.parse(p.image):p.image):[]}))
        setLoadMsg(`Loading images for ${raw.length} products…`)
        for(let b=0;b<raw.length;b+=20){
          await Promise.all(raw.slice(b,b+20).map(p=>new Promise(res=>{
            const url=(p.images||[]).find(i=>i&&!i.includes('/video/')&&!i.toLowerCase().endsWith('.gif'))
            if(!url){res();return}
            const img=new Image();img.crossOrigin='Anonymous'
            img.onload=()=>{try{const cv=document.createElement('canvas');cv.width=128;cv.height=128;const ctx=cv.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,128,128);const sc=Math.min(128/img.naturalWidth,128/img.naturalHeight),dw=img.naturalWidth*sc,dh=img.naturalHeight*sc;ctx.drawImage(img,(128-dw)/2,(128-dh)/2,dw,dh);p._imgTex=new THREE.CanvasTexture(cv)}catch{};res()}
            img.onerror=res;img.src=url
          })))
          setLoadMsg(`Loaded ${Math.min(b+20,raw.length)} / ${raw.length}…`)
        }
        setProducts(raw)
      }catch(e){console.error(e);setLoadMsg('Error loading products')}
      finally{setLoading(false)}
    };load()
  },[])

  useEffect(()=>{
    if(!customerDetails.state)return
    fetch(`${API_BASE_URL}/api/locations/states/${customerDetails.state}/districts`).then(r=>r.json()).then(d=>setDistricts(Array.isArray(d)?d:[])).catch(()=>{})
  },[customerDetails.state])

  useEffect(()=>{
    if(loading||!canvasRef.current)return
    const s=st.current
    const canvas=canvasRef.current
    const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'})
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.5))
    renderer.setSize(window.innerWidth,window.innerHeight)
    renderer.setClearColor(0x87ceeb)
    renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap
    const scene=new THREE.Scene();scene.fog=new THREE.Fog(0x87ceeb,22,55)
    const camera=new THREE.PerspectiveCamera(68,window.innerWidth/window.innerHeight,0.1,80)
    camera.position.set(0,1.75,2);s.camera=camera;s.euler.y=Math.PI
    scene.add(new THREE.AmbientLight(0xfff8ee,2.5))
    scene.add(new THREE.HemisphereLight(0xfff0e0,0xddccaa,0.6))
    const sun=new THREE.DirectionalLight(0xffeedd,0.7);sun.position.set(5,10,5);scene.add(sun)
    const W=20,D=26
    buildFloor(scene,W,D);buildWalls(scene,W,D);buildEntrance(scene,W);buildDecorations(scene,W)

    const TYPES=['one_sound_crackers','ground_chakkar','flower_pots','twinkling_star','rockets','bombs','repeating_shots','comets_sky_shots','fancy_pencil_varieties','fountain_and_fancy_novelties','sparklers','premium_sparklers','gift_boxes','kids_special','matches','guns_and_caps']
    const LABELS=['Sound Crackers','Ground Chakkar','Flower Pots','Twinkling Stars','Rockets','Bombs','Repeating Shots','Sky Shots','Fancy Pencils','Fountains','Sparklers','Premium Sparklers','Gift Boxes','Kids Special','Matches','Guns & Caps']
    const SHELF_COLS=[{x:-8.5,ry:0},{x:-3.5,ry:0},{x:3.5,ry:Math.PI},{x:8.5,ry:Math.PI}]
    const SHELF_ROWS=[-3,-7.5,-12,-16.5,-21]
    const slots=[];SHELF_ROWS.forEach(z=>SHELF_COLS.forEach(col=>slots.push({...col,z})))
    let slotIdx=0

    // ── FIX: collect all product meshes so crosshair raycast can hit them ──
    const allMeshes=[]
    TYPES.forEach((typeKey,ti)=>{
      const typeProds=products.filter(p=>p.product_type===typeKey||p.product_type===typeKey.replace(/_/g,' '))
      if(!typeProds.length)return
      const shelves=[]
      for(let i=0;i<typeProds.length;i+=12)shelves.push(typeProds.slice(i,i+12))
      shelves.forEach((shelfProds,shelfIdx)=>{
        const slot=slots[slotIdx%slots.length];slotIdx++
        const meshes=buildShelf(scene,slot.x,slot.z,slot.ry,(shelfIdx===0?LABELS[ti]||typeKey:''),shelfProds)
        allMeshes.push(...meshes)
      })
    })
    s.productMeshes=allMeshes  // store for raycaster

    buildBillingCounter(scene,W/2-3.5,-D+2)
    const cartMesh=buildCartMesh();cartMesh.position.set(0.9,0,1.5);scene.add(cartMesh);s.cartMesh=cartMesh

    const crosshairRay=new THREE.Raycaster()
    const CENTER=new THREE.Vector2(0,0)

    const fwd=new THREE.Vector3(),rgt=new THREE.Vector3(),dir=new THREE.Vector3(),UP=new THREE.Vector3(0,1,0)

    let raf
    const tick=()=>{
      raf=requestAnimationFrame(tick)
      const joy=s.moveJoy
      const mF=(s.keys['KeyW']||s.keys['ArrowUp']||(joy.active&&joy.y<-0.08))?1:0
      const mB=(s.keys['KeyS']||s.keys['ArrowDown']||(joy.active&&joy.y>0.08))?1:0
      const mL=(s.keys['KeyA']||s.keys['ArrowLeft']||(joy.active&&joy.x<-0.08))?1:0
      const mR=(s.keys['KeyD']||s.keys['ArrowRight']||(joy.active&&joy.x>0.08))?1:0
      if(mF||mB||mL||mR){
        camera.getWorldDirection(fwd);fwd.y=0;fwd.normalize()
        rgt.crossVectors(fwd,UP).normalize();dir.set(0,0,0)
        if(mF)dir.add(fwd);if(mB)dir.sub(fwd);if(mR)dir.add(rgt);if(mL)dir.sub(rgt)
        if(dir.lengthSq()>0){
          dir.normalize()
          camera.position.x=THREE.MathUtils.clamp(camera.position.x+dir.x*0.22,-W/2+0.8,W/2-0.8)
          camera.position.z=THREE.MathUtils.clamp(camera.position.z+dir.z*0.22,-D+1.2,2.5)
          camera.position.y=1.75
        }
      }
      if(s.cartMesh){s.cartMesh.position.x+=(camera.position.x+0.9-s.cartMesh.position.x)*0.08;s.cartMesh.position.z+=(camera.position.z+0.05-s.cartMesh.position.z)*0.08}

      const bilPos=new THREE.Vector3(W/2-3.5,1.75,-D+2.5)
      const nb=camera.position.distanceTo(bilPos)<3.5
      if(nb!==s.nearBilling){s.nearBilling=nb;setNearBilling(nb)}

      // crosshair raycast
      crosshairRay.setFromCamera(CENTER,camera)
      const hits=crosshairRay.intersectObjects(s.productMeshes,false)
      const hit=hits.length>0&&hits[0].distance<20?hits[0].object:null
      const aimed=hit?.userData?.isProduct?hit:null
      s.aimedProduct=aimed
      setAimedProduct(aimed?aimed.userData.product:null)
      setCrosshairHit(!!aimed)

      renderer.render(scene,camera)
    }
    raf=requestAnimationFrame(tick)

    // Only add to cart when user directly taps ON the 3D product mesh
    // Crosshair just highlights — ADD button in HUD or direct tap on box adds to cart
    const clickRay=new THREE.Raycaster()
    const onDirectTap=e=>{
      const rect=canvas.getBoundingClientRect()
      let nx=0,ny=0
      if(e.changedTouches){
        const t=e.changedTouches[0]
        if(!t)return
        // Ignore left-side joystick area on mobile
        if(t.clientX<window.innerWidth*0.4)return
        nx=((t.clientX-rect.left)/rect.width)*2-1
        ny=-((t.clientY-rect.top)/rect.height)*2+1
      } else {
        // PC click — use actual mouse position
        nx=((e.clientX-rect.left)/rect.width)*2-1
        ny=-((e.clientY-rect.top)/rect.height)*2+1
      }
      clickRay.setFromCamera(new THREE.Vector2(nx,ny),camera)
      const hits=clickRay.intersectObjects(s.productMeshes,false)
      if(hits.length>0&&hits[0].distance<20){
        const prod=hits[0].object?.userData?.product
        if(prod) addToCartDirect(prod)
      }
    }
    // PC only: click directly on product (when not pointer-locked)
    // Mobile: handled inside onTE (touchend) to avoid preventDefault conflicts
    if(!isMob()){
      canvas.addEventListener('click',e=>{
        if(document.pointerLockElement===canvas)return
        onDirectTap(e)
      })
    }

    const resize=()=>{camera.aspect=window.innerWidth/window.innerHeight;camera.updateProjectionMatrix();renderer.setSize(window.innerWidth,window.innerHeight)}
    window.addEventListener('resize',resize)
    const onKD=e=>{s.keys[e.code]=true}
    const onKU=e=>{s.keys[e.code]=false}
    document.addEventListener('keydown',onKD)
    document.addEventListener('keyup',onKU)

    // PC pointer lock mouse look
    let locked=false
    const onPLC=()=>{locked=document.pointerLockElement===canvas}
    const onMM=e=>{if(!locked)return;s.euler.y-=e.movementX*0.0018;s.euler.x-=e.movementY*0.0018;s.euler.x=Math.max(-Math.PI/2.5,Math.min(Math.PI/2.5,s.euler.x));camera.quaternion.setFromEuler(s.euler)}
    canvas.addEventListener('click',()=>{if(!isMob())canvas.requestPointerLock()})
    document.addEventListener('pointerlockchange',onPLC)
    document.addEventListener('mousemove',onMM)

    // Mobile touch controls
    if(isMob()){
      const JR=60,LOOK_SENS=0.004
      const onTS=e=>{
        e.preventDefault()
        Array.from(e.changedTouches).forEach(t=>{
          if(t.clientX<window.innerWidth*0.4&&s.moveTouchId===null){
            s.moveTouchId=t.identifier;s.moveTouchStart={x:t.clientX,y:t.clientY}
            s.moveJoy={active:true,x:0,y:0};setJoyVis({active:true,baseX:t.clientX,baseY:t.clientY,dx:0,dy:0})
          }else{
            s.lookTouches[t.identifier]={lastX:t.clientX,lastY:t.clientY}
          }
        })
      }
      const onTM=e=>{
        e.preventDefault()
        Array.from(e.changedTouches).forEach(t=>{
          if(t.identifier===s.moveTouchId){
            const jx=Math.max(-1,Math.min(1,(t.clientX-s.moveTouchStart.x)/JR))
            const jy=Math.max(-1,Math.min(1,(t.clientY-s.moveTouchStart.y)/JR))
            s.moveJoy={active:true,x:jx,y:jy};setJoyVis(v=>({...v,dx:jx*JR,dy:jy*JR}))
          }else if(s.lookTouches[t.identifier]){
            const prev=s.lookTouches[t.identifier]
            s.euler.y-=(t.clientX-prev.lastX)*LOOK_SENS
            s.euler.x-=(t.clientY-prev.lastY)*LOOK_SENS
            s.euler.x=Math.max(-Math.PI/2.3,Math.min(Math.PI/2.3,s.euler.x))
            camera.quaternion.setFromEuler(s.euler)
            s.lookTouches[t.identifier]={lastX:t.clientX,lastY:t.clientY}
          }
        })
      }
      const onTE=e=>{
        e.preventDefault()
        Array.from(e.changedTouches).forEach(t=>{
          if(t.identifier===s.moveTouchId){
            s.moveTouchId=null;s.moveJoy={active:false,x:0,y:0};setJoyVis({active:false,baseX:0,baseY:0,dx:0,dy:0})
          } else {
            // Right-side tap that was a look touch — check if it directly hit a product mesh
            const rect=canvas.getBoundingClientRect()
            const nx=((t.clientX-rect.left)/rect.width)*2-1
            const ny=-((t.clientY-rect.top)/rect.height)*2+1
            clickRay.setFromCamera(new THREE.Vector2(nx,ny),camera)
            const hits=clickRay.intersectObjects(s.productMeshes,false)
            if(hits.length>0&&hits[0].distance<20){
              const prod=hits[0].object?.userData?.product
              if(prod) addToCartDirect(prod)
            }
          }
          delete s.lookTouches[t.identifier]
        })
      }
      const O={passive:false}
      canvas.addEventListener('touchstart',onTS,O);canvas.addEventListener('touchmove',onTM,O)
      canvas.addEventListener('touchend',onTE,O);canvas.addEventListener('touchcancel',onTE,O)
      return()=>{
        cancelAnimationFrame(raf)
        canvas.removeEventListener('touchstart',onTS);canvas.removeEventListener('touchmove',onTM)
        canvas.removeEventListener('touchend',onTE);canvas.removeEventListener('touchcancel',onTE)
        window.removeEventListener('resize',resize);document.removeEventListener('keydown',onKD);document.removeEventListener('keyup',onKU)
        document.removeEventListener('pointerlockchange',onPLC);document.removeEventListener('mousemove',onMM)
        renderer.dispose()
      }
    }
    return()=>{
      cancelAnimationFrame(raf)
      window.removeEventListener('resize',resize);document.removeEventListener('keydown',onKD);document.removeEventListener('keyup',onKU)
      document.removeEventListener('pointerlockchange',onPLC);document.removeEventListener('mousemove',onMM)
      canvas.removeEventListener('click',onDirectTap);canvas.removeEventListener('touchend',onDirectTap)
      renderer.dispose()
    }
  },[loading,products,addToCartDirect])

  const applyPromo=useCallback(async code=>{
    if(!code){setAppliedPromo(null);setPromoErr('');return}
    try{
      const promos=await fetch(`${API_BASE_URL}/api/promocodes`).then(r=>r.json())
      const found=promos.find(p=>p.code.toLowerCase()===code.toLowerCase())
      if(!found){setPromoErr('Invalid promocode.');return}
      if(found.min_amount&&cartRaw<+found.min_amount){setPromoErr(`Min order ₹${found.min_amount} required.`);return}
      if(found.end_date&&new Date(found.end_date)<new Date()){setPromoErr('Promocode expired.');return}
      setAppliedPromo(found);setPromoErr('')
    }catch{setPromoErr('Could not validate.')}
  },[cartRaw])

  const handleBook=async()=>{
    setErrMsg('')
    const{customer_name,address,district,state,mobile_number}=customerDetails
    if(!customer_name||!address||!district||!state||!mobile_number){setErrMsg('Fill all required fields.');return}
    const mob=mobile_number.replace(/\D/g,'').slice(-10)
    if(mob.length!==10){setErrMsg('Mobile must be 10 digits.');return}
    const stObj=states.find(s=>s.name===state)
    if(stObj?.min_rate&&totals.rawAfterDiscount<stObj.min_rate){setErrMsg(`Min order for ${state} is ₹${stObj.min_rate}.`);return}
    if(!Object.keys(cart).length){setErrMsg('Cart is empty.');return}
    const order_id=`ORD-${Date.now()}`
    const selProds=Object.values(cart).map(({product:p,qty})=>({id:p.id,product_type:p.product_type,quantity:qty,per:p.per,price:p.price,discount:p.discount,serial_number:p.serial_number,productname:p.productname,status:p.status}))
    try{
      setBookingLoading(true)
      const res=await fetch(`${API_BASE_URL}/api/direct/bookings`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({order_id,products:selProds,net_rate:+totals.net,you_save:+totals.save,processing_fee:+totals.processing_fee,total:+totals.total,promo_discount:+(totals.promo_discount||'0'),customer_type:customerDetails.customer_type,customer_name,address,mobile_number:mob,email:customerDetails.email,district,state,promocode:appliedPromo?.code||null})})
      if(res.ok){
        const data=await res.json()
        // Download invoice PDF directly — no modal
        try{const blob=await fetch(`${API_BASE_URL}/api/direct/invoice/${data.order_id}`).then(r=>r.blob());const url=window.URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`${customer_name.toLowerCase().replace(/\s+/g,'_')}-${data.order_id}.pdf`;document.body.appendChild(a);a.click();document.body.removeChild(a);window.URL.revokeObjectURL(url)}catch{}
        setShowCheckout(false)
        showHintMsg('✓ Order placed! Invoice downloading…')
        setCart({});setCustomerDetails({customer_name:'',address:'',district:'',state:'',mobile_number:'',email:'',customer_type:'User'});setAppliedPromo(null);setPromoSel('');setPromoCustom('')
      }else{const d=await res.json();setErrMsg(d.message||'Booking failed.')}
    }catch{setErrMsg('Something went wrong.')}
    finally{setBookingLoading(false)}
  }

  const viewImages=useMemo(()=>viewProduct?(viewProduct.images||[]).filter(i=>i&&typeof i==='string'):[],[viewProduct])

  if(loading)return(
    <div style={{position:'fixed',inset:0,background:'#0a0a1a',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',zIndex:9999}}>
      <div style={{fontSize:'3rem',marginBottom:16}}>🎆</div>
      <div style={{color:'#ff6600',fontFamily:'"Arial Black",Arial',fontSize:'1.1rem',letterSpacing:'0.2em',marginBottom:10}}>MADHU NISHA CRACKERS</div>
      <div style={{color:'rgba(255,255,255,0.6)',fontSize:'0.78rem',fontFamily:'Arial',textAlign:'center',padding:'0 20px',marginBottom:16}}>{loadMsg}</div>
      <div style={{width:220,height:5,background:'rgba(255,255,255,0.12)',borderRadius:3,overflow:'hidden'}}><div style={{height:'100%',background:'#ff6600',borderRadius:3,animation:'ld 1.5s ease-in-out infinite'}}/></div>
      <style>{`@keyframes ld{0%,100%{width:15%}50%{width:90%}}`}</style>
    </div>
  )

  const M={fontFamily:'"Arial Black",Arial,sans-serif'}
  const MS={fontFamily:'Arial,sans-serif'}
  const INP={width:'100%',padding:'10px 14px',border:'1px solid #ffd4b8',borderRadius:12,fontSize:'0.83rem',outline:'none',boxSizing:'border-box',background:'#fffaf5',fontFamily:'Arial'}

  const SummaryRows=()=>(
    <div style={{...MS,fontSize:'0.78rem'}}>
      {[['Net Total',`₹${totals.net}`,'#555'],['Product Discount',`−₹${totals.product_discount}`,'#22aa44'],...(appliedPromo?[[`Promo (${appliedPromo.code})`,`−₹${totals.promo_discount}`,'#22aa44']]:[]),['You Save',`−₹${totals.save}`,'#22aa44'],['Processing Fee (1%)',`₹${totals.processing_fee}`,'#888']].map(([l,v,c])=>(
      <div key={l} style={{display:'flex',justifyContent:'space-between',marginBottom:4}}><span style={{color:'#666'}}>{l}</span><span style={{color:c}}>{v}</span></div>
      ))}
      <div style={{display:'flex',justifyContent:'space-between',borderTop:'1px solid #ffd4b8',paddingTop:7,marginTop:5}}>
        <span style={{...M,color:'#cc2200',fontSize:'0.88rem'}}>GRAND TOTAL</span><span style={{...M,color:'#cc2200',fontSize:'0.88rem'}}>₹{totals.total}</span>
      </div>
    </div>
  )

  const PromoSelector=()=>(
    <div style={{marginBottom:10}}>
      <label style={{...M,fontSize:'0.6rem',color:'#888',letterSpacing:'0.1em',display:'block',marginBottom:5}}>PROMO CODE</label>
      <select value={promoSel} onChange={e=>{setPromoSel(e.target.value);if(e.target.value&&e.target.value!=='custom')applyPromo(e.target.value);else if(!e.target.value){setAppliedPromo(null);setPromoErr('')}}} style={INP}>
        <option value=''>Select a promocode</option>
        {promocodes.map(pr=><option key={pr.id} value={pr.code}>{pr.code} ({fmtPct(pr.discount)}% OFF{pr.min_amount?`, Min ₹${pr.min_amount}`:''})</option>)}
        <option value='custom'>Enter custom code</option>
      </select>
      {promoSel==='custom'&&<input type='text' placeholder='Enter custom code' value={promoCustom} onChange={e=>setPromoCustom(e.target.value)} onBlur={()=>applyPromo(promoCustom)} style={{...INP,marginTop:6}}/>}
      {appliedPromo&&<div style={{...MS,fontSize:'0.72rem',color:'#22aa44',marginTop:4}}>✓ {appliedPromo.code} — {fmtPct(appliedPromo.discount)}% OFF applied</div>}
      {promoErr&&<div style={{...MS,fontSize:'0.72rem',color:'#cc0000',marginTop:4}}>{promoErr}</div>}
    </div>
  )

  return(
    <div style={{position:'fixed',inset:0,overflow:'hidden',userSelect:'none',touchAction:'none'}}>
      <canvas ref={canvasRef} style={{position:'absolute',inset:0,width:'100%',height:'100%',cursor:'none'}}/>

      {/* CENTER CROSSHAIR – turns green when aimed at a product */}
      {!showCheckout&&!showAi&&!viewProduct&&(
        <div style={{position:'fixed',left:'50%',top:'50%',transform:'translate(-50%,-50%)',zIndex:30,pointerEvents:'none'}}>
          <svg width="36" height="36" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="12" fill="none" stroke={crosshairHit?'#00ff88':'rgba(255,255,255,0.7)'} strokeWidth={crosshairHit?3:1.8}/>
            <line x1="18" y1="6" x2="18" y2="14" stroke={crosshairHit?'#00ff88':'rgba(255,255,255,0.7)'} strokeWidth={crosshairHit?3:1.8}/>
            <line x1="18" y1="22" x2="18" y2="30" stroke={crosshairHit?'#00ff88':'rgba(255,255,255,0.7)'} strokeWidth={crosshairHit?3:1.8}/>
            <line x1="6" y1="18" x2="14" y2="18" stroke={crosshairHit?'#00ff88':'rgba(255,255,255,0.7)'} strokeWidth={crosshairHit?3:1.8}/>
            <line x1="22" y1="18" x2="30" y2="18" stroke={crosshairHit?'#00ff88':'rgba(255,255,255,0.7)'} strokeWidth={crosshairHit?3:1.8}/>
            <circle cx="18" cy="18" r="2" fill={crosshairHit?'#00ff88':'rgba(255,255,255,0.9)'}/>
          </svg>
        </div>
      )}

      {/* TOP NAVBAR */}
      <div style={{position:'fixed',top:0,left:0,right:0,zIndex:40,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 14px',background:'rgba(0,0,0,0.78)',backdropFilter:'blur(12px)'}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          {onClose&&<button onClick={onClose} style={{...M,background:'rgba(255,85,0,0.9)',color:'#fff',border:'none',padding:'5px 12px',borderRadius:7,cursor:'pointer',fontSize:'0.68rem'}}>← EXIT</button>}
          <span style={{...M,color:'#ffaa00',fontSize:'0.72rem',letterSpacing:'0.1em'}}>MNC</span>
          <button onClick={()=>window.location.href='/'} style={{...M,background:'#ff5500',color:'#fff',border:'none',padding:'5px 14px',borderRadius:8,cursor:'pointer',fontSize:'0.72rem',letterSpacing:'0.06em'}}>Go back to HOME</button>
        </div>
        <button onClick={()=>setShowCheckout(true)} style={{...M,background:cartCount>0?'#ff5500':'rgba(255,255,255,0.1)',color:'#fff',border:'1px solid rgba(255,85,0,0.5)',padding:'6px 14px',borderRadius:20,cursor:'pointer',fontSize:'0.7rem',letterSpacing:'0.06em'}}>
          🛒 {cartCount} · ₹{fmt(cartRaw)}
        </button>
      </div>

      {/* HOW TO SHOP hint — only when nothing is aimed */}
      {!aimedProduct&&!nearBilling&&!showCheckout&&!showAi&&!viewProduct&&(
        <div style={{position:'fixed',top:62,left:'50%',transform:'translateX(-50%)',zIndex:25,background:'rgba(0,0,0,0.82)',backdropFilter:'blur(12px)',padding:'10px 18px',borderRadius:12,color:'#fff',fontSize:'0.7rem',textAlign:'center',maxWidth:'320px',border:'1px solid rgba(255,255,255,0.15)',pointerEvents:'none'}}>
          <div style={{fontWeight:'bold',marginBottom:5,color:'#ffaa00'}}>HOW TO SHOP</div>
          <div>Aim the crosshair at any product on the shelf</div>
          <div style={{marginTop:4,color:'#88ffaa'}}>Crosshair turns green → tap screen to add to cart</div>
          <div style={{marginTop:6,fontSize:'0.62rem',opacity:0.6}}>Drag right side to look · Left side to move · Walk to Billing to checkout</div>
        </div>
      )}

      {/* BILLING COUNTER HUD */}
      {nearBilling&&!showCheckout&&!showAi&&(
        <div style={{position:'fixed',top:'50%',left:'50%',transform:'translate(-50%,-50%)',zIndex:35,width:'min(360px,90vw)',pointerEvents:'all'}}>
          <div style={{background:'rgba(0,26,0,0.97)',backdropFilter:'blur(20px)',border:'2px solid #00dd55',borderRadius:18,padding:'20px 24px',boxShadow:'0 0 50px rgba(0,200,80,0.2)',textAlign:'center'}}>
            <div style={{fontSize:'1.8rem',marginBottom:4}}>💳</div>
            <div style={{...M,color:'#00ff88',fontSize:'1rem',letterSpacing:'0.12em',marginBottom:3}}>BILLING COUNTER</div>
            <div style={{...MS,color:'rgba(255,255,255,0.65)',fontSize:'0.78rem',marginBottom:14}}>{cartCount} item{cartCount!==1?'s':''} · ₹{fmt(cartRaw)}</div>
            <div style={{display:'flex',gap:10,flexDirection:isMobile?'column':'row'}}>
              <button onClick={()=>setShowCheckout(true)} style={{...M,flex:1,background:'linear-gradient(135deg,#00cc44,#009933)',color:'#fff',border:'none',padding:'13px 16px',borderRadius:12,cursor:'pointer',fontSize:'0.85rem',letterSpacing:'0.06em',boxShadow:'0 4px 20px rgba(0,180,60,0.4)'}}>🧾 PROCEED TO BILL →</button>
              <button onClick={()=>{setShowAi(true);setAiStep(0)}} style={{...M,flex:1,background:'linear-gradient(135deg,#ff9900,#ff5500)',color:'#fff',border:'none',padding:'13px 16px',borderRadius:12,cursor:'pointer',fontSize:'0.85rem',letterSpacing:'0.06em',boxShadow:'0 4px 20px rgba(255,140,0,0.3)'}}>🤖 AI CART</button>
            </div>
          </div>
        </div>
      )}

      {/* AIMED PRODUCT POPUP — small card just below crosshair */}
      {aimedProduct&&!nearBilling&&!showCheckout&&!showAi&&!viewProduct&&(
        <div style={{position:'fixed',bottom:isMobile?140:60,left:'50%',transform:'translateX(-50%)',zIndex:35,pointerEvents:'all',width:'min(380px,90vw)'}}>
          <div style={{background:'rgba(0,0,0,0.93)',backdropFilter:'blur(18px)',border:'1px solid rgba(255,100,0,0.55)',borderRadius:16,overflow:'hidden',boxShadow:'0 8px 40px rgba(0,0,0,0.6)'}}>
            <div style={{display:'flex',gap:12,alignItems:'center',padding:'12px 16px 8px'}}>
              {(()=>{const url=(aimedProduct.images||[]).find(i=>i&&!i.includes('/video/')&&!i.toLowerCase().endsWith('.gif'));return url?<img src={url} alt="" style={{width:60,height:60,borderRadius:10,objectFit:'cover',background:'#111',flexShrink:0,border:'1px solid rgba(255,100,0,0.4)'}} onError={e=>e.target.style.display='none'}/>:null})()}
              <div style={{flex:1,minWidth:0}}>
                <div style={{...MS,color:'#fff',fontSize:'0.9rem',fontWeight:'bold',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{aimedProduct.productname}</div>
                <div style={{display:'flex',alignItems:'baseline',gap:8,marginTop:4,flexWrap:'wrap'}}>
                  <span style={{...M,color:'#ffcc00',fontSize:'1.05rem'}}>₹{fmt(aimedProduct.price*(1-(aimedProduct.discount||0)/100))}</span>
                  {aimedProduct.discount>0&&<><span style={{color:'rgba(255,255,255,0.4)',textDecoration:'line-through',fontSize:'0.75rem'}}>₹{fmt(aimedProduct.price)}</span><span style={{background:'#ff5500',color:'#fff',fontSize:'0.65rem',padding:'2px 8px',borderRadius:12}}>{Math.round(aimedProduct.discount)}% OFF</span></>}
                  <span style={{color:'rgba(255,255,255,0.4)',fontSize:'0.68rem'}}>/{aimedProduct.per}</span>
                </div>
                <div style={{...MS,fontSize:'0.62rem',color:'rgba(255,255,255,0.3)',marginTop:2}}>Code: {aimedProduct.serial_number}</div>
              </div>
            </div>
            <div style={{display:'flex',borderTop:'1px solid rgba(255,100,0,0.3)'}}>
              <button onClick={()=>addToCartDirect(aimedProduct)} style={{...M,flex:1,background:'#ff5500',color:'#fff',border:'none',borderRight:'1px solid rgba(255,130,0,0.35)',padding:'14px',cursor:'pointer',fontSize:'0.85rem',letterSpacing:'0.04em'}}>🛒 ADD TO CART</button>
              <button onClick={()=>{setViewProduct(aimedProduct);setViewImgIdx(0)}} style={{...M,flex:1,background:'rgba(80,150,255,0.3)',color:'#aaccff',border:'none',padding:'14px',cursor:'pointer',fontSize:'0.85rem',letterSpacing:'0.04em'}}>👁 VIEW DETAILS</button>
            </div>
          </div>
        </div>
      )}

      {/* HINT TOAST */}
      {hint&&<div style={{position:'fixed',top:60,left:'50%',transform:'translateX(-50%)',zIndex:36,pointerEvents:'none'}}><div style={{...MS,background:'rgba(0,180,80,0.9)',color:'#fff',padding:'8px 20px',borderRadius:20,fontSize:'0.78rem',fontWeight:'bold',boxShadow:'0 4px 16px rgba(0,180,80,0.4)',whiteSpace:'nowrap'}}>{hint}</div></div>}

      {/* CART SIDEBAR — collapsed by default, expand on click */}
      {cartCount>0&&(
        <div style={{position:'fixed',top:50,right:0,zIndex:35,width:220,background:'rgba(0,0,0,0.9)',backdropFilter:'blur(16px)',borderLeft:'1px solid rgba(255,85,0,0.35)'}}>
          {/* Header — always visible, click to toggle */}
          <button onClick={()=>setCartSideOpen(o=>!o)} style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',background:'none',border:'none',padding:'10px 12px',cursor:'pointer'}}>
            <span style={{...M,color:'#ff8800',fontSize:'0.7rem',letterSpacing:'0.1em'}}>🛒 CART ({cartCount})</span>
            <span style={{color:'#ff8800',fontSize:'0.7rem',transition:'transform 0.2s',display:'inline-block',transform:cartSideOpen?'rotate(180deg)':'rotate(0deg)'}}>▼</span>
          </button>
          {/* Collapsed: just show total */}
          {!cartSideOpen&&(
            <div style={{padding:'0 12px 8px',textAlign:'right',...M,color:'#ffcc00',fontSize:'0.72rem'}}>₹{fmt(cartRaw)}</div>
          )}
          {/* Expanded: full list */}
          {cartSideOpen&&(
            <div style={{maxHeight:'55vh',overflowY:'auto',padding:'0 12px 12px'}}>
              {Object.values(cart).map(({product:p,qty})=>(
                <div key={p.serial_number} style={{display:'flex',alignItems:'center',gap:8,marginBottom:8,background:'rgba(255,85,0,0.1)',borderRadius:8,padding:'6px',border:'1px solid rgba(255,85,0,0.2)'}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{...MS,color:'rgba(255,255,255,0.9)',fontSize:'0.65rem',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.productname}</div>
                    <div style={{...MS,color:'#ff8800',fontSize:'0.65rem'}}>₹{fmt(p.price*(1-(p.discount||0)/100))} × {qty}</div>
                  </div>
                  <button onClick={()=>removeFromCart(p.serial_number)} style={{background:'rgba(255,60,60,0.4)',color:'#ffaaaa',border:'none',borderRadius:6,width:24,height:24,fontSize:'1rem',cursor:'pointer'}}>−</button>
                </div>
              ))}
              <div style={{marginTop:4,textAlign:'right',...M,color:'#ffcc00',fontSize:'0.75rem'}}>₹{fmt(cartRaw)}</div>
            </div>
          )}
        </div>
      )}

      {/* MOBILE MOVE JOYSTICK */}
      {isMobile&&joyVis.active&&(
        <div style={{position:'fixed',left:joyVis.baseX-60,top:joyVis.baseY-60,width:120,height:120,borderRadius:'50%',border:'2px solid rgba(255,180,60,0.6)',background:'rgba(0,0,0,0.4)',backdropFilter:'blur(8px)',pointerEvents:'none',zIndex:28}}>
          <div style={{position:'absolute',width:52,height:52,borderRadius:'50%',background:'rgba(255,160,0,0.9)',border:'2px solid #ffaa00',left:`calc(50% + ${joyVis.dx}px - 26px)`,top:`calc(50% + ${joyVis.dy}px - 26px)`,boxShadow:'0 0 20px rgba(255,160,0,0.6)'}}/>
        </div>
      )}

      {/* AI CART MODAL */}
      {showAi&&(
        <div style={{position:'fixed',inset:0,zIndex:60,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.75)',backdropFilter:'blur(14px)',padding:16}} onClick={()=>{setShowAi(false);setAiStep(0);setSuggestedCart({})}}>
          <div style={{background:'#fff',borderRadius:20,maxWidth:420,width:'100%',maxHeight:'90vh',overflowY:'auto',boxShadow:'0 24px 80px rgba(0,0,0,0.6)'}} onClick={e=>e.stopPropagation()}>
            <div style={{padding:'18px 18px 12px',borderBottom:'1px solid #f0e0e0'}}>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
                <div style={{width:42,height:42,background:'linear-gradient(135deg,#ff8800,#ff5500)',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.3rem'}}>🤖</div>
                <div><div style={{...M,color:'#333',fontSize:'0.9rem'}}>Smart AI Cart Builder</div><div style={{...MS,color:'#888',fontSize:'0.7rem'}}>Let me build your perfect cart</div></div>
              </div>
              <div style={{display:'flex',gap:4}}>
                {['Budget','Preferences','Review'].map((lbl,i)=>(
                  <div key={i} style={{flex:1}}><div style={{height:4,borderRadius:2,background:i<=aiStep?'#ff5500':'#eee'}}/><div style={{...MS,fontSize:'0.6rem',color:i===aiStep?'#ff5500':'#aaa',marginTop:3,textAlign:'center'}}>{lbl}</div></div>
                ))}
              </div>
            </div>
            <div style={{padding:'16px 18px'}}>
              {aiStep===0&&<div><div style={{...MS,color:'#555',fontSize:'0.85rem',marginBottom:12}}>What's your total budget?</div><div style={{position:'relative'}}><span style={{position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',color:'#aaa',...MS,fontSize:'1rem'}}>₹</span><input type='number' value={aiBudget} onChange={e=>setAiBudget(e.target.value)} style={{...INP,paddingLeft:30,fontSize:'1.1rem',fontWeight:'bold'}} placeholder='Enter amount'/></div></div>}
              {aiStep===1&&<div>
                <div style={{...MS,color:'#555',fontSize:'0.85rem',marginBottom:12}}>What type of fireworks?</div>
                {[{k:'kids',e:'🧒',l:'Kids Friendly',d:'Twinkling Star, Fancy Pencil'},{k:'sound',e:'💥',l:'Sound Crackers',d:'Bombs, One Sound'},{k:'night',e:'🚀',l:'Night Sky Display',d:'Rockets, Repeating Shots'},{k:'kidsnight',e:'✨',l:'Kids Night',d:'Sparklers, Flower Pots'}].map(({k,e,l,d})=>(
                  <label key={k} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 14px',borderRadius:12,border:`2px solid ${aiPrefs[k]?'#ff5500':'#f0f0f0'}`,background:aiPrefs[k]?'#fff8f5':'#fafafa',marginBottom:8,cursor:'pointer'}}>
                    <input type='checkbox' checked={aiPrefs[k]} onChange={ev=>setAiPrefs(p=>({...p,[k]:ev.target.checked}))} style={{display:'none'}}/>
                    <span style={{fontSize:'1.5rem'}}>{e}</span>
                    <div style={{flex:1}}><div style={{...M,fontSize:'0.78rem',color:aiPrefs[k]?'#cc3300':'#333'}}>{l}</div><div style={{...MS,fontSize:'0.68rem',color:'#999'}}>{d}</div></div>
                    <div style={{width:20,height:20,borderRadius:6,border:`2px solid ${aiPrefs[k]?'#ff5500':'#ddd'}`,background:aiPrefs[k]?'#ff5500':'#fff',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{aiPrefs[k]&&<span style={{color:'#fff',fontSize:'0.7rem'}}>✓</span>}</div>
                  </label>
                ))}
              </div>}
              {aiStep===2&&<div>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                  <div><div style={{...M,color:'#333',fontSize:'0.82rem'}}>Suggested Cart</div><div style={{...MS,color:'#888',fontSize:'0.7rem'}}>{Object.keys(suggestedCart).length} items · ≈ ₹{suggestedTotal}</div></div>
                  <button onClick={()=>setSuggestedCart({})} style={{...M,background:'#fff4ee',color:'#cc5500',border:'1px solid #ffd4b8',padding:'5px 12px',borderRadius:9,cursor:'pointer',fontSize:'0.68rem'}}>Clear</button>
                </div>
                <div style={{maxHeight:'36vh',overflowY:'auto'}}>
                  {Object.entries(suggestedCart).map(([serial,qty])=>{const p=products.find(x=>x.serial_number===serial);if(!p)return null;const fp=p.price*(1-(p.discount||0)/100);return(
                    <div key={serial} style={{display:'flex',alignItems:'center',gap:8,padding:'7px 0',borderBottom:'1px solid #fff0e8'}}>
                      <div style={{flex:1}}><div style={{...MS,fontSize:'0.75rem',color:'#333',fontWeight:'bold'}}>{p.productname}</div><div style={{...MS,fontSize:'0.68rem',color:'#888'}}>₹{fmt(fp)} ×{qty}</div></div>
                      <div style={{display:'flex',gap:4,alignItems:'center'}}>
                        <button onClick={()=>setSuggestedCart(prev=>{const u={...prev};if(u[serial]>1)u[serial]--;else delete u[serial];return u})} style={{background:'#ffe8e0',color:'#cc4400',border:'none',borderRadius:5,width:22,height:22,cursor:'pointer',fontSize:'0.8rem'}}>−</button>
                        <span style={{...M,fontSize:'0.75rem',color:'#333',width:22,textAlign:'center'}}>{qty}</span>
                        <button onClick={()=>setSuggestedCart(prev=>({...prev,[serial]:(prev[serial]||0)+1}))} style={{background:'#ffe8e0',color:'#cc4400',border:'none',borderRadius:5,width:22,height:22,cursor:'pointer',fontSize:'0.8rem'}}>+</button>
                      </div>
                    </div>
                  )})}
                </div>
                {Object.keys(suggestedCart).length>0&&<button onClick={()=>{setCart(prev=>{const u={...prev};Object.entries(suggestedCart).forEach(([serial,qty])=>{const p=products.find(x=>x.serial_number===serial);if(p){const ex=u[serial];u[serial]=ex?{...ex,qty:ex.qty+qty}:{product:p,qty}}});return u});setShowAi(false);setSuggestedCart({});setAiBudget('');setAiPrefs({kids:false,sound:false,night:false,kidsnight:false});showHintMsg('AI cart added!')}} style={{...M,width:'100%',background:'linear-gradient(135deg,#22aa44,#1a8a33)',color:'#fff',border:'none',padding:'12px',borderRadius:14,cursor:'pointer',fontSize:'0.82rem',marginTop:12,letterSpacing:'0.08em',boxShadow:'0 4px 14px rgba(34,170,68,0.3)'}}>ADD ALL TO CART</button>}
              </div>}
              <div style={{display:'flex',justifyContent:'space-between',marginTop:16}}>
                {aiStep>0?<button onClick={()=>{if(aiStep===2)setSuggestedCart({});setAiStep(s=>s-1)}} style={{...MS,background:'#f5f5f5',color:'#666',border:'none',padding:'10px 18px',borderRadius:12,cursor:'pointer',fontSize:'0.82rem'}}>← Back</button>:<div/>}
                {aiStep<2&&<button onClick={()=>{if(aiStep===0&&!aiBudget)return;if(aiStep===1&&!Object.values(aiPrefs).some(Boolean))return;setAiStep(s=>s+1)}} style={{...M,background:'linear-gradient(135deg,#ff5500,#ff8800)',color:'#fff',border:'none',padding:'10px 22px',borderRadius:12,cursor:'pointer',fontSize:'0.82rem',letterSpacing:'0.08em',boxShadow:'0 4px 14px rgba(255,85,0,0.3)'}}>Next →</button>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCT VIEW MODAL */}
      {viewProduct&&(
        <div style={{position:'fixed',inset:0,zIndex:60,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.76)',backdropFilter:'blur(14px)',padding:16}} onClick={()=>setViewProduct(null)}>
          <div style={{background:'#fff',borderRadius:20,maxWidth:420,width:'100%',maxHeight:'92vh',overflowY:'auto',boxShadow:'0 24px 80px rgba(0,0,0,0.6)'}} onClick={e=>e.stopPropagation()}>
            <div style={{padding:'18px 18px 0'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
                <div style={{flex:1,paddingRight:10}}>
                  <div style={{...M,fontSize:'0.95rem',color:'#cc2200',marginBottom:5}}>{viewProduct.productname}</div>
                  <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
                    {viewProduct.discount>0&&<span style={{background:'#ff5500',color:'#fff',fontSize:'0.65rem',fontWeight:'bold',padding:'2px 8px',borderRadius:20}}>{Math.round(viewProduct.discount)}% OFF</span>}
                    <span style={{...M,color:'#ff5500',fontSize:'1rem'}}>₹{fmt(viewProduct.price*(1-(viewProduct.discount||0)/100))}</span>
                    <span style={{...MS,color:'#888',fontSize:'0.75rem'}}>/ {viewProduct.per}</span>
                    {viewProduct.discount>0&&<span style={{...MS,color:'#bbb',fontSize:'0.72rem',textDecoration:'line-through'}}>₹{fmt(viewProduct.price)}</span>}
                  </div>
                  <div style={{...MS,fontSize:'0.7rem',color:'#aaa',marginTop:3}}>Code: {viewProduct.serial_number}</div>
                </div>
                <button onClick={()=>setViewProduct(null)} style={{background:'#f5f5f5',border:'none',borderRadius:8,width:30,height:30,cursor:'pointer',fontSize:'1rem',flexShrink:0}}>✕</button>
              </div>
              {viewImages.length>0&&(
                <div style={{position:'relative',marginBottom:12}}>
                  <div style={{width:'100%',height:220,borderRadius:12,overflow:'hidden',background:'#f8f8f8',display:'flex',alignItems:'center',justifyContent:'center'}}>
                    {viewImages[viewImgIdx]?.includes('/video/')?<video src={viewImages[viewImgIdx]} autoPlay muted loop style={{width:'100%',height:'100%',objectFit:'contain'}}/>:<img src={viewImages[viewImgIdx]} alt="" style={{width:'100%',height:'100%',objectFit:'contain'}} onError={e=>e.target.style.display='none'}/>}
                  </div>
                  {viewImages.length>1&&<><button onClick={()=>setViewImgIdx(p=>(p-1+viewImages.length)%viewImages.length)} style={{position:'absolute',left:6,top:'50%',transform:'translateY(-50%)',background:'rgba(0,0,0,0.45)',color:'#fff',border:'none',borderRadius:8,width:30,height:30,cursor:'pointer',fontSize:'1.1rem'}}>‹</button><button onClick={()=>setViewImgIdx(p=>(p+1)%viewImages.length)} style={{position:'absolute',right:6,top:'50%',transform:'translateY(-50%)',background:'rgba(0,0,0,0.45)',color:'#fff',border:'none',borderRadius:8,width:30,height:30,cursor:'pointer',fontSize:'1.1rem'}}>›</button><div style={{position:'absolute',bottom:6,left:'50%',transform:'translateX(-50%)',background:'rgba(0,0,0,0.5)',color:'#fff',padding:'2px 10px',borderRadius:20,fontSize:'0.65rem'}}>{viewImgIdx+1}/{viewImages.length}</div></>}
                  {viewImages.length>1&&<div style={{display:'flex',gap:5,marginTop:7,overflowX:'auto',paddingBottom:3}}>{viewImages.map((img,i)=><div key={i} onClick={()=>setViewImgIdx(i)} style={{width:50,height:50,borderRadius:7,overflow:'hidden',border:`2px solid ${i===viewImgIdx?'#ff5500':'#eee'}`,cursor:'pointer',flexShrink:0,background:'#f8f8f8'}}>{img.includes('/video/')?<video src={img} style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<img src={img} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>}</div>)}</div>}
                </div>
              )}
              <div style={{...MS,fontSize:'0.78rem',color:'#555',lineHeight:1.6,marginBottom:10}}>{viewProduct.description||'Premium quality firecracker for your celebrations.'}</div>
            </div>
            <div style={{padding:'0 18px 18px',display:'flex',gap:10}}>
              <button onClick={()=>{addToCartDirect(viewProduct);setViewProduct(null)}} style={{...M,flex:1,background:'linear-gradient(135deg,#ff5500,#ff8800)',color:'#fff',border:'none',padding:'12px',borderRadius:14,cursor:'pointer',fontSize:'0.82rem',letterSpacing:'0.08em',boxShadow:'0 4px 16px rgba(255,85,0,0.3)'}}>+ ADD TO CART</button>
              <button onClick={()=>setViewProduct(null)} style={{...MS,flex:'0 0 72px',background:'#f5f5f5',color:'#666',border:'none',padding:'12px',borderRadius:14,cursor:'pointer',fontSize:'0.82rem'}}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* CHECKOUT MODAL */}
      {showCheckout&&(
        <div style={{position:'fixed',inset:0,zIndex:50,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.74)',backdropFilter:'blur(14px)',padding:16}}>
          <div style={{background:'#fff',borderRadius:20,maxWidth:460,width:'100%',maxHeight:'92vh',overflowY:'auto',boxShadow:'0 20px 60px rgba(0,0,0,0.5)'}}>
            <div style={{padding:'18px 18px 0',borderBottom:'1px solid #ffe0cc'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <div style={{width:36,height:36,background:'#fff4ee',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.1rem'}}>🛒</div>
                  <div><div style={{...M,color:'#cc2200',fontSize:'0.95rem',letterSpacing:'0.06em'}}>CHECKOUT</div><div style={{...MS,color:'#aaa',fontSize:'0.68rem'}}>Fill in your details to confirm booking</div></div>
                </div>
                <button onClick={()=>setShowCheckout(false)} style={{background:'#f5f5f5',border:'none',borderRadius:8,width:28,height:28,cursor:'pointer',fontSize:'1rem'}}>✕</button>
              </div>
              {/* ── Cart dropdown accordion ── */}
              <button onClick={()=>setCartDropOpen(o=>!o)} style={{width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',background:'#fff8f2',border:'1px solid #ffd4b8',borderRadius:10,padding:'9px 14px',cursor:'pointer',marginBottom:cartDropOpen?0:10}}>
                <span style={{...M,fontSize:'0.72rem',color:'#cc4400',letterSpacing:'0.06em'}}>🛒 {cartCount} item{cartCount!==1?'s':''} · ₹{fmt(cartRaw)}</span>
                <span style={{fontSize:'0.75rem',color:'#cc4400',transition:'transform 0.2s',display:'inline-block',transform:cartDropOpen?'rotate(180deg)':'rotate(0deg)'}}>▼</span>
              </button>
              {cartDropOpen&&(
                <div style={{maxHeight:'26vh',overflowY:'auto',marginBottom:10,border:'1px solid #ffe0cc',borderTop:'none',borderRadius:'0 0 10px 10px',padding:'4px 0'}}>
                  {Object.values(cart).map(({product:p,qty})=>{
                    const imgUrl=(p.images||[]).find(i=>i&&!i.includes('/video/')&&!i.toLowerCase().endsWith('.gif'))
                    const fp=p.price*(1-(p.discount||0)/100)
                    return(
                      <div key={p.serial_number} style={{display:'flex',alignItems:'center',gap:8,padding:'7px 14px',borderBottom:'1px solid #fff0e8'}}>
                        {imgUrl&&<img src={imgUrl} alt="" style={{width:42,height:42,borderRadius:7,objectFit:'cover',background:'#f8f8f8',border:'1px solid #ffe0cc',flexShrink:0}} onError={e=>e.target.style.display='none'}/>}
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{...MS,fontSize:'0.75rem',color:'#333',fontWeight:'bold',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.productname}</div>
                          <div style={{...MS,fontSize:'0.67rem',color:'#888'}}>₹{fmt(fp)} × {qty}</div>
                        </div>
                        <span style={{...M,color:'#ff5500',fontSize:'0.78rem',flexShrink:0}}>₹{fmt(fp*qty)}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
            <div style={{padding:'14px 18px'}}>
              {[{f:'customer_name',l:'FULL NAME *',t:'text'},{f:'address',l:'DELIVERY ADDRESS *',t:'text'},{f:'mobile_number',l:'MOBILE NUMBER *',t:'tel'},{f:'email',l:'EMAIL (optional)',t:'email'}].map(({f,l,t})=>(
                <div key={f} style={{marginBottom:9}}><label style={{...M,fontSize:'0.6rem',color:'#888',letterSpacing:'0.1em',display:'block',marginBottom:4}}>{l}</label><input type={t} placeholder={l.replace(' *','')} value={customerDetails[f]} onChange={e=>setCustomerDetails(p=>({...p,[f]:f==='mobile_number'?e.target.value.replace(/\D/g,'').slice(-10):e.target.value}))} style={INP}/></div>
              ))}
              <div style={{marginBottom:9}}><label style={{...M,fontSize:'0.6rem',color:'#888',letterSpacing:'0.1em',display:'block',marginBottom:4}}>STATE *</label><select value={customerDetails.state} onChange={e=>setCustomerDetails(p=>({...p,state:e.target.value,district:''}))} style={INP}><option value=''>Select State</option>{states.map(s=><option key={s.name} value={s.name}>{s.name}{s.min_rate?` (Min ₹${s.min_rate})`:''}</option>)}</select></div>
              {customerDetails.state&&<div style={{marginBottom:9}}><label style={{...M,fontSize:'0.6rem',color:'#888',letterSpacing:'0.1em',display:'block',marginBottom:4}}>CITY / DISTRICT *</label><select value={customerDetails.district} onChange={e=>setCustomerDetails(p=>({...p,district:e.target.value}))} style={INP}><option value=''>Select District</option>{districts.map(d=><option key={d.id} value={d.name}>{d.name}</option>)}</select></div>}
              <PromoSelector/>
              {states.length>0&&customerDetails.state&&(()=>{const st=states.find(s=>s.name===customerDetails.state);return st?.min_rate?<div style={{...MS,fontSize:'0.65rem',color:'#aa7700',background:'#fff8e0',border:'1px solid #ffd4aa',borderRadius:8,padding:'5px 10px',marginBottom:9}}>⚠ Minimum order for {st.name}: ₹{st.min_rate}</div>:null})()}
              <div style={{background:'#fff8f0',border:'1px solid #ffd4b8',borderRadius:12,padding:'11px 14px',marginBottom:12}}><SummaryRows/></div>
              {errMsg&&<div style={{...MS,fontSize:'0.75rem',color:'#cc0000',background:'#fff0f0',border:'1px solid #ffcccc',borderRadius:8,padding:'7px 12px',marginBottom:10}}>{errMsg}</div>}
              <div style={{...MS,fontSize:'0.65rem',color:'#cc4400',background:'#fff8f0',border:'1px solid #ffd4cc',borderRadius:8,padding:'6px 10px',marginBottom:12,lineHeight:1.5}}>⚠ Product images for reference only. Delivery charges payable to transport.</div>
              <div style={{display:'flex',gap:10}}>
                <button onClick={()=>setShowCheckout(false)} style={{...MS,flex:'0 0 80px',background:'#f5f5f5',color:'#666',border:'none',padding:'12px',borderRadius:14,cursor:'pointer',fontSize:'0.82rem'}}>Cancel</button>
                <button onClick={handleBook} disabled={bookingLoading} style={{...M,flex:1,background:'linear-gradient(135deg,#ff5500,#ff8800)',color:'#fff',border:'none',padding:'12px',borderRadius:14,cursor:'pointer',fontSize:'0.82rem',letterSpacing:'0.08em',boxShadow:'0 5px 18px rgba(255,85,0,0.32)',opacity:bookingLoading?0.75:1}}>
                  {bookingLoading?'Booking…':'CONFIRM BOOKING →'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}