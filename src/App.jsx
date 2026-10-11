import { useState } from 'react';
import { Link, NavLink, Route, Routes, useParams, useNavigate } from 'react-router-dom';
import './App.css';

const products = [
  { id: 'rose-glow', name: 'Rose Glow Bracelet', category: 'Bracelets', price: 4500, note: 'Soft blush beads with a golden finish.', image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=900&q=85', tag: 'Bestseller' },
  { id: 'golden-hour', name: 'Golden Hour Necklace', category: 'Necklaces', price: 8500, note: 'A delicate everyday piece with warm details.', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=85', tag: 'New' },
  { id: 'pearl-daydream', name: 'Pearl Daydream', category: 'Bracelets', price: 5500, note: 'A classic pearl-inspired look, made to layer.', image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=900&q=85' },
  { id: 'everyday-charm', name: 'Everyday Charm', category: 'Accessories', price: 3500, note: 'A little detail that makes the day feel special.', image: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=900&q=85' },
  { id: 'blush-stack', name: 'Blush Stack Set', category: 'Bracelets', price: 7000, note: 'A ready-to-wear stack in warm, gentle tones.', image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=900&q=85' },
  { id: 'golden-thread', name: 'Golden Thread Anklet', category: 'Accessories', price: 4000, note: 'Lightweight detail for your everyday style.', image: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&w=900&q=85' },
];
const money = (n) => `₦${n.toLocaleString('en-NG')}`;

function Header({ count }) {
  const [open, setOpen] = useState(false);
  return <>
    <div className="announcement">Little details. Lasting memories. <span>✦</span></div>
    <header className="site-header">
       <Link to="/" className="brand-logo">
  <img
    src="/images/eternal-beads-logo.jpg"
    alt="Eternal Beads"
    className="brand-logo-image"
  />
</Link>
      <button className="menu-toggle" onClick={() => setOpen(!open)} aria-label="Toggle navigation">{open ? '✕' : '☰'}</button>
      <nav className={open ? 'nav open' : 'nav'}>
        <NavLink onClick={() => setOpen(false)} to="/">Home</NavLink>
        <NavLink onClick={() => setOpen(false)} to="/shop">Shop</NavLink>
        <NavLink onClick={() => setOpen(false)} to="/story">Our Story</NavLink>
        <NavLink onClick={() => setOpen(false)} to="/contact">Contact</NavLink>
      </nav>
      <Link to="/bag" className="src/assets/photo_5936265417716339051_y.jpg">Bag <span>{count}</span></Link>
    </header>
  </>;
}
function Footer() { return <footer className="footer"><div className="footer-main"><div><Link to="/" className="footer-name">Eternal Beads<span>✦</span></Link><p>Little details. Lasting memories.</p></div><div><h4>Explore</h4><Link to="/shop">Shop all</Link><Link to="/story">Our story</Link><Link to="/contact">Contact us</Link></div><div><h4>Need a hand?</h4><p>Questions about an order or a custom piece?</p><Link to="/contact">We’d love to help →</Link></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Eternal Beads</span><span>Made with care, worn with love.</span></div></footer>; }
function ProductCard({ product, onAdd }) { return <article className="product-card"><Link to={`/product/${product.id}`} className="product-image"><img src={product.image} alt={product.name} loading="lazy"/>{product.tag && <span className="product-tag">{product.tag}</span>}</Link><div className="product-info"><div><p className="product-category">{product.category}</p><Link to={`/product/${product.id}`} className="product-name">{product.name}</Link><p className="product-price">{money(product.price)}</p></div><button className="quick-add" onClick={() => onAdd(product)} aria-label={`Add ${product.name} to bag`}>+</button></div></article>; }
function Home({ onAdd }) { return <><main>
  <section className="hero"><div className="hero-copy"><p className="eyebrow">JEWELLERY WITH A LITTLE MEANING</p><h1>Made to be<br/><em>kept close.</em></h1><p className="hero-text">Thoughtful bead jewellery for everyday moments, meaningful gifts, and the memories you carry with you.</p><div className="hero-actions"><Link className="button button-dark" to="/shop">Shop the collection <span>↗</span></Link><Link className="text-link" to="/story">A little about us</Link></div><div className="hero-note"><span className="tiny-star">✦</span><span>Small details. Personal meaning.<br/>Pieces to make your own.</span></div></div><div className="hero-visual"><img src="https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=1200&q=90" alt="Delicate jewellery styled in warm natural light"/><div className="image-caption"><span>THE EVERYDAY EDIT</span><span>01 / 03</span></div></div></section>
  <section className="benefits"><div><span>✦</span><p>Made with care</p></div><div><span>◇</span><p>Easy to style</p></div><div><span>♡</span><p>Lovely to gift</p></div></section>
  <section className="section featured"><div className="section-heading"><div><p className="eyebrow">A FEW FAVOURITES</p><h2>Little things, <em>big feeling.</em></h2></div><Link className="text-link" to="/shop">Shop all pieces ↗</Link></div><div className="product-grid">{products.slice(0, 4).map(p => <ProductCard key={p.id} product={p} onAdd={onAdd}/>)}</div></section>
  <section className="story-band"><div className="story-image"><img src="https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1000&q=85" alt="Jewellery details" loading="lazy"/></div><div className="story-copy"><p className="eyebrow">THE HEART OF ETERNAL BEADS</p><h2>Not just an accessory.<br/><em>A little piece of you.</em></h2><p>We believe the things we wear can hold memories, mark moments, and say something about who we are. Eternal Beads is about finding beauty in the little things.</p><Link to="/story" className="button button-outline">Get to know us <span>↗</span></Link></div></section>
  <section className="custom-cta"><p className="eyebrow">HAVE SOMETHING IN MIND?</p><h2>Your idea, your colours, <em>your piece.</em></h2><p>Looking for a thoughtful gift or a custom combination? Tell us what you’re imagining.</p><Link to="/contact" className="button button-dark">Let’s make it personal ↗</Link></section>
  </main></>; }
function Shop({ onAdd }) { const [category, setCategory] = useState('All pieces'); const [sort, setSort] = useState('featured'); const categories = ['All pieces', 'Bracelets', 'Necklaces', 'Accessories']; let shown = category === 'All pieces' ? [...products] : products.filter(p => p.category === category); if (sort === 'low') shown.sort((a,b) => a.price-b.price); if (sort === 'high') shown.sort((a,b) => b.price-a.price); return <main className="page-wrap"><div className="page-intro"><p className="eyebrow">FIND YOUR EVERYDAY FAVOURITE</p><h1>The collection<span>.</span></h1><p>Little pieces to wear on repeat, give with love, and make your own.</p></div><div className="shop-toolbar"><div className="filter-list">{categories.map(c => <button key={c} className={category===c?'filter active':'filter'} onClick={() => setCategory(c)}>{c}</button>)}</div><label className="sort-label">Sort <select value={sort} onChange={e=>setSort(e.target.value)}><option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></label></div><div className="product-grid shop-grid">{shown.map(p=><ProductCard key={p.id} product={p} onAdd={onAdd}/>)}</div><p className="results-note">Showing {shown.length} {shown.length===1?'piece':'pieces'}</p></main>; }
function ProductPage({ onAdd }) { const { id } = useParams(); const product = products.find(p=>p.id===id); const navigate = useNavigate(); const [qty,setQty] = useState(1); if (!product) return <main className="page-wrap empty-state"><h1>We couldn’t find that piece.</h1><Link className="button button-dark" to="/shop">Back to the shop</Link></main>; return <main className="page-wrap product-detail"><div className="breadcrumbs"><Link to="/">Home</Link> / <Link to="/shop">Shop</Link> / {product.name}</div><div className="detail-layout"><div className="detail-image"><img src={product.image} alt={product.name}/></div><div className="detail-copy"><p className="eyebrow">{product.category.toUpperCase()}</p><h1>{product.name}</h1><p className="detail-price">{money(product.price)}</p><div className="thin-rule"/><p>{product.note} Designed to bring a thoughtful finishing touch to your everyday style, or make a lovely gift for someone special.</p><div className="quantity-row"><span>Quantity</span><div className="quantity-control"><button onClick={()=>setQty(Math.max(1,qty-1))}>−</button><span>{qty}</span><button onClick={()=>setQty(qty+1)}>+</button></div></div><button className="button button-dark add-wide" onClick={()=>{for(let i=0;i<qty;i++) onAdd(product); navigate('/bag');}}>Add to bag — {money(product.price*qty)}</button><p className="detail-small">Need a different colour or a custom order? <Link to="/contact">Talk to us.</Link></p><div className="detail-promise"><p>✦ Thoughtfully selected details</p><p>♡ Lovely for gifting or keeping</p><p>◇ Questions? We’re happy to help</p></div></div></div></main>; }
function Bag({ cart, setCart }) { const total = cart.reduce((sum,item)=>sum+item.price*item.qty,0); const remove = id=>setCart(cart.filter(i=>i.id!==id)); const changeQty=(id,qty)=>setCart(cart.map(i=>i.id===id?{...i,qty}:i).filter(i=>i.qty>0)); const orderText = encodeURIComponent(`Hello Eternal Beads! I'd like to enquire about this order:\n${cart.map(i=>`${i.name} x ${i.qty} — ${money(i.price*i.qty)}`).join('\n')}\nSubtotal: ${money(total)}\nPlease confirm availability and delivery details.`); const whatsapp = `https://wa.me/2340000000000?text=${orderText}`; return <main className="page-wrap bag-page"><div className="page-intro compact-intro"><p className="eyebrow">YOUR LITTLE FINDS</p><h1>Your bag<span>.</span></h1></div>{cart.length===0?<div className="empty-state"><div className="empty-icon">♡</div><h2>Your bag is taking a little breather.</h2><p>There’s nothing here just yet. Find a piece that feels like you.</p><Link className="button button-dark" to="/shop">Explore the collection</Link></div>:<div className="bag-layout"><div className="bag-items">{cart.map(item=><div className="bag-item" key={item.id}><Link to={`/product/${item.id}`} className="bag-thumb"><img src={item.image} alt={item.name}/></Link><div className="bag-item-copy"><Link to={`/product/${item.id}`} className="product-name">{item.name}</Link><p>{money(item.price)}</p><div className="quantity-control"><button onClick={()=>changeQty(item.id,item.qty-1)}>−</button><span>{item.qty}</span><button onClick={()=>changeQty(item.id,item.qty+1)}>+</button></div></div><div className="bag-item-end"><strong>{money(item.price*item.qty)}</strong><button className="remove-link" onClick={()=>remove(item.id)}>Remove</button></div></div>)}</div><aside className="order-summary"><h2>Order summary</h2><div><span>Subtotal</span><strong>{money(total)}</strong></div><p>Delivery is confirmed with you before payment.</p><a className="button button-dark checkout-button" href={whatsapp} target="_blank" rel="noreferrer" onClick={e=>{if(whatsapp.includes('0000000000')){e.preventDefault(); alert('Please replace the placeholder WhatsApp number in src/App.jsx with your business number first.');}}}>Enquire on WhatsApp ↗</a><p className="summary-note">No payment is taken on this demo website.</p></aside></div>}</main>; }
function Story() { return <main className="page-wrap story-page"><div className="page-intro"><p className="eyebrow">A LITTLE ABOUT US</p><h1>Made for the moments<br/><em>that stay with you.</em></h1><p>Jewellery can be more than something you wear. It can be a memory, a reminder, or a gift with a little meaning.</p></div><div className="story-feature"><img src="https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1200&q=85" alt="A close-up of jewellery"/><div><p className="eyebrow">OUR POINT OF VIEW</p><h2>Beauty lives in the details.</h2><p>Eternal Beads was imagined for people who love the small things: a colour that feels just right, a thoughtful gift, a piece that becomes part of your everyday routine.</p><p>We’re building a collection that feels personal, easy to wear, and special enough to keep close. Every piece is an invitation to express your own style.</p><Link to="/shop" className="button button-dark">Explore the collection ↗</Link></div></div><div className="values-row"><div><span>01</span><h3>Personal</h3><p>Your style should feel like you.</p></div><div><span>02</span><h3>Thoughtful</h3><p>Little details can mean a lot.</p></div><div><span>03</span><h3>Everyday</h3><p>Pieces for real life and real moments.</p></div></div></main>; }

function Contact() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const update = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = (e) => {
    e.preventDefault();

    const businessEmail = "eternalbeads95@gmail.com";
    const subject = `Eternal Beads enquiry from ${form.name}`;

    const body = [
      `Customer name: ${form.name}`,
      `Customer email: ${form.email}`,
      "",
      "Message:",
      form.message,
    ].join("\n");

    const mailto =
      `mailto:${businessEmail}` +
      `?subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(body)}`;

    window.location.href = mailto;
    setSent(true);
  };

  return (
    <main className="page-wrap contact-page">
      <div className="contact-layout">
        <div className="contact-copy">
          <p className="eyebrow">WE’RE HERE FOR YOU</p>

          <h1>
            Let’s have a
            <br />
            <em>little chat.</em>
          </h1>

          <p>
            Have a question about a piece, want to ask about a
            custom order, or choosing a gift? Send us a note.
          </p>

          <div className="contact-note">
            <span>✦</span>
            <div>
              <strong>Custom orders welcome</strong>
              <p>Tell us your colour ideas and what you have in mind.</p>
            </div>
          </div>

          <div className="contact-note">
            <span>♡</span>
            <div>
              <strong>Need help choosing?</strong>
              <p>We’ll help you find something thoughtful.</p>
            </div>
          </div>

          <div className="contact-note">
            <span>✉</span>
            <div>
              <strong>Email us directly</strong>
              <p>
                <a href="mailto:eternalbeads95@gmail.com">
                  eternalbeads95@gmail.com
                </a>
              </p>
            </div>
          </div>
        </div>

        <form className="contact-form" onSubmit={submit}>
          <h2>Send us a message</h2>

          {sent ? (
            <div className="form-success">
              <span>✓</span>
              <h3>Your email app should open.</h3>
              <p>
                Your message has been prepared for
                eternalbeads95@gmail.com. Check your email app
                and press Send to deliver it.
              </p>
              <button
                type="button"
                className="text-link"
                onClick={() => setSent(false)}
              >
                Write another message
              </button>
            </div>
          ) : (
            <>
              <label>
                Your name
                <input
                  required
                  name="name"
                  value={form.name}
                  onChange={update}
                  placeholder="What should we call you?"
                />
              </label>

              <label>
                Email address
                <input
                  required
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={update}
                  placeholder="you@example.com"
                />
              </label>

              <label>
                What’s on your mind?
                <textarea
                  required
                  rows="5"
                  name="message"
                  value={form.message}
                  onChange={update}
                  placeholder="Tell us a little about it…"
                />
              </label>

              <button className="button button-dark" type="submit">
                Send message ↗
              </button>

              <p className="form-footnote">
                Your email app will open with your message prepared.
                You must press Send to deliver it.
              </p>
            </>
          )}
        </form>
      </div>
    </main>
  );
}

export default function App() { const [cart,setCart] = useState([]); const onAdd = product => setCart(current=>{const existing=current.find(i=>i.id===product.id);return existing?current.map(i=>i.id===product.id?{...i,qty:i.qty+1}:i):[...current,{...product,qty:1}];}); const count=cart.reduce((s,i)=>s+i.qty,0); return <><Header count={count}/><Routes><Route path="/" element={<Home onAdd={onAdd}/>}/><Route path="/shop" element={<Shop onAdd={onAdd}/>}/><Route path="/product/:id" element={<ProductPage onAdd={onAdd}/>}/><Route path="/bag" element={<Bag cart={cart} setCart={setCart}/>}/><Route path="/story" element={<Story/>}/><Route path="/contact" element={<Contact/>}/><Route path="*" element={<main className="empty-state page-wrap"><h1>Page not found</h1><Link className="button button-dark" to="/">Back home</Link></main>}/></Routes><Footer/></>; }
