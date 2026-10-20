import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import session from 'express-session';
import connectSqlite3 from 'connect-sqlite3';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root=path.dirname(fileURLToPath(import.meta.url));
const dir=path.resolve(process.env.DATA_DIR || path.join(root,'data'));
fs.mkdirSync(dir,{recursive:true});
const production=process.env.NODE_ENV==='production';
if(production && (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length<32 || !process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD.length<12 || !process.env.ADMIN_EMAIL)){
  throw Error('Set SESSION_SECRET (32+ chars), ADMIN_EMAIL and ADMIN_PASSWORD (12+ chars) in production.');
}
const secret=process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
const adminEmail=(process.env.ADMIN_EMAIL || 'admin@localhost').toLowerCase().trim();
const adminHash= bcrypt.hashSync(process.env.ADMIN_PASSWORD || crypto.randomBytes(20).toString('hex'),12);
const db=new Database(path.join(dir,'codexa.sqlite'));
db.pragma('journal_mode = WAL');
db.exec(`CREATE TABLE IF NOT EXISTS content (key TEXT PRIMARY KEY, value TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS inquiries (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, phone TEXT NOT NULL, email TEXT, service TEXT NOT NULL, description TEXT NOT NULL, budget TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')));
CREATE INDEX IF NOT EXISTS inquiries_time ON inquiries(created_at);`);
const initial={
  ar:{headline:'نحوّل أفكارك إلى واقع رقمي.',description:'في Codexa AI، نبتكر مواقع إلكترونية وأنظمة برمجية وحلولًا ذكية تساعدك على تطوير أعمالك والانطلاق بثقة في العالم الرقمي.',about:'نصمّم تجارب رقمية تجمع بين الابتكار والدقة وسهولة الاستخدام. نعمل معك من أول فكرة حتى إطلاق منتج يلائم احتياجات مشروعك.',experience:'5 سنوات من الخبرة (يرجى التحقق قبل النشر)'},
  en:{headline:'We turn your ideas into digital reality.',description:'At Codexa AI, we create websites, software systems, and intelligent solutions that help your business grow confidently.',about:'We craft digital experiences balancing innovation, quality, and usability, from your first idea to launch.',experience:'5 years of experience (verify before publishing)'},
  services:[{"id": "web", "icon": "globe", "ar": "تصميم وتطوير المواقع الإلكترونية", "en": "Website Design & Development", "arDesc": "مواقع احترافية سريعة ومتجاوبة.", "enDesc": "Responsive business websites."}, {"id": "stores", "icon": "bag", "ar": "تطوير المتاجر الإلكترونية", "en": "E-commerce Development", "arDesc": "متاجر رقمية لإدارة المنتجات والطلبات.", "enDesc": "Online stores and orders."}, {"id": "apps", "icon": "code", "ar": "تطوير التطبيقات", "en": "Mobile App Development", "arDesc": "تطوير تطبيقات حسب متطلبات العمل.", "enDesc": "Custom mobile applications."}, {"id": "systems", "icon": "code", "ar": "تطوير الأنظمة البرمجية المخصصة", "en": "Custom Software Systems", "arDesc": "برمجة العمليات والأنظمة الداخلية.", "enDesc": "Software tailored to operations."}, {"id": "ai", "icon": "spark", "ar": "حلول الذكاء الاصطناعي", "en": "AI Solutions", "arDesc": "مساعدات ذكية وأتمتة العمل.", "enDesc": "AI automation and assistants."}, {"id": "dashboards", "icon": "chart", "ar": "تطوير لوحات التحكم", "en": "Dashboard Development", "arDesc": "لوحات إدارة وتحليلات البيانات.", "enDesc": "Analytics and management dashboards."}, {"id": "marketing", "icon": "spark", "ar": "خدمات التسويق الإلكتروني", "en": "Digital Marketing", "arDesc": "خطط تسويق وتحسين التواجد الرقمي.", "enDesc": "Digital marketing services."}, {"id": "hosting", "icon": "globe", "ar": "استضافة المواقع الإلكترونية", "en": "Website Hosting", "arDesc": "خيارات استضافة بحسب متطلبات المشروع.", "enDesc": "Hosting based on project needs."}, {"id": "seo", "icon": "chart", "ar": "تهيئة المواقع لمحركات البحث (SEO)", "en": "Search Engine Optimization", "arDesc": "تحسين بنية الموقع للظهور في البحث.", "enDesc": "Search performance optimization."}, {"id": "crm", "icon": "code", "ar": "أنظمة إدارة العملاء (CRM)", "en": "CRM Systems", "arDesc": "متابعة علاقات العملاء والطلبات.", "enDesc": "Customer relationship management."}, {"id": "odoo", "icon": "code", "ar": "أنظمة Odoo ERP", "en": "Odoo ERP Systems", "arDesc": "حلول لإدارة موارد وعمليات المؤسسة.", "enDesc": "ERP process management."}],
  offer:{price:'1999',discount:'50%',active:true,arNote:'الدفع بعد الاستلام وفق الشروط المتفق عليها.',enNote:'Pay after delivery according to agreed terms.',arDisclaimer:'السعر والخصم للباقات المشمولة بالعرض فقط. تُحدد التفاصيل قبل التعاقد.',enDisclaimer:'Starting price and discount apply to eligible packages only. Confirm all terms before agreement.'},
  projects:[]
};
for(const [k,v] of Object.entries(initial)) db.prepare('INSERT OR IGNORE INTO content (key,value) VALUES (?,?)').run(k,JSON.stringify(v));
const getAll=()=>Object.fromEntries(db.prepare('SELECT key,value FROM content').all().map(x=>[x.key,JSON.parse(x.value)]));
const app=express();
if(process.env.TRUST_PROXY==='1')app.set('trust proxy',1);
app.disable('x-powered-by');
app.use(helmet({contentSecurityPolicy:{directives:{defaultSrc:["'self'"],scriptSrc:["'self'"],styleSrc:["'self'",'https://fonts.googleapis.com'],fontSrc:["'self'",'https://fonts.gstatic.com'],imgSrc:["'self'",'data:','https:'],connectSrc:["'self'"],objectSrc:["'none'"],frameAncestors:["'none'"]}}}));
app.use(compression());
app.use(express.json({limit:'35kb'}));
const SQLiteStore=connectSqlite3(session);
app.use(session({store:new SQLiteStore({db:'sessions.sqlite',dir}),secret,resave:false,saveUninitialized:false,name:'codexa.sid',cookie:{httpOnly:true,sameSite:'lax',secure:production,maxAge:1000*60*60*6}}));
app.use((req,res,next)=>{if(/^\/(?:server\.js|package(?:-lock)?\.json|README\.md|\.env(?:\.example)?|\.gitignore|codexa\.sqlite|sessions\.sqlite)$/i.test(req.path))return res.sendStatus(404);next()});
app.use(express.static(root,{index:false,maxAge:'1h',dotfiles:'deny',extensions:false,setHeaders(res,file){if(/\.(?:js|json|md)$/i.test(file)&&!file.endsWith('app.js')&&!file.endsWith('admin.js'))res.setHeader('Cache-Control','no-store')}}));
const limiter=(max)=>rateLimit({windowMs:15*60*1000,limit:max,standardHeaders:'draft-7',legacyHeaders:false,message:{error:'طلبات كثيرة جدًا؛ حاول مرة أخرى بعد قليل.'}});
const safeText=(v,max=500)=>typeof v==='string'?v.trim().slice(0,max):'';
const validEmail=v=>!v||/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const validPhone=v=>/^[\d\s()+-]{8,22}$/.test(v);
const sameOrigin=(req,res,next)=>{const origin=req.get('origin');const allowed=process.env.BASE_URL; if(origin && allowed && origin!==allowed && !origin.startsWith('http://localhost:'))return res.status(403).json({error:'مصدر غير مسموح'});next();};
const requireAdmin=(req,res,next)=>req.session.admin===true?next():res.status(401).json({error:'غير مصرح'});
app.get('/api/content',(req,res)=>{res.set('Cache-Control','no-store');res.json(getAll());});
app.post('/api/inquiries',limiter(5),sameOrigin,(req,res)=>{
  if(req.body.website)return res.status(400).json({error:'تعذر استقبال الطلب'});
  const name=safeText(req.body.name,100),phone=safeText(req.body.phone,30),email=safeText(req.body.email,140),service=safeText(req.body.service,100),description=safeText(req.body.description,1500),budget=safeText(req.body.budget,60);
  if(name.length<2||!validPhone(phone)||!validEmail(email)||!service||description.length<10) return res.status(400).json({error:'تحقق من الاسم والهاتف والخدمة ووصف المشروع (10 أحرف على الأقل).'});
  const result=db.prepare('INSERT INTO inquiries (name,phone,email,service,description,budget) VALUES (?,?,?,?,?,?)').run(name,phone,email,service,description,budget);
  res.status(201).json({ok:true,id:result.lastInsertRowid});
});
app.post('/api/admin/login',limiter(8),sameOrigin,async(req,res)=>{
  const email=safeText(req.body.email,200).toLowerCase();const password=typeof req.body.password==='string'?req.body.password:'';
  const ok=email===adminEmail && await bcrypt.compare(password,adminHash);
  if(!ok)return res.status(401).json({error:'البريد أو كلمة المرور غير صحيحة'});
  req.session.regenerate(err=>{if(err)return res.status(500).json({error:'تعذر الدخول'});req.session.admin=true;req.session.save(e=>e?res.status(500).json({error:'تعذر حفظ الجلسة'}):res.json({ok:true}));});
});
app.get('/api/admin/me',(req,res)=>res.json({authenticated:req.session.admin===true}));
app.post('/api/admin/logout',sameOrigin,(req,res)=>req.session.destroy(()=>{res.clearCookie('codexa.sid');res.json({ok:true});}));
app.get('/api/admin/inquiries',requireAdmin,(req,res)=>res.json(db.prepare('SELECT * FROM inquiries ORDER BY id DESC LIMIT 500').all()));
app.delete('/api/admin/inquiries/:id',requireAdmin,sameOrigin,(req,res)=>{db.prepare('DELETE FROM inquiries WHERE id=?').run(Number(req.params.id)||0);res.json({ok:true});});
app.put('/api/admin/content/:key',requireAdmin,sameOrigin,(req,res)=>{
 const key=req.params.key; if(!['ar','en','services','offer','projects'].includes(key))return res.status(400).json({error:'مفتاح غير صالح'});
 const value=req.body.value;const s=JSON.stringify(value);
 if(!s||s.length>60000||!((key==='services'||key==='projects')?Array.isArray(value):value&&typeof value==='object'&&!Array.isArray(value)))return res.status(400).json({error:'البيانات غير صالحة أو كبيرة جدًا'});
 if(['services','projects'].includes(key)&&value.length>60)return res.status(400).json({error:'عدد العناصر كبير جدًا'});
 db.prepare('UPDATE content SET value=? WHERE key=?').run(s,key);res.json({ok:true});
});
app.get('/robots.txt',(req,res)=>res.type('text/plain').send('User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: '+(process.env.BASE_URL||'https://codexaai.online')+'/sitemap.xml'));
app.get('/sitemap.xml',(req,res)=>res.type('application/xml').send(`<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${process.env.BASE_URL||'https://codexaai.online'}</loc></url></urlset>`));
app.get('/admin',(req,res)=>res.sendFile(path.join(root,'admin.html')));
app.get('*',(req,res)=>res.sendFile(path.join(root,'index.html')));
app.listen(Number(process.env.PORT)||3000,()=>console.log('Codexa AI running on port',process.env.PORT||3000));
